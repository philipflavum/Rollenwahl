/**
 * Berechnet die Gesamtpunkte pro Kandidat:in aus allen abgegebenen Stimmen.
 * @param {Object[]} votes - Array von Ballot-Objekten { KandidatName: 0-10, ... }
 * @returns {Object} { KandidatName: Gesamtpunkte }
 */
export function aggregateVotes(votes) {
  const totals = {}
  votes.forEach((ballot) => {
    Object.entries(ballot).forEach(([name, score]) => {
      totals[name] = (totals[name] || 0) + score
    })
  })
  return totals
}

/**
 * Ermittelt die Gewinner:innen einer Rolle.
 * Bei Gleichstand an der Grenze werden alle Gleichstehenden zurückgegeben.
 * @param {Object} totals - { KandidatName: Gesamtpunkte }
 * @param {number} seats - Anzahl verfügbarer Plätze
 * @returns {string[]} Namen der Gewinner:innen
 */
export function getWinners(totals, seats) {
  const entries = Object.entries(totals)
  if (entries.length === 0) return []
  const sorted = entries.sort((a, b) => a[1] - b[1])
  const cutoffIndex = Math.min(seats - 1, sorted.length - 1)
  const cutoffScore = sorted[cutoffIndex][1]
  return sorted.filter(([, score]) => score <= cutoffScore).map(([name]) => name)
}

/**
 * Sortiert Kandidat:innen nach Gesamtpunkten aufsteigend (weniger = besser).
 * @param {Object} totals - { KandidatName: Gesamtpunkte }
 * @returns {Array} [{ name, score }] sortiert
 */
export function rankCandidates(totals) {
  return Object.entries(totals)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => a.score - b.score)
}

/**
 * Berechnet den Durchschnittswert pro Kandidat:in.
 * @param {number} score - Gesamtpunkte
 * @param {number} voteCount - Anzahl abgegebener Stimmen
 * @returns {string} z.B. "3.5"
 */
export function average(score, voteCount) {
  if (!voteCount) return '0.0'
  return (score / voteCount).toFixed(1)
}
