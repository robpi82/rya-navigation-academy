import { useMemo } from 'react'
import { ArrowRight, BookOpen, Clock, Compass, Flame, GraduationCap, RotateCcw, Target } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { GLOSSARY, TERM_BY_ID, TERM_IDS } from '@/data/glossary'
import { QUESTION_BANK } from '@/questions'
import { attemptScore, computeStreak, questionsNeedingReview, topicStats } from '@/lib/stats'
import { useProgressStore } from '@/stores/progressStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { LucideIcon } from 'lucide-react'

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

  const topicData = useMemo(
    () =>
      topicStats(attempts, TERM_IDS).map((t) => ({
        name: TERM_BY_ID[t.topic].abbr,
        Fehlerquote: Math.round(t.errorRate * 100),
        answered: t.answered,
      })),
    [attempts],
  )
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

  // Fortschritt Day Skipper (Phase-1-Inhalte): 40 % Begriffe, 20 % Verständnisfragen, 40 % beherrschte Quizfragen
  const checksCorrect = Object.values(termChecks).filter(Boolean).length
  const dayskipperProgress = Math.round(
    (learnedTerms.length / GLOSSARY.length) * 40 + (checksCorrect / GLOSSARY.length) * 20 + (masteredQuestions / QUESTION_BANK.length) * 40,
  )

  const nextTerm = GLOSSARY.find((t) => !learnedTerms.includes(t.id))
  const hasTopicData = topicData.some((t) => t.answered > 0)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Willkommen an Bord"
        subtitle="Dein Lernstand für die Navigationstheorie auf Day-Skipper-Niveau. Alle Daten bleiben lokal in deinem Browser."
      />

      {/* Schnellstart */}
      <div className="grid gap-4 md:grid-cols-3">
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
      </div>

      {/* Kennzahlen */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile icon={BookOpen} label="Begriffe gelernt" value={`${learnedTerms.length} / ${GLOSSARY.length}`} sub={`${viewedTerms.length} angesehen`} />
        <StatTile icon={Target} label="Richtige Antworten" value={`${totalCorrect}`} sub={totalAnswers ? `${Math.round(accuracy * 100)} % von ${totalAnswers}` : 'noch keine'} />
        <StatTile icon={Flame} label="Lernstreak" value={`${streak} ${streak === 1 ? 'Tag' : 'Tage'}`} sub={`${activeDays.length} Lerntage gesamt`} />
        <StatTile icon={Clock} label="Lernzeit" value={formatStudyTime(totalStudy)} sub="aktive Zeit in der App" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fehlerquote nach Thema</CardTitle>
            <CardDescription>Anteil falscher Antworten in allen Durchgängen (%)</CardDescription>
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
                    formatter={(v: number, _n, item) => [`${v} % (${item.payload.answered} Antworten)`, 'Fehlerquote']}
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
                  <Line type="monotone" dataKey="Ergebnis" stroke="var(--vec-tide)" strokeWidth={2} dot={{ r: 4, fill: 'var(--vec-tide)' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <EmptyChart text="Noch kein Durchgang im Prüfungsmodus." />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Fortschritt nach Ausbildungsstufe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <LevelRow label="Day Skipper Theory" value={dayskipperProgress} note="Begriffe, Verständnisfragen und beherrschte Aufgaben" />
            <LevelRow label="Coastal Skipper / Yachtmaster Offshore" value={0} note="Inhalte folgen in Phase 3" disabled />
            <LevelRow label="Fortgeschrittene Navigationsübungen" value={0} note="Seekarte & Course to Steer folgen in Phase 3" disabled />
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
                    {TERM_BY_ID[t!].abbr}: {reviewIds.filter((id) => QUESTION_BANK.find((q) => q.id === id)?.topic === t).length}
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
                  if (window.confirm('Gesamten Lernfortschritt unwiderruflich löschen?')) reset()
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
