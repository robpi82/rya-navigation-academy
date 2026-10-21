import { TERM_BY_ID, TERM_IDS } from '@/data/glossary'
import { QUESTION_BANK } from '@/questions'
import type { CourseLevel, QuestionStat, QuizAttempt, TermId } from '@/types/learning'
import { isCalcQuestion, skillStats } from './calcSkills'
import { readiness } from './examInsights'
import { curriculum } from './studyPlan'

/**
 * „Was fehlt noch?“ je Ausbildungsstufe: führt Lektionen, Rechentraining, Probeprüfungen und Lernkarten zu einer
 * Checkliste mit konkreten nächsten Schritten zusammen.
 */
export type ReadinessArea = 'lessons' | 'calc' | 'exam' | 'cards'
export type LevelVerdict = 'ready' | 'close' | 'early'

export interface ReadinessItem {
  area: ReadinessArea
  label: string
  done: boolean
  detail: string
  href: string
}

export interface NextStep {
  text: string
  href: string
}

export interface LevelReadiness {
  items: ReadinessItem[]
  steps: NextStep[]
  verdict: LevelVerdict
}

export interface ReadinessInput {
  completedLessons: string[]
  learnedTerms: TermId[]
  questionStats: Record<string, QuestionStat>
  attempts: QuizAttempt[]
  /** fällige Lernkarten (stufenübergreifend) */
  dueCards: number
}

/** Mindestquote je Rechenart */
export const CALC_TARGET = 0.7

/** Lektionen einer Stufe in der empfohlenen Lernreihenfolge des Lernplans. */
const lessonsOf = (level: CourseLevel) => curriculum(level).filter((i) => i.kind === 'lesson')

export function levelReadiness(level: CourseLevel, input: ReadinessInput): LevelReadiness {
  const steps: NextStep[] = []

  // Lektionen (bei Day Skipper zusätzlich die neun Grundbegriffe)
  const lessons = lessonsOf(level)
  const openLessons = lessons.filter((l) => !input.completedLessons.includes(l.id))
  const openTerms = level === 'day-skipper' ? TERM_IDS.filter((t) => !input.learnedTerms.includes(t)) : []
  const lessonsDone = openLessons.length === 0 && openTerms.length === 0
  // Höchstens ein Schritt je Bereich, damit die Empfehlungen breit bleiben
  if (openTerms.length) steps.push({ text: `Begriff „${TERM_BY_ID[openTerms[0]].german}“ lernen (${openTerms.length} offen)`, href: `#/glossar/${openTerms[0]}` })
  else if (openLessons.length) steps.push({ text: `Lektion „${openLessons[0].title}“ abschließen (${openLessons.length} offen)`, href: openLessons[0].href })
  const lessonItem: ReadinessItem = {
    area: 'lessons',
    label: 'Lektionen',
    done: lessonsDone,
    detail: `${lessons.length - openLessons.length}/${lessons.length} abgeschlossen${level === 'day-skipper' ? `, ${TERM_IDS.length - openTerms.length}/${TERM_IDS.length} Begriffe` : ''}`,
    href: lessons[0].href.replace(/\/[^/]+$/, ''),
  }

  // Rechenarten
  const stats = skillStats(QUESTION_BANK.filter(isCalcQuestion).filter((q) => q.level === level), input.questionStats)
  const weak = stats.filter((s) => s.accuracy !== null && s.accuracy < CALC_TARGET).sort((a, b) => a.accuracy! - b.accuracy!)
  const untested = stats.filter((s) => s.accuracy === null)
  if (weak.length) steps.push({ text: `Rechenart „${weak[0].skill.label}“ üben (${Math.round(weak[0].accuracy! * 100)} %)`, href: '#/rechnen' })
  else if (untested.length) steps.push({ text: `Rechenart „${untested[0].skill.label}“ ausprobieren`, href: '#/rechnen' })
  const calcParts = [weak.length ? `${weak.length} unter ${Math.round(CALC_TARGET * 100)} %` : '', untested.length ? `${untested.length} noch nicht geübt` : ''].filter(Boolean)
  const calcItem: ReadinessItem = {
    area: 'calc',
    label: 'Rechenarten',
    done: weak.length === 0 && untested.length === 0,
    detail: calcParts.length ? calcParts.join(', ') : `alle ${stats.length} bei mindestens ${Math.round(CALC_TARGET * 100)} %`,
    href: '#/rechnen',
  }

  // Probeprüfungen
  const exam = readiness(input.attempts, level)
  if (exam.status !== 'ready') steps.push({ text: exam.status === 'none' ? 'Erste Probeprüfung ablegen' : 'Weitere Probeprüfung ablegen', href: '#/pruefung' })
  const examItem: ReadinessItem = {
    area: 'exam',
    label: 'Probeprüfungen',
    done: exam.status === 'ready',
    detail: exam.recentAverage === null ? 'noch keine' : `Schnitt ${Math.round(exam.recentAverage)} % aus ${exam.examsCounted}`,
    href: '#/pruefung',
  }

  // Lernkarten
  if (input.dueCards > 0) steps.push({ text: `${input.dueCards} fällige Lernkarten wiederholen`, href: '#/lernkarten' })
  const cardItem: ReadinessItem = { area: 'cards', label: 'Lernkarten', done: input.dueCards === 0, detail: input.dueCards ? `${input.dueCards} fällig` : 'nichts fällig', href: '#/lernkarten' }

  const items = [lessonItem, calcItem, examItem, cardItem]
  const doneCount = items.filter((i) => i.done).length
  const verdict: LevelVerdict = doneCount === items.length ? 'ready' : exam.status === 'close' || exam.status === 'ready' || doneCount >= 3 ? 'close' : 'early'
  return { items, steps: steps.slice(0, 3), verdict }
}
