import { describe, it, expect } from 'vitest'
import { aggregateVotes, getWinners, rankCandidates, average } from './logic'

// ─────────────────────────────────────────────
// aggregateVotes
// ─────────────────────────────────────────────
describe('aggregateVotes', () => {
  it('summiert Punkte korrekt über mehrere Stimmen', () => {
    const votes = [
      { Anjli: 2, Fiona: 5 },
      { Anjli: 4, Fiona: 1 },
      { Anjli: 0, Fiona: 3 },
    ]
    const result = aggregateVotes(votes)
    expect(result.Anjli).toBe(6)
    expect(result.Fiona).toBe(9)
  })

  it('verarbeitet eine einzelne Stimme', () => {
    const result = aggregateVotes([{ Isabel: 7 }])
    expect(result.Isabel).toBe(7)
  })

  it('gibt leeres Objekt zurück bei leeren Stimmen', () => {
    expect(aggregateVotes([])).toEqual({})
  })

  it('verarbeitet Extremwerte (0 und 10)', () => {
    const votes = [{ Lea: 0 }, { Lea: 10 }, { Lea: 0 }]
    expect(aggregateVotes(votes).Lea).toBe(10)
  })

  it('verarbeitet 22 gleichzeitige Stimmen korrekt', () => {
    const votes = Array.from({ length: 22 }, (_, i) => ({ Nicolas: i % 11 }))
    const result = aggregateVotes(votes)
    const expected = Array.from({ length: 22 }, (_, i) => i % 11).reduce((a, b) => a + b, 0)
    expect(result.Nicolas).toBe(expected)
  })
})

// ─────────────────────────────────────────────
// getWinners — 1 Platz
// ─────────────────────────────────────────────
describe('getWinners (1 Platz)', () => {
  it('wählt Kandidat:in mit den wenigsten Punkten', () => {
    const totals = { Anjli: 10, Fiona: 5, Isabel: 8 }
    expect(getWinners(totals, 1)).toEqual(['Fiona'])
  })

  it('gibt alle Gleichstehenden zurück bei Unentschieden', () => {
    const totals = { Anjli: 5, Fiona: 5, Isabel: 8 }
    const winners = getWinners(totals, 1)
    expect(winners).toContain('Anjli')
    expect(winners).toContain('Fiona')
    expect(winners).not.toContain('Isabel')
  })

  it('gibt leeres Array zurück wenn keine Stimmen', () => {
    expect(getWinners({}, 1)).toEqual([])
  })

  it('gibt alle zurück wenn weniger Kandidierende als Plätze', () => {
    const totals = { Anjli: 3 }
    expect(getWinners(totals, 2)).toEqual(['Anjli'])
  })
})

// ─────────────────────────────────────────────
// getWinners — 2 Plätze (Moderation)
// ─────────────────────────────────────────────
describe('getWinners (2 Plätze — Moderation)', () => {
  it('wählt die 2 mit den wenigsten Punkten', () => {
    const totals = { Fiona: 12, Isabel: 5, Lea: 8, Michel: 20, Nicolas: 3 }
    const winners = getWinners(totals, 2)
    expect(winners).toContain('Nicolas')
    expect(winners).toContain('Isabel')
    expect(winners).not.toContain('Fiona')
    expect(winners).not.toContain('Michel')
  })

  it('inkludiert alle Gleichstehenden an der Grenze', () => {
    // Platz 2 ist ein Dreifach-Unentschieden → alle 3 werden gewählt
    const totals = { A: 3, B: 7, C: 7, D: 7, E: 10 }
    const winners = getWinners(totals, 2)
    expect(winners).toContain('A')
    expect(winners).toContain('B')
    expect(winners).toContain('C')
    expect(winners).toContain('D')
    expect(winners).not.toContain('E')
  })

  it('Gleichstand auf Platz 1 bei 2 Plätzen — alle Gleichstehenden rein', () => {
    const totals = { A: 5, B: 5, C: 5, D: 9 }
    const winners = getWinners(totals, 2)
    expect(winners).toContain('A')
    expect(winners).toContain('B')
    expect(winners).toContain('C')
    expect(winners).not.toContain('D')
  })
})

// ─────────────────────────────────────────────
// rankCandidates
// ─────────────────────────────────────────────
describe('rankCandidates', () => {
  it('sortiert aufsteigend nach Punkten', () => {
    const totals = { B: 10, A: 2, C: 6 }
    const ranked = rankCandidates(totals)
    expect(ranked[0].name).toBe('A')
    expect(ranked[1].name).toBe('C')
    expect(ranked[2].name).toBe('B')
  })

  it('gibt leeres Array zurück bei leeren Totals', () => {
    expect(rankCandidates({})).toEqual([])
  })
})

// ─────────────────────────────────────────────
// average
// ─────────────────────────────────────────────
describe('average', () => {
  it('berechnet Durchschnitt korrekt', () => {
    expect(average(30, 6)).toBe('5.0')
    expect(average(7, 2)).toBe('3.5')
  })

  it('gibt 0.0 zurück bei 0 Stimmen (keine Division durch 0)', () => {
    expect(average(0, 0)).toBe('0.0')
  })

  it('rundet auf eine Dezimalstelle', () => {
    expect(average(10, 3)).toBe('3.3')
  })
})

// ─────────────────────────────────────────────
// Anonymität: Stimmen enthalten keine Namen
// ─────────────────────────────────────────────
describe('Anonymität', () => {
  it('aggregateVotes speichert keine Wähler:innen-Namen', () => {
    const votes = [
      { Anjli: 2, Fiona: 5 },
      { Anjli: 4, Fiona: 1 },
    ]
    const result = aggregateVotes(votes)
    // Ergebnis enthält nur Kandidat:innen-Namen, keine Wähler:innen
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['Anjli', 'Fiona']))
    expect(Object.keys(result).length).toBe(2)
  })
})
