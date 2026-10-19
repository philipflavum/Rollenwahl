import { useState, useEffect } from 'react'
import { useRoles } from '../hooks/useRoles'
import BallotForm from '../components/BallotForm'

export default function ParticipantView() {
  const { roles, submitVote } = useRoles()
  const [activeRole, setActiveRole] = useState(null)
  const [done, setDone] = useState(false)
  const [isProxy, setIsProxy] = useState(false)

  useEffect(() => {
    if (!roles) return
    const open = roles.find((r) => r.status === 'open')
    if (open) {
      const key = `voted_${open.id}_r${open.round ?? 0}`
      const alreadyVoted = localStorage.getItem(key) === 'yes'
      setActiveRole(open)
      setDone(alreadyVoted)
      if (!alreadyVoted) setIsProxy(false)
    } else {
      setActiveRole(null)
      setDone(false)
      setIsProxy(false)
    }
  }, [roles])

  async function handleVote(ballot) {
    if (!activeRole) return
    await submitVote(activeRole.id, ballot)
    if (!isProxy) {
      const key = `voted_${activeRole.id}_r${activeRole.round ?? 0}`
      localStorage.setItem(key, 'yes')
    }
    setDone(true)
    setIsProxy(false)
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
            Die Abstimmung ist noch nicht geöffnet.
          </p>
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
            Deine Stimme für <strong>{activeRole.title}</strong> wurde anonym gespeichert.
          </p>
        </div>
        <button
          className="btn-secondary"
          style={{ marginTop: '1rem', width: '100%' }}
          onClick={() => { setIsProxy(true); setDone(false) }}
        >
          In Stellvertretung für jemanden abstimmen
        </button>
      </div>
    )
  }

  return (
    <div className="page" style={{ paddingTop: '1rem' }}>
      <BallotForm role={activeRole} onSubmit={handleVote} isProxy={isProxy} />
    </div>
  )
}
