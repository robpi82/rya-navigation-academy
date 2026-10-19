import { hashString, seededRandom } from '@/lib/exam'
import { shuffle } from '@/lib/quiz'

/** Stabile Reihenfolge der rechten Seite einer Zuordnungsaufgabe (gleich bei jedem Aufruf derselben Prüfung). */
export const buildOrder = (questionId: string, size: number, seed: number): number[] =>
  shuffle(Array.from({ length: size }, (_, i) => i), seededRandom(hashString(questionId) ^ seed))
