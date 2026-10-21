import { useMemo, useState } from 'react'
import { FunctionSquare, Play } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FORMULA_GROUPS } from '@/data/formulas'
import { CALC_SKILLS, isCalcQuestion, pickCalcQuestions, skillOf, skillStats } from '@/lib/calcSkills'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'
import { QUESTION_BANK } from '@/questions'
import { useProgressStore } from '@/stores/progressStore'
import type { CourseLevel, Question, QuizMode } from '@/types/learning'

const FORMULA_TITLE: Record<string, string> = Object.fromEntries(FORMULA_GROUPS.flatMap((g) => g.items.map((f) => [f.id, f.title.replace('­', '')])))
const COUNTS = [5, 10, 20] as const

/** Einstieg ins Rechentraining: Stufe, Rechenarten und Anzahl wählen, Schwächen zuerst. */
export function CalcTrainingSetup({ onStart }: { onStart: (m: QuizMode, q: Question[]) => void }) {
  const questionStats = useProgressStore((s) => s.questionStats)
  const [level, setLevel] = useState<CourseLevel | 'all'>('day-skipper')
  const [skills, setSkills] = useState<string[]>([])
  const [count, setCount] = useState<(typeof COUNTS)[number]>(10)
  const [weakFirst, setWeakFirst] = useState(true)

  const levelPool = useMemo(() => QUESTION_BANK.filter(isCalcQuestion).filter((q) => level === 'all' || q.level === level), [level])
  const stats = useMemo(() => skillStats(levelPool, questionStats), [levelPool, questionStats])
  const pool = skills.length ? levelPool.filter((q) => skills.includes(skillOf(q)?.id ?? '')) : levelPool
  const n = Math.min(count, pool.length)
  const toggle = (id: string) => setSkills((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const weakest = stats.filter((s) => s.accuracy !== null).sort((a, b) => a.accuracy! - b.accuracy!)[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Rechentraining"
        subtitle={`Nur Rechenaufgaben (${QUESTION_BANK.filter(isCalcQuestion).length} insgesamt), immer mit Rechenweg und Link zur passenden Formel. Mit „Schwächen zuerst“ kommen zuletzt falsch gelöste und neue Aufgaben nach vorn.`}
        actions={
          <Button asChild variant="outline">
            <a href="#/formeln">
              <FunctionSquare className="size-4" /> Formelsammlung
            </a>
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Rechenarten</CardTitle>
            <CardDescription>Antippen, um nur bestimmte Rechenarten zu üben – ohne Auswahl kommen alle dran.</CardDescription>
            <Toggle
              value={level}
              onChange={(l) => {
                setLevel(l)
                setSkills([])
              }}
              label="Ausbildungsstufe"
              options={[
                { value: 'day-skipper', label: 'Day Skipper' },
                { value: 'coastal-skipper', label: 'Coastal' },
                { value: 'yachtmaster-offshore', label: 'Yachtmaster' },
                { value: 'all', label: 'Alle' },
              ]}
            />
          </CardHeader>
          <CardContent>
            <ul className="grid gap-2 sm:grid-cols-2">
              {stats.map((s) => {
                const on = skills.includes(s.skill.id)
                const pct = s.accuracy === null ? null : Math.round(s.accuracy * 100)
                return (
                  <li key={s.skill.id}>
                    <button
                      type="button"
                      onClick={() => toggle(s.skill.id)}
                      aria-pressed={on}
                      className={cn('w-full space-y-1.5 rounded-lg border p-3 text-left transition-colors', on ? 'border-primary bg-accent' : 'hover:bg-muted')}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium">{s.skill.label}</span>
                        <Badge variant={pct === null ? 'secondary' : pct >= 70 ? 'success' : 'destructive'}>{pct === null ? 'neu' : `${pct} %`}</Badge>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
                        <div className={cn('h-full rounded-full', pct !== null && pct >= 70 ? 'bg-success' : 'bg-destructive')} style={{ width: `${pct ?? 0}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {s.available} Aufgaben · {s.answered ? `${s.correct}/${s.answered} richtig` : 'noch nicht geübt'}
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Durchgang</CardTitle>
            {weakest && weakest.accuracy! < 0.7 && (
              <CardDescription>
                Schwächste Rechenart: <span className="font-medium text-foreground">{weakest.skill.label}</span> –{' '}
                <a className="text-primary hover:underline" href={`#/formeln/${weakest.skill.formulaId}`}>
                  {FORMULA_TITLE[weakest.skill.formulaId]}
                </a>{' '}
                ansehen.
              </CardDescription>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <span className="text-sm font-medium">Anzahl</span>
              <div>
                <Toggle value={String(count) as '5' | '10' | '20'} onChange={(v) => setCount(Number(v) as 5 | 10 | 20)} label="Anzahl Aufgaben" options={COUNTS.map((c) => ({ value: String(c) as '5' | '10' | '20', label: String(c) }))} />
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={weakFirst} onChange={(e) => setWeakFirst(e.target.checked)} className="size-4 accent-[var(--primary)]" />
              Schwächen zuerst
            </label>
            <Button className="w-full" disabled={n === 0} onClick={() => onStart('learn', pickCalcQuestions(pool, questionStats, n, weakFirst))}>
              <Play /> {n} Aufgaben rechnen
            </Button>
            <p className="text-xs text-muted-foreground">
              {skills.length ? `${skills.length} von ${CALC_SKILLS.length} Rechenarten gewählt, ` : ''}
              {pool.length} Aufgaben in der Auswahl. Immer im Lernmodus mit sofortigem Rechenweg.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
