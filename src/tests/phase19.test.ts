import { describe, expect, it } from 'vitest'
import { groupPerformance, readiness, topicLinks, weakestTopics } from '@/lib/examInsights'
import { parseHash } from '@/hooks/useHashRoute'
import type { QuizAnswerRecord, QuizAttempt, TopicId } from '@/types/learning'

const ans = (topic: TopicId, correct: boolean, i = 0): QuizAnswerRecord => ({ questionId: `${topic}-${i}`, topic, correct, given: null })
const attempt = (date: string, answers: QuizAnswerRecord[], exam?: { percent: number; passed: boolean; presetId?: string }): QuizAttempt => ({
  id: date,
  date,
  mode: exam ? 'exam' : 'learn',
  durationSec: 60,
  answers,
  exam: exam ? { presetId: exam.presetId ?? 'standard', limitSec: 3600, percent: exam.percent, passed: exam.passed } : undefined,
})
const many = (topic: TopicId, correct: number, wrong: number) => [...Array.from({ length: correct }, (_, i) => ans(topic, true, i)), ...Array.from({ length: wrong }, (_, i) => ans(topic, false, 100 + i))]
const exam = (date: string, percent: number) => attempt(date, Array.from({ length: 20 }, (_, i) => ans('hdg', i < percent / 5, i)), { percent, passed: percent >= 70 })

describe('Gruppenauswertung', () => {
  it('zählt nur Probeprüfungen und fasst Themen zu Gruppen zusammen', () => {
    const g = groupPerformance([
      attempt('2026-01-01', [ans('compass', true), ans('bearings', false), ans('colregs', true)], { percent: 66, passed: false }),
      attempt('2026-01-02', [ans('compass', false)]),
    ])
    const compass = g.find((x) => x.group === 'compass')!
    expect(compass).toMatchObject({ correct: 1, total: 2, percent: 50 })
    expect(g.find((x) => x.group === 'rules')!.percent).toBe(100)
    expect(g.find((x) => x.group === 'basics')).toBeUndefined()
  })
})

describe('Schwächste Themen', () => {
  it('ordnet nach Fehlerquote und ignoriert Themen mit zu wenigen Antworten', () => {
    const w = weakestTopics([attempt('2026-01-01', [...many('tides', 2, 4), ...many('colregs', 3, 2), ...many('weather', 0, 3), ...many('compass', 5, 0)])])
    expect(w.map((x) => x.topic)).toEqual(['tides', 'colregs'])
    expect(w[0]).toMatchObject({ answered: 6, wrong: 4 })
  })
  it('berücksichtigt nur die jüngsten Antworten je Thema', () => {
    const old = attempt('2026-01-01', many('tides', 0, 10))
    const recent = attempt('2026-02-01', many('tides', 10, 0))
    expect(weakestTopics([recent, old])).toEqual([])
    expect(weakestTopics([old])[0].errorRate).toBe(1)
  })
})

describe('Prüfungsreife', () => {
  it('ohne Probeprüfung: keine Einschätzung', () => {
    expect(readiness([]).status).toBe('none')
    expect(readiness([attempt('2026-01-01', many('hdg', 5, 0))]).status).toBe('none')
  })
  it('unter 70 %: noch nicht reif; knapp darüber: auf gutem Weg; dreimal sicher bestanden: reif', () => {
    expect(readiness([exam('2026-01-01', 55)]).status).toBe('early')
    expect(readiness([exam('2026-01-01', 75)]).status).toBe('close')
    expect(readiness([exam('2026-01-01', 85), exam('2026-01-02', 80), exam('2026-01-03', 90)]).status).toBe('ready')
    expect(readiness([exam('2026-01-01', 95), exam('2026-01-02', 65), exam('2026-01-03', 95)]).status).toBe('close')
  })
  it('Coastal-, Yachtmaster- und Kurztests unter 20 Fragen zählen nicht', () => {
    const coastal = attempt('2026-01-01', Array.from({ length: 20 }, (_, i) => ans('tidal-height', true, i)), { percent: 100, passed: true, presetId: 'coastal' })
    const short = attempt('2026-01-02', Array.from({ length: 12 }, (_, i) => ans('hdg', true, i)), { percent: 100, passed: true })
    expect(readiness([coastal, short]).status).toBe('none')
  })
})

describe('Links zum gezielten Üben', () => {
  it('führen zur passenden Lektion und zum Trainer mit Themenvorauswahl', () => {
    expect(topicLinks('tides')).toEqual({ lesson: '#/themen/tides', quiz: '#/quiz/thema/tides' })
    expect(topicLinks('running-fix').lesson).toBe('#/coastal/running-fix')
    expect(topicLinks('great-circle').lesson).toBe('#/yachtmaster/great-circle')
    expect(topicLinks('hdg').lesson).toBe('#/glossar/hdg')
  })
  it('die Route #/quiz/thema/<id> wird erkannt', () => {
    expect(parseHash('#/quiz/thema/tides')).toEqual({ name: 'quiz', topic: 'tides' })
    expect(parseHash('#/quiz/wiederholen')).toEqual({ name: 'quiz', preset: 'review' })
  })
})
