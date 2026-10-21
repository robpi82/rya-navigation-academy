import type { Vector2 } from '@/types/navigation'
import { angleDifference, normalizeAngle, radToDeg } from './angles'
import { dot, fromPolar, magnitude } from './vectors'

/**
 * Radarplotting (Yachtmaster-Vorgriff), nordstabilisierte Darstellung mit dem eigenen Schiff im Zentrum.
 * Aus zwei Beobachtungen (rechtweisende Peilung und Abstand) eines Ziels im Abstand von `minutes`:
 * Relativbewegung, wahrer Kurs und Fahrt des Ziels (Plotdreieck O–W–A), CPA/TCPA, Aspekt und die Wirkung
 * eines eigenen Ausweichmanövers. x Ost, y Nord, Distanzen in NM.
 */

export interface RadarObservation {
  bearing: number
  range: number
}

export const obsToVector = (o: RadarObservation): Vector2 => fromPolar(o.range, o.bearing)

const toCourse = (v: Vector2): number | null => (magnitude(v) < 1e-9 ? null : normalizeAngle(radToDeg(Math.atan2(v.x, v.y))))

export interface RadarPlot {
  /** erste und zweite Position des Ziels (O und A) */
  o: Vector2
  a: Vector2
  /** W: wo das Ziel ohne eigene Fahrt stünde (O minus eigener Weg) */
  w: Vector2
  /** Relativbewegung pro Stunde */
  relative: Vector2
  relativeCourse: number | null
  relativeSpeed: number
  /** wahre Bewegung des Ziels */
  targetCourse: number | null
  targetSpeed: number
  /** kleinster Abstand und Zeit ab der zweiten Beobachtung */
  cpa: number
  tcpaMinutes: number | null
  cpaPoint: Vector2
  /** Aspekt: Peilung des eigenen Schiffs vom Bug des Ziels aus (positiv = Steuerbord des Ziels, „grün") */
  aspect: number | null
}

export function plotTarget(first: RadarObservation, second: RadarObservation, minutes: number, ownCourse: number, ownSpeed: number): RadarPlot {
  const o = obsToVector(first)
  const a = obsToVector(second)
  const h = minutes / 60
  const relative = { x: (a.x - o.x) / h, y: (a.y - o.y) / h }
  const own = fromPolar(ownSpeed, ownCourse)
  const ownWay = { x: own.x * h, y: own.y * h }
  const w = { x: o.x - ownWay.x, y: o.y - ownWay.y }
  const trueVel = { x: relative.x + own.x, y: relative.y + own.y }
  const targetCourse = toCourse(trueVel)
  const targetSpeed = magnitude(trueVel)
  const v2 = dot(relative, relative)
  let t = v2 < 1e-12 ? 0 : -dot(a, relative) / v2
  const closing = t > 0
  if (!closing) t = 0
  const cpaPoint = { x: a.x + relative.x * t, y: a.y + relative.y * t }
  // Aspekt: Richtung vom Ziel zu uns relativ zu seinem Kurs
  const bearingToOwn = toCourse({ x: -a.x, y: -a.y })
  const aspect = targetCourse === null || bearingToOwn === null ? null : angleDifference(targetCourse, bearingToOwn)
  return {
    o,
    a,
    w,
    relative,
    relativeCourse: toCourse(relative),
    relativeSpeed: Math.sqrt(v2),
    targetCourse,
    targetSpeed,
    cpa: magnitude(cpaPoint),
    tcpaMinutes: closing ? t * 60 : null,
    cpaPoint,
    aspect,
  }
}

/**
 * Neuer CPA, wenn das eigene Schiff jetzt (Position A) Kurs und/oder Fahrt ändert und das Ziel seinen wahren Kurs hält.
 */
export function cpaAfterAlteration(plot: RadarPlot, newCourse: number, newSpeed: number): { cpa: number; tcpaMinutes: number | null; relativeCourse: number | null } {
  const target = plot.targetCourse === null ? { x: 0, y: 0 } : fromPolar(plot.targetSpeed, plot.targetCourse)
  const own = fromPolar(newSpeed, newCourse)
  const rel = { x: target.x - own.x, y: target.y - own.y }
  const v2 = dot(rel, rel)
  const t = v2 < 1e-12 ? 0 : -dot(plot.a, rel) / v2
  if (t <= 0) return { cpa: magnitude(plot.a), tcpaMinutes: null, relativeCourse: toCourse(rel) }
  return { cpa: magnitude({ x: plot.a.x + rel.x * t, y: plot.a.y + rel.y * t }), tcpaMinutes: t * 60, relativeCourse: toCourse(rel) }
}
