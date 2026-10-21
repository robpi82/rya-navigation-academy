import { useState } from 'react'
import { datumDriftNm, distanceAwayM, expandingSquareLegs, expandingSquareLength, formatNumber, rescueHours, searchMinutes, sectorSearchLength } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { ABANDON_STEPS } from '@/data/offshoreEmergency'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'
import { OrderExercise } from '@/modules/daylessons/safetyWidgets'

const f1 = (n: number) => formatNumber(n, 1)
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

function Tile({ label, value, tone }: { label: string; value: string; tone?: 'ok' | 'bad' }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', tone === 'bad' ? 'border-destructive bg-destructive/10' : tone === 'ok' ? 'border-success bg-success/10' : 'bg-muted/50')}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono font-semibold">{value}</div>
    </div>
  )
}

/* ------------------------------------------------------------------ Mensch über Bord: Sekunden zählen */

export function MobDriftWidget() {
  const [speed, setSpeed] = useState(7)
  const [reaction, setReaction] = useState(20)
  const [current, setCurrent] = useState(1)
  const [minutes, setMinutes] = useState(30)
  const away = distanceAwayM(speed, reaction)
  const drift = datumDriftNm(current, minutes)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Nachts und bei Seegang verliert man einen Kopf im Wasser nach wenigen Bootslängen aus den Augen. Jede Sekunde bis zur Reaktion vergrößert den Abstand. Später kommt der Strom dazu: Die MOB-Taste speichert den Ort über Grund – die Person treibt aber mit dem Wasser weiter, genau wie das Boot.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Fahrt" value={`${f1(speed)} kn`} min={2} max={12} step={0.5} v={speed} on={setSpeed} />
        <Slide label="Zeit bis zur Reaktion" value={`${reaction} s`} min={5} max={120} step={5} v={reaction} on={setReaction} />
        <Slide label="Strom" value={`${f1(current)} kn`} min={0} max={3} step={0.25} v={current} on={setCurrent} />
        <Slide label="Zeit im Wasser" value={`${minutes} min`} min={5} max={120} step={5} v={minutes} on={setMinutes} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3">
        <Tile label="Abstand bei Reaktion" value={`${f0(away)} m`} tone={away > 100 ? 'bad' : undefined} />
        <Tile label="Bootslängen (12 m)" value={f0(away / 12)} />
        <Tile label="Versatz vom MOB-Punkt" value={drift >= 0.1 ? `${f1(drift)} NM` : `${f0(drift * 1852)} m`} />
      </div>
      <p className="text-xs text-muted-foreground">
        Sofort: rufen, Rettungsmittel werfen, einen Ausguck bestimmen, der nur zeigt, MOB-Taste drücken. Unter Segeln wendet man sofort (Quick-Stop) und bleibt nah dran; der Williamson-Turn bringt ein Fahrzeug unter Maschine auf das eigene Kielwasser zurück. Bei langer Suche den Strom einrechnen: Person und Boot treiben gemeinsam, der gespeicherte Punkt nicht.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Suchmuster */

export function SearchPatternWidget() {
  const [pattern, setPattern] = useState<'square' | 'sector'>('square')
  const [spacing, setSpacing] = useState(0.2)
  const [legs, setLegs] = useState(10)
  const [radius, setRadius] = useState(0.5)
  const [speed, setSpeed] = useState(5)
  const length = pattern === 'square' ? expandingSquareLength(spacing, legs) : sectorSearchLength(radius)
  // Skizze
  const pts: { x: number; y: number }[] = [{ x: 0, y: 0 }]
  if (pattern === 'square') {
    const dirs = [
      [0, 1],
      [1, 0],
      [0, -1],
      [-1, 0],
    ]
    expandingSquareLegs(1, legs).forEach((l, i) => {
      const p = pts[pts.length - 1]
      const [dx, dy] = dirs[i % 4]
      pts.push({ x: p.x + dx * l, y: p.y + dy * l })
    })
  } else {
    // drei Dreiecke: hinaus R, 120° rechts, R quer, 120° rechts zurück über das Datum – dort geht es geradeaus ins nächste Dreieck
    for (let t = 0; t < 3; t++) {
      for (const a of [t * 240, t * 240 + 120]) pts.push({ x: pts[pts.length - 1].x + Math.sin((a * Math.PI) / 180), y: pts[pts.length - 1].y + Math.cos((a * Math.PI) / 180) })
      pts.push({ x: 0, y: 0 })
    }
  }
  const ext = Math.max(1, ...pts.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y))))
  const k = 95 / ext
  const d = pts.map((p, i) => `${i ? 'L' : 'M'} ${110 + p.x * k} ${110 - p.y * k}`).join(' ')
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Ist die Person nicht mehr zu sehen, sucht man systematisch um den Bezugspunkt (Datum), der mit dem Strom mitwandert. Das wachsende Quadrat deckt eine Fläche gleichmäßig ab; die Sektorsuche passt, wenn der Ort recht genau bekannt ist – sie führt immer wieder über das Datum.
        </p>
        <Toggle value={pattern} onChange={setPattern} label="Suchmuster" options={[{ value: 'square', label: 'Wachsendes Quadrat' }, { value: 'sector', label: 'Sektorsuche' }]} />
        <div className="grid gap-4 sm:grid-cols-2">
          {pattern === 'square' ? (
            <>
              <Slide label="Bahnabstand S" value={`${f1(spacing * 1852)} m (${formatNumber(spacing, 2)} NM)`} min={0.05} max={1} step={0.05} v={spacing} on={setSpacing} />
              <Slide label="Schenkel" value={String(legs)} min={4} max={16} step={1} v={legs} on={setLegs} />
            </>
          ) : (
            <Slide label="Radius R" value={`${f1(radius)} NM`} min={0.2} max={3} step={0.1} v={radius} on={setRadius} />
          )}
          <Slide label="Suchfahrt" value={`${f1(speed)} kn`} min={2} max={8} step={0.5} v={speed} on={setSpeed} />
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <Tile label="Suchstrecke" value={`${f1(length)} NM`} />
          <Tile label="Dauer" value={`${f0(searchMinutes(length, speed))} min`} />
        </div>
        <p className="text-xs text-muted-foreground">
          {pattern === 'square' ? 'Schenkel S, S, 2S, 2S, 3S, 3S … jeweils 90° gedreht. Den Bahnabstand nach der Sichtweite auf eine Person im Wasser wählen – nachts und bei Seegang klein.' : 'Neun Schenkel der Länge R mit Drehungen von 120°: Gesamtweg 9 R. Danach ggf. um 30° versetzt wiederholen.'}
        </p>
      </div>
      <svg viewBox="0 0 220 220" className="h-auto w-full max-w-[240px] justify-self-center rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label={pattern === 'square' ? 'Skizze: wachsendes Quadrat' : 'Skizze: Sektorsuche'}>
        <path d={d} fill="none" stroke="#0284c7" strokeWidth={2} strokeLinejoin="round" />
        <circle cx={110} cy={110} r={5} fill="#e11d48" />
        <text x={116} y={124} fontSize={9} fill="currentColor">Datum</text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Hilfe ist weit weg */

export function RescueTimeWidget() {
  const [distance, setDistance] = useState(120)
  const [speed, setSpeed] = useState(15)
  const h = rescueHours(distance, speed)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Auf Hochsee kommt Hilfe meist von einem umgeleiteten Handelsschiff, Hubschrauber reichen nur begrenzt hinaus. Die Crew muss sich deshalb oft viele Stunden selbst helfen – an Bord, solange das Schiff schwimmt, sonst in der Rettungsinsel.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Nächstes Schiff entfernt" value={`${distance} NM`} min={10} max={500} step={10} v={distance} on={setDistance} />
        <Slide label="Dessen Fahrt" value={`${speed} kn`} min={8} max={25} step={1} v={speed} on={setSpeed} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <Tile label="Zeit bis zur Hilfe" value={`${f1(h)} h`} tone={h > 6 ? 'bad' : undefined} />
        <Tile label="Davon nachts möglich" value={h > 12 ? 'sicher' : h > 4 ? 'wahrscheinlich' : 'vielleicht'} />
      </div>
      <p className="text-xs text-muted-foreground">Ein Schiff in 120 NM mit 15 kn braucht 8 Stunden. Darum: Schiff nur verlassen, wenn es sinkt, Wärme und Wasser sichern, SART und Handfunkgerät für die letzte Annäherung bereithalten.</p>
    </div>
  )
}

export function AbandonShipOrderWidget() {
  return <OrderExercise steps={ABANDON_STEPS} intro="Das Schiff ist nicht mehr zu halten. Bringe das Verlassen des Schiffes in eine sinnvolle Reihenfolge." />
}
