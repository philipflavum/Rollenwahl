import { useState } from 'react'

const SCALE_LABELS = {
  0: 'Kein Widerstand',
  2: 'Gering',
  5: 'Mittel',
  8: 'Hoch',
  10: 'Extrem',
}

function scoreColor(v) {
  if (v === null) return { bg: 'var(--bg)', border: 'var(--border)', text: 'var(--muted)' }
  if (v <= 2) return { bg: '#dcfce7', border: '#16a34a', text: '#15803d' }
  if (v <= 4) return { bg: '#fef9c3', border: '#ca8a04', text: '#a16207' }
  if (v <= 6) return { bg: '#fed7aa', border: '#ea580c', text: '#c2410c' }
  if (v <= 8) return { bg: '#fecaca', border: '#dc2626', text: '#b91c1c' }
  return { bg: '#f3e8ff', border: '#9333ea', text: '#7e22ce' }
}

export default function BallotForm({ role, onSubmit }) {
  const [scores, setScores] = useState({})

  const allRated = role.candidates.every((c) => scores[c.name] !== undefined)
  const remaining = role.candidates.filter((c) => scores[c.name] === undefined).length

  function submit() {
    if (!allRated) return
    onSubmit(scores)
  }

  return (
    <div className="gap-md">
      <div className="card" style={{ padding: '1rem' }}>
        <h2>{role.title}</h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--muted)', marginTop: '0.25rem' }}>
          Widerstand 0 (kein) bis 10 (extrem) — anonym
        </p>
      </div>

      <div className="gap-sm">
        {role.candidates.map((c) => {
          const val = scores[c.name] ?? null
          const col = scoreColor(val)
          return (
            <div key={c.name} className="card" style={{ padding: '1rem', gap: '0.75rem', display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, flex: 1 }}>{c.name}</span>
                <span className={`tag tag-${c.type}`}>{c.type}</span>
                {val !== null && (
                  <span style={{
                    fontWeight: 700, fontSize: '1.1rem', minWidth: 28, textAlign: 'center',
                    color: col.text,
                  }}>{val}</span>
                )}
              </div>

              <div>
                <input
                  type="range"
                  min={0} max={10} step={1}
                  value={val ?? 5}
                  onChange={(e) => setScores((p) => ({ ...p, [c.name]: Number(e.target.value) }))}
                  onMouseDown={() => { if (val === null) setScores((p) => ({ ...p, [c.name]: 5 })) }}
                  onTouchStart={() => { if (val === null) setScores((p) => ({ ...p, [c.name]: 5 })) }}
                  style={{ width: '100%', accentColor: col.border }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '0.15rem' }}>
                  {Object.entries(SCALE_LABELS).map(([k, label]) => (
                    <span key={k}>{label}</span>
                  ))}
                </div>
              </div>

              {val === null && (
                <div style={{ fontSize: '0.78rem', color: 'var(--muted)', fontStyle: 'italic' }}>
                  Schieberegler berühren um zu bewerten
                </div>
              )}
            </div>
          )
        })}
      </div>

      <button className="btn-primary" disabled={!allRated} onClick={submit}>
        {allRated ? 'Stimme abgeben' : `Noch ${remaining} nicht bewertet`}
      </button>

      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
        Deine Stimme wird anonym gespeichert — keine Namensverknüpfung.
      </div>
    </div>
  )
}
