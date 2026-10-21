import { useState } from 'react'
import { dischargeAllowed, formatNumber, GARBAGE_LABEL, holdingTankDays, minDistanceForDischarge, type GarbageItem } from '@/calculations'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { WILDLIFE_CASES } from '@/data/environment'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'

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

/* ------------------------------------------------------------------ Darf das über Bord? */

export function OverboardWidget() {
  const [item, setItem] = useState<GarbageItem>('food-ground')
  const [distance, setDistance] = useState(5)
  const [area, setArea] = useState<'special' | 'normal'>('special')
  const special = area === 'special'
  const ok = dischargeAllowed(item, distance, special, true)
  const min = minDistanceForDischarge(item, special)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Fast nichts darf ins Meer. Nach MARPOL Anlage V (hier vereinfacht) sind nur Lebensmittelreste in Fahrt und mit Abstand zum Land erlaubt – Kunststoff, Glas, Dosen, Papier und ölige Abfälle nie. Nord- und Ostsee sowie das Mittelmeer sind Sondergebiete mit strengeren Regeln. Am einfachsten: alles mit an Land nehmen.
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {(Object.keys(GARBAGE_LABEL) as GarbageItem[]).map((g) => (
          <button key={g} type="button" onClick={() => setItem(g)} aria-pressed={g === item} className={cn('rounded-lg border px-3 py-2 text-left text-sm', g === item ? 'border-primary bg-accent' : 'hover:bg-muted')}>
            {GARBAGE_LABEL[g]}
          </button>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Abstand zum nächsten Land" value={`${f1(distance)} NM`} min={0} max={25} step={0.5} v={distance} on={setDistance} />
        <div className="space-y-1">
          <span className="text-sm font-medium">Seegebiet</span>
          <div>
            <Toggle value={area} onChange={setArea} label="Seegebiet" options={[{ value: 'special', label: 'Sondergebiet (z. B. Nordsee)' }, { value: 'normal', label: 'außerhalb' }]} />
          </div>
        </div>
      </div>
      <p role="status" className={cn('rounded-lg border p-3 text-sm', ok ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
        <span className="font-semibold">{ok ? 'Erlaubt' : 'Nicht erlaubt'}: </span>
        {min === null
          ? item === 'food-whole'
            ? 'Im Sondergebiet nur zerkleinert und ab 12 NM.'
            : 'Darf nie über Bord – an Land entsorgen.'
          : ok
            ? `ab ${min} NM vom nächsten Land und in Fahrt. Trotzdem gilt: Was an Land entsorgt werden kann, gehört an Land.`
            : `erst ab ${min} NM vom nächsten Land und in Fahrt.`}
      </p>
      <p className="text-xs text-muted-foreground">Vereinfachte Lernregeln ohne Gewähr; nationale Vorschriften und Hafenordnungen sind oft strenger. Yachten ab 12 m Länge müssen die Müllregeln an Bord aushängen.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ Tiere und Lebensräume */

export function WildlifeWidget() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const c = WILDLIFE_CASES[i % WILDLIFE_CASES.length]
  // Reihenfolge der Antworten je Fall variieren
  const order = c.options.map((_, k) => (k + i) % c.options.length)
  return (
    <div className="space-y-4">
      <p className="rounded-lg border bg-muted/50 p-3 text-sm">{c.situation} Was tust du?</p>
      <div className="grid gap-2">
        {order.map((k) => {
          const o = c.options[k]
          return (
            <button
              key={o.text}
              type="button"
              onClick={() => setPick(k)}
              aria-pressed={pick === k}
              className={cn('rounded-lg border px-3 py-2 text-left text-sm', pick === k ? (o.right ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10') : 'hover:bg-muted')}
            >
              {o.text}
            </button>
          )
        })}
      </div>
      {pick !== null && (
        <p role="status" className={cn('rounded-lg border p-3 text-sm', c.options[pick].right ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
          {c.options[pick].right ? 'Richtig. ' : 'Besser nicht. '}
          {c.options[pick].why}
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
        Nächste Situation ({(i % WILDLIFE_CASES.length) + 1}/{WILDLIFE_CASES.length})
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ Fäkalientank */

export function HoldingTankWidget() {
  const [tank, setTank] = useState(60)
  const [crew, setCrew] = useState(4)
  const [perDay, setPerDay] = useState(2.5)
  const days = holdingTankDays(tank, crew, perDay)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        In Häfen, Ankerbuchten und küstennah wird nichts abgepumpt – viele Länder schreiben Fäkalientanks vor und betreiben Absaugstationen. Wie lange reicht der Tank? Der Verbrauch hängt stark vom Spülen ab; die Annahme hier ist ein Richtwert.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slide label="Tankinhalt" value={`${tank} l`} min={20} max={200} step={5} v={tank} on={setTank} />
        <Slide label="Crew" value={`${crew} Personen`} min={1} max={8} step={1} v={crew} on={setCrew} />
        <Slide label="pro Person und Tag" value={`${f1(perDay)} l`} min={1} max={6} step={0.5} v={perDay} on={setPerDay} />
      </div>
      <div className={cn('rounded-lg border p-3 text-sm', days >= 3 ? 'border-success/40 bg-success/5' : 'border-amber-500/40 bg-amber-500/5')}>
        Der Tank ist nach etwa <span className="font-mono font-semibold">{f1(days)} Tagen</span> voll – Absaugstationen auf der Route einplanen, sparsam spülen.
      </div>
    </div>
  )
}
