import { useMemo, useState } from 'react'
import { CheckCircle2, Circle, Crosshair, Eye, Flag, Hand, MapPin, Navigation, RotateCcw, Ruler, Trash2, Undo2, XCircle } from 'lucide-react'
import { formatBearing, formatNumber, rhumbDestination } from '@/calculations'
import { OpenSeaMapChart, type MapOverlay } from '@/components/chart/OpenSeaMapChart'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MAP_PROVIDERS } from '@/config/mapProviders'
import { AREA_BY_ID, PRACTICE_AREAS } from '@/data/practiceAreas'
import { checkField } from '@/lib/chartExercises'
import { measure, routeLegs } from '@/lib/measure'
import { parseNumberInput } from '@/lib/quiz'
import { formatPos, REAL_CHART_EXERCISES, solveRealExercise, type RealCourseExercise } from '@/lib/realChartExercises'
import { cn } from '@/lib/utils'
import { useProgressStore } from '@/stores/progressStore'
import type { LatLon } from '@/types/navigation'

const LEVEL_LABEL = { 'day-skipper': 'Day Skipper', 'coastal-skipper': 'Coastal Skipper', 'yachtmaster-offshore': 'Yachtmaster' } as const

const COLOR = { task: '#1d4ed8', measure: '#be185d', route: '#c2410c', bearing: '#6d28d9', solution: '#15803d', fix: '#0f172a' }

const f2 = (n: number) => formatNumber(n, 2)

/** Mess-Ergebnis: Loxodrome (Kurslinie) und Großkreis getrennt ausgewiesen */
function MeasureReadout({ points }: { points: LatLon[] }) {
  if (points.length < 2) return <p className="text-sm text-muted-foreground">{points.length === 0 ? 'Noch keine Messung.' : 'Zweiten Punkt anklicken …'}</p>
  const m = measure(points[0], points[1])
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
      <dt className="text-muted-foreground">Kurs (Loxodrome)</dt>
      <dd className="font-mono font-semibold">{formatBearing(m.rhumb.bearing)}</dd>
      <dt className="text-muted-foreground">Distanz</dt>
      <dd className="font-mono font-semibold">{f2(m.rhumb.distance)} sm</dd>
      {m.greatCircle && (
        <>
          <dt className="text-muted-foreground">Großkreis</dt>
          <dd className="font-mono">
            {formatBearing(m.greatCircle.initialBearing)} Anfangskurs · {f2(m.greatCircle.distance)} sm
          </dd>
        </>
      )}
    </dl>
  )
}

function measureOverlays(points: LatLon[]): MapOverlay[] {
  const out: MapOverlay[] = []
  if (points[0]) out.push({ kind: 'point', id: 'm0', layer: 'measure', pos: points[0], symbol: 'cross', color: COLOR.measure })
  if (points.length === 2) {
    const m = measure(points[0], points[1])
    out.push({ kind: 'line', id: 'm', layer: 'measure', points, color: COLOR.measure, dashed: true, arrow: true, label: `${formatBearing(m.rhumb.bearing, 0)} · ${f2(m.rhumb.distance)} sm` })
  }
  return out
}

/* ------------------------------------------------------------------ Aufgaben */

export function RealExercisesPanel({ onShowFictional }: { onShowFictional: () => void }) {
  const results = useProgressStore((s) => s.chartResults)
  const [activeId, setActiveId] = useState(REAL_CHART_EXERCISES[0].id)
  const exercise = REAL_CHART_EXERCISES.find((e) => e.id === activeId)!
  return (
    <div className="grid gap-4 xl:grid-cols-[230px_minmax(0,1fr)_320px]">
      <Card className="h-fit">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Aufgaben (reale Karte)</CardTitle>
          <p className="text-xs text-muted-foreground">
            {REAL_CHART_EXERCISES.filter((e) => results[e.id]?.solved).length} von {REAL_CHART_EXERCISES.length} gelöst
          </p>
        </CardHeader>
        <CardContent className="space-y-3 px-2">
          <ul className="space-y-0.5">
            {REAL_CHART_EXERCISES.map((e, i) => {
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
                      <span className="block text-[11px] text-muted-foreground">{AREA_BY_ID[e.areaId].name}</span>
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          <div className="rounded-lg border border-dashed p-2.5 text-xs leading-relaxed text-muted-foreground">
            Die 11 bisherigen Aufgaben (Strom, Kreuzpeilung, EP, Course to Steer) laufen weiter im fiktiven Übungsrevier.
            <Button size="sm" variant="outline" className="mt-2 w-full" onClick={onShowFictional}>
              Zum Übungsrevier
            </Button>
          </div>
        </CardContent>
      </Card>
      <RealExerciseView key={exercise.id} exercise={exercise} />
    </div>
  )
}

function RealExerciseView({ exercise }: { exercise: RealCourseExercise }) {
  const solution = useMemo(() => solveRealExercise(exercise), [exercise])
  const record = useProgressStore((s) => s.recordChartResult)
  const [tool, setTool] = useState<'pan' | 'measure'>('pan')
  const [points, setPoints] = useState<LatLon[]>([])
  const [texts, setTexts] = useState<Record<string, string>>({})
  const [checked, setChecked] = useState<null | { ok: boolean; fieldOk: Record<string, boolean> }>(null)
  const [showSolution, setShowSolution] = useState(false)
  const ready = solution.fields.every((f) => parseNumberInput(texts[f.key] ?? '') !== null)

  const check = () => {
    const fieldOk: Record<string, boolean> = {}
    for (const f of solution.fields) fieldOk[f.key] = checkField(f, parseNumberInput(texts[f.key] ?? '')!)
    const ok = Object.values(fieldOk).every(Boolean)
    setChecked({ ok, fieldOk })
    record(exercise.id, ok)
  }
  const reset = () => {
    setChecked(null)
    setShowSolution(false)
    setTexts({})
    setPoints([])
  }

  const overlays: MapOverlay[] = [
    { kind: 'point', id: 'from', layer: 'tasks', pos: exercise.from.pos, symbol: 'start', label: exercise.from.name, color: COLOR.task },
    { kind: 'point', id: 'to', layer: 'tasks', pos: exercise.to.pos, symbol: 'target', label: exercise.to.name, color: COLOR.task },
    ...measureOverlays(points),
  ]
  if (showSolution) overlays.push({ kind: 'line', id: 'sol', layer: 'tasks', points: [exercise.from.pos, exercise.to.pos], color: COLOR.solution, arrow: true, width: 2.5, label: `Lösung ${formatBearing(solution.rhumb.bearing, 0)} · ${f2(solution.rhumb.distance)} sm` })

  return (
    <>
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <Button size="sm" variant={tool === 'pan' ? 'default' : 'outline'} onClick={() => setTool('pan')} aria-pressed={tool === 'pan'}>
            <Hand /> Verschieben
          </Button>
          <Button size="sm" variant={tool === 'measure' ? 'default' : 'outline'} onClick={() => setTool('measure')} aria-pressed={tool === 'measure'}>
            <Ruler /> Messen
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setPoints([])} disabled={points.length === 0}>
            <Trash2 /> Messung löschen
          </Button>
          <span className="text-xs text-muted-foreground">{tool === 'measure' ? 'Zwei Klicks: Start, dann Ziel (rastet an WP-Markern ein).' : 'Karte ziehen und zoomen; zum Messen „Messen“ wählen.'}</span>
        </div>
        <OpenSeaMapChart
          area={AREA_BY_ID[exercise.areaId]}
          overlays={overlays}
          snapTargets={[exercise.from.pos, exercise.to.pos]}
          fitTo={[exercise.from.pos, exercise.to.pos]}
          onMapClick={tool === 'measure' ? (p) => setPoints((m) => (m.length >= 2 ? [p] : [...m, p])) : undefined}
          className="h-[58vh] xl:h-[calc(100vh-240px)]"
        />
        <Card>
          <CardContent className="pt-4">
            <MeasureReadout points={points} />
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">{LEVEL_LABEL[exercise.level]}</Badge>
              <Badge variant="secondary">{['', 'leicht', 'mittel', 'schwer'][exercise.difficulty]}</Badge>
              <Badge variant="secondary">{AREA_BY_ID[exercise.areaId].name}</Badge>
            </div>
            <CardTitle className="pt-1 text-lg">{exercise.title}</CardTitle>
            <p className="text-sm leading-relaxed">{solution.prompt}</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <ul className="space-y-1 rounded-lg bg-muted p-2.5 font-mono text-xs">
              <li>
                {exercise.from.name}: {formatPos(exercise.from.pos)}
              </li>
              <li>
                {exercise.to.name}: {formatPos(exercise.to.pos)}
              </li>
            </ul>
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
                    className={cn('h-10 w-full rounded-md border bg-background px-3 font-mono', checked && (checked.fieldOk[f.key] ? 'border-success' : 'border-destructive'))}
                  />
                  <span className="w-8 text-sm text-muted-foreground">{f.unit === 'NM' ? 'sm' : f.unit}</span>
                </div>
                {checked && !checked.fieldOk[f.key] && (
                  <p className="text-xs text-destructive">
                    Richtig: {f.bearing ? formatBearing(f.value) : `${f2(f.value)} sm`} (± {formatNumber(f.tolerance, f.tolerance < 1 ? 1 : 0)} {f.unit === 'NM' ? 'sm' : f.unit})
                  </p>
                )}
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Toleranz: Kurs ± 2°, Distanz ± 0,2 sm (wie im Übungsrevier).</p>
            {checked && (
              <div className={cn('rounded-lg p-3 text-sm', checked.ok ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')} role="status">
                <b>{checked.ok ? 'Richtig gelöst!' : 'Noch nicht richtig.'}</b>
              </div>
            )}
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
      </div>
    </>
  )
}

/* ------------------------------------------------------------------ Freies Messen und Plotten */

type Tool = 'pan' | 'measure' | 'route' | 'start' | 'target' | 'fix' | 'bearing'

interface Drawing {
  measure: LatLon[]
  route: LatLon[]
  start: LatLon | null
  target: LatLon | null
  fixes: LatLon[]
  bearings: { object: LatLon; bearing: number }[]
}

const EMPTY: Drawing = { measure: [], route: [], start: null, target: null, fixes: [], bearings: [] }

const TOOLS: { key: Tool; label: string; icon: typeof Ruler; hint: string }[] = [
  { key: 'pan', label: 'Verschieben', icon: Hand, hint: 'Karte ziehen, Mausrad oder zwei Finger zum Zoomen.' },
  { key: 'measure', label: 'Messen', icon: Ruler, hint: 'Zwei Klicks: Kurs (Loxodrome) und Distanz, Großkreis zum Vergleich.' },
  { key: 'route', label: 'Kurslinie', icon: Navigation, hint: 'Jeder Klick setzt einen Wegpunkt; Kurs und Distanz je Schlag.' },
  { key: 'start', label: 'Start', icon: MapPin, hint: 'Klick setzt den Startpunkt.' },
  { key: 'target', label: 'Ziel', icon: Flag, hint: 'Klick setzt den Zielpunkt.' },
  { key: 'bearing', label: 'Peillinie', icon: Crosshair, hint: 'Peilung eingeben, dann das gepeilte Objekt anklicken – die Standlinie läuft durch das Objekt.' },
  { key: 'fix', label: 'Positionskreuz', icon: Crosshair, hint: 'Klick setzt einen Fix (Kreis mit Punkt).' },
]

export function RealPlotTool() {
  const [areaId, setAreaId] = useState(PRACTICE_AREAS[0].id)
  const [tool, setTool] = useState<Tool>('measure')
  const [d, setD] = useState<Drawing>(EMPTY)
  const [history, setHistory] = useState<Drawing[]>([])
  const [bearingText, setBearingText] = useState('')
  const area = AREA_BY_ID[areaId]
  const bearingValue = parseNumberInput(bearingText)
  const bearingValid = bearingValue !== null && bearingValue >= 0 && bearingValue < 360

  const apply = (next: Drawing) => {
    setHistory((h) => [...h.slice(-49), d])
    setD(next)
  }
  const undo = () => {
    const prev = history[history.length - 1]
    if (!prev) return
    setHistory((h) => h.slice(0, -1))
    setD(prev)
  }
  const resetAll = () => apply(EMPTY)

  const onClick = (p: LatLon) => {
    switch (tool) {
      case 'measure':
        return apply({ ...d, measure: d.measure.length >= 2 ? [p] : [...d.measure, p] })
      case 'route':
        return apply({ ...d, route: [...d.route, p] })
      case 'start':
        return apply({ ...d, start: p })
      case 'target':
        return apply({ ...d, target: p })
      case 'fix':
        return apply({ ...d, fixes: [...d.fixes, p] })
      case 'bearing':
        if (bearingValid) apply({ ...d, bearings: [...d.bearings, { object: p, bearing: bearingValue! }] })
        return
    }
  }

  const route = routeLegs(d.route)
  const overlays: MapOverlay[] = [...measureOverlays(d.measure)]
  if (d.route.length) {
    d.route.forEach((p, i) => overlays.push({ kind: 'point', id: `r${i}`, layer: 'measure', pos: p, symbol: 'wp', label: String(i + 1), color: COLOR.route }))
    route.legs.forEach((l, i) => overlays.push({ kind: 'line', id: `rl${i}`, layer: 'measure', points: [l.from, l.to], color: COLOR.route, arrow: true, label: `${formatBearing(l.bearing, 0)} · ${f2(l.distance)} sm` }))
  }
  if (d.start) overlays.push({ kind: 'point', id: 'start', layer: 'measure', pos: d.start, symbol: 'start', label: 'Start', color: COLOR.task })
  if (d.target) overlays.push({ kind: 'point', id: 'target', layer: 'measure', pos: d.target, symbol: 'target', label: 'Ziel', color: COLOR.task })
  if (d.start && d.target) {
    const m = measure(d.start, d.target)
    overlays.push({ kind: 'line', id: 'st', layer: 'measure', points: [d.start, d.target], color: COLOR.task, arrow: true, width: 2.5, label: `${formatBearing(m.rhumb.bearing, 0)} · ${f2(m.rhumb.distance)} sm` })
  }
  d.bearings.forEach((b, i) => {
    // Standlinie: vom Objekt entgegen der Peilrichtung (Schiff liegt auf der Gegenpeilung)
    const far = rhumbDestination(b.object, (b.bearing + 180) % 360, 6)
    overlays.push({ kind: 'point', id: `bo${i}`, layer: 'bearings', pos: b.object, symbol: 'object', color: COLOR.bearing })
    overlays.push({ kind: 'line', id: `bl${i}`, layer: 'bearings', points: [far, b.object], color: COLOR.bearing, width: 2, label: `${formatBearing(b.bearing, 0)}` })
  })
  d.fixes.forEach((p, i) => overlays.push({ kind: 'point', id: `fx${i}`, layer: 'bearings', pos: p, symbol: 'fix', label: `Fix ${i + 1}`, color: COLOR.fix }))

  const activeHint = TOOLS.find((t) => t.key === tool)!.hint

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0 space-y-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <label className="flex items-center gap-2 text-sm font-medium">
            Gebiet
            <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="h-8 rounded-md border bg-background px-2 text-sm">
              {PRACTICE_AREAS.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} ({a.country})
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Werkzeuge">
          {TOOLS.map((t) => (
            <Button key={t.key} size="sm" variant={tool === t.key ? 'default' : 'outline'} onClick={() => setTool(t.key)} aria-pressed={tool === t.key}>
              <t.icon /> {t.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={undo} disabled={history.length === 0}>
            <Undo2 /> Rückgängig
          </Button>
          <Button size="sm" variant="ghost" onClick={resetAll} disabled={d === EMPTY}>
            <Trash2 /> Alles löschen
          </Button>
        </div>
        {tool === 'bearing' && (
          <label className="flex items-center gap-2 text-sm">
            Peilung zum Objekt
            <input value={bearingText} onChange={(e) => setBearingText(e.target.value)} inputMode="decimal" placeholder="z. B. 045" className={cn('h-8 w-24 rounded-md border bg-background px-2 font-mono', bearingText && !bearingValid && 'border-destructive')} />° rw
          </label>
        )}
        <p className="text-xs text-muted-foreground">{activeHint}</p>
        <OpenSeaMapChart area={area} overlays={overlays} onMapClick={tool === 'pan' ? undefined : onClick} className="h-[58vh] xl:h-[calc(100vh-260px)]" />
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{area.name}</CardTitle>
            <p className="text-xs leading-relaxed text-muted-foreground">{area.description}</p>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Messung</CardTitle>
          </CardHeader>
          <CardContent>
            <MeasureReadout points={d.measure} />
          </CardContent>
        </Card>
        {d.start && d.target && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Start → Ziel</CardTitle>
            </CardHeader>
            <CardContent>
              <MeasureReadout points={[d.start, d.target]} />
            </CardContent>
          </Card>
        )}
        {route.legs.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Kurslinie</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="font-medium">Schlag</th>
                    <th className="font-medium">Kurs</th>
                    <th className="text-right font-medium">Distanz</th>
                  </tr>
                </thead>
                <tbody className="font-mono">
                  {route.legs.map((l, i) => (
                    <tr key={i}>
                      <td>
                        {i + 1} → {i + 2}
                      </td>
                      <td>{formatBearing(l.bearing, 0)}</td>
                      <td className="text-right">{f2(l.distance)} sm</td>
                    </tr>
                  ))}
                  <tr className="border-t font-semibold">
                    <td colSpan={2}>Gesamt</td>
                    <td className="text-right">{f2(route.total)} sm</td>
                  </tr>
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Kartendaten</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
            <p>
              Grundkarte: {MAP_PROVIDERS.basemap.name}. Seezeichen: {MAP_PROVIDERS.seamarks.name}. Tiefenlinien und Lotungen sind darin nicht enthalten.
            </p>
            <p>Kurse werden als Loxodrome aus den Koordinaten berechnet (Kugelmodell) – unabhängig von Zoomstufe und Ausschnitt.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
