import type { LatLon, Vector2 } from '@/types/navigation'
import { degToRad, normalizeAngle, radToDeg } from './angles'

/**
 * Mercator-Projektion in Kartenkoordinaten mit der Einheit „Längenminute":
 * x = Länge in Minuten, y = vergrößerte Breite (Meridionalteile) in Minuten.
 * Kurse sind auf einer Mercatorkarte winkeltreu – eine Loxodrome ist eine Gerade.
 * Vereinfachung: Kugelmodell der Erde (echte Seekarten nutzen das Ellipsoid, Unterschied < 1 %).
 */
export const MINUTES_PER_RADIAN = (180 / Math.PI) * 60

export function meridionalParts(latDeg: number): number {
  const phi = degToRad(latDeg)
  return Math.log(Math.tan(Math.PI / 4 + phi / 2)) * MINUTES_PER_RADIAN
}

export function latFromMeridionalParts(mp: number): number {
  return radToDeg(2 * Math.atan(Math.exp(mp / MINUTES_PER_RADIAN)) - Math.PI / 2)
}

export function toMercator(p: LatLon): Vector2 {
  return { x: p.lon * 60, y: meridionalParts(p.lat) }
}

export function fromMercator(v: Vector2): LatLon {
  return { lat: latFromMeridionalParts(v.y), lon: v.x / 60 }
}

/**
 * Kurs und Distanz entlang der Loxodrome (Kurslinie mit konstantem rechtweisendem Kurs).
 * Kurs = atan2(Δλ, ΔMP); Distanz = Δφ / cos(Kurs) bzw. bei Ost-West-Kursen Δλ · cos(φ).
 */
export function rhumbLine(from: LatLon, to: LatLon): { bearing: number | null; distance: number } {
  const dLatMin = (to.lat - from.lat) * 60
  const dLonMin = (to.lon - from.lon) * 60
  const dMp = meridionalParts(to.lat) - meridionalParts(from.lat)
  if (Math.abs(dLatMin) < 1e-9 && Math.abs(dLonMin) < 1e-9) return { bearing: null, distance: 0 }
  const course = Math.atan2(dLonMin, dMp)
  const distance =
    Math.abs(dLatMin) > 1e-6 ? Math.abs(dLatMin / Math.cos(course)) : Math.abs(dLonMin) * Math.cos(degToRad(from.lat))
  return { bearing: normalizeAngle(radToDeg(course)), distance }
}

/** Zielpunkt bei gegebenem Kurs und Distanz entlang der Loxodrome. */
export function rhumbDestination(from: LatLon, bearing: number, distanceNm: number): LatLon {
  const c = degToRad(bearing)
  const dLatMin = distanceNm * Math.cos(c)
  const lat = from.lat + dLatMin / 60
  let dLonMin: number
  if (Math.abs(dLatMin) > 1e-9) {
    dLonMin = (meridionalParts(lat) - meridionalParts(from.lat)) * Math.tan(c)
  } else {
    dLonMin = (distanceNm * Math.sin(c)) / Math.cos(degToRad(from.lat))
  }
  return { lat, lon: from.lon + dLonMin / 60 }
}

/** Lokale ebene Koordinaten in NM (x Ost, y Nord) relativ zu einem Bezugspunkt – für kurze Distanzen. */
export function toLocalNm(origin: LatLon, p: LatLon): Vector2 {
  const midLat = (origin.lat + p.lat) / 2
  return { x: (p.lon - origin.lon) * 60 * Math.cos(degToRad(midLat)), y: (p.lat - origin.lat) * 60 }
}

/** Punkt-in-Polygon (Ray Casting) in Lon/Lat-Koordinaten. */
export function pointInPolygon(p: LatLon, polygon: [number, number][]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i]
    const [xj, yj] = polygon[j]
    if (yi > p.lat !== yj > p.lat && p.lon < ((xj - xi) * (p.lat - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}
