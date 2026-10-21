import { describe, expect, it } from 'vitest'
import { apparentWind, reefStage, windForceRatio } from '@/calculations'

describe('Scheinbarer Wind', () => {
  it('Wind genau von vorn: Geschwindigkeiten addieren sich', () => {
    expect(apparentWind(15, 0, 6)).toEqual({ speed: 21, angle: 0 })
  })
  it('Wind genau von achtern: Differenz', () => {
    const a = apparentWind(15, 180, 6)
    expect(a.speed).toBeCloseTo(9)
    expect(a.angle).toBeCloseTo(180)
  })
  it('Halbwind: scheinbarer Wind kommt vorlicher und stärker', () => {
    const a = apparentWind(12, 90, 6)
    expect(a.speed).toBeCloseTo(Math.hypot(12, 6))
    expect(a.angle).toBeCloseTo(63.43, 1)
  })
  it('am Wind ist der scheinbare Wind stärker als raumschots bei gleichem wahren Wind', () => {
    expect(apparentWind(20, 45, 6).speed).toBeGreaterThan(apparentWind(20, 135, 6).speed)
  })
  it('ohne Fahrt: scheinbarer = wahrer Wind; Vorzeichen des Winkels spielt keine Rolle', () => {
    const a = apparentWind(14, 60, 0)
    expect(a.speed).toBeCloseTo(14)
    expect(a.angle).toBeCloseTo(60)
    expect(apparentWind(14, -60, 5).speed).toBeCloseTo(apparentWind(14, 60, 5).speed)
  })
})

describe('Winddruck und Reffen', () => {
  it('doppelte Windgeschwindigkeit = vierfacher Druck', () => {
    expect(windForceRatio(10, 20)).toBeCloseTo(4)
    expect(windForceRatio(15, 25)).toBeCloseTo(2.78, 2)
  })
  it('Reffstufen steigen mit dem scheinbaren Wind', () => {
    expect([10, 18, 23, 28, 35].map(reefStage)).toEqual(['none', 'reef1', 'reef2', 'reef3', 'storm'])
  })
})

import { parseNumberInput } from '@/lib/quiz'

describe('Eingabe von Faktoren', () => {
  it('akzeptiert „4", „× 4" und „4×"', () => {
    expect(parseNumberInput('× 4')).toBe(4)
    expect(parseNumberInput('4×')).toBe(4)
    expect(parseNumberInput('2,78')).toBeCloseTo(2.78)
  })
})
