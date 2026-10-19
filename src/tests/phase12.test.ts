import { describe, expect, it } from 'vitest'
import { compareRoutes, greatCircle, greatCirclePoints, EARTH_RADIUS_NM } from '@/calculations'

describe('Großkreis', () => {
  it('Meridian: 10° Breite entsprechen 600 NM, Kurs Nord', () => {
    const g = greatCircle({ lat: 0, lon: 0 }, { lat: 10, lon: 0 })!
    expect(g.distance).toBeCloseTo(600, 3)
    expect(g.initialBearing).toBeCloseTo(0, 6)
    expect(g.finalBearing).toBeCloseTo(0, 6)
  })
  it('Äquator: 90° Längenunterschied = 5400 NM, Kurs Ost', () => {
    const g = greatCircle({ lat: 0, lon: 0 }, { lat: 0, lon: 90 })!
    expect(g.distance).toBeCloseTo(5400, 3)
    expect(g.initialBearing).toBeCloseTo(90, 6)
    expect(g.vertexLat).toBeCloseTo(0, 6)
  })
  it('Symmetrie: Distanz hin und zurück gleich, Kurse unterscheiden sich', () => {
    const a = { lat: 50.7, lon: -1.3 }
    const b = { lat: 40.7, lon: -74 }
    const ab = greatCircle(a, b)!
    const ba = greatCircle(b, a)!
    expect(ab.distance).toBeCloseTo(ba.distance, 6)
    expect(ab.finalBearing).toBeCloseTo((ba.initialBearing + 180) % 360, 6)
  })
  it('bekannte Strecke: Kanal → New York ca. 2.900–3.000 NM mit Anfangskurs ca. 285°', () => {
    const g = greatCircle({ lat: 50.7, lon: -1.3 }, { lat: 40.7, lon: -74 })!
    expect(g.distance).toBeGreaterThan(2900)
    expect(g.distance).toBeLessThan(3050)
    expect(g.initialBearing).toBeGreaterThan(275)
    expect(g.initialBearing).toBeLessThan(295)
    expect(g.finalBearing).toBeGreaterThan(220) // der Kurs dreht unterwegs Richtung Süden
    expect(g.finalBearing).toBeLessThan(245)
    expect(g.finalBearing).toBeLessThan(g.initialBearing)
  })
  it('Scheitelpunkt liegt nördlicher als beide Endpunkte bei Ost-West-Route in hohen Breiten', () => {
    const g = greatCircle({ lat: 50.7, lon: -1.3 }, { lat: 40.7, lon: -74 })!
    expect(g.vertexLat).toBeGreaterThan(50.7)
  })
  it('identische Punkte liefern null', () => {
    expect(greatCircle({ lat: 10, lon: 10 }, { lat: 10, lon: 10 })).toBeNull()
    expect(compareRoutes({ lat: 10, lon: 10 }, { lat: 10, lon: 10 })).toBeNull()
  })
  it('Zwischenpunkte beginnen und enden an den Punkten und liegen gleichmäßig verteilt', () => {
    const a = { lat: 50.7, lon: -1.3 }
    const b = { lat: 40.7, lon: -74 }
    const pts = greatCirclePoints(a, b, 4)
    expect(pts).toHaveLength(5)
    expect(pts[0].lat).toBeCloseTo(a.lat, 6)
    expect(pts[4].lon).toBeCloseTo(b.lon, 6)
    const total = greatCircle(a, b)!.distance
    for (let i = 0; i < 4; i++) expect(greatCircle(pts[i], pts[i + 1])!.distance).toBeCloseTo(total / 4, 4)
  })
  it('Großkreis ist nie länger als die Loxodrome; bei gleicher Breite deutlich kürzer', () => {
    const c = compareRoutes({ lat: 50, lon: -5 }, { lat: 50, lon: -60 })!
    expect(c.saving).toBeGreaterThan(45)
    const m = compareRoutes({ lat: 0, lon: 0 }, { lat: 10, lon: 0 })!
    expect(m.saving).toBeCloseTo(0, 3)
    const eq = compareRoutes({ lat: 0, lon: 0 }, { lat: 0, lon: 30 })!
    expect(eq.saving).toBeCloseTo(0, 3)
  })
  it('Längenunterschied über die Datumsgrenze nimmt den kürzeren Weg', () => {
    const c = compareRoutes({ lat: 0, lon: 170 }, { lat: 0, lon: -170 })!
    expect(c.greatCircle.distance).toBeCloseTo(1200, 3)
    expect(c.rhumbDistance).toBeCloseTo(1200, 3)
  })
  it('Erdradius in NM passt zu 1 NM = 1 Bogenminute', () => {
    expect(EARTH_RADIUS_NM * (Math.PI / 180) / 60).toBeCloseTo(1, 9)
  })
})
