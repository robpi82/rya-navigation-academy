import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, Eye, Ruler, MousePointerClick, RotateCcw, XCircle } from 'lucide-react'
import { formatBearing, formatNumber, rhumbLine } from '@/calculations'
import { CHART_EXERCISES, checkField, checkPlot, solveExercise, type ChartExercise } from '@/lib/chartExercises'
import { parseNumberInput } from '@/lib/quiz'
import { useProgressStore } from '@/stores/progressStore'
import type { LatLon } from '@/types/navigation'
import { SeaChart, type ChartOverlay } from '@/components/chart/SeaChart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { snapToMark } from './PlotTool'
import { TideTable } from './TideTable'

const LEVEL_LABEL = { 'day-skipper': 'Day Skipper', 'coastal-skipper': 'Coastal Skipper', 'yachtmaster-offshore': 'Yachtmaster' } as const
const LINE_COLOR = { ground: 'var(--vec-ground)', water: 'var(--vec-water)', tide: 'var(--vec-tide)', bearing: 'var(--vec-heading)' } as const
const LINE_CHEVRONS = { ground: 2, water: 1, tide: 3, bearing: 0 } as const

export function ExercisesPanel() {
  const results = useProgressStore((s) => s.chartResults)
  const [activeId, setActiveId] = useState(CHART_EXERCISES[0].id)
  const exercise = CHART_EXERCISES.find((e) => e.id === activeId)!
  const solved = CHART_EXERCISES.filter((e) => results[e.id]?.solved).length

  return (
    <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aufgaben</CardTitle>
          <p className="text-xs text-muted-foreground">
            {solved} von {CHART_EXERCISES.length} gelöst
          </p>
        </CardHeader>
        <CardContent className="px-2">
          <ul className="space-y-0.5">
            {CHART_EXERCISES.map((e, i) => {
              const r = results[e.id]
              return (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => setActiveId(e.id)}
                    aria-current={e.id === activeId}
                    className={cn('flex w-full items-start gap-2 rounded-md px-2 py-1.5 text-left text-sm', e.id === activeId ? 'bg-accent font-medium' : 'hover:bg-muted')}
                  >
                    {r?.solved ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : r ? <XCircle className="mt-0.5 size-4 shrink-0 text-destructive" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                    <span>
                      {i + 1}. {e.title}
                      {e.level === 'coastal-skipper' && <span className="block text-[11px] text-muted-foreground">Coastal Skipper</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>
      <ExerciseView key={exercise.id} exercise={exercise} />
    </div>
  )
}

function ExerciseView({ exercise }: { exercise: ChartExercise }) {
  const solution = useMemo(() => solveExercise(exercise), [exercise])
  const record = useProgressStore((s) => s.recordChartResult)
  const [mode, setMode] = useState<'measure' | 'answer'>(solution.plot ? 'answer' : 'measure')
  const [measure, setMeasure] = useState<LatLon[]>([])
  const [answerPos, setAnswerPos] = useState<LatLon | null>(null)
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<null | { ok: boolean; fieldOk: Record<string, boolean>; plotError?: number }>(null)
  const [showSolution, setShowSolution] = useState(false)

  const diamondInfo = exercise.type === 'tidal' ? { d: exercise.diamond, r: exercise.range, h: exercise.hour } : exercise.type === 'ep' ? { d: exercise.diamond, r: exercise.range, h: exercise.hour } : exercise.type === 'cts' ? { d: exercise.diamond, r: exercise.range, h: exercise.startHour } : null

  const ready = solution.fields.every((f) => parseNumberInput(texts[f.key] ?? '') !== null) && (!solution.plot || answerPos !== null)

  const check = () => {
    const fieldOk: Record<string, boolean> = {}
    for (const f of solution.fields) fieldOk[f.key] = checkField(f, parseNumberInput(texts[f.key] ?? '')!)
    let ok = Object.values(fieldOk).every(Boolean)
    let plotError: number | undefined
    if (solution.plot && answerPos) {
      const r = checkPlot(solution.plot.pos, answerPos, solution.plot.toleranceNm)
      plotError = r.errorNm
      ok = ok && r.ok
    }
    setChecked({ ok, fieldOk, plotError })
    record(exercise.id, ok)
  }

  const reset = () => {
    setChecked(null)
    setShowSolution(false)
    setAnswerPos(null)
    setTexts({})
    setMeasure([])
  }

  const overlays: ChartOverlay[] = []
  solution.given.forEach((g, i) => overlays.push({ kind: 'point', id: `g${i}`, pos: g.pos, symbol: g.symbol, label: g.label }))
  if (measure.length >= 1) overlays.push({ kind: 'point', id: 'm0', pos: measure[0], symbol: 'cross', color: 'var(--vec-heading)' })
  if (measure.length === 2) {
    const r = rhumbLine(measure[0], measure[1])
    overlays.push({ kind: 'line', id: 'm', from: measure[0], to: measure[1], color: 'var(--vec-heading)', dashed: true, arrow: true, label: `${formatBearing(r.bearing, 0)} · ${formatNumber(r.distance, 2)} NM` })
  }
  if (answerPos && solution.plot) overlays.push({ kind: 'point', id: 'ans', pos: answerPos, symbol: solution.plot.symbol, label: 'Deine Lösung', color: 'var(--destructive)' })
  if (showSolution) {
    solution.lines.forEach((l, i) => overlays.push({ kind: 'line', id: `s${i}`, from: l.from, to: l.to, color: LINE_COLOR[l.kind], chevrons: LINE_CHEVRONS[l.kind], dashed: l.kind === 'bearing' }))
    if (solution.plot) {
      overlays.push({ kind: 'circle', id: 'tol', center: solution.plot.pos, radiusNm: solution.plot.toleranceNm, color: 'var(--success)' })
      overlays.push({ kind: 'point', id: 'sol', pos: solution.plot.pos, symbol: solution.plot.symbol, label: 'Lösung', color: 'var(--success)' })
    }
  }

  const onMapClick = (p: LatLon) => {
    if (mode === 'answer' && solution.plot) {
      if (!checked) setAnswerPos(p)
      return
    }
    const s = snapToMark(p).pos
    setMeasure((m) => (m.length >= 2 ? [s] : [...m, s]))
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{LEVEL_LABEL[exercise.level]}</Badge>
            <Badge variant="secondary">{['', 'leicht', 'mittel', 'schwer'][exercise.difficulty]}</Badge>
            <Badge variant="secondary">{solution.plot ? 'Plotaufgabe' : 'Mess-/Rechenaufgabe'}</Badge>
          </div>
          <CardTitle className="pt-1 text-lg">{exercise.title}</CardTitle>
          <p className="leading-relaxed">{solution.prompt}</p>
        </CardHeader>
      </Card>

      <div className="grid gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {solution.plot && (
              <Button size="sm" variant={mode === 'answer' ? 'default' : 'outline'} onClick={() => setMode('answer')} aria-pressed={mode === 'answer'}>
                <MousePointerClick /> Lösung setzen
              </Button>
            )}
            <Button size="sm" variant={mode === 'measure' ? 'default' : 'outline'} onClick={() => setMode('measure')} aria-pressed={mode === 'measure'}>
              <Ruler /> Messen
            </Button>
            <span className="text-xs text-muted-foreground">
              {mode === 'answer' ? 'Klick in die Karte setzt deine Position.' : 'Zwei Klicks messen Kurs und Distanz (rasten an Seezeichen ein).'}
            </span>
          </div>
          <SeaChart overlays={overlays} onMapClick={onMapClick} cursor="crosshair" className="h-[56vh]" />
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 pt-5">
              {solution.fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <label htmlFor={`${exercise.id}-${f.key}`} className="text-sm font-medium">
                    {f.label}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`${exercise.id}-${f.key}`}
                      inputMode="decimal"
                      disabled={!!checked}
                      value={texts[f.key] ?? ''}
                      onChange={(e) => setTexts((t) => ({ ...t, [f.key]: e.target.value }))}
                      className={cn(
                        'h-10 w-full rounded-md border bg-background px-3 font-mono',
                        checked && (checked.fieldOk[f.key] ? 'border-success' : 'border-destructive'),
                      )}
                    />
                    <span className="w-8 text-sm text-muted-foreground">{f.unit}</span>
                  </div>
                  {checked && !checked.fieldOk[f.key] && (
                    <p className="text-xs text-destructive">
                      Richtig: {f.bearing ? formatBearing(f.value) : `${formatNumber(f.value, f.unit === 'min' ? 0 : 2)} ${f.unit}`} (± {formatNumber(f.tolerance, f.tolerance < 1 ? 1 : 0)} {f.unit})
                    </p>
                  )}
                </div>
              ))}
              {solution.plot && (
                <p className="text-sm">
                  {answerPos ? 'Position gesetzt.' : 'Noch keine Position gesetzt.'} Toleranz: {formatNumber(solution.plot.toleranceNm, 1)} NM
                </p>
              )}
              {checked ? (
                <div className={cn('rounded-lg p-3 text-sm', checked.ok ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')} role="status">
                  <b>{checked.ok ? 'Richtig gelöst!' : 'Noch nicht richtig.'}</b>
                  {checked.plotError !== undefined && ` Abweichung deiner Position: ${formatNumber(checked.plotError, 2)} NM.`}
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {!checked ? (
                  <Button onClick={check} disabled={!ready}>
                    Prüfen
                  </Button>
                ) : (
                  <Button variant="outline" onClick={reset}>
                    <RotateCcw /> Nochmal
                  </Button>
                )}
                <Button variant="ghost" onClick={() => setShowSolution((s) => !s)} aria-pressed={showSolution}>
                  <Eye /> {showSolution ? 'Lösung ausblenden' : 'Lösung zeigen'}
                </Button>
              </div>
            </CardContent>
          </Card>
          {showSolution && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Lösungsweg</CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
                  {solution.steps.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}
          {diamondInfo && <TideTable diamond={diamondInfo.d} range={diamondInfo.r} highlightFrom={diamondInfo.h} />}
        </div>
      </div>
    </div>
  )
}
