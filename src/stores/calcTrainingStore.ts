import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { CourseLevel } from '@/types/learning'

export type CalcLevel = CourseLevel | 'all'

/**
 * Gewählter Ausbildungsbereich im Rechentraining. Liegt in einem eigenen Store, weil neben der Seite
 * auch die Seitenleiste (Kursmotiv unten) darauf reagiert.
 */
interface CalcTrainingState {
  level: CalcLevel
  setLevel: (level: CalcLevel) => void
}

export const useCalcTrainingStore = create<CalcTrainingState>()(
  persist((set) => ({ level: 'day-skipper', setLevel: (level) => set({ level }) }), {
    name: 'rya-nav-academy:calc-training',
    version: 1,
    storage: createJSONStorage(() => localStorage),
  }),
)
