import { describe, expect, it } from 'vitest'
import { anchorChainLength, anchorRode, arrivalHour, sogAlongStream, streamAtHour, windOverWater } from '@/calculations'
import { CAPE_ROUTES, CAPE_SCENARIO, CAPE_STREAM_SPRINGS } from '@/data/tidalRaces'
import { COASTAL_LESSON_IDS } from '@/data/lessonIds'
import { QUESTION_BANK } from '@/questions'
import { curriculum, isDone } from '@/lib/studyPlan'
import { dayKey } from '@/lib/stats'
import type { QuizAttempt } from '@/types/learning'

describe('Wind über dem Wasser', () => {
  it('gegen den Strom stärker, mit dem Strom schwächer', () => {
    const against = windOverWater(270, 20, 270, 3)
    expect(against.speed).toBeCloseTo(23)
    expect(against.relation).toBe('against')
    const withTide = windOverWater(270, 20, 90, 3)
    expect(withTide.speed).toBeCloseTo(17)
    expect(withTide.relation).toBe('with')
  })
  it('quer zum Strom: Vektorsumme, Lage „quer“', () => {
    const r = windOverWater(0, 20, 90, 3)
    expect(r.speed).toBeCloseTo(Math.hypot(20, 3))
    expect(r.relation).toBe('across')
  })
  it('ohne Strom gleich dem Wind', () => {
    expect(windOverWater(200, 15, 0, 0).speed).toBeCloseTo(15)
  })
})

describe('Strom am Kap', () => {
  it('Tabelle HW−6 … HW+6 mit Stromwechseln', () => {
    expect(CAPE_STREAM_SPRINGS).toHaveLength(13)
    expect(streamAtHour(CAPE_STREAM_SPRINGS, 0)).toBe(CAPE_STREAM_SPRINGS[6])
    expect(streamAtHour(CAPE_STREAM_SPRINGS, -1.5)).toBeCloseTo((3.4 + 3.1) / 2)
    expect(streamAtHour(CAPE_STREAM_SPRINGS, 9)).toBe(CAPE_STREAM_SPRINGS[12])
  })
  it('Abfahrt bei HW: Ankunft HW+2 im Stillwasser; Abfahrt HW−4: Race gegen den Wind', () => {
    const s = CAPE_SCENARIO
    const slack = arrivalHour(0, s.distanceNm, s.stwKn)
    expect(slack).toBe(2)
    expect(Math.abs(streamAtHour(CAPE_STREAM_SPRINGS, slack))).toBeLessThanOrEqual(1)
    const early = streamAtHour(CAPE_STREAM_SPRINGS, arrivalHour(-4, s.distanceNm, s.stwKn))
    expect(early).toBeGreaterThan(1)
    expect(windOverWater(s.windFrom, s.windKn, 270, early).relation).toBe('against')
  })
  it('Fahrt über Grund und Routenwahl', () => {
    expect(sogAlongStream(6, -2.5)).toBe(3.5)
    expect(CAPE_ROUTES.filter((r) => r.correct)).toHaveLength(1)
  })
})

describe('Inhaltsprüfung 33–35', () => {
  it('Kettenformel einheitlich für Day und Coastal', () => {
    expect(anchorRode(5, 2.5, 4, 1.2)).toBeCloseTo(anchorChainLength(7.5, 1.2, 4))
  })
  it('Lernplan zählt Prüfungen nach lokalem Datum', () => {
    const local = new Date(2026, 10, 2, 0, 30) // 02.11. 00:30 Ortszeit
    const a: QuizAttempt = { id: 'x', date: local.toISOString(), mode: 'exam', durationSec: 60, answers: [], exam: { presetId: 'kurz', limitSec: 1800, percent: 80, passed: true } }
    const exam1 = { id: 'exam-1', kind: 'exam' as const, title: '', href: '' }
    expect(isDone(exam1, { completedLessons: [], learnedTerms: [], attempts: [a], planStart: dayKey(local), level: 'day-skipper' })).toBe(true)
  })
  it('neue Lektion ist eingebunden', () => {
    expect(COASTAL_LESSON_IDS).toContain('tidal-races')
    expect(curriculum('coastal-skipper').map((i) => i.id)).toContain('tidal-races')
    expect(QUESTION_BANK.filter((q) => q.topic === 'tidal-races')).toHaveLength(9)
  })
})
