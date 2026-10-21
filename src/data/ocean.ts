/**
 * Saisonale Eignung klassischer Nordatlantik-Routen für Fahrtenyachten – grobe Richtwerte zum Lernen, kein Ersatz für
 * Pilot Charts, Revierführer und aktuelle Wetterinformationen. Hurrikansaison Nordatlantik: 1. Juni bis 30. November.
 */
export type Suitability = 'good' | 'fair' | 'poor'

export interface OceanRoute {
  id: string
  name: string
  distanceNm: number
  /** Eignung je Monat (Januar = Index 0) */
  months: Suitability[]
  why: Record<Suitability, string>
}

const g = 'good' as const
const f = 'fair' as const
const p = 'poor' as const

export const OCEAN_ROUTES: OceanRoute[] = [
  {
    id: 'biscay',
    name: 'Ärmelkanal → Kanaren (über die Biskaya)',
    distanceNm: 1300,
    months: [p, p, p, f, f, g, g, g, g, f, p, p],
    why: {
      good: 'Sommer bis September: die Biskaya möglichst vor den Herbststürmen queren, oft mit Nordwind entlang Portugals.',
      fair: 'Übergangszeit: brauchbar, aber mit Atlantiktiefs und Starkwind in der Biskaya rechnen.',
      poor: 'Herbst und Winter: häufige Stürme und hoher Seegang in der Biskaya.',
    },
  },
  {
    id: 'trades',
    name: 'Kanaren → Karibik (Passatroute)',
    distanceNm: 2800,
    months: [g, g, f, f, p, p, p, p, p, p, g, g],
    why: {
      good: 'Nach dem Ende der Hurrikansaison: beständiger Nordostpassat, Ankunft in der Karibik in der sicheren Saison.',
      fair: 'Im Frühjahr wird der Passat schwächer und unbeständiger; die Hurrikansaison rückt für die Ankunft näher.',
      poor: 'Juni bis November ist Hurrikansaison – Ankunft in der Karibik in dieser Zeit vermeiden.',
    },
  },
  {
    id: 'return',
    name: 'Karibik → Europa (über Bermuda oder die Azoren)',
    distanceNm: 3500,
    months: [p, p, p, f, g, g, f, p, p, p, p, p],
    why: {
      good: 'Mai und Juni: nordwärts in die Westwinde, vor der Hauptzeit der Hurrikane und nach den Winterstürmen.',
      fair: 'Am Rand der Saison: im April noch Winterstürme im Nordatlantik, ab Juli steigt das Hurrikanrisiko.',
      poor: 'Herbst und Winter: Hurrikane im Spätsommer, danach schwere Winterstürme im Nordatlantik.',
    },
  },
]

export const MONTHS = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember']
