import { formatAtlasLabel, type AtlasPageEntry } from '@/calculations/tidalAtlas'
import { normalizeAngle } from '@/calculations/angles'

/**
 * Übungsatlas „Möwenland-Rinne“ (fiktiv, nicht für die Navigation): vier Stellen, Stundenseiten HW−6 … HW+6 des Bezugshafens
 * Port Möwe. Flutstrom setzt etwa nach Ost-Nordost, Ebbstrom entgegen. Nippraten sind rund halb so groß wie Springraten.
 */
export const ATLAS_NEAP_RANGE = 1.9
export const ATLAS_SPRING_RANGE = 4.1
export const ATLAS_HOURS = [-6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6] as const

export interface AtlasStation {
  id: string
  name: string
  /** Lage in der Skizze (0–100) */
  x: number
  y: number
  pages: Record<number, AtlasPageEntry>
}

function station(id: string, name: string, x: number, y: number, floodSet: number, springPeak: number, phase: number): AtlasStation {
  const pages: Record<number, AtlasPageEntry> = {}
  for (const h of ATLAS_HOURS) {
    const s = springPeak * Math.sin((2 * Math.PI * (h + phase)) / 12.4)
    const spring = Math.round(Math.abs(s) * 10) / 10
    const neap = Math.round(spring * 5) / 10
    pages[h] = { set: normalizeAngle(s >= 0 ? floodSet : floodSet + 180), label: formatAtlasLabel({ neap, spring }) }
  }
  return { id, name, x, y, pages }
}

export const ATLAS_STATIONS: AtlasStation[] = [
  station('A', 'Westeinfahrt', 18, 55, 75, 2.0, 4.5),
  station('B', 'Rinnenmitte', 50, 48, 70, 3.0, 4),
  station('C', 'Kap Sturmvogel', 72, 30, 60, 3.6, 3.5),
  station('D', 'Ostbucht', 84, 70, 85, 1.2, 3),
]

/** Überfahrt quer durch die Rinne, Strom an der Rinnenmitte (Stelle B). */
export const ATLAS_PASSAGE = { from: 'Süderhafen', to: 'Norderhafen', track: 340, distance: 15, station: 'B' }
