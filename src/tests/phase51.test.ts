import { describe, expect, it } from 'vitest'
import { inArc, legMinutes, sectorColor } from '@/calculations'
import { ENTRANCE_SECTORS, FOG_STEPS, PORT_SIGNALS } from '@/data/inshore'
import { DAY_LESSON_IDS } from '@/data/lessonIds'
import { SYLLABUS } from '@/data/syllabus'
import { curriculum } from '@/lib/studyPlan'
import { skillOf } from '@/lib/calcSkills'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'

describe('Sektorenfeuer', () => {
  it('Bogen im Uhrzeigersinn, auch über 000° hinweg', () => {
    expect(inArc(95, 94, 98)).toBe(true)
    expect(inArc(98, 94, 98)).toBe(false)
    expect(inArc(5, 350, 10)).toBe(true)
    expect(inArc(340, 350, 10)).toBe(false)
  })
  it('Einfahrt: Weiß um 096°, Rot nördlich (größere Peilung), Grün südlich', () => {
    expect(sectorColor(96, ENTRANCE_SECTORS)).toBe('W')
    expect(sectorColor(100, ENTRANCE_SECTORS)).toBe('R')
    expect(sectorColor(90, ENTRANCE_SECTORS)).toBe('G')
    expect(sectorColor(150, ENTRANCE_SECTORS)).toBeNull()
  })
  it('Sektoren schließen lückenlos aneinander an', () => {
    for (let i = 1; i < ENTRANCE_SECTORS.length; i++) expect(ENTRANCE_SECTORS[i].from).toBe(ENTRANCE_SECTORS[i - 1].to)
  })
})

describe('Pilotageplan, Hafensignale, Nebel', () => {
  it('Minuten je Abschnitt', () => {
    expect(legMinutes(1.2, 4)).toBeCloseTo(18)
  })
  it('drei Grundsignale, eindeutig', () => {
    expect(PORT_SIGNALS).toHaveLength(3)
    expect(new Set(PORT_SIGNALS.map((s) => `${s.lights.join('')}${s.flashing}`)).size).toBe(3)
  })
  it('Nebel: zuerst der Ort', () => {
    expect(FOG_STEPS[0].id).toBe('fix')
  })
})

describe('Einbindung', () => {
  it('Lektion, Lernplan, Fragen, Rechenart, Syllabus', () => {
    expect(DAY_LESSON_IDS).toContain('inshore')
    expect(curriculum('day-skipper').map((i) => i.id)).toContain('inshore')
    expect(QUESTION_BANK.filter((q) => q.topic === 'inshore')).toHaveLength(12)
    expect(skillOf(QUESTION_BY_ID['ip-001'])!.id).toBe('enav')
    const day = SYLLABUS[0].areas
    expect(day.find((a) => a.id === 'd-pilotage')!.status).toBe('covered')
    expect(day.find((a) => a.id === 'd-fog')!.status).toBe('covered')
  })
})
