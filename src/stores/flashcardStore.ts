import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { newCardState, review, type CardState, type Grade } from '@/lib/spacedRepetition'
import { dayKey } from '@/lib/stats'
import { useProgressStore } from './progressStore'

export interface ReviewLogEntry {
  cardId: string
  grade: Grade
  date: string
}

interface FlashcardState {
  cards: Record<string, CardState>
  log: ReviewLogEntry[]
  /** neue Karten pro Sitzung */
  newPerSession: number
  rate: (cardId: string, grade: Grade) => void
  setNewPerSession: (n: number) => void
  reset: () => void
}

export const useFlashcardStore = create<FlashcardState>()(
  persist(
    (set) => ({
      cards: {},
      log: [],
      newPerSession: 5,
      rate: (cardId, grade) => {
        const now = new Date()
        set((s) => ({
          cards: { ...s.cards, [cardId]: review(s.cards[cardId] ?? newCardState(now), grade, now) },
          log: [...s.log, { cardId, grade, date: now.toISOString() }].slice(-2000),
        }))
        useProgressStore.getState().markActive()
      },
      setNewPerSession: (n) => set({ newPerSession: n }),
      reset: () => set({ cards: {}, log: [] }),
    }),
    { name: 'rya-nav-academy:flashcards', version: 1, storage: createJSONStorage(() => localStorage) },
  ),
)

/** Anzahl Bewertungen je Tag (für Statistiken) */
export function reviewsPerDay(log: ReviewLogEntry[]): Record<string, number> {
  const out: Record<string, number> = {}
  for (const e of log) {
    const k = dayKey(new Date(e.date))
    out[k] = (out[k] ?? 0) + 1
  }
  return out
}
