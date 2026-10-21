import type { LatLon } from '@/types/navigation'
import { angleDifference, degToRad, radToDeg } from './angles'
import { rhumbLine } from './chart'

/**
 * Pilotage (Ansteuerung in Sichtweite von Land): Schlagplan zwischen Wegpunkten und Deckpeilungen (Leitlinien).
 * Positionen als LatLon, Distanzen in NM, Zeiten in Stunden.
 */

export interface PilotageLeg {
  from: string
  to: string
  bearing: number | null
  distance: number
  minutes: number
  /** Uhrzeit (h) bei Erreichen des Ziels dieses Schlags */
  eta: number
}

/** Schlagplan: Kurs, Distanz und Zeit je Teilstück bei konstanter Fahrt über Grund. */
export function pilotagePlan(points: { name: string; pos: LatLon }[], speed: number, start: number): PilotageLeg[] {
  const out: PilotageLeg[] = []
  let t = start
  for (let i = 1; i < points.length; i++) {
    const r = rhumbLine(points[i - 1].pos, points[i].pos)
    const minutes = speed > 0 ? (r.distance / speed) * 60 : Infinity
    t += minutes / 60
    out.push({ from: points[i - 1].name, to: points[i].name, bearing: r.bearing, distance: r.distance, minutes, eta: t })
  }
  return out
}

/**
 * Seitlicher Abstand von einer Leitlinie: Die Leitlinie zeigt in Richtung `transitBearing` auf das vordere Zeichen.
 * Aus der beobachteten Peilung zum vorderen Zeichen und dessen Abstand folgt der Versatz (positiv = Steuerbord der Linie).
 */
export function transitOffset(observedBearingToFront: number, transitBearing: number, distanceToFront: number): number {
  return -distanceToFront * Math.sin(degToRad(angleDifference(transitBearing, observedBearingToFront)))
}

/**
 * Scheinbarer Winkelabstand zwischen vorderem und hinterem Zeichen (positiv = vorderes Zeichen erscheint rechts vom hinteren),
 * wenn das Boot `offset` NM seitlich der Leitlinie steht. Merksatz: Dem vorderen Zeichen folgen.
 */
export function transitSeparation(offset: number, distanceToFront: number, distanceToRear: number): number {
  const front = radToDeg(Math.atan2(-offset, distanceToFront))
  const rear = radToDeg(Math.atan2(-offset, distanceToRear))
  return front - rear
}
