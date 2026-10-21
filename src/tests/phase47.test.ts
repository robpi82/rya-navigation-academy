import { describe, expect, it } from 'vitest'
import { SYLLABUS } from '@/data/syllabus'
import { parseHash } from '@/hooks/useHashRoute'
import { DAY_LESSONS } from '@/modules/daylessons/DayLessonsPage'
import { LESSONS } from '@/modules/coastal/CoastalPage'
import { YACHT_LESSONS } from '@/modules/yachtmaster/YachtmasterPage'
import { QUESTION_BANK } from '@/questions'

const LESSON_IDS: Record<string, Set<string>> = {
  themen: new Set(DAY_LESSONS.map((l) => l.id)),
  coastal: new Set(LESSONS.map((l) => l.id)),
  yachtmaster: new Set(YACHT_LESSONS.map((l) => l.id)),
}
const areas = SYLLABUS.flatMap((l) => l.areas)

describe('Syllabus-Abdeckung', () => {
  it('eindeutige Bereiche, drei Stufen', () => {
    expect(SYLLABUS).toHaveLength(3)
    expect(new Set(areas.map((a) => a.id)).size).toBe(areas.length)
  })
  it('alle Links zeigen auf vorhandene Lektionen oder Seiten', () => {
    for (const a of areas)
      for (const l of a.links) {
        const r = parseHash(l.href) as { name: string; lessonId?: string }
        expect(r.name, `${a.id} → ${l.href}`).not.toBe('dashboard')
        if (r.name in LESSON_IDS && r.lessonId) expect(LESSON_IDS[r.name].has(r.lessonId), `${a.id} → ${l.href}`).toBe(true)
      }
  })
  it('Status passt zum Inhalt: abgedeckt hat Lektion und Fragen, fehlend hat nichts', () => {
    for (const a of areas) {
      if (a.status === 'none') {
        expect(a.links, a.id).toEqual([])
        expect(a.note, a.id).toBeTruthy()
      } else {
        expect(QUESTION_BANK.some((q) => a.topics.includes(q.topic)), a.id).toBe(true)
      }
      if (a.status === 'covered') expect(a.links.some((l) => /^#\/(themen|coastal|yachtmaster)\//.test(l.href)) || a.links.some((l) => l.href === '#/simulator'), a.id).toBe(true)
      if (a.status === 'partial') expect(a.note, a.id).toBeTruthy()
    }
  })
  it('jede Lektion der App ist mindestens einem Bereich zugeordnet', () => {
    const linked = new Set(areas.flatMap((a) => a.links.map((l) => l.href)))
    for (const [area, ids] of Object.entries(LESSON_IDS)) for (const id of ids) expect(linked.has(`#/${area}/${id}`), `${area}/${id}`).toBe(true)
  })
  it('Ocean-Themen sind gekennzeichnet', () => {
    expect(SYLLABUS[2].areas.every((a) => a.ocean)).toBe(true)
  })
  it('Route #/syllabus', () => {
    expect(parseHash('#/syllabus').name).toBe('syllabus')
  })
})
