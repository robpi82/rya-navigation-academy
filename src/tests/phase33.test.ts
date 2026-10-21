import { describe, expect, it } from 'vitest'
import { buildPlan, curriculum, isDone, weeksBetween } from '@/lib/studyPlan'
import { DAY_LESSON_IDS, COASTAL_LESSON_IDS } from '@/data/lessonIds'
import { TERM_IDS } from '@/data/glossary'
import { YACHT_TOPIC_IDS } from '@/data/topics'
import type { QuizAttempt } from '@/types/learning'

describe('Lehrplan je Stufe', () => {
  it('enthält jede Lektion genau einmal und alle neun Grundbegriffe', () => {
    const day = curriculum('day-skipper')
    expect(day.filter((i) => i.kind === 'lesson').map((i) => i.id).sort()).toEqual([...DAY_LESSON_IDS].sort())
    expect(day.flatMap((i) => i.terms ?? []).sort()).toEqual([...TERM_IDS].sort())
    expect(curriculum('coastal-skipper').map((i) => i.id).sort()).toEqual([...COASTAL_LESSON_IDS].sort())
    expect(curriculum('yachtmaster-offshore').map((i) => i.id).sort()).toEqual([...YACHT_TOPIC_IDS].sort())
  })
})

describe('Wochenplan', () => {
  const start = new Date('2026-11-02T10:00:00Z') // Montag
  it('zählt Wochen ab dem Montag der Startwoche', () => {
    expect(weeksBetween(start, new Date('2026-11-06'))).toBe(1)
    expect(weeksBetween(start, new Date('2026-12-14'))).toBe(7)
  })
  it('verteilt alle Lektionen, Wiederholung vorletzte Woche, Probeprüfungen in der letzten', () => {
    const plan = buildPlan('day-skipper', start, new Date('2026-12-14'), 3)
    const all = plan.weeks.flatMap((w) => w.items)
    expect(all).toHaveLength(curriculum('day-skipper').length + 3)
    expect(plan.weeks[plan.weeks.length - 1].items.map((i) => i.kind)).toEqual(['exam', 'exam'])
    expect(plan.weeks[plan.weeks.length - 2].items.some((i) => i.kind === 'review')).toBe(true)
    expect(plan.weeks[0].start).toBe('2026-11-02')
    expect(plan.tooDense).toBe(false)
  })
  it('zu wenig Zeit wird erkannt', () => {
    const plan = buildPlan('coastal-skipper', start, new Date('2026-11-12'), 2)
    expect(plan.weeks).toHaveLength(2)
    expect(plan.tooDense).toBe(true)
  })
})

describe('Erledigt-Status', () => {
  const base = { completedLessons: ['tides'], learnedTerms: ['hdg', 'stw', 'water-track'] as const, planStart: '2026-11-01', level: 'day-skipper' as const }
  const exam = (date: string, presetId = 'kurz'): QuizAttempt => ({ id: date, date, mode: 'exam', durationSec: 60, answers: [], exam: { presetId, limitSec: 1800, percent: 80, passed: true } })
  it('Lektionen und Begriffsgruppen', () => {
    const c = curriculum('day-skipper')
    const snap = { ...base, learnedTerms: [...base.learnedTerms], attempts: [] }
    expect(isDone(c.find((i) => i.id === 'tides')!, snap)).toBe(true)
    expect(isDone(c.find((i) => i.id === 'compass')!, snap)).toBe(false)
    expect(isDone(c.find((i) => i.id === 'terms-1')!, snap)).toBe(true)
    expect(isDone(c.find((i) => i.id === 'terms-2')!, snap)).toBe(false)
  })
  it('Probeprüfungen zählen nur ab Planbeginn und nur für die Stufe', () => {
    const plan = buildPlan('day-skipper', new Date('2026-11-02'), new Date('2026-12-14'), 3)
    const items = plan.weeks.flatMap((w) => w.items)
    const e1 = items.find((i) => i.id === 'exam-1')!
    const e2 = items.find((i) => i.id === 'exam-2')!
    const snap = (attempts: QuizAttempt[]) => ({ ...base, learnedTerms: [...base.learnedTerms], attempts })
    expect(isDone(e1, snap([exam('2026-10-20T10:00:00Z')]))).toBe(false)
    expect(isDone(e1, snap([exam('2026-11-20T10:00:00Z', 'coastal')]))).toBe(false)
    expect(isDone(e1, snap([exam('2026-11-20T10:00:00Z')]))).toBe(true)
    expect(isDone(e2, snap([exam('2026-11-20T10:00:00Z')]))).toBe(false)
    expect(isDone(e2, snap([exam('2026-11-20T10:00:00Z'), exam('2026-11-27T10:00:00Z')]))).toBe(true)
  })
})
