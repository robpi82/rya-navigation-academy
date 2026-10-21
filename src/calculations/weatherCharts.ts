import { normalizeAngle } from './angles'
import { KN_TO_MS } from './weather'

/**
 * Wetterkarten lesen (Yachtmaster): Wind aus dem Isobarenabstand (geostrophisch), Bodenwind über See,
 * Krümmung um Tief und Hoch (Gradientwind) und Windrichtung an einem Ort. Nordhalbkugel, vereinfachte Lernmodelle.
 */

const OMEGA = 7.2921e-5 // Erddrehung (rad/s)
const RHO = 1.225 // Luftdichte (kg/m³)
const M_PER_NM = 1852

/** Coriolisparameter f = 2 Ω sin φ (1/s). */
export const coriolis = (latDeg: number): number => 2 * OMEGA * Math.sin((Math.abs(latDeg) * Math.PI) / 180)

/** Geostrophischer Wind (kn) aus dem Druckunterschied zwischen zwei Isobaren (hPa) und ihrem Abstand (NM): V = Δp / (ρ · f · Δn). */
export function geostrophicWind(intervalHpa: number, spacingNm: number, latDeg: number): number {
  const ms = (intervalHpa * 100) / (RHO * coriolis(latDeg) * spacingNm * M_PER_NM)
  return ms / KN_TO_MS
}

/** Bodenwind über See: rund drei Viertel des geostrophischen Windes, um rund 15° zum Tief hin abgelenkt (Reibung). */
export const SURFACE_FACTOR_SEA = 0.75
export const INFLOW_SEA = 15

export const surfaceWindSpeed = (geostrophicKn: number, factor = SURFACE_FACTOR_SEA): number => geostrophicKn * factor

/**
 * Gradientwind (kn) bei gekrümmten Isobaren mit Krümmungsradius `radiusNm`: um ein Tief schwächer, um ein Hoch stärker als
 * der geostrophische Wind. Um ein Hoch gibt es eine Obergrenze – ist sie überschritten, liefert die Funktion null.
 */
export function gradientWind(geostrophicKn: number, radiusNm: number, latDeg: number, system: 'low' | 'high'): number | null {
  const f = coriolis(latDeg)
  const r = radiusNm * M_PER_NM
  const vg = geostrophicKn * KN_TO_MS
  const half = (f * r) / 2
  if (system === 'low') return (-half + Math.sqrt(half * half + f * r * vg)) / KN_TO_MS
  const disc = half * half - f * r * vg
  return disc < 0 ? null : (half - Math.sqrt(disc)) / KN_TO_MS
}

/**
 * Richtung, aus der der Bodenwind weht (°), an einem Ort, der in Richtung `bearingFromCentre` vom Druckzentrum liegt
 * (Nordhalbkugel): um ein Tief gegen den Uhrzeigersinn und leicht hinein, um ein Hoch im Uhrzeigersinn und leicht hinaus.
 */
export function surfaceWindFrom(bearingFromCentre: number, system: 'low' | 'high', inflow = INFLOW_SEA): number {
  const toward = system === 'low' ? bearingFromCentre - 90 - inflow : bearingFromCentre + 90 - inflow
  return normalizeAngle(toward + 180)
}

/** Stunden, bis eine Front mit `speedKn` die Distanz `distanceNm` zurückgelegt hat. */
export const frontArrivalHours = (distanceNm: number, speedKn: number): number => distanceNm / speedKn
