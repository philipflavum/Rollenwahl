import { useState } from 'react'

const SCALE_LABELS = {
  0: 'Kein',
  2: 'Gering',
  5: 'Mittel',
  8: 'Hoch',
  10: 'Extrem',
}

function scoreColor(v) {
  if (v === null) return { border: 'var(--border)', accent: '#94a3b8' }
  if (v <= 2)  return { border: '#16a34a', accent: '#16a34a' }
  if (v <= 4)  return { border: '#ca8a04', accent: '#ca8a04' }
  if (v <= 6)  return { border: '#ea580c', accent: '#ea580c' }
  if (v <= 8)  return { border: '#dc2626', accent: '#dc2626' }
  return       { border: '#9333ea', accent: '#9333ea' }
}

export default function BallotForm({ role, onSubmit }) {
  const [scores, setScores] = useState({})

  const allRated = role.candidates.every((c) => scores[c.name] !== undefined)
  const remaining = role.candidates.filter((c) => scores[c.name] === undefined).length

  function handleSlider(name, value) {
    setScores((prev) => ({ ...prev, [name]: Number(value) }))
  }

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
            <div key={c.name} className="card" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontWeight: 600, flex: 1 }}>{c.name}</span>
                <span className={`tag tag-${c.type}`}>{c.type}</span>
                {val !== null && (
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', minWidth: 28, textAlign: 'center', color: col.accent }}>
                    {val}
                  </span>
                )}
              </div>
              <input
                type="range"
                min={0} max={10} step={1}
                value={val ?? 5}
                onChange={(e) => handleSlider(c.name, e.target.value)}
                onMouseDown={() => { if (val === null) setScores((p) => ({ ...p, [c.name]: 5 })) }}
                onTouchStart={() => { if (val === null) setScores((p) => ({ ...p, [c.name]: 5 })) }}
                style={{ width: '100%', accentColor: col.accent }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--muted)' }}>
                {Object.entries(SCALE_LABELS).map(([k, label]) => (
                  <span key={k}>{label}</span>
                ))}
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
