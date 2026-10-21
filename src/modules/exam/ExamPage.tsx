import { useEffect, useMemo, useRef, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Flag, GraduationCap, RotateCcw, Timer, Trophy, XCircle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'
import { topicInfo } from '@/data/topics'
import { CATEGORY_LABEL, type Question } from '@/types/learning'
import { EXAM_GROUPS, EXAM_PRESETS, PASS_PERCENT, buildExam, gradeExam, normalizeAnswer, remainingSeconds, seededRandom, type ExamPreset } from '@/lib/exam'
import { formatClock } from '@/lib/quiz'
import { cn } from '@/lib/utils'
import { useExamStore, type ExamSession } from '@/stores/examStore'
import { useProgressStore } from '@/stores/progressStore'
import { BuoyIcon } from '@/components/nautical/BuoyIcon'
import { BUOY_BY_ID } from '@/data/buoyage'
import { QuestionDiagram } from '@/modules/quiz/QuestionDiagram'
import { Solution } from '@/modules/quiz/QuizPage'
import { QuestionInput } from './QuestionInput'

const DIFFICULTY_LABEL = { 1: 'leicht', 2: 'mittel', 3: 'schwer' } as const

export function ExamPage() {
  const session = useExamStore((s) => s.session)
  if (!session) return <ExamSetup />
  if (session.submittedAt) return <ExamResults session={session} />
  return <ExamRunner session={session} />
}

/* ------------------------------------------------------------------ Start */

function ExamSetup() {
  const start = useExamStore((s) => s.start)
  const attempts = useProgressStore((s) => s.attempts)
  const past = attempts.filter((a) => a.exam).slice(-5).reverse()
  const dayCount = QUESTION_BANK.filter((q) => q.level === 'day-skipper').length
  const coastalCount = QUESTION_BANK.filter((q) => q.level === 'coastal-skipper').length
  const yachtCount = QUESTION_BANK.filter((q) => q.level === 'yachtmaster-offshore').length

  const begin = (p: ExamPreset) => {
    const seed = Math.floor(Math.random() * 2 ** 31)
    const questions = buildExam(p.questions, QUESTION_BANK, seededRandom(seed), p.level)
    start({ presetId: p.id, questionIds: questions.map((q) => q.id), seed, startedAt: Date.now(), limitSec: p.minutes * 60 })
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Probeprüfung" subtitle={`Wie in einer echten Prüfung: feste Fragenzahl, feste Zeit, keine Rückmeldung bis zur Abgabe. Bestanden ab ${PASS_PERCENT} %. Fragenpool: ${dayCount} Day-Skipper-, ${coastalCount} Coastal- und ${yachtCount} Yachtmaster-Fragen.`} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {EXAM_PRESETS.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="size-5 text-primary" /> {p.label}
              </CardTitle>
              <CardDescription>{p.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Fragen</dt>
                  <dd className="font-mono text-lg font-semibold">{p.questions}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Zeit</dt>
                  <dd className="font-mono text-lg font-semibold">{p.minutes} min</dd>
                </div>
              </dl>
              <Button className="w-full" onClick={() => begin(p)}>
                {p.label} starten
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">So läuft die Prüfung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>Day Skipper: Die Fragen werden nach Themengruppen gewichtet gezogen – {Object.values(EXAM_GROUPS).filter((g) => g.weight > 0).map((g) => `${g.label} (${Math.round(g.weight * 100)} %)`).join(', ')}. Coastal und Yachtmaster: gleichmäßig über alle Themen der Stufe verteilt.</p>
          <p>Du kannst frei zwischen den Fragen springen, Fragen markieren und deine Antworten ändern. Nach Ablauf der Zeit wird automatisch abgegeben; unbeantwortete Fragen zählen als falsch. Der Stand bleibt auch nach einem Neuladen erhalten.</p>
          <p>Eigenständig erstellte, vereinfachte Fragen – kein Original der RYA und keine Garantie für eine echte Prüfung.</p>
        </CardContent>
      </Card>
      {past.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Letzte Probeprüfungen</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="divide-y text-sm">
              {past.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-3 py-2">
                  <span className="text-muted-foreground">{new Date(a.date).toLocaleDateString('de-DE')} · {a.answers.length} Fragen</span>
                  <span className="flex items-center gap-2">
                    <span className="font-mono tabular-nums">{Math.round(a.exam!.percent)} %</span>
                    <Badge variant={a.exam!.passed ? 'success' : 'destructive'}>{a.exam!.passed ? 'bestanden' : 'nicht bestanden'}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Durchführung */

function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}

/** Speichert die Auswertung einmalig als Versuch und markiert die Prüfung als abgegeben. */
function finishExam(session: ExamSession) {
  const questions = session.questionIds.map((id) => QUESTION_BY_ID[id])
  const grade = gradeExam(questions, session.answers)
  const at = Date.now()
  useProgressStore.getState().recordAttempt({
    id: `exam-${session.startedAt}`,
    date: new Date(at).toISOString(),
    mode: 'exam',
    durationSec: Math.min(session.limitSec, Math.round((at - session.startedAt) / 1000)),
    answers: questions.map((q, i) => ({ questionId: q.id, topic: q.topic, correct: grade.perQuestion[i], given: normalizeAnswer(q, session.answers[i]) })),
    exam: { presetId: session.presetId, limitSec: session.limitSec, percent: grade.percent, passed: grade.passed },
  })
  useExamStore.getState().submit(at)
}

function ExamRunner({ session }: { session: ExamSession }) {
  const { setAnswer, toggleFlag, goTo, clear } = useExamStore()
  const now = useNow()
  const [confirming, setConfirming] = useState(false)
  const questions = useMemo(() => session.questionIds.map((id) => QUESTION_BY_ID[id]), [session.questionIds])
  const remaining = remainingSeconds(session.startedAt, session.limitSec, now)
  const done = useRef(false)

  useEffect(() => {
    if (remaining <= 0 && !done.current) {
      done.current = true
      finishExam(session)
    }
  }, [remaining, session])

  const i = session.index
  const q = questions[i]
  const answeredCount = session.answers.filter((a, k) => normalizeAnswer(questions[k], a) !== null).length
  const flagged = session.flags.filter(Boolean).length
  const low = remaining <= 300

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <div className="sticky top-0 z-10 -mx-4 flex flex-wrap items-center justify-between gap-3 border-b bg-background/95 px-4 py-2 backdrop-blur sm:mx-0 sm:rounded-lg sm:border">
        <div className="flex items-center gap-2">
          <Badge>Probeprüfung</Badge>
          <span className="text-sm text-muted-foreground">
            Frage {i + 1} von {questions.length} · {answeredCount} beantwortet
          </span>
        </div>
        <span className={cn('flex items-center gap-1 font-mono text-lg font-semibold tabular-nums', low && 'text-destructive')} role="timer" aria-label="Verbleibende Zeit">
          <Timer className="size-5" /> {formatClock(remaining)}
        </span>
      </div>
      <Progress value={(answeredCount / questions.length) * 100} />

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px]">
        <Card>
          <CardHeader>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{topicInfo(q.topic).abbr} · {topicInfo(q.topic).english}</Badge>
              <Badge variant="secondary">{DIFFICULTY_LABEL[q.difficulty]}</Badge>
              <Badge variant="secondary">{CATEGORY_LABEL[q.category]}</Badge>
            </div>
            <CardTitle className="pt-2 text-lg leading-snug">{q.prompt}</CardTitle>
            {q.type === 'mc' && q.buoy && (
              <div className="mx-auto w-36 rounded-lg bg-[var(--chart-water)] p-2">
                <BuoyIcon id={q.buoy} className="h-auto w-full" title={`Tonne zur Aufgabe (${BUOY_BY_ID[q.buoy].english})`} />
              </div>
            )}
            {q.type === 'mc' && q.diagram && <QuestionDiagram diagram={q.diagram} />}
          </CardHeader>
          <CardContent className="space-y-4">
            <QuestionInput key={q.id} q={q} seed={session.seed} value={session.answers[i]} onChange={(a) => setAnswer(i, a)} />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant={session.flags[i] ? 'secondary' : 'outline'} size="sm" onClick={() => toggleFlag(i)} aria-pressed={session.flags[i]}>
                <Flag /> {session.flags[i] ? 'Markierung entfernen' : 'Zum Prüfen markieren'}
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => goTo(i - 1)} disabled={i === 0}>
                  <ArrowLeft /> Zurück
                </Button>
                <Button variant="outline" onClick={() => goTo(i + 1)} disabled={i === questions.length - 1}>
                  Weiter <ArrowRight />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-xs font-medium text-muted-foreground">Fragenübersicht</p>
              <ol className="grid grid-cols-6 gap-1.5 lg:grid-cols-5">
                {questions.map((qq, k) => {
                  const answered = normalizeAnswer(qq, session.answers[k]) !== null
                  return (
                    <li key={qq.id}>
                      <button
                        type="button"
                        onClick={() => goTo(k)}
                        aria-label={`Frage ${k + 1}${answered ? ', beantwortet' : ''}${session.flags[k] ? ', markiert' : ''}`}
                        aria-current={k === i ? 'step' : undefined}
                        className={cn(
                          'relative flex h-8 w-full items-center justify-center rounded border font-mono text-xs tabular-nums',
                          answered ? 'bg-primary/15' : 'bg-background',
                          k === i && 'border-primary ring-2 ring-primary/40',
                        )}
                      >
                        {k + 1}
                        {session.flags[k] && <Flag className="absolute -top-1 -right-1 size-3 fill-warning text-warning" aria-hidden />}
                      </button>
                    </li>
                  )
                })}
              </ol>
              <p className="text-[11px] text-muted-foreground">Gefüllt = beantwortet · Fahne = markiert</p>
            </CardContent>
          </Card>

          {!confirming ? (
            <Button className="w-full" onClick={() => setConfirming(true)}>
              Prüfung abgeben
            </Button>
          ) : (
            <Card className="border-warning/50">
              <CardContent className="space-y-3 p-4 text-sm">
                <p className="flex items-center gap-2 font-semibold">
                  <AlertTriangle className="size-4 text-warning" /> Wirklich abgeben?
                </p>
                <p className="text-muted-foreground">
                  {questions.length - answeredCount > 0 ? `${questions.length - answeredCount} Fragen sind unbeantwortet (zählen als falsch). ` : 'Alle Fragen sind beantwortet. '}
                  {flagged > 0 && `${flagged} Fragen sind markiert.`}
                </p>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => finishExam(session)}>
                    Ja, abgeben
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setConfirming(false)}>
                    Weiter prüfen
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-muted-foreground"
            onClick={() => {
              if (window.confirm('Prüfung abbrechen? Die Antworten gehen verloren und werden nicht gewertet.')) clear()
            }}
          >
            Abbrechen
          </Button>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Auswertung */

function Bar({ value, className }: { value: number; className?: string }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted" aria-hidden>
      <div className={cn('h-full rounded-full', className ?? 'bg-primary')} style={{ width: `${Math.round(value)}%` }} />
    </div>
  )
}

function ExamResults({ session }: { session: ExamSession }) {
  const clear = useExamStore((s) => s.clear)
  const questions = useMemo(() => session.questionIds.map((id) => QUESTION_BY_ID[id]) as Question[], [session.questionIds])
  const grade = useMemo(() => gradeExam(questions, session.answers), [questions, session.answers])
  const [onlyWrong, setOnlyWrong] = useState(true)
  const usedSec = Math.min(session.limitSec, Math.round(((session.submittedAt ?? Date.now()) - session.startedAt) / 1000))
  const shown = questions.map((q, i) => ({ q, i })).filter(({ i }) => !onlyWrong || !grade.perQuestion[i])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <PageHeader title="Auswertung" subtitle="Ergebnis deiner Probeprüfung mit Lösungen." />
      <Card className={cn('border-2', grade.passed ? 'border-success/60' : 'border-destructive/60')}>
        <CardContent className="flex flex-wrap items-center gap-6 p-6">
          <div className={cn('flex size-16 items-center justify-center rounded-full', grade.passed ? 'bg-success/15 text-success' : 'bg-destructive/15 text-destructive')}>
            {grade.passed ? <Trophy className="size-8" /> : <XCircle className="size-8" />}
          </div>
          <div className="min-w-48 flex-1">
            <p className="text-2xl font-bold">{grade.passed ? 'Bestanden' : 'Nicht bestanden'}</p>
            <p className="text-muted-foreground">
              {grade.correct} von {grade.total} richtig · {Math.round(grade.percent)} % (Bestehensgrenze {PASS_PERCENT} %)
            </p>
            <p className="text-sm text-muted-foreground">
              Zeit: {formatClock(usedSec)} von {formatClock(session.limitSec)} · {grade.answered} beantwortet
            </p>
          </div>
          <Button onClick={clear}>
            <RotateCcw /> Neue Prüfung
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nach Themengruppe</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grade.byGroup.map((g) => {
              const pct = (g.correct / g.total) * 100
              return (
                <div key={g.group} className="space-y-1">
                  <div className="flex justify-between gap-2 text-sm">
                    <span>{EXAM_GROUPS[g.group].label}</span>
                    <span className="font-mono tabular-nums">{g.correct}/{g.total}</span>
                  </div>
                  <Bar value={pct} className={pct >= PASS_PERCENT ? 'bg-success' : 'bg-destructive'} />
                </div>
              )
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Nach Schwierigkeit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {grade.byDifficulty.map((d) => (
              <div key={d.difficulty} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>{DIFFICULTY_LABEL[d.difficulty]}</span>
                  <span className="font-mono tabular-nums">{d.correct}/{d.total}</span>
                </div>
                <Bar value={(d.correct / d.total) * 100} />
              </div>
            ))}
            <p className="pt-2 text-xs text-muted-foreground">Schwache Gruppen gezielt im Prüfungstrainer üben – falsch beantwortete Fragen findest du unter „Fehler wiederholen".</p>
            <Button variant="outline" size="sm" asChild>
              <a href="#/quiz/wiederholen">Fehler wiederholen</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Fragen und Lösungen</h2>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" className="size-4" checked={onlyWrong} onChange={(e) => setOnlyWrong(e.target.checked)} /> nur falsche Antworten
          </label>
        </div>
        {shown.length === 0 && <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Keine falschen Antworten – stark!</p>}
        {shown.map(({ q, i }) => (
          <Card key={q.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {grade.perQuestion[i] ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />}
                Frage {i + 1} · {topicInfo(q.topic).abbr}
              </div>
              <CardTitle className="text-base leading-snug">{q.prompt}</CardTitle>
            </CardHeader>
            <CardContent>
              <Solution q={q} correct={grade.perQuestion[i]} given={normalizeAnswer(q, session.answers[i])} />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
