import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { ExamAnswer } from '@/lib/exam'

/** Laufende oder abgeschlossene Probeprüfung. Läuft über Neuladen hinweg weiter (Startzeit wird gespeichert). */
export interface ExamSession {
  presetId: string
  questionIds: string[]
  seed: number
  startedAt: number
  limitSec: number
  answers: ExamAnswer[]
  flags: boolean[]
  index: number
  submittedAt?: number
}

interface ExamState {
  session: ExamSession | null
  start: (s: Omit<ExamSession, 'answers' | 'flags' | 'index'>) => void
  setAnswer: (i: number, a: ExamAnswer) => void
  toggleFlag: (i: number) => void
  goTo: (i: number) => void
  submit: (at: number) => void
  clear: () => void
}

export const useExamStore = create<ExamState>()(
  persist(
    (set) => ({
      session: null,
      start: (s) => set({ session: { ...s, answers: s.questionIds.map(() => null), flags: s.questionIds.map(() => false), index: 0 } }),
      setAnswer: (i, a) => set((st) => (st.session && !st.session.submittedAt ? { session: { ...st.session, answers: st.session.answers.map((x, j) => (j === i ? a : x)) } } : st)),
      toggleFlag: (i) => set((st) => (st.session ? { session: { ...st.session, flags: st.session.flags.map((x, j) => (j === i ? !x : x)) } } : st)),
      goTo: (i) => set((st) => (st.session ? { session: { ...st.session, index: Math.min(Math.max(0, i), st.session.questionIds.length - 1) } } : st)),
      submit: (at) => set((st) => (st.session && !st.session.submittedAt ? { session: { ...st.session, submittedAt: at } } : st)),
      clear: () => set({ session: null }),
    }),
    { name: 'rya-exam', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
