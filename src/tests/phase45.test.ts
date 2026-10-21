import { describe, expect, it } from 'vitest'
import { arrivalDate, clockChangeHours, daysPerClockHour, etmalNeeded, etmalSpeed, longitudePerDay, passageDays, passageWater } from '@/calculations'
import { OCEAN_ROUTES } from '@/data/ocean'
import { YACHT_TOPIC_IDS } from '@/data/topics'
import { curriculum } from '@/lib/studyPlan'
import { parseNumberInput } from '@/lib/quiz'
import { skillOf } from '@/lib/calcSkills'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'

describe('Etmal und Reisedauer', () => {
  it('Etmal / 24, Distanz / Etmal', () => {
    expect(etmalSpeed(144)).toBe(6)
    expect(passageDays(2700, 150)).toBe(18)
    expect(etmalNeeded(2800, 20)).toBe(140)
  })
  it('Ankunft: angefangene Tage zählen mit, auch über den Monatswechsel', () => {
    expect(arrivalDate('2026-11-22', 18)).toBe('2026-12-10')
    expect(arrivalDate('2026-11-22', 18.2)).toBe('2026-12-11')
    expect(arrivalDate('2026-12-20', 20)).toBe('2027-01-09')
  })
  it('Wasser mit Reserve', () => {
    expect(passageWater(4, 20)).toBeCloseTo(312)
    expect(passageWater(4, 20, 3, 0)).toBe(240)
  })
})

describe('Bordzeit', () => {
  it('je 15° eine Stunde, nach Westen negativ', () => {
    expect(clockChangeHours(-15, -60)).toBe(-3)
    expect(clockChangeHours(-60, -15)).toBe(3)
  })
  it('Längenänderung pro Tag wächst mit der Breite', () => {
    expect(longitudePerDay(120, 0)).toBeCloseTo(2)
    expect(longitudePerDay(120, 60)).toBeCloseTo(4)
    expect(daysPerClockHour(120, 0)).toBeCloseTo(7.5)
  })
})

describe('Routen und Jahreszeiten', () => {
  it('jede Route hat zwölf Monate und mindestens einen guten', () => {
    for (const r of OCEAN_ROUTES) {
      expect(r.months).toHaveLength(12)
      expect(r.months).toContain('good')
    }
  })
  it('Passatroute: Hurrikansaison (Juni–Oktober) ungünstig, Dezember gut', () => {
    const trades = OCEAN_ROUTES.find((r) => r.id === 'trades')!
    for (const m of [5, 6, 7, 8, 9]) expect(trades.months[m]).toBe('poor')
    expect(trades.months[11]).toBe('good')
  })
  it('Rückweg: August bis Oktober ungünstig, Mai gut', () => {
    const back = OCEAN_ROUTES.find((r) => r.id === 'return')!
    for (const m of [7, 8, 9]) expect(back.months[m]).toBe('poor')
    expect(back.months[4]).toBe('good')
  })
})

describe('Einbindung', () => {
  it('Lektion, Lernplan, Fragen, Rechenart, Einheit Tage', () => {
    expect(YACHT_TOPIC_IDS).toContain('ocean-passage')
    expect(curriculum('yachtmaster-offshore').map((i) => i.id)).toContain('ocean-passage')
    expect(QUESTION_BANK.filter((q) => q.topic === 'ocean-passage')).toHaveLength(10)
    expect(skillOf(QUESTION_BY_ID['yo-002'])!.id).toBe('offshore')
    expect(parseNumberInput('18 Tage')).toBe(18)
    expect(parseNumberInput('6,2 tage')).toBe(6.2)
  })
})
