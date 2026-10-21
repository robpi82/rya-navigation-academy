import type { QuizAttempt, TopicId } from '@/types/learning'
import { COASTAL_TOPICS, DAY_TOPICS, YACHT_TOPICS } from '@/data/topics'
import { EXAM_GROUPS, PASS_PERCENT, groupOf, type ExamGroupId } from './exam'

/**
 * Auswertung der Probeprüfungen und aller beantworteten Fragen: Wo liegen Stärken und Schwächen, ist man prüfungsreif?
 * Die Bewertung ist eine eigene, einfache Heuristik – keine offizielle Einschätzung.
 */

export interface GroupPerformance {
  group: ExamGroupId
  label: string
  correct: number
  total: number
  percent: number
}

/** Trefferquote je Themengruppe über alle Probeprüfungen (Day Skipper). */
export function groupPerformance(attempts: QuizAttempt[]): GroupPerformance[] {
  const acc = new Map<ExamGroupId, { correct: number; total: number }>()
  for (const a of attempts) {
    if (!a.exam) continue
    for (const r of a.answers) {
      const g = groupOf(r.topic)
      const v = acc.get(g) ?? { correct: 0, total: 0 }
      v.total++
      if (r.correct) v.correct++
      acc.set(g, v)
    }
  }
  return (Object.keys(EXAM_GROUPS) as ExamGroupId[])
    .filter((g) => acc.has(g))
    .map((g) => {
      const v = acc.get(g)!
      return { group: g, label: EXAM_GROUPS[g].label, ...v, percent: (v.correct / v.total) * 100 }
    })
}

export interface TopicWeakness {
  topic: TopicId
  answered: number
  wrong: number
  /** Fehlerquote der jüngsten Antworten (0–1) */
  errorRate: number
}

/**
 * Schwächste Themen nach den jüngsten Antworten (Übungs- und Prüfungsmodus).
 * Je Thema zählen die letzten `window` Antworten; Themen mit weniger als `minAnswers` Antworten bleiben außen vor.
 */
export function weakestTopics(attempts: QuizAttempt[], { window = 10, minAnswers = 4, limit = 3, maxErrorRate = 0.25 } = {}): TopicWeakness[] {
  const recent = new Map<TopicId, boolean[]>()
  const sorted = [...attempts].sort((a, b) => a.date.localeCompare(b.date))
  for (const a of sorted)
    for (const r of a.answers) {
      const list = recent.get(r.topic) ?? []
      list.push(r.correct)
      if (list.length > window) list.shift()
      recent.set(r.topic, list)
    }
  const out: TopicWeakness[] = []
  for (const [topic, list] of recent) {
    if (list.length < minAnswers) continue
    const wrong = list.filter((c) => !c).length
    const errorRate = wrong / list.length
    if (errorRate > maxErrorRate) out.push({ topic, answered: list.length, wrong, errorRate })
  }
  return out.sort((a, b) => b.errorRate - a.errorRate || b.answered - a.answered).slice(0, limit)
}

export type Readiness = 'none' | 'early' | 'close' | 'ready'

export interface ReadinessResult {
  status: Readiness
  /** Durchschnitt der letzten bis zu drei Day-Skipper-Probeprüfungen */
  recentAverage: number | null
  examsCounted: number
  message: string
}

/** Prüfungsreife: die letzten drei Day-Skipper-Probeprüfungen mit mindestens 20 Fragen. */
export function readiness(attempts: QuizAttempt[]): ReadinessResult {
  const exams = attempts.filter((a) => a.exam && a.exam.presetId !== 'coastal' && a.exam.presetId !== 'yacht' && a.answers.length >= 20).slice(-3)
  if (exams.length === 0) return { status: 'none', recentAverage: null, examsCounted: 0, message: 'Noch keine Day-Skipper-Probeprüfung abgelegt. Starte einen Kurztest, um deinen Stand zu sehen.' }
  const avg = exams.reduce((s, a) => s + a.exam!.percent, 0) / exams.length
  const allPassed = exams.every((a) => a.exam!.passed)
  if (exams.length >= 3 && allPassed && avg >= PASS_PERCENT + 10)
    return { status: 'ready', recentAverage: avg, examsCounted: exams.length, message: 'Die letzten drei Probeprüfungen sicher bestanden – du bist gut vorbereitet.' }
  if (avg >= PASS_PERCENT)
    return { status: 'close', recentAverage: avg, examsCounted: exams.length, message: exams.length < 3 ? 'Die Ergebnisse liegen im Schnitt an oder über der Grenze. Lege weitere Probeprüfungen ab, um das zu bestätigen.' : 'Knapp über der Grenze – arbeite gezielt an den schwächsten Themen.' }
  return { status: 'early', recentAverage: avg, examsCounted: exams.length, message: 'Noch unter der Bestehensgrenze. Übe die schwächsten Themen und wiederhole die Lektionen.' }
}

/** Lektion und gezielte Übung zu einem Thema. */
export function topicLinks(topic: TopicId): { lesson: string; quiz: string } {
  const quiz = `#/quiz/thema/${topic}`
  if (topic in DAY_TOPICS) return { lesson: `#/themen/${topic}`, quiz }
  if (topic in COASTAL_TOPICS) return { lesson: `#/coastal/${topic}`, quiz }
  if (topic in YACHT_TOPICS) return { lesson: `#/yachtmaster/${topic}`, quiz }
  return { lesson: `#/glossar/${topic}`, quiz }
}
