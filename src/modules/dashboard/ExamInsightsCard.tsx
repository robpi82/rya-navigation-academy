import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, GraduationCap, Target } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { topicInfo } from '@/data/topics'
import { DAY_TOPICS, COASTAL_TOPICS, YACHT_TOPICS } from '@/data/topics'
import { TERM_BY_ID } from '@/data/glossary'
import { PASS_PERCENT } from '@/lib/exam'
import { groupPerformance, readiness, topicLinks, weakestTopics, type Readiness } from '@/lib/examInsights'
import { cn } from '@/lib/utils'
import type { CourseLevel, QuizAttempt, TopicId } from '@/types/learning'
import { Toggle } from '@/modules/calculators/fields'

const STATUS: Record<Readiness, { label: string; variant: 'secondary' | 'destructive' | 'default' | 'success' }> = {
  none: { label: 'Noch keine Probeprüfung', variant: 'secondary' },
  early: { label: 'Noch nicht prüfungsreif', variant: 'destructive' },
  close: { label: 'Auf gutem Weg', variant: 'default' },
  ready: { label: 'Prüfungsreif', variant: 'success' },
}

export const germanName = (t: TopicId): string => {
  if (t in DAY_TOPICS) return DAY_TOPICS[t as keyof typeof DAY_TOPICS].german
  if (t in COASTAL_TOPICS) return COASTAL_TOPICS[t as keyof typeof COASTAL_TOPICS].german
  if (t in YACHT_TOPICS) return YACHT_TOPICS[t as keyof typeof YACHT_TOPICS].german
  return TERM_BY_ID[t as keyof typeof TERM_BY_ID]?.german ?? topicInfo(t).english
}

/** Stärken und Schwächen aus Probeprüfungen und Übungen, mit Empfehlungen zum gezielten Lernen. */
export function ExamInsightsCard({ attempts }: { attempts: QuizAttempt[] }) {
  const [level, setLevel] = useState<CourseLevel>('day-skipper')
  const ready = useMemo(() => readiness(attempts, level), [attempts, level])
  const groups = useMemo(() => groupPerformance(attempts), [attempts])
  const weak = useMemo(() => weakestTopics(attempts), [attempts])
  const status = STATUS[ready.status]

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2">
            <Target className="size-5 text-primary" /> Prüfungsreife
          </CardTitle>
          <Badge variant={status.variant}>{status.label}</Badge>
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
        <CardDescription>
          {ready.message}
          {ready.recentAverage !== null && ` Schnitt der letzten ${ready.examsCounted === 1 ? 'Prüfung' : `${ready.examsCounted} Prüfungen`}: ${Math.round(ready.recentAverage)} % (Grenze ${PASS_PERCENT} %).`}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm font-semibold">Themengruppen in Probeprüfungen</p>
          {groups.length ? (
            groups.map((g) => (
              <div key={g.group} className="space-y-1">
                <div className="flex justify-between gap-2 text-sm">
                  <span>{g.label}</span>
                  <span className="font-mono tabular-nums">
                    {Math.round(g.percent)} % <span className="text-muted-foreground">({g.correct}/{g.total})</span>
                  </span>
                </div>
                <div className="relative h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
                  <div className={cn('h-full rounded-full', g.percent >= PASS_PERCENT ? 'bg-success' : 'bg-destructive')} style={{ width: `${g.percent}%` }} />
                  <div className="absolute inset-y-0 w-px bg-foreground/60" style={{ left: `${PASS_PERCENT}%` }} />
                </div>
              </div>
            ))
          ) : (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Nach der ersten Probeprüfung siehst du hier, wie du in jeder Themengruppe abschneidest.</p>
          )}
          <Button variant="outline" size="sm" asChild>
            <a href="#/pruefung">
              <GraduationCap /> Probeprüfung starten
            </a>
          </Button>
        </div>
        <div className="space-y-3">
          <p className="text-sm font-semibold">Schwächste Themen (jüngste Antworten)</p>
          {weak.length ? (
            <ul className="space-y-2">
              {weak.map((w) => {
                const links = topicLinks(w.topic)
                return (
                  <li key={w.topic} className="rounded-lg border p-3">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <span className="font-medium">{germanName(w.topic)}</span>
                      <span className="text-sm text-destructive">
                        {w.wrong} von {w.answered} falsch
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" asChild>
                        <a href={links.lesson}>
                          <BookOpen /> Lektion
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a href={links.quiz}>
                          Gezielt üben <ArrowRight />
                        </a>
                      </Button>
                    </div>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">
              {attempts.length ? 'Kein Thema fällt derzeit auffällig ab – weiter so.' : 'Beantworte einige Fragen im Prüfungstrainer, dann zeigt die App hier deine schwächsten Themen.'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
