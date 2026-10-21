import { describe, expect, it } from 'vitest'
import { POLAR, POLAR_TWA, POLAR_TWS, bestDownwind, bestUpwind, boatSpeed, fromPolar, legPlan, passageDuration, tackingDistance } from '@/calculations'

describe('Polardiagramm', () => {
  it('trifft die Tabellenwerte und interpoliert dazwischen', () => {
    expect(boatSpeed(90, 10)).toBeCloseTo(6.7)
    expect(boatSpeed(60, 14)).toBeCloseTo(6.8)
    expect(boatSpeed(55, 10)).toBeCloseTo((5.8 + 6.2) / 2)
    expect(boatSpeed(90, 12)).toBeCloseTo((6.7 + 7.3) / 2)
  })
  it('No-go-Bereich und Windstille ergeben 0, Backbord- und Steuerbordbug sind symmetrisch', () => {
    expect(boatSpeed(30, 14)).toBe(0)
    expect(boatSpeed(90, 0)).toBe(0)
    expect(boatSpeed(-90, 10)).toBeCloseTo(boatSpeed(90, 10))
    expect(boatSpeed(270, 10)).toBeCloseTo(boatSpeed(90, 10))
  })
  it('Tabelle ist vollständig und plausibel (mehr Wind → schneller)', () => {
    expect(POLAR).toHaveLength(POLAR_TWA.length)
    for (const row of POLAR) {
      expect(row).toHaveLength(POLAR_TWS.length)
      for (let i = 1; i < row.length; i++) expect(row[i]).toBeGreaterThan(row[i - 1])
    }
  })
})

describe('Optimale Winkel', () => {
  it('bester Am-Wind-Winkel liegt zwischen 40° und 60°, bester Vorwind-Winkel zwischen 135° und 180°', () => {
    for (const tws of [6, 10, 14, 20]) {
      const up = bestUpwind(tws)
      const down = bestDownwind(tws)
      expect(up.twa).toBeGreaterThanOrEqual(40)
      expect(up.twa).toBeLessThanOrEqual(60)
      expect(down.twa).toBeGreaterThanOrEqual(135)
      expect(down.vmg).toBeGreaterThan(0)
      expect(up.vmg).toBeCloseTo(up.speed * Math.cos((up.twa * Math.PI) / 180))
    }
  })
})

describe('Schlagplanung', () => {
  it('Halbwind: direkter Kurs', () => {
    const p = legPlan(90, 0, 10, 13.4)
    expect(p.mode).toBe('direct')
    expect(p.hours).toBeCloseTo(2)
    expect(p.legs).toHaveLength(1)
  })
  it('Ziel genau in Luv: zwei gleich lange Schläge, Zeit = Distanz / VMG', () => {
    const p = legPlan(0, 0, 14, 10)
    const up = bestUpwind(14)
    expect(p.mode).toBe('beat')
    expect(p.legs).toHaveLength(2)
    expect(p.legs[0].distance).toBeCloseTo(p.legs[1].distance)
    expect(p.hours).toBeCloseTo(10 / up.vmg)
    expect(p.sailed).toBeCloseTo(tackingDistance(10, up.twa))
  })
  it('die Schläge führen genau zum Ziel', () => {
    const p = legPlan(20, 0, 10, 8)
    const end = p.legs.reduce((s, l) => { const v = fromPolar(l.distance, l.heading); return { x: s.x + v.x, y: s.y + v.y } }, { x: 0, y: 0 })
    const target = fromPolar(8, 20)
    expect(end.x).toBeCloseTo(target.x)
    expect(end.y).toBeCloseTo(target.y)
    expect(p.legs[0].distance).not.toBeCloseTo(p.legs[1].distance)
  })
  it('Ziel genau in Lee bei leichtem Wind: halsen statt platt vor dem Laken', () => {
    const p = legPlan(180, 0, 6, 10)
    expect(p.mode).toBe('run')
    expect(p.hours).toBeCloseTo(10 / bestDownwind(6).vmg)
  })
  it('kein Wind: unendliche Dauer', () => {
    expect(legPlan(0, 90, 0, 5).hours).toBe(Infinity)
  })
  it('Kreuzen kostet Strecke: 10 NM bei 45° → 14,1 NM', () => {
    expect(tackingDistance(10, 45)).toBeCloseTo(14.142, 3)
  })
})

describe('Abfahrtszeit nach Vorhersage', () => {
  it('bei konstantem Wind entspricht die Dauer dem Schlagplan', () => {
    const fc = Array.from({ length: 24 }, () => ({ windFrom: 270, tws: 10 }))
    expect(passageDuration(fc, 0, 20, 0)).toBeCloseTo(legPlan(0, 270, 10, 20).hours)
    expect(passageDuration(fc, 0, 20, 5)).toBeCloseTo(legPlan(0, 270, 10, 20).hours)
  })
  it('ein Winddreher macht eine spätere Abfahrt schneller', () => {
    // erst Wind genau von vorn (Nord), ab Stunde 4 aus West (Halbwind)
    const fc = Array.from({ length: 24 }, (_, h) => (h < 4 ? { windFrom: 0, tws: 12 } : { windFrom: 270, tws: 12 }))
    expect(passageDuration(fc, 0, 20, 4)!).toBeLessThan(passageDuration(fc, 0, 20, 0)!)
  })
  it('liefert null, wenn das Ziel innerhalb der Vorhersage nicht erreicht wird', () => {
    const calm = Array.from({ length: 6 }, () => ({ windFrom: 0, tws: 0 }))
    expect(passageDuration(calm, 0, 5, 0)).toBeNull()
  })
})
