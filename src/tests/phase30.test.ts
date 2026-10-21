import { describe, expect, it } from 'vitest'
import { climb, lineAdjustment, lineLength, verticalGap } from '@/calculations'

describe('Festmachen bei Gezeiten', () => {
  it('Höhenunterschied und Leinenlänge', () => {
    expect(verticalGap(6, 4.5, 1)).toBeCloseTo(0.5)
    expect(lineLength(3, 4)).toBeCloseTo(5)
  })
  it('kurze Querleine muss bei fallendem Wasser viel länger werden als eine lange Spring', () => {
    const breast = lineAdjustment(3, 6, 1, 5, 1)
    const spring = lineAdjustment(12, 6, 1, 5, 1)
    expect(breast).toBeGreaterThan(spring)
    expect(breast).toBeCloseTo(Math.hypot(3, 4) - 3, 5) // HW: Poller auf Klampenhöhe (0 m), NW: 4 m tiefer
    expect(spring).toBeCloseTo(Math.hypot(12, 4) - 12, 5)
  })
  it('bei steigendem Wasser wird die Leine (unterhalb des Pollers) kürzer gebraucht', () => {
    expect(lineAdjustment(5, 6, 1, 1, 4)).toBeLessThan(0)
  })
  it('Kletterhöhe zur Pier: bei Niedrigwasser deutlich mehr', () => {
    expect(climb(6.5, 5, 1)).toBeCloseTo(0.5)
    expect(climb(6.5, 1, 1)).toBeCloseTo(4.5)
  })
})
