import { describe, expect, it } from 'vitest'
import { QUESTION_BANK } from '@/questions'
import { GLOSSARY, TERM_IDS } from '@/data/glossary'
import { simulate } from '@/calculations'
import { isAnswerCorrect, parseNumberInput, shuffle } from '@/lib/quiz'

describe('Fragenkatalog', () => {
  it('enthält mindestens 15 Fragen mit eindeutigen IDs', () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(15)
    expect(new Set(QUESTION_BANK.map((q) => q.id)).size).toBe(QUESTION_BANK.length)
  })

  it('jede Frage hat Musterlösung, Erklärung, gültiges Thema und Schwierigkeitsgrad', () => {
    for (const q of QUESTION_BANK) {
      expect(q.prompt.length, q.id).toBeGreaterThan(10)
      expect(q.solution.length, q.id).toBeGreaterThan(0)
      expect(q.steps.length, q.id).toBeGreaterThan(0)
      expect(TERM_IDS, q.id).toContain(q.topic)
      expect([1, 2, 3], q.id).toContain(q.difficulty)
      if (q.type === 'mc') {
        expect(q.correctIndex, q.id).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex, q.id).toBeLessThan(q.options.length)
        expect(new Set(q.options).size, q.id).toBe(q.options.length)
      }
    }
  })

  it('numerische Musterlösungen stimmen mit den Berechnungsfunktionen überein', () => {
    for (const q of QUESTION_BANK) {
      if (q.type !== 'numeric' || !q.verify) continue
      const r = simulate(q.verify)
      const computed = {
        cog: r.cog,
        sog: r.sog,
        waterTrack: r.waterTrack,
        distanceOverGround: r.distanceOverGround,
      }[q.verify.quantity]
      expect(computed, q.id).not.toBeNull()
      expect(isAnswerCorrect(q, computed!), `${q.id}: berechnet ${computed}`).toBe(true)
    }
  })

  it('Glossar-Verständnisfragen sind gültig', () => {
    expect(GLOSSARY).toHaveLength(9)
    for (const t of GLOSSARY) {
      expect(t.check.correctIndex).toBeLessThan(t.check.options.length)
      expect(t.confusions.length).toBeGreaterThan(0)
    }
  })
})

describe('Antwortprüfung', () => {
  it('liest deutsche und englische Dezimalzahlen', () => {
    expect(parseNumberInput('5,39')).toBeCloseTo(5.39)
    expect(parseNumberInput('021.8°')).toBeCloseTo(21.8)
    expect(parseNumberInput('4,5 kn')).toBeCloseTo(4.5)
    expect(parseNumberInput('abc')).toBeNull()
    expect(parseNumberInput('')).toBeNull()
  })

  it('Richtungstoleranz gilt über 000° hinweg', () => {
    const q = QUESTION_BANK.find((x) => x.id === 'ds-006')!
    expect(isAnswerCorrect(q, 3)).toBe(true)
    expect(isAnswerCorrect(q, 363)).toBe(true)
    expect(isAnswerCorrect(q, 355)).toBe(false)
  })

  it('shuffle behält alle Elemente', () => {
    const s = shuffle([1, 2, 3, 4, 5])
    expect([...s].sort()).toEqual([1, 2, 3, 4, 5])
  })
})
