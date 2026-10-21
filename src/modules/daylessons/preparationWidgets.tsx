import { useState } from 'react'
import { CheckCircle2, Circle, RotateCcw } from 'lucide-react'
import { daylightMargin, FUEL_RESERVE, formatNumber, fuelNeeded, thirdsRange } from '@/calculations'
import { formatDuration } from '@/calculations/dst'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { BRIEFING_ITEMS, DEPARTURE_CHECKLIST } from '@/data/preparation'
import { cn } from '@/lib/utils'

const f1 = (n: number) => formatNumber(n, 1)
const clock = (h: number) => {
  const m = Math.round(h * 60)
  return `${String(Math.floor(m / 60) % 24).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
}

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

/* ------------------------------------------------------------------ Checkliste */

export function DepartureChecklistWidget() {
  const [done, setDone] = useState<string[]>([])
  const total = DEPARTURE_CHECKLIST.reduce((n, g) => n + g.items.length, 0)
  const toggle = (id: string) => setDone((d) => (d.includes(id) ? d.filter((x) => x !== id) : [...d, id]))
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Progress value={(done.length / total) * 100} className="flex-1" />
        <span className="font-mono text-sm tabular-nums">
          {done.length}/{total}
        </span>
        <Button variant="ghost" size="sm" onClick={() => setDone([])} aria-label="Checkliste zurücksetzen">
          <RotateCcw className="size-4" />
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {DEPARTURE_CHECKLIST.map((g) => (
          <div key={g.id} className="space-y-1">
            <p className="text-sm font-semibold">{g.title}</p>
            <ul className="space-y-0.5">
              {g.items.map((i) => {
                const on = done.includes(`${g.id}:${i.id}`)
                return (
                  <li key={i.id}>
                    <button type="button" onClick={() => toggle(`${g.id}:${i.id}`)} aria-pressed={on} className="flex w-full items-start gap-2 rounded-md px-2 py-1 text-left text-sm hover:bg-muted">
                      {on ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                      <span className={cn(on && 'text-muted-foreground line-through')}>{i.text}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
      {done.length === total && <p className="rounded-lg border border-success/40 bg-success/5 p-3 text-sm">Alles geprüft – Leinen los, und gute Fahrt.</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ Kraftstoff und Tageslicht */

export function FuelDaylightWidget() {
  const [dist, setDist] = useState(24)
  const [sog, setSog] = useState(6)
  const [lph, setLph] = useState(3)
  const [tank, setTank] = useState(40)
  const [depart, setDepart] = useState(9)
  const [sunset, setSunset] = useState(18.5)
  const need = fuelNeeded(dist, sog, lph)
  const range = thirdsRange(tank, lph, sog)
  const margin = daylightMargin(depart, dist, sog, sunset)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Reicht der Diesel, falls der Wind einschläft? Und bist du vor Sonnenuntergang da? Gerechnet wird die ganze Strecke unter Maschine, plus {Math.round(FUEL_RESERVE * 100)} % Reserve. Für Fahrten ohne sicheren Tankstopp gilt die Drittelregel: ein Drittel hin, ein Drittel zurück, ein Drittel Reserve.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Slide label="Distanz" value={`${dist} NM`} min={4} max={60} step={1} v={dist} on={setDist} />
        <Slide label="Fahrt unter Maschine" value={`${f1(sog)} kn`} min={3} max={8} step={0.5} v={sog} on={setSog} />
        <Slide label="Verbrauch" value={`${f1(lph)} l/h`} min={1} max={8} step={0.5} v={lph} on={setLph} />
        <Slide label="Tankinhalt" value={`${tank} l`} min={10} max={150} step={5} v={tank} on={setTank} />
        <Slide label="Abfahrt" value={clock(depart)} min={5} max={16} step={0.5} v={depart} on={setDepart} />
        <Slide label="Sonnenuntergang" value={clock(sunset)} min={16} max={22} step={0.25} v={sunset} on={setSunset} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Tile label="Fahrzeit" value={formatDuration(dist / sog)} />
        <Tile label="Diesel mit Reserve" value={`${f1(need)} l`} tone={need <= tank ? 'ok' : 'bad'} />
        <Tile label="Drittelregel: max. hinaus" value={`${f1(range)} NM`} />
        <Tile label="Ankunft" value={`${clock(depart + dist / sog)} (${margin >= 0 ? '+' : '−'}${f1(Math.abs(margin))} h)`} tone={margin >= 1 ? 'ok' : 'bad'} />
      </div>
      <p className={cn('rounded-lg border p-3 text-sm', need <= tank && margin >= 1 ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
        {need > tank
          ? `Der Tank reicht nicht für die ganze Strecke unter Maschine: ${f1(need)} l nötig, ${tank} l an Bord. Tanken oder Kanister mitnehmen.`
          : margin < 0
            ? 'Ankunft erst nach Sonnenuntergang – früher ablegen, kürzeres Ziel wählen oder die Nachtansteuerung bewusst planen.'
            : margin < 1
              ? 'Ankunft knapp vor Sonnenuntergang – keine Reserve für Gegenstrom oder Flaute. Mindestens eine Stunde Puffer einplanen.'
              : 'Passt: genug Diesel und Ankunft mit Reserve bei Tageslicht.'}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Sicherheitsbriefing */

export function BriefingWidget() {
  const [picked, setPicked] = useState<string[]>([])
  const [checked, setChecked] = useState(false)
  const toggle = (id: string) => {
    setChecked(false)
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]))
  }
  const wrong = BRIEFING_ITEMS.filter((i) => picked.includes(i.id) !== i.belongs)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Was gehört in das Sicherheitsbriefing vor dem Ablegen? Wähle alle passenden Punkte und prüfe dann.</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {BRIEFING_ITEMS.map((i) => {
          const on = picked.includes(i.id)
          const state = checked ? (on === i.belongs ? 'right' : 'wrong') : null
          return (
            <button
              key={i.id}
              type="button"
              onClick={() => toggle(i.id)}
              aria-pressed={on}
              className={cn(
                'flex items-start gap-2 rounded-lg border p-2 text-left text-sm transition-colors hover:bg-muted',
                on && 'border-primary',
                state === 'right' && 'border-success bg-success/10',
                state === 'wrong' && 'border-destructive bg-destructive/10',
              )}
            >
              {on ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
              <span>{i.text}</span>
            </button>
          )
        })}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={() => setChecked(true)} disabled={picked.length === 0}>
          Prüfen
        </Button>
        {checked && (
          <p role="status" className="text-sm">
            {wrong.length === 0 ? 'Alles richtig – genau diese Punkte gehören ins Briefing.' : `${wrong.length} ${wrong.length === 1 ? 'Punkt passt' : 'Punkte passen'} noch nicht. Ins Briefing gehört, was im Notfall jede Person an Bord wissen muss.`}
          </p>
        )}
      </div>
    </div>
  )
}
