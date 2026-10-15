const EPS = 1e-9

export const degToRad = (deg: number): number => (deg * Math.PI) / 180
export const radToDeg = (rad: number): number => (rad * 180) / Math.PI

/** Normiert einen Winkel auf den Bereich [0, 360). */
export function normalizeAngle(deg: number): number {
  if (!Number.isFinite(deg)) return NaN
  const n = ((deg % 360) + 360) % 360
  // Rundungsartefakte wie 359.9999999999 bzw. -0 auf 0 abbilden
  return n >= 360 - EPS || Math.abs(n) < EPS ? 0 : n
}

/**
 * Vorzeichenbehaftete kleinste Winkeldifferenz von `from` nach `to` im Bereich (-180, 180].
 * Positiv = im Uhrzeigersinn (nach Steuerbord).
 */
export function angleDifference(from: number, to: number): number {
  let d = normalizeAngle(to - from)
  if (d > 180) d -= 360
  return d
}

/** Kehrwert eines Kurses (Gegenkurs), z. B. 045° → 225°. */
export const reciprocal = (deg: number): number => normalizeAngle(deg + 180)

/**
 * Formatiert eine nautische Richtung dreistellig mit deutscher Dezimalschreibweise.
 * 21.8014 → "021,8°", 359.96 (1 Nachkommastelle) → "000,0°".
 */
export function formatBearing(deg: number | null, decimals = 1): string {
  if (deg === null || !Number.isFinite(deg)) return '–'
  const factor = 10 ** decimals
  let rounded = Math.round(normalizeAngle(deg) * factor) / factor
  if (rounded >= 360) rounded -= 360
  const [intPart, frac] = rounded.toFixed(decimals).split('.')
  return `${intPart.padStart(3, '0')}${frac ? ',' + frac : ''}°`
}

/** Formatiert eine Zahl mit deutschem Dezimalkomma. */
export function formatNumber(value: number, decimals = 1): string {
  if (!Number.isFinite(value)) return '–'
  return value.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
}
