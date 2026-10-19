import { normalizeAngle } from './angles'

/**
 * Kompasskorrektur (Compass → Magnetic → True), Vorzeichen: Ost = positiv, West = negativ.
 * Merkhilfe „Cadbury's Dairy Milk Very Tasty" (C – D – M – V – T):
 *   von links nach rechts (Kompass → rechtweisend): Ost addieren, West subtrahieren
 *   von rechts nach links (rechtweisend → Kompass): Ost subtrahieren, West addieren
 */
export const signedFromDirection = (value: number, dir: 'E' | 'W'): number => (dir === 'E' ? value : -value)

export function compassToTrue(compass: number, deviation: number, variation: number): { magnetic: number; true: number } {
  const magnetic = normalizeAngle(compass + deviation)
  return { magnetic, true: normalizeAngle(magnetic + variation) }
}

export function trueToCompass(trueCourse: number, variation: number, deviation: number): { magnetic: number; compass: number } {
  const magnetic = normalizeAngle(trueCourse - variation)
  return { magnetic, compass: normalizeAngle(magnetic - deviation) }
}

/* ------------------------------------------------------------------ Deviationstabelle */

export interface DeviationPoint {
  /** Kompasskurs in ° */
  heading: number
  /** Deviation in ° (Ost positiv) */
  deviation: number
}

/** Lineare Interpolation der Deviation zwischen den Tabellenwerten (zyklisch über 000°). */
export function deviationAt(table: DeviationPoint[], compassHeading: number): number {
  if (table.length === 0) return 0
  const pts = [...table].sort((a, b) => a.heading - b.heading)
  const h = normalizeAngle(compassHeading)
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const aH = a.heading
    const bH = b.heading + (i + 1 === pts.length ? 360 : 0)
    const hh = h < aH ? h + 360 : h
    if (hh >= aH && hh <= bH) {
      const span = bH - aH
      return span === 0 ? a.deviation : a.deviation + ((b.deviation - a.deviation) * (hh - aH)) / span
    }
  }
  return pts[0].deviation
}

/**
 * Magnetischer Kurs → Kompasskurs bei tabellierter Deviation. Die Tabelle gilt für den Kompasskurs,
 * gesucht ist aber C aus M: C = M − dev(C). Das wird iterativ gelöst.
 */
export function magneticToCompassWithTable(magnetic: number, table: DeviationPoint[]): number {
  let c = magnetic
  for (let i = 0; i < 30; i++) c = normalizeAngle(magnetic - deviationAt(table, c))
  return c
}

/* ------------------------------------------------------------------ Variation ändert sich jährlich */

/** Variation im gewünschten Jahr: Wert der Karte + Jahre × jährliche Änderung (Ost positiv, in °). */
export const variationForYear = (chartVariation: number, chartYear: number, annualChange: number, year: number): number =>
  chartVariation + (year - chartYear) * annualChange

/** −2,2 → "2°12′W" */
export function formatVariation(v: number): string {
  const total = Math.round(Math.abs(v) * 60)
  const d = Math.floor(total / 60)
  const m = total % 60
  return `${d}°${String(m).padStart(2, '0')}′${v >= 0 ? 'E' : 'W'}`
}
