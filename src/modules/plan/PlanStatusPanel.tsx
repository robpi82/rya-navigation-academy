import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Shuffle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { doneIds, weeklyProgress, type PlanPace } from '@/lib/studyPlan'
import { usePlanStore } from '@/stores/planStore'
import { PlanItemRow } from './PlanItemRow'
import { todayIso, type PlanView } from './usePlan'

const PACE: Record<PlanPace, { label: string; variant: 'secondary' | 'destructive' | 'default' | 'success' }> = {
  done: { label: 'Alles erledigt', variant: 'success' },
  ahead: { label: 'Vor dem Plan', variant: 'success' },
  'on-track': { label: 'Im Plan', variant: 'default' },
  behind: { label: 'Hinter dem Plan', variant: 'destructive' },
  over: { label: 'Prüfungstermin vorbei', variant: 'secondary' },
}

export function PaceBadge({ pace, overdue }: { pace: PlanPace; overdue: number }) {
  const p = PACE[pace]
  return <Badge variant={p.variant}>{pace === 'behind' ? `${overdue} ${overdue === 1 ? 'Einheit' : 'Einheiten'} im Rückstand` : p.label}</Badge>
}

/** Ein Satz zum Stand: Tage bis zur Prüfung, offene Einheiten und nötiges Tempo. */
export function paceSentence(view: PlanView): string {
  const { status } = view
  if (status.pace === 'done') return 'Alle geplanten Einheiten sind erledigt – jetzt nur noch Fehler wiederholen und ausgeruht in die Prüfung.'
  if (status.pace === 'over') return `Der Prüfungstermin ist vorbei; ${status.open} Einheiten sind offen geblieben. Leg einen neuen Plan an, wenn du weiterlernen willst.`
  const weeks = Math.max(1, Math.ceil((status.daysLeft + 1) / 7))
  const perWeek = Math.ceil(status.open / weeks)
  const days = status.daysLeft === 0 ? 'Heute ist Prüfungstag' : `Noch ${status.daysLeft} ${status.daysLeft === 1 ? 'Tag' : 'Tage'} bis zur Prüfung`
  return `${days}, ${status.open} offene ${status.open === 1 ? 'Einheit' : 'Einheiten'} – im Schnitt ${perWeek} pro Woche.`
}

/** Rest des Plans ab heute neu verteilen; Erledigtes fällt heraus, Prüfungen zählen weiter ab dem ersten Planbeginn. */
export function useReplan(view: PlanView | null) {
  const setPlan = usePlanStore((s) => s.setPlan)
  if (!view || view.status.daysLeft < 1) return null
  return () => {
    const { settings, plan, done } = view
    setPlan({ ...settings, start: todayIso(), exclude: [...new Set([...(settings.exclude ?? []), ...doneIds(plan, done)])], countFrom: settings.countFrom ?? settings.start })
  }
}

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
  fontSize: 12,
}

/** Status, Nachholliste und Wochendiagramm für die Lernplan-Seite. */
export function PlanStatusPanel({ view }: { view: PlanView }) {
  const replan = useReplan(view)
  const data = weeklyProgress(view.plan, view.done).map((d) => ({ name: d.week, Geplant: d.planned, Erledigt: d.done }))
  const { status } = view
  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <PaceBadge pace={status.pace} overdue={status.overdue.length} />
          <span className="text-sm tabular-nums text-muted-foreground">
            bis diese Woche: {status.doneByNow}/{status.dueByNow}
          </span>
        </div>
        <p className="text-sm">{paceSentence(view)}</p>
        {status.aheadCount > 0 && <p className="text-sm text-muted-foreground">{status.aheadCount} Einheiten aus kommenden Wochen hast du schon vorgezogen.</p>}
        {status.overdue.length > 0 && (
          <div className="space-y-1">
            <p className="text-sm font-semibold">Nachholen</p>
            <ul className="space-y-0.5">
              {status.overdue.map((i) => (
                <PlanItemRow key={i.id} item={i} done={false} />
              ))}
            </ul>
          </div>
        )}
        {replan && status.pace === 'behind' && (
          <div className="space-y-1 print:hidden">
            <Button variant="outline" size="sm" onClick={replan}>
              <Shuffle className="size-4" /> Restplan ab heute neu verteilen
            </Button>
            <p className="text-xs text-muted-foreground">Erledigtes fällt heraus, der Prüfungstermin bleibt.</p>
          </div>
        )}
      </div>
      <div className="min-w-0">
        <p className="mb-1 text-sm font-semibold">Einheiten je Woche (Woche 1–{data.length})</p>
        <div className="mb-2 flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-muted-foreground/40" /> Geplant
          </span>
          <span className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-sm bg-success" /> Erledigt
          </span>
        </div>
        <div className="h-48" role="img" aria-label="Geplante und erledigte Einheiten je Woche">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }} barGap={2}>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
              <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'var(--muted)' }} />
              <Bar dataKey="Geplant" fill="color-mix(in oklch, var(--muted-foreground) 40%, transparent)" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="Erledigt" fill="var(--success)" radius={[4, 4, 0, 0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
