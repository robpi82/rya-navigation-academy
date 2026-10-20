import type { LatLon } from '@/types/navigation'
import { degToRad, normalizeAngle, radToDeg } from './angles'
import { rhumbLine } from './chart'

/** Erdradius in Seemeilen (Kugelmodell): 1 NM = 1 Bogenminute eines Großkreises. */
export const EARTH_RADIUS_NM = (180 * 60) / Math.PI

export interface GreatCircle {
  /** Länge des kürzesten Weges in NM */
  distance: number
  /** Anfangskurs (rechtweisend) */
  initialBearing: number
  /** Kurs bei Ankunft (rechtweisend) */
  finalBearing: number
  /** Höchste (bzw. tiefste) Breite des Großkreises in Grad (Scheitelpunkt, Vertex); Vorzeichen wie die Breite */
  vertexLat: number
}

/** Großkreis zwischen zwei Positionen (Kugelmodell). null, wenn beide Punkte identisch sind. */
export function greatCircle(from: LatLon, to: LatLon): GreatCircle | null {
  const p1 = degToRad(from.lat)
  const p2 = degToRad(to.lat)
  const dl = degToRad(to.lon - from.lon)
  const a = Math.sin((p2 - p1) / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  if (c < 1e-12) return null
  const bearing = (lat1: number, lat2: number, d: number) => normalizeAngle(radToDeg(Math.atan2(Math.sin(d) * Math.cos(lat2), Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(d))))
  const initialBearing = bearing(p1, p2, dl)
  const finalBearing = normalizeAngle(bearing(p2, p1, -dl) + 180)
  // Scheitelpunkt: cos(φv) = cos(φ1) · |sin(α1)|
  const alpha = degToRad(initialBearing)
  const vertexAbs = radToDeg(Math.acos(Math.min(1, Math.abs(Math.cos(p1) * Math.sin(alpha)))))
  const vertexLat = (Math.abs(from.lat) >= Math.abs(to.lat) ? from.lat : to.lat) >= 0 ? vertexAbs : -vertexAbs
  return { distance: c * EARTH_RADIUS_NM, initialBearing, finalBearing, vertexLat }
}

/** Zwischenpunkte auf dem Großkreis (gleichmäßig verteilt, inkl. Start- und Endpunkt). */
export function greatCirclePoints(from: LatLon, to: LatLon, segments: number): LatLon[] {
  const gc = greatCircle(from, to)
  if (!gc) return [from]
  const p1 = degToRad(from.lat)
  const l1 = degToRad(from.lon)
  const p2 = degToRad(to.lat)
  const l2 = degToRad(to.lon)
  const delta = gc.distance / EARTH_RADIUS_NM
  const out: LatLon[] = []
  for (let i = 0; i <= segments; i++) {
    const f = i / segments
    const A = Math.sin((1 - f) * delta) / Math.sin(delta)
    const B = Math.sin(f * delta) / Math.sin(delta)
    const x = A * Math.cos(p1) * Math.cos(l1) + B * Math.cos(p2) * Math.cos(l2)
    const y = A * Math.cos(p1) * Math.sin(l1) + B * Math.cos(p2) * Math.sin(l2)
    const z = A * Math.sin(p1) + B * Math.sin(p2)
    out.push({ lat: radToDeg(Math.atan2(z, Math.hypot(x, y))), lon: radToDeg(Math.atan2(y, x)) })
  }
  return out
}

export interface RouteComparison {
  greatCircle: GreatCircle
  rhumbDistance: number
  rhumbBearing: number | null
  /** Ersparnis des Großkreises gegenüber der Loxodrome in NM */
  saving: number
}

/** Vergleich Großkreis und Loxodrome. Die Loxodrome läuft über den kürzeren Längenunterschied (≤ 180°). */
export function compareRoutes(from: LatLon, to: LatLon): RouteComparison | null {
  const gc = greatCircle(from, to)
  if (!gc) return null
  let dLon = to.lon - from.lon
  if (dLon > 180) dLon -= 360
  if (dLon < -180) dLon += 360
  const r = rhumbLine(from, { lat: to.lat, lon: from.lon + dLon })
  return { greatCircle: gc, rhumbDistance: r.distance, rhumbBearing: r.bearing, saving: r.distance - gc.distance }
}

export interface Leg {
  from: LatLon
  to: LatLon
  /** Loxodromkurs des Teilstücks (rechtweisend) */
  bearing: number | null
  distance: number
}

/**
 * Großkreis in Teilstücken: Zwischenpunkte auf dem Großkreis, dazwischen je eine Loxodrome (konstanter Kurs).
 * Je mehr Teilstücke, desto näher liegt die Gesamtstrecke an der Großkreisdistanz.
 */
export function greatCircleLegs(from: LatLon, to: LatLon, segments: number): { legs: Leg[]; total: number } {
  const pts = greatCirclePoints(from, to, Math.max(1, Math.round(segments)))
  const legs: Leg[] = []
  for (let i = 0; i < pts.length - 1; i++) {
    const r = rhumbLine(pts[i], pts[i + 1])
    legs.push({ from: pts[i], to: pts[i + 1], bearing: r.bearing, distance: r.distance })
  }
  return { legs, total: legs.reduce((s, l) => s + l.distance, 0) }
}
