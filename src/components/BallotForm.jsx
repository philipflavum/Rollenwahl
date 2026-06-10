import { useState } from 'react'

const LEVELS = [
  { value: 0, label: 'kein',   color: '#16a34a', bg: '#dcfce7' },
  { value: 1, label: 'gering', color: '#65a30d', bg: '#ecfccb' },
  { value: 2, label: 'mittel', color: '#ca8a04', bg: '#fef9c3' },
  { value: 3, label: 'hoch',   color: '#ea580c', bg: '#fed7aa' },
  { value: 4, label: 'extrem', color: '#dc2626', bg: '#fee2e2' },
]

export default function BallotForm({ role, onSubmit }) {
  const [scores, setScores] = useState({})

  const allRated = role.candidates.every((c) => scores[c.name] !== undefined)
  const remaining = role.candidates.filter((c) => scores[c.name] === undefined).length

  return (
    <div className="gap-md">
      <div className="card" style={{ padding: '1rem' }}>
        <h2>{role.title}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
          Wie gross ist dein Widerstand? — anonym
        </p>
      </div>

      {/* Legende */}
      <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'flex-end', paddingRight: '0.25rem' }}>
        {LEVELS.map((l) => (
          <div key={l.value} style={{ flex: 1, textAlign: 'center', fontSize: '0.65rem', color: l.color, fontWeight: 600 }}>
            {l.label}
          </div>
        ))}
      </div>

      <div className="gap-sm">
        {role.candidates.map((c) => {
          const val = scores[c.name]
          return (
            <div key={c.name} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{c.name}</span>
                <span className={`tag tag-${c.type}`} style={{ marginLeft: '0.4rem' }}>{c.type}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.3rem', flexShrink: 0 }}>
                {LEVELS.map((l) => {
                  const selected = val === l.value
                  return (
                    <button
                      key={l.value}
                      onClick={() => setScores((p) => ({ ...p, [c.name]: l.value }))}
                      title={l.label}
                      style={{
                        width: 48, height: 48,
                        borderRadius: 8,
                        border: selected ? `2.5px solid ${l.color}` : '2px solid var(--border)',
                        background: selected ? l.bg : 'var(--bg)',
                        color: selected ? l.color : 'var(--muted)',
                        fontWeight: selected ? 700 : 400,
                        fontSize: '0.65rem',
                        lineHeight: 1.2,
                        padding: '2px',
                        transition: 'all 0.1s',
                      }}
                    >
                      {l.label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <button className="btn-primary" disabled={!allRated} onClick={() => onSubmit(scores)}>
        {allRated ? 'Stimme abgeben' : `Noch ${remaining} nicht bewertet`}
      </button>

      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
        Deine Stimme wird anonym gespeichert — keine Namensverknüpfung.
      </div>
    </div>
  )
}
