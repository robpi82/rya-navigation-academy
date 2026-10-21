import { describe, expect, it } from 'vitest'
import { stormCentreBearing, stormPosition, tropicalClass, vhfRange } from '@/calculations'
import { COMMS_SYSTEMS, GMDSS_AREAS, windBelt } from '@/data/oceanWeather'
import { SYLLABUS } from '@/data/syllabus'
import { YACHT_TOPIC_IDS } from '@/data/topics'
import { EXAM_PRESETS } from '@/lib/exam'
import { curriculum } from '@/lib/studyPlan'
import { skillOf } from '@/lib/calcSkills'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'

describe('Tropische Wirbelstürme', () => {
  it('Zentrum: Nordhalbkugel rechts, Südhalbkugel links vom Wind', () => {
    expect(stormCentreBearing(90, 'N')).toEqual({ near: 180, far: 225 })
    expect(stormCentreBearing(90, 'S')).toEqual({ near: 0, far: 315 })
  })
  it('Halbkreis aus der Winddrehung, Süd spiegelverkehrt', () => {
    expect(stormPosition('veer', 'N')).toBe('dangerous')
    expect(stormPosition('back', 'N')).toBe('navigable')
    expect(stormPosition('back', 'S')).toBe('dangerous')
    expect(stormPosition('steady', 'S')).toBe('track')
  })
  it('Einstufung 34 / 64 kn', () => {
    expect(tropicalClass(33)).toBe('depression')
    expect(tropicalClass(34)).toBe('storm')
    expect(tropicalClass(63)).toBe('storm')
    expect(tropicalClass(64)).toBe('hurricane')
  })
})

describe('Windgürtel', () => {
  it('Januar: Mallungen nahe Äquator, Passate beiderseits, Hoch um 30°, Westwinde', () => {
    expect(windBelt(3, 'jan').id).toBe('itcz')
    expect(windBelt(15, 'jan').id).toBe('ne-trades')
    expect(windBelt(-15, 'jan').id).toBe('se-trades')
    expect(windBelt(31, 'jan').id).toBe('n-high')
    expect(windBelt(50, 'jan').id).toBe('n-westerlies')
    expect(windBelt(-45, 'jan').id).toBe('s-westerlies')
  })
  it('Juli: alles nach Norden verschoben', () => {
    expect(windBelt(10, 'jul').id).toBe('itcz')
    expect(windBelt(3, 'jul').id).not.toBe('ne-trades')
    expect(windBelt(31, 'jul').id).toBe('ne-trades')
  })
})

describe('Funk', () => {
  it('UKW-Reichweite', () => {
    expect(vhfRange(16, 100)).toBeCloseTo(30.8)
  })
  it('Systeme und GMDSS-Gebiete vollständig', () => {
    expect(GMDSS_AREAS.map((a) => a.id)).toEqual(['A1', 'A2', 'A3', 'A4'])
    expect(COMMS_SYSTEMS.find((s) => s.id === 'navtex')!.rangeNm).toBeGreaterThanOrEqual(200)
  })
})

describe('Einbindung', () => {
  it('Lektion, Lernplan, Fragen, Prüfung, Syllabus vollständig', () => {
    expect(YACHT_TOPIC_IDS).toContain('ocean-weather')
    expect(curriculum('yachtmaster-offshore').map((i) => i.id)).toContain('ocean-weather')
    expect(QUESTION_BANK.filter((q) => q.topic === 'ocean-weather')).toHaveLength(12)
    expect(skillOf(QUESTION_BY_ID['yc-001'])!.id).toBe('offshore')
    expect(EXAM_PRESETS.find((p) => p.id === 'yacht-full')!.questions).toBeGreaterThanOrEqual(3 * YACHT_TOPIC_IDS.length)
    expect(SYLLABUS.flatMap((l) => l.areas).every((a) => a.status === 'covered')).toBe(true)
  })
})
