import { describe, expect, it } from 'vitest'
import { QUESTION_BANK } from '@/questions'
import { DAY_TOPIC_IDS, COASTAL_TOPIC_IDS } from '@/data/topics'
import { DAY_LESSON_IDS } from '@/data/lessonIds'
import { EXAM_GROUPS, EXAM_PRESETS, PASS_PERCENT, buildExam, gradeExam, groupOf, groupQuotas, normalizeAnswer, remainingSeconds, seededRandom } from '@/lib/exam'
import { buildOrder } from '@/modules/exam/order'
import type { Question } from '@/types/learning'

describe('Prüfungsaufbau', () => {
  it('jede Vorgabe liefert genau die geforderte Fragenzahl ohne Doppelte', () => {
    for (const p of EXAM_PRESETS) {
      const exam = buildExam(p.questions, QUESTION_BANK, seededRandom(7))
      expect(exam).toHaveLength(p.questions)
      expect(new Set(exam.map((q) => q.id)).size).toBe(p.questions)
      expect(exam.every((q) => q.level === 'day-skipper')).toBe(true)
    }
  })
  it('ist mit gleichem Startwert reproduzierbar, mit anderem verschieden', () => {
    const a = buildExam(20, QUESTION_BANK, seededRandom(1)).map((q) => q.id)
    expect(buildExam(20, QUESTION_BANK, seededRandom(1)).map((q) => q.id)).toEqual(a)
    expect(buildExam(20, QUESTION_BANK, seededRandom(2)).map((q) => q.id)).not.toEqual(a)
  })
  it('hält die Gewichtung der Themengruppen ein', () => {
    const exam = buildExam(40, QUESTION_BANK, seededRandom(3))
    const count = (g: string) => exam.filter((q) => groupOf(q.topic) === g).length
    expect(count('basics')).toBe(10)
    expect(count('compass')).toBe(6)
    expect(count('tides')).toBe(10)
    expect(count('rules')).toBe(14)
    expect(count('coastal')).toBe(0)
  })
  it('Quoten summieren sich zur Fragenzahl und respektieren knappe Gruppen', () => {
    const q = groupQuotas(30, { basics: 100, compass: 100, tides: 100, rules: 100, coastal: 0, yacht: 0 })
    expect(Object.values(q).reduce((a, b) => a + b, 0)).toBe(30)
    const tight = groupQuotas(30, { basics: 2, compass: 100, tides: 100, rules: 100, coastal: 0, yacht: 0 })
    expect(tight.basics).toBe(2)
    expect(Object.values(tight).reduce((a, b) => a + b, 0)).toBe(30)
  })
  it('enthält leichte, mittlere und schwere Fragen', () => {
    const levels = new Set(buildExam(40, QUESTION_BANK, seededRandom(5)).map((q) => q.difficulty))
    expect(levels.size).toBe(3)
  })
  it('jedes Thema gehört zu einer Gruppe, Coastal-Themen zur Coastal-Gruppe', () => {
    for (const t of DAY_TOPIC_IDS) expect(groupOf(t)).not.toBe('coastal')
    for (const t of COASTAL_TOPIC_IDS) expect(groupOf(t)).toBe('coastal')
    expect(Object.values(EXAM_GROUPS).reduce((n, g) => n + g.weight, 0)).toBeCloseTo(1)
  })
  it('Reihenfolge der Zuordnung ist stabil und eine Permutation', () => {
    const o = buildOrder('pl-016', 4, 99)
    expect(buildOrder('pl-016', 4, 99)).toEqual(o)
    expect([...o].sort()).toEqual([0, 1, 2, 3])
  })
})

describe('Auswertung', () => {
  const mcs = QUESTION_BANK.filter((q): q is Extract<Question, { type: 'mc' }> => q.type === 'mc').slice(0, 10)
  const right = mcs.map((q) => q.correctIndex)
  it('7 von 10 richtig besteht, 6 von 10 nicht (Grenze 70 %)', () => {
    const seven = right.map((a, i) => (i < 7 ? a : (a + 1) % 4))
    const six = right.map((a, i) => (i < 6 ? a : (a + 1) % 4))
    expect(gradeExam(mcs, seven)).toMatchObject({ correct: 7, percent: 70, passed: true })
    expect(gradeExam(mcs, six).passed).toBe(false)
    expect(PASS_PERCENT).toBe(70)
  })
  it('unbeantwortete Fragen zählen als falsch', () => {
    const g = gradeExam(mcs, right.map((a, i) => (i < 5 ? a : null)))
    expect(g.correct).toBe(5)
    expect(g.answered).toBe(5)
    expect(g.passed).toBe(false)
  })
  it('unvollständige Zuordnung ist unbeantwortet, vollständige korrekte zählt', () => {
    const m = QUESTION_BANK.find((q) => q.type === 'match')!
    if (m.type !== 'match') throw new Error()
    expect(normalizeAnswer(m, [0, null, 2, 3].slice(0, m.pairs.length))).toBeNull()
    const ok = m.pairs.map((_, i) => i)
    expect(gradeExam([m], [ok]).correct).toBe(1)
    expect(gradeExam([m], [ok.map((x) => (x + 1) % ok.length)]).correct).toBe(0)
  })
  it('Gruppen- und Schwierigkeitsauswertung summiert sich zur Gesamtzahl', () => {
    const exam = buildExam(40, QUESTION_BANK, seededRandom(11))
    const g = gradeExam(exam, exam.map(() => null))
    expect(g.byGroup.reduce((n, x) => n + x.total, 0)).toBe(40)
    expect(g.byDifficulty.reduce((n, x) => n + x.total, 0)).toBe(40)
    expect(g.percent).toBe(0)
  })
  it('Restzeit läuft ab und wird nie negativ', () => {
    expect(remainingSeconds(0, 600, 0)).toBe(600)
    expect(remainingSeconds(0, 600, 125_000)).toBe(475)
    expect(remainingSeconds(0, 600, 9_999_999)).toBe(0)
  })
})

describe('Peilen-Lektion', () => {
  it('ist registriert und hat Fragen', () => {
    expect(DAY_LESSON_IDS).toContain('bearings')
    expect(DAY_TOPIC_IDS).toContain('bearings')
    expect(QUESTION_BANK.filter((q) => q.topic === 'bearings').length).toBeGreaterThanOrEqual(14)
  })
})

describe('Coastal-Probeprüfung', () => {
  it('zieht nur Coastal-Fragen, ohne Doppelte, reproduzierbar', () => {
    const p = EXAM_PRESETS.find((x) => x.id === 'coastal')!
    const a = buildExam(p.questions, QUESTION_BANK, seededRandom(4), p.level)
    expect(a).toHaveLength(p.questions)
    expect(a.every((q) => q.level === 'coastal-skipper')).toBe(true)
    expect(new Set(a.map((q) => q.id)).size).toBe(p.questions)
    expect(buildExam(p.questions, QUESTION_BANK, seededRandom(4), p.level).map((q) => q.id)).toEqual(a.map((q) => q.id))
  })
  it('Coastal-Pool ist groß genug und deckt alle fünf Themen ab', () => {
    const coastal = QUESTION_BANK.filter((q) => q.level === 'coastal-skipper')
    expect(coastal.length).toBeGreaterThanOrEqual(30)
    for (const t of COASTAL_TOPIC_IDS) expect(coastal.filter((q) => q.topic === t).length, t).toBeGreaterThanOrEqual(4)
  })
})

describe('Fragenpool Phase 9', () => {
  it('jeder Grundbegriff hat mindestens fünf Fragen', () => {
    for (const t of ['hdg', 'stw', 'water-track', 'cog', 'sog', 'ground-track', 'leeway', 'fix', 'ep'])
      expect(QUESTION_BANK.filter((q) => q.topic === t).length, t).toBeGreaterThanOrEqual(5)
  })
})

import { interpolatedDifference, interpolationFactor, secondaryTide } from '@/calculations'
import { SECONDARY_PORTS, STANDARD_REFERENCES } from '@/data/secondaryPorts'

describe('Sekundärhäfen', () => {
  const kranich = SECONDARY_PORTS.find((p) => p.id === 'kranich')!.differences
  const std = { hwTime: 630, hwHeight: 4.5, lwTime: 1005, lwHeight: 1.5 }
  it('Interpolationsfaktor liegt zwischen 0 (Nipp) und 1 (Springs) und wird begrenzt', () => {
    expect(interpolationFactor(4.0, STANDARD_REFERENCES.hw)).toBe(0)
    expect(interpolationFactor(5.0, STANDARD_REFERENCES.hw)).toBe(1)
    expect(interpolationFactor(4.5, STANDARD_REFERENCES.hw)).toBeCloseTo(0.5)
    expect(interpolationFactor(1.5, STANDARD_REFERENCES.lw)).toBeCloseTo(0.5)
    expect(interpolationFactor(6, STANDARD_REFERENCES.hw)).toBe(1)
    expect(interpolationFactor(3, STANDARD_REFERENCES.hw)).toBe(0)
    expect(interpolationFactor(1, { neaps: 2, springs: 2 })).toBe(0)
  })
  it('Höhenunterschied wird linear zwischen den Spalten interpoliert', () => {
    expect(interpolatedDifference(4.5, STANDARD_REFERENCES.hw, kranich.hwHeight)).toBeCloseTo(-0.5)
    expect(interpolatedDifference(4.0, STANDARD_REFERENCES.hw, kranich.hwHeight)).toBeCloseTo(-0.4)
    expect(interpolatedDifference(5.0, STANDARD_REFERENCES.hw, kranich.hwHeight)).toBeCloseTo(-0.6)
  })
  it('Sekundärhafen-Gezeit: Zeiten, Höhen und Tidenhub', () => {
    const r = secondaryTide(std, STANDARD_REFERENCES, kranich)
    expect(r.hwTime).toBe(605)
    expect(r.lwTime).toBe(965)
    expect(r.hwHeight).toBeCloseTo(4.0)
    expect(r.lwHeight).toBeCloseTo(1.35)
    expect(r.range).toBeCloseTo(2.65)
  })
  it('Unterschied null ergibt den Standardhafen', () => {
    const zero = { hwTime: 0, lwTime: 0, hwHeight: { neaps: 0, springs: 0 }, lwHeight: { neaps: 0, springs: 0 } }
    expect(secondaryTide(std, STANDARD_REFERENCES, zero)).toMatchObject({ hwTime: 630, hwHeight: 4.5, lwTime: 1005, lwHeight: 1.5 })
  })
})

describe('Fragenpool Phase 11', () => {
  it('jede Themengruppe hat genug Fragen für den Intensiv-Test (Quote reicht)', () => {
    const day = QUESTION_BANK.filter((q) => q.level === 'day-skipper')
    const intensive = EXAM_PRESETS.find((p) => p.id === 'lang')!.questions
    for (const g of ['basics', 'compass', 'tides', 'rules'] as const)
      expect(day.filter((q) => groupOf(q.topic) === g).length, g).toBeGreaterThanOrEqual(Math.ceil(EXAM_GROUPS[g].weight * intensive * 2))
  })
})

describe('Yachtmaster-Vorgriff', () => {
  const yacht = QUESTION_BANK.filter((q) => q.level === 'yachtmaster-offshore')
  it('Pool deckt beide Themen ab und alle Fragen gehören zur Stufe', () => {
    expect(yacht.length).toBeGreaterThanOrEqual(15)
    for (const t of ['great-circle', 'night-navigation']) expect(yacht.filter((q) => q.topic === t).length, t).toBeGreaterThanOrEqual(5)
    expect(groupOf('great-circle')).toBe('yacht')
  })
  it('Yachtmaster-Test enthält nur Yachtmaster-Fragen und ist reproduzierbar', () => {
    const p = EXAM_PRESETS.find((x) => x.id === 'yacht')!
    const a = buildExam(p.questions, QUESTION_BANK, seededRandom(9), p.level)
    expect(a).toHaveLength(p.questions)
    expect(a.every((q) => q.level === 'yachtmaster-offshore')).toBe(true)
    expect(new Set(a.map((q) => q.id)).size).toBe(p.questions)
    expect(buildExam(p.questions, QUESTION_BANK, seededRandom(9), p.level).map((q) => q.id)).toEqual(a.map((q) => q.id))
  })
  it('Day-Skipper-Prüfungen enthalten keine Yachtmaster-Fragen', () => {
    for (const p of EXAM_PRESETS.filter((x) => !x.level)) expect(buildExam(p.questions, QUESTION_BANK, seededRandom(1)).some((q) => q.level !== 'day-skipper')).toBe(false)
  })
})

import { YACHT_LESSONS } from '@/modules/yachtmaster/YachtmasterPage'

describe('Yachtmaster-Lektionen', () => {
  it('jede Lektion hat Text, Merksatz, Widget und passende Fragen', () => {
    expect(YACHT_LESSONS.map((l) => l.id).sort()).toEqual(['great-circle', 'night-navigation'])
    for (const l of YACHT_LESSONS) {
      expect(l.body.length).toBeGreaterThanOrEqual(3)
      expect(l.mnemonic.length).toBeGreaterThan(10)
      expect(l.widgets.length).toBeGreaterThanOrEqual(1)
      expect(QUESTION_BANK.filter((q) => q.topic === l.id).length).toBeGreaterThanOrEqual(5)
    }
  })
})
