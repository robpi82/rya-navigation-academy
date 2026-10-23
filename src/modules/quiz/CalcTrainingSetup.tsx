import { useMemo, useState } from 'react'
import {
  Anchor,
  AudioWaveform,
  Check,
  Clock,
  Compass,
  FunctionSquare,
  Globe,
  LifeBuoy,
  LocateOff,
  Map,
  Navigation,
  Play,
  Radar,
  Sigma,
  Spline,
  Star,
  Target,
  Waves,
  Wind,
  type LucideIcon,
} from 'lucide-react'
import { CompassRose } from '@/components/layout/Logo'
import { FORMULA_GROUPS } from '@/data/formulas'
import { isCalcQuestion, pickCalcQuestions, skillOf, skillStats, type SkillStat } from '@/lib/calcSkills'
import { cn } from '@/lib/utils'
import { QUESTION_BANK } from '@/questions'
import { useCalcTrainingStore, type CalcLevel } from '@/stores/calcTrainingStore'
import { useProgressStore } from '@/stores/progressStore'
import type { Question, QuizMode } from '@/types/learning'
import { heroImage, skillImage, type ResolvedImage } from './calcImages'
import { CroppedPhoto } from './CroppedPhoto'

const FORMULA_TITLE: Record<string, string> = Object.fromEntries(FORMULA_GROUPS.flatMap((g) => g.items.map((f) => [f.id, f.title.replace('­', '')])))
const COUNTS = [5, 10, 20] as const

const LEVELS: { value: CalcLevel; label: string; name: string; text: string }[] = [
  { value: 'day-skipper', label: 'Day Skipper', name: 'Day Skipper', text: 'Kurs gegen Strom, Gezeiten, Kompass und Peilungen – die Rechengrundlagen für Törns in bekannten Küstengewässern.' },
  { value: 'coastal-skipper', label: 'Coastal', name: 'Coastal Skipper', text: 'Küstennavigation vertiefen: Strom an Kaps, Ankern, Navigation ohne GPS und Begegnungen bei Nacht und Nebel.' },
  { value: 'yachtmaster-offshore', label: 'Yachtmaster', name: 'Yachtmaster Offshore', text: 'Offshore-Navigation: Großkreis, Routing und Nachtfahrt bis zur Astronavigation – für lange Schläge über offene See.' },
  { value: 'all', label: 'Alle', name: 'Alle Ausbildungsstufen', text: 'Rechenaufgaben aus Day Skipper, Coastal und Yachtmaster gemischt – gleichnamige Rechenarten sind zusammengefasst.' },
]

/** Symbol je Rechenart (IDs aus CALC_SKILLS) */
const SKILL_ICON: Record<string, LucideIcon> = {
  vectors: Navigation,
  dst: Clock,
  compass: Compass,
  tides: Waves,
  anchoring: Anchor,
  nogps: LocateOff,
  chart: Map,
  wind: Wind,
  streams: Spline,
  collision: Radar,
  enav: AudioWaveform,
  safety: LifeBuoy,
  offshore: Globe,
  astro: Star,
}

const FALLBACK = 'bg-[radial-gradient(120%_140%_at_85%_0%,oklch(0.32_0.06_240)_0%,oklch(0.2_0.045_252)_45%,oklch(0.14_0.03_258)_100%)]'

const pctOf = (part: number, total: number) => (total ? Math.round((part / total) * 100) : 0)

/** Einstieg ins Rechentraining: Stufe, Rechenarten und Anzahl wählen, Schwächen zuerst. */
export function CalcTrainingSetup({ onStart }: { onStart: (m: QuizMode, q: Question[]) => void }) {
  const questionStats = useProgressStore((s) => s.questionStats)
  const level = useCalcTrainingStore((s) => s.level)
  const setLevel = useCalcTrainingStore((s) => s.setLevel)
  const [skills, setSkills] = useState<string[]>([])
  const [count, setCount] = useState<(typeof COUNTS)[number]>(10)
  const [weakFirst, setWeakFirst] = useState(true)

  const allCalc = useMemo(() => QUESTION_BANK.filter(isCalcQuestion), [])
  const levelPool = useMemo(() => allCalc.filter((q) => level === 'all' || q.level === level), [allCalc, level])
  const stats = useMemo(() => skillStats(levelPool, questionStats), [levelPool, questionStats])
  // geübte Aufgaben (mindestens einmal beantwortet) je Rechenart
  const practiced = useMemo(() => {
    const m: Record<string, number> = {}
    for (const q of levelPool) {
      const id = skillOf(q)?.id
      if (id && questionStats[q.id]) m[id] = (m[id] ?? 0) + 1
    }
    return m
  }, [levelPool, questionStats])
  const pool = skills.length ? levelPool.filter((q) => skills.includes(skillOf(q)?.id ?? '')) : levelPool
  const n = Math.min(count, pool.length)
  const toggle = (id: string) => setSkills((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]))
  const weakest = stats.filter((s) => s.accuracy !== null).sort((a, b) => a.accuracy! - b.accuracy!)[0]
  const meta = LEVELS.find((l) => l.value === level)!
  const hero = heroImage(level)

  const totalPracticed = Object.values(practiced).reduce((a, b) => a + b, 0)
  const totalCorrect = stats.reduce((a, s) => a + s.correct, 0)
  const totalAnswered = stats.reduce((a, s) => a + s.answered, 0)

  return (
    <div className="space-y-6">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/40">
        <div className={cn('absolute inset-0', FALLBACK)} aria-hidden />
        {!hero && <CompassRose className="pointer-events-none absolute -top-16 -right-10 size-72 opacity-[0.08]" />}
        {hero && (
          // Maske blendet das Foto weich in den Hintergrund aus (mobil nach unten, sonst nach links)
          <div className="relative h-40 [mask-image:linear-gradient(to_bottom,black_50%,transparent)] sm:absolute sm:inset-y-0 sm:right-0 sm:h-auto sm:w-[68%] sm:[mask-image:linear-gradient(to_right,transparent,black_45%)]">
            <CroppedPhoto key={level} image={hero} fallback="" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[oklch(0.15_0.035_255/0.5)] to-[oklch(0.15_0.035_255/0.05)]" />
            <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-[oklch(0.13_0.03_255/0.7)] to-transparent to-50%" />
          </div>
        )}
        <div className="relative flex min-h-[15rem] flex-col justify-end gap-4 p-5 sm:max-w-[60%] sm:p-8 lg:max-w-[55%]">
          <div className="space-y-2">
            <p className="text-xs font-semibold tracking-[0.22em] text-gold uppercase">
              Rechentraining · {meta.name}
            </p>
            <h1 className="font-display text-4xl leading-none font-semibold text-white sm:text-5xl">Rechentraining</h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">{meta.text}</p>
          </div>
          <HeroProgress available={levelPool.length} practiced={totalPracticed} correct={totalCorrect} answered={totalAnswered} />
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/60">
            <span>{allCalc.length} Rechenaufgaben insgesamt, immer mit Rechenweg und Formel-Link</span>
            <a href="#/formeln" className="inline-flex items-center gap-1.5 font-medium text-gold hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
              <FunctionSquare className="size-4" /> Formelsammlung
            </a>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <section className="min-w-0 space-y-4" aria-labelledby="calc-skills-title">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="calc-skills-title" className="font-display text-2xl font-semibold text-white">
                Rechenarten
              </h2>
              <p className="text-sm text-muted-foreground">Antippen, um nur bestimmte Rechenarten zu üben – ohne Auswahl kommen alle dran.</p>
            </div>
            <Segmented
              label="Ausbildungsstufe"
              value={level}
              onChange={(l) => {
                setLevel(l)
                setSkills([])
              }}
              options={LEVELS.map((l) => ({ value: l.value, label: l.label }))}
            />
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {stats.map((s) => (
              <li key={`${level}-${s.skill.id}`}>
                <SkillCard stat={s} practiced={practiced[s.skill.id] ?? 0} image={skillImage(level, s.skill.id, levelPool)} on={skills.includes(s.skill.id)} onToggle={() => toggle(s.skill.id)} />
              </li>
            ))}
          </ul>
        </section>

        <aside className="h-fit lg:sticky lg:top-6" aria-labelledby="calc-run-title">
          <div className="relative overflow-hidden rounded-2xl border border-gold/25 bg-[linear-gradient(160deg,oklch(0.23_0.045_250/0.95),oklch(0.16_0.035_256/0.95))] p-5 shadow-xl shadow-black/40">
            <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" />
            <h2 id="calc-run-title" className="flex items-center gap-2 font-display text-2xl font-semibold text-white">
              <Sigma className="size-5 text-gold" aria-hidden /> Durchgang
            </h2>
            {weakest && weakest.accuracy! < 0.7 && (
              <p className="mt-2 flex gap-2 rounded-lg border border-amber-300/20 bg-amber-300/5 p-3 text-sm text-white/75">
                <Target className="mt-0.5 size-4 shrink-0 text-amber-300" aria-hidden />
                <span>
                  Schwächste Rechenart: <span className="font-medium text-white">{weakest.skill.label}</span> –{' '}
                  <a className="text-teal-300 hover:underline" href={`#/formeln/${weakest.skill.formulaId}`}>
                    {FORMULA_TITLE[weakest.skill.formulaId]}
                  </a>{' '}
                  ansehen.
                </span>
              </p>
            )}
            <div className="mt-5 space-y-5">
              <div className="space-y-2">
                <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">Anzahl</span>
                <Segmented
                  label="Anzahl Aufgaben"
                  value={String(count) as '5' | '10' | '20'}
                  onChange={(v) => setCount(Number(v) as 5 | 10 | 20)}
                  options={COUNTS.map((c) => ({ value: String(c) as '5' | '10' | '20', label: String(c) }))}
                  stretch
                />
              </div>
              <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-white/85 hover:bg-white/[0.06]">
                <span>
                  Schwächen zuerst
                  <span className="block text-xs text-white/50">Zuletzt falsch gelöste und neue Aufgaben nach vorn</span>
                </span>
                <input type="checkbox" checked={weakFirst} onChange={(e) => setWeakFirst(e.target.checked)} className="size-4 shrink-0 accent-teal-400" />
              </label>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold tracking-wider text-white/60 uppercase">Rechenarten</span>
                  {skills.length > 0 && (
                    <button type="button" onClick={() => setSkills([])} className="text-xs text-teal-300 hover:underline">
                      Auswahl aufheben
                    </button>
                  )}
                </div>
                <p className="text-white/80">{skills.length ? `${skills.length} von ${stats.length} Rechenarten gewählt` : `Alle ${stats.length} Rechenarten`}</p>
              </div>
              <button
                type="button"
                disabled={n === 0}
                onClick={() => onStart('learn', pickCalcQuestions(pool, questionStats, n, weakFirst))}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[oklch(0.86_0.12_82)] to-[oklch(0.74_0.13_72)] px-4 py-3 text-sm font-semibold text-gold-foreground shadow-lg shadow-amber-900/30 transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Play className="size-4 fill-current" aria-hidden /> {n} Aufgaben rechnen
              </button>
              <p className="text-xs text-white/55">{pool.length} Aufgaben in der Auswahl. Immer im Lernmodus mit sofortigem Rechenweg.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function HeroProgress({ available, practiced, correct, answered }: { available: number; practiced: number; correct: number; answered: number }) {
  const share = pctOf(practiced, available)
  return (
    <div className="max-w-md rounded-xl border border-white/10 bg-black/30 p-3 backdrop-blur-sm">
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-white">Geübt: {practiced} von {available} Aufgaben</span>
        <span className="font-semibold text-teal-300 tabular-nums">{share} %</span>
      </div>
      <div
        className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Geübte Aufgaben"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={share}
      >
        <div className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-300" style={{ width: `${share}%` }} />
      </div>
      <p className="mt-1.5 text-xs text-white/60">
        {answered ? `${correct} von ${answered} Antworten richtig (${pctOf(correct, answered)} %)` : 'Noch keine Antworten in diesem Bereich'}
      </p>
    </div>
  )
}

function SkillCard({ stat: s, practiced, image, on, onToggle }: { stat: SkillStat; practiced: number; image?: ResolvedImage; on: boolean; onToggle: () => void }) {
  const Icon = SKILL_ICON[s.skill.id] ?? Sigma
  const pct = s.accuracy === null ? null : Math.round(s.accuracy * 100)
  const good = pct !== null && pct >= 70
  // Mit Ausschnitt nur oberer Fotostreifen, ein textfreies Foto füllt die ganze Karte
  const band = !image || image.crop
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className={cn(
        'group relative flex h-full min-h-36 w-full flex-col overflow-hidden rounded-xl border text-left shadow-lg shadow-black/30 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-300',
        on ? 'border-teal-300/70 ring-1 ring-teal-300/50' : 'border-white/10 hover:-translate-y-0.5 hover:border-white/25',
      )}
    >
      <div aria-hidden className="absolute inset-0 bg-[oklch(0.17_0.036_254)]" />
      <div aria-hidden className={cn('absolute inset-x-0 top-0', band ? 'h-16' : 'bottom-0')}>
        <CroppedPhoto image={image} fallback={FALLBACK} className="transition-transform duration-500 group-hover:scale-[1.03]" />
        <div className={cn('absolute inset-0', band ? 'bg-gradient-to-b from-transparent via-[oklch(0.17_0.036_254/0.35)] to-[oklch(0.17_0.036_254)]' : 'bg-[linear-gradient(to_right,oklch(0.15_0.035_255/0.95),oklch(0.15_0.035_255/0.8)_55%,oklch(0.15_0.035_255/0.6)),linear-gradient(to_top,oklch(0.15_0.035_255/0.85),transparent_70%)]')} />
      </div>
      {on && (
        <span className="absolute top-2.5 right-2.5 flex size-6 items-center justify-center rounded-full bg-teal-300 text-[oklch(0.2_0.04_255)] shadow" aria-hidden>
          <Check className="size-4" strokeWidth={3} />
        </span>
      )}
      <div className="relative mt-auto flex items-start gap-3 p-4 pt-10">
        <span
          className={cn(
            'flex size-12 shrink-0 items-center justify-center rounded-full border bg-[oklch(0.15_0.035_255/0.6)] backdrop-blur-sm',
            on ? 'border-teal-300/70 text-teal-200' : 'border-gold/40 text-gold',
          )}
        >
          <Icon className="size-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <span className="text-sm leading-snug font-semibold text-white">{s.skill.label}</span>
            <span
              className={cn(
                'shrink-0 rounded-full border px-2 py-0.5 text-xs font-medium tabular-nums',
                pct === null ? 'border-white/15 bg-black/40 text-white/80 backdrop-blur-sm' : good ? 'border-teal-300/30 bg-teal-300/10 text-teal-200' : 'border-amber-300/30 bg-amber-300/10 text-amber-200',
              )}
            >
              {pct === null ? 'neu' : `${pct} %`}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10" role="img" aria-label={pct === null ? 'Noch keine Trefferquote' : `Trefferquote ${pct} %`}>
            <div className={cn('h-full rounded-full', good ? 'bg-teal-400' : 'bg-amber-400')} style={{ width: `${pct ?? 0}%` }} />
          </div>
          <div className="text-xs text-white/65">
            {s.available} {s.available === 1 ? 'Aufgabe' : 'Aufgaben'} · {practiced} geübt · {s.answered ? `${s.correct}/${s.answered} richtig` : 'noch nicht geübt'}
          </div>
        </div>
      </div>
    </button>
  )
}

/** Umschalter im Marine-Look (gleiches Verhalten wie Toggle: Knopfgruppe mit aria-pressed) */
function Segmented<T extends string>({ value, options, onChange, label, stretch }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; stretch?: boolean }) {
  return (
    <div className={cn('max-w-full flex-wrap rounded-lg border border-white/10 bg-black/25 p-1', stretch ? 'flex' : 'inline-flex')} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-teal-300',
            stretch && 'flex-1',
            value === o.value ? 'bg-teal-300/15 text-teal-100 shadow-[inset_0_0_0_1px_rgb(94_234_212/0.45)]' : 'text-white/65 hover:text-white',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
