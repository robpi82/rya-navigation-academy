import { describe, expect, it } from 'vitest'
import { DEFAULT_PROVIDERS, NAV_DISCLAIMER, resolveMapProviders } from '@/config/mapProviders'
import { PRACTICE_AREAS } from '@/data/practiceAreas'
import { CHART_EXERCISES, checkField } from '@/lib/chartExercises'
import { formatLat, formatLon } from '@/lib/coords'
import { measure, nauticalScale, nmPerPixel, routeLegs } from '@/lib/measure'
import { REAL_CHART_EXERCISES, solveRealExercise } from '@/lib/realChartExercises'

describe('Kartenanbieter (zentrale Konfiguration)', () => {
  it('Standard: OpenStreetMap-Grundkarte und OpenSeaMap-Seezeichen mit Quellenangabe', () => {
    const p = resolveMapProviders({})
    expect(p.basemap.url).toBe('https://tile.openstreetmap.org/{z}/{x}/{y}.png')
    expect(p.seamarks.url).toBe('https://t1.openseamap.org/seamark/{z}/{x}/{y}.png')
    expect(p.basemap.attribution).toContain('OpenStreetMap')
    expect(p.seamarks.attribution).toContain('OpenSeaMap')
    // öffentliche Server sind nicht für eine kommerzielle App freigegeben
    expect(p.basemap.productionReady).toBe(false)
    expect(p.seamarks.productionReady).toBe(false)
    expect(p.bathymetry).toBeNull()
  })
  it('Anbieter lassen sich per Build-Variablen austauschen, ohne Code zu ändern', () => {
    const p = resolveMapProviders({
      VITE_BASEMAP_URL: 'https://tiles.example.com/base/{z}/{x}/{y}.png',
      VITE_BASEMAP_ATTRIBUTION: '© Beispiel',
      VITE_BASEMAP_MAX_ZOOM: '17',
      VITE_BATHYMETRY_URL: 'https://wms.example.com/wms',
      VITE_BATHYMETRY_WMS_LAYERS: 'depth',
    })
    expect(p.basemap.url).toContain('tiles.example.com')
    expect(p.basemap.attribution).toBe('© Beispiel')
    expect(p.basemap.maxNativeZoom).toBe(17)
    expect(p.basemap.productionReady).toBe(true)
    expect(p.seamarks.url).toBe(DEFAULT_PROVIDERS.seamarks.url)
    expect(p.bathymetry?.kind).toBe('wms')
    expect(p.bathymetry?.wmsLayers).toBe('depth')
  })
  it('Hinweis auf Ausbildungszweck', () => {
    expect(NAV_DISCLAIMER).toBe('Nur für Ausbildungszwecke – nicht zur realen Navigation geeignet.')
  })
})

describe('Reale Übungsgebiete', () => {
  it('fünf Gebiete in der gewünschten Reihenfolge, Mittelpunkt innerhalb der Grenzen', () => {
    expect(PRACTICE_AREAS.map((a) => a.id)).toEqual(['solent', 'plymouth', 'portsmouth', 'vigo', 'kiel'])
    for (const a of PRACTICE_AREAS) {
      expect(a.bounds.south, a.id).toBeLessThan(a.bounds.north)
      expect(a.bounds.west, a.id).toBeLessThan(a.bounds.east)
      expect(a.center.lat, a.id).toBeGreaterThan(a.bounds.south)
      expect(a.center.lat, a.id).toBeLessThan(a.bounds.north)
      expect(a.center.lon, a.id).toBeGreaterThan(a.bounds.west)
      expect(a.center.lon, a.id).toBeLessThan(a.bounds.east)
      expect(a.zoom, a.id).toBeGreaterThanOrEqual(9)
      expect(a.zoom, a.id).toBeLessThanOrEqual(14)
    }
  })
  it('Koordinaten liegen in der richtigen Weltgegend', () => {
    const by = Object.fromEntries(PRACTICE_AREAS.map((a) => [a.id, a.center]))
    expect(by.solent.lat).toBeCloseTo(50.7, 0)
    expect(by.solent.lon).toBeLessThan(0) // westlich von Greenwich
    expect(by.plymouth.lon).toBeCloseTo(-4.15, 1)
    expect(by.vigo.lat).toBeCloseTo(42.2, 0)
    expect(by.kiel.lat).toBeCloseTo(54.4, 0)
    expect(by.kiel.lon).toBeGreaterThan(10)
  })
})

describe('Messen: Loxodrome und Großkreis', () => {
  it('Loxodrome stimmt mit dem Mittelbreitenverfahren überein (Aufgabe rc-01)', () => {
    const e = REAL_CHART_EXERCISES[0]
    const s = solveRealExercise(e)
    const dLat = (e.to.pos.lat - e.from.pos.lat) * 60
    const dep = (e.to.pos.lon - e.from.pos.lon) * 60 * Math.cos((((e.from.pos.lat + e.to.pos.lat) / 2) * Math.PI) / 180)
    const course = ((Math.atan2(dep, dLat) * 180) / Math.PI + 360) % 360
    expect(s.rhumb.bearing).toBeCloseTo(course, 1)
    expect(s.rhumb.distance).toBeCloseTo(Math.hypot(dLat, dep), 1)
    expect(s.rhumb.bearing).toBeCloseTo(288.9, 1)
    expect(s.rhumb.distance).toBeCloseTo(15.44, 2)
  })
  it('Großkreis und Loxodrome werden getrennt ausgewiesen; auf langen Strecken ist der Großkreis kürzer', () => {
    const short = measure({ lat: 50.5333, lon: -1.2833 }, { lat: 50.6167, lon: -1.6667 })
    expect(Math.abs(short.rhumb.distance - short.greatCircle!.distance)).toBeLessThan(0.01)
    const long = measure({ lat: 50, lon: -5 }, { lat: 40, lon: -70 })
    expect(long.greatCircle!.distance).toBeLessThan(long.rhumb.distance - 50)
    expect(Math.abs(long.greatCircle!.initialBearing - long.rhumb.bearing!)).toBeGreaterThan(10)
  })
  it('Ergebnisse hängen nur von den Koordinaten ab, nicht von der Zoomstufe', () => {
    // die Messfunktionen bekommen keinen Zoom; dieselben Punkte liefern immer dasselbe Ergebnis
    const a = { lat: 54.5, lon: 10.27 }
    const b = { lat: 54.39, lon: 10.19 }
    expect(measure(a, b)).toEqual(measure({ ...a }, { ...b }))
    // der Maßstab dagegen halbiert sich je Zoomstufe exakt
    expect(nmPerPixel(54.4, 12) / nmPerPixel(54.4, 13)).toBeCloseTo(2, 10)
    expect(nmPerPixel(0, 0)).toBeCloseTo(40075016.686 / 256 / 1852, 3)
    for (const z of [8, 11, 14, 17]) {
      const s = nauticalScale(50.7, z)
      expect(s.px).toBeLessThanOrEqual(120)
      expect(s.px).toBeGreaterThan(40)
    }
  })
  it('Kurslinie mit mehreren Schlägen summiert die Distanzen', () => {
    const r = routeLegs([{ lat: 50, lon: 0 }, { lat: 50.1, lon: 0 }, { lat: 50.1, lon: 0.1 }])
    expect(r.legs).toHaveLength(2)
    expect(r.legs[0].bearing).toBeCloseTo(0)
    expect(r.legs[0].distance).toBeCloseTo(6)
    expect(r.legs[1].bearing).toBeCloseTo(90, 0)
    expect(r.total).toBeCloseTo(r.legs[0].distance + r.legs[1].distance)
  })
})

describe('Reale Kartenaufgabe', () => {
  it('Prüfung mit nachvollziehbaren Toleranzen (Kurs ± 2°, Distanz ± 0,2 sm)', () => {
    const [course, distance] = solveRealExercise(REAL_CHART_EXERCISES[0]).fields
    expect(checkField(course, 290)).toBe(true)
    expect(checkField(course, 291.5)).toBe(false)
    expect(checkField(distance, 15.6)).toBe(true)
    expect(checkField(distance, 15.7)).toBe(false)
  })
  it('Wegpunkte liegen im Übungsgebiet; die 11 fiktiven Aufgaben bleiben erhalten', () => {
    const solent = PRACTICE_AREAS[0].bounds
    for (const e of REAL_CHART_EXERCISES)
      for (const p of [e.from.pos, e.to.pos]) {
        expect(p.lat).toBeGreaterThan(solent.south)
        expect(p.lat).toBeLessThan(solent.north)
        expect(p.lon).toBeGreaterThan(solent.west)
        expect(p.lon).toBeLessThan(solent.east)
      }
    expect(CHART_EXERCISES).toHaveLength(11)
    expect(REAL_CHART_EXERCISES.every((e) => !CHART_EXERCISES.some((c) => c.id === e.id))).toBe(true)
  })
})

describe('Positionsformat Grad und Dezimalminuten', () => {
  it('formatiert und rundet über volle Grad korrekt', () => {
    expect(formatLat(50 + 32 / 60)).toBe('50°32,0′N')
    expect(formatLon(-(1 + 17 / 60))).toBe('001°17,0′W')
    expect(formatLat(50.99999, 1)).toBe('51°00,0′N')
    expect(formatLon(10.2, 2)).toBe('010°12,00′E')
  })
})
