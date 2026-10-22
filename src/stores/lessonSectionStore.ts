import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { useProgressStore } from './progressStore'

/**
 * Fortschritt innerhalb einer Lektion: welche Lernabschnitte als „verstanden“ markiert sind.
 * Eigener Speicher neben dem Lektionsfortschritt (progressStore.completedLessons), damit beide unabhängig bleiben;
 * über das Präfix „rya-nav-academy:“ ist er automatisch Teil der Datensicherung.
 */
interface LessonSectionState {
  /** verstandene Abschnitts-IDs je Lektions-ID */
  sections: Record<string, string[]>
  toggleSection: (lessonId: string, sectionId: string) => void
  reset: () => void
}

export const useLessonSectionStore = create<LessonSectionState>()(
  persist(
    (set) => ({
      sections: {},
      toggleSection: (lessonId, sectionId) => {
        set((s) => {
          const done = s.sections[lessonId] ?? []
          return {
            sections: {
              ...s.sections,
              [lessonId]: done.includes(sectionId) ? done.filter((x) => x !== sectionId) : [...done, sectionId],
            },
          }
        })
        // zählt wie andere Lernaktionen als aktiver Tag (Lernserie im Dashboard)
        useProgressStore.getState().markActive()
      },
      reset: () => set({ sections: {} }),
    }),
    { name: 'rya-nav-academy:lesson-sections', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
)

const EMPTY: string[] = []

/** Verstandene Abschnitte einer Lektion (stabile Referenz, auch wenn noch nichts gespeichert ist). */
export const useLessonSections = (lessonId: string) => useLessonSectionStore((s) => s.sections[lessonId] ?? EMPTY)
