import { useState, useEffect } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { useRoles } from '../hooks/useRoles'
import { getWinners, rankCandidates, average } from '../lib/logic'

const STATUS_LABEL = { setup: 'Vorbereitung', open: 'Offen', closed: 'Ausgewertet' }
const STATUS_COLOR = { setup: '#6b7280', open: '#16a34a', closed: '#2563eb' }

export default function ModeratorView() {
  const { roles, totalVoters, setStatus, addCandidate, removeCandidate, getResults, resetRole } = useRoles()
  const [results, setResults] = useState({})
  const [newName, setNewName] = useState({})
  const [newType, setNewType] = useState({})
  const [showQR, setShowQR] = useState(false)

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

  if (!roles) return (
    <div className="page" style={{ paddingTop: '3rem', textAlign: 'center', color: 'var(--muted)' }}>
      Verbinde mit Firebase…
    </div>
  )

  if (roles.length === 0) return (
    <div className="page" style={{ paddingTop: '3rem' }}>
      <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem' }}>
        <h2>Keine Rollen konfiguriert</h2>
        <p style={{ color: 'var(--muted)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
          Bitte zuerst Rollen unter <a href="/admin" style={{ color: 'var(--accent)' }}>/admin</a> einrichten.
        </p>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Moderation</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <a href="/admin" style={{ fontSize: '0.8rem', color: 'var(--muted)', padding: '0.4rem 0.6rem', border: '1px solid var(--border)', borderRadius: 8, textDecoration: 'none' }}>Admin</a>
          <button className="btn-secondary" style={{ fontSize: '0.85rem', padding: '0.4rem 0.8rem' }} onClick={() => setShowQR(!showQR)}>
            QR-Code
          </button>
        </div>
      </div>

      {showQR && (
        <div className="card" style={{ textAlign: 'center', marginBottom: '1.5rem', gap: '0.75rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <QRCodeSVG value={participantUrl} size={180} />
          <p style={{ fontSize: '0.8rem', color: 'var(--muted)', wordBreak: 'break-all' }}>{participantUrl}</p>
        </div>
      )}

      <div className="gap-lg">
        {roles.map((role) => {
          const stats = results[role.id] || {}
          const ranked = role.status === 'closed' ? rankCandidates(stats) : []
          const winners = role.status === 'closed' ? getWinners(stats, role.seats) : []
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
                  {role.voteCount} / {totalVoters} haben abgestimmt
                  <div style={{ marginTop: '0.3rem', height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--accent)', width: `${(role.voteCount / totalVoters) * 100}%`, transition: 'width 0.4s' }} />
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

              {role.status === 'closed' && ranked.length > 0 && (() => {
                const maxAvg = 4
                return (
                  <div className="gap-sm">
                    <h3>Ergebnis — alle Kandidierende</h3>
                    {ranked.map((c, i) => {
                      const isWinner = winners.includes(c.name)
                      const pct = Math.round((c.avg / maxAvg) * 100)
                      return (
                        <div key={c.name} style={{
                          borderRadius: 8, padding: '0.6rem 0.75rem',
                          background: isWinner ? 'var(--green-light)' : 'var(--bg)',
                          border: isWinner ? '1.5px solid #16a34a' : '1px solid var(--border)',
                        }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                            <span style={{ fontWeight: isWinner ? 700 : 400 }}>
                              {isWinner ? '✓ ' : ''}{i + 1}. {c.name}
                            </span>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: isWinner ? 'var(--green)' : 'var(--muted)' }}>
                              Ø {average(c.total, c.count)} · {c.count}/{role.voteCount} Stimmen
                            </span>
                          </div>
                          <div style={{ height: 6, background: 'var(--border)', borderRadius: 99, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: isWinner ? '#16a34a' : '#94a3b8', borderRadius: 99 }} />
                          </div>
                        </div>
                      )
                    })}
                    <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                      {role.voteCount} Stimmen · {role.seats} Platz{role.seats > 1 ? 'e' : ''} · weniger Punkte = weniger Widerstand = besser
                    </div>
                  </div>
                )
              })()}

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
                {(role.status === 'closed' || role.status === 'open') && (
                  <button className="btn-danger" style={{ flex: 1 }} onClick={() => {
                    if (window.confirm(`Alle Stimmen für «${role.title}» wirklich löschen und zurücksetzen?`)) {
                      resetRole(role.id)
                      setResults((prev) => { const n = { ...prev }; delete n[role.id]; return n })
                    }
                  }}>
                    ↺ Zurücksetzen
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
