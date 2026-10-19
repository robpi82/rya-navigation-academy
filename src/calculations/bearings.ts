import type { LatLon, Vector2 } from '@/types/navigation'
import { angleDifference, reciprocal } from './angles'
import { toLocalNm } from './chart'
import { offsetPosition } from './position'
import { fromPolar, magnitude } from './vectors'

/**
 * Peilungen: Standlinien, Kreuzpeilung mit Fehlerdreieck („cocked hat"), Deckpeilung (Transit) und
 * Kompassfehler. Alle Richtungen rechtweisend, wenn nicht anders angegeben. Ebene Näherung für Küstendistanzen.
 */
export interface BearingObservation {
  /** Position des gepeilten Objekts */
  mark: LatLon
  /** Rechtweisende Peilung vom Boot zum Objekt in ° */
  bearing: number
}

/** Standlinie: Das Boot liegt auf der Linie, die vom Objekt in Richtung der Gegenpeilung verläuft. */
export const standlineDirection = (bearingToMark: number): number => reciprocal(bearingToMark)

interface Line {
  origin: Vector2
  direction: number
}

/** Schnittpunkt zweier Geraden (Ursprung + Richtung in °); null bei (nahezu) paralleler Lage. */
export function intersectLines(a: Line, b: Line): Vector2 | null {
  const u = fromPolar(1, a.direction)
  const v = fromPolar(1, b.direction)
  const det = -u.x * v.y + v.x * u.y
  if (Math.abs(det) < 1e-9) return null
  const dx = b.origin.x - a.origin.x
  const dy = b.origin.y - a.origin.y
  const t = (dx * -v.y + v.x * dy) / det
  return { x: a.origin.x + t * u.x, y: a.origin.y + t * u.y }
}

/** Schnittwinkel zweier Peilungen (0–90°). Je näher an 90°, desto genauer der Schnittpunkt; unter 30° unbrauchbar. */
export function cutAngle(bearingA: number, bearingB: number): number {
  const d = Math.abs(angleDifference(bearingA, bearingB))
  return d > 90 ? 180 - d : d
}

export interface FixResult {
  /** Die paarweisen Schnittpunkte (bei drei Peilungen bis zu drei: das Fehlerdreieck) */
  points: LatLon[]
  /** Mittelpunkt des Dreiecks bzw. der Schnittpunkt bei zwei Peilungen */
  center: LatLon
  /** Längste Seite des Fehlerdreiecks in NM (0 bei zwei Peilungen) */
  size: number
  /** Fläche des Fehlerdreiecks in NM² */
  area: number
  /** Kleinster Schnittwinkel zwischen zwei der Peilungen */
  worstCutAngle: number
}

/** Position aus zwei oder drei Peilungen. null, wenn sich nicht genügend Schnittpunkte ergeben. */
export function fixFromBearings(obs: BearingObservation[]): FixResult | null {
  if (obs.length < 2) return null
  const origin = obs[0].mark
  const lines: Line[] = obs.map((o) => ({ origin: toLocalNm(origin, o.mark), direction: standlineDirection(o.bearing) }))
  const pts: Vector2[] = []
  let worst = 90
  for (let i = 0; i < lines.length; i++)
    for (let j = i + 1; j < lines.length; j++) {
      worst = Math.min(worst, cutAngle(obs[i].bearing, obs[j].bearing))
      const p = intersectLines(lines[i], lines[j])
      if (p) pts.push(p)
    }
  if (pts.length === 0) return null
  const center = { x: pts.reduce((s, p) => s + p.x, 0) / pts.length, y: pts.reduce((s, p) => s + p.y, 0) / pts.length }
  let size = 0
  for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) size = Math.max(size, magnitude({ x: pts[i].x - pts[j].x, y: pts[i].y - pts[j].y }))
  const area = pts.length === 3 ? Math.abs((pts[1].x - pts[0].x) * (pts[2].y - pts[0].y) - (pts[2].x - pts[0].x) * (pts[1].y - pts[0].y)) / 2 : 0
  return { points: pts.map((p) => offsetPosition(origin, p)), center: offsetPosition(origin, center), size, area, worstCutAngle: worst }
}

/**
 * Kompassfehler aus einer Deckpeilung: Aus der Karte bekannte rechtweisende Peilung minus beobachtete Kompasspeilung.
 * Ergebnis in ° (Ost positiv, West negativ) = Variation + Deviation zusammen.
 */
export const compassErrorFromTransit = (trueBearing: number, observedCompass: number): number => angleDifference(observedCompass, trueBearing)

/** Deviation = Gesamtfehler − Variation (Ost positiv). */
export const deviationFromError = (totalError: number, variation: number): number => totalError - variation

/** Qualität des Fehlerdreiecks – Empfehlung für den Navigator. */
export function triangleAdvice(size: number): 'small' | 'medium' | 'large' {
  return size <= 0.15 ? 'small' : size <= 0.4 ? 'medium' : 'large'
}
