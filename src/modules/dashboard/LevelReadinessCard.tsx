import { useMemo, useState } from 'react'
import { ArrowRight, CheckCircle2, Circle, ListChecks } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FLASHCARDS } from '@/data/flashcards'
import { levelReadiness, type LevelVerdict } from '@/lib/levelReadiness'
import { isDue } from '@/lib/spacedRepetition'
import { Toggle } from '@/modules/calculators/fields'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { usePlanStore } from '@/stores/planStore'
import { useProgressStore } from '@/stores/progressStore'
import type { CourseLevel } from '@/types/learning'

const VERDICT: Record<LevelVerdict, { label: string; variant: 'success' | 'default' | 'secondary' }> = {
  ready: { label: 'Alles erledigt', variant: 'success' },
  close: { label: 'Fast geschafft', variant: 'default' },
  early: { label: 'Noch einiges offen', variant: 'secondary' },
}

/** Checkliste je Stufe: Lektionen, Rechenarten, Probeprüfungen und Lernkarten mit den nächsten Schritten. */
export function LevelReadinessCard() {
  const planLevel = usePlanStore((s) => s.plan?.level)
  const [level, setLevel] = useState<CourseLevel>(planLevel ?? 'day-skipper')
  const completedLessons = useProgressStore((s) => s.completedLessons)
  const learnedTerms = useProgressStore((s) => s.learnedTerms)
  const questionStats = useProgressStore((s) => s.questionStats)
  const attempts = useProgressStore((s) => s.attempts)
  const cards = useFlashcardStore((s) => s.cards)
  const r = useMemo(() => {
    const now = new Date()
    const dueCards = FLASHCARDS.filter((c) => cards[c.id] && isDue(cards[c.id], now)).length
    return levelReadiness(level, { completedLessons, learnedTerms, questionStats, attempts, dueCards })
  }, [level, completedLessons, learnedTerms, questionStats, attempts, cards])
  const v = VERDICT[r.verdict]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="size-5 text-primary" /> Was fehlt noch?
          </CardTitle>
          <Badge variant={v.variant}>{v.label}</Badge>
        </div>
        <Toggle
          value={level}
          onChange={setLevel}
          label="Ausbildungsstufe"
          options={[
            { value: 'day-skipper', label: 'Day Skipper' },
            { value: 'coastal-skipper', label: 'Coastal' },
            { value: 'yachtmaster-offshore', label: 'Yachtmaster' },
          ]}
        />
        <CardDescription>Lektionen, Rechenarten (Ziel 70 %), Probeprüfungen und fällige Lernkarten auf einen Blick.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <ul className="space-y-2">
          {r.items.map((i) => (
            <li key={i.area}>
              <a href={i.href} className="flex items-start gap-3 rounded-lg px-2 py-1.5 hover:bg-muted">
                {i.done ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" aria-label="erledigt" /> : <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" aria-label="offen" />}
                <span className="min-w-0">
                  <span className="block text-sm font-medium">{i.label}</span>
                  <span className="block text-xs text-muted-foreground">{i.detail}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
        <div className="space-y-2">
          <p className="text-sm font-semibold">Nächste Schritte</p>
          {r.steps.length ? (
            <ol className="space-y-1.5">
              {r.steps.map((s, k) => (
                <li key={s.text}>
                  <a href={s.href} className="group flex items-start gap-2 rounded-lg border p-2.5 text-sm hover:bg-muted">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">{k + 1}</span>
                    <span className="flex-1">{s.text}</span>
                    <ArrowRight className="mt-0.5 size-4 shrink-0 transition-transform group-hover:translate-x-0.5" />
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-lg border border-success/40 bg-success/5 p-3 text-sm">Für diese Stufe ist alles erledigt. Halte das Niveau mit gelegentlichen Probeprüfungen.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
