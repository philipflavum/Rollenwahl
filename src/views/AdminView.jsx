import { useState, useEffect } from 'react'
import { useRoles } from '../hooks/useRoles'

const PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'rollenwahl'

export default function AdminView() {
  const { roles, totalVoters, setTotalVoters, createRole, updateRole, deleteRole, addCandidate, removeCandidate } = useRoles()
  const [authed, setAuthed] = useState(() => sessionStorage.getItem('admin_auth') === 'yes')
  const [pw, setPw] = useState('')
  const [pwError, setPwError] = useState(false)
  const [newRole, setNewRole] = useState({ title: '', seats: 1 })
  const [newCand, setNewCand] = useState({})
  const [newCandType, setNewCandType] = useState({})
  const [editingVoters, setEditingVoters] = useState(false)
  const [votersInput, setVotersInput] = useState('')
  const [expandedRole, setExpandedRole] = useState(null)

  function handleLogin(e) {
    e.preventDefault()
    if (pw === PASSWORD) {
      sessionStorage.setItem('admin_auth', 'yes')
      setAuthed(true)
    } else {
      setPwError(true)
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('admin_auth')
    setAuthed(false)
  }

  if (!authed) {
    return (
      <div className="page" style={{ paddingTop: '4rem', maxWidth: 360, margin: '0 auto' }}>
        <div className="card" style={{ padding: '2rem' }}>
          <h2 style={{ marginBottom: '1.5rem' }}>Admin — Anmeldung</h2>
          <form onSubmit={handleLogin} className="gap-md">
            <input
              type="password"
              placeholder="Passwort"
              value={pw}
              onChange={(e) => { setPw(e.target.value); setPwError(false) }}
              autoFocus
              style={{ width: '100%', padding: '0.6rem 0.8rem', border: `1px solid ${pwError ? '#dc2626' : 'var(--border)'}`, borderRadius: 8, fontFamily: 'inherit', fontSize: '1rem', boxSizing: 'border-box' }}
            />
            {pwError && <p style={{ color: '#dc2626', fontSize: '0.85rem', margin: 0 }}>Falsches Passwort</p>}
            <button className="btn-primary" type="submit" style={{ width: '100%' }}>Anmelden</button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Admin</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="/moderation" style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none' }}>Moderation</a>
          <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }} onClick={handleLogout}>Abmelden</button>
        </div>
      </div>

      {/* Teilnehmende */}
      <div className="card gap-md" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3>Anzahl Teilnehmende</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>Aktuell: {totalVoters}</span>
          </div>
          {!editingVoters
            ? <button className="btn-secondary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => { setVotersInput(String(totalVoters)); setEditingVoters(true) }}>Ändern</button>
            : (
              <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                <input type="number" min={1} value={votersInput} onChange={(e) => setVotersInput(e.target.value)}
                  style={{ width: 70, padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }} />
                <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.7rem' }} onClick={() => { setTotalVoters(votersInput); setEditingVoters(false) }}>Speichern</button>
              </div>
            )}
        </div>
      </div>

      {/* Neue Rolle */}
      <div className="card gap-md" style={{ marginBottom: '1.5rem' }}>
        <h3>Neue Rolle hinzufügen</h3>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <input
            placeholder="Rollenbezeichnung"
            value={newRole.title}
            onChange={(e) => setNewRole((p) => ({ ...p, title: e.target.value }))}
            style={{ flex: 2, minWidth: 150, padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }}
          />
          <input
            type="number" min={1} max={10}
            placeholder="Plätze"
            value={newRole.seats}
            onChange={(e) => setNewRole((p) => ({ ...p, seats: e.target.value }))}
            style={{ width: 80, padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }}
          />
          <button className="btn-primary" style={{ padding: '0.4rem 1rem' }} onClick={() => {
            if (!newRole.title.trim()) return
            createRole({ title: newRole.title.trim(), seats: Number(newRole.seats) || 1, order: Date.now() })
            setNewRole({ title: '', seats: 1 })
          }}>+ Rolle</button>
        </div>
      </div>

      {/* Rollenliste */}
      <div className="gap-lg">
        {(roles || []).map((role) => (
          <div key={role.id} className="card gap-md">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>{role.title}</h2>
                <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{role.seats} Platz{role.seats > 1 ? 'e' : ''}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem' }}>
                <button
                  className="btn-secondary"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                >
                  {expandedRole === role.id ? 'Einklappen' : 'Bearbeiten'}
                </button>
                <button
                  className="btn-danger"
                  style={{ fontSize: '0.75rem', padding: '3px 8px' }}
                  onClick={() => { if (window.confirm(`Rolle «${role.title}» wirklich löschen?`)) deleteRole(role.id) }}
                >
                  Löschen
                </button>
              </div>
            </div>

            {expandedRole === role.id && (
              <>
                <RoleEdit role={role} onSave={(d) => updateRole(role.id, d)} />

                <div className="gap-sm">
                  <h3>Kandidierende ({role.candidates.length})</h3>
                  {role.candidates.map((c) => (
                    <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>
                        {c.name}
                        <span className={`tag tag-${c.type}`} style={{ marginLeft: '0.4rem' }}>{c.type}</span>
                      </span>
                      <button className="btn-danger" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        onClick={() => removeCandidate(role.id, c.name)}>✕</button>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <input
                      placeholder="Name"
                      value={newCand[role.id] || ''}
                      onChange={(e) => setNewCand((p) => ({ ...p, [role.id]: e.target.value }))}
                      style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }}
                    />
                    <select
                      value={newCandType[role.id] || 'fremd'}
                      onChange={(e) => setNewCandType((p) => ({ ...p, [role.id]: e.target.value }))}
                      style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }}
                    >
                      <option value="fremd">Fremd</option>
                      <option value="selbst">Selbst</option>
                      <option value="spontan">Spontan</option>
                    </select>
                    <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }} onClick={() => {
                      const name = (newCand[role.id] || '').trim()
                      if (!name) return
                      addCandidate(role.id, { name, type: newCandType[role.id] || 'fremd' })
                      setNewCand((p) => ({ ...p, [role.id]: '' }))
                    }}>+</button>
                  </div>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

function RoleEdit({ role, onSave }) {
  const [title, setTitle] = useState(role.title)
  const [seats, setSeats] = useState(role.seats)

  return (
    <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', padding: '0.5rem', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
      <input value={title} onChange={(e) => setTitle(e.target.value)}
        style={{ flex: 2, minWidth: 120, padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit', fontSize: '0.9rem' }} />
      <input type="number" min={1} max={10} value={seats} onChange={(e) => setSeats(e.target.value)}
        style={{ width: 70, padding: '0.3rem 0.5rem', border: '1px solid var(--border)', borderRadius: 6, fontFamily: 'inherit', fontSize: '0.9rem' }} />
      <button className="btn-primary" style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}
        onClick={() => onSave({ title: title.trim(), seats: Number(seats) || 1 })}>
        Speichern
      </button>
    </div>
  )
}
