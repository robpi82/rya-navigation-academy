import { beforeEach, describe, expect, it, vi } from 'vitest'
import { compassToTrue, deviationAt, trueToCompass, variationForYear } from '@/calculations'
import { DEMO_DEVIATION } from '@/modules/daylessons/compassWidgets'
import { DAY_LESSONS } from '@/modules/daylessons/DayLessonsPage'
import { compassSections } from '@/modules/daylessons/compass/sections'
import { conversionSteps, interpolationBracket, variationSteps } from '@/modules/daylessons/compass/lessonMath'

const lesson = DAY_LESSONS.find((l) => l.id === 'compass')!

describe('Lektion 1: Lernabschnitte', () => {
  it('gliedert die Lektion in die sechs geforderten Abschnitte', () => {
    expect(compassSections(lesson).map((s) => s.title)).toEqual([
      'Grundlagen: Compass, Magnetic und True',
      'Variation: Missweisung der Erde',
      'Deviation: Ablenkung durch das Schiff',
      'Interaktive Kursumrechnung',
      'Deviationstabelle und Interpolation',
      'Variation für ein bestimmtes Jahr berechnen',
    ])
  })

  it('übernimmt alle Kernaussagen, den Merksatz und alle drei Rechner', () => {
    const sections = compassSections(lesson)
    expect(sections.flatMap((s) => s.keyPoints ?? []).sort()).toEqual([...lesson.keyPoints!].sort())
    expect(sections.filter((s) => s.mnemonic)).toHaveLength(1)
    expect(sections.flatMap((s) => (s.widget ? [s.widget.Comp] : []))).toEqual(lesson.widgets.map((w) => w.Comp))
  })

  it('Abschnitts-IDs sind eindeutig', () => {
    const ids = compassSections(lesson).map((s) => s.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})

describe('Lektion 1: Rechenwege', () => {
  it('Kompass → rechtweisend stimmt mit compassToTrue überein, inklusive Normierung', () => {
    for (const [c, d, v] of [[75, 2, -3], [358, 4, 3], [2, -5, -1], [180, 0, 0]]) {
      const steps = conversionSteps('toTrue', c, d, v)
      const r = compassToTrue(c, d, v)
      expect(steps[0].to.value).toBe(r.magnetic)
      expect(steps[1].to.value).toBe(r.true)
    }
    expect(conversionSteps('toTrue', 358, 4, 3)[0]).toMatchObject({ raw: 362, normalized: true, to: { value: 2 } })
  })

  it('rechtweisend → Kompass kehrt die Vorzeichen um', () => {
    const steps = conversionSteps('toCompass', 120, 2, -5)
    expect(steps[0]).toMatchObject({ from: { key: 'T' }, correction: { key: 'V', signed: -5 }, applied: 5, to: { key: 'M', value: 125 } })
    expect(steps[1]).toMatchObject({ correction: { key: 'D', signed: 2 }, applied: -2, to: { key: 'C', value: trueToCompass(120, -5, 2).compass } })
  })

  it('Interpolation nennt die richtigen Tabellenwerte', () => {
    const b = interpolationBracket(DEMO_DEVIATION, 60)
    expect([b.a.heading, b.bHeading]).toEqual([45, 90])
    expect(b.a.deviation + (b.b.deviation - b.a.deviation) * b.fraction).toBeCloseTo(deviationAt(DEMO_DEVIATION, 60))
    const wrap = interpolationBracket(DEMO_DEVIATION, 330)
    expect([wrap.a.heading, wrap.b.heading, wrap.bHeading]).toEqual([315, 0, 360])
  })

  it('Variation im Zieljahr: 4°30′W 2015 (6′E) → 2024', () => {
    const r = variationSteps(-4.5, 2015, 0.1, 2024)
    expect(r.years).toBe(9)
    expect(r.total).toBeCloseTo(0.9)
    expect(r.result).toBeCloseTo(variationForYear(-4.5, 2015, 0.1, 2024))
    expect(r.result).toBeCloseTo(-3.6)
  })
})

describe('Lektion 1: Abschnittsfortschritt', () => {
  beforeEach(() => {
    const data = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (k: string) => data.get(k) ?? null,
      setItem: (k: string, v: string) => void data.set(k, v),
      removeItem: (k: string) => void data.delete(k),
    })
    vi.resetModules()
  })

  it('speichert verstandene Abschnitte je Lektion persistent und markiert den Tag als aktiv', async () => {
    const { useLessonSectionStore } = await import('@/stores/lessonSectionStore')
    const { useProgressStore } = await import('@/stores/progressStore')
    useLessonSectionStore.getState().toggleSection('compass', 'grundlagen')
    useLessonSectionStore.getState().toggleSection('compass', 'variation')
    useLessonSectionStore.getState().toggleSection('compass', 'grundlagen')
    expect(useLessonSectionStore.getState().sections).toEqual({ compass: ['variation'] })
    expect(JSON.parse(localStorage.getItem('rya-nav-academy:lesson-sections')!).state.sections).toEqual({ compass: ['variation'] })
    expect(useProgressStore.getState().activeDays.length).toBe(1)
    // Lektionsfortschritt bleibt davon unberührt
    expect(useProgressStore.getState().completedLessons).toEqual([])
  })
})
