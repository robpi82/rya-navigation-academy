import type { CourseLevel, QuizAttempt, TermId } from '@/types/learning'
import { COASTAL_TOPICS, DAY_TOPICS, YACHT_TOPICS } from '@/data/topics'
import { presetLevel } from './examInsights'

/**
 * Lernplan: verteilt die Lektionen einer Ausbildungsstufe in empfohlener Reihenfolge auf die Wochen bis zum Prüfungstermin.
 * Die letzten Lerneinheiten sind für Wiederholung und Probeprüfungen reserviert.
 */

export type PlanItemKind = 'terms' | 'lesson' | 'review' | 'exam'

export interface PlanItem {
  id: string
  kind: PlanItemKind
  title: string
  href: string
  /** Begriffe (nur bei kind 'terms') */
  terms?: TermId[]
}

export interface PlanWeek {
  index: number
  /** Montag der Woche (ISO-Datum) */
  start: string
  items: PlanItem[]
}

const lesson = (id: string, title: string, base: string): PlanItem => ({ id, kind: 'lesson', title, href: `${base}/${id}` })

/** Empfohlene Reihenfolge je Stufe */
export function curriculum(level: CourseLevel): PlanItem[] {
  if (level === 'day-skipper') {
    const day = (id: keyof typeof DAY_TOPICS) => lesson(id, DAY_TOPICS[id].german, '#/themen')
    return [
      { id: 'terms-1', kind: 'terms', title: 'Grundbegriffe: Heading, STW, Water Track', href: '#/glossar', terms: ['hdg', 'stw', 'water-track'] },
      { id: 'terms-2', kind: 'terms', title: 'Grundbegriffe: Leeway, COG, SOG', href: '#/glossar', terms: ['leeway', 'cog', 'sog'] },
      { id: 'terms-3', kind: 'terms', title: 'Grundbegriffe: Ground Track, Fix, EP', href: '#/glossar', terms: ['ground-track', 'fix', 'ep'] },
      day('compass'),
      day('tides'),
      day('chart-reading'),
      day('bearings'),
      day('buoyage'),
      day('colregs'),
      day('weather'),
      day('safety'),
      day('electronics'),
    ]
  }
  if (level === 'coastal-skipper') {
    const ids: (keyof typeof COASTAL_TOPICS)[] = ['tidal-height', 'secondary-ports', 'multi-hour-tide', 'running-fix', 'clearing-bearing', 'pilotage', 'passage-planning', 'fog', 'heavy-weather', 'mooring', 'emergencies']
    return ids.map((id) => lesson(id, COASTAL_TOPICS[id].german, '#/coastal'))
  }
  const ids: (keyof typeof YACHT_TOPICS)[] = ['great-circle', 'weather-routing', 'night-passage', 'night-navigation', 'radar-plotting', 'celestial', 'sight-reduction']
  return ids.map((id) => lesson(id, YACHT_TOPICS[id].german, '#/yachtmaster'))
}

const finale = (): PlanItem[] => [
  { id: 'review', kind: 'review', title: 'Fehler wiederholen', href: '#/quiz/wiederholen' },
  { id: 'exam-1', kind: 'exam', title: 'Probeprüfung 1', href: '#/pruefung' },
  { id: 'exam-2', kind: 'exam', title: 'Probeprüfung 2', href: '#/pruefung' },
]

const DAY_MS = 86_400_000
const toIso = (d: Date) => d.toISOString().slice(0, 10)
const monday = (d: Date) => {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const wd = (x.getUTCDay() + 6) % 7
  return new Date(x.getTime() - wd * DAY_MS)
}

/** Wochen zwischen zwei Daten (mindestens 1), gezählt ab dem Montag der Startwoche. */
export function weeksBetween(start: Date, exam: Date): number {
  return Math.max(1, Math.ceil((exam.getTime() - monday(start).getTime() + 1) / (7 * DAY_MS)))
}

export interface StudyPlan {
  weeks: PlanWeek[]
  /** Lerneinheiten pro Woche, die der Plan braucht (über alle Wochen gemittelt) */
  itemsPerWeek: number
  /** true, wenn mehr Einheiten nötig sind, als pro Woche eingeplant */
  tooDense: boolean
}

/** Verteilt Lektionen gleichmäßig auf die Wochen; Wiederholung und Probeprüfungen kommen in die letzte Woche (bzw. die letzten zwei). */
export function buildPlan(level: CourseLevel, start: Date, exam: Date, sessionsPerWeek: number, exclude: string[] = []): StudyPlan {
  const weeksN = weeksBetween(start, exam)
  const learn = curriculum(level).filter((i) => !exclude.includes(i.id))
  const fin = finale()
  const learnWeeks = weeksN >= 3 ? weeksN - 1 : weeksN
  const weeks: PlanWeek[] = Array.from({ length: weeksN }, (_, i) => ({ index: i, start: toIso(new Date(monday(start).getTime() + i * 7 * DAY_MS)), items: [] }))
  learn.forEach((item, i) => weeks[Math.min(learnWeeks - 1, Math.floor((i * learnWeeks) / learn.length))].items.push(item))
  const keep = (i: PlanItem) => !exclude.includes(i.id)
  if (keep(fin[0])) weeks[weeksN >= 3 ? weeksN - 2 : weeksN - 1].items.push(fin[0])
  weeks[weeksN - 1].items.push(...fin.slice(1).filter(keep))
  const maxPerWeek = Math.max(...weeks.map((w) => w.items.length))
  const count = learn.length + fin.filter(keep).length
  return { weeks, itemsPerWeek: count / weeksN, tooDense: maxPerWeek > sessionsPerWeek }
}

export interface ProgressSnapshot {
  completedLessons: string[]
  learnedTerms: TermId[]
  attempts: QuizAttempt[]
  /** Startdatum des Plans (ISO) – Prüfungen zählen erst ab hier */
  planStart: string
  level: CourseLevel
}

/** Ist ein Planpunkt erledigt? Probeprüfungen zählen in der Reihenfolge ihrer Ablage ab Planbeginn. */
export function isDone(item: PlanItem, p: ProgressSnapshot): boolean {
  if (item.kind === 'lesson') return p.completedLessons.includes(item.id)
  if (item.kind === 'terms') return (item.terms ?? []).every((t) => p.learnedTerms.includes(t))
  const since = p.attempts.filter((a) => a.date.slice(0, 10) >= p.planStart)
  if (item.kind === 'review') return since.some((a) => !a.exam && a.mode === 'learn' && a.answers.length > 0)
  const exams = since.filter((a) => a.exam && presetLevel(a.exam.presetId) === p.level)
  return exams.length >= (item.id === 'exam-2' ? 2 : 1)
}

/** Index der aktuellen Woche (vor Beginn 0, nach dem Ende die letzte Woche). */
export function currentWeekIndex(plan: StudyPlan, today: string): number {
  let idx = 0
  plan.weeks.forEach((w, i) => {
    if (w.start <= today) idx = i
  })
  return idx
}

export type PlanPace = 'done' | 'ahead' | 'on-track' | 'behind' | 'over'

export interface PlanStatus {
  pace: PlanPace
  /** offene Punkte aus vergangenen Wochen */
  overdue: PlanItem[]
  /** bereits erledigte Punkte aus kommenden Wochen */
  aheadCount: number
  /** Punkte, die bis Ende der aktuellen Woche fällig sind, und davon erledigt */
  dueByNow: number
  doneByNow: number
  /** offene Punkte insgesamt */
  open: number
  /** Tage bis zur Prüfung (negativ = vorbei) */
  daysLeft: number
}

/** Vergleicht den Plan mit dem Lernstand: Was ist überfällig, was schon vorgezogen? */
export function planStatus(plan: StudyPlan, done: (i: PlanItem) => boolean, today: string, examDate: string): PlanStatus {
  const current = today < plan.weeks[0].start ? -1 : currentWeekIndex(plan, today)
  const past = plan.weeks.filter((w) => w.index < current).flatMap((w) => w.items)
  const upToNow = plan.weeks.filter((w) => w.index <= current).flatMap((w) => w.items)
  const future = plan.weeks.filter((w) => w.index > current).flatMap((w) => w.items)
  const all = plan.weeks.flatMap((w) => w.items)
  const overdue = past.filter((i) => !done(i))
  const aheadCount = future.filter(done).length
  const open = all.filter((i) => !done(i)).length
  const daysLeft = Math.round((Date.parse(examDate) - Date.parse(today)) / DAY_MS)
  let pace: PlanPace
  if (open === 0) pace = 'done'
  else if (daysLeft < 0) pace = 'over'
  else if (overdue.length > 0) pace = 'behind'
  else if (aheadCount > 0) pace = 'ahead'
  else pace = 'on-track'
  return { pace, overdue, aheadCount, dueByNow: upToNow.length, doneByNow: upToNow.filter(done).length, open, daysLeft }
}

/** Geplante und erledigte Punkte je Woche (für das Diagramm). */
export function weeklyProgress(plan: StudyPlan, done: (i: PlanItem) => boolean): { week: string; planned: number; done: number }[] {
  return plan.weeks.map((w) => ({ week: String(w.index + 1), planned: w.items.length, done: w.items.filter(done).length }))
}

/** IDs aller erledigten Punkte – sie fallen beim Neuverteilen des Restplans heraus. */
export function doneIds(plan: StudyPlan, done: (i: PlanItem) => boolean): string[] {
  return plan.weeks.flatMap((w) => w.items).filter(done).map((i) => i.id)
}
