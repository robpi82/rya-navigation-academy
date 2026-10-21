import { describe, expect, it } from 'vitest'
import { cpa, cpaAfterAlteration, fromPolar, plotTarget } from '@/calculations'

/** Beobachtungen aus einer bekannten Lage erzeugen (Ziel an Position p mit Kurs/Fahrt, eigenes Schiff ab Ursprung). */
function observe(p: { x: number; y: number }, tc: number, ts: number, oc: number, os: number, minutes: number) {
  const h = minutes / 60
  const t = fromPolar(ts * h, tc)
  const o = fromPolar(os * h, oc)
  const p2 = { x: p.x + t.x - o.x, y: p.y + t.y - o.y }
  const obs = (v: { x: number; y: number }) => ({ bearing: ((Math.atan2(v.x, v.y) * 180) / Math.PI + 360) % 360, range: Math.hypot(v.x, v.y) })
  return [obs(p), obs(p2)] as const
}

describe('Radarplot', () => {
  it('stillliegendes Ziel: wahre Fahrt 0, Relativbewegung entgegen dem eigenen Kurs', () => {
    const [a, b] = observe({ x: 0, y: 6 }, 0, 0, 0, 6, 6)
    const p = plotTarget(a, b, 6, 0, 6)
    expect(p.targetSpeed).toBeCloseTo(0)
    expect(p.relativeCourse).toBeCloseTo(180)
    expect(p.relativeSpeed).toBeCloseTo(6)
    expect(p.cpa).toBeCloseTo(0)
  })
  it('wahrer Kurs und Fahrt des Ziels werden zurückgewonnen', () => {
    const [a, b] = observe({ x: 4, y: 5 }, 250, 12, 10, 7, 6)
    const p = plotTarget(a, b, 6, 10, 7)
    expect(p.targetCourse).toBeCloseTo(250)
    expect(p.targetSpeed).toBeCloseTo(12)
  })
  it('CPA/TCPA stimmen mit der direkten Rechnung überein', () => {
    const start = { x: 4, y: 5 }
    const [a, b] = observe(start, 250, 12, 10, 7, 6)
    const p = plotTarget(a, b, 6, 10, 7)
    const direct = cpa({ pos: { x: 0, y: 0 }, course: 10, speed: 7 }, { pos: p.a, course: 250, speed: 12 })
    expect(p.cpa).toBeCloseTo(direct.cpa)
    expect(p.tcpaMinutes!).toBeCloseTo(direct.tcpaMinutes!)
  })
  it('Plotdreieck: W–O ist der eigene Weg, W–A der Weg des Ziels', () => {
    const [a, b] = observe({ x: 3, y: 3 }, 270, 10, 0, 6, 6)
    const p = plotTarget(a, b, 6, 0, 6)
    expect(Math.hypot(p.o.x - p.w.x, p.o.y - p.w.y)).toBeCloseTo(0.6) // 6 kn × 0,1 h
    expect(Math.hypot(p.a.x - p.w.x, p.a.y - p.w.y)).toBeCloseTo(1.0) // 10 kn × 0,1 h
  })
  it('Kollisionskurs: konstante Peilung, abnehmender Abstand, CPA 0', () => {
    const [a, b] = observe({ x: 5, y: 5 }, 270, 6, 0, 6, 6)
    expect(a.bearing).toBeCloseTo(b.bearing)
    expect(b.range).toBeLessThan(a.range)
    const p = plotTarget(a, b, 6, 0, 6)
    expect(p.cpa).toBeCloseTo(0)
    expect(p.aspect!).toBeCloseTo(-45) // er sieht uns 45° an Backbord (Aspekt Rot 45°) – wir sehen sein rotes Seitenlicht
  })
  it('Ausweichen nach Steuerbord vergrößert den CPA', () => {
    const [a, b] = observe({ x: 5, y: 5 }, 270, 6, 0, 6, 6)
    const p = plotTarget(a, b, 6, 0, 6)
    expect(cpaAfterAlteration(p, 60, 6).cpa).toBeGreaterThan(1)
    expect(cpaAfterAlteration(p, 0, 6).cpa).toBeCloseTo(0)
  })
  it('sich öffnendes Ziel: kein TCPA', () => {
    const [a, b] = observe({ x: 0, y: -2 }, 180, 8, 0, 6, 6)
    expect(plotTarget(a, b, 6, 0, 6).tcpaMinutes).toBeNull()
  })
})
