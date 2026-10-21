import { angleDifference, degToRad, normalizeAngle } from './angles'
import { fromPolar } from './vectors'

/**
 * Wetterrouting (Yachtmaster-Vorgriff): Polardiagramm einer fiktiven 10-m-Fahrtenyacht, beste Kreuz- und Vorwindwinkel,
 * Zeitbedarf mit Kreuzen bzw. Halsen und die Wahl der Abfahrtszeit nach einer stündlichen Windvorhersage.
 * Vereinfachungen: kein Strom, keine Abdrift, Wendezeiten vernachlässigt, Wind innerhalb einer Stunde konstant.
 */

/** True Wind Speed (kn) der Polarspalten */
export const POLAR_TWS = [6, 10, 14, 20] as const
/** True Wind Angle (°) der Polarzeilen */
export const POLAR_TWA = [40, 45, 50, 60, 75, 90, 110, 120, 135, 150, 165, 180] as const
/** Bootsgeschwindigkeit (kn) je TWA-Zeile und TWS-Spalte – fiktive Werte für Übungszwecke */
export const POLAR: number[][] = [
  [2.9, 4.0, 4.5, 4.7],
  [3.9, 5.3, 5.9, 6.1],
  [4.3, 5.8, 6.4, 6.6],
  [4.7, 6.2, 6.8, 7.0],
  [5.0, 6.5, 7.1, 7.4],
  [5.1, 6.7, 7.3, 7.7],
  [5.0, 6.7, 7.5, 8.0],
  [4.8, 6.5, 7.4, 8.0],
  [4.2, 6.0, 7.0, 7.8],
  [3.6, 5.3, 6.4, 7.3],
  [3.2, 4.8, 5.9, 6.8],
  [3.0, 4.5, 5.6, 6.5],
]

/** Kleinster segelbarer Windwinkel: darunter liegt der „No-go"-Bereich. */
export const NO_GO = POLAR_TWA[0]

function interp(xs: readonly number[], x: number): { i: number; f: number } {
  if (x <= xs[0]) return { i: 0, f: 0 }
  if (x >= xs[xs.length - 1]) return { i: xs.length - 2, f: 1 }
  let i = 0
  while (x > xs[i + 1]) i++
  return { i, f: (x - xs[i]) / (xs[i + 1] - xs[i]) }
}

/** Bootsgeschwindigkeit aus dem Polardiagramm (bilinear interpoliert). TWA 0–180°, unterhalb des No-go-Winkels 0. */
export function boatSpeed(twa: number, tws: number): number {
  const a = Math.abs(angleDifference(0, twa))
  if (a < NO_GO - 1e-9 || tws <= 0) return 0
  const row = interp(POLAR_TWA, a)
  const at = (col: number) => POLAR[row.i][col] + row.f * (POLAR[row.i + 1][col] - POLAR[row.i][col])
  if (tws < POLAR_TWS[0]) return at(0) * (tws / POLAR_TWS[0]) // unter 6 kn linear gegen null
  const col = interp(POLAR_TWS, tws)
  return at(col.i) + col.f * (at(col.i + 1) - at(col.i))
}

export interface OptimalAngle {
  twa: number
  speed: number
  vmg: number
}

/** Bester Am-Wind-Winkel (größte VMG gegen den Wind). */
export function bestUpwind(tws: number): OptimalAngle {
  let best: OptimalAngle = { twa: NO_GO, speed: 0, vmg: 0 }
  for (let twa = NO_GO; twa <= 90; twa += 0.5) {
    const s = boatSpeed(twa, tws)
    const vmg = s * Math.cos(degToRad(twa))
    if (vmg > best.vmg) best = { twa, speed: s, vmg }
  }
  return best
}

/** Bester Vorwind-Winkel (größte VMG vor dem Wind). */
export function bestDownwind(tws: number): OptimalAngle {
  let best: OptimalAngle = { twa: 180, speed: 0, vmg: 0 }
  for (let twa = 90; twa <= 180; twa += 0.5) {
    const s = boatSpeed(twa, tws)
    const vmg = s * Math.cos(degToRad(180 - twa))
    if (vmg > best.vmg) best = { twa, speed: s, vmg }
  }
  return best
}

export interface LegPlan {
  mode: 'direct' | 'beat' | 'run' | 'none'
  /** Zeitbedarf in Stunden (Infinity, wenn kein Wind) */
  hours: number
  /** gesegelte Strecke durchs Wasser in NM */
  sailed: number
  /** Schläge: Steuerkurs und Länge */
  legs: { heading: number; distance: number }[]
  /** Windwinkel zum direkten Kurs */
  directTwa: number
}

/**
 * Zeitbedarf für eine Strecke `distance` in Richtung `bearing` bei Wind aus `windFrom` mit `tws` kn.
 * Liegt das Ziel im No-go-Bereich (oder hinter dem besten Vorwind-Winkel), wird mit zwei Schlägen auf den
 * optimalen Winkeln gekreuzt bzw. gehalst (Reihenfolge der Schläge beliebig, Anzahl der Wenden vernachlässigt).
 */
export function legPlan(bearing: number, windFrom: number, tws: number, distance: number): LegPlan {
  const directTwa = Math.abs(angleDifference(windFrom, bearing))
  if (distance <= 0) return { mode: 'direct', hours: 0, sailed: 0, legs: [], directTwa }
  if (tws <= 0) return { mode: 'none', hours: Infinity, sailed: 0, legs: [], directTwa }
  const up = bestUpwind(tws)
  const down = bestDownwind(tws)
  if (directTwa >= up.twa && directTwa <= down.twa) {
    const s = boatSpeed(directTwa, tws)
    return { mode: 'direct', hours: distance / s, sailed: distance, legs: [{ heading: normalizeAngle(bearing), distance }], directTwa }
  }
  const opt = directTwa < up.twa ? up : down
  const h1 = normalizeAngle(windFrom + opt.twa)
  const h2 = normalizeAngle(windFrom - opt.twa)
  const u = fromPolar(1, h1)
  const v = fromPolar(1, h2)
  const d = fromPolar(distance, bearing)
  const det = u.x * v.y - u.y * v.x
  const a = (d.x * v.y - d.y * v.x) / det
  const b = (u.x * d.y - u.y * d.x) / det
  const legs = [
    { heading: h1, distance: Math.max(0, a) },
    { heading: h2, distance: Math.max(0, b) },
  ].filter((l) => l.distance > 1e-9)
  const sailed = legs.reduce((s, l) => s + l.distance, 0)
  return { mode: directTwa < up.twa ? 'beat' : 'run', hours: sailed / opt.speed, sailed, legs, directTwa }
}

/** Zusätzliche Strecke beim Kreuzen genau gegen den Wind: gesegelte Strecke = Distanz / cos(Kreuzwinkel). */
export const tackingDistance = (distance: number, angleOffWind: number): number => distance / Math.cos(degToRad(angleOffWind))

export interface HourlyWind {
  windFrom: number
  tws: number
}

/**
 * Fahrtdauer (h) bei Abfahrt zur Stunde `departHour` (Index in der Vorhersage) – stündlich wechselnder Wind,
 * innerhalb jeder Stunde gilt die effektive Annäherung an das Ziel aus `legPlan`. null, wenn das Ziel innerhalb
 * der Vorhersage nicht erreicht wird.
 */
export function passageDuration(forecast: HourlyWind[], bearing: number, distance: number, departHour: number): number | null {
  let remaining = distance
  let t = departHour
  while (remaining > 1e-9) {
    const idx = Math.floor(t + 1e-9)
    if (idx >= forecast.length) return null
    const w = forecast[idx]
    const perNm = legPlan(bearing, w.windFrom, w.tws, 1).hours
    const speed = Number.isFinite(perNm) && perNm > 0 ? 1 / perNm : 0
    const slot = idx + 1 - t
    const reach = speed * slot
    if (reach >= remaining) {
      t += remaining / speed
      remaining = 0
    } else {
      remaining -= reach
      t = idx + 1
    }
  }
  return t - departHour
}
