import type { Vector2 } from '@/types/navigation'
import { normalizeAngle, radToDeg } from './angles'
import { addVectors, dot, fromPolar, scaleVector } from './vectors'

export interface HourlyTide {
  /** Set in ° */
  set: number
  /** Rate in kn (bereits für den Tag interpoliert) */
  rate: number
}

/** Summe der Stromvektoren über `hours` Stunden (angefangene Stunde anteilig). */
export function tideOverTime(tides: HourlyTide[], hours: number): Vector2 {
  let sum: Vector2 = { x: 0, y: 0 }
  const full = Math.floor(hours)
  for (let i = 0; i < full && i < tides.length; i++) sum = addVectors(sum, fromPolar(tides[i].rate, tides[i].set))
  const frac = hours - full
  if (frac > 0 && full < tides.length) sum = addVectors(sum, scaleVector(fromPolar(tides[full].rate, tides[full].set), frac))
  return sum
}

export type PassagePlan =
  | {
      feasible: true
      courseToSteer: number
      waterTrack: number
      /** Fahrtzeit in Stunden */
      hours: number
      /** Summierter Stromversatz über die Fahrtzeit (NM) */
      tideTotal: Vector2
      /** Mittlere Fahrt über Grund */
      sogMean: number
    }
  | { feasible: false; message: string }

/**
 * Course to Steer über mehrere Stunden (RYA-Methode, exakt gerechnet):
 * Die Stromvektoren aller Stunden der Überfahrt werden addiert. Gesucht ist die Fahrtzeit t, bei der
 * Wasserweg (STW · t, ein gemeinsamer Water Track) plus Summe der Ströme genau das Ziel erreicht.
 * Daraus folgt ein einziger CTS für die ganze Überfahrt.
 */
export function planPassage(p: {
  desiredTrack: number
  distance: number
  stw: number
  tides: HourlyTide[]
  leeway?: number
}): PassagePlan {
  const { desiredTrack, distance, stw, tides, leeway = 0 } = p
  if (!(stw > 0)) return { feasible: false, message: 'Ohne Fahrt durchs Wasser ist keine Planung möglich.' }
  if (!(distance > 0)) return { feasible: false, message: 'Die Distanz muss größer als 0 sein.' }
  const along = fromPolar(1, desiredTrack)
  const starboard = fromPolar(1, desiredTrack + 90)

  /** Fortschritt entlang des Sollkurses nach t Stunden (−∞, wenn Querstrom nicht ausgleichbar) */
  const progress = (t: number) => {
    const T = tideOverTime(tides, t)
    const tc = dot(T, starboard)
    const w = stw * t
    if (Math.abs(tc) > w) return -Infinity
    return Math.sqrt(w * w - tc * tc) + dot(T, along)
  }

  const maxT = tides.length
  // Kleinste Zeit suchen, zu der das Ziel erreicht ist (feine Abtastung + Bisektion)
  let lo = 0
  let hi = -1
  const step = 1 / 60
  for (let t = step; t <= maxT + 1e-9; t += step) {
    if (progress(t) >= distance) {
      hi = t
      lo = t - step
      break
    }
  }
  if (hi < 0)
    return {
      feasible: false,
      message: `Mit den Stromangaben für ${maxT} Stunden wird das Ziel nicht erreicht – Querstrom zu stark, Gegenstrom zu stark oder die Überfahrt dauert länger als die Stromdaten reichen.`,
    }
  for (let i = 0; i < 50; i++) {
    const mid = (lo + hi) / 2
    if (progress(mid) >= distance) hi = mid
    else lo = mid
  }
  const t = hi
  const T = tideOverTime(tides, t)
  const tc = dot(T, starboard)
  const alpha = radToDeg(Math.asin(Math.max(-1, Math.min(1, -tc / (stw * t)))))
  const waterTrack = normalizeAngle(desiredTrack + alpha)
  return {
    feasible: true,
    waterTrack,
    courseToSteer: normalizeAngle(waterTrack - leeway),
    hours: t,
    tideTotal: T,
    sogMean: distance / t,
  }
}
