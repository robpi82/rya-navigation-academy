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
