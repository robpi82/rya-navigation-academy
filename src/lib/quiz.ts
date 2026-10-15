import { angleDifference } from '@/calculations/angles'
import type { Question } from '@/types/learning'

/** Liest eine Zahleneingabe mit deutschem oder englischem Dezimaltrennzeichen. */
export function parseNumberInput(raw: string): number | null {
  const cleaned = raw.trim().replace(/[°\s]|kn|nm|min/gi, '').replace(',', '.')
  if (cleaned === '' || !/^-?\d*\.?\d+$/.test(cleaned)) return null
  const n = Number(cleaned)
  return Number.isFinite(n) ? n : null
}

/** Prüft eine Antwort. Bei Richtungsangaben wird die Toleranz über 000° hinweg berücksichtigt. */
export function isAnswerCorrect(q: Question, given: number | null): boolean {
  if (given === null) return false
  if (q.type === 'mc') return given === q.correctIndex
  const diff = q.isBearing ? Math.abs(angleDifference(q.answer, given)) : Math.abs(q.answer - given)
  return diff <= q.tolerance + 1e-9
}

/** Fisher-Yates-Mischen mit optional injizierbarem Zufallsgenerator (für Tests). */
export function shuffle<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const a = [...items]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Sekunden → mm:ss */
export function formatClock(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}
