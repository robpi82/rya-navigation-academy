import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TERM_BY_ID, TERM_IDS } from '@/data/glossary'
import { QUESTION_BY_ID } from '@/questions'
import { PASS_PERCENT } from '@/lib/exam'
import { attemptScore, dayKey, errorRateBy, lastDays, topicStats } from '@/lib/stats'
import { reviewsPerDay, useFlashcardStore } from '@/stores/flashcardStore'
import { CATEGORY_LABEL, type QuestionCategory, type QuizAttempt } from '@/types/learning'
import { EmptyChart, Panel, PanelTitle } from './DashboardParts'

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
  fontSize: 12,
}
const axisTick = { fill: 'var(--muted-foreground)', fontSize: 11 }

/** Beantwortete Fragen und bewertete Lernkarten je Tag (Tooltip mit Aufschlüsselung und Lernminuten). */
export function ActivityChart({ attempts, studySeconds, days = 30 }: { attempts: QuizAttempt[]; studySeconds: Record<string, number>; days?: number }) {
  const flashLog = useFlashcardStore((s) => s.log)
  const activity = useMemo(() => {
    const reviews = reviewsPerDay(flashLog)
    const answersPerDay: Record<string, number> = {}
    for (const a of attempts) {
      const k = dayKey(new Date(a.date))
      answersPerDay[k] = (answersPerDay[k] ?? 0) + a.answers.length
    }
    return lastDays(studySeconds, days).map((d) => {
      const [y, m, dd] = d.day.split('-').map(Number)
      return {
        name: new Date(y, m - 1, dd).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' }),
        minutes: Math.round(d.value / 60),
        reviews: reviews[d.day] ?? 0,
        answers: answersPerDay[d.day] ?? 0,
        Lernaktionen: (reviews[d.day] ?? 0) + (answersPerDay[d.day] ?? 0),
      }
    })
  }, [studySeconds, flashLog, attempts, days])
  const hasActivity = activity.some((d) => d.Lernaktionen > 0)

  return (
    <Panel className="p-5">
      <PanelTitle>Lernaktivität der letzten {days} Tage</PanelTitle>
      <p className="mb-3 text-xs text-muted-foreground">Beantwortete Fragen und bewertete Lernkarten pro Tag</p>
      <div className="h-52">
        {hasActivity ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={activity} margin={{ top: 8, right: 4, left: -22, bottom: 0 }}>
              <defs>
                <linearGradient id="activityBar" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
              <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} interval={6} />
              <YAxis allowDecimals={false} tick={axisTick} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                contentStyle={tooltipStyle}
                formatter={(v, _n, item) => [`${v} (${item.payload.answers} Antworten, ${item.payload.reviews} Karten, ${item.payload.minutes} min)`, 'Lernaktionen']}
              />
              <Bar dataKey="Lernaktionen" fill="url(#activityBar)" radius={[3, 3, 0, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart text="Noch keine Lernaktivität aufgezeichnet." />
        )}
      </div>
    </Panel>
  )
}

/** Ergebnisse der letzten Probeprüfungen mit Bestehensgrenze. */
export function ExamResultsChart({ attempts }: { attempts: QuizAttempt[] }) {
  const examData = useMemo(
    () =>
      attempts
        .filter((a) => a.mode === 'exam')
        .slice(-12)
        .map((a, i) => ({
          name: `Test ${i + 1}`,
          date: new Date(a.date).toLocaleDateString('de-DE'),
          Ergebnis: Math.round(attemptScore(a) * 100),
        })),
    [attempts],
  )
  return (
    <Panel className="p-5">
      <PanelTitle>Prüfungsergebnisse</PanelTitle>
      <p className="mb-3 text-xs text-muted-foreground">Letzte Durchgänge im Prüfungsmodus (%)</p>
      <div className="h-52">
        {examData.length ? (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={examData} margin={{ top: 8, right: 12, left: -16, bottom: 0 }}>
              <CartesianGrid stroke="var(--chart-grid)" />
              <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tick={axisTick} axisLine={false} tickLine={false} unit="%" />
              <Tooltip contentStyle={tooltipStyle} labelFormatter={(_l, p) => p?.[0]?.payload.date ?? ''} formatter={(v: number) => [`${v} %`, 'Ergebnis']} />
              <ReferenceLine
                y={PASS_PERCENT}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{ value: 'Bestehensgrenze', position: 'insideTopRight', fill: 'var(--muted-foreground)', fontSize: 11 }}
              />
              <Line type="monotone" dataKey="Ergebnis" stroke="#38bdf8" strokeWidth={2} dot={{ r: 4, fill: '#38bdf8' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <EmptyChart text="Noch kein Durchgang im Prüfungsmodus." />
        )}
      </div>
    </Panel>
  )
}

const SLICE_COLORS = ['#f05252', '#f59e0b', '#e7c98a', '#38bdf8', '#64748b']

/** Fehlerquote nach Thema oder Aufgabentyp: Ring zeigt die Verteilung der falschen Antworten, Mitte die Gesamtfehlerquote. */
export function ErrorRateChart({ attempts }: { attempts: QuizAttempt[] }) {
  const [errorView, setErrorView] = useState<'topic' | 'category'>('topic')
  const rows = useMemo(
    () =>
      errorView === 'topic'
        ? topicStats(attempts, TERM_IDS).map((t) => ({ name: TERM_BY_ID[t.topic].abbr, full: TERM_BY_ID[t.topic].english, answered: t.answered, wrong: t.wrong, errorRate: t.errorRate }))
        : errorRateBy(attempts, Object.keys(CATEGORY_LABEL) as QuestionCategory[], (id) => QUESTION_BY_ID[id]?.category).map((c) => ({
            name: CATEGORY_LABEL[c.key].split(/[- ]/)[0],
            full: CATEGORY_LABEL[c.key],
            answered: c.answered,
            wrong: c.wrong,
            errorRate: c.errorRate,
          })),
    [attempts, errorView],
  )
  const answered = rows.reduce((n, r) => n + r.answered, 0)
  const wrong = rows.reduce((n, r) => n + r.wrong, 0)
  const slices = useMemo(() => {
    const sorted = rows.filter((r) => r.wrong > 0).sort((a, b) => b.wrong - a.wrong)
    const top = sorted.slice(0, 4)
    const rest = sorted.slice(4)
    const out = top.map((r) => ({ ...r, share: r.wrong / Math.max(1, wrong) }))
    if (rest.length) {
      const restAnswered = rest.reduce((n, r) => n + r.answered, 0)
      const restWrong = rest.reduce((n, r) => n + r.wrong, 0)
      out.push({ name: 'Sonstige', full: rest.map((r) => r.full).join(', '), answered: restAnswered, wrong: restWrong, errorRate: restWrong / restAnswered, share: restWrong / wrong })
    }
    return out
  }, [rows, wrong])

  return (
    <Panel className="p-5">
      <PanelTitle
        aside={
          <div className="inline-flex rounded-lg bg-muted p-1 text-xs" role="group" aria-label="Gruppierung">
            {(['topic', 'category'] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setErrorView(v)}
                aria-pressed={errorView === v}
                className={errorView === v ? 'rounded-md bg-white/15 px-2.5 py-1 font-medium text-white' : 'rounded-md px-2.5 py-1 text-muted-foreground hover:text-foreground'}
              >
                {v === 'topic' ? 'nach Thema' : 'nach Aufgabentyp'}
              </button>
            ))}
          </div>
        }
      >
        Fehlerquote
      </PanelTitle>
      <p className="mb-3 text-xs text-muted-foreground">Anteil der falschen Antworten je {errorView === 'topic' ? 'Grundbegriff' : 'Aufgabentyp'}</p>
      {answered === 0 ? (
        <div className="h-52">
          <EmptyChart text="Beantworte Fragen im Prüfungstrainer, um deine Schwachstellen zu sehen." />
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 sm:flex-row">
          <div className="relative size-40 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices.length ? slices : [{ name: 'keine', wrong: 1 }]}
                  dataKey="wrong"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="98%"
                  paddingAngle={slices.length > 1 ? 2 : 0}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.length ? slices.map((s, i) => <Cell key={s.name} fill={SLICE_COLORS[i]} />) : <Cell fill="rgb(255 255 255 / 0.12)" />}
                </Pie>
                {slices.length > 0 && (
                  <Tooltip
                    contentStyle={tooltipStyle}
                    formatter={(_v, _n, item) => [
                      `${Math.round(item.payload.errorRate * 100)} % falsch (${item.payload.wrong} von ${item.payload.answered} Antworten)`,
                      item.payload.full,
                    ]}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display text-3xl font-semibold text-white tabular-nums">{Math.round((wrong / answered) * 100)} %</span>
              <span className="text-[11px] text-muted-foreground">Fehlerquote</span>
            </div>
          </div>
          {slices.length ? (
            <ul className="w-full min-w-0 space-y-2 text-sm" aria-label="Verteilung der falschen Antworten">
              {slices.map((s, i) => (
                <li key={s.name} className="flex items-center gap-2" title={`${s.full}: ${Math.round(s.errorRate * 100)} % falsch (${s.wrong} von ${s.answered})`}>
                  <span className="size-2.5 shrink-0 rounded-full" style={{ background: SLICE_COLORS[i] }} aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{s.name}</span>
                  <span className="font-mono text-xs tabular-nums text-muted-foreground">{Math.round(s.share * 100)} %</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Keine falschen Antworten – sehr gut!</p>
          )}
        </div>
      )}
    </Panel>
  )
}
