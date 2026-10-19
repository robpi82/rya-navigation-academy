import { useState } from 'react'
import { CheckCircle2, ShieldAlert, ShieldCheck } from 'lucide-react'
import {
  angleDifference,
  formatBearing,
  formatClockTime,
  formatDuration,
  formatNumber,
  fromPolar,
  heightByTwelfths,
  interpolatedDifference,
  interpolationFactor,
  isClearOfDanger,
  planPassage,
  runningFix,
  secondaryTide,
  timeForHeight,
} from '@/calculations'
import { SECONDARY_PORTS, STANDARD_REFERENCES } from '@/data/secondaryPorts'
import { VectorArrow, VEC_COLORS } from '@/components/nautical/svg'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, Toggle, fieldsValid, useNumberField } from '@/modules/calculators/fields'

const f2 = (n: number) => formatNumber(n, 2)

function Out({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg p-2.5', highlight ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-muted/60')}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('font-mono font-semibold tabular-nums', highlight && 'text-primary')}>{value}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ Mehrstündiger CTS */

export function MultiHourWidget() {
  const track = useNumberField('90', { min: 0, max: 360, bearing: true })
  const dist = useNumberField('12', { min: 0.1, max: 100 })
  const stw = useNumberField('6', { min: 0.1, max: 30 })
  const rows = [
    [useNumberField('180', { min: 0, max: 360, bearing: true }), useNumberField('2', { min: 0, max: 8 })],
    [useNumberField('0', { min: 0, max: 360, bearing: true }), useNumberField('1', { min: 0, max: 8 })],
    [useNumberField('0', { min: 0, max: 360, bearing: true }), useNumberField('2', { min: 0, max: 8 })],
    [useNumberField('10', { min: 0, max: 360, bearing: true }), useNumberField('1.5', { min: 0, max: 8 })],
  ]
  const valid = fieldsValid(track, dist, stw, ...rows.flat())
  const tides = valid ? rows.map(([s, r]) => ({ set: s.value!, rate: r.value! })) : []
  const plan = valid ? planPassage({ desiredTrack: track.value!, distance: dist.value!, stw: stw.value!, tides }) : null

  // Skizze: Stromvektoren nacheinander, dann Water Track zum Ziel
  let sketch = null
  if (plan?.feasible) {
    const full = Math.floor(plan.hours)
    const pts = [{ x: 0, y: 0 }]
    for (let i = 0; i < Math.ceil(plan.hours - 1e-9); i++) {
      const v = fromPolar(tides[i].rate * (i < full ? 1 : plan.hours - full), tides[i].set)
      const last = pts[pts.length - 1]
      pts.push({ x: last.x + v.x, y: last.y + v.y })
    }
    const target = fromPolar(dist.value!, track.value!)
    const all = [...pts, target]
    const minX = Math.min(...all.map((p) => p.x))
    const maxX = Math.max(...all.map((p) => p.x))
    const minY = Math.min(...all.map((p) => p.y))
    const maxY = Math.max(...all.map((p) => p.y))
    const W = 320
    const H = 220
    const s = Math.min((W - 60) / Math.max(maxX - minX, 1), (H - 60) / Math.max(maxY - minY, 1))
    const px = (p: { x: number; y: number }) => ({ x: W / 2 + (p.x - (minX + maxX) / 2) * s, y: H / 2 - (p.y - (minY + maxY) / 2) * s })
    sketch = (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Skizze der Passage">
        <VectorArrow from={px(pts[0])} to={px(target)} color={VEC_COLORS.ground} chevrons={2} label="Ground Track" labelOffset={14} />
        {pts.slice(1).map((p, i) => (
          <VectorArrow key={i} from={px(pts[i])} to={px(p)} color={VEC_COLORS.tide} chevrons={3} width={2} label={`${i + 1}. h`} labelOffset={-12} />
        ))}
        <VectorArrow from={px(pts[pts.length - 1])} to={px(target)} color={VEC_COLORS.water} chevrons={1} label="Water Track" labelOffset={-14} />
      </svg>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Ground Track" unit="°" field={track} />
        <NumberField label="Distanz" unit="NM" field={dist} />
        <NumberField label="STW" unit="kn" field={stw} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {rows.map(([s, r], i) => (
          <div key={i} className="rounded-lg border p-2">
            <div className="mb-1 text-xs font-semibold text-muted-foreground">{i + 1}. Stunde</div>
            <div className="grid grid-cols-2 gap-2">
              <NumberField label="Set" unit="°" field={s} />
              <NumberField label="Rate" unit="kn" field={r} />
            </div>
          </div>
        ))}
      </div>
      {plan && !plan.feasible && <p className="rounded-lg border-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">{plan.message}</p>}
      {plan?.feasible && (
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Out label="Einheitlicher CTS" value={formatBearing(plan.courseToSteer)} highlight />
              <Out label="Fahrtzeit" value={formatDuration(plan.hours)} />
              <Out label="Summe Strom" value={`${f2(Math.hypot(plan.tideTotal.x, plan.tideTotal.y))} NM`} />
              <Out label="Ø SOG" value={`${f2(plan.sogMean)} kn`} />
            </div>
            <p className="text-xs text-muted-foreground">
              Strom der angefangenen letzten Stunde wird anteilig gerechnet. In der Prüfung rundet man oft auf volle Stunden – das Ergebnis weicht dann leicht ab.
            </p>
          </div>
          {sketch}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Versegelungspeilung */

export function RunningFixWidget() {
  const b1 = useNumberField('40', { min: 0, max: 360, bearing: true })
  const b2 = useNumberField('340', { min: 0, max: 360, bearing: true })
  const cog = useNumberField('90', { min: 0, max: 360, bearing: true })
  const dist = useNumberField('3', { min: 0.1, max: 50 })
  const valid = fieldsValid(b1, b2, cog, dist)
  const run = valid ? fromPolar(dist.value!, cog.value!) : null
  const fix = valid ? runningFix(b1.value!, b2.value!, run!) : null

  let sketch = null
  if (fix && run) {
    const W = 320
    const H = 240
    const p1 = { x: fix.x - run.x, y: fix.y - run.y }
    const pts = [{ x: 0, y: 0 }, fix, p1]
    const ext = Math.max(...pts.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y)))) * 1.3
    const s = (Math.min(W, H) / 2 - 16) / ext
    const px = (p: { x: number; y: number }) => ({ x: W / 2 + p.x * s, y: H / 2 - p.y * s })
    const far = (from: { x: number; y: number }, brg: number) => {
      const u = fromPolar(ext * 2, (brg + 180) % 360)
      return { x: from.x + u.x, y: from.y + u.y }
    }
    sketch = (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Skizze der Versegelungspeilung">
        <line {...line(px({ x: 0, y: 0 }), px(far({ x: 0, y: 0 }, b1.value!)))} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
        <line {...line(px(run), px(far(run, b1.value!)))} stroke={VEC_COLORS.heading} strokeWidth={2} />
        <line {...line(px({ x: 0, y: 0 }), px(far({ x: 0, y: 0 }, b2.value!)))} stroke={VEC_COLORS.water} strokeWidth={2} />
        <VectorArrow from={px(p1)} to={px(fix)} color={VEC_COLORS.ground} chevrons={2} width={2} label="Weg über Grund" labelOffset={14} />
        <circle cx={px({ x: 0, y: 0 }).x} cy={px({ x: 0, y: 0 }).y} r={6} fill="var(--chart-diamond)" />
        <text x={px({ x: 0, y: 0 }).x + 8} y={px({ x: 0, y: 0 }).y - 8} fontSize={11} fill="var(--foreground)">
          Objekt
        </text>
        <circle cx={px(fix).x} cy={px(fix).y} r={7} fill="none" stroke="var(--foreground)" strokeWidth={2} />
        <circle cx={px(fix).x} cy={px(fix).y} r={1.8} fill="var(--foreground)" />
        <text x={px(fix).x + 10} y={px(fix).y + 14} fontSize={11} fontWeight={700} fill="var(--foreground)">
          Running Fix
        </text>
      </svg>
    )
  }
  const fromObj = fix ? { brg: (Math.atan2(fix.x, fix.y) * 180) / Math.PI, d: Math.hypot(fix.x, fix.y) } : null

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField label="1. Peilung zum Objekt" unit="°" field={b1} />
        <NumberField label="2. Peilung zum Objekt" unit="°" field={b2} />
        <NumberField label="Weg über Grund: Kurs" unit="°" field={cog} />
        <NumberField label="Weg über Grund: Distanz" unit="NM" field={dist} />
      </div>
      {valid && !fix && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Die Standlinien sind (nahezu) parallel – kein Schnittpunkt. Warte, bis sich die Peilung deutlich geändert hat.</p>}
      {fix && fromObj && (
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <Out label="Fix vom Objekt aus" value={formatBearing((fromObj.brg + 360) % 360)} highlight />
              <Out label="Abstand zum Objekt" value={`${f2(fromObj.d)} NM`} />
            </div>
            <ol className="list-decimal space-y-1 pl-5 text-sm">
              <li>Erste Standlinie zum Objekt zeichnen ({formatBearing(b1.value!, 0)}).</li>
              <li>Weg über Grund zwischen beiden Peilungen ({formatBearing(cog.value!, 0)}, {f2(dist.value!)} NM) – inklusive Strom!</li>
              <li>Erste Standlinie parallel um diesen Weg verschieben (violett).</li>
              <li>Schnitt mit der zweiten Standlinie ({formatBearing(b2.value!, 0)}) = Running Fix.</li>
            </ol>
          </div>
          {sketch}
        </div>
      )}
    </div>
  )
}

const line = (a: { x: number; y: number }, b: { x: number; y: number }) => ({ x1: a.x, y1: a.y, x2: b.x, y2: b.y })

/* ------------------------------------------------------------------ Gefahrenpeilung */

export function ClearingBearingWidget() {
  const [type, setType] = useState<'NMT' | 'NLT'>('NMT')
  const limit = useNumberField('45', { min: 0, max: 360, bearing: true })
  const [observed, setObserved] = useState(38)
  const valid = limit.value !== null
  const safe = valid ? isClearOfDanger(observed, limit.value!, type) : null
  const C = 110
  const R = 90
  const pt = (d: number, r = R) => ({ x: C + r * Math.sin((d * Math.PI) / 180), y: C - r * Math.cos((d * Math.PI) / 180) })
  // Gefahrensektor: 60° auf der unsicheren Seite der Grenzpeilung
  const dangerFrom = type === 'NMT' ? limit.value ?? 0 : (limit.value ?? 0) - 60
  const dangerTo = dangerFrom + 60
  const a = pt(dangerFrom)
  const b = pt(dangerTo)

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_240px]">
      <div className="space-y-4">
        <div className="flex flex-wrap items-end gap-3">
          <Toggle label="Art" value={type} onChange={setType} options={[{ value: 'NMT', label: 'NMT – not more than' }, { value: 'NLT', label: 'NLT – not less than' }]} />
          <NumberField label="Grenzpeilung" unit="°" field={limit} className="w-36" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Beobachtete Peilung</span>
            <span className="font-mono">{formatBearing(observed, 0)}</span>
          </div>
          <Slider value={[observed]} min={0} max={359} step={1} onValueChange={([v]) => setObserved(v)} aria-label="Beobachtete Peilung" />
        </div>
        {safe !== null && (
          <div className={cn('flex items-center gap-2 rounded-lg p-3 text-sm font-medium', safe ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')} role="status">
            {safe ? <ShieldCheck className="size-5" /> : <ShieldAlert className="size-5" />}
            {safe
              ? `Sicher: ${formatBearing(observed, 0)} ist ${type === 'NMT' ? 'nicht mehr' : 'nicht weniger'} als ${formatBearing(limit.value!, 0)}.`
              : `Gefahr! ${formatBearing(observed, 0)} liegt um ${formatNumber(Math.abs(angleDifference(limit.value!, observed)), 0)}° auf der falschen Seite – Kurs von der Gefahr weg ändern.`}
          </div>
        )}
      </div>
      <svg viewBox="0 0 220 220" className="mx-auto h-auto w-full max-w-[240px]" role="img" aria-label="Peilungsdiagramm">
        <circle cx={C} cy={C} r={R} fill="var(--chart-sea)" stroke="var(--border)" />
        <path d={`M${C},${C} L${a.x},${a.y} A${R},${R} 0 0 1 ${b.x},${b.y} Z`} fill="var(--destructive)" opacity={0.18} />
        <line x1={C} y1={C} x2={pt(limit.value ?? 0).x} y2={pt(limit.value ?? 0).y} stroke="var(--destructive)" strokeWidth={2} strokeDasharray="5 4" />
        <line x1={C} y1={C} x2={pt(observed).x} y2={pt(observed).y} stroke={safe ? 'var(--success)' : 'var(--destructive)'} strokeWidth={3} />
        <text x={C} y={14} textAnchor="middle" fontSize={11} fill="var(--muted-foreground)">
          N
        </text>
        <text x={C} y={C + 30} textAnchor="middle" fontSize={10} fill="var(--muted-foreground)">
          rot = Gefahrenseite
        </text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Zwölftelregel */

export function TwelfthsWidget() {
  const lw = useNumberField('0.8', { min: -2, max: 10 })
  const hw = useNumberField('4.4', { min: -2, max: 15 })
  const charted = useNumberField('0.5', { min: -5, max: 30 })
  const draft = useNumberField('1.8', { min: 0, max: 10 })
  const margin = useNumberField('0.5', { min: 0, max: 5 })
  const [t, setT] = useState(3)
  const valid = fieldsValid(lw, hw, charted, draft, margin) && hw.value! > lw.value!
  const height = valid ? heightByTwelfths(lw.value!, hw.value!, t) : 0
  const depth = valid ? charted.value! + height : 0
  const ukc = valid ? depth - draft.value! : 0
  const needed = valid ? draft.value! + margin.value! - charted.value! : 0
  const earliest = valid ? timeForHeight(lw.value!, hw.value!, needed) : null

  const W = 320
  const H = 170
  const px = (hr: number, h: number) => ({ x: 30 + (hr / 6) * (W - 45), y: H - 22 - ((h - Math.min(0, lw.value ?? 0)) / ((hw.value ?? 1) - Math.min(0, lw.value ?? 0))) * (H - 40) })
  const curve = valid ? Array.from({ length: 61 }, (_, i) => px(i / 10, heightByTwelfths(lw.value!, hw.value!, i / 10))).map((p) => `${p.x},${p.y}`).join(' ') : ''

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <NumberField label="Höhe NW" unit="m" field={lw} />
        <NumberField label="Höhe HW" unit="m" field={hw} />
        <NumberField label="Kartentiefe" unit="m" field={charted} />
        <NumberField label="Tiefgang" unit="m" field={draft} />
        <NumberField label="Sicherheit" unit="m" field={margin} />
      </div>
      {valid ? (
        <div className="grid gap-4 md:grid-cols-[1fr_320px]">
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Zeit nach NW</span>
                <span className="font-mono">{formatDuration(t)}</span>
              </div>
              <Slider value={[t]} min={0} max={6} step={0.25} onValueChange={([v]) => setT(v)} aria-label="Zeit nach Niedrigwasser" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Out label="Höhe der Gezeit" value={`${f2(height)} m`} />
              <Out label="Wassertiefe" value={`${f2(depth)} m`} />
              <Out label="Wasser unter dem Kiel" value={`${f2(ukc)} m`} highlight />
            </div>
            <p className={cn('rounded-lg p-3 text-sm', ukc >= margin.value! ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive')}>
              {ukc >= margin.value! ? <CheckCircle2 className="mr-1 inline size-4" /> : <ShieldAlert className="mr-1 inline size-4" />}
              {earliest === null
                ? 'Selbst bei Hochwasser reicht die Tiefe nicht aus.'
                : `Benötigte Höhe der Gezeit: ${f2(needed)} m → frühestens ${formatDuration(earliest)} nach NW passierbar.`}
            </p>
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Gezeitenkurve nach der Zwölftelregel">
            {[0, 1, 2, 3, 4, 5, 6].map((h) => (
              <g key={h}>
                <line x1={px(h, 0).x} x2={px(h, 0).x} y1={10} y2={H - 22} stroke="var(--chart-grid)" />
                <text x={px(h, 0).x} y={H - 8} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
                  {h === 0 ? 'NW' : `+${h}`}
                </text>
              </g>
            ))}
            {needed > lw.value! && needed <= hw.value! && <line x1={30} x2={W - 15} y1={px(0, needed).y} y2={px(0, needed).y} stroke="var(--destructive)" strokeDasharray="4 3" />}
            <polyline points={curve} fill="none" stroke={VEC_COLORS.tide} strokeWidth={2.5} />
            <circle cx={px(t, height).x} cy={px(t, height).y} r={5} fill={VEC_COLORS.ground} />
          </svg>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Bitte gültige Werte eingeben (HW muss höher als NW sein).</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Törnplanung */

const CHECKLIST = [
  { id: 'weather', label: 'Wetter: Bericht, Windentwicklung, Seegang, Sicht' },
  { id: 'tides', label: 'Gezeiten: HW/NW-Zeiten, Tidenhub, Wassertiefen an Barren und Häfen' },
  { id: 'streams', label: 'Gezeitenströme: günstige Abfahrtszeit, Kenterpunkte, Strom gegen Wind' },
  { id: 'dangers', label: 'Gefahren: Untiefen, Wracks, Verkehrstrennungsgebiete, Gefahrenpeilungen festlegen' },
  { id: 'aids', label: 'Navigationshilfen: Tonnen, Feuer, Deckpeilungen, Wegpunkte' },
  { id: 'refuge', label: 'Ausweichhäfen (Ports of Refuge) und deren Zufahrtsbedingungen' },
  { id: 'crew', label: 'Crew & Boot: Erfahrung, Seekrankheit, Wachplan, Proviant, Treibstoff' },
  { id: 'comms', label: 'Kommunikation & Sicherheit: UKW-Kanäle, Notfallplan, Törnmeldung an Land' },
]

export function PassagePlanningWidget() {
  const [done, setDone] = useState<string[]>([])
  return (
    <div className="space-y-3">
      <ul className="space-y-1.5">
        {CHECKLIST.map((c) => (
          <li key={c.id}>
            <label className="flex cursor-pointer items-start gap-3 rounded-lg border p-2.5 text-sm hover:bg-muted/50">
              <input type="checkbox" className="mt-0.5 size-4 accent-[var(--primary)]" checked={done.includes(c.id)} onChange={() => setDone((d) => (d.includes(c.id) ? d.filter((x) => x !== c.id) : [...d, c.id]))} />
              <span className={done.includes(c.id) ? 'text-muted-foreground line-through' : undefined}>{c.label}</span>
            </label>
          </li>
        ))}
      </ul>
      <p className="text-sm text-muted-foreground">
        {done.length} von {CHECKLIST.length} Punkten geprüft{done.length === CHECKLIST.length ? ' – Plan vollständig. Gute Fahrt!' : '.'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Sekundärhäfen */

const clock = (min: number) => {
  const c = formatClockTime(min)
  return c.dayOffset === 0 ? c.time : `${c.time} (${c.dayOffset > 0 ? '+' : '−'}${Math.abs(c.dayOffset)} Tag)`
}
const diffStr = (n: number) => `${n >= 0 ? '+' : '−'}${Math.floor(Math.abs(n) / 60)}:${String(Math.abs(n) % 60).padStart(2, '0')}`
const mDiff = (n: number) => `${n >= 0 ? '+' : '−'}${f2(Math.abs(n))} m`

export function SecondaryPortWidget() {
  const [portId, setPortId] = useState(SECONDARY_PORTS[0].id)
  const hwTime = useNumberField('10.5', { min: 0, max: 24 })
  const lwTime = useNumberField('16.75', { min: 0, max: 30 })
  const [hwHeight, setHwHeight] = useState(4.5)
  const [lwHeight, setLwHeight] = useState(1.5)
  const port = SECONDARY_PORTS.find((p) => p.id === portId)!
  const valid = fieldsValid(hwTime, lwTime)
  const r = valid
    ? secondaryTide({ hwTime: hwTime.value! * 60, hwHeight, lwTime: lwTime.value! * 60, lwHeight }, STANDARD_REFERENCES, port.differences)
    : null
  const fHw = interpolationFactor(hwHeight, STANDARD_REFERENCES.hw)
  const fLw = interpolationFactor(lwHeight, STANDARD_REFERENCES.lw)
  const dHw = interpolatedDifference(hwHeight, STANDARD_REFERENCES.hw, port.differences.hwHeight)
  const dLw = interpolatedDifference(lwHeight, STANDARD_REFERENCES.lw, port.differences.lwHeight)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Standardhafen Ankerstedt (fiktiv): HW Springs 5,0 / Nipp 4,0 m, NW Springs 1,0 / Nipp 2,0 m. Gib die Vorhersage des Standardhafens ein; die App rechnet auf den Sekundärhafen um und zeigt den Rechenweg.
      </p>
      <Toggle value={portId} onChange={setPortId} label="Sekundärhafen" options={SECONDARY_PORTS.map((p) => ({ value: p.id, label: p.name }))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="HW Standardhafen (Uhrzeit)" hint="Dezimalstunden, z. B. 10,5 = 10:30" unit="h" field={hwTime} />
        <NumberField label="NW Standardhafen (Uhrzeit)" hint="z. B. 16,75 = 16:45" unit="h" field={lwTime} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">HW-Höhe Standardhafen</span>
            <span className="font-mono">{f2(hwHeight)} m</span>
          </div>
          <Slider value={[hwHeight]} min={3.6} max={5.4} step={0.05} onValueChange={([v]) => setHwHeight(v)} aria-label="HW-Höhe im Standardhafen" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">NW-Höhe Standardhafen</span>
            <span className="font-mono">{f2(lwHeight)} m</span>
          </div>
          <Slider value={[lwHeight]} min={0.6} max={2.4} step={0.05} onValueChange={([v]) => setLwHeight(v)} aria-label="NW-Höhe im Standardhafen" />
        </div>
      </div>
      {r ? (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Out label={`HW ${port.name}`} value={`${clock(r.hwTime)} · ${f2(r.hwHeight)} m`} highlight />
            <Out label={`NW ${port.name}`} value={`${clock(r.lwTime)} · ${f2(r.lwHeight)} m`} highlight />
            <Out label="Tidenhub" value={`${f2(r.range)} m`} />
            <Out label="Faktor HW (0 = Nipp, 1 = Springs)" value={f2(fHw)} />
            <Out label="Faktor NW" value={f2(fLw)} />
          </div>
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Zeit: HW {clock(hwTime.value! * 60)} {diffStr(port.differences.hwTime)} = {clock(r.hwTime)}; NW {clock(lwTime.value! * 60)} {diffStr(port.differences.lwTime)} = {clock(r.lwTime)}.</li>
            <li>Faktor HW = ({f2(hwHeight)} − 4,00) / (5,00 − 4,00) = {f2(fHw)}. Unterschied = {mDiff(port.differences.hwHeight.neaps)} + {f2(fHw)} × ({mDiff(port.differences.hwHeight.springs)} − ({mDiff(port.differences.hwHeight.neaps)})) = {mDiff(dHw)}.</li>
            <li>Faktor NW = ({f2(lwHeight)} − 2,00) / (1,00 − 2,00) = {f2(fLw)}. Unterschied = {mDiff(dLw)}.</li>
            <li>Höhen: HW {f2(hwHeight)} {mDiff(dHw)} = {f2(r.hwHeight)} m; NW {f2(lwHeight)} {mDiff(dLw)} = {f2(r.lwHeight)} m.</li>
          </ol>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Bitte gültige Uhrzeiten eingeben.</p>
      )}
    </div>
  )
}
