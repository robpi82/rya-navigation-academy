import { describe, expect, it } from 'vitest'
import { datumDriftNm, distanceAwayM, expandingSquareLegs, expandingSquareLength, rescueHours, searchMinutes, sectorSearchLength } from '@/calculations'
import { ABANDON_STEPS } from '@/data/offshoreEmergency'
import { YACHT_TOPIC_IDS } from '@/data/topics'
import { EXAM_PRESETS } from '@/lib/exam'
import { curriculum } from '@/lib/studyPlan'
import { skillOf } from '@/lib/calcSkills'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'

describe('Mensch über Bord', () => {
  it('Abstand bis zur Reaktion und Versatz durch Strom', () => {
    expect(distanceAwayM(6, 20)).toBeCloseTo(61.7, 1)
    expect(distanceAwayM(6, 0)).toBe(0)
    expect(datumDriftNm(1.5, 40)).toBeCloseTo(1)
  })
})

describe('Suchmuster', () => {
  it('wachsendes Quadrat: S, S, 2S, 2S, 3S …', () => {
    expect(expandingSquareLegs(1, 7)).toEqual([1, 1, 2, 2, 3, 3, 4])
    expect(expandingSquareLength(0.2, 8)).toBeCloseTo(4)
  })
  it('Sektorsuche: 9 R, Dauer aus Strecke und Fahrt', () => {
    expect(sectorSearchLength(0.5)).toBe(4.5)
    expect(searchMinutes(4, 5)).toBeCloseTo(48)
  })
  it('Zeit bis zur Hilfe', () => {
    expect(rescueHours(90, 15)).toBe(6)
  })
})

describe('Einbindung', () => {
  it('Lektion, Lernplan, Fragen, Rechenart, Reihenfolge', () => {
    expect(YACHT_TOPIC_IDS).toContain('offshore-emergency')
    expect(curriculum('yachtmaster-offshore').map((i) => i.id)).toContain('offshore-emergency')
    expect(QUESTION_BANK.filter((q) => q.topic === 'offshore-emergency')).toHaveLength(11)
    expect(skillOf(QUESTION_BY_ID['yx-003'])!.id).toBe('safety')
    expect(new Set(ABANDON_STEPS.map((s) => s.id)).size).toBe(ABANDON_STEPS.length)
  })
  it('Yachtmaster-Probeprüfung wächst mit den Themen', () => {
    const p = EXAM_PRESETS.find((x) => x.id === 'yacht-full')!
    expect(p.questions).toBeGreaterThanOrEqual(3 * YACHT_TOPIC_IDS.length)
  })
})
