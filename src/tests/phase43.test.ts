import { describe, expect, it } from 'vitest'
import { atlasPage, atlasRateForDay, atlasTides, formatAtlasLabel, pagesForPassage, parseAtlasLabel, planPassage } from '@/calculations'
import { ATLAS_HOURS, ATLAS_NEAP_RANGE, ATLAS_PASSAGE, ATLAS_SPRING_RANGE, ATLAS_STATIONS } from '@/data/tidalAtlas'
import { YACHT_TOPIC_IDS } from '@/data/topics'
import { curriculum } from '@/lib/studyPlan'
import { skillOf } from '@/lib/calcSkills'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'

describe('Atlasangaben', () => {
  it('„08,15“ = Nipp 0,8 / Spring 1,5 und zurück', () => {
    expect(parseAtlasLabel('08,15')).toEqual({ neap: 0.8, spring: 1.5 })
    expect(parseAtlasLabel(' 12 , 24 ')).toEqual({ neap: 1.2, spring: 2.4 })
    expect(parseAtlasLabel('0815')).toBeNull()
    expect(formatAtlasLabel({ neap: 0.8, spring: 1.5 })).toBe('08,15')
  })
  it('Rate über den Tidenhub, mit Extrapolation', () => {
    const r = { neap: 0.8, spring: 1.6 }
    expect(atlasRateForDay(r, 1.9, 1.9, 4.1)).toBeCloseTo(0.8)
    expect(atlasRateForDay(r, 4.1, 1.9, 4.1)).toBeCloseTo(1.6)
    expect(atlasRateForDay(r, 3, 1.9, 4.1)).toBeCloseTo(1.2)
    expect(atlasRateForDay(r, 4.5, 1.9, 4.1)).toBeGreaterThan(1.6)
  })
})

describe('Stundenseiten', () => {
  it('nächste volle Stunde, begrenzt auf ±6', () => {
    expect(atlasPage(155)).toBe(3)
    expect(atlasPage(-20)).toBe(0)
    expect(atlasPage(-205)).toBe(-3)
    expect(atlasPage(500)).toBe(6)
  })
  it('für jede Fahrtstunde die Seite zur Mitte der Stunde', () => {
    expect(pagesForPassage(-140, 3)).toEqual([-2, -1, 0])
    expect(pagesForPassage(0, 2)).toEqual([1, 2])
  })
})

describe('Übungsatlas', () => {
  it('jede Stelle hat 13 Seiten mit gültigen Angaben, Nipp ≤ Spring', () => {
    for (const s of ATLAS_STATIONS)
      for (const h of ATLAS_HOURS) {
        const r = parseAtlasLabel(s.pages[h].label)
        expect(r, `${s.id} ${h}`).not.toBeNull()
        expect(r!.neap).toBeLessThanOrEqual(r!.spring)
      }
  })
  it('der Strom kentert: Flut- und Ebbrichtung kommen vor', () => {
    for (const s of ATLAS_STATIONS) expect(new Set(ATLAS_HOURS.map((h) => s.pages[h].set)).size, s.id).toBe(2)
  })
  it('die Beispielüberfahrt ist planbar und braucht etwa drei Stunden', () => {
    const st = ATLAS_STATIONS.find((s) => s.id === ATLAS_PASSAGE.station)!
    const tides = atlasTides(st.pages, -200, 6, 3.5, ATLAS_NEAP_RANGE, ATLAS_SPRING_RANGE)
    const plan = planPassage({ desiredTrack: ATLAS_PASSAGE.track, distance: ATLAS_PASSAGE.distance, stw: 5, tides })
    expect(plan.feasible).toBe(true)
    if (plan.feasible) expect(plan.hours).toBeGreaterThan(2.5)
  })
})

describe('Einbindung', () => {
  it('Lektion, Lernplan, Fragen, Rechenart', () => {
    expect(YACHT_TOPIC_IDS).toContain('tidal-atlas')
    expect(curriculum('yachtmaster-offshore').map((i) => i.id)).toContain('tidal-atlas')
    expect(QUESTION_BANK.filter((q) => q.topic === 'tidal-atlas')).toHaveLength(10)
    expect(skillOf(QUESTION_BY_ID['yt-001'])!.id).toBe('streams')
    expect(skillOf(QUESTION_BY_ID['yt-006'])!.id).toBe('vectors')
  })
})
