import { normalizeAngle } from './angles'

/**
 * Pilotage im Küstennahbereich (Day Skipper): Sektorenfeuer und Zeiten im Pilotageplan.
 * Sektorgrenzen werden wie in der Seekarte als Peilung von See zum Feuer angegeben.
 */

export type SectorColor = 'W' | 'R' | 'G'

export interface LightSector {
  /** Grenzen als Peilung zum Feuer (°), im Uhrzeigersinn von `from` bis `to` */
  from: number
  to: number
  color: SectorColor
}

/** Liegt eine Peilung im Bogen von `from` bis `to` (im Uhrzeigersinn, auch über 000° hinweg)? */
export function inArc(bearing: number, from: number, to: number): boolean {
  const b = normalizeAngle(bearing)
  const f = normalizeAngle(from)
  const t = normalizeAngle(to)
  return f <= t ? b >= f && b < t : b >= f || b < t
}

/** Welche Farbe sieht man bei einer Peilung zum Feuer? null = außerhalb aller Sektoren (Feuer nicht sichtbar). */
export function sectorColor(bearingToLight: number, sectors: LightSector[]): SectorColor | null {
  return sectors.find((s) => inArc(bearingToLight, s.from, s.to))?.color ?? null
}

/** Minuten für einen Abschnitt des Pilotageplans. */
export const legMinutes = (distanceNm: number, speedKn: number): number => (distanceNm / speedKn) * 60
