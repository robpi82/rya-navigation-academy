import { describe, expect, it } from 'vitest'
import { BOAT_PARTS, KNOTS, KNOT_TASKS } from '@/data/seamanship'
import { DAY_LESSON_IDS } from '@/data/lessonIds'
import { SYLLABUS } from '@/data/syllabus'
import { FLASHCARDS } from '@/data/flashcards'
import { curriculum } from '@/lib/studyPlan'
import { QUESTION_BANK } from '@/questions'

describe('Bootsteile', () => {
  it('eindeutige Teile, alle Markierungen in der Skizze', () => {
    expect(new Set(BOAT_PARTS.map((p) => p.id)).size).toBe(BOAT_PARTS.length)
    for (const p of BOAT_PARTS) {
      expect(p.x, p.id).toBeGreaterThan(7)
      expect(p.x, p.id).toBeLessThan(313)
      expect(p.y, p.id).toBeGreaterThan(7)
      expect(p.y, p.id).toBeLessThan(233)
    }
  })
  it('Markierungen überlappen nicht (Abstand ≥ 15 px)', () => {
    for (const a of BOAT_PARTS)
      for (const b of BOAT_PARTS) if (a.id < b.id) expect(Math.hypot(a.x - b.x, a.y - b.y), `${a.id}/${b.id}`).toBeGreaterThanOrEqual(15)
  })
})

describe('Knoten', () => {
  it('jede Aufgabe hat einen vorhandenen Knoten, jeder Knoten kommt genau einmal vor', () => {
    const ids = KNOTS.map((k) => k.id)
    expect(KNOT_TASKS.map((t) => t.knot).sort()).toEqual([...ids].sort())
  })
  it('jeder Knoten nennt Zweck und Grenze', () => {
    for (const k of KNOTS) {
      expect(k.use.length, k.id).toBeGreaterThan(20)
      expect(k.caution.length, k.id).toBeGreaterThan(10)
    }
  })
})

describe('Einbindung', () => {
  it('Lektion, Lernplan, Fragen, Lernkarten, Syllabus', () => {
    expect(DAY_LESSON_IDS).toContain('seamanship')
    expect(curriculum('day-skipper').map((i) => i.id)).toContain('seamanship')
    expect(QUESTION_BANK.filter((q) => q.topic === 'seamanship')).toHaveLength(12)
    expect(FLASHCARDS.some((c) => c.id === 'bowline')).toBe(true)
    const day = SYLLABUS[0].areas
    expect(day.find((a) => a.id === 'd-ropes')!.status).toBe('covered')
    expect(day.find((a) => a.id === 'd-terms')!.status).toBe('covered')
  })
})
