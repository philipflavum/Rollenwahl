import { useEffect, useState } from 'react'
import { ref, onValue, set, update, push, get } from 'firebase/database'
import { db } from '../firebase'
import { INITIAL_ROLES } from '../data/roles'

export function useRoles() {
  const [roles, setRoles] = useState(null)

  useEffect(() => {
    const rolesRef = ref(db, 'rollenwahl')
    const unsub = onValue(rolesRef, (snap) => {
      if (snap.exists()) {
        const data = snap.val()
        const parsed = INITIAL_ROLES.map((r) => {
          const remote = data[r.id] || {}
          return {
            ...r,
            candidates: remote.candidates ? Object.values(remote.candidates) : r.candidates,
            status: remote.status || r.status,
            voteCount: remote.voteCount || 0,
          }
        })
        setRoles(parsed)
      } else {
        setRoles(INITIAL_ROLES)
      }
    })
    return unsub
  }, [])

  async function initRoles() {
    const snap = await get(ref(db, 'rollenwahl'))
    if (!snap.exists()) {
      const obj = {}
      INITIAL_ROLES.forEach((r) => {
        obj[r.id] = {
          status: 'setup',
          voteCount: 0,
          candidates: r.candidates,
        }
      })
      await set(ref(db, 'rollenwahl'), obj)
    }
  }

  async function setStatus(roleId, status) {
    await update(ref(db, `rollenwahl/${roleId}`), { status })
  }

  async function addCandidate(roleId, candidate) {
    const candRef = ref(db, `rollenwahl/${roleId}/candidates`)
    await push(candRef, candidate)
  }

  async function removeCandidate(roleId, candidateName) {
    const snap = await get(ref(db, `rollenwahl/${roleId}/candidates`))
    if (!snap.exists()) return
    const entries = snap.val()
    const key = Object.keys(entries).find((k) => entries[k].name === candidateName)
    if (key) {
      await set(ref(db, `rollenwahl/${roleId}/candidates/${key}`), null)
    }
  }

  async function submitVote(roleId, ballot) {
    const votesRef = ref(db, `rollenwahl/${roleId}/votes`)
    await push(votesRef, ballot)
    const snap = await get(ref(db, `rollenwahl/${roleId}/voteCount`))
    const current = snap.exists() ? snap.val() : 0
    await set(ref(db, `rollenwahl/${roleId}/voteCount`), current + 1)
  }

  async function getResults(roleId) {
    const snap = await get(ref(db, `rollenwahl/${roleId}/votes`))
    if (!snap.exists()) return {}
    const votes = Object.values(snap.val())
    const totals = {}
    votes.forEach((ballot) => {
      Object.entries(ballot).forEach(([name, score]) => {
        totals[name] = (totals[name] || 0) + score
      })
    })
    return totals
  }

  return { roles, initRoles, setStatus, addCandidate, removeCandidate, submitVote, getResults }
}
