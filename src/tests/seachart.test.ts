import { describe, expect, it } from 'vitest'
import { pointInPolygon } from '@/calculations'
import { CHART_BOUNDS, LAND, MARKS } from '@/data/chartArea'
import { DREDGED, FEATURES, MOLES } from '@/data/chartFeatures'
import { CONTOUR_DEPTHS, depthAt, depthModel, formatSounding } from '@/lib/bathymetry'
import { refineOutline } from '@/lib/coastline'
import { CHART_EXERCISES, solveExercise } from '@/lib/chartExercises'
import { PILOTAGE_POINTS } from '@/modules/coastal/pilotageWidgets'
import type { LatLon } from '@/types/navigation'

const onLand = (p: LatLon) => LAND.some((l) => l.kind !== 'drying' && pointInPolygon(p, l.outline))
const lerp = (a: LatLon, b: LatLon, t: number): LatLon => ({ lat: a.lat + (b.lat - a.lat) * t, lon: a.lon + (b.lon - a.lon) * t })

/** Schnitt zweier Strecken in lon/lat (für kurze Strecken ausreichend genau) */
function intersects(a: LatLon, b: LatLon, c: [number, number], d: [number, number]): boolean {
  const cross = (ox: number, oy: number, px: number, py: number, qx: number, qy: number) => (px - ox) * (qy - oy) - (py - oy) * (qx - ox)
  const d1 = cross(c[0], c[1], d[0], d[1], a.lon, a.lat)
  const d2 = cross(c[0], c[1], d[0], d[1], b.lon, b.lat)
  const d3 = cross(a.lon, a.lat, b.lon, b.lat, c[0], c[1])
  const d4 = cross(a.lon, a.lat, b.lon, b.lat, d[0], d[1])
  return d1 * d2 < 0 && d3 * d4 < 0
}

describe('Seekarte: Aufgabenobjekte bleiben unverändert', () => {
  it('Positionen der 11 Aufgabenobjekte sind eingefroren', () => {
    expect(MARKS.map((m) => [m.id, m.pos.lat, m.pos.lon])).toEqual([
      ['lt-moewe', 50.762, -1.452],
      ['ch-ankerstedt', 50.8, -1.3],
      ['mast-nordhoehe', 50.802, -1.15],
      ['lt-kranich', 50.624, -1.398],
      ['dm-kranich', 50.633, -1.208],
      ['hb-ankerstedt', 50.781, -1.305],
      ['hb-kranich', 50.659, -1.3],
      ['by-riff', 50.709, -1.15],
      ['by-moewe', 50.742, -1.455],
      ['by-anst', 50.765, -1.305],
      ['dg-stein', 50.697, -1.15],
    ])
  })
  it('alle 11 Kartenaufgaben bleiben lösbar', () => {
    expect(CHART_EXERCISES).toHaveLength(11)
    for (const e of CHART_EXERCISES) expect(solveExercise(e).steps.length, e.id).toBeGreaterThan(1)
  })
})

describe('Seekarte: Küstenlinie', () => {
  it('Verfeinerung erhält die Ankerpunkte und ist reproduzierbar', () => {
    const anchors: [number, number][] = [[0, 0], [1, 0], [1, 1], [0, 1]]
    const a = refineOutline(anchors, { seed: 3, levels: 3, amplitude: 0.2 })
    const b = refineOutline(anchors, { seed: 3, levels: 3, amplitude: 0.2 })
    expect(a).toEqual(b)
    expect(a).toHaveLength(4 * 8)
    for (const p of anchors) expect(a).toContainEqual(p)
  })
})

describe('Seekarte: Tiefenmodell', () => {
  it('Land hat keine Wassertiefe, Grauer Stein fällt wie angegeben trocken (1,2 m)', () => {
    expect(depthAt(MARKS.find((m) => m.id === 'lt-moewe')!.pos)).toBeLessThan(0)
    expect(depthAt(MARKS.find((m) => m.id === 'dg-stein')!.pos)).toBeCloseTo(-1.2, 1)
  })
  it('Tonnen liegen im Wasser mit mindestens 2 m Tiefe', () => {
    const buoys = [...MARKS.filter((m) => m.kind.startsWith('buoy')), ...FEATURES.filter((f) => f.kind.startsWith('lateral') || f.kind.startsWith('cardinal'))]
    expect(buoys.length).toBe(9)
    for (const b of buoys) {
      expect(onLand(b.pos), b.id).toBe(false)
      expect(depthAt(b.pos), b.id).toBeGreaterThanOrEqual(2)
    }
  })
  it('Häfen und Fahrrinnen haben die Mindesttiefe der Baggerung', () => {
    for (const c of DREDGED) for (let i = 0; i <= 10; i++) expect(depthAt(lerp(c.from, c.to, i / 10)), c.name).toBeGreaterThanOrEqual(c.minDepth - 0.01)
  })
  it('im Süden (offene See) tiefer als in der Bucht', () => {
    expect(depthAt({ lat: 50.58, lon: -1.6 })).toBeGreaterThan(30)
    expect(depthAt({ lat: 50.72, lon: -1.3 })).toBeLessThan(depthAt({ lat: 50.585, lon: -1.0 }))
  })
  it('Tiefenlinien 2/5/10/20/30 m und Tiefenflächen sind vorhanden', () => {
    const m = depthModel()
    expect(m.lines.map((l) => l.depth)).toEqual([...CONTOUR_DEPTHS])
    for (const l of m.lines) expect(l.d.length, `${l.depth} m`).toBeGreaterThan(500)
    for (const b of m.bands) expect(b.d.length, `≤ ${b.maxDepth} m`).toBeGreaterThan(500)
  })
  it('Tiefenzahlen: im Wasser, im Kartenausschnitt, in drei Detailstufen', () => {
    const m = depthModel()
    expect(m.soundings.length).toBeGreaterThan(1000)
    for (const lv of [0, 1, 2]) expect(m.soundings.some((s) => s.level === lv)).toBe(true)
    for (const s of m.soundings) {
      expect(s.x / 60).toBeGreaterThan(CHART_BOUNDS.west)
      expect(s.x / 60).toBeLessThan(CHART_BOUNDS.east)
    }
  })
  it('Tiefenzahlen im Kartenformat', () => {
    expect(formatSounding(7.5)).toEqual({ whole: '7', tenth: '5', drying: false })
    expect(formatSounding(12)).toEqual({ whole: '12', tenth: '', drying: false })
    expect(formatSounding(24.6)).toEqual({ whole: '25', tenth: '', drying: false })
    expect(formatSounding(-1.2)).toEqual({ whole: '1', tenth: '2', drying: true })
    expect(formatSounding(3.96)).toEqual({ whole: '4', tenth: '', drying: false })
  })
})

describe('Seekarte: Seezeichen nach IALA Region A', () => {
  const byId = (id: string) => FEATURES.find((f) => f.id === id)!
  it('Ankerstedt (Einlaufen nach Norden): Rot an Backbord = Westseite, Grün an Steuerbord = Ostseite', () => {
    expect(byId('an-1').kind).toBe('lateral-port')
    expect(byId('an-1').pos.lon).toBeLessThan(-1.305)
    expect(byId('an-2').kind).toBe('lateral-stbd')
    expect(byId('an-2').pos.lon).toBeGreaterThan(-1.305)
    expect(byId('an-w').lightColor).toBe('R')
    expect(byId('an-e').lightColor).toBe('G')
  })
  it('Kranich (Einlaufen nach Süden): Rot an Backbord = Ostseite, Grün an Steuerbord = Westseite', () => {
    expect(byId('kr-1').kind).toBe('lateral-port')
    expect(byId('kr-1').pos.lon).toBeGreaterThan(-1.3)
    expect(byId('kr-2').kind).toBe('lateral-stbd')
    expect(byId('kr-2').pos.lon).toBeLessThan(-1.3)
    expect(byId('kr-e').lightColor).toBe('R')
    expect(byId('kr-w').lightColor).toBe('G')
  })
  it('Kennungen passen zum Zeichentyp', () => {
    for (const f of FEATURES) {
      if (f.kind === 'lateral-port') expect(f.light, f.id).toMatch(/ R /)
      if (f.kind === 'lateral-stbd') expect(f.light, f.id).toMatch(/ G /)
      if (f.kind === 'cardinal-e') expect(f.light, f.id).toMatch(/^Q\(3\)/)
      if (f.kind === 'cardinal-w') expect(f.light, f.id).toMatch(/^Q\(9\)/)
      if (f.kind === 'cardinal-s') expect(f.light, f.id).toMatch(/^Q\(6\)\+LFl/)
      if (f.kind === 'cardinal-n') expect(f.light, f.id).toMatch(/^Q( |$)/)
    }
  })
  it('Kardinalzeichen liegen auf der benannten Seite der Gefahr', () => {
    const w = byId('cw-kranich')
    const e = byId('ce-ostklippe')
    expect(depthAt({ lat: w.pos.lat, lon: w.pos.lon + 0.012 })).toBeLessThan(depthAt(w.pos)) // Gefahr östlich
    expect(depthAt({ lat: e.pos.lat, lon: e.pos.lon - 0.012 })).toBeLessThan(depthAt(e.pos)) // Gefahr westlich
  })
  it('alle Zusatzobjekte liegen im Kartenausschnitt und nicht an Land', () => {
    for (const f of FEATURES) {
      expect(f.pos.lat, f.id).toBeGreaterThan(CHART_BOUNDS.south)
      expect(f.pos.lat, f.id).toBeLessThan(CHART_BOUNDS.north)
      expect(onLand(f.pos), f.id).toBe(false)
    }
  })
})

describe('Seekarte: Kurslinien und Pilotage', () => {
  it('Ground Tracks der Kurs-/CTS-Aufgaben kreuzen keine Mole und haben überall ≥ 2 m Wasser', () => {
    for (const e of CHART_EXERCISES) {
      if (e.type !== 'course-distance' && e.type !== 'cts') continue
      const g = solveExercise(e).lines[0]
      for (const m of MOLES) for (let i = 1; i < m.line.length; i++) expect(intersects(g.from, g.to, m.line[i - 1], m.line[i]), `${e.id} / ${m.name}`).toBe(false)
      for (let i = 0; i <= 50; i++) expect(depthAt(lerp(g.from, g.to, i / 50)), `${e.id} bei ${i / 50}`).toBeGreaterThanOrEqual(2)
    }
  })
  it('Pilotage nach Ankerstedt: durch die Molenöffnung, überall ≥ 2,5 m', () => {
    for (let i = 1; i < PILOTAGE_POINTS.length; i++) {
      const a = PILOTAGE_POINTS[i - 1].pos
      const b = PILOTAGE_POINTS[i].pos
      for (const m of MOLES) for (let j = 1; j < m.line.length; j++) expect(intersects(a, b, m.line[j - 1], m.line[j]), `${PILOTAGE_POINTS[i].name} / ${m.name}`).toBe(false)
      for (let k = 0; k <= 20; k++) expect(depthAt(lerp(a, b, k / 20)), `${PILOTAGE_POINTS[i].name} ${k}`).toBeGreaterThanOrEqual(2.5)
    }
  })
})
