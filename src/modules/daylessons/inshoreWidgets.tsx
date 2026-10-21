import { useState } from 'react'
import { formatBearing, formatNumber, sectorColor } from '@/calculations'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ENTRANCE_SECTORS, FOG_STEPS, PORT_SIGNALS } from '@/data/inshore'
import { cn } from '@/lib/utils'
import { OrderExercise } from './safetyWidgets'

const COLOR: Record<'W' | 'R' | 'G', { fill: string; name: string }> = {
  W: { fill: '#fde68a', name: 'weiß' },
  R: { fill: '#ef4444', name: 'rot' },
  G: { fill: '#22c55e', name: 'grün' },
}

/* ------------------------------------------------------------------ Sektorenfeuer */

export function SectorLightWidget() {
  // Boot 3 NM vor dem Feuer auf der Einfahrtslinie (Mitte des weißen Sektors, 096°), seitlich versetzt (NM, positiv = nördlich)
  const [offset, setOffset] = useState(0)
  const distance = 3
  const LINE = 96
  const rad = (d: number) => (d * Math.PI) / 180
  const boatE = distance * Math.sin(rad(LINE + 180)) + offset * Math.sin(rad(LINE - 90))
  const boatN = distance * Math.cos(rad(LINE + 180)) + offset * Math.cos(rad(LINE - 90))
  const b = ((Math.atan2(-boatE, -boatN) * 180) / Math.PI + 360) % 360 // Peilung vom Boot zum Feuer
  const col = sectorColor(b, ENTRANCE_SECTORS)
  // Skizze: Feuer rechts, Sektoren als Keile nach Westen
  const L = { x: 280, y: 110 }
  const R = 250
  const wedge = (from: number, to: number) => {
    // Sektorgrenzen sind Peilungen ZUM Feuer – gezeichnet wird die Gegenrichtung vom Feuer aus
    const p = (a: number) => ({ x: L.x + Math.sin(((a + 180) * Math.PI) / 180) * R, y: L.y - Math.cos(((a + 180) * Math.PI) / 180) * R })
    const a = p(from)
    const c = p(to)
    return `M ${L.x} ${L.y} L ${a.x} ${a.y} A ${R} ${R} 0 0 1 ${c.x} ${c.y} Z`
  }
  const boat = { x: L.x + boatE * 80, y: L.y - boatN * 80 }
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ein Sektorenfeuer zeigt in der sicheren Einfahrt weiß, links und rechts davon farbig. Die Sektorgrenzen stehen in der Seekarte als Peilung von See zum Feuer. Hier gilt: zu weit nach Steuerbord (südlich) = grün, zu weit nach Backbord (nördlich) = rot. Welche Farbe wo liegt, steht immer in der Karte.
      </p>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Versatz quer zur Einfahrt</span>
          <span className="font-mono">{Math.abs(offset) < 0.001 ? 'auf der Einfahrtslinie' : `${formatNumber(Math.abs(offset), 2)} NM ${offset > 0 ? 'nördlich' : 'südlich'}`}</span>
        </div>
        <Slider value={[offset]} min={-0.9} max={0.9} step={0.05} onValueChange={([n]) => setOffset(n)} aria-label="Versatz quer zur Einfahrt" />
      </div>
      <svg viewBox="0 0 320 220" className="h-auto w-full max-w-xl rounded-lg border bg-[#0b1f3b]" role="img" aria-label={`Sektorenfeuer, gesehen in ${col ? COLOR[col].name : 'keiner Farbe'}`}>
        {ENTRANCE_SECTORS.map((s) => (
          <path key={s.color} d={wedge(s.from, s.to)} fill={COLOR[s.color].fill} opacity={0.28} />
        ))}
        <line x1={L.x} y1={L.y} x2={L.x + Math.sin(rad(LINE + 180)) * 260} y2={L.y - Math.cos(rad(LINE + 180)) * 260} stroke="#fde68a" strokeDasharray="4 4" opacity={0.6} />
        <circle cx={L.x} cy={L.y} r={6} fill={col ? COLOR[col].fill : '#475569'} stroke="white" />
        <text x={L.x - 8} y={L.y + 20} fontSize={9} fill="white">Feuer</text>
        <path d={`M ${boat.x + 8} ${boat.y} L ${boat.x - 6} ${boat.y - 5} L ${boat.x - 6} ${boat.y + 5} Z`} fill="white" />
        <text x={8} y={14} fontSize={9} fill="white">N ↑</text>
      </svg>
      <p role="status" className={cn('rounded-lg border p-3 text-sm', col === 'W' ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
        Peilung zum Feuer {formatBearing(b, 0)}: du siehst <span className="font-semibold">{col ? COLOR[col].name : 'kein Licht'}</span>.{' '}
        {col === 'W' ? 'Du bist im sicheren Sektor.' : col === 'R' ? 'Zu weit nördlich (Backbordseite) – nach Steuerbord zurück ins Weiß.' : col === 'G' ? 'Zu weit südlich (Steuerbordseite) – nach Backbord zurück ins Weiß.' : 'Außerhalb der Sektoren – Position prüfen.'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Hafensignale */

export function PortSignalsWidget() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<string | null>(null)
  const s = PORT_SIGNALS[i % PORT_SIGNALS.length]
  return (
    <div className="grid gap-4 sm:grid-cols-[auto_minmax(0,1fr)]">
      <div className="flex flex-col items-center gap-2 rounded-lg bg-[#0b1f3b] p-4" role="img" aria-label={`Drei ${s.lights[0] === 'R' ? 'rote' : 'grüne'} Lichter senkrecht übereinander, ${s.flashing ? 'blinkend' : 'fest'}`}>
        {s.lights.map((c, k) => (
          <span key={k} className={cn('size-7 rounded-full', c === 'R' ? 'bg-red-500' : 'bg-green-500', s.flashing && 'animate-pulse')} />
        ))}
        <span className="text-[11px] text-white/80">{s.flashing ? 'blinkend' : 'fest'}</span>
      </div>
      <div className="min-w-0 space-y-2">
        <p className="text-sm text-muted-foreground">Was bedeutet dieses Signal an der Hafeneinfahrt? (Internationale Hafensignale, vereinfacht)</p>
        {PORT_SIGNALS.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPick(o.id)}
            aria-pressed={pick === o.id}
            className={cn('block w-full rounded-lg border px-3 py-2 text-left text-sm', pick === o.id ? (o.id === s.id ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10') : 'hover:bg-muted')}
          >
            {o.meaning}
          </button>
        ))}
        {pick && (
          <p role="status" className="text-sm">
            {pick === s.id ? 'Richtig.' : `Nicht ganz – richtig ist: ${s.meaning}`}
          </p>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            setI((n) => n + 1)
            setPick(null)
          }}
        >
          Nächstes Signal
        </Button>
      </div>
    </div>
  )
}

export function FogOrderWidget() {
  return <OrderExercise steps={FOG_STEPS} intro="Auf einem Küstentörn zieht Nebel auf. Bringe die ersten Maßnahmen in eine sinnvolle Reihenfolge." />
}
