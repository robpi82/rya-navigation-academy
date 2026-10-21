import { describe, expect, it } from 'vitest'
import { buildPlan, curriculum, currentWeekIndex, doneIds, planStatus, weeklyProgress, type PlanItem } from '@/lib/studyPlan'

const start = new Date('2026-11-02T10:00:00Z') // Montag
const plan = buildPlan('coastal-skipper', start, new Date('2026-12-14'), 3) // 7 Wochen
const doneSet = (ids: string[]) => (i: PlanItem) => ids.includes(i.id)

describe('Aktuelle Woche', () => {
  it('vor Beginn Woche 1, danach nach Datum, nach Ende die letzte', () => {
    expect(currentWeekIndex(plan, '2026-10-20')).toBe(0)
    expect(currentWeekIndex(plan, '2026-11-18')).toBe(2)
    expect(currentWeekIndex(plan, '2027-01-10')).toBe(6)
  })
})

describe('Plan-Status', () => {
  const week = (n: number) => plan.weeks[n].items.map((i) => i.id)
  it('im Plan, wenn alle vergangenen Wochen erledigt sind', () => {
    const s = planStatus(plan, doneSet([...week(0), ...week(1)]), '2026-11-18', '2026-12-14')
    expect(s.pace).toBe('on-track')
    expect(s.overdue).toHaveLength(0)
    expect(s.dueByNow).toBe(week(0).length + week(1).length + week(2).length)
    expect(s.daysLeft).toBe(26)
  })
  it('Rückstand: offene Punkte aus vergangenen Wochen', () => {
    const s = planStatus(plan, doneSet(week(0)), '2026-11-18', '2026-12-14')
    expect(s.pace).toBe('behind')
    expect(s.overdue.map((i) => i.id)).toEqual(week(1))
  })
  it('voraus, wenn Kommendes schon erledigt ist; die laufende Woche ist nie überfällig', () => {
    const s = planStatus(plan, doneSet([...week(0), ...week(4)]), '2026-11-04', '2026-12-14')
    expect(s.pace).toBe('ahead')
    expect(s.aheadCount).toBe(week(4).length)
    expect(planStatus(plan, doneSet([]), '2026-11-04', '2026-12-14').pace).toBe('on-track')
    expect(planStatus(plan, doneSet([]), '2026-10-20', '2026-12-14').dueByNow).toBe(0)
  })
  it('fertig und Termin vorbei', () => {
    const all = plan.weeks.flatMap((w) => w.items.map((i) => i.id))
    expect(planStatus(plan, doneSet(all), '2026-12-01', '2026-12-14').pace).toBe('done')
    expect(planStatus(plan, doneSet([]), '2026-12-20', '2026-12-14').pace).toBe('over')
  })
})

describe('Neuverteilen und Wochenstatistik', () => {
  it('erledigte Punkte fallen heraus, der Rest wird ab dem neuen Start verteilt', () => {
    const ids = doneIds(plan, doneSet(['tidal-height', 'secondary-ports', 'exam-1']))
    expect(ids.sort()).toEqual(['exam-1', 'secondary-ports', 'tidal-height'])
    const re = buildPlan('coastal-skipper', new Date('2026-11-23'), new Date('2026-12-14'), 3, ids)
    const items = re.weeks.flatMap((w) => w.items.map((i) => i.id))
    expect(items).toHaveLength(curriculum('coastal-skipper').length + 3 - 3)
    expect(items).not.toContain('tidal-height')
    expect(re.weeks[re.weeks.length - 1].items.map((i) => i.id)).toEqual(['exam-2'])
    expect(re.weeks[0].start).toBe('2026-11-23')
  })
  it('zählt geplant und erledigt je Woche', () => {
    const w = weeklyProgress(plan, doneSet([plan.weeks[0].items[0].id]))
    expect(w).toHaveLength(7)
    expect(w[0]).toEqual({ week: '1', planned: plan.weeks[0].items.length, done: 1 })
    expect(w.reduce((n, x) => n + x.planned, 0)).toBe(curriculum('coastal-skipper').length + 3)
  })
})
