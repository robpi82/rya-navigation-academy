import { compassToTrue, normalizeAngle, trueToCompass, variationForYear, type DeviationPoint } from '@/calculations'

/* Rechenwege für Lektion 1. Die Ergebnisse kommen aus den bestehenden Funktionen in @/calculations,
   hier werden nur die Zwischenschritte für die Anzeige aufbereitet. */

export interface ConversionStep {
  /** Ausgangsgröße (C, M oder T) und ihr Wert */
  from: { key: 'C' | 'M' | 'T'; value: number }
  /** angebrachte Korrektur */
  correction: { key: 'D' | 'V'; signed: number }
  /** Vorzeichen, mit dem die Korrektur in dieser Richtung angebracht wird */
  applied: number
  /** Summe vor dem Normieren */
  raw: number
  to: { key: 'C' | 'M' | 'T'; value: number }
  /** true, wenn raw außerhalb 000°–359° lag und normiert wurde */
  normalized: boolean
}

/**
 * Kette Compass → Deviation → Magnetic → Variation → True (mode 'toTrue') bzw. umgekehrt ('toCompass').
 * deviation und variation sind vorzeichenbehaftet (Ost positiv).
 */
export function conversionSteps(mode: 'toTrue' | 'toCompass', course: number, deviation: number, variation: number): ConversionStep[] {
  if (mode === 'toTrue') {
    const r = compassToTrue(course, deviation, variation)
    const raw1 = course + deviation
    const raw2 = r.magnetic + variation
    return [
      { from: { key: 'C', value: course }, correction: { key: 'D', signed: deviation }, applied: deviation, raw: raw1, to: { key: 'M', value: r.magnetic }, normalized: normalizeAngle(raw1) !== raw1 },
      { from: { key: 'M', value: r.magnetic }, correction: { key: 'V', signed: variation }, applied: variation, raw: raw2, to: { key: 'T', value: r.true }, normalized: normalizeAngle(raw2) !== raw2 },
    ]
  }
  const r = trueToCompass(course, variation, deviation)
  const raw1 = course - variation
  const raw2 = r.magnetic - deviation
  return [
    { from: { key: 'T', value: course }, correction: { key: 'V', signed: variation }, applied: -variation, raw: raw1, to: { key: 'M', value: r.magnetic }, normalized: normalizeAngle(raw1) !== raw1 },
    { from: { key: 'M', value: r.magnetic }, correction: { key: 'D', signed: deviation }, applied: -deviation, raw: raw2, to: { key: 'C', value: r.compass }, normalized: normalizeAngle(raw2) !== raw2 },
  ]
}

/** Die beiden Tabellenwerte, zwischen denen für einen Kompasskurs interpoliert wird. */
export function interpolationBracket(table: DeviationPoint[], heading: number): { a: DeviationPoint; b: DeviationPoint; bHeading: number; fraction: number } {
  const pts = [...table].sort((p, q) => p.heading - q.heading)
  const h = normalizeAngle(heading)
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const bHeading = b.heading + (i + 1 === pts.length ? 360 : 0)
    const hh = h < a.heading ? h + 360 : h
    if (hh >= a.heading && hh <= bHeading) return { a, b, bHeading, fraction: bHeading === a.heading ? 0 : (hh - a.heading) / (bHeading - a.heading) }
  }
  return { a: pts[0], b: pts[0], bHeading: pts[0].heading, fraction: 0 }
}

/** Zwischenschritte der Variationsrechnung (Werte in °, Ost positiv). */
export function variationSteps(chartVariation: number, chartYear: number, annualChange: number, year: number) {
  const years = year - chartYear
  const total = years * annualChange
  return { years, total, result: variationForYear(chartVariation, chartYear, annualChange, year) }
}
