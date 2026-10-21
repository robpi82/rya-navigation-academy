import { describe, expect, it } from 'vitest'
import { parseHash } from '@/hooks/useHashRoute'
import { DAY_LESSONS } from '@/modules/daylessons/DayLessonsPage'
import { LESSONS } from '@/modules/coastal/CoastalPage'
import { YACHT_LESSONS } from '@/modules/yachtmaster/YachtmasterPage'
import { TERM_BY_ID, TERM_IDS } from '@/data/glossary'
import { FORMULA_GROUPS } from '@/data/formulas'
import { CALC_SKILLS, skillOf } from '@/lib/calcSkills'
import { curriculum } from '@/lib/studyPlan'
import { levelReadiness, type ReadinessInput } from '@/lib/levelReadiness'
import { DAY_LESSON_IDS } from '@/data/lessonIds'
import { QUESTION_BANK } from '@/questions'
import type { CourseLevel, QuestionStat, QuizAttempt } from '@/types/learning'

const LESSON_IDS: Record<string, Set<string>> = {
  themen: new Set(DAY_LESSONS.map((l) => l.id)),
  coastal: new Set(LESSONS.map((l) => l.id)),
  yachtmaster: new Set(YACHT_LESSONS.map((l) => l.id)),
}

/** Zeigt ein App-Link auf etwas, das es gibt? */
function resolves(href: string): boolean {
  const r = parseHash(href) as { name: string; lessonId?: string; termId?: string }
  if (r.name === 'dashboard') return href === '#/' || href === '#'
  if (r.name in LESSON_IDS && r.lessonId) return LESSON_IDS[r.name].has(r.lessonId)
  if (r.name === 'glossary' && r.termId) return r.termId in TERM_BY_ID
  return true
}

describe('Inhaltsprüfung: alle Querverweise sind gültig', () => {
  it('Links in den Lektionen', () => {
    for (const l of [...DAY_LESSONS, ...LESSONS, ...YACHT_LESSONS]) for (const link of l.links ?? []) expect(resolves(link.href), `${l.id} → ${link.href}`).toBe(true)
  })
  it('Lernplan, Formelsammlung und Rechenarten', () => {
    const levels: CourseLevel[] = ['day-skipper', 'coastal-skipper', 'yachtmaster-offshore']
    for (const lv of levels) for (const i of curriculum(lv)) expect(resolves(i.href), i.href).toBe(true)
    for (const f of FORMULA_GROUPS.flatMap((g) => g.items)) expect(resolves(f.href), f.id).toBe(true)
    for (const s of CALC_SKILLS) expect(resolves(s.href), s.id).toBe(true)
  })
})

const empty: ReadinessInput = { completedLessons: [], learnedTerms: [], questionStats: {}, attempts: [], dueCards: 0 }

const exam = (i: number, percent: number): QuizAttempt => ({
  id: `e${i}`,
  date: `2026-10-0${i + 1}T10:00:00Z`,
  mode: 'exam',
  durationSec: 1800,
  answers: Array.from({ length: 20 }, (_, k) => ({ questionId: `q${k}`, topic: 'compass', correct: k < 17, given: 0 })),
  exam: { presetId: 'standard', limitSec: 3600, percent, passed: percent >= 70 },
})

describe('Was fehlt noch?', () => {
  it('am Anfang: alles offen, erste Schritte zeigen auf Glossar und Lektion', () => {
    const r = levelReadiness('day-skipper', empty)
    expect(r.verdict).toBe('early')
    expect(r.items.filter((i) => i.done).map((i) => i.area)).toEqual(['cards'])
    expect(r.steps[0].href).toBe(`#/glossar/${TERM_IDS[0]}`)
    expect(r.steps.map((s) => s.href)).toEqual([`#/glossar/${TERM_IDS[0]}`, '#/rechnen', '#/pruefung'])
    const afterTerms = levelReadiness('day-skipper', { ...empty, learnedTerms: [...TERM_IDS] })
    expect(afterTerms.steps[0].href).toBe(curriculum('day-skipper').find((i) => i.kind === 'lesson')!.href)
    expect(levelReadiness('coastal-skipper', empty).steps[0].href).toBe('#/coastal/tidal-height')
    expect(r.steps.length).toBeLessThanOrEqual(3)
  })
  it('alles erledigt: bereit, keine Schritte', () => {
    const stats: Record<string, QuestionStat> = Object.fromEntries(
      QUESTION_BANK.filter((q) => q.type === 'numeric' && q.level === 'day-skipper').map((q) => [q.id, { correct: 3, wrong: 0, lastCorrect: true, lastAnswered: '2026-10-01' }]),
    )
    const r = levelReadiness('day-skipper', { completedLessons: [...DAY_LESSON_IDS], learnedTerms: [...TERM_IDS], questionStats: stats, attempts: [exam(0, 85), exam(1, 85), exam(2, 85)], dueCards: 0 })
    expect(r.items.every((i) => i.done)).toBe(true)
    expect(r.verdict).toBe('ready')
    expect(r.steps).toEqual([])
  })
  it('schwache Rechenart wird mit Quote genannt; fällige Karten erscheinen', () => {
    const q = QUESTION_BANK.find((x) => x.type === 'numeric' && x.level === 'coastal-skipper')!
    const r = levelReadiness('coastal-skipper', { ...empty, questionStats: { [q.id]: { correct: 1, wrong: 3, lastCorrect: false, lastAnswered: '2026-10-01' } }, dueCards: 4 })
    const calc = r.items.find((i) => i.area === 'calc')!
    expect(calc.done).toBe(false)
    expect(calc.detail).toContain('1 unter 70 %')
    expect(r.items.find((i) => i.area === 'cards')!.done).toBe(false)
    const steps = levelReadiness('coastal-skipper', { ...empty, completedLessons: LESSONS.map((l) => l.id), questionStats: { [q.id]: { correct: 1, wrong: 3, lastCorrect: false, lastAnswered: '' } } }).steps
    expect(steps[0].text).toContain(skillOf(q)!.label)
    expect(steps[0].text).toContain('25 %')
  })
  it('Yachtmaster nutzt die Yachtmaster-Lektionen', () => {
    const r = levelReadiness('yachtmaster-offshore', empty)
    expect(r.items[0].detail).toBe(`0/${YACHT_LESSONS.length} abgeschlossen`)
    expect(r.items[0].href).toBe('#/yachtmaster')
  })
})
