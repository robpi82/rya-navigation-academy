/**
 * Interpolation der Stromrate zwischen Spring- und Nipptide (RYA-Methode, linear über den Tidenhub).
 * rate = Nipp + (Spring − Nipp) · (Tidenhub heute − Nipp-Hub) / (Spring-Hub − Nipp-Hub)
 */
export interface TidalRateInput {
  springRate: number
  neapRate: number
  /** Tidenhub (Range) am betreffenden Tag in m */
  range: number
  springRange: number
  neapRange: number
}

export interface TidalRateResult {
  rate: number
  /** Anteil zwischen Nipp (0) und Spring (1) */
  factor: number
  /** true, wenn der Tidenhub außerhalb Nipp–Spring liegt (Extrapolation) */
  extrapolated: boolean
}

export function interpolateTidalRate(p: TidalRateInput): TidalRateResult | null {
  const span = p.springRange - p.neapRange
  if (!(span > 0)) return null
  const factor = (p.range - p.neapRange) / span
  const rate = Math.max(0, p.neapRate + (p.springRate - p.neapRate) * factor)
  return { rate, factor, extrapolated: factor < 0 || factor > 1 }
}

/* ------------------------------------------------------------------ Gezeitenhöhen (Day Skipper) */

export const tidalRange = (hw: number, lw: number): number => hw - lw

export type RangeClass = 'springs' | 'neaps' | 'intermediate'

/** Einordnung des Tidenhubs: nahe Spring (≥ 2/3 des Weges von Nipp zu Spring), nahe Nipp (≤ 1/3), sonst dazwischen. */
export function classifyRange(range: number, springRange: number, neapRange: number): RangeClass | null {
  if (!(springRange > neapRange)) return null
  const f = (range - neapRange) / (springRange - neapRange)
  return f >= 2 / 3 ? 'springs' : f <= 1 / 3 ? 'neaps' : 'intermediate'
}

/**
 * Höhe der Gezeit zwischen HW und NW (bzw. NW und HW) nach dem Kosinusmodell:
 * h(t) = Mittel + (Hub/2) · cos(π · t / T), t = Stunden nach HW, T = Dauer von HW bis NW (Standard 6 h).
 * Näherung der Gezeitenkurve – die Gezeitentafeln nutzen die tatsächliche Kurve des Standardhafens.
 */
export function heightCosine(hw: number, lw: number, hoursAfterHw: number, halfPeriod = 6): number {
  const t = Math.max(-halfPeriod, Math.min(halfPeriod, hoursAfterHw))
  return (hw + lw) / 2 + ((hw - lw) / 2) * Math.cos((Math.PI * t) / halfPeriod)
}

/** Wassertiefe = Kartentiefe + Höhe der Gezeit (trockenfallend: Kartentiefe negativ = −Trockenhöhe). */
export const waterDepth = (chartedDepth: number, heightOfTide: number): number => chartedDepth + heightOfTide

export const underKeelClearance = (depth: number, draught: number): number => depth - draught

export type PassWindow = { kind: 'always' } | { kind: 'never' } | { kind: 'window'; halfWidthHours: number }

/**
 * Zeitfenster um HW, in dem die Höhe der Gezeit mindestens `requiredHeight` beträgt (Kosinusmodell,
 * symmetrisch um HW). Bei requiredHeight ≤ NW immer passierbar, bei > HW nie.
 */
export function passableWindow(hw: number, lw: number, requiredHeight: number, halfPeriod = 6): PassWindow {
  if (requiredHeight <= lw) return { kind: 'always' }
  if (requiredHeight > hw) return { kind: 'never' }
  const mean = (hw + lw) / 2
  const amp = (hw - lw) / 2
  const x = Math.max(-1, Math.min(1, (requiredHeight - mean) / amp))
  return { kind: 'window', halfWidthHours: (halfPeriod / Math.PI) * Math.acos(x) }
}

/** Kettenlänge beim Ankern: Verhältnis × (Wassertiefe bei HW + Bughöhe über Wasser). */
export const anchorChainLength = (depthAtHw: number, bowHeight: number, ratio: number): number => ratio * (depthAtHw + bowHeight)

/** Geografische Sichtweite eines Feuers in NM (inkl. Refraktion): 2,08 · (√h + √H), Höhen in m. */
export const geographicRange = (lightHeight: number, eyeHeight: number): number =>
  2.08 * (Math.sqrt(Math.max(0, lightHeight)) + Math.sqrt(Math.max(0, eyeHeight)))
