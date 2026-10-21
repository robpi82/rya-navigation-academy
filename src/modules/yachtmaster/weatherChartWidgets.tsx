import { useState } from 'react'
import { angleDifference, formatBearing, formatNumber, geostrophicWind, gradientWind, surfaceWindFrom, surfaceWindSpeed } from '@/calculations'
import { beaufortFromKnots } from '@/calculations/weather'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { DEPRESSION_STEPS } from '@/data/weatherCharts'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'
import { OrderExercise } from '@/modules/daylessons/safetyWidgets'

const f0 = (n: number) => formatNumber(n, 0)

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

function Tile({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', strong ? 'border-primary bg-accent' : 'bg-muted/50')}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ Wind aus dem Isobarenabstand */

export function IsobarWindWidget() {
  const [spacing, setSpacing] = useState(100)
  const [lat, setLat] = useState(50)
  const [system, setSystem] = useState<'straight' | 'low' | 'high'>('straight')
  const [radius, setRadius] = useState(400)
  const vg = geostrophicWind(4, spacing, lat)
  const curved = system === 'straight' ? vg : gradientWind(vg, radius, lat, system)
  const surface = curved === null ? null : surfaceWindSpeed(curved)
  // Skizze: fünf Isobaren im Abstand (Pixel ∝ NM)
  const gap = Math.max(8, Math.min(40, spacing / 6))
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Auf Bodendruckkarten liegen die Isobaren meist 4 hPa auseinander. Je enger sie liegen, desto stärker der Wind – und bei gleichem Abstand weht es in niedrigen Breiten stärker als in hohen. Über See ist der Bodenwind wegen der Reibung etwa drei Viertel davon und um rund 15° zum Tief hin gedreht.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slide label="Abstand zweier Isobaren (4 hPa)" value={`${spacing} NM`} min={30} max={300} step={5} v={spacing} on={setSpacing} />
          <Slide label="Geografische Breite" value={`${lat}° N`} min={30} max={65} step={1} v={lat} on={setLat} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Toggle value={system} onChange={setSystem} label="Verlauf der Isobaren" options={[{ value: 'straight', label: 'gerade' }, { value: 'low', label: 'um ein Tief' }, { value: 'high', label: 'um ein Hoch' }]} />
          {system !== 'straight' && <div className="min-w-48 flex-1"><Slide label="Krümmungsradius" value={`${radius} NM`} min={100} max={1500} step={50} v={radius} on={setRadius} /></div>}
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
          <Tile label="geostrophisch" value={`${f0(vg)} kn`} />
          <Tile label={system === 'straight' ? 'gerade Isobaren' : 'mit Krümmung'} value={curved === null ? 'nicht möglich' : `${f0(curved)} kn`} />
          <Tile label="Bodenwind über See" value={surface === null ? '–' : `${f0(surface)} kn`} strong />
          <Tile label="Beaufort" value={surface === null ? '–' : `${beaufortFromKnots(surface)} Bft`} strong />
        </div>
        <p className="text-xs text-muted-foreground">
          {system === 'low'
            ? 'Um ein Tief ist der Wind schwächer als nach dem Isobarenabstand zu erwarten – die Krümmung „bremst“.'
            : system === 'high'
              ? curved === null
                ? 'So enge Isobaren bei so starker Krümmung gibt es um ein Hoch nicht – Hochs haben weite Isobaren und meist schwachen Wind.'
                : 'Um ein Hoch ist der Wind etwas stärker als nach dem Isobarenabstand zu erwarten.'
              : 'V = Δp / (ρ · f · Δn) mit f = 2 Ω sin φ. Böen können deutlich darüber liegen.'}
        </p>
      </div>
      <svg viewBox="0 0 200 200" className="h-auto w-full max-w-[220px] justify-self-center rounded-lg border bg-card" role="img" aria-label={`Isobaren im Abstand von ${spacing} Seemeilen`}>
        {[0, 1, 2, 3, 4].map((i) => {
          const y = 100 + (i - 2) * gap
          return (
            <g key={i}>
              <line x1={10} y1={y} x2={190} y2={y} stroke="currentColor" strokeWidth={1} opacity={0.6} />
              <text x={12} y={y - 2} fontSize={8} fill="currentColor" opacity={0.7}>
                {1000 + (i - 2) * 4}
              </text>
            </g>
          )
        })}
        <text x={100} y={14} fontSize={10} textAnchor="middle" fill="currentColor">T (tiefer Druck)</text>
        <text x={100} y={194} fontSize={10} textAnchor="middle" fill="currentColor">H (hoher Druck)</text>
        <defs>
          <marker id="isoArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
          </marker>
        </defs>
        <line x1={50} y1={100 + gap / 2} x2={150} y2={100 + gap / 2 - 14} stroke="#0284c7" strokeWidth={3} markerEnd="url(#isoArrow)" />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Windrichtung um Tief und Hoch */

const DIRS = [
  { label: 'N', deg: 0 },
  { label: 'NO', deg: 45 },
  { label: 'O', deg: 90 },
  { label: 'SO', deg: 135 },
  { label: 'S', deg: 180 },
  { label: 'SW', deg: 225 },
  { label: 'W', deg: 270 },
  { label: 'NW', deg: 315 },
]

export function WindAroundSystemWidget() {
  const [system, setSystem] = useState<'low' | 'high'>('low')
  const [point, setPoint] = useState(0)
  const [answer, setAnswer] = useState<number | null>(null)
  const correct = surfaceWindFrom(point, system)
  const ok = answer !== null && Math.abs(angleDifference(answer, correct)) <= 35
  const next = () => {
    setPoint((p) => (p + 135) % 360)
    setAnswer(null)
  }
  const C = 110
  const pos = (b: number, r: number) => ({ x: C + Math.sin((b * Math.PI) / 180) * r, y: C - Math.cos((b * Math.PI) / 180) * r })
  const arrow = (b: number) => {
    const p = pos(b, 72)
    const to = surfaceWindFrom(b, system) + 180
    const d = { x: Math.sin((to * Math.PI) / 180) * 16, y: -Math.cos((to * Math.PI) / 180) * 16 }
    return { x1: p.x - d.x, y1: p.y - d.y, x2: p.x + d.x, y2: p.y + d.y }
  }
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Nordhalbkugel: Um ein Tief weht der Wind gegen den Uhrzeigersinn, um ein Hoch im Uhrzeigersinn – über See um rund 15° zum Tief hin bzw. aus dem Hoch heraus gedreht. Aus welcher Richtung weht der Wind am markierten Ort?
        </p>
        <Toggle
          value={system}
          onChange={(s) => {
            setSystem(s)
            setAnswer(null)
          }}
          label="Druckgebilde"
          options={[{ value: 'low', label: 'Tief (T)' }, { value: 'high', label: 'Hoch (H)' }]}
        />
        <div className="grid grid-cols-4 gap-2">
          {DIRS.map((d) => (
            <Button key={d.label} variant={answer === d.deg ? 'default' : 'outline'} size="sm" onClick={() => setAnswer(d.deg)} aria-pressed={answer === d.deg}>
              aus {d.label}
            </Button>
          ))}
        </div>
        {answer !== null && (
          <p role="status" className={cn('rounded-lg border p-3 text-sm', ok ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
            {ok ? 'Richtig. ' : 'Nicht ganz. '}
            Der Ort liegt {DIRS.find((d) => d.deg === point)?.label ?? ''} vom {system === 'low' ? 'Tief' : 'Hoch'}; parallel zu den Isobaren käme der Wind aus {formatBearing(surfaceWindFrom(point, system, 0), 0)}, durch die Reibung über See aus etwa {formatBearing(correct, 0)}.
          </p>
        )}
        <Button variant="ghost" size="sm" onClick={next}>
          Nächster Ort
        </Button>
      </div>
      <svg viewBox="0 0 220 220" className="h-auto w-full max-w-[240px] justify-self-center rounded-lg border bg-card" role="img" aria-label={`${system === 'low' ? 'Tief' : 'Hoch'} mit Isobaren und markiertem Ort`}>
        <defs>
          <marker id="sysArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
          </marker>
        </defs>
        {[30, 55, 80, 100].map((r) => (
          <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="currentColor" opacity={0.35} />
        ))}
        <text x={C} y={C + 6} fontSize={18} fontWeight={700} textAnchor="middle" fill={system === 'low' ? '#e11d48' : '#0284c7'}>
          {system === 'low' ? 'T' : 'H'}
        </text>
        <text x={C} y={12} fontSize={9} textAnchor="middle" fill="currentColor">N</text>
        {answer !== null &&
          DIRS.map((d) => {
            const a = arrow(d.deg)
            return <line key={d.deg} {...a} stroke="#0284c7" strokeWidth={2} markerEnd="url(#sysArrow)" opacity={d.deg === point ? 1 : 0.45} />
          })}
        <circle cx={pos(point, 72).x} cy={pos(point, 72).y} r={7} fill="none" stroke="#e11d48" strokeWidth={2.5} />
      </svg>
    </div>
  )
}

export function DepressionOrderWidget() {
  return <OrderExercise steps={DEPRESSION_STEPS} intro="Ein Tief zieht über dich hinweg. Bringe die Beobachtungen in die richtige Reihenfolge – vom ersten Cirrus bis zur Rückseite." />
}
