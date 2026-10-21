import { useMemo } from 'react'
import { buildPlan, isDone, type PlanItem, type StudyPlan } from '@/lib/studyPlan'
import { usePlanStore, type PlanSettings } from '@/stores/planStore'
import { useProgressStore } from '@/stores/progressStore'

export const todayIso = () => new Date().toISOString().slice(0, 10)

/** Index der aktuellen Woche im Plan (vor Beginn 0, nach Ende die letzte Woche). */
export function currentWeekIndex(plan: StudyPlan, today = todayIso()): number {
  let idx = 0
  plan.weeks.forEach((w, i) => {
    if (w.start <= today) idx = i
  })
  return idx
}

export interface PlanView {
  settings: PlanSettings
  plan: StudyPlan
  done: (item: PlanItem) => boolean
  current: number
  doneCount: number
  total: number
}

/** Lernplan aus den gespeicherten Einstellungen samt Erledigt-Status aus dem Lernfortschritt. */
export function usePlanView(): PlanView | null {
  const settings = usePlanStore((s) => s.plan)
  const completedLessons = useProgressStore((s) => s.completedLessons)
  const learnedTerms = useProgressStore((s) => s.learnedTerms)
  const attempts = useProgressStore((s) => s.attempts)
  return useMemo(() => {
    if (!settings) return null
    const plan = buildPlan(settings.level, new Date(settings.start), new Date(settings.exam), settings.sessionsPerWeek)
    const snapshot = { completedLessons, learnedTerms, attempts, planStart: settings.start, level: settings.level }
    const done = (item: PlanItem) => isDone(item, snapshot)
    const all = plan.weeks.flatMap((w) => w.items)
    return { settings, plan, done, current: currentWeekIndex(plan), doneCount: all.filter(done).length, total: all.length }
  }, [settings, completedLessons, learnedTerms, attempts])
}
