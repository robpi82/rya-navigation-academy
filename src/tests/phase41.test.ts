import { describe, expect, it } from 'vitest'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'
import type { MultipleChoiceQuestion } from '@/types/learning'

const mcs = QUESTION_BANK.filter((q): q is MultipleChoiceQuestion => q.type === 'mc')
const lengths = (q: MultipleChoiceQuestion) => q.options.map((o) => o.length)
const others = (q: MultipleChoiceQuestion) => lengths(q).filter((_, i) => i !== q.correctIndex)

describe('Antwortlänge verrät nichts (alle Fragen)', () => {
  it('die richtige Antwort ist nie länger als die längste falsche', () => {
    for (const q of mcs) expect(lengths(q)[q.correctIndex], q.id).toBeLessThanOrEqual(Math.max(...others(q)))
  })
  it('kein umgekehrter Hinweis: die richtige ist nur selten die kürzeste', () => {
    const shortest = mcs.filter((q) => lengths(q)[q.correctIndex] < Math.min(...others(q))).length
    expect(shortest / mcs.length).toBeLessThan(0.25)
  })
  it('die richtige Antwort steht auf allen vier Plätzen etwa gleich oft', () => {
    const pos = [0, 0, 0, 0]
    for (const q of mcs) pos[q.correctIndex]++
    for (const n of pos) expect(n / mcs.length).toBeGreaterThan(0.12)
  })
  it('vier verschiedene Antworten je Frage', () => {
    for (const q of mcs) expect(new Set(q.options).size, q.id).toBe(4)
  })
})

describe('Fachliche Korrekturen', () => {
  it('Nordtonne steht nördlich der Gefahr', () => {
    expect(QUESTION_BY_ID['dt-053'].steps.join(' ')).toContain('Nordseite der Gefahr')
  })
  it('„Gale“ = ab Bft 8, kein überlappender Ablenker', () => {
    const q = QUESTION_BY_ID['ye-027'] as MultipleChoiceQuestion
    expect(q.options).not.toContain('Bft 12')
  })
})
