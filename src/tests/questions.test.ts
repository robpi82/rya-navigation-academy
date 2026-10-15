import { describe, expect, it } from 'vitest'
import { QUESTION_BANK } from '@/questions'
import { GLOSSARY, TERM_IDS } from '@/data/glossary'
import { courseToSteer, distanceFrom, simulate, speedFrom, timeFrom } from '@/calculations'
import { isAnswerCorrect, parseNumberInput, shuffle } from '@/lib/quiz'
import type { QuestionVerify } from '@/types/learning'

function compute(v: QuestionVerify): number | null {
  switch (v.kind) {
    case 'sim': {
      const r = simulate(v)
      return r[v.quantity]
    }
    case 'cts': {
      const r = courseToSteer(v)
      if (!r.feasible) return null
      if (v.quantity === 'cts') return r.courseToSteer
      if (v.quantity === 'sog') return r.sog
      return r.timeHours === null ? null : r.timeHours * 60
    }
    case 'dst': {
      if (v.quantity === 'distance') return distanceFrom(v.speed!, v.minutes! / 60)
      if (v.quantity === 'speed') return speedFrom(v.distance!, v.minutes! / 60)
      const h = timeFrom(v.distance!, v.speed!)
      return h === null ? null : h * 60
    }
  }
}

describe('Fragenkatalog', () => {
  it('enthält mindestens 50 Fragen mit eindeutigen IDs', () => {
    expect(QUESTION_BANK.length).toBeGreaterThanOrEqual(50)
    expect(new Set(QUESTION_BANK.map((q) => q.id)).size).toBe(QUESTION_BANK.length)
  })

  it('deckt alle neun Begriffe und alle Fragetypen ab', () => {
    for (const t of TERM_IDS) expect(QUESTION_BANK.some((q) => q.topic === t), t).toBe(true)
    for (const c of ['concept', 'calculation', 'course', 'diagram', 'error', 'matching'])
      expect(QUESTION_BANK.some((q) => q.category === c), c).toBe(true)
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
      if (q.type === 'match') {
        expect(q.pairs.length, q.id).toBeGreaterThanOrEqual(3)
        expect(new Set(q.pairs.map((p) => p.right)).size, q.id).toBe(q.pairs.length)
        expect(new Set(q.pairs.map((p) => p.left)).size, q.id).toBe(q.pairs.length)
      }
    }
  })

  it('numerische Musterlösungen stimmen mit den Berechnungsfunktionen überein', () => {
    let checked = 0
    for (const q of QUESTION_BANK) {
      if (q.type !== 'numeric' || !q.verify) continue
      const computed = compute(q.verify)
      expect(computed, q.id).not.toBeNull()
      expect(isAnswerCorrect(q, computed!), `${q.id}: berechnet ${computed}, Musterlösung ${q.answer}`).toBe(true)
      checked++
    }
    expect(checked).toBeGreaterThanOrEqual(20)
  })

  it('alle Berechnungsaufgaben sind maschinell überprüft', () => {
    for (const q of QUESTION_BANK) if (q.type === 'numeric') expect(q.verify, q.id).toBeDefined()
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

  it('Zuordnung ist nur bei vollständig richtiger Zuordnung korrekt', () => {
    const q = QUESTION_BANK.find((x) => x.type === 'match')!
    const n = q.type === 'match' ? q.pairs.length : 0
    const right = Array.from({ length: n }, (_, i) => i)
    expect(isAnswerCorrect(q, right)).toBe(true)
    expect(isAnswerCorrect(q, [...right].reverse())).toBe(false)
    expect(isAnswerCorrect(q, right.slice(1))).toBe(false)
    expect(isAnswerCorrect(q, 0)).toBe(false)
  })

  it('shuffle behält alle Elemente', () => {
    const s = shuffle([1, 2, 3, 4, 5])
    expect([...s].sort()).toEqual([1, 2, 3, 4, 5])
  })
})
