import { useEffect, useState } from 'react'
import { ref, onValue, set, update, push, get, increment } from 'firebase/database'
import { db } from '../firebase'
import { aggregateVotes } from '../lib/logic'
import { TOTAL_VOTERS } from '../data/roles'

export function useRoles() {
  const [roles, setRoles] = useState(null)
  const [totalVoters, setTotalVotersState] = useState(TOTAL_VOTERS)

  useEffect(() => {
    const unsub = onValue(ref(db, 'rollenwahl'), (snap) => {
      if (!snap.exists()) { setRoles([]); return }
      const data = snap.val()
      const parsed = Object.entries(data)
        .map(([id, r]) => ({
          id,
          title: r.title || id,
          seats: r.seats || 1,
          candidates: r.candidates ? Object.values(r.candidates) : [],
          status: r.status || 'setup',
          voteCount: r.voteCount || 0,
          round: r.round || 0,
          order: r.order ?? 0,
        }))
        .sort((a, b) => a.order - b.order)
      setRoles(parsed)
    })
    return unsub
  }, [])

  useEffect(() => {
    const unsub = onValue(ref(db, 'config/totalVoters'), (snap) => {
      if (snap.exists()) setTotalVotersState(snap.val())
    })
    return unsub
  }, [])

  async function setTotalVoters(n) {
    await set(ref(db, 'config/totalVoters'), Number(n))
  }

  async function createRole({ title, seats, order }) {
    const id = `role_${Date.now()}`
    await set(ref(db, `rollenwahl/${id}`), {
      title, seats: Number(seats), status: 'setup', voteCount: 0, round: 0,
      order: order ?? Date.now(),
    })
  }

  async function updateRole(roleId, { title, seats }) {
    await update(ref(db, `rollenwahl/${roleId}`), { title, seats: Number(seats) })
  }

  async function deleteRole(roleId) {
    await set(ref(db, `rollenwahl/${roleId}`), null)
  }

  async function setStatus(roleId, status) {
    await update(ref(db, `rollenwahl/${roleId}`), { status })
  }

  async function addCandidate(roleId, candidate) {
    await push(ref(db, `rollenwahl/${roleId}/candidates`), candidate)
  }

  async function removeCandidate(roleId, candidateName) {
    const snap = await get(ref(db, `rollenwahl/${roleId}/candidates`))
    if (!snap.exists()) return
    const entries = snap.val()
    const key = Object.keys(entries).find((k) => entries[k].name === candidateName)
    if (key) await set(ref(db, `rollenwahl/${roleId}/candidates/${key}`), null)
  }

  async function submitVote(roleId, ballot) {
    // ballot = { name: 0-4 } — fehlende Kandidat:innen = "Keine Abfrage" (nicht gespeichert)
    await push(ref(db, `rollenwahl/${roleId}/votes`), ballot)
    await update(ref(db, `rollenwahl/${roleId}`), { voteCount: increment(1) })
  }

  async function resetRole(roleId) {
    await update(ref(db, `rollenwahl/${roleId}`), {
      status: 'setup', voteCount: 0, votes: null, round: increment(1),
    })
  }

  async function getResults(roleId) {
    const snap = await get(ref(db, `rollenwahl/${roleId}/votes`))
    if (!snap.exists()) return {}
    return aggregateVotes(Object.values(snap.val()))
  }

  return {
    roles, totalVoters,
    setTotalVoters, createRole, updateRole, deleteRole,
    setStatus, addCandidate, removeCandidate, submitVote, resetRole, getResults,
  }
}
