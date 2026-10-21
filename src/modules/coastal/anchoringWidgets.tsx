import { useState } from 'react'
import { anchorRode, clearanceAtLw, formatNumber, maxDepth, SCOPE_CHAIN, SCOPE_ROPE, swingRadius } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { ANCHORAGE_OPTIONS, ANCHORAGE_SCENARIO, ANCHORING_STEPS } from '@/data/anchoring'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'
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

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'bad' }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', tone === 'bad' ? 'border-destructive bg-destructive/10' : tone === 'ok' ? 'border-success bg-success/10' : 'bg-muted/50')}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ Kettenlänge und Schwojkreis */

export function AnchorScopeWidget() {
  const [charted, setCharted] = useState(4)
  const [hw, setHw] = useState(4.5)
  const [lw, setLw] = useState(0.5)
  const [draught, setDraught] = useState(1.8)
  const [kind, setKind] = useState<'chain' | 'rope'>('chain')
  const [obstacle, setObstacle] = useState(50)
  const [tide, setTide] = useState<'hw' | 'lw'>('hw')
  const boatLength = 11
  const scope = kind === 'chain' ? SCOPE_CHAIN : SCOPE_ROPE
  const depthHw = maxDepth(charted, hw)
  const depthLw = charted + lw
  const rode = anchorRode(charted, hw, scope)
  const radius = swingRadius(rode, depthLw, boatLength)
  const clearance = clearanceAtLw(charted, lw, draught)
  const swingOk = obstacle > radius

  // Seitenansicht (vertikal überhöht)
  const W = 300
  const H = 200
  const seabed = 176
  const ys = 136 / Math.max(depthHw, 3) // px pro m Tiefe: HW-Wasserlinie oben in der Skizze
  const depth = tide === 'hw' ? depthHw : depthLw
  const surface = seabed - depth * ys
  const horizontal = Math.sqrt(Math.max(0, rode * rode - depth * depth))
  const xs = 200 / Math.max(horizontal, 1)
  const anchorX = 24
  const bowX = anchorX + horizontal * xs
  const keelY = surface + draught * ys
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Wie viel Kette? Faustregel: mindestens das Vierfache der größten Wassertiefe bei Kette, das Sechsfache bei Leine mit Kettenvorlauf. Maßgeblich ist die Tiefe bei Hochwasser. Der Schwojkreis ist bei Niedrigwasser am größten, weil die Kette dann flacher liegt.
      </p>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_300px]">
        <div className="min-w-0 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Slide label="Kartentiefe" value={`${f1(charted)} m`} min={0} max={10} step={0.1} v={charted} on={setCharted} />
            <Slide label="Tiefgang" value={`${f1(draught)} m`} min={1} max={2.5} step={0.1} v={draught} on={setDraught} />
            <Slide label="Höhe der Gezeit bei HW" value={`${f1(hw)} m`} min={0} max={8} step={0.1} v={hw} on={(n) => setHw(Math.max(n, lw))} />
            <Slide label="Höhe der Gezeit bei NW" value={`${f1(lw)} m`} min={0} max={3} step={0.1} v={lw} on={(n) => setLw(Math.min(n, hw))} />
            <Slide label="Abstand zum nächsten Hindernis" value={`${obstacle} m`} min={10} max={120} step={5} v={obstacle} on={setObstacle} />
            <div className="space-y-1">
              <span className="text-sm font-medium">Ankergeschirr</span>
              <div>
                <Toggle value={kind} onChange={setKind} label="Ankergeschirr" options={[{ value: 'chain', label: 'Kette (4×)' }, { value: 'rope', label: 'Leine (6×)' }]} />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
            <Tile label="Tiefe bei HW" value={`${f1(depthHw)} m`} />
            <Tile label={`zu stecken (${scope}×)`} value={`${Math.ceil(rode)} m`} />
            <Tile label="Schwojkreis (bei NW)" value={`${Math.round(radius)} m`} tone={swingOk ? 'ok' : 'bad'} />
            <Tile label="unter dem Kiel bei NW" value={`${f1(clearance)} m`} tone={clearance >= 0.5 ? 'ok' : 'bad'} />
          </div>
          <p className={cn('rounded-lg border p-3 text-sm', clearance >= 0.5 && swingOk ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
            {clearance < 0
              ? 'Bei Niedrigwasser sitzt das Boot auf – tieferes Wasser suchen.'
              : clearance < 0.5
                ? 'Zu knapp: bei Niedrigwasser bleibt kaum Wasser unter dem Kiel, Schwell und Ungenauigkeit nicht eingerechnet.'
                : !swingOk
                  ? `Der Schwojkreis (${Math.round(radius)} m) reicht bis an das Hindernis – weiter vom Hindernis entfernt ankern.`
                  : 'Passt: genug Wasser bei Niedrigwasser und genug Platz zum Schwojen.'}
          </p>
          <p className="text-xs text-muted-foreground">Schwojkreis = √(Kette² − Tiefe bei NW²) + Bootslänge (hier {boatLength} m). Andere Boote schwojen mit – aber nicht immer gleich (Kette gegen Leine, Wind gegen Strom).</p>
        </div>
        <div className="space-y-2">
          <Toggle value={tide} onChange={setTide} label="Wasserstand in der Skizze" options={[{ value: 'hw', label: 'Hochwasser' }, { value: 'lw', label: 'Niedrigwasser' }]} />
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label={`Seitenansicht: Kette ${Math.ceil(rode)} m bei ${f1(depth)} m Wassertiefe`}>
            <rect x={0} y={0} width={W} height={Math.max(0, surface)} fill="var(--card)" />
            <line x1={0} y1={surface} x2={W} y2={surface} stroke="#0284c7" strokeWidth={1.5} />
            {tide === 'lw' && (
              <>
                <line x1={0} y1={seabed - depthHw * ys} x2={W} y2={seabed - depthHw * ys} stroke="#0284c7" strokeWidth={1} strokeDasharray="4 3" />
                <text x={6} y={seabed - depthHw * ys - 4} fontSize={9} fill="#0284c7">
                  HW: {f1(depthHw)} m
                </text>
              </>
            )}
            <rect x={0} y={seabed} width={W} height={H - seabed} fill="var(--chart-land, #e7d8a8)" />
            <path d={`M ${bowX - 6} ${surface - 6} L ${bowX + 40} ${surface - 6} L ${bowX + 34} ${surface + 4} L ${bowX + 2} ${surface + 4} Z`} fill="#0f172a" />
            <line x1={bowX + 18} y1={surface + 4} x2={bowX + 18} y2={keelY} stroke="#0f172a" strokeWidth={4} />
            <path d={`M ${bowX - 4} ${surface - 2} Q ${anchorX + (bowX - anchorX) * 0.45} ${seabed + 2} ${anchorX} ${seabed - 2}`} fill="none" stroke="#e11d48" strokeWidth={2} />
            <path d={`M ${anchorX - 6} ${seabed - 6} L ${anchorX} ${seabed} L ${anchorX + 6} ${seabed - 6}`} fill="none" stroke="#e11d48" strokeWidth={2.5} />
            <text x={6} y={Math.max(12, surface - 6)} fontSize={9} fill="currentColor">
              {tide === 'hw' ? 'HW' : 'NW'}: {f1(depth)} m
            </text>
            <text x={6} y={H - 6} fontSize={9} fill="currentColor">
              Kette {Math.ceil(rode)} m · Abstand Anker–Bug {Math.round(horizontal)} m (überhöht)
            </text>
          </svg>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Ankerplatz wählen */

const dirName = (deg: number) => ['N', 'NO', 'O', 'SO', 'S', 'SW', 'W', 'NW'][Math.round(deg / 45) % 8]

export function AnchorageChoiceWidget() {
  const [picked, setPicked] = useState<string | null>(null)
  const s = ANCHORAGE_SCENARIO
  const choice = ANCHORAGE_OPTIONS.find((o) => o.id === picked)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Du willst über Nacht ankern. Wind jetzt aus {dirName(s.windNow)} 4 Bft, Vorhersage für die Nacht: Drehung auf {dirName(s.windLater)} 5–6. Tiefgang {f1(s.draught)} m, Höhe der Gezeit bei Niedrigwasser {f1(s.lwHeight)} m, bei Hochwasser {f1(s.hwHeight)} m. Welcher Ankerplatz?
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {ANCHORAGE_OPTIONS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPicked(o.id)}
            aria-pressed={picked === o.id}
            className={cn(
              'rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted',
              picked === o.id && (o.correct ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'),
            )}
          >
            <div className="font-semibold">{o.name}</div>
            <dl className="mt-1 grid grid-cols-[auto_1fr] gap-x-3 text-muted-foreground">
              <dt>Geschützt aus</dt>
              <dd>{o.shelter}</dd>
              <dt>Kartentiefe</dt>
              <dd>{f1(o.chartedDepth)} m</dd>
              <dt>Grund</dt>
              <dd>{o.ground}</dd>
              <dt>Schwojraum</dt>
              <dd>{o.swingRoom}</dd>
            </dl>
          </button>
        ))}
      </div>
      {choice && (
        <p role="status" className={cn('rounded-lg border p-3 text-sm', choice.correct ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
          {choice.feedback}
        </p>
      )}
    </div>
  )
}

export function AnchoringOrderWidget() {
  return <OrderExercise steps={ANCHORING_STEPS} intro="Bringe das Ankermanöver in eine sinnvolle Reihenfolge – von der Wahl des Platzes bis zur Ankerwache." />
}
