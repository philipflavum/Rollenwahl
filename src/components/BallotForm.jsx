import { useState } from 'react'

export default function BallotForm({ role, onSubmit, voterName, resistanceLabels }) {
  const [scores, setScores] = useState({})

  const allRated = role.candidates.every((c) => scores[c.name] !== undefined)

  function set(name, value) {
    setScores((prev) => ({ ...prev, [name]: value }))
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
          {voterName} · Bewerte deinen Widerstand für jede kandidierende Person
        </p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.25rem', padding: '0 0.25rem' }}>
        {resistanceLabels.map((l, i) => (
          <div key={i} style={{ width: 44, textAlign: 'center', fontSize: '0.65rem', color: 'var(--muted)', lineHeight: 1.3 }}>
            <div style={{ fontSize: '1rem' }}>{l.icon}</div>
            <div>{i}</div>
          </div>
        ))}
      </div>

      <div className="gap-sm">
        {role.candidates.map((c) => (
          <div key={c.name} className="card" style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ flex: 1 }}>
              <span style={{ fontWeight: 500 }}>{c.name}</span>
              <span className={`tag tag-${c.type}`} style={{ marginLeft: '0.4rem' }}>{c.type}</span>
            </div>
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              {resistanceLabels.map((l, i) => (
                <button key={i}
                  title={`${i} – ${l.label}`}
                  onClick={() => set(c.name, i)}
                  style={{
                    width: 44, height: 44,
                    fontSize: '1.1rem',
                    background: scores[c.name] === i ? (i === 0 ? '#dcfce7' : i <= 1 ? '#fef9c3' : i <= 2 ? '#fed7aa' : '#fee2e2') : 'var(--bg)',
                    border: scores[c.name] === i ? `2px solid ${i === 0 ? '#16a34a' : i <= 1 ? '#ca8a04' : i <= 2 ? '#ea580c' : '#dc2626'}` : '2px solid var(--border)',
                    borderRadius: 8,
                    padding: 0,
                    transition: 'all 0.1s',
                  }}>
                  {l.icon}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button className="btn-primary" disabled={!allRated} onClick={submit}>
        {allRated ? 'Stimme abgeben' : `Noch ${role.candidates.length - Object.keys(scores).length} nicht bewertet`}
      </button>

      <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textAlign: 'center' }}>
        Deine Stimme wird anonym gespeichert — keine Namensverknüpfung.
      </div>
    </div>
  )
}
