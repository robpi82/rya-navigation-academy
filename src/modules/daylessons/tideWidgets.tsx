import { useState } from 'react'
import { AlertTriangle, CheckCircle2 } from 'lucide-react'
import {
  anchorChainLength,
  classifyRange,
  formatClockTime,
  formatNumber,
  heightByTwelfths,
  heightCosine,
  parseClock,
  passableWindow,
  tidalRange,
  underKeelClearance,
  waterDepth,
} from '@/calculations'
import { VEC_COLORS } from '@/components/nautical/svg'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, fieldsValid, useNumberField } from '@/modules/calculators/fields'

const f1 = (n: number) => formatNumber(n, 1)
const f2 = (n: number) => formatNumber(n, 2)

function Out({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: string }) {
  return (
    <div className={cn('rounded-lg p-2.5', highlight ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-muted/60')}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('font-mono font-semibold tabular-nums', highlight && 'text-primary')}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

const clock = (min: number) => {
  const c = formatClockTime(min)
  return c.dayOffset === 0 ? c.time : `${c.time} (${c.dayOffset > 0 ? '+' : ''}${c.dayOffset} Tag)`
}

/* ------------------------------------------------------------------ Höhe der Gezeit, Tiefe, Zeitfenster */

export function TideHeightWidget() {
  const hw = useNumberField('4.6', { min: -1, max: 15 })
  const lw = useNumberField('0.8', { min: -2, max: 14 })
  const [hwClock, setHwClock] = useState('12:00')
  const charted = useNumberField('1.2', { min: -5, max: 40 })
  const draught = useNumberField('1.7', { min: 0.1, max: 6 })
  const margin = useNumberField('0.5', { min: 0, max: 3 })
  const [t, setT] = useState(2)
  const hwMin = parseClock(hwClock)
  const valid = fieldsValid(hw, lw, charted, draught, margin) && hw.value! > lw.value!
  if (!valid)
    return (
      <>
        <Inputs hw={hw} lw={lw} charted={charted} draught={draught} margin={margin} hwClock={hwClock} setHwClock={setHwClock} hwMin={hwMin} />
        <p className="mt-3 text-sm text-muted-foreground">Bitte gültige Werte eingeben (HW muss höher als NW sein).</p>
      </>
    )
  const range = tidalRange(hw.value!, lw.value!)
  const height = heightCosine(hw.value!, lw.value!, t)
  const twelfths = heightByTwelfths(lw.value!, hw.value!, 6 - Math.abs(t))
  const depth = waterDepth(charted.value!, height)
  const ukc = underKeelClearance(depth, draught.value!)
  const needed = draught.value! + margin.value! - charted.value!
  const win = passableWindow(hw.value!, lw.value!, needed)
  const W = 340
  const H = 180
  const px = (hr: number, h: number) => ({
    x: 28 + ((hr + 6) / 12) * (W - 40),
    y: H - 24 - ((h - (lw.value! - 0.3)) / (hw.value! - lw.value! + 0.6)) * (H - 44),
  })
  const curve = Array.from({ length: 121 }, (_, i) => {
    const hr = -6 + i / 10
    const p = px(hr, heightCosine(hw.value!, lw.value!, hr))
    return `${p.x},${p.y}`
  }).join(' ')
  const cur = px(t, height)

  return (
    <div className="space-y-4">
      <Inputs hw={hw} lw={lw} charted={charted} draught={draught} margin={margin} hwClock={hwClock} setHwClock={setHwClock} hwMin={hwMin} />
      <div className="grid gap-4 md:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Zeit relativ zu Hochwasser</span>
              <span className="font-mono">
                {t === 0 ? 'HW' : `HW${t > 0 ? '+' : '−'}${Math.abs(t)}`}
                {hwMin !== null && ` · ${clock(hwMin + t * 60)}`}
              </span>
            </div>
            <Slider value={[t]} min={-6} max={6} step={0.25} onValueChange={([v]) => setT(v)} aria-label="Zeit relativ zu Hochwasser" />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <Out label="Tidenhub" value={`${f2(range)} m`} />
            <Out label="Höhe der Gezeit" value={`${f2(height)} m`} sub={`Zwölftelregel: ${f2(twelfths)} m`} />
            <Out label="Wassertiefe" value={`${f2(depth)} m`} sub={depth < 0 ? 'Fläche liegt trocken' : undefined} />
            <Out label="Wasser unter dem Kiel" value={`${f2(ukc)} m`} highlight />
            <Out label="Benötigte Höhe" value={`${f2(needed)} m`} sub="Tiefgang + Sicherheit − Kartentiefe" />
          </div>
          <div className={cn('flex items-start gap-2 rounded-lg p-3 text-sm', ukc >= margin.value! ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')} role="status">
            {ukc >= margin.value! ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
            <span>
              {win.kind === 'always' && 'Die Stelle ist zu jeder Tidenzeit passierbar.'}
              {win.kind === 'never' && 'Selbst bei Hochwasser reicht die Tiefe nicht aus.'}
              {win.kind === 'window' &&
                `Passierbar von HW−${f1(win.halfWidthHours)} h bis HW+${f1(win.halfWidthHours)} h${
                  hwMin !== null ? ` (${clock(hwMin - win.halfWidthHours * 60)} bis ${clock(hwMin + win.halfWidthHours * 60)})` : ''
                }.`}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Kosinusmodell mit 6 h von HW bis NW. Echte Gezeitenkurven weichen davon ab – im Almanach nutzt man die Kurve des Standardhafens.
          </p>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Gezeitenkurve">
          {[-6, -3, 0, 3, 6].map((h) => (
            <g key={h}>
              <line x1={px(h, 0).x} x2={px(h, 0).x} y1={8} y2={H - 24} stroke="var(--chart-grid)" />
              <text x={px(h, 0).x} y={H - 10} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
                {h === 0 ? 'HW' : h > 0 ? `+${h}` : `−${-h}`}
              </text>
            </g>
          ))}
          {win.kind === 'window' && <rect x={px(-win.halfWidthHours, 0).x} width={px(win.halfWidthHours, 0).x - px(-win.halfWidthHours, 0).x} y={8} height={H - 32} fill="var(--success)" opacity={0.12} />}
          {needed > lw.value! && needed <= hw.value! && <line x1={28} x2={W - 12} y1={px(0, needed).y} y2={px(0, needed).y} stroke="var(--destructive)" strokeDasharray="4 3" />}
          <polyline points={curve} fill="none" stroke={VEC_COLORS.tide} strokeWidth={2.5} />
          <circle cx={cur.x} cy={cur.y} r={5} fill={VEC_COLORS.ground} />
          <text x={W - 12} y={14} fontSize={9} textAnchor="end" fill="var(--muted-foreground)">
            rot: benötigte Höhe · grün: passierbar
          </text>
        </svg>
      </div>
    </div>
  )
}

function Inputs({ hw, lw, charted, draught, margin, hwClock, setHwClock, hwMin }: {
  hw: ReturnType<typeof useNumberField>
  lw: ReturnType<typeof useNumberField>
  charted: ReturnType<typeof useNumberField>
  draught: ReturnType<typeof useNumberField>
  margin: ReturnType<typeof useNumberField>
  hwClock: string
  setHwClock: (s: string) => void
  hwMin: number | null
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <NumberField label="Höhe HW" unit="m" field={hw} />
      <NumberField label="Höhe NW" unit="m" field={lw} />
      <div className="space-y-1">
        <label htmlFor="hw-time" className="block text-sm font-medium">
          Zeit HW
          <span className="block text-xs font-normal text-muted-foreground">HH:MM</span>
        </label>
        <input id="hw-time" value={hwClock} onChange={(e) => setHwClock(e.target.value)} aria-invalid={hwMin === null} className="h-10 w-full rounded-md border bg-background px-3 font-mono" />
        {hwMin === null && <p className="text-xs text-destructive">z. B. 12:00</p>}
      </div>
      <NumberField label="Kartentiefe" hint="negativ = trockenfallend" unit="m" field={charted} />
      <NumberField label="Tiefgang" unit="m" field={draught} />
      <NumberField label="Sicherheit" unit="m" field={margin} />
    </div>
  )
}

/* ------------------------------------------------------------------ Mond und Gezeiten */

const SYNODIC = 29.53

function MoonDisc({ day }: { day: number }) {
  const phi = (2 * Math.PI * day) / SYNODIC
  const r = 34
  const c = 40
  const cos = Math.cos(phi)
  const rx = Math.abs(cos) * r
  const waxing = day <= SYNODIC / 2
  const lit = `M${c},${c - r} A${r},${r} 0 0 1 ${c},${c + r} A${rx},${r} 0 0 ${cos > 0 ? 0 : 1} ${c},${c - r} Z`
  return (
    <svg viewBox="0 0 80 80" className="size-24" role="img" aria-label="Mondphase">
      <circle cx={c} cy={c} r={r} fill="#2b3446" stroke="var(--border)" />
      <path d={lit} fill="#f7f1d1" transform={waxing ? undefined : `translate(${2 * c} 0) scale(-1 1)`} />
    </svg>
  )
}

function phaseName(day: number): string {
  const d = ((day % SYNODIC) + SYNODIC) % SYNODIC
  if (d < 1.2 || d > SYNODIC - 1.2) return 'Neumond'
  if (d < 6.2) return 'zunehmende Sichel'
  if (d < 8.6) return 'erstes Viertel (Halbmond)'
  if (d < 13.6) return 'zunehmender Mond'
  if (d < 16.0) return 'Vollmond'
  if (d < 21.5) return 'abnehmender Mond'
  if (d < 23.9) return 'letztes Viertel (Halbmond)'
  return 'abnehmende Sichel'
}

export function SpringNeapWidget() {
  const [day, setDay] = useState(0)
  const spring = 5.0
  const neap = 2.0
  // Springtide: Tidenhub maximal bei Neu- und Vollmond (Periode ≈ 14,8 Tage). In der Praxis folgt sie ein bis zwei Tage später.
  const range = (spring + neap) / 2 + ((spring - neap) / 2) * Math.cos((4 * Math.PI * day) / SYNODIC)
  const cls = classifyRange(range, spring, neap)
  const label = cls === 'springs' ? 'Springtide' : cls === 'neaps' ? 'Nipptide' : 'dazwischen'
  return (
    <div className="grid items-center gap-4 md:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-1">
        <MoonDisc day={day} />
        <div className="text-center text-sm font-medium">{phaseName(day)}</div>
        <div className="text-xs text-muted-foreground">Tag {formatNumber(day, 0)} des Mondzyklus</div>
      </div>
      <div className="space-y-3">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Mondzyklus</span>
            <span className="font-mono">Tag {formatNumber(day, 0)}</span>
          </div>
          <Slider value={[day]} min={0} max={29} step={1} onValueChange={([v]) => setDay(v)} aria-label="Tag im Mondzyklus" />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <Out label="Tidenhub (Beispielhafen)" value={`${f1(range)} m`} sub={`Spring ${f1(spring)} m, Nipp ${f1(neap)} m`} />
          <Out label="Einordnung" value={label} highlight={cls !== 'intermediate'} />
        </div>
        <p className="text-sm text-muted-foreground">
          Bei <b>Neu- und Vollmond</b> stehen Sonne, Mond und Erde in einer Linie – die Anziehungskräfte addieren sich: <b>Springtide</b> mit dem größten Tidenhub. Beim <b>ersten und letzten Viertel</b> stehen sie im rechten Winkel – <b>Nipptide</b>, kleinster Tidenhub. In der Praxis folgt die Springtide ein bis zwei Tage nach der Mondphase.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Ankern bei Gezeiten */

export function AnchorTideWidget() {
  const charted = useNumberField('3.2', { min: 0, max: 40 })
  const hwHeight = useNumberField('4.5', { min: 0, max: 15 })
  const bow = useNumberField('1', { min: 0, max: 4 })
  const length = useNumberField('11', { min: 3, max: 40 })
  const [ratio, setRatio] = useState(4)
  const valid = fieldsValid(charted, hwHeight, bow, length)
  const depthHw = valid ? waterDepth(charted.value!, hwHeight.value!) : 0
  const chain = valid ? anchorChainLength(depthHw, bow.value!, ratio) : 0
  const h = depthHw + (valid ? bow.value! : 0)
  const swing = valid && chain > h ? Math.sqrt(chain * chain - h * h) + length.value! : 0
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Beim Ankern zählt die Tiefe bei <b>Hochwasser</b> (dann ist am meisten Kette nötig) – zusätzlich der Abstand vom Bug zur Wasseroberfläche.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        <NumberField label="Kartentiefe" unit="m" field={charted} />
        <NumberField label="Höhe der Gezeit bei HW" unit="m" field={hwHeight} />
        <NumberField label="Bughöhe über Wasser" unit="m" field={bow} />
        <NumberField label="Bootslänge" unit="m" field={length} />
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Kettenverhältnis</span>
          <span className="font-mono">{ratio} : 1</span>
        </div>
        <Slider value={[ratio]} min={4} max={8} step={1} onValueChange={([v]) => setRatio(v)} aria-label="Kettenverhältnis" />
        <p className="text-xs text-muted-foreground">Faustregel: Kette mindestens 4 : 1, Leine mit Kettenvorlauf 6 : 1 – bei viel Wind mehr.</p>
      </div>
      {valid && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Out label="Tiefe bei HW" value={`${f1(depthHw)} m`} />
          <Out label="Kette ausstecken" value={`${f1(chain)} m`} highlight />
          <Out label="Schwojkreis (Radius)" value={`≈ ${f1(swing)} m`} sub="inkl. Bootslänge" />
        </div>
      )}
    </div>
  )
}
