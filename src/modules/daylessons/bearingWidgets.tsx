import { useMemo, useState } from 'react'
import {
  compassErrorFromTransit,
  cutAngle,
  deviationFromError,
  fixFromBearings,
  formatBearing,
  formatNumber,
  normalizeAngle,
  offsetPosition,
  reciprocal,
  rhumbLine,
  triangleAdvice,
  type BearingObservation,
} from '@/calculations'
import { SeaChart, type ChartOverlay } from '@/components/chart/SeaChart'
import { Slider } from '@/components/ui/slider'
import { MARK_BY_ID } from '@/data/chartArea'
import { fromPolar } from '@/calculations/vectors'
import { NumberField, fieldsValid, useNumberField } from '@/modules/calculators/fields'
import { cn } from '@/lib/utils'

const f1 = (n: number) => formatNumber(n, 1)
const f2 = (n: number) => formatNumber(n, 2)
const signed = (n: number) => (Math.abs(n) < 0.05 ? '0°' : `${n > 0 ? '+' : '−'}${f1(Math.abs(n))}°`)
const eastWest = (n: number) => (Math.abs(n) < 0.05 ? '0°' : `${f1(Math.abs(n))}° ${n > 0 ? 'Ost' : 'West'}`)

/* ------------------------------------------------------------------ Kreuzpeilung */

const BOAT = { lat: 50.716, lon: -1.37 }
const MARK_IDS = ['lt-moewe', 'ch-ankerstedt', 'lt-kranich'] as const
const COLORS = ['#e11d48', '#2563eb', '#16a34a']

export function CrossBearingWidget() {
  const [errors, setErrors] = useState([0, 0, 0])
  const [common, setCommon] = useState(0)
  const [useThree, setUseThree] = useState(true)

  const marks = MARK_IDS.map((id) => MARK_BY_ID[id])
  const truth = marks.map((m) => rhumbLine(BOAT, m.pos))
  const count = useThree ? 3 : 2
  const obs: BearingObservation[] = marks.slice(0, count).map((m, i) => ({ mark: m.pos, bearing: normalizeAngle(truth[i].bearing! + errors[i] + common) }))
  const fix = useMemo(() => fixFromBearings(obs), [obs.map((o) => o.bearing.toFixed(3)).join(), count]) // eslint-disable-line react-hooks/exhaustive-deps
  const offBy = fix ? rhumbLine(BOAT, fix.center).distance : null

  const overlays: ChartOverlay[] = [{ kind: 'point', id: 'boat', pos: BOAT, symbol: 'cross', label: 'wahre Position', color: '#64748b' }]
  obs.forEach((o, i) => {
    const dist = truth[i].distance + 1.5
    const end = offsetPosition(o.mark, fromPolar(dist, reciprocal(o.bearing)))
    overlays.push({ kind: 'line', id: `sl-${i}`, from: o.mark, to: end, color: COLORS[i], label: formatBearing(o.bearing, 0), width: 2 })
  })
  if (fix) {
    fix.points.forEach((p, i) => overlays.push({ kind: 'point', id: `p-${i}`, pos: p, symbol: 'cross', color: '#f59e0b' }))
    overlays.push({ kind: 'point', id: 'fix', pos: fix.center, symbol: 'fix', label: 'Fix' })
  }
  const advice = fix ? triangleAdvice(fix.size) : null

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <SeaChart overlays={overlays} showDiamonds={false} className="h-[46vh] min-h-72" />
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Drei Landmarken werden gepeilt. Jede Peilung ergibt eine <b>Standlinie</b> vom Objekt in Richtung der Gegenpeilung. Lege Peilfehler fest und beobachte das Fehlerdreieck („cocked hat").
        </p>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={useThree} onChange={(e) => setUseThree(e.target.checked)} className="size-4" />
          Dritte Peilung verwenden
        </label>
        {marks.slice(0, count).map((m, i) => (
          <div key={m.id} className="space-y-1">
            <div className="flex justify-between gap-2 text-sm">
              <span className="font-medium">
                <span className="mr-1.5 inline-block size-2.5 rounded-full" style={{ background: COLORS[i] }} aria-hidden />
                {m.name}
              </span>
              <span className="font-mono tabular-nums">
                {formatBearing(obs[i].bearing, 0)} <span className="text-muted-foreground">({signed(errors[i])})</span>
              </span>
            </div>
            <Slider value={[errors[i]]} min={-10} max={10} step={1} onValueChange={([v]) => setErrors((e) => e.map((x, j) => (j === i ? v : x)))} aria-label={`Peilfehler ${m.name}`} />
          </div>
        ))}
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Gemeinsamer Fehler (z. B. falsche Deviation)</span>
            <span className="font-mono tabular-nums">{signed(common)}</span>
          </div>
          <Slider value={[common]} min={-10} max={10} step={1} onValueChange={([v]) => setCommon(v)} aria-label="Gemeinsamer Fehler aller Peilungen" />
        </div>
        {fix ? (
          <div className="space-y-2 rounded-lg border bg-muted/40 p-3 text-sm" aria-live="polite">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="text-xs text-muted-foreground">Größe des Dreiecks</div>
                <div className="font-mono text-lg font-semibold tabular-nums">{f2(fix.size)} NM</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Abstand zur wahren Position</div>
                <div className="font-mono text-lg font-semibold tabular-nums">{f2(offBy ?? 0)} NM</div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Kleinster Schnittwinkel: {Math.round(fix.worstCutAngle)}° {fix.worstCutAngle < 30 ? '(unter 30° – ungenau!)' : fix.worstCutAngle >= 60 ? '(gut)' : ''}</p>
            <p className={cn('font-medium', advice === 'large' && 'text-destructive', advice === 'small' && 'text-success')}>
              {count === 2
                ? 'Zwei Peilungen: Du siehst keinen Fehler – eine dritte Peilung zur Kontrolle ist ratsam.'
                : advice === 'small'
                  ? 'Kleines Dreieck: Die Position ist verlässlich.'
                  : advice === 'medium'
                    ? 'Mittleres Dreieck: Peilungen wiederholen; bei Gefahren die ungünstigste Ecke annehmen.'
                    : 'Großes Dreieck: Peilungen nicht verwenden. Neu peilen, Objekte prüfen, Kompassfehler suchen.'}
            </p>
            {count === 3 && fix.size < 0.12 && Math.abs(common) >= 3 && (
              <p className="text-xs text-muted-foreground">Ein gemeinsamer Fehler lässt das Dreieck klein erscheinen, verschiebt aber die ganze Position – ein kleines Dreieck beweist nicht, dass der Kompass stimmt.</p>
            )}
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Keine Position: Die Standlinien schneiden sich nicht.</p>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Deckpeilung */

export function TransitWidget() {
  const [observed, setObserved] = useState(128)
  const [variation, setVariation] = useState(-3)
  const trueBearing = 123
  const total = compassErrorFromTransit(trueBearing, observed)
  const deviation = deviationFromError(total, variation)
  const W = 320
  const H = 205
  // Zwei Objekte in der Karte: vorderes (nahe) und hinteres (fernes) Zeichen, Boot läuft auf der Linie
  const dir = fromPolar(1, trueBearing)
  const mid = { x: 70, y: 40 }
  const front = { x: mid.x + dir.x * 130, y: mid.y - dir.y * 130 }
  const rear = { x: mid.x + dir.x * 230, y: mid.y - dir.y * 230 }
  const boat = { x: mid.x + dir.x * 60 + 0, y: mid.y - dir.y * 60 }
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Stehen zwei Objekte in der Karte in einer Linie hintereinander („Deckpeilung", engl. <i>transit</i>), kennst du die rechtweisende Peilung genau: hier <b className="font-mono">{formatBearing(trueBearing, 0)}</b>. Vergleiche sie mit der Kompasspeilung und du erhältst den <b>Gesamtfehler</b> (Variation + Deviation).
        </p>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Kompasspeilung der Deckpeilung</span>
            <span className="font-mono tabular-nums">{formatBearing(observed, 0)}</span>
          </div>
          <Slider value={[observed]} min={110} max={136} step={1} onValueChange={([v]) => setObserved(v)} aria-label="Kompasspeilung" />
        </div>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Variation laut Karte</span>
            <span className="font-mono tabular-nums">{eastWest(variation)}</span>
          </div>
          <Slider value={[variation]} min={-8} max={8} step={1} onValueChange={([v]) => setVariation(v)} aria-label="Variation (Ost positiv)" />
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <Cell label="Gesamtfehler" value={eastWest(total)} />
          <Cell label="Variation" value={eastWest(variation)} />
          <Cell label="Deviation" value={eastWest(deviation)} highlight />
        </div>
        <p className="text-xs text-muted-foreground">
          Rechnung: Wahr ({formatBearing(trueBearing, 0)}) − Kompass ({formatBearing(observed, 0)}) = {signed(total)}. Positiv heißt Ost: Die Nadel steht östlich der wahren Richtung (zu kleine Kompasswerte). Deviation = Gesamtfehler − Variation = {signed(total)} − ({signed(variation)}) = {signed(deviation)}.
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Skizze einer Deckpeilung: Boot, vorderes und hinteres Zeichen in einer Linie">
        <line x1={boat.x} y1={boat.y} x2={rear.x} y2={rear.y} stroke="#e11d48" strokeWidth={2} strokeDasharray="5 3" />
        <circle cx={front.x} cy={front.y} r={5} fill="#fbbf24" stroke="#78350f" />
        <circle cx={rear.x} cy={rear.y} r={7} fill="#fbbf24" stroke="#78350f" />
        <text x={front.x - 8} y={front.y + 18} fontSize={10} textAnchor="end" fill="currentColor">vorderes Zeichen</text>
        <text x={rear.x - 10} y={rear.y + 16} fontSize={10} textAnchor="end" fill="currentColor">hinteres Zeichen</text>
        <path d={`M ${boat.x - 9} ${boat.y + 5} L ${boat.x + 9} ${boat.y + 5} L ${boat.x + 4} ${boat.y - 7} L ${boat.x - 6} ${boat.y - 7} Z`} fill="#f8fafc" stroke="#0f172a" />
        <text x={boat.x} y={boat.y + 20} fontSize={10} textAnchor="middle" fill="currentColor">Boot</text>
      </svg>
    </div>
  )
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg border px-2 py-2', highlight ? 'border-primary bg-primary/10' : 'bg-muted/50')}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ Peilung ↔ Gegenpeilung, Schnittwinkel */

export function BearingBasicsWidget() {
  const a = useNumberField('040', { min: 0, max: 360, bearing: true })
  const b = useNumberField('120', { min: 0, max: 360, bearing: true })
  const valid = fieldsValid(a, b)
  const cut = valid ? cutAngle(a.value!, b.value!) : 0
  const quality = cut >= 60 ? 'sehr gut' : cut >= 30 ? 'brauchbar' : 'unbrauchbar'
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">Die Peilung gilt <b>vom Boot zum Objekt</b>. Die Standlinie, auf der das Boot liegt, verläuft vom Objekt aus in Richtung der <b>Gegenpeilung</b> (± 180°).</p>
        <NumberField label="Peilung 1 (rechtweisend)" unit="°" field={a} />
        <NumberField label="Peilung 2 (rechtweisend)" unit="°" field={b} />
      </div>
      <div className="space-y-2 text-sm">
        {valid ? (
          <>
            <Row k="Standlinie 1 zeigt in Richtung" v={formatBearing(reciprocal(a.value!), 0)} />
            <Row k="Standlinie 2 zeigt in Richtung" v={formatBearing(reciprocal(b.value!), 0)} />
            <Row k="Schnittwinkel" v={`${f1(cut)}°`} />
            <p className={cn('rounded-lg border p-2', cut < 30 ? 'border-destructive/40 bg-destructive/5' : cut >= 60 ? 'border-success/40 bg-success/5' : 'bg-muted/40')}>
              Qualität des Schnitts: <b>{quality}</b>. Ideal sind Objekte im rechten Winkel zueinander (90°); unter 30° wird der Schnittpunkt sehr unsicher. Bei drei Objekten sollen die Peilungen etwa 60° auseinander liegen.
            </p>
          </>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-muted-foreground">Bitte gültige Peilungen eingeben.</p>
        )}
      </div>
    </div>
  )
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3 border-b py-1">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono font-semibold tabular-nums">{v}</span>
    </div>
  )
}
