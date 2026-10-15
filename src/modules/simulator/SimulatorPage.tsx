import { useMemo, useState } from 'react'
import { ChevronDown, Pause, Play, RotateCcw, SkipBack } from 'lucide-react'
import { angleDifference, formatBearing, formatNumber, simulate } from '@/calculations'
import { NumberSlider } from '@/components/NumberSlider'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { PageHeader } from '@/components/layout/PageHeader'
import { SIM_DEFAULTS, useSimulatorStore } from '@/stores/simulatorStore'
import { cn } from '@/lib/utils'
import type { SimulationInput } from '@/types/navigation'
import { CompassDial } from './CompassDial'
import { TrackPlot } from './TrackPlot'
import { BASE_MIN_PER_SEC, useSimulationClock } from './useSimulationClock'

const PRESETS: { label: string; input: SimulationInput; note: string }[] = [
  { label: 'Referenzbeispiel', input: SIM_DEFAULTS, note: 'HDG 000°, 5 kn, Strom 090° 2 kn → COG ≈ 021,8°, SOG ≈ 5,39 kn' },
  { label: 'Keine Strömung', input: { ...SIM_DEFAULTS, tideRate: 0 }, note: 'Ohne Strom und Leeway: COG = HDG, SOG = STW' },
  { label: 'Strom voraus (mitlaufend)', input: { ...SIM_DEFAULTS, tideDirection: 0 }, note: 'Strom setzt in Fahrtrichtung: SOG = STW + Rate' },
  { label: 'Gegenstrom', input: { ...SIM_DEFAULTS, tideDirection: 180 }, note: 'Strom von vorn: SOG = STW − Rate' },
  { label: 'Starker Gegenstrom', input: { ...SIM_DEFAULTS, stw: 2, tideDirection: 180, tideRate: 3 }, note: 'Strom stärker als STW: Boot treibt rückwärts über Grund' },
  { label: 'Stillstand über Grund', input: { ...SIM_DEFAULTS, stw: 3, tideDirection: 180, tideRate: 3 }, note: 'SOG = 0 – COG ist nicht definiert' },
  { label: 'Windabdrift', input: { ...SIM_DEFAULTS, heading: 90, tideRate: 0, leeway: 10 }, note: 'Leeway +10°: Water Track liegt 10° nach Steuerbord' },
  { label: 'Über 000°', input: { ...SIM_DEFAULTS, heading: 355, tideDirection: 270, tideRate: 1.5, leeway: 8 }, note: 'Kursnormierung: 355° + 8° = 003°' },
]

const LEGEND = [
  { label: 'Heading (HDG)', color: 'bg-vec-heading', mark: '– –' },
  { label: 'Water Track', color: 'bg-vec-water', mark: '>' },
  { label: 'Tidal Stream', color: 'bg-vec-tide', mark: '>>>' },
  { label: 'Ground Track / COG', color: 'bg-vec-ground', mark: '>>' },
  { label: 'Leeway-Winkel', color: 'bg-vec-leeway', mark: '◠' },
]

export function SimulatorPage() {
  const { input, setValue, setInput, reset } = useSimulatorStore()
  const result = useMemo(() => simulate(input), [input])
  const clock = useSimulationClock(input.durationMin)
  const [showSteps, setShowSteps] = useState(false)
  const driftAngle = result.cog === null ? null : angleDifference(input.heading, result.cog)
  const activePreset = PRESETS.find((p) => (Object.keys(p.input) as (keyof SimulationInput)[]).every((k) => p.input[k] === input[k]))

  return (
    <div className="space-y-6">
      <PageHeader
        title="Navigationssimulator"
        subtitle="Geschwindigkeitsdreieck interaktiv: Heading, Leeway und Strom ergeben Kurs und Fahrt über Grund."
      />

      <div className="flex flex-wrap gap-2" role="group" aria-label="Szenarien">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            size="sm"
            variant={activePreset?.label === p.label ? 'default' : 'outline'}
            onClick={() => {
              setInput(p.input)
              clock.seek(p.input.durationMin)
            }}
            title={p.note}
          >
            {p.label}
          </Button>
        ))}
      </div>
      {activePreset && <p className="-mt-3 text-sm text-muted-foreground">{activePreset.note}</p>}

      <div className="grid gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        {/* Eingaben */}
        <Card className="order-2 xl:order-1">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Eingaben</CardTitle>
              <CardDescription>Werte per Regler oder Tastatur</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={reset} aria-label="Eingaben zurücksetzen">
              <RotateCcw /> Zurücksetzen
            </Button>
          </CardHeader>
          <CardContent className="space-y-5">
            <NumberSlider label="Heading" sublabel="Steuerkurs, ° rechtweisend" value={input.heading} min={0} max={359} step={1} unit="°" wrap colorClass="bg-vec-heading" formatValue={(v) => String(Math.round(v)).padStart(3, '0')} onChange={(v) => setValue('heading', v)} />
            <NumberSlider label="Speed Through Water" sublabel="STW, Fahrt durchs Wasser" value={input.stw} min={0} max={15} step={0.1} decimals={1} unit="kn" colorClass="bg-vec-water" onChange={(v) => setValue('stw', v)} />
            <NumberSlider label="Tidal Stream Direction" sublabel="Set – Richtung, in die der Strom setzt" value={input.tideDirection} min={0} max={359} step={1} unit="°" wrap colorClass="bg-vec-tide" formatValue={(v) => String(Math.round(v)).padStart(3, '0')} onChange={(v) => setValue('tideDirection', v)} />
            <NumberSlider label="Tidal Stream Rate" sublabel="Stromstärke" value={input.tideRate} min={0} max={6} step={0.1} decimals={1} unit="kn" colorClass="bg-vec-tide" onChange={(v) => setValue('tideRate', v)} />
            <NumberSlider label="Leeway" sublabel="+ = nach Steuerbord, − = nach Backbord" value={input.leeway} min={-15} max={15} step={1} unit="°" colorClass="bg-vec-leeway" formatValue={(v) => (v > 0 ? `+${v}` : String(v))} onChange={(v) => setValue('leeway', v)} />
            <NumberSlider label="Simulationsdauer" value={input.durationMin} min={0} max={120} step={1} unit="min" onChange={(v) => setValue('durationMin', v)} />
          </CardContent>
        </Card>

        {/* Visualisierung */}
        <div className="order-1 space-y-4 xl:order-2">
          <Card className="overflow-hidden">
            <TrackPlot input={input} result={result} elapsed={clock.elapsed} />
            <div className="space-y-3 border-t p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Button onClick={clock.toggle} disabled={input.durationMin === 0} aria-label={clock.playing ? 'Pause' : 'Abspielen'}>
                  {clock.playing ? <Pause /> : <Play />}
                  {clock.playing ? 'Pause' : 'Play'}
                </Button>
                <Button variant="outline" onClick={clock.reset} aria-label="Zum Start">
                  <SkipBack /> Start
                </Button>
                <div className="ml-auto flex items-center gap-1" role="group" aria-label="Wiedergabegeschwindigkeit">
                  <span className="mr-1 text-xs text-muted-foreground">Zeitraffer</span>
                  {[0.5, 1, 2, 4].map((s) => (
                    <Button key={s} size="sm" variant={clock.speed === s ? 'secondary' : 'ghost'} onClick={() => clock.setSpeed(s)}>
                      {s}×
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-14 text-xs tabular-nums text-muted-foreground">{Math.round(clock.elapsed)} min</span>
                <Slider
                  value={[clock.elapsed]}
                  min={0}
                  max={Math.max(1, input.durationMin)}
                  step={1}
                  disabled={input.durationMin === 0}
                  onValueChange={([v]) => clock.seek(v)}
                  aria-label="Zeitpunkt der Simulation"
                />
                <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">{input.durationMin} min</span>
              </div>
              <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {LEGEND.map((l) => (
                  <li key={l.label} className="flex items-center gap-1.5">
                    <span className={cn('inline-block h-1 w-5 rounded-full', l.color)} />
                    {l.label} <span className="font-mono">{l.mark}</span>
                  </li>
                ))}
                <li>1 h = {formatNumber(BASE_REAL_SECONDS / clock.speed, 0)} s Animation</li>
              </ul>
            </div>
          </Card>

        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Ergebnisse</CardTitle>
            <CardDescription>Berechnet aus dem Vektordreieck</CardDescription>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Result label="Water Track" value={formatBearing(result.waterTrack)} color="text-vec-water" />
              <Result label="COG" value={formatBearing(result.cog)} color="text-vec-ground" hint={result.cog === null ? 'nicht definiert' : undefined} />
              <Result label="SOG" value={`${formatNumber(result.sog, 2)} kn`} color="text-vec-ground" />
              <Result label="Leeway" value={`${input.leeway > 0 ? '+' : ''}${input.leeway}°`} color="text-vec-leeway" />
              <Result label="HDG → COG" value={driftAngle === null ? '–' : `${driftAngle > 0 ? '+' : ''}${formatNumber(driftAngle, 1)}°`} hint="Gesamtversatz" />
              <Result label="Drift (Strom)" value={`${formatNumber(result.tideDrift, 2)} NM`} color="text-vec-tide" />
              <Result label="Distanz durchs Wasser" value={`${formatNumber(result.distanceThroughWater, 2)} NM`} />
              <Result label="Distanz über Grund" value={`${formatNumber(result.distanceOverGround, 2)} NM`} />
              <Result label="Dauer" value={`${input.durationMin} min`} />
            </dl>
            {result.cog === null && (
              <p className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                SOG = 0: Das Boot steht über Grund still. Ein Nullvektor hat keine Richtung – deshalb wird kein COG angezeigt.
              </p>
            )}
            <Button variant="ghost" size="sm" className="mt-4 -ml-2" onClick={() => setShowSteps((s) => !s)} aria-expanded={showSteps}>
              <ChevronDown className={cn('transition-transform', showSteps && 'rotate-180')} />
              Rechenweg {showSteps ? 'ausblenden' : 'anzeigen'}
            </Button>
            {showSteps && <CalculationSteps input={input} result={result} />}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Richtungen</CardTitle>
          </CardHeader>
          <CardContent>
            <CompassDial
              heading={input.heading}
              waterTrack={result.waterTrack}
              cog={result.cog}
              tideDirection={input.tideDirection}
              showTide={input.tideRate > 0}
            />
            <div className="mt-2 flex flex-wrap justify-center gap-1.5">
              <Badge variant="outline">HDG {formatBearing(input.heading, 0)}</Badge>
              <Badge variant="outline">Set {formatBearing(input.tideDirection, 0)}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/** Sekunden Echtzeit für 60 Simulationsminuten bei 1× */
const BASE_REAL_SECONDS = 60 / BASE_MIN_PER_SEC

function Result({ label, value, color, hint }: { label: string; value: string; color?: string; hint?: string }) {
  return (
    <div className="rounded-lg bg-muted/60 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={cn('font-mono text-lg font-semibold tabular-nums', color)}>{value}</dd>
      {hint && <dd className="text-[11px] text-muted-foreground">{hint}</dd>}
    </div>
  )
}

function CalculationSteps({ input, result }: { input: SimulationInput; result: ReturnType<typeof simulate> }) {
  const f = (n: number) => formatNumber(n, 3)
  return (
    <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-relaxed">
      <li>
        Water Track = Heading + Leeway = {input.heading}° {input.leeway >= 0 ? '+' : '−'} {Math.abs(input.leeway)}° ={' '}
        <b>{formatBearing(result.waterTrack)}</b>
      </li>
      <li>
        Fahrt durchs Wasser: x = {formatNumber(input.stw, 1)} · sin({formatNumber(result.waterTrack, 1)}°) = {f(result.waterVelocity.x)}; y ={' '}
        {formatNumber(input.stw, 1)} · cos({formatNumber(result.waterTrack, 1)}°) = {f(result.waterVelocity.y)}
      </li>
      <li>
        Strom: x = {formatNumber(input.tideRate, 1)} · sin({input.tideDirection}°) = {f(result.tideVelocity.x)}; y ={' '}
        {formatNumber(input.tideRate, 1)} · cos({input.tideDirection}°) = {f(result.tideVelocity.y)}
      </li>
      <li>
        Über Grund: x = {f(result.groundVelocity.x)}, y = {f(result.groundVelocity.y)}
      </li>
      <li>
        SOG = √(x² + y²) = <b>{formatNumber(result.sog, 3)} kn</b>
      </li>
      <li>
        COG = atan2(x, y), normiert auf 0–360° ={' '}
        <b>{result.cog === null ? 'nicht definiert (SOG = 0)' : formatBearing(result.cog)}</b>
      </li>
      <li>
        Distanz über Grund = SOG × Zeit = {formatNumber(result.sog, 2)} kn × {formatNumber(result.durationHours, 3)} h ={' '}
        <b>{formatNumber(result.distanceOverGround, 2)} NM</b>
      </li>
    </ol>
  )
}
