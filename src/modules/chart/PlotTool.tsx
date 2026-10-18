import { useMemo, useState } from 'react'
import { Crosshair, Flag, Hand, MapPin, Ruler, Trash2, TriangleRight } from 'lucide-react'
import {
  angleDifference,
  formatBearing,
  formatDuration,
  formatNumber,
  planPassage,
  pointInPolygon,
  rhumbDestination,
  rhumbLine,
  type HourlyTide,
} from '@/calculations'
import { hourLabel, LAND, MARKS, TIDAL_DIAMONDS } from '@/data/chartArea'
import { diamondById, tideAtDiamond } from '@/lib/chartTides'
import type { LatLon } from '@/types/navigation'
import { formatLat, formatLon, SeaChart, type ChartOverlay } from '@/components/chart/SeaChart'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { NumberField, Toggle, fieldsValid, useNumberField } from '@/modules/calculators/fields'
import { TideTable } from './TideTable'

type Tool = 'pan' | 'start' | 'target' | 'measure' | 'angle' | 'mark'

const TOOLS: { id: Tool; label: string; icon: typeof Hand; hint: string }[] = [
  { id: 'pan', label: 'Verschieben', icon: Hand, hint: 'Karte ziehen, Mausrad/Pinch zum Zoomen' },
  { id: 'start', label: 'Start', icon: MapPin, hint: 'Klick setzt den Startpunkt' },
  { id: 'target', label: 'Ziel', icon: Flag, hint: 'Klick setzt den Zielpunkt' },
  { id: 'measure', label: 'Messen', icon: Ruler, hint: 'Zwei Klicks: Kurs und Distanz' },
  { id: 'angle', label: 'Winkel', icon: TriangleRight, hint: 'Scheitel, dann zwei Schenkelpunkte' },
  { id: 'mark', label: 'Position', icon: Crosshair, hint: 'Klick markiert eine Position' },
]

/** Klicks in der Nähe eines Seezeichens (≤ 0,25 NM) rasten auf dessen Position ein. */
export function snapToMark(pos: LatLon): { pos: LatLon; name?: string } {
  let best: { pos: LatLon; name?: string; d: number } = { pos, d: 0.25 }
  for (const m of MARKS) {
    const d = rhumbLine(pos, m.pos).distance
    if (d < best.d) best = { pos: m.pos, name: m.name, d }
  }
  return { pos: best.pos, name: best.name }
}

const COLORS = { ground: 'var(--vec-ground)', water: 'var(--vec-water)', tide: 'var(--vec-tide)', measure: 'var(--vec-heading)', mark: 'var(--destructive)' }

export function PlotTool() {
  const [tool, setTool] = useState<Tool>('start')
  const [start, setStart] = useState<{ pos: LatLon; name?: string } | null>(null)
  const [target, setTarget] = useState<{ pos: LatLon; name?: string } | null>(null)
  const [measure, setMeasure] = useState<LatLon[]>([])
  const [angle, setAngle] = useState<LatLon[]>([])
  const [marks, setMarks] = useState<LatLon[]>([])

  const [tideMode, setTideMode] = useState<'none' | 'manual' | 'diamond'>('diamond')
  const stw = useNumberField('5', { min: 0.1, max: 30 })
  const leeway = useNumberField('0', { min: -30, max: 30 })
  const set = useNumberField('90', { min: 0, max: 360, bearing: true })
  const rate = useNumberField('1.5', { min: 0, max: 10 })
  const range = useNumberField('3.0', { min: 0.5, max: 8 })
  const [diamond, setDiamond] = useState<'A' | 'B' | 'C'>('C')
  const [startHour, setStartHour] = useState(-2)

  const onClick = (raw: LatLon) => {
    const snapped = snapToMark(raw)
    switch (tool) {
      case 'start':
        setStart(snapped)
        setTool('target')
        break
      case 'target':
        setTarget(snapped)
        break
      case 'measure':
        setMeasure((m) => (m.length >= 2 ? [snapped.pos] : [...m, snapped.pos]))
        break
      case 'angle':
        setAngle((a) => (a.length >= 3 ? [snapped.pos] : [...a, snapped.pos]))
        break
      case 'mark':
        setMarks((m) => [...m, raw])
        break
    }
  }

  const leg = start && target ? rhumbLine(start.pos, target.pos) : null

  const tides: HourlyTide[] | null = useMemo(() => {
    if (tideMode === 'none') return Array.from({ length: 24 }, () => ({ set: 0, rate: 0 }))
    if (tideMode === 'manual') return set.value !== null && rate.value !== null ? Array.from({ length: 24 }, () => ({ set: set.value!, rate: rate.value! })) : null
    if (range.value === null) return null
    const d = diamondById(diamond)
    const list: HourlyTide[] = []
    for (let h = startHour; h <= 6; h++) list.push(tideAtDiamond(d, h, range.value))
    return list
  }, [tideMode, set.value, rate.value, range.value, diamond, startHour])

  const inputsValid = fieldsValid(stw, leeway) && tides !== null
  const plan = leg && leg.bearing !== null && leg.distance > 0 && inputsValid ? planPassage({ desiredTrack: leg.bearing, distance: leg.distance, stw: stw.value!, leeway: leeway.value!, tides: tides! }) : null

  // Sicherheitsprüfung: führt die Kurslinie über Land oder eine Gefahr?
  const crossesLand =
    start && target
      ? LAND.find((l) =>
          Array.from({ length: 99 }, (_, i) => (i + 1) / 100).some((t) =>
            pointInPolygon({ lat: start.pos.lat + (target.pos.lat - start.pos.lat) * t, lon: start.pos.lon + (target.pos.lon - start.pos.lon) * t }, l.outline),
          ),
        )
      : undefined

  const overlays: ChartOverlay[] = []
  if (start) overlays.push({ kind: 'point', id: 'start', pos: start.pos, symbol: 'fix', label: 'Start', color: 'var(--foreground)' })
  if (target) overlays.push({ kind: 'point', id: 'target', pos: target.pos, symbol: 'wp', label: 'Ziel', color: 'var(--foreground)' })
  if (start && target && leg) {
    overlays.push({ kind: 'line', id: 'gt', from: start.pos, to: target.pos, color: COLORS.ground, chevrons: 2, label: `${formatBearing(leg.bearing, 0)} · ${formatNumber(leg.distance, 1)} NM` })
    if (plan?.feasible && (plan.tideTotal.x !== 0 || plan.tideTotal.y !== 0)) {
      const tEnd = rhumbDestination(start.pos, (Math.atan2(plan.tideTotal.x, plan.tideTotal.y) * 180) / Math.PI, Math.hypot(plan.tideTotal.x, plan.tideTotal.y))
      overlays.push({ kind: 'line', id: 'tide', from: start.pos, to: tEnd, color: COLORS.tide, chevrons: 3 })
      overlays.push({ kind: 'line', id: 'wt', from: tEnd, to: target.pos, color: COLORS.water, chevrons: 1, dashed: true })
    }
  }
  if (measure.length >= 1) overlays.push({ kind: 'point', id: 'm0', pos: measure[0], symbol: 'cross', color: COLORS.measure })
  if (measure.length === 2) {
    const r = rhumbLine(measure[0], measure[1])
    overlays.push({ kind: 'line', id: 'm', from: measure[0], to: measure[1], color: COLORS.measure, dashed: true, arrow: true, label: `${formatBearing(r.bearing, 0)} · ${formatNumber(r.distance, 2)} NM` })
  }
  angle.forEach((p, i) => overlays.push({ kind: 'point', id: `a${i}`, pos: p, symbol: 'cross', color: COLORS.measure }))
  if (angle.length >= 2) overlays.push({ kind: 'line', id: 'a1', from: angle[0], to: angle[1], color: COLORS.measure, width: 2 })
  if (angle.length === 3) overlays.push({ kind: 'line', id: 'a2', from: angle[0], to: angle[2], color: COLORS.measure, width: 2 })
  marks.forEach((p, i) => overlays.push({ kind: 'point', id: `pm${i}`, pos: p, symbol: 'cross', color: COLORS.mark, label: `P${i + 1}` }))

  const angleValue =
    angle.length === 3 ? Math.abs(angleDifference(rhumbLine(angle[0], angle[1]).bearing ?? 0, rhumbLine(angle[0], angle[2]).bearing ?? 0)) : null
  const measureResult = measure.length === 2 ? rhumbLine(measure[0], measure[1]) : null

  const clearAll = () => {
    setStart(null)
    setTarget(null)
    setMeasure([])
    setAngle([])
    setMarks([])
    setTool('start')
  }

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-1.5" role="toolbar" aria-label="Kartenwerkzeuge">
          {TOOLS.map((t) => (
            <Button key={t.id} size="sm" variant={tool === t.id ? 'default' : 'outline'} onClick={() => setTool(t.id)} aria-pressed={tool === t.id} title={t.hint}>
              <t.icon /> {t.label}
            </Button>
          ))}
          <Button size="sm" variant="ghost" onClick={clearAll} className="ml-auto">
            <Trash2 /> Alles löschen
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">{TOOLS.find((t) => t.id === tool)!.hint}. Klicks in der Nähe eines Seezeichens rasten dort ein.</p>
        <SeaChart overlays={overlays} onMapClick={tool === 'pan' ? undefined : onClick} cursor={tool === 'pan' ? 'grab' : 'crosshair'} />
        <div className="grid gap-3 sm:grid-cols-3">
          <ResultBox title="Messen" empty="Zwei Punkte anklicken">
            {measureResult && (
              <>
                <div className="font-mono text-lg font-semibold">{formatBearing(measureResult.bearing)}</div>
                <div className="text-sm">{formatNumber(measureResult.distance, 2)} NM</div>
                <div className="text-xs text-muted-foreground">Gegenkurs {formatBearing(measureResult.bearing === null ? null : (measureResult.bearing + 180) % 360)}</div>
              </>
            )}
          </ResultBox>
          <ResultBox title="Winkel" empty="Scheitel + zwei Punkte">
            {angleValue !== null && <div className="font-mono text-lg font-semibold">{formatNumber(angleValue, 1)}°</div>}
          </ResultBox>
          <ResultBox title="Positionen" empty="Werkzeug „Position“">
            {marks.length > 0 && (
              <ul className="max-h-24 space-y-0.5 overflow-y-auto font-mono text-xs">
                {marks.map((p, i) => (
                  <li key={i}>
                    P{i + 1}: {formatLat(p.lat, 2)} {formatLon(p.lon, 2)}
                  </li>
                ))}
              </ul>
            )}
          </ResultBox>
        </div>
      </div>

      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Kursplanung</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
              <dt className="text-muted-foreground">Start</dt>
              <dd className="font-mono text-xs">{start ? start.name ?? `${formatLat(start.pos.lat, 2)} ${formatLon(start.pos.lon, 2)}` : '– Werkzeug „Start“'}</dd>
              <dt className="text-muted-foreground">Ziel</dt>
              <dd className="font-mono text-xs">{target ? target.name ?? `${formatLat(target.pos.lat, 2)} ${formatLon(target.pos.lon, 2)}` : '– Werkzeug „Ziel“'}</dd>
              <dt className="text-muted-foreground">Ground Track</dt>
              <dd className="font-mono">{leg ? `${formatBearing(leg.bearing)} · ${formatNumber(leg.distance, 2)} NM` : '–'}</dd>
            </dl>
            <div className="grid grid-cols-2 gap-3">
              <NumberField label="STW" unit="kn" field={stw} />
              <NumberField label="Leeway" unit="°" field={leeway} />
            </div>
            <div className="space-y-2">
              <Toggle
                label="Strom"
                value={tideMode}
                onChange={setTideMode}
                options={[
                  { value: 'none', label: 'Kein Strom' },
                  { value: 'manual', label: 'Manuell' },
                  { value: 'diamond', label: 'Diamond' },
                ]}
              />
              {tideMode === 'manual' && (
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label="Set" unit="°" field={set} />
                  <NumberField label="Rate" unit="kn" field={rate} />
                </div>
              )}
              {tideMode === 'diamond' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {TIDAL_DIAMONDS.map((d) => (
                      <Button key={d.id} size="sm" variant={diamond === d.id ? 'default' : 'outline'} onClick={() => setDiamond(d.id)} aria-pressed={diamond === d.id}>
                        ◆ {d.id}
                      </Button>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="space-y-1 text-sm font-medium">
                      Abfahrt
                      <select value={startHour} onChange={(e) => setStartHour(Number(e.target.value))} className="h-10 w-full rounded-md border bg-background px-2 text-sm">
                        {Array.from({ length: 13 }, (_, i) => i - 6).map((h) => (
                          <option key={h} value={h}>
                            {hourLabel(h)}
                          </option>
                        ))}
                      </select>
                    </label>
                    <NumberField label="Tidenhub" unit="m" field={range} />
                  </div>
                </div>
              )}
            </div>
            {crossesLand && (
              <p className="rounded-lg border-2 border-warning bg-warning/10 p-3 text-sm" role="alert">
                <b>Achtung:</b> Die Kurslinie führt über „{crossesLand.name}“. Plane einen Zwischenwegpunkt.
              </p>
            )}
            {!leg ? (
              <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Setze Start und Ziel in der Karte.</p>
            ) : !inputsValid ? (
              <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Bitte gültige Werte eingeben.</p>
            ) : plan && !plan.feasible ? (
              <p className="rounded-lg border-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive" role="alert">
                <b>Kurs nicht haltbar.</b> {plan.message}
              </p>
            ) : plan?.feasible ? (
              <div className="grid grid-cols-2 gap-2">
                <Stat label="Course to Steer" value={formatBearing(plan.courseToSteer)} highlight />
                <Stat label="Fahrtzeit" value={formatDuration(plan.hours)} />
                <Stat label="Water Track" value={formatBearing(plan.waterTrack)} />
                <Stat label="Ø SOG" value={`${formatNumber(plan.sogMean, 2)} kn`} />
                <p className="col-span-2 text-xs text-muted-foreground">
                  In der Karte: Strom (&gt;&gt;&gt;) ab Start für die gesamte Fahrtzeit, von dort Water Track (&gt;) zum Ziel. Bei mehrstündigen Passagen werden die
                  stündlichen Stromvektoren addiert.
                </p>
              </div>
            ) : null}
          </CardContent>
        </Card>
        {tideMode === 'diamond' && range.value !== null && (
          <TideTable diamond={diamond} range={range.value} highlightFrom={startHour} highlightCount={plan?.feasible ? Math.ceil(plan.hours - 1e-9) : 1} />
        )}
      </div>
    </div>
  )
}

function ResultBox({ title, empty, children }: { title: string; empty: string; children?: React.ReactNode }) {
  const has = Array.isArray(children) ? children.some(Boolean) : !!children
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="text-xs font-semibold text-muted-foreground uppercase">{title}</div>
      {has ? children : <div className="text-sm text-muted-foreground">{empty}</div>}
    </div>
  )
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg p-2.5', highlight ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-muted/60')}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('font-mono font-semibold', highlight && 'text-primary')}>{value}</div>
    </div>
  )
}
