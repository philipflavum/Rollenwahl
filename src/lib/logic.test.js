import { describe, it, expect } from 'vitest'
import { aggregateVotes, getWinners, rankCandidates, average } from './logic'

// ─────────────────────────────────────────────
// aggregateVotes — gibt { name: { total, count } } zurück
// ─────────────────────────────────────────────
describe('aggregateVotes', () => {
  it('summiert Punkte und zählt Stimmen korrekt', () => {
    const votes = [
      { Anjli: 2, Fiona: 5 },
      { Anjli: 4, Fiona: 1 },
      { Anjli: 0, Fiona: 3 },
    ]
    const result = aggregateVotes(votes)
    expect(result.Anjli).toEqual({ total: 6, count: 3 })
    expect(result.Fiona).toEqual({ total: 9, count: 3 })
  })

  it('verarbeitet eine einzelne Stimme', () => {
    const result = aggregateVotes([{ Isabel: 7 }])
    expect(result.Isabel).toEqual({ total: 7, count: 1 })
  })

  it('gibt leeres Objekt zurück bei leeren Stimmen', () => {
    expect(aggregateVotes([])).toEqual({})
  })

  it('verarbeitet Extremwerte (0 und 4)', () => {
    const votes = [{ Lea: 0 }, { Lea: 4 }, { Lea: 0 }]
    expect(aggregateVotes(votes).Lea).toEqual({ total: 4, count: 3 })
  })

  it('schliesst fehlende Kandidat:innen aus (= Keine Abfrage)', () => {
    // Fiona fehlt in zweitem Ballot → nur 1 Stimme für Fiona
    const votes = [
      { Anjli: 2, Fiona: 3 },
      { Anjli: 1 },
    ]
    const result = aggregateVotes(votes)
    expect(result.Anjli).toEqual({ total: 3, count: 2 })
    expect(result.Fiona).toEqual({ total: 3, count: 1 })
  })

  it('verarbeitet 25 gleichzeitige Stimmen korrekt', () => {
    const votes = Array.from({ length: 25 }, (_, i) => ({ Nicolas: i % 5 }))
    const result = aggregateVotes(votes)
    expect(result.Nicolas.count).toBe(25)
    const expected = Array.from({ length: 25 }, (_, i) => i % 5).reduce((a, b) => a + b, 0)
    expect(result.Nicolas.total).toBe(expected)
  })
})

// ─────────────────────────────────────────────
// getWinners — 1 Platz
// ─────────────────────────────────────────────
describe('getWinners (1 Platz)', () => {
  it('wählt Kandidat:in mit dem niedrigsten Durchschnitt', () => {
    const stats = {
      Anjli:  { total: 10, count: 2 }, // Ø 5.0
      Fiona:  { total: 4,  count: 2 }, // Ø 2.0
      Isabel: { total: 8,  count: 2 }, // Ø 4.0
    }
    expect(getWinners(stats, 1)).toEqual(['Fiona'])
  })

  it('gibt alle Gleichstehenden zurück bei Unentschieden', () => {
    const stats = {
      Anjli:  { total: 4, count: 2 }, // Ø 2.0
      Fiona:  { total: 4, count: 2 }, // Ø 2.0
      Isabel: { total: 8, count: 2 }, // Ø 4.0
    }
    const winners = getWinners(stats, 1)
    expect(winners).toContain('Anjli')
    expect(winners).toContain('Fiona')
    expect(winners).not.toContain('Isabel')
  })

  it('gibt leeres Array zurück wenn keine Stimmen', () => {
    expect(getWinners({}, 1)).toEqual([])
  })

  it('gibt alle zurück wenn weniger Kandidierende als Plätze', () => {
    const stats = { Anjli: { total: 3, count: 1 } }
    expect(getWinners(stats, 2)).toEqual(['Anjli'])
  })
})

// ─────────────────────────────────────────────
// getWinners — 2 Plätze (Moderation)
// ─────────────────────────────────────────────
describe('getWinners (2 Plätze)', () => {
  it('wählt die 2 mit dem niedrigsten Durchschnitt', () => {
    const stats = {
      Fiona:   { total: 12, count: 3 }, // Ø 4.0
      Isabel:  { total: 3,  count: 3 }, // Ø 1.0
      Lea:     { total: 6,  count: 3 }, // Ø 2.0
      Nicolas: { total: 9,  count: 3 }, // Ø 3.0 → raus
    }
    const winners = getWinners(stats, 2)
    expect(winners).toContain('Isabel')
    expect(winners).toContain('Lea')
    expect(winners).not.toContain('Fiona')
    expect(winners).not.toContain('Nicolas')
  })

  it('inkludiert alle Gleichstehenden an der Grenze', () => {
    const stats = {
      A: { total: 3,  count: 1 }, // Ø 3
      B: { total: 7,  count: 1 }, // Ø 7
      C: { total: 7,  count: 1 }, // Ø 7
      D: { total: 7,  count: 1 }, // Ø 7
      E: { total: 10, count: 1 }, // Ø 10
    }
    const winners = getWinners(stats, 2)
    expect(winners).toContain('A')
    expect(winners).toContain('B')
    expect(winners).toContain('C')
    expect(winners).toContain('D')
    expect(winners).not.toContain('E')
  })
})

// ─────────────────────────────────────────────
// Keine Abfrage — wird nicht in Bewertung einbezogen
// ─────────────────────────────────────────────
describe('Keine Abfrage', () => {
  it('Kandidat:in mit Keine Abfrage hat niedrigere count als andere', () => {
    const votes = [
      { Anjli: 4, Fiona: 2 },
      { Anjli: 2 },           // Keine Abfrage für Fiona
      { Anjli: 0, Fiona: 0 },
    ]
    const result = aggregateVotes(votes)
    expect(result.Anjli.count).toBe(3)
    expect(result.Fiona.count).toBe(2) // nur 2 statt 3
  })

  it('Durchschnitt basiert auf tatsächlich abgegebenen Stimmen', () => {
    const votes = [
      { Anjli: 4 },
      { Anjli: 0 },
      {},  // Keine Abfrage für alle
    ]
    const result = aggregateVotes(votes)
    expect(result.Anjli).toEqual({ total: 4, count: 2 })
    // Durchschnitt = 4/2 = 2.0, nicht 4/3 = 1.33
    expect(average(result.Anjli.total, result.Anjli.count)).toBe('2.0')
  })
})

// ─────────────────────────────────────────────
// rankCandidates
// ─────────────────────────────────────────────
describe('rankCandidates', () => {
  it('sortiert aufsteigend nach Durchschnitt', () => {
    const stats = {
      B: { total: 8, count: 2 }, // Ø 4.0
      A: { total: 2, count: 2 }, // Ø 1.0
      C: { total: 6, count: 2 }, // Ø 3.0
    }
    const ranked = rankCandidates(stats)
    expect(ranked[0].name).toBe('A')
    expect(ranked[1].name).toBe('C')
    expect(ranked[2].name).toBe('B')
  })

  it('gibt leeres Array zurück bei leeren Stats', () => {
    expect(rankCandidates({})).toEqual([])
  })

  it('enthält name, total, count und avg', () => {
    const stats = { X: { total: 6, count: 3 } }
    const ranked = rankCandidates(stats)
    expect(ranked[0]).toMatchObject({ name: 'X', total: 6, count: 3, avg: 2 })
  })
})

// ─────────────────────────────────────────────
// average
// ─────────────────────────────────────────────
describe('average', () => {
  it('berechnet Durchschnitt korrekt', () => {
    expect(average(6, 3)).toBe('2.0')
    expect(average(7, 2)).toBe('3.5')
  })

  it('gibt 0.0 zurück bei 0 Stimmen', () => {
    expect(average(0, 0)).toBe('0.0')
  })

  it('rundet auf eine Dezimalstelle', () => {
    expect(average(10, 3)).toBe('3.3')
  })
})

// ─────────────────────────────────────────────
// Anonymität
// ─────────────────────────────────────────────
describe('Anonymität', () => {
  it('aggregateVotes speichert keine Wähler:innen-Namen', () => {
    const votes = [{ Anjli: 2, Fiona: 5 }, { Anjli: 4, Fiona: 1 }]
    const result = aggregateVotes(votes)
    expect(Object.keys(result)).toEqual(expect.arrayContaining(['Anjli', 'Fiona']))
    expect(Object.keys(result).length).toBe(2)
  })
})
