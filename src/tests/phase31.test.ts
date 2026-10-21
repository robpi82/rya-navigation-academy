import { describe, expect, it } from 'vitest'
import { driftToCoast, leakRate, minutesUntil } from '@/calculations'

describe('Abdrift ohne Antrieb', () => {
  it('auflandiger Wind 25 kn, kein Strom: 1 kn Drift, 3 NM bis zur Küste = 3 h', () => {
    const r = driftToCoast(270, 25, 0, 0, 90, 3)
    expect(r.speed).toBeCloseTo(1)
    expect(r.towardCoast).toBeCloseTo(1)
    expect(r.hours).toBeCloseTo(3)
  })
  it('Strom zur Küste verkürzt die Zeit, ablandiger Wind: keine Gefahr', () => {
    expect(driftToCoast(270, 25, 90, 1, 90, 3).hours).toBeCloseTo(1.5)
    expect(driftToCoast(90, 25, 0, 0, 90, 3).hours).toBeNull()
  })
  it('Wind parallel zur Küste: kaum Annäherung', () => {
    const r = driftToCoast(0, 25, 0, 0, 90, 3)
    expect(Math.abs(r.towardCoast)).toBeLessThan(1e-9)
    expect(r.hours).toBeNull()
  })
})

describe('Wassereinbruch', () => {
  it('2-cm-Loch 0,5 m unter der Wasserlinie: etwa 35 l/min', () => {
    expect(leakRate(2, 0.5)).toBeCloseTo(35.2, 0)
  })
  it('doppelter Durchmesser = vierfache Menge; vierfache Tiefe = doppelte Menge', () => {
    expect(leakRate(4, 0.5) / leakRate(2, 0.5)).toBeCloseTo(4)
    expect(leakRate(2, 2) / leakRate(2, 0.5)).toBeCloseTo(2)
  })
  it('Zeit bis zum kritischen Wasserstand; Pumpen, die mithalten, verhindern das', () => {
    expect(minutesUntil(500, 60, 35)).toBeCloseTo(20)
    expect(minutesUntil(500, 30, 35)).toBeNull()
  })
})

import { parseNumberInput } from '@/lib/quiz'

describe('Eingabe in Litern pro Minute', () => {
  it('akzeptiert „35 l/min"', () => {
    expect(parseNumberInput('35 l/min')).toBe(35)
    expect(parseNumberInput('35,2')).toBeCloseTo(35.2)
  })
})
