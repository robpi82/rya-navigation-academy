import { useState } from 'react'
import { formatBearing, formatNumber, pilotagePlan, transitOffset, transitSeparation } from '@/calculations'
import { formatClockTime } from '@/calculations/dst'
import { SeaChart, type ChartOverlay } from '@/components/chart/SeaChart'
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

/* ------------------------------------------------------------------ Pilotage-Plan */

export const PILOTAGE_POINTS = [
  { name: 'Start (Fahrwasser vor Ankerstedt)', pos: { lat: 50.728, lon: -1.345 }, note: 'Auf 034° bis zur Ansteuerungstonne; Wassertiefe überall über 5 m' },
  { name: 'Ansteuerungstonne (LFl 10s)', pos: { lat: 50.765, lon: -1.305 }, note: 'Tonne an Backbord lassen, danach auf die Deckpeilung 000° gehen' },
  { name: 'Molenkopf', pos: { lat: 50.776, lon: -1.305 }, note: 'Leitlinie 000°: Kirche über Molenfeuer; Tiefe mindestens 2,5 m' },
  { name: 'Hafen Ankerstedt', pos: { lat: 50.781, lon: -1.305 }, note: 'Langsam, auf Verkehr im Hafen achten' },
]

export function PilotagePlanWidget() {
  const [speed, setSpeed] = useState(5)
  const [start, setStart] = useState(14)
  const plan = pilotagePlan(PILOTAGE_POINTS, speed, start)
  const overlays: ChartOverlay[] = [
    ...PILOTAGE_POINTS.slice(1).map((p, i) => ({ kind: 'line' as const, id: `leg-${i}`, from: PILOTAGE_POINTS[i].pos, to: p.pos, color: '#e11d48', width: 2.5, label: formatBearing(plan[i].bearing, 0) })),
    ...PILOTAGE_POINTS.map((p, i) => ({ kind: 'point' as const, id: `wp-${i}`, pos: p.pos, symbol: 'wp' as const, label: String(i) })),
  ]
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Für die Ansteuerung wird vorab ein Pilotage-Plan geschrieben: Teilstücke mit Kurs, Distanz und Zeit, an jedem Wendepunkt ein eindeutiges Merkmal (Tonne querab, Deckpeilung, Tiefenlinie) und Gefahrenpeilungen. Unterwegs bleibt keine Zeit zum Plotten – der Plan steht im Cockpit.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Fahrt über Grund" value={`${speed} kn`} min={3} max={8} step={0.5} v={speed} on={setSpeed} />
        <Slide label="Start" value={formatClockTime(start * 60).time} min={6} max={20} step={0.25} v={start} on={setStart} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <SeaChart overlays={overlays} showDiamonds={false} className="h-[42vh] min-h-72" focus={{ center: { lat: 50.755, lon: -1.325 }, halfSpanNm: 2.8 }} />
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-1 font-medium">Nach</th>
                <th className="pl-2 font-medium">Kurs</th>
                <th className="pl-2 font-medium">Distanz</th>
                <th className="pl-2 font-medium">Zeit</th>
                <th className="pl-2 font-medium">Uhrzeit</th>
              </tr>
            </thead>
            <tbody>
              {plan.map((l, i) => (
                <tr key={l.to} className="border-t align-top">
                  <td className="py-1.5">
                    <span className="font-medium">{i + 1}. {l.to}</span>
                    <span className="block text-xs text-muted-foreground">{PILOTAGE_POINTS[i].note}</span>
                  </td>
                  <td className="whitespace-nowrap pl-2 font-mono">{formatBearing(l.bearing, 0)}</td>
                  <td className="whitespace-nowrap pl-2 font-mono">{f1(l.distance)} NM</td>
                  <td className="whitespace-nowrap pl-2 font-mono">{Math.round(l.minutes)} min</td>
                  <td className="whitespace-nowrap pl-2 font-mono">{formatClockTime(l.eta * 60).time}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-muted-foreground">Kurse rechtweisend über Grund; für das Steuern Strom, Leeway und Kompassfehler berücksichtigen. Fiktives Übungsrevier.</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Leitlinie */

export function LeadingLineWidget() {
  const [offsetM, setOffsetM] = useState(60)
  const front = 0.6
  const rear = 1.2
  const offset = offsetM / 1852
  const sep = transitSeparation(offset, front, rear)
  const frontAngle = (Math.atan2(-offset, front) * 180) / Math.PI
  const rearAngle = (Math.atan2(-offset, rear) * 180) / Math.PI
  const observed = (frontAngle + 360) % 360
  const computed = transitOffset(observed, 0, front)
  const W = 320
  const H = 150
  const k = 40 // Pixel je Grad
  const fx = W / 2 + frontAngle * k
  const rx = W / 2 + rearAngle * k
  const side = Math.abs(offsetM) < 5 ? 'on' : offsetM > 0 ? 'stbd' : 'port'
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Zwei Zeichen hintereinander (vorderes niedriger und näher, hinteres höher und weiter weg) bilden eine Leitlinie, hier in 000°. Stehen sie genau übereinander, bist du auf der Linie. Weichst du seitlich ab, wandert das vordere Zeichen schneller zur Seite. Merksatz: <b>Dem vorderen Zeichen folgen.</b>
        </p>
        <Slide label="Seitlicher Versatz zur Leitlinie" value={`${Math.abs(offsetM)} m ${offsetM > 0 ? 'an Steuerbord' : offsetM < 0 ? 'an Backbord' : ''}`} min={-150} max={150} step={5} v={offsetM} on={setOffsetM} />
        <div className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="rounded-lg border bg-muted/50 px-3 py-2"><div className="text-[11px] text-muted-foreground">Peilung vorderes Zeichen</div><div className="font-mono font-semibold">{formatBearing(observed, 1)}</div></div>
          <div className="rounded-lg border bg-muted/50 px-3 py-2"><div className="text-[11px] text-muted-foreground">Winkel zwischen den Zeichen</div><div className="font-mono font-semibold">{f1(Math.abs(sep))}°</div></div>
        </div>
        <p className={cn('rounded-lg border p-3 text-sm', side === 'on' ? 'border-success/50 bg-success/5' : 'border-amber-500/50 bg-amber-500/5')}>
          {side === 'on'
            ? 'Die Zeichen stehen in Deckung – du bist auf der Leitlinie.'
            : `Das vordere Zeichen steht ${side === 'stbd' ? 'links' : 'rechts'} vom hinteren: Du bist ${f1(Math.abs(computed) * 1852)} m ${side === 'stbd' ? 'an Steuerbord' : 'an Backbord'} der Linie. Steuere nach ${side === 'stbd' ? 'Backbord' : 'Steuerbord'} – dem vorderen Zeichen nach –, bis die Zeichen wieder in Deckung sind.`}
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-gradient-to-b from-sky-200 to-sky-50 dark:from-slate-800 dark:to-slate-700" role="img" aria-label="Blick voraus auf die beiden Zeichen der Leitlinie">
        <rect x={0} y={H * 0.62} width={W} height={H * 0.38} fill="#0ea5e9" fillOpacity={0.35} />
        <line x1={0} y1={H * 0.62} x2={W} y2={H * 0.62} stroke="#0369a1" strokeOpacity={0.5} />
        <line x1={W / 2} y1={8} x2={W / 2} y2={H - 6} stroke="currentColor" strokeOpacity={0.25} strokeDasharray="3 3" />
        <text x={W / 2 + 4} y={16} fontSize={9} fill="currentColor" fillOpacity={0.6}>000° voraus</text>
        <rect x={rx - 5} y={H * 0.62 - 58} width={10} height={58} fill="#f97316" stroke="#7c2d12" />
        <polygon points={`${rx - 9},${H * 0.62 - 58} ${rx + 9},${H * 0.62 - 58} ${rx},${H * 0.62 - 72}`} fill="#7c2d12" />
        <rect x={fx - 7} y={H * 0.62 - 40} width={14} height={40} fill="#fde047" stroke="#854d0e" />
        <text x={fx} y={H * 0.62 + 14} fontSize={9} textAnchor="middle" fill="currentColor">vorn</text>
        <text x={rx} y={H * 0.62 - 76} fontSize={9} textAnchor="middle" fill="currentColor">hinten</text>
      </svg>
    </div>
  )
}
