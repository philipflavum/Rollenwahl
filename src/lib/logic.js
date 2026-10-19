/**
 * Aggregiert Stimmen pro Kandidat:in. Fehlende Einträge = "Keine Abfrage" (nicht gezählt).
 * @param {Object[]} votes - Array von Ballots { KandidatName: 0-4 } (fehlende Keys = skip)
 * @returns {Object} { KandidatName: { total, count } }
 */
export function aggregateVotes(votes) {
  const result = {}
  votes.forEach((ballot) => {
    Object.entries(ballot).forEach(([name, score]) => {
      if (!result[name]) result[name] = { total: 0, count: 0 }
      result[name].total += Number(score)
      result[name].count += 1
    })
  })
  return result
}

function avg(stat) {
  return stat.count ? stat.total / stat.count : 0
}

/**
 * Ermittelt Gewinner:innen nach niedrigstem Durchschnitt. Bei Gleichstand alle einschliessen.
 * @param {Object} stats - { KandidatName: { total, count } }
 * @param {number} seats
 * @returns {string[]}
 */
export function getWinners(stats, seats) {
  const entries = Object.entries(stats)
  if (!entries.length) return []
  const sorted = [...entries].sort((a, b) => avg(a[1]) - avg(b[1]))
  const cutoffIndex = Math.min(seats - 1, sorted.length - 1)
  const cutoffAvg = avg(sorted[cutoffIndex][1])
  return sorted.filter(([, s]) => avg(s) <= cutoffAvg).map(([name]) => name)
}

/**
 * Sortiert Kandidat:innen nach Durchschnitt aufsteigend.
 * @param {Object} stats - { KandidatName: { total, count } }
 * @returns {Array} [{ name, total, count, avg }]
 */
export function rankCandidates(stats) {
  return Object.entries(stats)
    .map(([name, s]) => ({ name, total: s.total, count: s.count, avg: avg(s) }))
    .sort((a, b) => a.avg - b.avg)
}

/**
 * Formatiert einen Durchschnittswert auf eine Dezimalstelle.
 * @param {number} total
 * @param {number} count
 * @returns {string}
 */
export function average(total, count) {
  if (!count) return '0.0'
  return (total / count).toFixed(1)
}
