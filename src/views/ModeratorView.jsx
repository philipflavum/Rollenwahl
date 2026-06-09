import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useRoles } from '../hooks/useRoles'
import { TOTAL_VOTERS } from '../data/roles'

const STATUS_LABEL = { setup: 'Vorbereitung', open: 'Offen', closed: 'Ausgewertet' }
const STATUS_COLOR = { setup: '#6b7280', open: '#16a34a', closed: '#2563eb' }

export default function ModeratorView() {
  const { roles, initRoles, setStatus, addCandidate, removeCandidate, getResults } = useRoles()
  const [results, setResults] = useState({})
  const [newName, setNewName] = useState({})
  const [newType, setNewType] = useState({})
  const [showQR, setShowQR] = useState(false)

  useEffect(() => { initRoles() }, [])

  const participantUrl = `${window.location.origin}/`

  async function handleClose(roleId) {
    await setStatus(roleId, 'closed')
    const r = await getResults(roleId)
    setResults((prev) => ({ ...prev, [roleId]: r }))
  }

  async function loadResults(roleId) {
    const r = await getResults(roleId)
    setResults((prev) => ({ ...prev, [roleId]: r }))
  }

  useEffect(() => {
    if (!roles) return
    roles.forEach((role) => {
      if (role.status === 'closed') loadResults(role.id)
    })
  }, [roles])

  function getWinners(role, totals) {
    const sorted = Object.entries(totals).sort((a, b) => a[1] - b[1])
    if (sorted.length === 0) return []
    const cutoffIndex = role.seats - 1
    if (cutoffIndex >= sorted.length) return sorted.map(([n]) => n)
    const cutoffScore = sorted[cutoffIndex][1]
    return sorted.filter(([, s]) => s <= cutoffScore).map(([n]) => n)
  }

  if (!roles) return <div className="page" style={{ paddingTop: '3rem', textAlign: 'center', color: 'var(--muted)' }}>Verbinde mit Firebase…</div>

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Moderation</h1>
        <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }} onClick={() => setShowQR(!showQR)}>
          QR-Code
        </button>
      </div>

      {showQR && (
        <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem', gap: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <QRCodeSVG value={participantUrl} size={180} />
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', wordBreak: 'break-all' }}>{participantUrl}</p>
        </div>
      )}

      <div className="gap-lg">
        {roles.map((role) => {
          const totals = results[role.id] || {}
          const winners = role.status === 'closed' ? getWinners(role, totals) : []
          const addKey = role.id

          return (
            <div key={role.id} className="card gap-md">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h2>{role.title}</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>{role.seats} Platz{role.seats > 1 ? 'e' : ''}</span>
                </div>
                <span style={{
                  fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 99,
                  background: STATUS_COLOR[role.status] + '20', color: STATUS_COLOR[role.status]
                }}>
                  {STATUS_LABEL[role.status]}
                </span>
              </div>

              {role.status !== 'closed' && (
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  {role.voteCount} / {TOTAL_VOTERS} haben abgestimmt
                  <div style={{ marginTop: '0.3rem', height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', width: `${(role.voteCount / TOTAL_VOTERS) * 100}%`, transition: 'width 0.4s' }} />
                  </div>
                </div>
              )}

              <div className="gap-sm">
                <h3>Kandidierende</h3>
                {role.candidates.map((c) => (
                  <div key={c.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {c.name}
                      <span className={`tag tag-${c.type}`}>{c.type}</span>
                    </span>
                    {role.status === 'setup' && (
                      <button className="btn-danger" style={{ fontSize: '0.75rem', padding: '2px 8px' }}
                        onClick={() => removeCandidate(role.id, c.name)}>✕</button>
                    )}
                  </div>
                ))}
              </div>

              {role.status === 'setup' && (
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <input
                    placeholder="Name"
                    value={newName[addKey] || ''}
                    onChange={(e) => setNewName((p) => ({ ...p, [addKey]: e.target.value }))}
                    style={{ flex: 1, padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }}
                  />
                  <select
                    value={newType[addKey] || 'spontan'}
                    onChange={(e) => setNewType((p) => ({ ...p, [addKey]: e.target.value }))}
                    style={{ padding: '0.4rem', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'inherit', fontSize: '0.9rem' }}
                  >
                    <option value="spontan">Spontan</option>
                    <option value="selbst">Selbst</option>
                    <option value="fremd">Fremd</option>
                  </select>
                  <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem' }}
                    onClick={() => {
                      const name = (newName[addKey] || '').trim()
                      if (!name) return
                      addCandidate(role.id, { name, type: newType[addKey] || 'spontan' })
                      setNewName((p) => ({ ...p, [addKey]: '' }))
                    }}>+</button>
                </div>
              )}

              {role.status === 'closed' && winners.length > 0 && (
                <div style={{ background: 'var(--green-light)', borderRadius: 8, padding: '0.75rem' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--green)', marginBottom: '0.4rem' }}>
                    Gewählt ({role.seats} Platz{role.seats > 1 ? 'e' : ''})
                  </div>
                  {winners.map((name) => (
                    <div key={name} style={{ fontWeight: 600, fontSize: '1.05rem' }}>✓ {name}</div>
                  ))}
                </div>
              )}

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {role.status === 'setup' && (
                  <button className="btn-primary" style={{ flex: 1 }} onClick={() => setStatus(role.id, 'open')}>
                    Abstimmung öffnen
                  </button>
                )}
                {role.status === 'open' && (
                  <button className="btn-primary" style={{ flex: 1, background: '#dc2626' }} onClick={() => handleClose(role.id)}>
                    Abstimmung schliessen
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
