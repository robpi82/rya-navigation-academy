import { greatCircle, rhumbLine } from '@/calculations'
import type { LatLon } from '@/types/navigation'

/**
 * Messen auf der Webkarte. Gerechnet wird ausschließlich mit den geografischen Koordinaten (WGS84, Kugelmodell),
 * nie mit Bildschirmpixeln – Ergebnisse hängen daher nicht von Zoomstufe oder Ausschnitt ab.
 *
 * - Loxodrome (Kurslinie, rhumb line): konstanter rechtweisender Kurs, auf der Mercatorkarte eine Gerade.
 *   Das ist der Kurs, der in RYA-Kartenaufgaben gemessen und gesteuert wird.
 * - Großkreis (orthodrome): kürzester Weg; der Kurs ändert sich unterwegs, angegeben wird der Anfangskurs.
 */
export interface Measurement {
  rhumb: { bearing: number | null; distance: number }
  greatCircle: { initialBearing: number; distance: number } | null
}

export function measure(a: LatLon, b: LatLon): Measurement {
  const r = rhumbLine(a, b)
  const gc = greatCircle(a, b)
  return { rhumb: r, greatCircle: gc ? { initialBearing: gc.initialBearing, distance: gc.distance } : null }
}

export interface RouteLeg {
  from: LatLon
  to: LatLon
  bearing: number | null
  distance: number
}

/** Kurslinie über mehrere Wegpunkte: Loxodromen-Kurs und Distanz je Schlag, Gesamtdistanz */
export function routeLegs(points: LatLon[]): { legs: RouteLeg[]; total: number } {
  const legs: RouteLeg[] = []
  for (let i = 1; i < points.length; i++) {
    const r = rhumbLine(points[i - 1], points[i])
    legs.push({ from: points[i - 1], to: points[i], bearing: r.bearing, distance: r.distance })
  }
  return { legs, total: legs.reduce((s, l) => s + l.distance, 0) }
}

/** Radius der Web-Mercator-Kugel (EPSG:3857) in Metern */
const WEB_MERCATOR_RADIUS = 6378137

/** Seemeilen je Bildschirmpixel einer Webkarte (256-px-Kacheln) bei gegebener Breite und Zoomstufe */
export function nmPerPixel(lat: number, zoom: number): number {
  return ((2 * Math.PI * WEB_MERCATOR_RADIUS * Math.cos((lat * Math.PI) / 180)) / (256 * 2 ** zoom)) / 1852
}

const SCALE_STEPS = [0.01, 0.02, 0.05, 0.1, 0.2, 0.5, 1, 2, 5, 10, 20, 50, 100]

/** Maßstabsleiste: größter „runder“ Wert in sm, der höchstens maxPx breit ist */
export function nauticalScale(lat: number, zoom: number, maxPx = 120): { nm: number; px: number } {
  const per = nmPerPixel(lat, zoom)
  const nm = [...SCALE_STEPS].reverse().find((n) => n / per <= maxPx) ?? SCALE_STEPS[0]
  return { nm, px: nm / per }
}
