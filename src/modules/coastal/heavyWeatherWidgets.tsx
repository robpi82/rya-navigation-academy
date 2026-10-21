import { useState } from 'react'
import { REEF_LABEL, apparentWind, formatNumber, reefStage, windForceRatio } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { HEAVY_WEATHER_STEPS } from '@/data/heavyWeather'
import { cn } from '@/lib/utils'
import { OrderExercise } from '@/modules/daylessons/safetyWidgets'

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

/* ------------------------------------------------------------------ Scheinbarer Wind */

export function ApparentWindWidget() {
  const [tws, setTws] = useState(18)
  const [twa, setTwa] = useState(50)
  const [bs, setBs] = useState(6)
  const aw = apparentWind(tws, twa, bs)
  const stage = reefStage(aw.speed)
  // Skizze: Boot zeigt nach oben; Windpfeile zeigen, wohin der Wind weht (Steuerbordbug: Wind von rechts)
  const W = 260
  const H = 240
  const cx = 130
  const cy = 130
  const k = 150 / Math.max(10, tws + bs)
  const rad = (d: number) => (d * Math.PI) / 180
  const trueVec = { x: -tws * Math.sin(rad(twa)) * k, y: tws * Math.cos(rad(twa)) * k } // weht zum Boot hin (nach unten-links)
  const headVec = { x: 0, y: bs * k }
  const appVec = { x: trueVec.x + headVec.x, y: trueVec.y + headVec.y }
  // Vektordreieck: A → B wahrer Wind, B → C Fahrtwind, A → C scheinbarer Wind; mittig in der Skizze
  const A = { x: cx - appVec.x / 2, y: cy - appVec.y / 2 }
  const B = { x: A.x + trueVec.x, y: A.y + trueVec.y }
  const Cp = { x: A.x + appVec.x, y: A.y + appVec.y }
  const arrow = (from: { x: number; y: number }, to: { x: number; y: number }, color: string, id: string) => (
    <g key={id}>
      <defs>
        <marker id={id} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      </defs>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={color} strokeWidth={2.5} markerEnd={`url(#${id})`} />
    </g>
  )
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          An Bord spürt man den scheinbaren Wind: den wahren Wind plus den Fahrtwind des Bootes. Am Wind ist er stärker als der wahre Wind, raumschots schwächer. Wer vor dem Wind segelt und anluven muss, erlebt deshalb plötzlich viel mehr Wind – und Reffentscheidungen richten sich nach dem scheinbaren Wind.
        </p>
        <Slide label="Wahrer Wind" value={`${tws} kn`} min={5} max={40} step={1} v={tws} on={setTws} />
        <Slide label="Wahrer Windwinkel zum Bug" value={`${twa}°`} min={30} max={180} step={5} v={twa} on={setTwa} />
        <Slide label="Fahrt durchs Wasser" value={`${bs} kn`} min={0} max={9} step={0.5} v={bs} on={setBs} />
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-primary bg-primary/10 px-3 py-2"><div className="text-[11px] text-muted-foreground">Scheinbarer Wind</div><div className="font-mono font-semibold">{f1(aw.speed)} kn</div></div>
          <div className="rounded-lg border bg-muted/50 px-3 py-2"><div className="text-[11px] text-muted-foreground">Scheinbarer Winkel</div><div className="font-mono font-semibold">{Math.round(aw.angle)}°</div></div>
          <div className={cn('rounded-lg border px-3 py-2', stage === 'storm' ? 'border-destructive bg-destructive/10' : stage === 'none' ? 'bg-muted/50' : 'border-amber-500 bg-amber-500/10')}><div className="text-[11px] text-muted-foreground">Besegelung (Richtwert)</div><div className="text-sm font-semibold">{REEF_LABEL[stage]}</div></div>
        </div>
        <p className="text-xs text-muted-foreground">Reffstufen als Richtwerte für eine typische Fahrtenyacht – jedes Boot ist anders; früh reffen ist fast nie falsch.</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Vektordiagramm: wahrer Wind, Fahrtwind und scheinbarer Wind am Boot">
        <path d="M 30 18 C 36 26 35 40 33 46 L 27 46 C 25 40 24 26 30 18 Z" fill="#f8fafc" stroke="#0f172a" />
        <text x={40} y={34} fontSize={9} fill="currentColor" fillOpacity={0.7}>Boot fährt nach oben</text>
        {arrow(A, B, '#2563eb', 'aw-true')}
        {arrow(B, Cp, '#64748b', 'aw-head')}
        {arrow(A, Cp, '#e11d48', 'aw-app')}
        <text x={8} y={H - 34} fontSize={10} fill="#2563eb">wahrer Wind</text>
        <text x={8} y={H - 21} fontSize={10} fill="#64748b">Fahrtwind</text>
        <text x={8} y={H - 8} fontSize={10} fill="#e11d48">scheinbarer Wind</text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Winddruck */

export function WindForceWidget() {
  const [base, setBase] = useState(12)
  const speeds = [10, 15, 20, 25, 30, 35, 40]
  const max = windForceRatio(base, 40)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Der Winddruck auf Segel und Rigg wächst mit dem Quadrat der Windgeschwindigkeit: doppelte Windgeschwindigkeit, vierfacher Druck. Von 15 auf 25 kn steigt die Belastung fast auf das Dreifache.</p>
      <Slide label="Bezugswind (Druck = 1)" value={`${base} kn`} min={8} max={20} step={1} v={base} on={setBase} />
      <div className="space-y-1.5" role="img" aria-label="Balkendiagramm: Winddruck relativ zum Bezugswind">
        {speeds.map((s) => {
          const r = windForceRatio(base, s)
          return (
            <div key={s} className="flex items-center gap-2 text-xs">
              <span className="w-12 font-mono">{s} kn</span>
              <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
                <div className={cn('h-full rounded', r >= 4 ? 'bg-destructive' : r >= 2 ? 'bg-amber-500' : 'bg-primary')} style={{ width: `${Math.min(100, (r / max) * 100)}%` }} />
              </div>
              <span className="w-14 text-right font-mono tabular-nums">× {f1(r)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export function HeavyWeatherPrepWidget() {
  return <OrderExercise steps={HEAVY_WEATHER_STEPS} intro="Für die Nacht ist Starkwind angesagt. Bringe die Vorbereitungen in eine sinnvolle Reihenfolge – das meiste erledigt man, solange es noch ruhig ist." />
}
