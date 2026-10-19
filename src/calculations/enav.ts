import type { LatLon, Vector2 } from '@/types/navigation'
import { angleDifference, degToRad } from './angles'
import { rhumbLine, toLocalNm } from './chart'
import { dot, fromPolar, magnitude } from './vectors'

/* ------------------------------------------------------------------ Plotter: XTE, BTW, DTW, VMG */

export interface TrackInfo {
  /** Abstand zur Soll-Linie in NM; positiv = Boot liegt rechts (Steuerbord) von der Linie */
  xte: number
  /** Strecke entlang der Linie seit dem Startpunkt in NM */
  alongTrack: number
  /** Länge der Soll-Linie in NM */
  legLength: number
  /** Peilung zum Ziel-Wegpunkt (BTW) und Distanz (DTW) */
  btw: number | null
  dtw: number
  /** Kurs der Soll-Linie */
  trackBearing: number | null
}

/** Cross-Track-Error relativ zur Linie from → to (kurze Distanzen, ebene Näherung). */
export function trackInfo(from: LatLon, to: LatLon, pos: LatLon): TrackInfo {
  const track = toLocalNm(from, to)
  const p = toLocalNm(from, pos)
  const len = magnitude(track)
  if (len < 1e-9) {
    const r = rhumbLine(pos, to)
    return { xte: 0, alongTrack: 0, legLength: 0, btw: r.bearing, dtw: r.distance, trackBearing: null }
  }
  const u = { x: track.x / len, y: track.y / len }
  const rightNormal = { x: u.y, y: -u.x }
  const toWp = rhumbLine(pos, to)
  return {
    xte: dot(p, rightNormal),
    alongTrack: dot(p, u),
    legLength: len,
    btw: toWp.bearing,
    dtw: toWp.distance,
    trackBearing: rhumbLine(from, to).bearing,
  }
}

/** Velocity Made Good zum Wegpunkt: Anteil der Fahrt über Grund in Richtung des Ziels. */
export const vmg = (sog: number, cog: number, btw: number): number => sog * Math.cos(degToRad(angleDifference(btw, cog)))

/** Empfehlung für den Plotter-Hinweis: Auf die Linie zurück steuern. */
export function steerAdvice(xte: number, tolerance = 0.02): 'on-track' | 'steer-left' | 'steer-right' {
  if (Math.abs(xte) <= tolerance) return 'on-track'
  return xte > 0 ? 'steer-left' : 'steer-right'
}

/* ------------------------------------------------------------------ AIS / Radar: CPA und TCPA */

export interface Mover {
  /** Position in NM (x Ost, y Nord) */
  pos: Vector2
  course: number
  /** Fahrt in kn */
  speed: number
}

export interface CpaResult {
  /** Kleinster Abstand in NM (bei auseinanderlaufenden Schiffen der aktuelle Abstand) */
  cpa: number
  /** Zeit bis zum kleinsten Abstand in Minuten; null, wenn sich die Schiffe entfernen oder keine Relativbewegung besteht */
  tcpaMinutes: number | null
  closing: boolean
  currentDistance: number
}

/** Closest Point of Approach des Ziels bezogen auf das eigene Schiff (Relativbewegung). */
export function cpa(own: Mover, target: Mover): CpaResult {
  const r = { x: target.pos.x - own.pos.x, y: target.pos.y - own.pos.y }
  const vo = fromPolar(own.speed, own.course)
  const vt = fromPolar(target.speed, target.course)
  const v = { x: vt.x - vo.x, y: vt.y - vo.y }
  const dist = magnitude(r)
  const v2 = dot(v, v)
  if (v2 < 1e-12) return { cpa: dist, tcpaMinutes: null, closing: false, currentDistance: dist }
  const t = -dot(r, v) / v2 // Stunden
  if (t <= 0) return { cpa: dist, tcpaMinutes: null, closing: false, currentDistance: dist }
  const at = { x: r.x + v.x * t, y: r.y + v.y * t }
  return { cpa: magnitude(at), tcpaMinutes: t * 60, closing: true, currentDistance: dist }
}

export type CollisionRisk = 'none' | 'watch' | 'warning' | 'danger'

/** Einfache Bewertung mit typischen Alarmgrenzen (einstellbar): CPA-Grenze in NM, TCPA-Grenze in Minuten. */
export function collisionRisk(result: CpaResult, cpaLimit = 0.5, tcpaLimit = 12): CollisionRisk {
  if (!result.closing || result.tcpaMinutes === null) return 'none'
  if (result.cpa >= cpaLimit * 2) return 'none'
  if (result.cpa >= cpaLimit) return 'watch'
  return result.tcpaMinutes <= tcpaLimit ? 'danger' : 'warning'
}

/* ------------------------------------------------------------------ Echolot */

export type SounderReference = 'transducer' | 'keel' | 'waterline'

/**
 * Wassertiefe unter der Wasserlinie aus der Anzeige des Echolots.
 * `transducerDepth` = Tiefe des Gebers unter der Wasserlinie, `draught` = Tiefgang.
 */
export function actualDepth(displayed: number, reference: SounderReference, transducerDepth: number, draught: number): number {
  switch (reference) {
    case 'transducer':
      return displayed + transducerDepth
    case 'keel':
      return displayed + draught
    case 'waterline':
      return displayed
  }
}
