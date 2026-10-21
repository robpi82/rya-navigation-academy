import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ArrowRight,
  CheckCircle2,
  ClipboardCheck,
  GraduationCap,
  History,
  Play,
  RotateCcw,
  Timer,
  XCircle,
} from 'lucide-react'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'
import { GLOSSARY } from '@/data/glossary'
import { CATEGORY_LABEL, type Question, type QuestionCategory, type QuizAnswerRecord, type QuizMode, type TopicId, type CourseLevel } from '@/types/learning'
import { BuoyIcon } from '@/components/nautical/BuoyIcon'
import { BUOY_BY_ID } from '@/data/buoyage'
import { COASTAL_TOPICS, COASTAL_TOPIC_IDS, DAY_TOPICS, DAY_TOPIC_IDS, YACHT_TOPICS, YACHT_TOPIC_IDS, topicInfo } from '@/data/topics'
import { MatchInput } from './MatchInput'
import { CalcTrainingSetup } from './CalcTrainingSetup'
import { CALC_SKILLS, skillOf } from '@/lib/calcSkills'
import { FORMULA_GROUPS } from '@/data/formulas'
import { QuestionDiagram } from './QuestionDiagram'
import { formatClock, isAnswerCorrect, parseNumberInput, shuffle } from '@/lib/quiz'
import { questionsNeedingReview } from '@/lib/stats'
import { formatBearing, formatNumber } from '@/calculations'
import { useProgressStore } from '@/stores/progressStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type Phase =
  | { kind: 'setup' }
  | { kind: 'running'; mode: QuizMode; questions: Question[]; startedAt: number }
  | { kind: 'results'; mode: QuizMode; questions: Question[]; answers: QuizAnswerRecord[]; durationSec: number }

const DIFFICULTY_LABEL = { 1: 'leicht', 2: 'mittel', 3: 'schwer' } as const

export function QuizPage({ preset, topic }: { preset?: 'review' | 'calc'; topic?: string }) {
  const [phase, setPhase] = useState<Phase>({ kind: 'setup' })
  const recordAttempt = useProgressStore((s) => s.recordAttempt)

  const start = (mode: QuizMode, questions: Question[]) =>
    setPhase({ kind: 'running', mode, questions, startedAt: Date.now() })

  if (phase.kind === 'running')
    return (
      <QuizRunner
        key={phase.startedAt}
        mode={phase.mode}
        questions={phase.questions}
        startedAt={phase.startedAt}
        onCancel={() => setPhase({ kind: 'setup' })}
        onFinish={(answers) => {
          const durationSec = Math.round((Date.now() - phase.startedAt) / 1000)
          recordAttempt({
            id: `${phase.startedAt}`,
            date: new Date().toISOString(),
            mode: phase.mode,
            durationSec,
            answers,
          })
          setPhase({ kind: 'results', mode: phase.mode, questions: phase.questions, answers, durationSec })
        }}
      />
    )

  if (phase.kind === 'results')
    return (
      <QuizResults
        {...phase}
        onRetryWrong={(qs) => start('learn', qs)}
        onRestart={() => setPhase({ kind: 'setup' })}
      />
    )

  if (preset === 'calc') return <CalcTrainingSetup onStart={start} />
  return <QuizSetup initialReview={preset === 'review'} initialTopic={topic} onStart={start} />
}

/* ------------------------------------------------------------------ Setup */

function QuizSetup({ initialReview, initialTopic, onStart }: { initialReview: boolean; initialTopic?: string; onStart: (m: QuizMode, q: Question[]) => void }) {
  const questionStats = useProgressStore((s) => s.questionStats)
  const attempts = useProgressStore((s) => s.attempts)
  const reviewIds = useMemo(() => questionsNeedingReview(questionStats), [questionStats])
  const [mode, setMode] = useState<QuizMode>('learn')
  // Vorauswahl über #/quiz/thema/<id>: Stufe passend zur ersten Frage des Themas
  const presetQuestion = initialTopic ? QUESTION_BANK.find((q) => q.topic === initialTopic) : undefined
  const [level, setLevel] = useState<CourseLevel | 'all'>(presetQuestion?.level ?? 'day-skipper')
  const [topics, setTopics] = useState<TopicId[]>(presetQuestion ? [presetQuestion.topic] : [])
  const [categories, setCategories] = useState<QuestionCategory[]>([])
  const [difficulty, setDifficulty] = useState<0 | 1 | 2 | 3>(0)
  const [count, setCount] = useState<number>(10)
  const [onlyReview, setOnlyReview] = useState(initialReview && reviewIds.length > 0)

  const pool = useMemo(() => {
    let qs = onlyReview ? reviewIds.map((id) => QUESTION_BY_ID[id]).filter(Boolean) : QUESTION_BANK
    if (level !== 'all') qs = qs.filter((q) => q.level === level)
    if (topics.length) qs = qs.filter((q) => topics.includes(q.topic))
    if (categories.length) qs = qs.filter((q) => categories.includes(q.category))
    if (difficulty) qs = qs.filter((q) => q.difficulty === difficulty)
    return qs
  }, [onlyReview, reviewIds, level, topics, categories, difficulty])
  const toggleCategory = (c: QuestionCategory) =>
    setCategories((cs) => (cs.includes(c) ? cs.filter((x) => x !== c) : [...cs, c]))

  const toggleTopic = (t: TopicId) => setTopics((ts) => (ts.includes(t) ? ts.filter((x) => x !== t) : [...ts, t]))
  const n = Math.min(count, pool.length)

  return (
    <div className="space-y-6">
      <PageHeader
        title="Prüfungstrainer"
        subtitle={`${QUESTION_BANK.length} eigenständig erstellte Übungsaufgaben für Day Skipper und Coastal Skipper – mit Musterlösung und Rechenweg.`}
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardHeader>
            <CardTitle>Durchgang konfigurieren</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <fieldset>
              <legend className="mb-2 text-sm font-medium">Modus</legend>
              <div className="grid gap-3 sm:grid-cols-2">
                {(
                  [
                    { m: 'learn', icon: GraduationCap, title: 'Lernmodus', desc: 'Sofortiges Feedback mit Schritt-für-Schritt-Lösung nach jeder Frage.' },
                    { m: 'exam', icon: ClipboardCheck, title: 'Prüfungsmodus', desc: 'Keine Lösungen während des Durchgangs. Auswertung am Ende.' },
                  ] as const
                ).map(({ m, icon: Icon, title, desc }) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={cn(
                      'rounded-lg border p-4 text-left transition-colors',
                      mode === m ? 'border-primary bg-accent' : 'hover:bg-muted',
                    )}
                  >
                    <div className="flex items-center gap-2 font-semibold">
                      <Icon className="size-5 text-primary" /> {title}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Ausbildungsstufe</legend>
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { v: 'day-skipper', l: 'Day Skipper' },
                    { v: 'coastal-skipper', l: 'Coastal Skipper' },
                    { v: 'yachtmaster-offshore', l: 'Yachtmaster (Vorgriff)' },
                    { v: 'all', l: 'Alle Stufen' },
                  ] as const
                ).map(({ v, l }) => (
                  <Button
                    key={v}
                    size="sm"
                    variant={level === v ? 'default' : 'outline'}
                    aria-pressed={level === v}
                    onClick={() => {
                      setLevel(v)
                      setTopics([])
                    }}
                  >
                    {l} ({v === 'all' ? QUESTION_BANK.length : QUESTION_BANK.filter((q) => q.level === v).length})
                  </Button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Themen <span className="font-normal text-muted-foreground">(keine Auswahl = alle)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {[
                  ...(level === 'day-skipper' || level === 'all' ? GLOSSARY.map((t) => ({ id: t.id as TopicId, label: t.abbr })) : []),
                  ...(level === 'day-skipper' || level === 'all' ? DAY_TOPIC_IDS.map((id) => ({ id: id as TopicId, label: DAY_TOPICS[id].german })) : []),
                  ...(level === 'coastal-skipper' || level === 'all' ? COASTAL_TOPIC_IDS.map((id) => ({ id: id as TopicId, label: COASTAL_TOPICS[id].german })) : []),
                  ...(level === 'yachtmaster-offshore' || level === 'all' ? YACHT_TOPIC_IDS.map((id) => ({ id: id as TopicId, label: YACHT_TOPICS[id].german })) : []),
                ].map((t) => (
                  <Button key={t.id} size="sm" variant={topics.includes(t.id) ? 'default' : 'outline'} onClick={() => toggleTopic(t.id)} aria-pressed={topics.includes(t.id)}>
                    {t.label}
                  </Button>
                ))}
                {topics.length > 0 && (
                  <Button size="sm" variant="ghost" onClick={() => setTopics([])}>
                    Alle
                  </Button>
                )}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">
                Aufgabentyp <span className="font-normal text-muted-foreground">(keine Auswahl = alle)</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(CATEGORY_LABEL) as QuestionCategory[]).map((c) => (
                  <Button key={c} size="sm" variant={categories.includes(c) ? 'default' : 'outline'} onClick={() => toggleCategory(c)} aria-pressed={categories.includes(c)}>
                    {CATEGORY_LABEL[c]}
                  </Button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Schwierigkeit</legend>
              <div className="flex flex-wrap gap-2">
                {([0, 1, 2, 3] as const).map((d) => (
                  <Button key={d} size="sm" variant={difficulty === d ? 'default' : 'outline'} onClick={() => setDifficulty(d)} aria-pressed={difficulty === d}>
                    {d === 0 ? 'Alle' : DIFFICULTY_LABEL[d]}
                  </Button>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className="mb-2 text-sm font-medium">Anzahl Fragen</legend>
              <div className="flex flex-wrap gap-2">
                {[5, 10, 20, 30, 999].map((c) => (
                  <Button key={c} size="sm" variant={count === c ? 'default' : 'outline'} onClick={() => setCount(c)} aria-pressed={count === c}>
                    {c === 999 ? 'Alle' : c}
                  </Button>
                ))}
              </div>
            </fieldset>

            <label className={cn('flex items-center gap-3 text-sm', reviewIds.length === 0 && 'opacity-50')}>
              <input
                type="checkbox"
                className="size-4 accent-[var(--primary)]"
                checked={onlyReview}
                disabled={reviewIds.length === 0}
                onChange={(e) => setOnlyReview(e.target.checked)}
              />
              Nur zuletzt falsch beantwortete Fragen wiederholen ({reviewIds.length})
            </label>

            <div className="flex flex-wrap items-center gap-3 border-t pt-4">
              <Button size="lg" disabled={n === 0} onClick={() => onStart(mode, shuffle(pool).slice(0, n))}>
                <Play /> {n} {n === 1 ? 'Frage' : 'Fragen'} starten
              </Button>
              {n === 0 && <span className="text-sm text-muted-foreground">Keine Fragen für diese Auswahl.</span>}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <History className="size-5" /> Letzte Durchgänge
            </CardTitle>
            <CardDescription>Lokal gespeichert</CardDescription>
          </CardHeader>
          <CardContent>
            {attempts.length === 0 ? (
              <p className="text-sm text-muted-foreground">Noch keine Durchgänge.</p>
            ) : (
              <ul className="space-y-2">
                {[...attempts]
                  .reverse()
                  .slice(0, 8)
                  .map((a) => {
                    const correct = a.answers.filter((x) => x.correct).length
                    const pct = Math.round((correct / a.answers.length) * 100)
                    return (
                      <li key={a.id} className="flex items-center justify-between gap-2 rounded-md bg-muted/60 px-3 py-2 text-sm">
                        <div>
                          <div className="font-medium">{a.mode === 'exam' ? 'Prüfung' : 'Lernmodus'}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(a.date).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })} · {formatClock(a.durationSec)}
                          </div>
                        </div>
                        <Badge variant={pct >= 70 ? 'success' : 'destructive'}>
                          {correct}/{a.answers.length}
                        </Badge>
                      </li>
                    )
                  })}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Runner */

function useElapsedSeconds(startedAt: number) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [])
  return Math.max(0, (now - startedAt) / 1000)
}

function QuizRunner({
  mode,
  questions,
  startedAt,
  onFinish,
  onCancel,
}: {
  mode: QuizMode
  questions: Question[]
  startedAt: number
  onFinish: (answers: QuizAnswerRecord[]) => void
  onCancel: () => void
}) {
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswerRecord[]>([])
  const [selected, setSelected] = useState<number | null>(null)
  const [text, setText] = useState('')
  const [matches, setMatches] = useState<(number | null)[]>(() => emptyMatches(questions[0]))
  const [inputError, setInputError] = useState<string | null>(null)
  const [revealed, setRevealed] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const elapsed = useElapsedSeconds(startedAt)
  const q = questions[index]
  const isLast = index === questions.length - 1

  useEffect(() => {
    if (q.type === 'numeric') inputRef.current?.focus()
  }, [q])

  const submit = () => {
    let given: number | number[] | null
    if (q.type === 'mc') {
      if (selected === null) return
      given = selected
    } else if (q.type === 'match') {
      if (matches.some((m) => m === null)) return
      given = matches as number[]
    } else {
      given = parseNumberInput(text)
      if (given === null) {
        setInputError('Bitte eine Zahl eingeben, z. B. 5,4')
        return
      }
    }
    setInputError(null)
    const record: QuizAnswerRecord = { questionId: q.id, topic: q.topic, correct: isAnswerCorrect(q, given), given }
    const next = [...answers, record]
    setAnswers(next)
    if (mode === 'learn') setRevealed(true)
    else advance(next)
  }

  const advance = (list = answers) => {
    if (isLast) {
      onFinish(list)
      return
    }
    setIndex((i) => i + 1)
    setMatches(emptyMatches(questions[index + 1]))
    setSelected(null)
    setText('')
    setRevealed(false)
  }

  const current = answers[index]

  return (
    <div className="mx-auto max-w-3xl space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant={mode === 'exam' ? 'default' : 'accent'}>{mode === 'exam' ? 'Prüfungsmodus' : 'Lernmodus'}</Badge>
          <span className="text-sm text-muted-foreground">
            Frage {index + 1} von {questions.length}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-mono text-sm tabular-nums" aria-label="Verstrichene Zeit">
            <Timer className="size-4" /> {formatClock(elapsed)}
          </span>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Abbrechen
          </Button>
        </div>
      </div>
      <Progress value={((index + (revealed ? 1 : 0)) / questions.length) * 100} />

      <Card>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{topicInfo(q.topic).abbr} · {topicInfo(q.topic).english}</Badge>
            <Badge variant="secondary">{DIFFICULTY_LABEL[q.difficulty]}</Badge>
            <Badge variant="secondary">{CATEGORY_LABEL[q.category]}</Badge>
          </div>
          <CardTitle className="pt-2 text-lg leading-snug">{q.prompt}</CardTitle>
          {q.type === 'mc' && q.buoy && (
            <div className="pt-2">
              <div className="mx-auto w-36 rounded-lg bg-[var(--chart-water)] p-2">
                <BuoyIcon id={q.buoy} className="h-auto w-full" title={`Tonne zur Aufgabe (${BUOY_BY_ID[q.buoy].english})`} />
              </div>
            </div>
          )}
          {q.type === 'mc' && q.diagram && (
            <div className="pt-2">
              <QuestionDiagram diagram={q.diagram} />
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              if (revealed) advance()
              else submit()
            }}
            className="space-y-4"
          >
            {q.type === 'mc' ? (
              <div className="grid gap-2" role="radiogroup">
                {q.options.map((opt, i) => {
                  const showCorrect = revealed && i === q.correctIndex
                  const showWrong = revealed && i === selected && i !== q.correctIndex
                  return (
                    <button
                      key={opt}
                      type="button"
                      role="radio"
                      aria-checked={selected === i}
                      disabled={revealed}
                      onClick={() => setSelected(i)}
                      className={cn(
                        'flex min-h-12 items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors',
                        !revealed && selected === i && 'border-primary bg-accent',
                        !revealed && selected !== i && 'hover:bg-muted',
                        showCorrect && 'border-success bg-success/10',
                        showWrong && 'border-destructive bg-destructive/10',
                      )}
                    >
                      <span
                        className={cn(
                          'flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs',
                          selected === i && !revealed && 'border-primary bg-primary text-primary-foreground',
                        )}
                      >
                        {showCorrect ? <CheckCircle2 className="size-5 text-success" /> : showWrong ? <XCircle className="size-5 text-destructive" /> : String.fromCharCode(65 + i)}
                      </span>
                      {opt}
                    </button>
                  )
                })}
              </div>
            ) : q.type === 'match' ? (
              <MatchInput question={q} value={matches} onChange={setMatches} revealed={revealed} />
            ) : (
              <div className="space-y-1">
                <label htmlFor="numeric-answer" className="text-sm font-medium">
                  Deine Antwort
                </label>
                <div className="flex items-center gap-2">
                  <input
                    id="numeric-answer"
                    ref={inputRef}
                    inputMode="decimal"
                    autoComplete="off"
                    disabled={revealed}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="h-11 w-40 rounded-md border bg-background px-3 font-mono text-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
                    aria-invalid={!!inputError}
                  />
                  <span className="text-muted-foreground">{q.unit}</span>
                </div>
                {inputError && <p className="text-sm text-destructive">{inputError}</p>}
                <p className="text-xs text-muted-foreground">
                  Toleranz ± {formatNumber(q.tolerance, q.tolerance < 0.1 ? 2 : 1)} {q.unit}
                </p>
              </div>
            )}

            {revealed && current && <Solution q={q} correct={current.correct} given={current.given} />}

            <div className="flex justify-end">
              {revealed ? (
                <Button type="submit">
                  {isLast ? 'Auswertung' : 'Nächste Frage'} <ArrowRight />
                </Button>
              ) : (
                <Button type="submit" disabled={q.type === 'mc' ? selected === null : q.type === 'match' ? matches.some((m) => m === null) : text.trim() === ''}>
                  {mode === 'exam' ? (isLast ? 'Abgeben' : 'Antwort speichern') : 'Prüfen'}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

const emptyMatches = (q: Question | undefined): (number | null)[] => (q?.type === 'match' ? q.pairs.map(() => null) : [])

function correctAnswerText(q: Question): string {
  if (q.type === 'mc') return q.options[q.correctIndex]
  if (q.type === 'match') return q.pairs.map((p) => `${p.left} → ${p.right}`).join('; ')
  return q.isBearing ? formatBearing(q.answer) : `${formatNumber(q.answer, 2)} ${q.unit}`
}

function givenText(q: Question, given: number | number[] | null): string {
  if (given === null) return '–'
  if (q.type === 'match')
    return Array.isArray(given) ? q.pairs.map((p, i) => `${p.left} → ${q.pairs[given[i]]?.right ?? '–'}`).join('; ') : '–'
  if (Array.isArray(given)) return '–'
  if (q.type === 'mc') return q.options[given] ?? '–'
  return `${formatNumber(given, 2)} ${q.unit}`
}

export function Solution({ q, correct, given }: { q: Question; correct: boolean; given: number | number[] | null }) {
  return (
    <div className={cn('space-y-2 rounded-lg border p-4', correct ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
      <p className={cn('flex items-center gap-2 font-semibold', correct ? 'text-success' : 'text-destructive')}>
        {correct ? <CheckCircle2 className="size-5" /> : <XCircle className="size-5" />}
        {correct ? 'Richtig!' : 'Nicht richtig.'}
      </p>
      {!correct && q.type !== 'match' && (
        <p className="text-sm">
          Deine Antwort: <span className="font-medium">{givenText(q, given)}</span> · Richtig:{' '}
          <span className="font-medium">{correctAnswerText(q)}</span>
        </p>
      )}
      <p className="text-sm font-medium">Musterlösung: {q.solution}</p>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
        {q.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <FormulaLink q={q} />
    </div>
  )
}

const FORMULA_TITLE: Record<string, string> = Object.fromEntries(FORMULA_GROUPS.flatMap((g) => g.items.map((f) => [f.id, f.title.replace('\u00AD', '')])))

/** Verweis von einer Rechenaufgabe auf Formel und Lektion ihrer Rechenart. */
function FormulaLink({ q }: { q: Question }) {
  const skill = skillOf(q)
  if (!skill) return null
  return (
    <p className="flex flex-wrap gap-x-3 gap-y-1 border-t pt-2 text-sm">
      <span className="text-muted-foreground">{skill.label}:</span>
      <a className="font-medium text-primary hover:underline" href={`#/formeln/${skill.formulaId}`}>
        Formel „{FORMULA_TITLE[skill.formulaId]}“
      </a>
      <a className="text-primary hover:underline" href={skill.href}>
        Zur Lektion
      </a>
    </p>
  )
}

/** Trefferquote je Rechenart in einem Durchgang. */
function SkillBreakdown({ questions, answers }: { questions: Question[]; answers: QuizAnswerRecord[] }) {
  const rows = CALC_SKILLS.map((skill) => {
    const qs = questions.filter((q) => skillOf(q)?.id === skill.id)
    const right = qs.filter((q) => answers.find((a) => a.questionId === q.id)?.correct).length
    return { skill, total: qs.length, right }
  }).filter((r) => r.total > 0)
  if (rows.length === 0) return null
  return (
    <Card>
      <CardHeader>
        <CardTitle>Nach Rechenart</CardTitle>
        <CardDescription>Wo es hakt, hilft ein Blick in die Formelsammlung.</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="divide-y">
          {rows.map((r) => (
            <li key={r.skill.id} className="flex flex-wrap items-center justify-between gap-2 py-2 text-sm">
              <span>{r.skill.label}</span>
              <span className="flex items-center gap-3">
                {r.right < r.total && (
                  <a className="text-primary hover:underline" href={`#/formeln/${r.skill.formulaId}`}>
                    Formel
                  </a>
                )}
                <Badge variant={r.right === r.total ? 'success' : 'destructive'}>
                  {r.right}/{r.total}
                </Badge>
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ Results */

function QuizResults({
  mode,
  questions,
  answers,
  durationSec,
  onRetryWrong,
  onRestart,
}: {
  mode: QuizMode
  questions: Question[]
  answers: QuizAnswerRecord[]
  durationSec: number
  onRetryWrong: (qs: Question[]) => void
  onRestart: () => void
}) {
  const correct = answers.filter((a) => a.correct).length
  const pct = Math.round((correct / answers.length) * 100)
  const wrongQs = questions.filter((q) => answers.find((a) => a.questionId === q.id && !a.correct))
  const [open, setOpen] = useState<string | null>(null)

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <PageHeader title="Ergebnis" subtitle={mode === 'exam' ? 'Prüfungsmodus – Auswertung' : 'Lernmodus – Zusammenfassung'} />
      <Card>
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-3">
          <div>
            <div className="text-sm text-muted-foreground">Ergebnis</div>
            <div className={cn('text-4xl font-bold', pct >= 70 ? 'text-success' : 'text-destructive')}>{pct} %</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Richtig</div>
            <div className="text-2xl font-semibold">
              {correct} / {answers.length}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Zeit</div>
            <div className="font-mono text-2xl font-semibold">{formatClock(durationSec)}</div>
          </div>
          <p className="text-sm text-muted-foreground sm:col-span-3">
            {pct >= 70
              ? 'Gut gemacht! Übungsziel (70 %) erreicht.'
              : 'Übungsziel (70 %) noch nicht erreicht – wiederhole die falsch beantworteten Fragen.'}
          </p>
        </CardContent>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button disabled={wrongQs.length === 0} onClick={() => onRetryWrong(wrongQs)}>
          <RotateCcw /> Falsche wiederholen ({wrongQs.length})
        </Button>
        <Button variant="outline" onClick={onRestart}>
          Neuer Durchgang
        </Button>
        <Button asChild variant="ghost">
          <a href="#/">Zum Dashboard</a>
        </Button>
      </div>

      <SkillBreakdown questions={questions} answers={answers} />

      <Card>
        <CardHeader>
          <CardTitle>Alle Fragen</CardTitle>
          <CardDescription>Antippen für Musterlösung und Rechenweg</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {questions.map((q, i) => {
            const a = answers.find((x) => x.questionId === q.id)
            const isOpen = open === q.id
            return (
              <div key={q.id} className="rounded-lg border">
                <button
                  type="button"
                  className="flex w-full items-start gap-3 p-3 text-left text-sm"
                  onClick={() => setOpen(isOpen ? null : q.id)}
                  aria-expanded={isOpen}
                >
                  {a?.correct ? <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-success" /> : <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" />}
                  <span className="flex-1">
                    <span className="text-muted-foreground">{i + 1}. </span>
                    {q.prompt}
                  </span>
                </button>
                {isOpen && a && (
                  <div className="px-3 pb-3">
                    <Solution q={q} correct={a.correct} given={a.given} />
                  </div>
                )}
              </div>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
