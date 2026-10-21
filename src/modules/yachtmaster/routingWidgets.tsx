import { useMemo, useState } from 'react'
import { POLAR_TWA, bestDownwind, bestUpwind, boatSpeed, formatBearing, formatNumber, fromPolar, legPlan, passageDuration, type HourlyWind } from '@/calculations'
import { formatDuration } from '@/calculations/dst'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

const f1 = (n: number) => formatNumber(n, 1)

function Slide({ label, value, min, max, step, v, on }: { label: string; value: string; min: number; max: number; step: number; v: number; on: (n: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <Slider value={[v]} min={min} max={max} step={step} onValueChange={([n]) => on(n)} aria-label={label} />
    </div>
  )
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', highlight ? 'border-primary bg-primary/10' : 'bg-muted/50')}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ Polardiagramm */

export function PolarWidget() {
  const [tws, setTws] = useState(12)
  const up = bestUpwind(tws)
  const down = bestDownwind(tws)
  const R = 120
  const scale = R / 9
  const cx = 34
  const cy = 140
  // Wind von oben; rechte Hälfte = Steuerbordbug-Darstellung
  const pt = (twa: number, speed: number) => ({ x: cx + speed * scale * Math.sin((twa * Math.PI) / 180), y: cy - speed * scale * Math.cos((twa * Math.PI) / 180) })
  const curve = Array.from({ length: 141 }, (_, i) => 40 + i).map((a) => pt(a, boatSpeed(a, tws)))
  const pUp = pt(up.twa, up.speed)
  const pDown = pt(down.twa, down.speed)
  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <svg viewBox="0 0 170 280" className="mx-auto h-auto w-full max-w-64 rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label={`Polardiagramm bei ${tws} kn Wind`}>
        {[3, 6, 9].map((s) => (
          <g key={s}>
            <path d={`M ${cx} ${cy - s * scale} A ${s * scale} ${s * scale} 0 0 1 ${cx} ${cy + s * scale}`} fill="none" stroke="currentColor" strokeOpacity={0.15} />
            <text x={cx - 26} y={cy - s * scale + 3} fontSize={7} fill="currentColor" fillOpacity={0.6}>{s} kn</text>
          </g>
        ))}
        <path d={`M ${cx} ${cy} L ${pt(40, 9).x} ${pt(40, 9).y}`} stroke="#e11d48" strokeOpacity={0.4} strokeDasharray="3 2" />
        <text x={cx + 70} y={12} fontSize={8} fill="currentColor">Wind von oben ↓</text>
        <polyline points={curve.map((p) => `${p.x},${p.y}`).join(' ')} fill="none" stroke="#2dd4bf" strokeWidth={2} />
        <line x1={cx} y1={cy} x2={pUp.x} y2={pUp.y} stroke="#f97316" strokeWidth={1.5} />
        <line x1={cx} y1={cy} x2={pDown.x} y2={pDown.y} stroke="#6366f1" strokeWidth={1.5} />
        <circle cx={pUp.x} cy={pUp.y} r={3} fill="#f97316" />
        <circle cx={pDown.x} cy={pDown.y} r={3} fill="#6366f1" />
        <text x={cx + 40} y={cy - R + 20} fontSize={7} fill="#e11d48">No-go &lt; {POLAR_TWA[0]}°</text>
      </svg>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Das Polardiagramm zeigt, wie schnell die (fiktive) 10-m-Yacht bei jedem Windwinkel segelt. Gegen den Wind zählt nicht die höchste Fahrt, sondern die beste Annäherung an den Wind (VMG) – deshalb gibt es einen optimalen Am-Wind- und Vorwind-Winkel.
        </p>
        <Slide label="Windgeschwindigkeit (TWS)" value={`${tws} kn`} min={4} max={22} step={1} v={tws} on={setTws} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Cell label="Bester Am-Wind-Winkel" value={`${f1(up.twa)}°`} highlight />
          <Cell label="VMG gegen den Wind" value={`${f1(up.vmg)} kn`} />
          <Cell label="Bester Vorwind-Winkel" value={`${f1(down.twa)}°`} highlight />
          <Cell label="VMG vor dem Wind" value={`${f1(down.vmg)} kn`} />
        </div>
        <p className="text-xs text-muted-foreground">Halbwind (90°): {f1(boatSpeed(90, tws))} kn. Platt vor dem Wind (180°) ist die Yacht langsamer als mit etwas Raumwind – Halsen kann schneller sein.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Kreuzen oder direkt? */

export function TackingWidget() {
  const [windFrom, setWindFrom] = useState(20)
  const [tws, setTws] = useState(12)
  const dist = 20
  const plan = legPlan(0, windFrom, tws, dist)
  const S = 6 // px pro NM
  const ox = 130
  const oy = 160
  const pts = [{ x: 0, y: 0 }]
  for (const l of plan.legs) {
    const v = fromPolar(l.distance, l.heading)
    const last = pts[pts.length - 1]
    pts.push({ x: last.x + v.x, y: last.y + v.y })
  }
  const windVec = fromPolar(18, windFrom)
  return (
    <div className="grid gap-4 md:grid-cols-[260px_1fr]">
      <svg viewBox="0 0 260 190" className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Skizze: Start, Ziel 20 NM nördlich und gesegelte Schläge">
        <line x1={ox} y1={oy} x2={ox} y2={oy - dist * S} stroke="currentColor" strokeOpacity={0.4} strokeDasharray="4 3" />
        <polyline points={pts.map((p) => `${ox + p.x * S},${oy - p.y * S}`).join(' ')} fill="none" stroke="#e11d48" strokeWidth={2} />
        <circle cx={ox} cy={oy} r={4} fill="currentColor" />
        <circle cx={ox} cy={oy - dist * S} r={5} fill="#f97316" />
        <text x={ox + 8} y={oy - dist * S + 4} fontSize={10} fill="currentColor">Ziel (000°, 20 NM)</text>
        <text x={ox + 8} y={oy + 4} fontSize={10} fill="currentColor">Start</text>
        <line x1={30 + windVec.x} y1={40 - windVec.y} x2={30} y2={40} stroke="#2563eb" strokeWidth={2} markerEnd="url(#windArrow)" />
        <defs>
          <marker id="windArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>
        <text x={8} y={70} fontSize={9} fill="#2563eb">Wind aus {formatBearing(windFrom, 0)}</text>
      </svg>
      <div className="space-y-4">
        <Slide label="Wind aus" value={formatBearing(windFrom, 0)} min={0} max={359} step={5} v={windFrom} on={setWindFrom} />
        <Slide label="Windgeschwindigkeit" value={`${tws} kn`} min={4} max={22} step={1} v={tws} on={setTws} />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Cell label="Windwinkel zum Ziel" value={`${f1(plan.directTwa)}°`} />
          <Cell label="Art" value={plan.mode === 'direct' ? 'direkt' : plan.mode === 'beat' ? 'kreuzen' : plan.mode === 'run' ? 'halsen' : '—'} highlight />
          <Cell label="Gesegelte Strecke" value={`${f1(plan.sailed)} NM`} />
          <Cell label="Zeitbedarf" value={Number.isFinite(plan.hours) ? formatDuration(plan.hours) : '—'} highlight />
        </div>
        <ul className="text-sm text-muted-foreground">
          {plan.legs.map((l, i) => (
            <li key={i}>
              Schlag {i + 1}: Kurs {formatBearing(l.heading, 0)}, {f1(l.distance)} NM
            </li>
          ))}
        </ul>
        <p className="text-xs text-muted-foreground">Vereinfacht: kein Strom und keine Abdrift; Wendezeiten und Zahl der Schläge vernachlässigt. In der Praxis kreuzt man in mehreren kürzeren Schlägen nahe der Kurslinie, um auf Winddreher reagieren zu können.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Abfahrtszeit wählen */

/** Fiktive Vorhersage: Tief zieht durch – erst Gegenwind, dann Winddreher nach West und Zunahme */
export const ROUTING_FORECAST: HourlyWind[] = [
  ...Array.from({ length: 6 }, () => ({ windFrom: 40, tws: 10 })),
  { windFrom: 10, tws: 12 },
  { windFrom: 340, tws: 14 },
  { windFrom: 310, tws: 16 },
  ...Array.from({ length: 9 }, () => ({ windFrom: 290, tws: 17 })),
  ...Array.from({ length: 6 }, () => ({ windFrom: 280, tws: 23 })),
]

export function DepartureWidget() {
  const bearing = 45
  const distance = 30
  const [selected, setSelected] = useState(0)
  const options = useMemo(
    () => Array.from({ length: 13 }, (_, h) => ({ hour: h, duration: passageDuration(ROUTING_FORECAST, bearing, distance, h) })),
    [],
  )
  const valid = options.filter((o) => o.duration !== null) as { hour: number; duration: number }[]
  const best = valid.reduce((a, b) => (b.duration < a.duration ? b : a), valid[0])
  const max = Math.max(...valid.map((o) => o.duration))
  const sel = options[selected]
  const arrival = sel.duration === null ? null : sel.hour + sel.duration
  const windAt = (h: number) => ROUTING_FORECAST[Math.min(ROUTING_FORECAST.length - 1, Math.floor(h))]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        30 NM nach 045°. Die (fiktive) Vorhersage: sechs Stunden Wind aus 040° mit 10 kn – genau auf die Nase –, dann dreht er mit einem durchziehenden Tief über Nord nach West und nimmt zu; ab Stunde 18 weht es mit 23 kn. Wann legst du ab?
      </p>
      <div className="space-y-1" role="list" aria-label="Fahrtdauer je Abfahrtsstunde">
        {options.map((o) => (
          <button
            key={o.hour}
            type="button"
            role="listitem"
            onClick={() => setSelected(o.hour)}
            aria-pressed={selected === o.hour}
            className={cn('flex w-full items-center gap-2 rounded px-1 py-0.5 text-left text-xs', selected === o.hour ? 'bg-accent' : 'hover:bg-muted')}
          >
            <span className="w-16 shrink-0 font-mono">+{o.hour} h</span>
            <span className="h-3 flex-1 overflow-hidden rounded bg-muted">
              {o.duration !== null && <span className={cn('block h-full rounded', o.hour === best.hour ? 'bg-success' : 'bg-primary/70')} style={{ width: `${(o.duration / max) * 100}%` }} />}
            </span>
            <span className="w-20 shrink-0 text-right font-mono tabular-nums">{o.duration === null ? '—' : formatDuration(o.duration)}</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Cell label="Abfahrt" value={`+${sel.hour} h`} />
        <Cell label="Wind bei Abfahrt" value={`${formatBearing(windAt(sel.hour).windFrom, 0)} / ${windAt(sel.hour).tws} kn`} />
        <Cell label="Fahrtdauer" value={sel.duration === null ? '—' : formatDuration(sel.duration)} highlight />
        <Cell label="Ankunft" value={arrival === null ? '—' : `+${f1(arrival)} h`} />
      </div>
      <p className={cn('rounded-lg border p-3 text-sm', sel.hour === best.hour ? 'border-success/50 bg-success/5' : 'bg-muted/40')}>
        Kürzeste Fahrt bei Abfahrt +{best.hour} h ({formatDuration(best.duration)}): Dann ist der Winddreher da, und der Kurs 045° wird ein Halbwind- bzw. Raumschotskurs.
        {arrival !== null && windAt(arrival).tws >= 20 && ' Achtung: Bei dieser Abfahrt kommst du erst im Starkwind an – Ankunft vor Stunde 18 ist entspannter.'}
        {' '}Die kürzeste Fahrt ist nicht automatisch die beste – Seegang, Crew und Tageslicht gehören in die Entscheidung.
      </p>
      <p className="text-xs text-muted-foreground">Effektive Fahrt je Stunde aus dem Polardiagramm (direkt, kreuzend oder halsend), Strom unberücksichtigt.</p>
    </div>
  )
}
