import { useMemo } from 'react'
import { buildPlan, currentWeekIndex, isDone, planStatus, type PlanItem, type PlanStatus, type StudyPlan } from '@/lib/studyPlan'
import { usePlanStore, type PlanSettings } from '@/stores/planStore'
import { useProgressStore } from '@/stores/progressStore'

export const todayIso = () => new Date().toISOString().slice(0, 10)

export interface PlanView {
  settings: PlanSettings
  plan: StudyPlan
  done: (item: PlanItem) => boolean
  current: number
  doneCount: number
  total: number
  status: PlanStatus
}

/** Lernplan aus den gespeicherten Einstellungen samt Erledigt-Status aus dem Lernfortschritt. */
export function usePlanView(): PlanView | null {
  const settings = usePlanStore((s) => s.plan)
  const completedLessons = useProgressStore((s) => s.completedLessons)
  const learnedTerms = useProgressStore((s) => s.learnedTerms)
  const attempts = useProgressStore((s) => s.attempts)
  return useMemo(() => {
    if (!settings) return null
    const plan = buildPlan(settings.level, new Date(settings.start), new Date(settings.exam), settings.sessionsPerWeek, settings.exclude)
    const snapshot = { completedLessons, learnedTerms, attempts, planStart: settings.countFrom ?? settings.start, level: settings.level }
    const done = (item: PlanItem) => isDone(item, snapshot)
    const all = plan.weeks.flatMap((w) => w.items)
    const today = todayIso()
    return {
      settings,
      plan,
      done,
      current: currentWeekIndex(plan, today),
      doneCount: all.filter(done).length,
      total: all.length,
      status: planStatus(plan, done, today, settings.exam),
    }
  }, [settings, completedLessons, learnedTerms, attempts])
}
