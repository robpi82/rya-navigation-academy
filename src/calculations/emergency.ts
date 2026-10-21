import type { Vector2 } from '@/types/navigation'
import { addVectors, dot, fromPolar, magnitude } from './vectors'

/**
 * Notfälle unter Segeln (Coastal): Abdrift ohne Antrieb auf eine Leeküste und Wassereinbruch durch ein Leck.
 * Vereinfachte Modelle für Lernzwecke.
 */

/** Windabdrift eines antriebslosen Fahrtenboots als Anteil der Windgeschwindigkeit (Richtwert). */
export const WINDAGE_FACTOR = 0.04

export interface DriftResult {
  /** Driftvektor (kn) über Grund */
  drift: Vector2
  speed: number
  /** Komponente in Richtung der Küste (kn), positiv = auf die Küste zu */
  towardCoast: number
  /** Zeit bis zur Küste in Stunden, null wenn man nicht auf sie zu treibt */
  hours: number | null
}

/**
 * Drift ohne Antrieb: Wind (kommt aus `windFrom`, `windKn`) schiebt das Boot mit `windage` der Windgeschwindigkeit nach Lee,
 * der Strom setzt nach `currentSet` mit `currentKn`. Die Küste liegt in Richtung `coastBearing`, `distanceNm` entfernt.
 */
export function driftToCoast(windFrom: number, windKn: number, currentSet: number, currentKn: number, coastBearing: number, distanceNm: number, windage = WINDAGE_FACTOR): DriftResult {
  const drift = addVectors(fromPolar(windKn * windage, windFrom + 180), fromPolar(currentKn, currentSet))
  const toward = dot(drift, fromPolar(1, coastBearing))
  return { drift, speed: magnitude(drift), towardCoast: toward, hours: toward > 1e-9 ? distanceNm / toward : null }
}

/** Wassereinbruch durch ein rundes Leck (Liter pro Minute): Q = Cd · A · √(2 g h), Cd = 0,6. */
export function leakRate(holeDiameterCm: number, depthBelowWaterlineM: number, cd = 0.6): number {
  const r = holeDiameterCm / 200 // m
  const area = Math.PI * r * r
  const q = cd * area * Math.sqrt(2 * 9.81 * Math.max(0, depthBelowWaterlineM)) // m³/s
  return q * 1000 * 60
}

/** Zeit (min), bis sich `volumeL` Liter angesammelt haben, wenn `inflow` hereinkommt und `pumping` abgepumpt wird. null = Pumpen halten mit. */
export function minutesUntil(volumeL: number, inflowLpm: number, pumpingLpm: number): number | null {
  const net = inflowLpm - pumpingLpm
  return net > 1e-9 ? volumeL / net : null
}
