import { describe, expect, it } from 'vitest'
import { anchorRode, clearanceAtLw, maxDepth, minChartedDepth, SCOPE_ROPE, swingRadius } from '@/calculations'
import { ANCHORAGE_OPTIONS, ANCHORAGE_SCENARIO, ANCHORING_STEPS } from '@/data/anchoring'
import { COASTAL_LESSON_IDS } from '@/data/lessonIds'
import { QUESTION_BANK } from '@/questions'
import { FLASHCARDS } from '@/data/flashcards'

describe('Kettenlänge', () => {
  it('richtet sich nach der Tiefe bei Hochwasser', () => {
    expect(maxDepth(3.5, 4.5)).toBe(8)
    expect(anchorRode(3.5, 4.5)).toBe(32)
    expect(anchorRode(3.5, 4.5, SCOPE_ROPE)).toBe(48)
    expect(anchorRode(3, 1, 4, 1)).toBe(20) // mit Bugrolle 1 m über Wasser
  })
})

describe('Schwojkreis', () => {
  it('horizontale Kettenlänge plus Bootslänge', () => {
    expect(swingRadius(30, 0, 10)).toBe(40)
    expect(swingRadius(5, 3, 10)).toBeCloseTo(14)
    expect(swingRadius(32, 4, 10)).toBeCloseTo(41.75, 2)
  })
  it('ist bei Niedrigwasser größer als bei Hochwasser', () => {
    const rode = anchorRode(3.5, 4.5)
    expect(swingRadius(rode, 4, 10)).toBeGreaterThan(swingRadius(rode, 8, 10))
  })
  it('Kette kürzer als die Tiefe: nur die Bootslänge', () => {
    expect(swingRadius(3, 5, 10)).toBe(10)
  })
})

describe('Tiefe bei Niedrigwasser', () => {
  it('Wasser unter dem Kiel und Mindest-Kartentiefe passen zusammen', () => {
    expect(clearanceAtLw(1.2, 0.6, 1.6)).toBeCloseTo(0.2)
    expect(minChartedDepth(1.9, 0.5, 0.4)).toBeCloseTo(2)
    expect(clearanceAtLw(minChartedDepth(1.9, 0.5, 0.4), 0.4, 1.9)).toBeCloseTo(0.5)
  })
})

describe('Ankerplatz-Aufgabe', () => {
  const s = ANCHORAGE_SCENARIO
  it('genau eine richtige Antwort; sie hat genug Wasser bei NW', () => {
    const right = ANCHORAGE_OPTIONS.filter((o) => o.correct)
    expect(right).toHaveLength(1)
    expect(clearanceAtLw(right[0].chartedDepth, s.lwHeight, s.draught)).toBeGreaterThanOrEqual(0.5)
  })
  it('die flache Bucht fällt bei NW trocken', () => {
    const east = ANCHORAGE_OPTIONS.find((o) => o.id === 'east')!
    expect(clearanceAtLw(east.chartedDepth, s.lwHeight, s.draught)).toBeLessThan(0)
  })
  it('Ankermanöver: eindeutige Schritte', () => {
    expect(new Set(ANCHORING_STEPS.map((x) => x.id)).size).toBe(ANCHORING_STEPS.length)
  })
})

describe('Einbindung', () => {
  it('Lektion, Fragen und Lernkarten sind vorhanden', () => {
    expect(COASTAL_LESSON_IDS).toContain('anchoring')
    expect(QUESTION_BANK.filter((q) => q.topic === 'anchoring')).toHaveLength(8)
    expect(FLASHCARDS.some((c) => c.id === 'anchor-scope')).toBe(true)
  })
})
