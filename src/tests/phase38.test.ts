import { describe, expect, it } from 'vitest'
import { daylightMargin, fuelNeeded, thirdsRange, waterNeeded } from '@/calculations'
import { BRIEFING_ITEMS, DEPARTURE_CHECKLIST } from '@/data/preparation'
import { DAY_LESSON_IDS } from '@/data/lessonIds'
import { curriculum } from '@/lib/studyPlan'
import { parseNumberInput } from '@/lib/quiz'
import { QUESTION_BANK } from '@/questions'
import { FLASHCARDS } from '@/data/flashcards'

describe('Kraftstoff', () => {
  it('Strecke unter Maschine plus Reserve', () => {
    expect(fuelNeeded(24, 6, 3)).toBeCloseTo(14.4)
    expect(fuelNeeded(24, 6, 3, 0)).toBeCloseTo(12)
  })
  it('Drittelregel: hin, zurück, Reserve', () => {
    const out = thirdsRange(60, 4, 6)
    expect(out).toBe(30)
    // Hin- und Rückweg verbrauchen zusammen zwei Drittel des Tanks
    expect(((2 * out) / 6) * 4).toBeCloseTo(40)
  })
})

describe('Wasser und Tageslicht', () => {
  it('Trinkwasser für Crew und Tage', () => {
    expect(waterNeeded(4, 3, 3)).toBe(36)
    expect(waterNeeded(2, 1)).toBe(6)
  })
  it('Reserve bis Sonnenuntergang, negativ bei Ankunft im Dunkeln', () => {
    expect(daylightMargin(9, 30, 5, 17.5)).toBeCloseTo(2.5)
    expect(daylightMargin(14, 30, 5, 18)).toBeCloseTo(-2)
  })
})

describe('Checkliste und Briefing', () => {
  it('eindeutige Punkte in jeder Gruppe', () => {
    for (const g of DEPARTURE_CHECKLIST) expect(new Set(g.items.map((i) => i.id)).size).toBe(g.items.length)
    expect(new Set(DEPARTURE_CHECKLIST.map((g) => g.id)).size).toBe(DEPARTURE_CHECKLIST.length)
  })
  it('Briefing hat passende und unpassende Punkte', () => {
    expect(BRIEFING_ITEMS.some((i) => i.belongs)).toBe(true)
    expect(BRIEFING_ITEMS.some((i) => !i.belongs)).toBe(true)
  })
})

describe('Einbindung', () => {
  it('Lektion, Fragen, Lernkarten, Lernplan', () => {
    expect(DAY_LESSON_IDS).toContain('preparation')
    expect(curriculum('day-skipper').map((i) => i.id)).toContain('preparation')
    expect(QUESTION_BANK.filter((q) => q.topic === 'preparation')).toHaveLength(10)
    expect(FLASHCARDS.some((c) => c.id === 'fuel-thirds')).toBe(true)
  })
  it('Liter-Eingaben werden erkannt', () => {
    expect(parseNumberInput('14,4 l')).toBe(14.4)
    expect(parseNumberInput('36l')).toBe(36)
    expect(parseNumberInput('35 l/min')).toBe(35)
  })
})
