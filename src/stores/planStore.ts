import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CourseLevel } from '@/types/learning'

/** Einstellungen des Lernplans (Stufe, Start, Prüfungstermin, Lerneinheiten pro Woche). */
export interface PlanSettings {
  level: CourseLevel
  start: string
  exam: string
  sessionsPerWeek: number
  /** beim Neuverteilen: schon erledigte Punkte, die nicht mehr eingeplant werden */
  exclude?: string[]
  /** ab wann Probeprüfungen und Wiederholungen zählen (Beginn des ersten Plans) */
  countFrom?: string
}

interface PlanState {
  plan: PlanSettings | null
  setPlan: (p: PlanSettings) => void
  clear: () => void
}

export const usePlanStore = create<PlanState>()(
  persist(
    (set) => ({
      plan: null,
      setPlan: (plan) => set({ plan }),
      clear: () => set({ plan: null }),
    }),
    { name: 'rya-nav-academy:plan', storage: createJSONStorage(() => localStorage), version: 1 },
  ),
)
