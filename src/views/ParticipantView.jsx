import { useState, useEffect } from 'react'
import { ref, onValue } from 'firebase/database'
import { db } from '../firebase'
import { PLENUM, INITIAL_ROLES } from '../data/roles'
import { useRoles } from '../hooks/useRoles'
import BallotForm from '../components/BallotForm'

const RESISTANCE_LABELS = [
  { icon: '●', label: 'Kein Widerstand' },
  { icon: '◑', label: 'Geringer Widerstand' },
  { icon: '◐', label: 'Mittlerer Widerstand' },
  { icon: '◔', label: 'Hoher Widerstand' },
  { icon: '○', label: 'Extremer Widerstand' },
]

export default function ParticipantView() {
  const { roles, submitVote } = useRoles()
  const [name, setName] = useState(() => localStorage.getItem('rw_name') || '')
  const [nameConfirmed, setNameConfirmed] = useState(!!localStorage.getItem('rw_name'))
  const [activeRole, setActiveRole] = useState(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (!roles) return
    const open = roles.find((r) => r.status === 'open')
    if (open) {
      const alreadyVoted = localStorage.getItem(`voted_${open.id}`) === 'yes'
      setActiveRole(open)
      if (alreadyVoted) setDone(true)
      else setDone(false)
    } else {
      setActiveRole(null)
      setDone(false)
    }
  }, [roles])

  function confirmName(n) {
    localStorage.setItem('rw_name', n)
    setName(n)
    setNameConfirmed(true)
  }

  async function handleVote(ballot) {
    if (!activeRole) return
    await submitVote(activeRole.id, ballot)
    localStorage.setItem(`voted_${activeRole.id}`, 'yes')
    setDone(true)
  }

  if (!nameConfirmed) {
    return (
      <div className="page" style={{ paddingTop: '3rem' }}>
        <div className="card gap-md">
          <h1 style={{ textAlign: 'center' }}>Kollegiale Rollenwahl</h1>
          <p style={{ color: 'var(--muted)', textAlign: 'center', fontSize: '0.9rem' }}>Wähle deinen Namen aus der Liste</p>
          <div className="gap-sm" style={{ maxHeight: '60dvh', overflowY: 'auto' }}>
            {PLENUM.map((n) => (
              <button key={n} className="btn-secondary" style={{ textAlign: 'left', padding: '0.75rem 1rem' }}
                onClick={() => confirmName(n)}>
                {n}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!roles) {
    return (
      <div className="page" style={{ paddingTop: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
        Verbinde…
      </div>
    )
  }

  if (!activeRole) {
    return (
      <div className="page" style={{ paddingTop: '3rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>⏳</div>
          <h2>Warte auf Moderation</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Hallo {name} — die Abstimmung ist noch nicht geöffnet.
          </p>
          <button className="btn-secondary" style={{ marginTop: '1.5rem', width: 'auto' }}
            onClick={() => { localStorage.removeItem('rw_name'); setNameConfirmed(false) }}>
            Anderen Namen wählen
          </button>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="page" style={{ paddingTop: '3rem' }}>
        <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>✓</div>
          <h2>Stimme abgegeben</h2>
          <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Danke, {name}! Deine Stimme für <strong>{activeRole.title}</strong> wurde anonym gespeichert.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="page" style={{ paddingTop: '1rem' }}>
      <BallotForm role={activeRole} onSubmit={handleVote} voterName={name} resistanceLabels={RESISTANCE_LABELS} />
    </div>
  )
}
