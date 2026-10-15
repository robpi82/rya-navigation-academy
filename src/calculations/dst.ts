/** Distance-Speed-Time: Distanz (NM) = Geschwindigkeit (kn) × Zeit (h). */
export const distanceFrom = (speedKn: number, hours: number): number => speedKn * hours

export function timeFrom(distanceNm: number, speedKn: number): number | null {
  return speedKn > 0 ? distanceNm / speedKn : null
}

export function speedFrom(distanceNm: number, hours: number): number | null {
  return hours > 0 ? distanceNm / hours : null
}

export const minutesToHours = (min: number): number => min / 60
export const hoursToMinutes = (h: number): number => h * 60

/** 1,5 h → "1 h 30 min" */
export function formatDuration(hours: number | null): string {
  if (hours === null || !Number.isFinite(hours) || hours < 0) return '–'
  const totalMin = Math.round(hours * 60)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  return h > 0 ? `${h} h ${m.toString().padStart(2, '0')} min` : `${m} min`
}

/** 1 Seemeile = 1852 m (international festgelegt). */
export const METERS_PER_NM = 1852
export const nmToKm = (nm: number): number => (nm * METERS_PER_NM) / 1000
export const knotsToMetersPerSecond = (kn: number): number => (kn * METERS_PER_NM) / 3600
