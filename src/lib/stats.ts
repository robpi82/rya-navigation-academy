import type { QuestionStat, QuizAttempt, TermId } from '@/types/learning'

/** Datum als lokaler Schlüssel JJJJ-MM-TT */
export function dayKey(date: Date = new Date()): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function shiftDay(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number)
  return dayKey(new Date(y, m - 1, d + delta))
}

/**
 * Lernstreak: Anzahl aufeinanderfolgender Tage mit Aktivität bis heute.
 * Wurde heute noch nicht gelernt, zählt die Serie bis gestern (sie ist noch nicht gerissen).
 */
export function computeStreak(activeDays: string[], today: string = dayKey()): number {
  const set = new Set(activeDays)
  let cursor = set.has(today) ? today : shiftDay(today, -1)
  let streak = 0
  while (set.has(cursor)) {
    streak++
    cursor = shiftDay(cursor, -1)
  }
  return streak
}

export interface TopicStat {
  topic: TermId
  answered: number
  wrong: number
  errorRate: number
}

export function topicStats(attempts: QuizAttempt[], topics: TermId[]): TopicStat[] {
  return topics.map((topic) => {
    let answered = 0
    let wrong = 0
    for (const a of attempts)
      for (const ans of a.answers)
        if (ans.topic === topic) {
          answered++
          if (!ans.correct) wrong++
        }
    return { topic, answered, wrong, errorRate: answered ? wrong / answered : 0 }
  })
}

/** Fragen, deren letzte Antwort falsch war – Wiederholungsbedarf. */
export const questionsNeedingReview = (stats: Record<string, QuestionStat>): string[] =>
  Object.entries(stats)
    .filter(([, s]) => !s.lastCorrect)
    .map(([id]) => id)

export const attemptScore = (a: QuizAttempt): number =>
  a.answers.length ? a.answers.filter((x) => x.correct).length / a.answers.length : 0

/** Fehlerquote je Kategorie (z. B. Aufgabentyp); `categoryOf` ordnet eine Frage-ID ihrer Kategorie zu. */
export function errorRateBy<K extends string>(
  attempts: QuizAttempt[],
  keys: K[],
  categoryOf: (questionId: string) => K | undefined,
): { key: K; answered: number; wrong: number; errorRate: number }[] {
  return keys.map((key) => {
    let answered = 0
    let wrong = 0
    for (const a of attempts)
      for (const ans of a.answers)
        if (categoryOf(ans.questionId) === key) {
          answered++
          if (!ans.correct) wrong++
        }
    return { key, answered, wrong, errorRate: answered ? wrong / answered : 0 }
  })
}

/** Zeitreihe der letzten `days` Tage (ältester zuerst) mit Werten aus einer Tagestabelle. */
export function lastDays(values: Record<string, number>, days: number, today: string = dayKey()): { day: string; value: number }[] {
  const out: { day: string; value: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = shiftDay(today, -i)
    out.push({ day: d, value: values[d] ?? 0 })
  }
  return out
}
