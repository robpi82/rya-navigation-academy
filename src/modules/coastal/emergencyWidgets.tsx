import { useState } from 'react'
import { driftToCoast, formatBearing, formatNumber, leakRate, minutesUntil } from '@/calculations'
import { formatDuration } from '@/calculations/dst'
import { Slider } from '@/components/ui/slider'
import { DISMASTING_STEPS } from '@/data/emergency'
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

/* ------------------------------------------------------------------ Drift auf die Leeküste */

export function DriftWidget() {
  const [windFrom, setWindFrom] = useState(270)
  const [wind, setWind] = useState(25)
  const [set, setSet] = useState(60)
  const [current, setCurrent] = useState(1)
  const [dist, setDist] = useState(4)
  const coastBearing = 90
  const r = driftToCoast(windFrom, wind, set, current, coastBearing, dist)
  const level = r.hours === null ? 'ok' : r.hours < 1 ? 'danger' : r.hours < 3 ? 'warn' : 'ok'
  // Skizze: Küste rechts (Osten), Boot links
  const W = 260
  const H = 200
  const scale = 150 / Math.max(dist, 1)
  const boat = { x: 230 - dist * scale, y: 100 }
  const dv = { x: r.drift.x * 30, y: -r.drift.y * 30 }
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Motor ausgefallen, Segel nicht zu gebrauchen: Wie lange bis zur Küste in Lee? Ohne Antrieb treibt eine Yacht grob mit 3–5 % der Windgeschwindigkeit nach Lee (hier 4 %), dazu kommt der Strom. Die Küste liegt östlich (090°).
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slide label="Wind aus" value={formatBearing(windFrom, 0)} min={0} max={355} step={5} v={windFrom} on={setWindFrom} />
          <Slide label="Windstärke" value={`${wind} kn`} min={5} max={45} step={1} v={wind} on={setWind} />
          <Slide label="Strom setzt nach" value={formatBearing(set, 0)} min={0} max={355} step={5} v={set} on={setSet} />
          <Slide label="Stromrate" value={`${f1(current)} kn`} min={0} max={3} step={0.25} v={current} on={setCurrent} />
          <Slide label="Abstand zur Küste" value={`${f1(dist)} NM`} min={0.5} max={10} step={0.5} v={dist} on={setDist} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg border bg-muted/50 px-3 py-2"><div className="text-[11px] text-muted-foreground">Drift über Grund</div><div className="font-mono font-semibold">{f1(r.speed)} kn</div></div>
          <div className="rounded-lg border bg-muted/50 px-3 py-2"><div className="text-[11px] text-muted-foreground">auf die Küste zu</div><div className="font-mono font-semibold">{f1(Math.max(0, r.towardCoast))} kn</div></div>
          <div className={cn('rounded-lg border px-3 py-2', level === 'danger' ? 'border-destructive bg-destructive/10' : level === 'warn' ? 'border-amber-500 bg-amber-500/10' : 'border-success bg-success/10')}><div className="text-[11px] text-muted-foreground">Zeit bis zur Küste</div><div className="font-mono font-semibold">{r.hours === null ? 'treibt nicht auf die Küste' : formatDuration(r.hours)}</div></div>
        </div>
        <p className={cn('rounded-lg border p-3 text-sm', level === 'danger' ? 'border-destructive/40 bg-destructive/5' : level === 'warn' ? 'border-amber-500/40 bg-amber-500/5' : 'border-success/40 bg-success/5')}>
          {level === 'danger'
            ? 'Weniger als eine Stunde: sofort Anker klar machen und ankern, sobald die Tiefe es zulässt; MAYDAY, wenn Strandung droht.'
            : level === 'warn'
              ? 'Ein bis drei Stunden: PAN-PAN absetzen, Hilfe anfordern, Anker vorbereiten, gleichzeitig versuchen, den Antrieb wiederherzustellen oder Segel zu setzen.'
              : 'Genug Zeit oder keine Drift auf die Küste: Lage melden (ggf. PAN-PAN), Fehler suchen, Seeraum halten.'}
        </p>
        <p className="text-xs text-muted-foreground">Richtwerte, kein Ersatz für eigenes Urteil. Die Windabdrift hängt stark von Boot, Seegang und Windangriffsfläche ab.</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Skizze: Boot, Küste im Osten und Driftvektor">
        <rect x={230} y={0} width={30} height={H} fill="var(--chart-land, #e7d8a8)" stroke="#a16207" />
        <text x={236} y={14} fontSize={9} fill="currentColor">Küste</text>
        <circle cx={boat.x} cy={boat.y} r={5} fill="#0f172a" />
        <defs>
          <marker id="driftArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#e11d48" />
          </marker>
        </defs>
        <line x1={boat.x} y1={boat.y} x2={boat.x + dv.x} y2={boat.y + dv.y} stroke="#e11d48" strokeWidth={2.5} markerEnd="url(#driftArrow)" />
        <text x={boat.x - 10} y={boat.y + 20} fontSize={9} fill="currentColor">Boot</text>
        <text x={8} y={H - 8} fontSize={9} fill="#e11d48">Drift (pro Stunde ×30 px)</text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Leck */

export function LeakWidget() {
  const [diameter, setDiameter] = useState(3)
  const [depth, setDepth] = useState(0.6)
  const [pumps, setPumps] = useState(1)
  const pumpLpm = pumps * 35
  const inflow = leakRate(diameter, depth)
  const critical = 400 // Liter bis zum kritischen Wasserstand (Bodenbretter) – Richtwert
  const mins = minutesUntil(critical, inflow, pumpLpm)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ein Leck unter der Wasserlinie (z. B. ein abgerissenes Seeventil) lässt erstaunlich viel Wasser ein: Die Menge wächst mit der Fläche des Lochs und der Wurzel der Tiefe. Eine Handlenzpumpe schafft grob 30–40 Liter pro Minute (hier 35 l/min je Pumpe). Erst abdichten, dann pumpen – Holzkeile an jedem Seeventil bereithalten.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slide label="Durchmesser des Lecks" value={`${f1(diameter)} cm`} min={0.5} max={8} step={0.5} v={diameter} on={setDiameter} />
        <Slide label="Tiefe unter der Wasserlinie" value={`${f1(depth)} m`} min={0.1} max={2} step={0.1} v={depth} on={setDepth} />
        <Slide label="Pumpen im Einsatz" value={`${pumps} × 35 l/min`} min={0} max={4} step={1} v={pumps} on={setPumps} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg border bg-muted/50 px-3 py-2"><div className="text-[11px] text-muted-foreground">Wassereinbruch</div><div className="font-mono font-semibold">{Math.round(inflow)} l/min</div></div>
        <div className="rounded-lg border bg-muted/50 px-3 py-2"><div className="text-[11px] text-muted-foreground">Pumpleistung</div><div className="font-mono font-semibold">{pumpLpm} l/min</div></div>
        <div className={cn('rounded-lg border px-3 py-2', mins === null ? 'border-success bg-success/10' : mins < 15 ? 'border-destructive bg-destructive/10' : 'border-amber-500 bg-amber-500/10')}><div className="text-[11px] text-muted-foreground">bis 400 l in der Bilge</div><div className="font-mono font-semibold">{mins === null ? 'Pumpen halten mit' : `${Math.round(mins)} min`}</div></div>
      </div>
      <p className="text-xs text-muted-foreground">Q = 0,6 · Fläche · √(2 g h). Ein 4-cm-Loch lässt viermal so viel Wasser ein wie ein 2-cm-Loch. Bei unbeherrschbarem Wassereinbruch: MAYDAY.</p>
    </div>
  )
}

export function DismastingWidget() {
  return <OrderExercise steps={DISMASTING_STEPS} intro="Mastbruch auf See. Bringe die Sofortmaßnahmen in eine sinnvolle Reihenfolge – und denke an die Schraube." />
}
