import { useMemo, useState } from 'react'
import { ArrowRight, BookOpen, Clock, Compass, Flame, GraduationCap, Layers, RotateCcw, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GLOSSARY, TERM_BY_ID, TERM_IDS } from '@/data/glossary'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'
import { FLASHCARDS } from '@/data/flashcards'
import { CHART_EXERCISES } from '@/lib/chartExercises'
import { COASTAL_LESSON_IDS, DAY_LESSON_IDS } from '@/data/lessonIds'
import { topicInfo } from '@/data/topics'
import { isDue, isMastered } from '@/lib/spacedRepetition'
import { reviewsPerDay, useFlashcardStore } from '@/stores/flashcardStore'
import { CATEGORY_LABEL, type QuestionCategory } from '@/types/learning'
import { attemptScore, computeStreak, dayKey, errorRateBy, lastDays, questionsNeedingReview, topicStats } from '@/lib/stats'
import { useProgressStore } from '@/stores/progressStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { LucideIcon } from 'lucide-react'
import { ExamInsightsCard } from './ExamInsightsCard'
import { PlanWeekCard } from '@/modules/plan/PlanWeekCard'

function formatStudyTime(sec: number): string {
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`
}

function StatTile({ icon: Icon, label, value, sub }: { icon: LucideIcon; label: string; value: string; sub?: string }) {
  return (
    <Card>
      <CardContent className="flex items-start gap-3 pt-5">
        <div className="rounded-lg bg-accent p-2 text-accent-foreground">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
          {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
        </div>
      </CardContent>
    </Card>
  )
}

const tooltipStyle = {
  background: 'var(--popover)',
  border: '1px solid var(--border)',
  borderRadius: 8,
  color: 'var(--popover-foreground)',
  fontSize: 12,
}

export function DashboardPage() {
  const { learnedTerms, viewedTerms, attempts, questionStats, studySeconds, activeDays, termChecks, reset } = useProgressStore()

  const totalAnswers = attempts.reduce((n, a) => n + a.answers.length, 0)
  const totalCorrect = attempts.reduce((n, a) => n + a.answers.filter((x) => x.correct).length, 0)
  const accuracy = totalAnswers ? totalCorrect / totalAnswers : 0
  const streak = computeStreak(activeDays)
  const totalStudy = Object.values(studySeconds).reduce((a, b) => a + b, 0)
  const reviewIds = questionsNeedingReview(questionStats)
  const answeredDistinct = Object.keys(questionStats).length
  const masteredQuestions = Object.values(questionStats).filter((s) => s.lastCorrect).length

  const [errorView, setErrorView] = useState<'topic' | 'category'>('topic')
  const topicData = useMemo(
    () =>
      errorView === 'topic'
        ? topicStats(attempts, TERM_IDS).map((t) => ({
            name: TERM_BY_ID[t.topic].abbr,
            full: TERM_BY_ID[t.topic].english,
            Fehlerquote: Math.round(t.errorRate * 100),
            answered: t.answered,
          }))
        : errorRateBy(attempts, Object.keys(CATEGORY_LABEL) as QuestionCategory[], (id) => QUESTION_BY_ID[id]?.category).map((c) => ({
            name: CATEGORY_LABEL[c.key].split(/[- ]/)[0],
            full: CATEGORY_LABEL[c.key],
            Fehlerquote: Math.round(c.errorRate * 100),
            answered: c.answered,
          })),
    [attempts, errorView],
  )
  const flashcards = useFlashcardStore((s) => s.cards)
  const flashLog = useFlashcardStore((s) => s.log)
  const resetFlashcards = useFlashcardStore((s) => s.reset)
  const now = new Date()
  const cardsDue = FLASHCARDS.filter((c) => flashcards[c.id] && isDue(flashcards[c.id], now)).length
  const cardsNew = FLASHCARDS.filter((c) => !flashcards[c.id]).length
  const cardsMastered = FLASHCARDS.filter((c) => isMastered(flashcards[c.id])).length
  const activity = useMemo(() => {
    const reviews = reviewsPerDay(flashLog)
    const answersPerDay: Record<string, number> = {}
    for (const a of attempts) {
      const k = dayKey(new Date(a.date))
      answersPerDay[k] = (answersPerDay[k] ?? 0) + a.answers.length
    }
    return lastDays(studySeconds, 14).map((d) => ({
      name: d.day.slice(8, 10) + '.' + d.day.slice(5, 7) + '.',
      minutes: Math.round(d.value / 60),
      reviews: reviews[d.day] ?? 0,
      answers: answersPerDay[d.day] ?? 0,
      Lernaktionen: (reviews[d.day] ?? 0) + (answersPerDay[d.day] ?? 0),
    }))
  }, [studySeconds, flashLog, attempts])
  const hasActivity = activity.some((d) => d.Lernaktionen > 0)
  const examData = useMemo(
    () =>
      attempts
        .filter((a) => a.mode === 'exam')
        .slice(-12)
        .map((a, i) => ({
          name: `#${i + 1}`,
          date: new Date(a.date).toLocaleDateString('de-DE'),
          Ergebnis: Math.round(attemptScore(a) * 100),
        })),
    [attempts],
  )

  const completedLessons = useProgressStore((s) => s.completedLessons)
  const chartResults = useProgressStore((s) => s.chartResults)
  const lessonsDone = COASTAL_LESSON_IDS.filter((id) => completedLessons.includes(id)).length
  const dayLessonsDone = DAY_LESSON_IDS.filter((id) => completedLessons.includes(id)).length
  // Fortschritt Day Skipper: 25 % Begriffe, 10 % Verständnisfragen, 35 % beherrschte Aufgaben, 15 % gefestigte Lernkarten, 15 % Themen-Lektionen
  const checksCorrect = Object.values(termChecks).filter(Boolean).length
  const dayQuestions = QUESTION_BANK.filter((q) => q.level === 'day-skipper')
  const dayskipperProgress = Math.round(
    (learnedTerms.length / GLOSSARY.length) * 25 +
      (checksCorrect / GLOSSARY.length) * 10 +
      (dayQuestions.filter((q) => questionStats[q.id]?.lastCorrect).length / dayQuestions.length) * 35 +
      (cardsMastered / FLASHCARDS.length) * 15 +
      (dayLessonsDone / DAY_LESSON_IDS.length) * 15,
  )
  const coastalQuestions = QUESTION_BANK.filter((q) => q.level === 'coastal-skipper')
  const coastalMastered = coastalQuestions.filter((q) => questionStats[q.id]?.lastCorrect).length
  const chartSolved = CHART_EXERCISES.filter((e) => chartResults[e.id]?.solved).length
  const coastalChart = CHART_EXERCISES.filter((e) => e.level === 'coastal-skipper')
  // Coastal Skipper: 40 % Lektionen, 40 % beherrschte Coastal-Aufgaben, 20 % Coastal-Kartenaufgaben
  const coastalProgress = Math.round(
    (lessonsDone / COASTAL_LESSON_IDS.length) * 40 +
      (coastalMastered / Math.max(1, coastalQuestions.length)) * 40 +
      (coastalChart.filter((e) => chartResults[e.id]?.solved).length / Math.max(1, coastalChart.length)) * 20,
  )
  const chartProgress = Math.round((chartSolved / CHART_EXERCISES.length) * 100)

  const nextTerm = GLOSSARY.find((t) => !learnedTerms.includes(t.id))
  const hasTopicData = topicData.some((t) => t.answered > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Willkommen an Bord"
        subtitle="Dein Lernstand für die Navigationstheorie auf Day-Skipper-Niveau. Alle Daten bleiben lokal in deinem Browser."
      />

      <PlanWeekCard />

      {/* Schnellstart */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <a href={nextTerm ? `#/glossar/${nextTerm.id}` : '#/glossar'} className="group rounded-xl bg-gradient-to-br from-[oklch(0.3_0.08_255)] to-[oklch(0.42_0.09_215)] p-5 text-white shadow-md transition-transform hover:-translate-y-0.5">
          <BookOpen className="size-6 text-teal-300" />
          <div className="mt-3 text-lg font-semibold">{nextTerm ? `Weiter mit ${nextTerm.abbr}` : 'Glossar wiederholen'}</div>
          <p className="text-sm text-white/75">{nextTerm ? nextTerm.english : 'Alle 9 Begriffe gelernt'}</p>
          <ArrowRight className="mt-3 size-5 transition-transform group-hover:translate-x-1" />
        </a>
        <a href="#/simulator" className="group rounded-xl border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <Compass className="size-6 text-vec-ground" />
          <div className="mt-3 text-lg font-semibold">Navigationssimulator</div>
          <p className="text-sm text-muted-foreground">Heading, Leeway und Strom live verändern</p>
          <ArrowRight className="mt-3 size-5 transition-transform group-hover:translate-x-1" />
        </a>
        <a href={reviewIds.length ? '#/quiz/wiederholen' : '#/quiz'} className="group rounded-xl border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <GraduationCap className="size-6 text-vec-tide" />
          <div className="mt-3 text-lg font-semibold">{reviewIds.length ? `${reviewIds.length} Fragen wiederholen` : 'Prüfungstrainer'}</div>
          <p className="text-sm text-muted-foreground">
            {reviewIds.length ? 'Zuletzt falsch beantwortet' : `${QUESTION_BANK.length} Übungsaufgaben`}
          </p>
          <ArrowRight className="mt-3 size-5 transition-transform group-hover:translate-x-1" />
        </a>
        <a href="#/lernkarten" className="group rounded-xl border bg-card p-5 shadow-sm transition-transform hover:-translate-y-0.5">
          <Layers className="size-6 text-vec-water" />
          <div className="mt-3 text-lg font-semibold">{cardsDue ? `${cardsDue} Karten fällig` : 'Lernkarten'}</div>
          <p className="text-sm text-muted-foreground">{cardsDue ? 'Spaced Repetition' : `${cardsNew} neue von ${FLASHCARDS.length}`}</p>
          <ArrowRight className="mt-3 size-5 transition-transform group-hover:translate-x-1" />
        </a>
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={BookOpen} label="Begriffe gelernt" value={`${learnedTerms.length} / ${GLOSSARY.length}`} sub={`${viewedTerms.length} angesehen`} />
        <StatTile icon={Target} label="Richtige Antworten" value={`${totalCorrect}`} sub={totalAnswers ? `${Math.round(accuracy * 100)} % von ${totalAnswers}` : 'noch keine'} />
        <StatTile icon={Flame} label="Lernstreak" value={`${streak} ${streak === 1 ? 'Tag' : 'Tage'}`} sub={`${activeDays.length} Lerntage gesamt`} />
        <StatTile icon={Clock} label="Lernzeit" value={formatStudyTime(totalStudy)} sub="aktive Zeit in der App" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Lernaktivität</CardTitle>
            <CardDescription>Beantwortete Fragen und bewertete Lernkarten der letzten 14 Tage</CardDescription>
          </CardHeader>
          <CardContent className="h-56">
            {hasActivity ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={activity} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 10 }} axisLine={false} tickLine={false} interval={1} />
                  <YAxis allowDecimals={false} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                    contentStyle={tooltipStyle}
                    formatter={(v, _n, item) => [`${v} (${item.payload.answers} Antworten, ${item.payload.reviews} Karten, ${item.payload.minutes} min)`, 'Lernaktionen']}
                  />
                  <Bar dataKey="Lernaktionen" fill="var(--vec-water)" radius={[4, 4, 0, 0]} maxBarSize={22} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="Noch keine Lernaktivität aufgezeichnet." />
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lernkarten</CardTitle>
            <CardDescription>Stand der Spaced Repetition</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Gefestigt (≥ 7 Tage)</span>
                <span className="font-mono">
                  {cardsMastered} / {FLASHCARDS.length}
                </span>
              </div>
              <Progress value={(cardsMastered / FLASHCARDS.length) * 100} indicatorClassName="bg-success" />
            </div>
            <dl className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="text-xs text-muted-foreground">Fällig</dt>
                <dd className="text-xl font-bold">{cardsDue}</dd>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="text-xs text-muted-foreground">Neu</dt>
                <dd className="text-xl font-bold">{cardsNew}</dd>
              </div>
              <div className="rounded-lg bg-muted/60 p-2">
                <dt className="text-xs text-muted-foreground">Bewertungen</dt>
                <dd className="text-xl font-bold">{flashLog.length}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="w-full">
              <a href="#/lernkarten">{cardsDue ? 'Fällige Karten lernen' : 'Zu den Lernkarten'}</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <CardTitle>Fehlerquote</CardTitle>
                <CardDescription>Anteil falscher Antworten in allen Durchgängen (%)</CardDescription>
              </div>
              <div className="inline-flex rounded-lg bg-muted p-1 text-xs" role="group" aria-label="Gruppierung">
                {(['topic', 'category'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setErrorView(v)}
                    aria-pressed={errorView === v}
                    className={errorView === v ? 'rounded-md bg-card px-2.5 py-1 font-medium shadow-sm' : 'rounded-md px-2.5 py-1 text-muted-foreground hover:text-foreground'}
                  >
                    {v === 'topic' ? 'nach Thema' : 'nach Aufgabentyp'}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="h-64">
            {hasTopicData ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topicData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} interval={0} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.5 }}
                    contentStyle={tooltipStyle}
                    labelFormatter={(_l, p) => p?.[0]?.payload.full ?? ''}
                    formatter={(v, _n, item) => [`${v} % (${item.payload.answered} Antworten)`, 'Fehlerquote']}
                  />
                  <Bar dataKey="Fehlerquote" fill="var(--vec-ground)" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="Beantworte Fragen im Prüfungstrainer, um deine Schwachstellen zu sehen." />
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prüfungsergebnisse</CardTitle>
            <CardDescription>Letzte Durchgänge im Prüfungsmodus (%)</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            {examData.length ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={examData} margin={{ top: 8, right: 12, left: -20, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="var(--chart-grid)" />
                  <XAxis dataKey="name" tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: 'var(--muted-foreground)', fontSize: 11 }} axisLine={false} tickLine={false} unit="%" />
                  <Tooltip
                    contentStyle={tooltipStyle}
                    labelFormatter={(_l, p) => p?.[0]?.payload.date ?? ''}
                    formatter={(v: number) => [`${v} %`, 'Ergebnis']}
                  />
                  <ReferenceLine y={70} stroke="var(--muted-foreground)" strokeDasharray="4 4" label={{ value: 'Bestehensgrenze', position: 'insideTopRight', fill: 'var(--muted-foreground)', fontSize: 11 }} />
                  <Line type="monotone" dataKey="Ergebnis" stroke="var(--vec-tide)" strokeWidth={2} dot={{ r: 4, fill: 'var(--vec-tide)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="Noch kein Durchgang im Prüfungsmodus." />
            )}
          </CardContent>
        </Card>
      </div>

      <ExamInsightsCard attempts={attempts} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fortschritt nach Ausbildungsstufe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LevelRow label="Day Skipper Theory" value={dayskipperProgress} note={`Begriffe, Themen-Lektionen (${dayLessonsDone}/${DAY_LESSON_IDS.length}), beherrschte Aufgaben, gefestigte Lernkarten`} />
            <LevelRow label="Coastal Skipper" value={coastalProgress} note={`${lessonsDone} / ${COASTAL_LESSON_IDS.length} Lektionen, ${coastalMastered} / ${coastalQuestions.length} Aufgaben beherrscht`} />
            <LevelRow label="Kartenaufgaben (Seekarte)" value={chartProgress} note={`${chartSolved} / ${CHART_EXERCISES.length} Aufgaben gelöst`} />
            <LevelRow label="Yachtmaster Offshore" value={0} note="Noch keine Inhalte – mögliche Erweiterung" disabled />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-start justify-between">
            <div>
              <CardTitle>Wiederholungsbedarf</CardTitle>
              <CardDescription>
                {answeredDistinct} von {QUESTION_BANK.length} Aufgaben bearbeitet · {masteredQuestions} zuletzt richtig
              </CardDescription>
            </div>
            {reviewIds.length > 0 && (
              <Button asChild size="sm">
                <a href="#/quiz/wiederholen">
                  <RotateCcw /> Wiederholen
                </a>
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {reviewIds.length === 0 ? (
              <p className="text-sm text-muted-foreground">{answeredDistinct === 0 ? 'Noch keine Aufgaben bearbeitet.' : 'Keine offenen Fehler – sehr gut!'}</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {Array.from(new Set(reviewIds.map((id) => QUESTION_BANK.find((q) => q.id === id)?.topic).filter(Boolean))).map((t) => (
                  <Badge key={t} variant="destructive">
                    {topicInfo(t!).abbr}: {reviewIds.filter((id) => QUESTION_BANK.find((q) => q.id === id)?.topic === t).length}
                  </Badge>
                ))}
              </div>
            )}
            <div className="mt-4 border-t pt-4">
              <Button
                variant="ghost"
                size="sm"
                className="-ml-2 text-muted-foreground"
                onClick={() => {
                  if (window.confirm('Gesamten Lernfortschritt inkl. Lernkarten unwiderruflich löschen?')) {
                    reset()
                    resetFlashcards()
                  }
                }}
              >
                Lernfortschritt zurücksetzen
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function LevelRow({ label, value, note, disabled }: { label: string; value: number; note: string; disabled?: boolean }) {
  return (
    <div className={disabled ? 'opacity-55' : undefined}>
      <div className="mb-1 flex justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{disabled ? '–' : `${value} %`}</span>
      </div>
      <Progress value={value} />
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}

function EmptyChart({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </div>
  )
}
