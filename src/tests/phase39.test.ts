import { describe, expect, it } from 'vitest'
import { CALC_SKILLS, pickCalcQuestions, priority, skillOf, skillStats } from '@/lib/calcSkills'
import { FORMULA_GROUPS } from '@/data/formulas'
import { parseHash } from '@/hooks/useHashRoute'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'
import type { QuestionStat } from '@/types/learning'

const numeric = QUESTION_BANK.filter((q) => q.type === 'numeric')
const formulaIds = new Set(FORMULA_GROUPS.flatMap((g) => g.items.map((f) => f.id)))
const stat = (correct: number, wrong: number, lastCorrect: boolean): QuestionStat => ({ correct, wrong, lastCorrect, lastAnswered: '2026-10-01' })

describe('Rechenarten', () => {
  it('jede Rechenaufgabe hat eine Rechenart, Wissensfragen keine', () => {
    for (const q of numeric) expect(skillOf(q), q.id).not.toBeNull()
    expect(skillOf(QUESTION_BANK.find((q) => q.type === 'mc')!)).toBeNull()
  })
  it('jede Rechenart verweist auf eine vorhandene Formel und einen Bereich der App', () => {
    for (const s of CALC_SKILLS) {
      expect(formulaIds.has(s.formulaId), s.id).toBe(true)
      expect(parseHash(s.href).name, s.id).not.toBe('dashboard')
    }
  })
  it('genaue Angaben haben Vorrang: Kettenlänge ist Ankern, Wind über Wasser ist Wind', () => {
    const chain = numeric.find((q) => (q.verify as { kind: string; quantity?: string }).quantity === 'chain')!
    expect(skillOf(chain)!.id).toBe('anchoring')
    expect(skillOf(QUESTION_BY_ID['ct-001'])!.id).toBe('wind')
    expect(skillOf(QUESTION_BY_ID['ct-003'])!.id).toBe('streams')
  })
  it('jede Rechenart hat Aufgaben', () => {
    const stats = skillStats(numeric, {})
    expect(stats).toHaveLength(CALC_SKILLS.length)
    expect(stats.reduce((n, s) => n + s.available, 0)).toBe(numeric.length)
  })
})

describe('Statistik und Auswahl', () => {
  const [a, b, c, d] = numeric
  const stats = { [a.id]: stat(3, 1, true), [b.id]: stat(1, 1, false), [c.id]: stat(1, 2, true) }
  it('Trefferquote je Rechenart', () => {
    const s = skillStats([a], { [a.id]: stat(3, 1, true) }).find((x) => x.answered)!
    expect(s.accuracy).toBe(0.75)
  })
  it('Priorität: zuletzt falsch, neu, schwach, sicher', () => {
    expect(priority(b, stats)).toBe(0)
    expect(priority(d, stats)).toBe(1)
    expect(priority(c, stats)).toBe(2)
    expect(priority(a, stats)).toBe(3)
  })
  it('Schwächen zuerst ordnet nach Priorität, ohne bleibt es zufällig', () => {
    expect(pickCalcQuestions([a, b, c, d], stats, 4, true, () => 0.5).map((q) => q.id)).toEqual([b.id, d.id, c.id, a.id])
    expect(pickCalcQuestions([a, b, c, d], stats, 2, true)).toHaveLength(2)
    let i = 0
    const seq = [0.9, 0.1, 0.5, 0.3]
    expect(pickCalcQuestions([a, b, c, d], stats, 4, false, () => seq[i++]).map((q) => q.id)).toEqual([b.id, d.id, c.id, a.id])
  })
})

describe('Routen', () => {
  it('#/rechnen und #/formeln/<id>', () => {
    expect(parseHash('#/rechnen').name).toBe('calc')
    expect(parseHash('#/formeln/twelfths')).toEqual({ name: 'formulas', formulaId: 'twelfths' })
  })
})
