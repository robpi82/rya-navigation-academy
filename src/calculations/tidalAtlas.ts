import { interpolateTidalRate } from './tides'
import type { HourlyTide } from './passage'

/**
 * Gezeitenstromatlas (Yachtmaster): Stundenseiten relativ zum Hochwasser des Bezugshafens, Atlasangaben wie „08,15“
 * (Nipp 0,8 kn, Spring 1,5 kn) und die Umrechnung auf den Tidenhub des Tages.
 */

export interface AtlasRates {
  neap: number
  spring: number
}

/** Liest eine Atlasangabe „NN,SS“ (Zehntelknoten, Nipp vor Spring), z. B. „08,15“ → 0,8 / 1,5 kn. */
export function parseAtlasLabel(label: string): AtlasRates | null {
  const m = /^\s*(\d{1,2})\s*,\s*(\d{1,2})\s*$/.exec(label)
  if (!m) return null
  return { neap: Number(m[1]) / 10, spring: Number(m[2]) / 10 }
}

/** Formatiert Raten wieder als Atlasangabe. */
export const formatAtlasLabel = (r: AtlasRates): string =>
  `${String(Math.round(r.neap * 10)).padStart(2, '0')},${String(Math.round(r.spring * 10)).padStart(2, '0')}`

/** Rate des Tages aus der Atlasangabe, linear über den Tidenhub (auch über Spring hinaus extrapoliert). */
export function atlasRateForDay(r: AtlasRates, range: number, neapRange: number, springRange: number): number {
  return interpolateTidalRate({ neapRate: r.neap, springRate: r.spring, range, neapRange, springRange })?.rate ?? r.neap
}

/** Stundenseite (−6 … +6) für einen Zeitpunkt in Minuten relativ zum HW: Jede Seite gilt 30 min vor bis 30 min nach ihrer Stunde. */
export function atlasPage(minutesFromHw: number): number {
  return Math.max(-6, Math.min(6, Math.round(minutesFromHw / 60))) || 0 // −0 → 0
}

/** Seiten für jede Stunde einer Überfahrt: maßgeblich ist die Mitte der jeweiligen Stunde. */
export function pagesForPassage(departMinutesFromHw: number, hours: number): number[] {
  return Array.from({ length: hours }, (_, i) => atlasPage(departMinutesFromHw + 30 + 60 * i))
}

export interface AtlasPageEntry {
  set: number
  label: string
}

/** Stromvektoren je Stunde für eine Überfahrt aus den Atlasseiten einer Stelle, umgerechnet auf den Tag. */
export function atlasTides(pages: Record<number, AtlasPageEntry>, departMinutesFromHw: number, hours: number, range: number, neapRange: number, springRange: number): HourlyTide[] {
  return pagesForPassage(departMinutesFromHw, hours).map((p) => {
    const e = pages[p]
    const r = parseAtlasLabel(e.label)
    return { set: e.set, rate: r ? atlasRateForDay(r, range, neapRange, springRange) : 0 }
  })
}
