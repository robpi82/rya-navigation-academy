import { ArrowRight, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PlanItemRow } from './PlanItemRow'
import { usePlanView } from './usePlan'
import { PaceBadge, paceSentence } from './PlanStatusPanel'

/** Dashboard-Karte: Punkte der aktuellen Lernplan-Woche oder Hinweis zum Anlegen. */
export function PlanWeekCard({ className }: { className?: string }) {
  const view = usePlanView()
  if (!view)
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-start gap-3 pt-5">
          <div className="flex items-start gap-3">
            <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" />
            <div>
              <p className="font-semibold">Lernplan bis zur Prüfung</p>
              <p className="text-sm text-muted-foreground">Prüfungstermin eintragen und die Lektionen auf die Wochen verteilen lassen.</p>
            </div>
          </div>
          <Button asChild variant="outline">
            <a href="#/lernplan">
              Plan anlegen <ArrowRight className="size-4" />
            </a>
          </Button>
        </CardContent>
      </Card>
    )
  const week = view.plan.weeks[view.current]
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" /> Dein Wochenlernplan
          </CardTitle>
          <PaceBadge pace={view.status.pace} overdue={view.status.overdue.length} />
        </div>
        <CardDescription>
          Woche {view.current + 1} von {view.plan.weeks.length} · insgesamt {view.doneCount + (view.settings.exclude?.length ?? 0)}/{view.total + (view.settings.exclude?.length ?? 0)} erledigt
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{paceSentence(view)}</p>
        {view.status.overdue.length > 0 && (
          <div>
            <p className="px-2 text-xs font-semibold tracking-wide text-destructive uppercase">Nachholen</p>
            <ul className="space-y-0.5">
              {view.status.overdue.slice(0, 3).map((i) => (
                <PlanItemRow key={i.id} item={i} done={false} />
              ))}
            </ul>
            {view.status.overdue.length > 3 && <p className="px-2 text-xs text-muted-foreground">… und {view.status.overdue.length - 3} weitere</p>}
          </div>
        )}
        {week.items.length ? (
          <ul className="space-y-0.5">
            {week.items.map((i) => (
              <PlanItemRow key={i.id} item={i} done={view.done(i)} />
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Pufferwoche – Fehler wiederholen oder Lernkarten.</p>
        )}
        <a href="#/lernplan" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
          Ganzen Plan ansehen <ArrowRight className="size-4" />
        </a>
      </CardContent>
    </Card>
  )
}
