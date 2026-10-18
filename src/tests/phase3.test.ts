import { describe, expect, it } from 'vitest'
import {
  angleDifference,
  courseToSteer,
  fromMercator,
  heightByTwelfths,
  isClearOfDanger,
  meridionalParts,
  offsetPosition,
  planPassage,
  rhumbDestination,
  rhumbLine,
  runningFix,
  tideOverTime,
  timeForHeight,
  toLocalNm,
  toMercator,
} from '@/calculations'

describe('Mercator & Loxodrome', () => {
  it('Meridionalteile (Kugelmodell): 0 am Äquator, ≈ 3474,5′ bei 50°N', () => {
    // Nautische Tafeln (Ellipsoid) nennen 3456,6′ – für die synthetische Übungskarte genügt die Kugel.
    expect(meridionalParts(0)).toBeCloseTo(0)
    expect(meridionalParts(50)).toBeCloseTo(3474.5, 0)
  })
  it('Projektion ist umkehrbar', () => {
    const p = { lat: 50.7123, lon: -1.3456 }
    const q = fromMercator(toMercator(p))
    expect(q.lat).toBeCloseTo(p.lat, 9)
    expect(q.lon).toBeCloseTo(p.lon, 9)
  })
  it('Nord-Süd: 1′ Breite = 1 NM, Kurs 000°/180°', () => {
    const r = rhumbLine({ lat: 50.5, lon: -1 }, { lat: 50.6, lon: -1 })
    expect(r.distance).toBeCloseTo(6)
    expect(r.bearing).toBeCloseTo(0)
    expect(rhumbLine({ lat: 50.6, lon: -1 }, { lat: 50.5, lon: -1 }).bearing).toBeCloseTo(180)
  })
  it('Ost-West bei 60°N: 6′ Länge = 3 NM', () => {
    const r = rhumbLine({ lat: 60, lon: 0 }, { lat: 60, lon: 0.1 })
    expect(r.bearing).toBeCloseTo(90)
    expect(r.distance).toBeCloseTo(3)
  })
  it('Ziel bei Kurs/Distanz und zurück ergibt dieselben Werte', () => {
    const a = { lat: 50.7, lon: -1.3 }
    for (const brg of [0, 37, 90, 135, 222, 270, 315, 359]) {
      const b = rhumbDestination(a, brg, 8.5)
      const r = rhumbLine(a, b)
      expect(r.distance, `${brg}`).toBeCloseTo(8.5, 6)
      expect(Math.abs(angleDifference(brg, r.bearing!)), `${brg}`).toBeLessThan(1e-6)
    }
  })
  it('stimmt auf Küstendistanzen mit dem Mittelbreitenverfahren überein', () => {
    const a = { lat: 50.7, lon: -1.3 }
    const m = offsetPosition(a, { x: 3, y: -4 })
    const r = rhumbLine(a, m)
    expect(r.distance).toBeCloseTo(5, 2)
    const local = toLocalNm(a, m)
    expect(local.x).toBeCloseTo(3, 2)
    expect(local.y).toBeCloseTo(-4, 6)
  })
  it('identische Punkte: Distanz 0, kein Kurs', () => {
    expect(rhumbLine({ lat: 50, lon: 1 }, { lat: 50, lon: 1 })).toEqual({ bearing: null, distance: 0 })
  })
})

describe('Course to Steer über mehrere Stunden', () => {
  it('konstanter Strom: identisch mit dem 1-Stunden-Stromdreieck', () => {
    const tides = Array.from({ length: 6 }, () => ({ set: 90, rate: 2 }))
    const plan = planPassage({ desiredTrack: 0, distance: 10, stw: 5, tides })
    const single = courseToSteer({ desiredTrack: 0, stw: 5, tideDirection: 90, tideRate: 2, distance: 10 })
    expect(plan.feasible && single.feasible).toBe(true)
    if (plan.feasible && single.feasible) {
      expect(plan.courseToSteer).toBeCloseTo(single.courseToSteer, 3)
      expect(plan.hours).toBeCloseTo(single.timeHours!, 3)
    }
  })
  it('Strom kentert: Versatz hebt sich auf, CTS ≈ Sollkurs', () => {
    const tides = [
      { set: 90, rate: 2 },
      { set: 270, rate: 2 },
      { set: 90, rate: 2 },
      { set: 270, rate: 2 },
    ]
    const plan = planPassage({ desiredTrack: 0, distance: 10, stw: 5, tides })
    expect(plan.feasible).toBe(true)
    if (plan.feasible) {
      expect(plan.hours).toBeCloseTo(2, 2)
      expect(Math.abs(angleDifference(0, plan.courseToSteer))).toBeLessThan(0.5)
    }
  })
  it('Probe: Wasserweg + Summe der Ströme endet genau am Ziel', () => {
    const tides = [
      { set: 45, rate: 1.2 },
      { set: 80, rate: 2.1 },
      { set: 110, rate: 1.6 },
      { set: 150, rate: 0.8 },
    ]
    const plan = planPassage({ desiredTrack: 200, distance: 14, stw: 6, tides, leeway: 4 })
    expect(plan.feasible).toBe(true)
    if (plan.feasible) {
      const w = { x: 6 * plan.hours * Math.sin((plan.waterTrack * Math.PI) / 180), y: 6 * plan.hours * Math.cos((plan.waterTrack * Math.PI) / 180) }
      const T = tideOverTime(tides, plan.hours)
      const end = { x: w.x + T.x, y: w.y + T.y }
      expect(Math.hypot(end.x, end.y)).toBeCloseTo(14, 4)
      expect(Math.abs(angleDifference(200, (Math.atan2(end.x, end.y) * 180) / Math.PI))).toBeLessThan(1e-4)
      expect(plan.courseToSteer).toBeCloseTo((plan.waterTrack - 4 + 360) % 360, 6)
    }
  })
  it('nicht erreichbar, wenn die Stromdaten nicht ausreichen oder der Strom zu stark ist', () => {
    expect(planPassage({ desiredTrack: 0, distance: 30, stw: 5, tides: [{ set: 0, rate: 0 }, { set: 0, rate: 0 }] }).feasible).toBe(false)
    expect(planPassage({ desiredTrack: 0, distance: 5, stw: 2, tides: Array(6).fill({ set: 90, rate: 3 }) }).feasible).toBe(false)
  })
  it('angefangene Stunde wird anteilig gerechnet', () => {
    const T = tideOverTime([{ set: 0, rate: 2 }, { set: 90, rate: 4 }], 1.5)
    expect(T.y).toBeCloseTo(2)
    expect(T.x).toBeCloseTo(2)
  })
})

describe('Zwölftelregel', () => {
  it('Hub 6 m: 1-2-3-3-2-1 Meter je Stunde', () => {
    const h = [0, 1, 2, 3, 4, 5, 6].map((t) => heightByTwelfths(0.5, 6.5, t))
    expect(h).toEqual([0.5, 1, 2, 3.5, 5, 6, 6.5])
  })
  it('Zwischenzeit linear interpoliert', () => {
    expect(heightByTwelfths(0, 6, 2.5)).toBeCloseTo(2.25)
  })
  it('Zeit bis zur benötigten Wassertiefe', () => {
    expect(timeForHeight(0, 6, 3)).toBeCloseTo(3)
    expect(timeForHeight(1, 5, 0.5)).toBe(0)
    expect(timeForHeight(1, 5, 6)).toBeNull()
  })
})

describe('Versegelungspeilung und Gefahrenpeilung', () => {
  it('Running Fix rekonstruiert die wahre Position', () => {
    // Objekt im Ursprung. Boot: Position 1 bei (−3, −4), fährt 2 NM nach Ost und 3 NM nach Nord.
    const p1 = { x: -3, y: -4 }
    const run = { x: 2, y: 3 }
    const p2 = { x: p1.x + run.x, y: p1.y + run.y }
    const brg = (p: { x: number; y: number }) => ((Math.atan2(-p.x, -p.y) * 180) / Math.PI + 360) % 360
    const fix = runningFix(brg(p1), brg(p2), run)!
    expect(fix.x).toBeCloseTo(p2.x, 6)
    expect(fix.y).toBeCloseTo(p2.y, 6)
  })
  it('parallele Standlinien → kein Fix', () => {
    expect(runningFix(45, 45, { x: 1, y: 1 })).toBeNull()
  })
  it('NMT/NLT auch über 000°', () => {
    expect(isClearOfDanger(40, 45, 'NMT')).toBe(true)
    expect(isClearOfDanger(50, 45, 'NMT')).toBe(false)
    expect(isClearOfDanger(355, 5, 'NMT')).toBe(true)
    expect(isClearOfDanger(10, 5, 'NLT')).toBe(true)
    expect(isClearOfDanger(358, 5, 'NLT')).toBe(false)
  })
})

import { pointInPolygon } from '@/calculations'
import { CHART_BOUNDS, LAND, MARKS, TIDAL_DIAMONDS } from '@/data/chartArea'
import { tideAtDiamond } from '@/lib/chartTides'

describe('Übungsrevier ist konsistent', () => {
  const onLand = (p: { lat: number; lon: number }) => LAND.some((l) => pointInPolygon(p, l.outline))
  it('Landmarken liegen an Land, Tonnen/Häfen/Diamonds im Wasser', () => {
    for (const m of MARKS) {
      const shouldBeLand = ['lighthouse', 'church', 'mast', 'daymark'].includes(m.kind)
      if (m.kind === 'danger') continue
      expect(onLand(m.pos), m.name).toBe(shouldBeLand)
    }
    for (const d of TIDAL_DIAMONDS) expect(onLand(d.pos), `Diamond ${d.id}`).toBe(false)
  })
  it('alle Objekte liegen innerhalb des Kartenausschnitts', () => {
    for (const m of [...MARKS.map((m) => m.pos), ...TIDAL_DIAMONDS.map((d) => d.pos)]) {
      expect(m.lat).toBeGreaterThan(CHART_BOUNDS.south)
      expect(m.lat).toBeLessThan(CHART_BOUNDS.north)
      expect(m.lon).toBeGreaterThan(CHART_BOUNDS.west)
      expect(m.lon).toBeLessThan(CHART_BOUNDS.east)
    }
  })
  it('Stromtabellen: 13 Zeilen, Nipp ≤ Spring, gültige Richtungen', () => {
    for (const d of TIDAL_DIAMONDS) {
      expect(d.rows).toHaveLength(13)
      for (const r of d.rows) {
        expect(r.neap).toBeLessThanOrEqual(r.spring)
        expect(r.set).toBeGreaterThanOrEqual(0)
        expect(r.set).toBeLessThan(360)
      }
    }
  })
  it('Strom am Diamond: Spring-/Nippwerte bei mittleren Tidenhüben', () => {
    const a = TIDAL_DIAMONDS[0]
    expect(tideAtDiamond(a, -1, 4).rate).toBeCloseTo(2.6)
    expect(tideAtDiamond(a, -1, 2).rate).toBeCloseTo(1.3)
    expect(tideAtDiamond(a, -1, 3).rate).toBeCloseTo(1.95)
    expect(tideAtDiamond(a, 0, 3).set).toBe(95)
  })
})

import { CHART_EXERCISES, checkField, checkPlot, solveExercise } from '@/lib/chartExercises'
import { rhumbLine as rl } from '@/calculations'

describe('Kartenaufgaben', () => {
  const water = (p: { lat: number; lon: number }) => !LAND.some((l) => pointInPolygon(p, l.outline))
  it('alle Aufgaben sind lösbar und haben Erklärung', () => {
    expect(CHART_EXERCISES.length).toBeGreaterThanOrEqual(10)
    for (const e of CHART_EXERCISES) {
      const s = solveExercise(e)
      expect(s.steps.length, e.id).toBeGreaterThan(1)
      expect(s.fields.length > 0 || !!s.plot, e.id).toBe(true)
      for (const f of s.fields) expect(Number.isFinite(f.value), e.id).toBe(true)
    }
  })
  it('Fix- und EP-Positionen liegen im Wasser und im Kartenausschnitt', () => {
    for (const e of CHART_EXERCISES) {
      const s = solveExercise(e)
      if (!s.plot) continue
      expect(water(s.plot.pos), e.id).toBe(true)
      expect(s.plot.pos.lat).toBeGreaterThan(CHART_BOUNDS.south)
      expect(s.plot.pos.lon).toBeLessThan(CHART_BOUNDS.east)
      if (e.type === 'ep') expect(water(e.fix), e.id).toBe(true)
    }
  })
  it('Kreuzpeilung: Standlinien schneiden sich in der wahren Position', () => {
    for (const e of CHART_EXERCISES) {
      if (e.type !== 'cross-bearing') continue
      const s = solveExercise(e)
      for (const line of s.lines) {
        // Peilung vom Objekt zur Position = Richtung der Standlinie
        const toPos = rl(line.from, e.truePos).bearing!
        expect(Math.abs(angleDifference(toPos, rl(line.from, line.to).bearing!)), e.id).toBeLessThan(0.6)
      }
    }
  })
  it('EP: Wasserweg + Strom ergeben die Lösung', () => {
    const e = CHART_EXERCISES.find((x) => x.id === 'ce-06')!
    const s = solveExercise(e)
    const [water, tide] = s.lines
    expect(rl(water.from, water.to).distance).toBeCloseTo(5, 3)
    expect(rl(tide.to, s.plot!.pos).distance).toBeLessThan(1e-6)
  })
  it('Antwortprüfung: Toleranz über 000° und Plot-Radius', () => {
    expect(checkField({ key: 'c', label: '', unit: '°', value: 359, tolerance: 2, bearing: true }, 1)).toBe(true)
    expect(checkField({ key: 'd', label: '', unit: 'NM', value: 5, tolerance: 0.2 }, 5.3)).toBe(false)
    const p = { lat: 50.7, lon: -1.3 }
    expect(checkPlot(p, { lat: 50.7 + 0.2 / 60, lon: -1.3 }, 0.3).ok).toBe(true)
    expect(checkPlot(p, { lat: 50.7 + 0.5 / 60, lon: -1.3 }, 0.3).ok).toBe(false)
  })
})

describe('Kartenaufgaben: Kurslinien führen nicht über Land', () => {
  it('Ground Tracks von Kurs-/CTS-Aufgaben liegen im Wasser', () => {
    const onLand = (p: { lat: number; lon: number }) => LAND.some((l) => pointInPolygon(p, l.outline))
    for (const e of CHART_EXERCISES) {
      if (e.type !== 'course-distance' && e.type !== 'cts') continue
      const s = solveExercise(e)
      const g = s.lines[0]
      for (let i = 1; i < 50; i++) {
        const t = i / 50
        const p = { lat: g.from.lat + (g.to.lat - g.from.lat) * t, lon: g.from.lon + (g.to.lon - g.from.lon) * t }
        expect(onLand(p), `${e.id} bei ${t}`).toBe(false)
      }
    }
  })
})
