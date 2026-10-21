import { describe, expect, it } from 'vitest'
import { closingSpeed, safeSpeedForVisibility, secondsToMeet, stoppingDistance } from '@/calculations'

describe('Begegnung bei Nebel', () => {
  it('Gegenkurs: Fahrten addieren sich; gleicher Kurs: Differenz; rechter Winkel: Pythagoras', () => {
    expect(closingSpeed(6, 14, 180)).toBeCloseTo(20)
    expect(closingSpeed(6, 14, 0)).toBeCloseTo(8)
    expect(closingSpeed(6, 8, 90)).toBeCloseTo(10)
  })
  it('0,25 NM Sicht und 20 kn Annäherung: 45 Sekunden', () => {
    expect(secondsToMeet(0.25, 20)).toBeCloseTo(45)
    expect(secondsToMeet(1, 0)).toBe(Infinity)
  })
})

describe('Anhalteweg und sichere Geschwindigkeit', () => {
  it('Anhalteweg wächst mit dem Quadrat der Fahrt', () => {
    expect(stoppingDistance(0)).toBe(0)
    const d6 = stoppingDistance(6, 0)
    expect(stoppingDistance(12, 0)).toBeCloseTo(4 * d6)
  })
  it('bei der sicheren Geschwindigkeit ist der Anhalteweg genau die halbe Sichtweite', () => {
    for (const vis of [0.05, 0.1, 0.25, 1]) {
      const v = safeSpeedForVisibility(vis)
      expect(stoppingDistance(v)).toBeCloseTo((vis * 1852) / 2, 3)
    }
  })
  it('weniger Sicht → geringere sichere Geschwindigkeit', () => {
    expect(safeSpeedForVisibility(0.05)).toBeLessThan(safeSpeedForVisibility(0.2))
    expect(safeSpeedForVisibility(0.05)).toBeGreaterThan(0)
  })
})

import { parseNumberInput } from '@/lib/quiz'

describe('Zahleneingabe mit Sekunden', () => {
  it('akzeptiert „45 s" und „45 sek", lässt Minuten und Knoten unverändert', () => {
    expect(parseNumberInput('45 s')).toBe(45)
    expect(parseNumberInput('45 sek')).toBe(45)
    expect(parseNumberInput('12 min')).toBe(12)
    expect(parseNumberInput('5,5 kn')).toBe(5.5)
  })
})
