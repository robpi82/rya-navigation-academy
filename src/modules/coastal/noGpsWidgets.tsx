import { useState } from 'react'
import { abeamDistance, distanceOffFromBowAngles, epErrorRadius, formatNumber, reduceSounding } from '@/calculations'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'

const f1 = (n: number) => formatNumber(n, 1)
const rad = (d: number) => (d * Math.PI) / 180

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

/* ------------------------------------------------------------------ Abstand aus zwei Bugwinkeln */

export function BowAngleWidget() {
  const [a1, setA1] = useState(30)
  const [a2, setA2] = useState(60)
  const [speed, setSpeed] = useState(6)
  const [minutes, setMinutes] = useState(20)
  const run = (speed * minutes) / 60
  const d2 = distanceOffFromBowAngles(a1, a2, run)
  const abeam = abeamDistance(a1, a2, run)
  const preset = (x: number, y: number) => {
    setA1(x)
    setA2(y)
  }
  // Skizze: Kurs nach oben, P2 im Ursprung, Marke an Steuerbord
  const mark = d2 === null ? null : { x: d2 * Math.sin(rad(a2)), y: d2 * Math.cos(rad(a2)) }
  const pts = [{ x: 0, y: -run }, { x: 0, y: 0 }, ...(mark ? [mark, { x: 0, y: mark.y }] : [])]
  const minX = Math.min(...pts.map((p) => p.x)) - 0.3
  const maxX = Math.max(...pts.map((p) => p.x)) + 0.3
  const minY = Math.min(...pts.map((p) => p.y)) - 0.3
  const maxY = Math.max(...pts.map((p) => p.y)) + 0.3
  const W = 240
  const H = 240
  const k = Math.min((W - 30) / (maxX - minX), (H - 30) / (maxY - minY))
  const sx = (x: number) => 15 + (x - minX) * k
  const sy = (y: number) => H - 15 - (y - minY) * k
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Ohne GPS reicht eine einzige Marke: Peile sie zweimal relativ zum Bug, miss die Zeit dazwischen. Verdoppelt sich der Bugwinkel (z. B. 30° → 60°), ist der Abstand bei der zweiten Peilung gleich der gelaufenen Strecke. Bei 45° → 90° (Vierstrichpeilung) ist die Strecke gleich dem Passierabstand querab.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={() => preset(30, 60)}>
            Verdoppelung 30° → 60°
          </Button>
          <Button variant="outline" size="sm" onClick={() => preset(45, 90)}>
            Vierstrich 45° → 90°
          </Button>
          <Button variant="outline" size="sm" onClick={() => preset(22.5, 45)}>
            22,5° → 45°
          </Button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slide label="1. Bugwinkel" value={`${f1(a1)}°`} min={10} max={80} step={2.5} v={a1} on={(n) => {
              setA1(n)
              if (n >= a2) setA2(Math.min(170, n + 10))
            }} />
          <Slide label="2. Bugwinkel" value={`${f1(a2)}°`} min={20} max={170} step={2.5} v={a2} on={(n) => setA2(Math.max(n, a1 + 5))} />
          <Slide label="Fahrt über Grund" value={`${f1(speed)} kn`} min={2} max={10} step={0.5} v={speed} on={setSpeed} />
          <Slide label="Zeit zwischen den Peilungen" value={`${minutes} min`} min={5} max={60} step={5} v={minutes} on={setMinutes} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <Tile label="gelaufen" value={`${f1(run)} NM`} />
          <Tile label="Abstand bei 2. Peilung" value={d2 === null ? '–' : `${f1(d2)} NM`} />
          <Tile label="Passierabstand querab" value={abeam === null ? '–' : a2 > 90 ? 'schon passiert' : `${f1(abeam)} NM`} />
        </div>
        <p className="text-xs text-muted-foreground">d₂ = Strecke · sin α₁ / sin(α₂ − α₁); querab = d₂ · sin α₂. Voraussetzung: Kurs und Fahrt über Grund bleiben gleich – Strom verfälscht das Ergebnis.</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Skizze: Kurslinie mit zwei Peilungen zur Marke">
        <line x1={sx(0)} y1={sy(minY)} x2={sx(0)} y2={sy(maxY)} stroke="#0f172a" strokeDasharray="5 4" />
        {mark && (
          <>
            <line x1={sx(0)} y1={sy(-run)} x2={sx(mark.x)} y2={sy(mark.y)} stroke="#0284c7" strokeWidth={1.5} />
            <line x1={sx(0)} y1={sy(0)} x2={sx(mark.x)} y2={sy(mark.y)} stroke="#e11d48" strokeWidth={1.5} />
            {a2 <= 90 && <line x1={sx(0)} y1={sy(mark.y)} x2={sx(mark.x)} y2={sy(mark.y)} stroke="var(--success)" strokeWidth={1.5} strokeDasharray="3 3" />}
            <path d={`M ${sx(mark.x)} ${sy(mark.y) - 8} L ${sx(mark.x) - 5} ${sy(mark.y) + 4} L ${sx(mark.x) + 5} ${sy(mark.y) + 4} Z`} fill="#a16207" />
            <text x={sx(mark.x)} y={sy(mark.y) + 16} fontSize={9} textAnchor="middle" fill="currentColor">Marke</text>
          </>
        )}
        <circle cx={sx(0)} cy={sy(-run)} r={4} fill="#0284c7" />
        <circle cx={sx(0)} cy={sy(0)} r={4} fill="#e11d48" />
        <text x={sx(0) - 6} y={sy(-run) + 4} fontSize={9} textAnchor="end" fill="currentColor">1.</text>
        <text x={sx(0) - 6} y={sy(0) + 4} fontSize={9} textAnchor="end" fill="currentColor">2.</text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Fehlerkreis des Koppelorts */

export function EpErrorWidget() {
  const [run, setRun] = useState(20)
  const [pct, setPct] = useState(10)
  const [danger, setDanger] = useState(1.5)
  const r = epErrorRadius(run, pct / 100)
  const inside = danger <= r
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ein Koppelort ist nur so gut wie Kurs, Fahrt, Strom und Abdrift, mit denen er gerechnet wurde. Als Richtwert wächst die Unsicherheit mit etwa 10 % der seit dem letzten sicheren Ort gelaufenen Strecke. Liegt eine Gefahr innerhalb dieses Kreises, ist der Kurs nicht sicher.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slide label="Seit dem letzten Fix gelaufen" value={`${run} NM`} min={1} max={60} step={1} v={run} on={setRun} />
        <Slide label="Unsicherheit" value={`${pct} %`} min={5} max={20} step={1} v={pct} on={setPct} />
        <Slide label="Abstand der Kurslinie zur Gefahr" value={`${f1(danger)} NM`} min={0.5} max={8} step={0.5} v={danger} on={setDanger} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Tile label="Radius des Fehlerkreises" value={`${f1(r)} NM`} />
        <Tile label="Gefahr" value={inside ? 'im Fehlerkreis' : 'außerhalb'} tone={inside ? 'bad' : 'ok'} />
      </div>
      <p className={cn('rounded-lg border p-3 text-sm', inside ? 'border-destructive/40 bg-destructive/5' : 'border-success/40 bg-success/5')}>
        {inside
          ? 'Die Gefahr liegt innerhalb der Unsicherheit: Abstand vergrößern oder den Ort neu bestimmen (Peilungen, Lotung, Leitlinie), bevor du weiterfährst.'
          : 'Ausreichend Abstand. Trotzdem: Je länger ohne Fix, desto größer der Kreis – frühzeitig neu bestimmen.'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Lotung und Tiefenlinie */

export function SoundingWidget() {
  const [shown, setShown] = useState(11.5)
  const [transducer, setTransducer] = useState(0.5)
  const [hot, setHot] = useState(2)
  const [contour, setContour] = useState<'5' | '10' | '20'>('10')
  const reduced = reduceSounding(shown, transducer, hot)
  const target = Number(contour)
  const where = reduced > target + 1 ? 'deeper' : reduced < target - 1 ? 'shallower' : 'on'
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Eine ausgeprägte Tiefenlinie ist eine Standlinie: Wer ihr folgt, weiß zumindest, auf welcher Linie er sich befindet. Dazu muss die Lotung auf Kartennull reduziert werden – Echolot plus Tiefe des Gebers, minus Höhe der Gezeit.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slide label="Echolot zeigt" value={`${f1(shown)} m`} min={1} max={30} step={0.5} v={shown} on={setShown} />
        <Slide label="Geber unter der Wasserlinie" value={`${f1(transducer)} m`} min={0} max={1.5} step={0.1} v={transducer} on={setTransducer} />
        <Slide label="Höhe der Gezeit" value={`${f1(hot)} m`} min={0} max={8} step={0.1} v={hot} on={setHot} />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium">Ziel: der Tiefenlinie folgen</span>
        <Toggle value={contour} onChange={setContour} label="Tiefenlinie" options={[{ value: '5', label: '5 m' }, { value: '10', label: '10 m' }, { value: '20', label: '20 m' }]} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Tile label="Tiefe über Kartennull" value={`${f1(reduced)} m`} />
        <Tile label={`zur ${contour}-m-Linie`} value={where === 'on' ? 'auf der Linie' : where === 'deeper' ? 'seewärts (tiefer)' : 'landwärts (flacher)'} tone={where === 'shallower' ? 'bad' : where === 'on' ? 'ok' : undefined} />
      </div>
      <p className="text-xs text-muted-foreground">Eine einzelne Lotung ergibt keinen Ort. Eine Lotreihe entlang des Kurses – mit Zeit und Strecke notiert und mit der Karte verglichen – kann ihn eingrenzen. Seewärts heißt hier: auf der tieferen Seite der Linie.</p>
    </div>
  )
}
