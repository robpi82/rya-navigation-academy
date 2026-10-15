import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { QuestionStat, QuizAttempt, TermId } from '@/types/learning'
import { dayKey } from '@/lib/stats'

interface ProgressState {
  viewedTerms: TermId[]
  learnedTerms: TermId[]
  /** Ergebnis der Verständnisfrage je Begriff */
  termChecks: Partial<Record<TermId, boolean>>
  attempts: QuizAttempt[]
  questionStats: Record<string, QuestionStat>
  /** Lernzeit in Sekunden je Tag (JJJJ-MM-TT) */
  studySeconds: Record<string, number>
  activeDays: string[]

  markViewed: (id: TermId) => void
  toggleLearned: (id: TermId) => void
  recordTermCheck: (id: TermId, correct: boolean) => void
  recordAttempt: (attempt: QuizAttempt) => void
  addStudyTime: (seconds: number) => void
  markActive: () => void
  reset: () => void
}

const initial = {
  viewedTerms: [] as TermId[],
  learnedTerms: [] as TermId[],
  termChecks: {},
  attempts: [] as QuizAttempt[],
  questionStats: {},
  studySeconds: {},
  activeDays: [] as string[],
}

const withActiveDay = (days: string[]): string[] => {
  const today = dayKey()
  return days.includes(today) ? days : [...days, today]
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => ({
      ...initial,
      markViewed: (id) =>
        set((s) => (s.viewedTerms.includes(id) ? s : { viewedTerms: [...s.viewedTerms, id] })),
      toggleLearned: (id) =>
        set((s) => ({
          learnedTerms: s.learnedTerms.includes(id)
            ? s.learnedTerms.filter((t) => t !== id)
            : [...s.learnedTerms, id],
          activeDays: withActiveDay(s.activeDays),
        })),
      recordTermCheck: (id, correct) =>
        set((s) => ({ termChecks: { ...s.termChecks, [id]: correct }, activeDays: withActiveDay(s.activeDays) })),
      recordAttempt: (attempt) =>
        set((s) => {
          const stats = { ...s.questionStats }
          for (const a of attempt.answers) {
            const prev = stats[a.questionId] ?? { correct: 0, wrong: 0, lastCorrect: false, lastAnswered: '' }
            stats[a.questionId] = {
              correct: prev.correct + (a.correct ? 1 : 0),
              wrong: prev.wrong + (a.correct ? 0 : 1),
              lastCorrect: a.correct,
              lastAnswered: attempt.date,
            }
          }
          return {
            attempts: [...s.attempts, attempt].slice(-200),
            questionStats: stats,
            activeDays: withActiveDay(s.activeDays),
          }
        }),
      addStudyTime: (seconds) =>
        set((s) => {
          const key = dayKey()
          return {
            studySeconds: { ...s.studySeconds, [key]: (s.studySeconds[key] ?? 0) + seconds },
            activeDays: withActiveDay(s.activeDays),
          }
        }),
      markActive: () => set((s) => ({ activeDays: withActiveDay(s.activeDays) })),
      reset: () => set({ ...initial }),
    }),
    {
      name: 'rya-nav-academy:progress',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ viewedTerms, learnedTerms, termChecks, attempts, questionStats, studySeconds, activeDays }) => ({
        viewedTerms,
        learnedTerms,
        termChecks,
        attempts,
        questionStats,
        studySeconds,
        activeDays,
      }),
    },
  ),
)
