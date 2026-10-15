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

/** "HH:MM" → Minuten seit Mitternacht, oder null bei ungültiger Eingabe */
export function parseClock(text: string): number | null {
  const m = /^\s*(\d{1,2})[:.](\d{2})\s*$/.exec(text)
  if (!m) return null
  const h = Number(m[1])
  const min = Number(m[2])
  if (h > 23 || min > 59) return null
  return h * 60 + min
}

/** Minuten seit Mitternacht (beliebig groß) → Uhrzeit "HH:MM" und Anzahl Folgetage */
export function formatClockTime(totalMinutes: number): { time: string; dayOffset: number } {
  const rounded = Math.round(totalMinutes)
  const dayOffset = Math.floor(rounded / 1440)
  const m = ((rounded % 1440) + 1440) % 1440
  return {
    time: `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`,
    dayOffset,
  }
}

/** ETA = Abfahrt + Distanz / SOG */
export function computeEta(departureMinutes: number, distanceNm: number, sogKn: number) {
  const hours = timeFrom(distanceNm, sogKn)
  if (hours === null) return null
  return { hours, ...formatClockTime(departureMinutes + hours * 60) }
}
