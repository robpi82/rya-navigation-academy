import { useState } from 'react'
import { climb, formatNumber, heightCosine, lineLength, verticalGap } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { MOORING_STEPS } from '@/data/mooring'
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

export function MooringLinesWidget() {
  const [hours, setHours] = useState(0)
  const [range, setRange] = useState(4)
  const [springLen, setSpringLen] = useState(10)
  const lw = 0.8
  const hw = lw + range
  const quay = 6.5 // Pierkante über Kartennull
  const bollard = 6.5
  const freeboard = 1.0
  const breastLen = 2.5
  const tide = heightCosine(hw, lw, hours)
  const lines = [
    { name: 'Querleine (kurz)', horizontal: breastLen },
    { name: 'Spring (lang)', horizontal: springLen },
  ].map((l) => {
    const atHw = lineLength(l.horizontal, verticalGap(bollard, hw, freeboard))
    const atLw = lineLength(l.horizontal, verticalGap(bollard, lw, freeboard))
    const now = lineLength(l.horizontal, verticalGap(bollard, tide, freeboard))
    return { ...l, atHw, atLw, now, extra: atLw - atHw }
  })
  const up = climb(quay, tide, freeboard)

  // Seitenansicht: Pier rechts, Boot links, Querleine
  const W = 280
  const H = 220
  const mPx = 22
  const yOf = (h: number) => H - 20 - h * mPx * 0.45 * 2
  const quayX = 190
  const boatRight = quayX - 8
  const waterY = yOf(tide)
  const cleat = { x: boatRight - 10, y: yOf(tide + freeboard) }
  const bol = { x: quayX + 10, y: yOf(bollard) }
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_280px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Pier 6,5 m über Kartennull, Niedrigwasser 0,8 m. Das Boot steigt und fällt mit dem Wasser, der Poller bleibt, wo er ist. Eine kurze Querleine müsste deshalb ständig nachgestellt werden; lange Springs machen den Tidenhub fast von selbst mit.
        </p>
        <Slide label="Zeit nach Hochwasser" value={`${f1(hours)} h`} min={0} max={6} step={0.5} v={hours} on={setHours} />
        <Slide label="Tidenhub" value={`${f1(range)} m`} min={1} max={7} step={0.5} v={range} on={setRange} />
        <Slide label="Horizontale Länge der Spring" value={`${springLen} m`} min={4} max={20} step={1} v={springLen} on={setSpringLen} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[380px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-1 font-medium">Leine</th>
                <th className="pl-2 font-medium">bei HW</th>
                <th className="pl-2 font-medium">jetzt</th>
                <th className="pl-2 font-medium">bei NW</th>
                <th className="pl-2 font-medium">nachstellen</th>
              </tr>
            </thead>
            <tbody className="font-mono tabular-nums">
              {lines.map((l) => (
                <tr key={l.name} className="border-t">
                  <td className="py-1 font-sans">{l.name}</td>
                  <td className="pl-2">{f1(l.atHw)} m</td>
                  <td className="pl-2">{f1(l.now)} m</td>
                  <td className="pl-2">{f1(l.atLw)} m</td>
                  <td className={cn('pl-2 font-semibold', l.extra > 1.5 ? 'text-destructive' : l.extra > 0.5 ? 'text-amber-600 dark:text-amber-400' : 'text-success')}>+{f1(l.extra)} m</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm">
          Höhe der Gezeit jetzt: <b className="font-mono">{f1(tide)} m</b> · {up > 0.3 ? <>Pierkante <b className="font-mono">{f1(up)} m</b> über dem Deck – {up > 1.5 ? 'nur mit Leiter erreichbar.' : 'Aufstieg möglich.'}</> : 'Pierkante etwa auf Deckshöhe.'}
        </p>
        <p className="text-xs text-muted-foreground">Leinen, die bei Hochwasser straff belegt werden, würden das Boot bei fallendem Wasser „aufhängen". Vereinfacht: Kosinus-Tidenkurve, Klampe {f1(freeboard)} m über Wasser, Querleine 2,5 m horizontal.</p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-sky-50 dark:bg-slate-800" role="img" aria-label="Seitenansicht: Boot an der Pier mit Querleine bei der gewählten Gezeitenhöhe">
        <rect x={0} y={waterY} width={W} height={H - waterY} fill="#38bdf8" fillOpacity={0.45} />
        <rect x={quayX} y={yOf(quay)} width={W - quayX} height={H - yOf(quay)} fill="#94a3b8" stroke="#475569" />
        <line x1={0} y1={yOf(0)} x2={quayX} y2={yOf(0)} stroke="#0f172a" strokeOpacity={0.4} strokeDasharray="4 3" />
        <text x={4} y={yOf(0) - 3} fontSize={8} fill="currentColor" fillOpacity={0.7}>Kartennull</text>
        <path d={`M ${boatRight - 120} ${waterY - 22} L ${boatRight} ${waterY - 22} L ${boatRight - 6} ${waterY + 12} L ${boatRight - 110} ${waterY + 12} Z`} fill="#f8fafc" stroke="#0f172a" />
        <line x1={boatRight - 70} y1={waterY - 22} x2={boatRight - 70} y2={Math.max(4, waterY - 110)} stroke="#0f172a" strokeWidth={2} />
        <rect x={bol.x - 4} y={bol.y - 8} width={8} height={8} fill="#1e293b" />
        <line x1={cleat.x} y1={cleat.y} x2={bol.x} y2={bol.y - 4} stroke="#e11d48" strokeWidth={2} />
        <circle cx={cleat.x} cy={cleat.y} r={2.5} fill="#e11d48" />
        <text x={quayX + 4} y={yOf(quay) + 14} fontSize={9} fill="#0f172a">Pier</text>
        <text x={6} y={14} fontSize={9} fill="currentColor">Höhe der Gezeit {f1(tide)} m</text>
      </svg>
    </div>
  )
}

export function MooringOrderWidget() {
  return <OrderExercise steps={MOORING_STEPS} intro="Du läufst in einen Tidenhafen ein und legst längsseits an einer Pier an. Bringe die Schritte in eine sinnvolle Reihenfolge." />
}
