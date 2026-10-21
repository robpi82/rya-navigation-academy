import { describe, expect, it } from 'vitest'
import { dischargeAllowed, holdingTankDays, minDistanceForDischarge, type GarbageItem } from '@/calculations'
import { WILDLIFE_CASES } from '@/data/environment'
import { DAY_LESSON_IDS } from '@/data/lessonIds'
import { SYLLABUS } from '@/data/syllabus'
import { curriculum } from '@/lib/studyPlan'
import { QUESTION_BANK } from '@/questions'

describe('Müllregeln (vereinfacht nach MARPOL Anlage V)', () => {
  const never: GarbageItem[] = ['plastic', 'glass-metal', 'paper', 'oily-rags']
  it('Kunststoff, Glas, Dosen, Papier und ölige Abfälle nie – auch weit draußen nicht', () => {
    for (const g of never) {
      expect(minDistanceForDischarge(g, false), g).toBeNull()
      expect(dischargeAllowed(g, 200, false, true), g).toBe(false)
    }
  })
  it('Lebensmittelreste außerhalb von Sondergebieten: zerkleinert ab 3 NM, unzerkleinert ab 12 NM', () => {
    expect(minDistanceForDischarge('food-ground', false)).toBe(3)
    expect(minDistanceForDischarge('food-whole', false)).toBe(12)
    expect(dischargeAllowed('food-ground', 2.9, false, true)).toBe(false)
    expect(dischargeAllowed('food-ground', 3, false, true)).toBe(true)
  })
  it('in Sondergebieten nur zerkleinert ab 12 NM; nie vor Anker', () => {
    expect(minDistanceForDischarge('food-ground', true)).toBe(12)
    expect(minDistanceForDischarge('food-whole', true)).toBeNull()
    expect(dischargeAllowed('food-ground', 20, true, false)).toBe(false)
  })
})

describe('Fäkalientank und Tierbegegnungen', () => {
  it('Tage bis der Tank voll ist', () => {
    expect(holdingTankDays(60, 4, 2.5)).toBe(6)
  })
  it('jede Situation hat genau eine richtige Antwort mit Begründung', () => {
    for (const c of WILDLIFE_CASES) {
      expect(c.options.filter((o) => o.right), c.id).toHaveLength(1)
      for (const o of c.options) expect(o.why.length, c.id).toBeGreaterThan(20)
    }
  })
})

describe('Einbindung', () => {
  it('Lektion, Lernplan, Fragen, Syllabus ohne Lücken', () => {
    expect(DAY_LESSON_IDS).toContain('environment')
    expect(curriculum('day-skipper').map((i) => i.id)).toContain('environment')
    expect(QUESTION_BANK.filter((q) => q.topic === 'environment')).toHaveLength(12)
    const areas = SYLLABUS.flatMap((l) => l.areas)
    expect(areas.filter((a) => a.status === 'none')).toEqual([])
  })
})
