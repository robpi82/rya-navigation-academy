/**
 * Spaced Repetition – vereinfachte Variante des SM-2-Algorithmus (SuperMemo/Anki).
 *
 * Jede Karte hat einen Leichtigkeitsfaktor (ease, Start 2,5), ein Intervall in Tagen und einen Fälligkeitstermin.
 *  - Nicht gewusst: Karte beginnt von vorn (Intervall 0 → heute erneut), ease − 0,20
 *  - Schwer:        Intervall × 1,2 (mind. 1 Tag),                         ease − 0,15
 *  - Gut:           1 Tag → 3 Tage → Intervall × ease
 *  - Sehr leicht:   4 Tage bzw. Intervall × ease × 1,3,                     ease + 0,15
 * ease bleibt im Bereich 1,3 … 3,0. Schwierige Karten bekommen dadurch kürzere Intervalle
 * und werden häufiger wiederholt.
 */
export type Grade = 0 | 1 | 2 | 3

export const GRADE_LABELS: Record<Grade, string> = {
  0: 'Nicht gewusst',
  1: 'Schwer',
  2: 'Gut',
  3: 'Sehr leicht',
}

export interface CardState {
  ease: number
  /** Intervall in Tagen */
  interval: number
  /** erfolgreiche Wiederholungen in Folge */
  reps: number
  lapses: number
  /** Fälligkeit als ISO-Zeitstempel */
  due: string
  lastReviewed: string | null
}

export const MIN_EASE = 1.3
export const MAX_EASE = 3.0
const DAY_MS = 86_400_000

export const newCardState = (now: Date = new Date()): CardState => ({
  ease: 2.5,
  interval: 0,
  reps: 0,
  lapses: 0,
  due: now.toISOString(),
  lastReviewed: null,
})

const clampEase = (e: number) => Math.min(MAX_EASE, Math.max(MIN_EASE, Math.round(e * 100) / 100))

/** Berechnet den neuen Zustand einer Karte nach einer Bewertung. */
export function review(state: CardState, grade: Grade, now: Date = new Date()): CardState {
  let { ease, interval, reps, lapses } = state
  switch (grade) {
    case 0:
      reps = 0
      lapses += 1
      interval = 0
      ease = clampEase(ease - 0.2)
      break
    case 1:
      interval = Math.max(1, Math.round(interval * 1.2))
      reps += 1
      ease = clampEase(ease - 0.15)
      break
    case 2:
      interval = reps === 0 ? 1 : reps === 1 ? Math.max(3, interval + 1) : Math.round(interval * ease)
      reps += 1
      break
    case 3:
      interval = reps === 0 ? 4 : Math.max(interval + 1, Math.round(interval * ease * 1.3))
      reps += 1
      ease = clampEase(ease + 0.15)
      break
  }
  return {
    ease,
    interval,
    reps,
    lapses,
    due: new Date(now.getTime() + interval * DAY_MS).toISOString(),
    lastReviewed: now.toISOString(),
  }
}

export const isDue = (state: CardState | undefined, now: Date = new Date()): boolean =>
  !state || new Date(state.due).getTime() <= now.getTime()

/** Eine Karte gilt als „gefestigt", wenn ihr Intervall mindestens 7 Tage beträgt. */
export const isMastered = (state: CardState | undefined): boolean => !!state && state.interval >= 7

/** Lesbare Vorschau des nächsten Intervalls */
export function formatInterval(days: number): string {
  if (days <= 0) return 'gleich'
  if (days === 1) return '1 Tag'
  if (days < 30) return `${days} Tage`
  const months = Math.round(days / 30)
  return months === 1 ? '1 Monat' : `${months} Monate`
}

/**
 * Stellt die Lernsitzung zusammen: zuerst fällige Karten (am längsten überfällige zuerst,
 * bei Gleichstand die schwierigsten), danach bis zu `newLimit` neue Karten.
 */
export function buildSession(
  cardIds: string[],
  states: Record<string, CardState>,
  newLimit: number,
  now: Date = new Date(),
): string[] {
  const due = cardIds
    .filter((id) => states[id] && isDue(states[id], now))
    .sort((a, b) => {
      const d = new Date(states[a].due).getTime() - new Date(states[b].due).getTime()
      return d !== 0 ? d : states[a].ease - states[b].ease
    })
  const fresh = cardIds.filter((id) => !states[id]).slice(0, newLimit)
  return [...due, ...fresh]
}
