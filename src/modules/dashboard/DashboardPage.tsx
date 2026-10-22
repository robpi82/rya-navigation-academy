import { useMemo } from 'react'
import {
  Anchor,
  BookOpen,
  ChevronRight,
  Clock,
  Compass,
  Flame,
  GraduationCap,
  Layers,
  Play,
  RotateCcw,
  Sailboat,
  Ship,
  Star,
  Target,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react'
import { GLOSSARY } from '@/data/glossary'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'
import { FLASHCARDS } from '@/data/flashcards'
import { CHART_EXERCISES } from '@/lib/chartExercises'
import { COASTAL_LESSON_IDS, DAY_LESSON_IDS } from '@/data/lessonIds'
import { COASTAL_TOPICS, DAY_TOPICS, YACHT_TOPIC_IDS, YACHT_TOPICS } from '@/data/topics'
import { topicLinks } from '@/lib/examInsights'
import { isDue, isMastered } from '@/lib/spacedRepetition'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { computeStreak, lastDays, questionsNeedingReview } from '@/lib/stats'
import { useProgressStore } from '@/stores/progressStore'
import { CompassRose } from '@/components/layout/Logo'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { TopicId } from '@/types/learning'
import { ExamInsightsCard, germanName } from './ExamInsightsCard'
import { LevelReadinessCard } from './LevelReadinessCard'
import { PlanWeekCard } from '@/modules/plan/PlanWeekCard'
import { CourseCard, Panel, PanelTitle, PhotoBackdrop, QuickLink, SectionTitle, StatCard } from './DashboardParts'
import { ActivityChart, ErrorRateChart, ExamResultsChart } from './DashboardCharts'
import { DASHBOARD_IMAGES as IMG } from './images'

function formatStudyTime(sec: number): string {
  const min = Math.round(sec / 60)
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`
}

/** Lernzeit kompakt für die Statistik-Karte: Minuten oder Stunden mit einer Nachkommastelle */
function studyTimeValue(sec: number): { value: string; unit: string } {
  const min = Math.round(sec / 60)
  if (min < 60) return { value: String(min), unit: 'min' }
  return { value: (min / 60).toLocaleString('de-DE', { maximumFractionDigits: 1 }), unit: 'h' }
}

const WEEK_MS = 7 * 86_400_000

/** Symbol je Themengruppe für die Wiederholungsempfehlungen */
function topicIcon(t: TopicId): { icon: LucideIcon; className: string } {
  if (t in DAY_TOPICS) return { icon: Sailboat, className: 'bg-sky-500/20 text-sky-300' }
  if (t in COASTAL_TOPICS) return { icon: Anchor, className: 'bg-amber-500/20 text-amber-300' }
  if (t in YACHT_TOPICS) return { icon: Ship, className: 'bg-indigo-500/25 text-indigo-300' }
  return { icon: BookOpen, className: 'bg-teal-500/20 text-teal-300' }
}

export function DashboardPage() {
  const { learnedTerms, viewedTerms, attempts, questionStats, studySeconds, activeDays, termChecks, lastLesson, reset } = useProgressStore()
  const completedLessons = useProgressStore((s) => s.completedLessons)
  const chartResults = useProgressStore((s) => s.chartResults)
  const flashcards = useFlashcardStore((s) => s.cards)
  const flashLog = useFlashcardStore((s) => s.log)
  const resetFlashcards = useFlashcardStore((s) => s.reset)

  const totalAnswers = attempts.reduce((n, a) => n + a.answers.length, 0)
  const totalCorrect = attempts.reduce((n, a) => n + a.answers.filter((x) => x.correct).length, 0)
  const accuracy = totalAnswers ? totalCorrect / totalAnswers : 0
  const streak = computeStreak(activeDays)
  const totalStudy = Object.values(studySeconds).reduce((a, b) => a + b, 0)
  const weekStudy = lastDays(studySeconds, 7).reduce((n, d) => n + d.value, 0)
  const weekAnswers = useMemo(() => {
    const since = Date.now() - WEEK_MS
    const recent = attempts.filter((a) => new Date(a.date).getTime() >= since).flatMap((a) => a.answers)
    return { total: recent.length, correct: recent.filter((a) => a.correct).length }
  }, [attempts])
  const reviewIds = questionsNeedingReview(questionStats)
  const answeredDistinct = Object.keys(questionStats).length
  const masteredQuestions = Object.values(questionStats).filter((s) => s.lastCorrect).length

  const now = new Date()
  const cardsDue = FLASHCARDS.filter((c) => flashcards[c.id] && isDue(flashcards[c.id], now)).length
  const cardsNew = FLASHCARDS.filter((c) => !flashcards[c.id]).length
  const cardsMastered = FLASHCARDS.filter((c) => isMastered(flashcards[c.id])).length

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
  // Yachtmaster: 50 % Lektionen, 50 % beherrschte Yachtmaster-Aufgaben
  const yachtLessonsDone = YACHT_TOPIC_IDS.filter((id) => completedLessons.includes(id)).length
  const yachtQuestions = QUESTION_BANK.filter((q) => q.level === 'yachtmaster-offshore')
  const yachtMastered = yachtQuestions.filter((q) => questionStats[q.id]?.lastCorrect).length
  const yachtProgress = Math.round((yachtLessonsDone / YACHT_TOPIC_IDS.length) * 50 + (yachtMastered / Math.max(1, yachtQuestions.length)) * 50)

  const nextTerm = GLOSSARY.find((t) => !learnedTerms.includes(t.id))

  // Wiederholung: Themen mit zuletzt falsch beantworteten Fragen, meiste Fehler zuerst
  const reviewTopics = useMemo(() => {
    const count = new Map<TopicId, number>()
    for (const id of reviewIds) {
      const t = QUESTION_BY_ID[id]?.topic
      if (t) count.set(t, (count.get(t) ?? 0) + 1)
    }
    return [...count.entries()].sort((a, b) => b[1] - a[1]).map(([topic, n]) => ({ topic, n }))
  }, [reviewIds])

  const study = studyTimeValue(totalStudy)

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="group relative isolate overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40" aria-labelledby="hero-title">
        <PhotoBackdrop
          src={IMG.hero}
          fallback="bg-[radial-gradient(ellipse_45%_60%_at_72%_58%,oklch(0.82_0.15_70/0.85),oklch(0.62_0.17_40/0.45)_45%,transparent_75%),linear-gradient(180deg,oklch(0.26_0.06_270)_0%,oklch(0.42_0.11_35)_52%,oklch(0.3_0.07_245)_58%,oklch(0.17_0.04_255)_100%)]"
          className="-z-10 group-hover:scale-100"
        />
        <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-r from-[oklch(0.15_0.035_255/0.92)] via-[oklch(0.15_0.035_255/0.55)] to-transparent" />
        <div className="flex flex-col gap-6 px-6 py-8 sm:px-10 sm:py-12 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-xl">
            <p className="text-xs font-medium tracking-[0.3em] text-white/80 uppercase">RYA Navigation Academy</p>
            <h1 id="hero-title" className="mt-2 font-display text-4xl font-semibold text-white sm:text-5xl">
              Willkommen an Bord
            </h1>
            <p className="mt-3 text-base text-white/85 sm:text-lg">Lerne Navigation Schritt für Schritt – von der Küste bis zur Hochsee.</p>
            <a
              href={lastLesson?.href ?? '#/themen'}
              className="mt-6 inline-flex items-center gap-3 rounded-full bg-gold px-6 py-3 font-semibold text-gold-foreground shadow-lg shadow-black/30 transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <Play className="size-5 fill-current" aria-hidden /> Weiterlernen <ChevronRight className="size-5" aria-hidden />
            </a>
            <p className="mt-2 text-sm text-white/75">{lastLesson ? `Zuletzt geöffnet: ${lastLesson.title}` : 'Noch keine Lektion geöffnet – Start mit der Day-Skipper-Übersicht'}</p>
          </div>
          <figure className="hidden max-w-60 text-right lg:block">
            <blockquote className="font-display text-lg leading-snug text-white/90 italic">„A smooth sea never made a skilled sailor.“</blockquote>
            <div aria-hidden className="mt-3 ml-auto h-px w-10 bg-gold" />
          </figure>
        </div>
      </section>

      {/* Kurse */}
      <section aria-label="Kurse" className="grid gap-4 md:grid-cols-3">
        <CourseCard
          title="Day Skipper"
          subtitle="Grundlagen der Navigation"
          href="#/themen"
          progress={dayskipperProgress}
          progressNote="Begriffe, Lektionen, beherrschte Aufgaben und Lernkarten"
          lessonsDone={dayLessonsDone}
          lessonsTotal={DAY_LESSON_IDS.length}
          image={IMG.dayskipper}
          fallback="bg-[radial-gradient(ellipse_at_30%_20%,oklch(0.7_0.12_190/0.7),transparent_60%),linear-gradient(160deg,oklch(0.5_0.1_200),oklch(0.3_0.07_230))]"
        />
        <CourseCard
          title="Coastal Skipper"
          subtitle="Fortgeschrittene Navigation"
          href="#/coastal"
          progress={coastalProgress}
          progressNote={`${coastalMastered} / ${coastalQuestions.length} Aufgaben beherrscht`}
          lessonsDone={lessonsDone}
          lessonsTotal={COASTAL_LESSON_IDS.length}
          image={IMG.coastal}
          fallback="bg-[radial-gradient(ellipse_at_50%_35%,oklch(0.78_0.15_60/0.75),transparent_60%),linear-gradient(180deg,oklch(0.35_0.08_290),oklch(0.45_0.12_40)_55%,oklch(0.22_0.05_250))]"
        />
        <CourseCard
          title="Yachtmaster"
          subtitle="Offshore-Navigation"
          href="#/yachtmaster"
          progress={yachtProgress}
          progressNote={`${yachtMastered} / ${yachtQuestions.length} Aufgaben beherrscht`}
          lessonsDone={yachtLessonsDone}
          lessonsTotal={YACHT_TOPIC_IDS.length}
          image={IMG.yachtmaster}
          fallback="bg-[radial-gradient(ellipse_at_70%_20%,oklch(0.6_0.05_240/0.7),transparent_60%),linear-gradient(170deg,oklch(0.42_0.05_240),oklch(0.22_0.05_255))]"
        />
      </section>

      {/* Schnellzugriffe */}
      <section className="space-y-3" aria-labelledby="quick-title">
        <div id="quick-title">
          <SectionTitle>Schnellzugriffe</SectionTitle>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickLink
            href={nextTerm ? `#/glossar/${nextTerm.id}` : '#/glossar'}
            icon={BookOpen}
            iconClassName="bg-blue-500/25 text-blue-300 ring-1 ring-blue-400/40"
            title="Glossar"
            text={nextTerm ? `Weiter mit ${nextTerm.abbr} – ${nextTerm.english}` : `Alle ${GLOSSARY.length} Begriffe gelernt`}
            image={IMG.glossary}
            fallback="bg-[linear-gradient(135deg,oklch(0.3_0.06_255),oklch(0.42_0.08_230))]"
          />
          <QuickLink
            href="#/simulator"
            icon={Compass}
            iconClassName="bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-400/40"
            title="Navigationssimulator"
            text="Heading, Leeway und Strom live verändern"
            image={IMG.simulator}
            fallback="bg-[linear-gradient(135deg,oklch(0.3_0.06_255),oklch(0.4_0.08_190))]"
          />
          <QuickLink
            href="#/quiz"
            icon={GraduationCap}
            iconClassName="bg-indigo-500/25 text-indigo-300 ring-1 ring-indigo-400/40"
            title="Prüfungstrainer"
            text={`${QUESTION_BANK.length} Übungsaufgaben und Quizfragen`}
            image={IMG.quiz}
            fallback="bg-[linear-gradient(135deg,oklch(0.3_0.06_255),oklch(0.38_0.08_280))]"
          />
          <QuickLink
            href="#/lernkarten"
            icon={Layers}
            iconClassName="bg-amber-500/20 text-amber-300 ring-1 ring-amber-400/40"
            title="Lernkarten"
            text={cardsDue ? `${cardsDue} Karten fällig` : `${cardsNew} neue von ${FLASHCARDS.length}`}
            image={IMG.flashcards}
            fallback="bg-[linear-gradient(135deg,oklch(0.3_0.06_255),oklch(0.4_0.08_70))]"
          />
        </div>
      </section>

      {/* Statistiken */}
      <section className="space-y-3" aria-labelledby="stats-title">
        <div id="stats-title">
          <SectionTitle>Deine Statistiken</SectionTitle>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            icon={BookOpen}
            iconClassName="bg-blue-500/20 text-blue-300"
            value={String(learnedTerms.length)}
            unit={`/ ${GLOSSARY.length}`}
            label="Gelernte Begriffe"
            sub={`${viewedTerms.length} angesehen`}
          />
          <StatCard
            icon={Target}
            iconClassName="bg-emerald-500/20 text-emerald-300"
            value={totalAnswers ? `${Math.round(accuracy * 100)}` : '–'}
            unit={totalAnswers ? '%' : undefined}
            label="Richtige Antworten"
            sub={totalAnswers ? `${totalCorrect} von ${totalAnswers} gesamt` : 'noch keine'}
            trend={weekAnswers.total ? { icon: TrendingUp, text: `${weekAnswers.correct} von ${weekAnswers.total} in 7 Tagen`, className: 'text-emerald-300' } : undefined}
          />
          <StatCard
            icon={Flame}
            iconClassName="bg-orange-500/20 text-orange-300"
            value={String(streak)}
            unit={streak === 1 ? 'Tag' : 'Tage'}
            label="Lernstreak"
            sub={`${activeDays.length} Lerntage gesamt`}
            trend={streak > 0 ? { icon: Flame, text: 'Weiter so!', className: 'text-orange-300' } : undefined}
          />
          <StatCard
            icon={Clock}
            iconClassName="bg-sky-500/20 text-sky-300"
            value={study.value}
            unit={study.unit}
            label="Lernzeit gesamt"
            sub="aktive Zeit in der App"
            trend={weekStudy >= 60 ? { icon: TrendingUp, text: `+${formatStudyTime(weekStudy)} in 7 Tagen`, className: 'text-sky-300' } : undefined}
          />
        </div>
      </section>

      {/* Diagramme */}
      <section aria-label="Diagramme" className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <ActivityChart attempts={attempts} studySeconds={studySeconds} />
        <ExamResultsChart attempts={attempts} />
        <div className="lg:col-span-2 xl:col-span-1">
          <ErrorRateChart attempts={attempts} />
        </div>
      </section>

      {/* Wochenplan, Wiederholung, Motivation */}
      <section aria-label="Lernplan und Wiederholung" className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <PlanWeekCard className="h-full shadow-lg shadow-black/20 backdrop-blur-sm" />

        <Panel className="flex flex-col p-5">
          {IMG.review && <PhotoBackdrop src={IMG.review} fallback="" className="opacity-25" />}
          <div className="relative flex flex-1 flex-col gap-3">
            <PanelTitle icon={RotateCcw}>Empfohlene Wiederholung</PanelTitle>
            <p className="text-xs text-muted-foreground">
              {answeredDistinct} von {QUESTION_BANK.length} Aufgaben bearbeitet · {masteredQuestions} zuletzt richtig
            </p>
            {reviewTopics.length === 0 ? (
              <p className="text-sm text-muted-foreground">{answeredDistinct === 0 ? 'Noch keine Aufgaben bearbeitet.' : 'Keine offenen Fehler – sehr gut!'}</p>
            ) : (
              <ul className="space-y-1">
                {reviewTopics.slice(0, 4).map(({ topic, n }) => {
                  const { icon: Icon, className } = topicIcon(topic)
                  return (
                    <li key={topic}>
                      <a href={topicLinks(topic).quiz} className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-white/8 focus-visible:outline-2 focus-visible:outline-gold">
                        <span className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${className}`} aria-hidden>
                          <Icon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium text-white">{germanName(topic)}</span>
                          <span className="block text-xs text-muted-foreground">
                            {n} {n === 1 ? 'Frage' : 'Fragen'} zuletzt falsch
                          </span>
                        </span>
                        <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden />
                      </a>
                    </li>
                  )
                })}
              </ul>
            )}
            {reviewIds.length > 0 && (
              <Button asChild size="sm" variant="outline" className="mt-auto self-start">
                <a href="#/quiz/wiederholen">
                  <RotateCcw /> Alle {reviewIds.length} wiederholen
                </a>
              </Button>
            )}
          </div>
        </Panel>

        <Panel className="group flex min-h-64 flex-col p-5 lg:col-span-2 xl:col-span-1">
          <PhotoBackdrop
            src={IMG.motivation}
            fallback="bg-[radial-gradient(ellipse_at_80%_30%,oklch(0.75_0.14_65/0.55),transparent_55%),linear-gradient(180deg,oklch(0.28_0.06_260),oklch(0.2_0.045_255))]"
          />
          <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[oklch(0.15_0.035_255/0.85)] to-transparent" />
          <CompassRose className="pointer-events-none absolute -right-10 -bottom-10 size-48 opacity-15" />
          <div className="relative flex flex-1 flex-col">
            <PanelTitle icon={Star}>Motivation</PanelTitle>
            <blockquote className="mt-auto pt-8 font-display text-2xl leading-snug text-white italic">
              „Plan well,
              <br />
              sail safely,
              <br />
              explore further.“
            </blockquote>
            <div aria-hidden className="mt-3 h-px w-10 bg-gold" />
          </div>
        </Panel>
      </section>

      {/* Weitere Auswertungen (bestehende Funktionen) */}
      <section className="space-y-4" aria-labelledby="more-title">
        <div id="more-title">
          <SectionTitle>Weitere Auswertungen</SectionTitle>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Fortschritt nach Ausbildungsstufe</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <LevelRow label="Day Skipper Theory" value={dayskipperProgress} note={`Begriffe, Themen-Lektionen (${dayLessonsDone}/${DAY_LESSON_IDS.length}), beherrschte Aufgaben, gefestigte Lernkarten`} />
              <LevelRow label="Coastal Skipper" value={coastalProgress} note={`${lessonsDone} / ${COASTAL_LESSON_IDS.length} Lektionen, ${coastalMastered} / ${coastalQuestions.length} Aufgaben beherrscht`} />
              <LevelRow label="Kartenaufgaben (Seekarte)" value={chartProgress} note={`${chartSolved} / ${CHART_EXERCISES.length} Aufgaben gelöst`} />
              <LevelRow label="Yachtmaster" value={yachtProgress} note={`${yachtLessonsDone} / ${YACHT_TOPIC_IDS.length} Lektionen, ${yachtMastered} / ${yachtQuestions.length} Aufgaben beherrscht`} />
              <div className="border-t pt-4">
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
                <Progress value={(cardsMastered / FLASHCARDS.length) * 100} indicatorClassName="bg-success" aria-label="Gefestigte Lernkarten" />
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

        <LevelReadinessCard />

        <ExamInsightsCard attempts={attempts} />
      </section>
    </div>
  )
}

function LevelRow({ label, value, note }: { label: string; value: number; note: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{value} %</span>
      </div>
      <Progress value={value} aria-label={`Fortschritt ${label}`} />
      <p className="mt-1 text-xs text-muted-foreground">{note}</p>
    </div>
  )
}
