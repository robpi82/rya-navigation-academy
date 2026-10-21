import type { LatLon, Vector2 } from '@/types/navigation'
import { degToRad, normalizeAngle, radToDeg } from './angles'
import { intersectLines } from './bearings'
import { offsetPosition } from './position'
import { fromPolar } from './vectors'

/**
 * Höhenstandlinie nach Marcq St. Hilaire (Intercept-Verfahren), Yachtmaster-Vorgriff.
 * Aus einer gegissten Position (Assumed Position, AP), dem Greenwicher Stundenwinkel (GHA) und der Deklination
 * eines Gestirns werden berechnete Höhe Hc und Azimut Zn bestimmt. Der Unterschied zur beobachteten Höhe Ho ist
 * der Abstand (Intercept) in Seemeilen: 1′ Höhe = 1 NM. Winkel in Grad, Länge Ost positiv.
 */

/** Ortsstundenwinkel LHA = GHA + Länge (Ost +), normiert auf 0–360°. */
export const localHourAngle = (gha: number, longitude: number): number => normalizeAngle(gha + longitude)

export interface Computed {
  /** berechnete Höhe Hc (°) */
  hc: number
  /** Azimut Zn (°, rechtweisend) */
  zn: number
  lha: number
}

/** Berechnete Höhe und Azimut eines Gestirns von einer Position aus. */
export function computeAltitudeAzimuth(pos: LatLon, gha: number, declination: number): Computed {
  const lha = localHourAngle(gha, pos.lon)
  const phi = degToRad(pos.lat)
  const d = degToRad(declination)
  const t = degToRad(lha)
  const sinH = Math.sin(phi) * Math.sin(d) + Math.cos(phi) * Math.cos(d) * Math.cos(t)
  const hc = radToDeg(Math.asin(Math.max(-1, Math.min(1, sinH))))
  const zn = normalizeAngle(radToDeg(Math.atan2(-Math.cos(d) * Math.sin(t), Math.cos(phi) * Math.sin(d) - Math.sin(phi) * Math.cos(d) * Math.cos(t))))
  return { hc, zn, lha }
}

export interface Intercept extends Computed {
  /** Abstand in NM: positiv = zum Gestirn hin (toward), negativ = vom Gestirn weg (away) */
  intercept: number
  /** Fußpunkt auf dem Azimut, durch den die Standlinie senkrecht zum Azimut verläuft */
  footPoint: LatLon
  /** Richtung der Standlinie (Azimut + 90°) */
  lineDirection: number
}

/** Intercept: (Ho − Hc) · 60 NM entlang des Azimuts von der AP aus; die Standlinie steht senkrecht dazu. */
export function intercept(ap: LatLon, gha: number, declination: number, observedAltitude: number): Intercept {
  const c = computeAltitudeAzimuth(ap, gha, declination)
  const p = (observedAltitude - c.hc) * 60
  return { ...c, intercept: p, footPoint: offsetPosition(ap, fromPolar(p, c.zn)), lineDirection: normalizeAngle(c.zn + 90) }
}

/** Schnitt zweier Höhenstandlinien (ebene Näherung um die AP). null, wenn sie (fast) parallel laufen. */
export function sightFix(ap: LatLon, a: Intercept, b: Intercept): LatLon | null {
  const local = (i: Intercept): Vector2 => fromPolar(i.intercept, i.zn)
  const p = intersectLines({ origin: local(a), direction: a.lineDirection }, { origin: local(b), direction: b.lineDirection })
  return p ? offsetPosition(ap, p) : null
}

/** Greenwicher Stundenwinkel der Sonne (Näherung): GHA = 15° · (UT − 12 h) + Zeitgleichung/4 (min → °). */
export const sunGHA = (utHours: number, equationOfTime = 0): number => normalizeAngle(15 * (utHours - 12) + equationOfTime / 4)

export interface SightObservation {
  gha: number
  declination: number
  observedAltitude: number
}

/**
 * Fix aus zwei gleichzeitigen Beobachtungen; bei weit entfernter AP wird mit dem Ergebnis als neuer AP nachgerechnet,
 * weil die gerade Standlinie den Standkreis nur nahe der AP gut annähert.
 */
export function iteratedSightFix(ap: LatLon, a: SightObservation, b: SightObservation, iterations = 2): LatLon | null {
  let pos: LatLon | null = ap
  for (let i = 0; i < iterations && pos; i++) {
    pos = sightFix(pos, intercept(pos, a.gha, a.declination, a.observedAltitude), intercept(pos, b.gha, b.declination, b.observedAltitude))
  }
  return pos
}
