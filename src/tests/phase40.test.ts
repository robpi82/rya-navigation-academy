import { describe, expect, it } from 'vitest'
import { abeamDistance, distanceOffFromBowAngles, epErrorRadius, reduceSounding } from '@/calculations'
import { COASTAL_LESSON_IDS } from '@/data/lessonIds'
import { curriculum } from '@/lib/studyPlan'
import { skillOf } from '@/lib/calcSkills'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'

describe('Abstand aus zwei Bugwinkeln', () => {
  it('Verdoppelung: Abstand = gelaufene Strecke', () => {
    for (const a of [20, 30, 40]) expect(distanceOffFromBowAngles(a, 2 * a, 2.5)).toBeCloseTo(2.5)
  })
  it('Vierstrichpeilung: Passierabstand = Strecke', () => {
    expect(abeamDistance(45, 90, 2.5)).toBeCloseTo(2.5)
  })
  it('allgemeiner Fall stimmt mit der Geometrie überein', () => {
    // Marke querab in 4 NM, Kurs Nord: bei 30° und 45° Bugwinkel stehen die Orte 4/tan30 bzw. 4/tan45 südlich querab
    const run = 4 / Math.tan(Math.PI / 6) - 4 / Math.tan(Math.PI / 4)
    expect(abeamDistance(30, 45, run)).toBeCloseTo(4)
    expect(distanceOffFromBowAngles(30, 45, run)).toBeCloseTo(4 * Math.SQRT2)
  })
  it('ungültige Winkel ergeben null', () => {
    expect(distanceOffFromBowAngles(60, 30, 2)).toBeNull()
    expect(distanceOffFromBowAngles(0, 30, 2)).toBeNull()
  })
})

describe('Fehlerkreis und Lotung', () => {
  it('10 % der Strecke', () => {
    expect(epErrorRadius(30)).toBeCloseTo(3)
    expect(epErrorRadius(30, 0.05)).toBeCloseTo(1.5)
  })
  it('Lotung auf Kartennull', () => {
    expect(reduceSounding(12.4, 0.4, 3)).toBeCloseTo(9.8)
  })
})

describe('Einbindung', () => {
  it('Lektion, Lernplan, Fragen, Rechenart', () => {
    expect(COASTAL_LESSON_IDS).toContain('no-gps')
    expect(curriculum('coastal-skipper').map((i) => i.id)).toContain('no-gps')
    expect(QUESTION_BANK.filter((q) => q.topic === 'no-gps')).toHaveLength(10)
    expect(skillOf(QUESTION_BY_ID['cg-001'])!.id).toBe('nogps')
  })
})

describe('Inhaltsprüfung: Antwortlänge verrät nichts', () => {
  it('bei neueren Fragen ist die richtige Antwort nicht die längste', () => {
    const recent = QUESTION_BANK.filter((q) => q.type === 'mc' && /^(ca|ct|dp|cg)-/.test(q.id))
    expect(recent.length).toBeGreaterThan(15)
    for (const q of recent) {
      if (q.type !== 'mc') continue
      const lengths = q.options.map((o) => o.length)
      const longest = Math.max(...lengths.filter((_, i) => i !== q.correctIndex))
      expect(lengths[q.correctIndex], q.id).toBeLessThanOrEqual(longest)
    }
  })
})
