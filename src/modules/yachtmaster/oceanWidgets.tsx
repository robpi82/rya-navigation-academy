import { useState } from 'react'
import { arrivalDate, clockChangeHours, daysPerClockHour, longitudePerDay, etmalSpeed, formatNumber, passageDays, passageWater, PROVISION_RESERVE } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { MONTHS, OCEAN_ROUTES, type Suitability } from '@/data/ocean'
import { cn } from '@/lib/utils'

const f1 = (n: number) => formatNumber(n, 1)
const f0 = (n: number) => formatNumber(n, 0)
const de = (iso: string) => iso.split('-').reverse().join('.')

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

const SUIT: Record<Suitability, { label: string; cls: string }> = {
  good: { label: 'gut', cls: 'bg-success text-white dark:text-slate-950' },
  fair: { label: 'mäßig', cls: 'bg-amber-400 text-slate-950' },
  poor: { label: 'ungünstig', cls: 'bg-destructive text-white dark:text-slate-950' },
}

/* ------------------------------------------------------------------ Route und Jahreszeit */

export function SeasonRouteWidget() {
  const [route, setRoute] = useState(OCEAN_ROUTES[1].id)
  const [month, setMonth] = useState(10)
  const r = OCEAN_ROUTES.find((x) => x.id === route)!
  const s = r.months[month]
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Auf dem Ozean entscheidet die Jahreszeit mehr als jede Kurswahl. Wähle Route und Abfahrtsmonat – die Farbleiste zeigt, wann die klassischen Nordatlantik-Routen für Fahrtenyachten günstig sind. Grobe Richtwerte; in der Praxis Pilot Charts und Revierführer nutzen.
      </p>
      <div className="flex flex-wrap gap-2">
        {OCEAN_ROUTES.map((x) => (
          <button key={x.id} type="button" onClick={() => setRoute(x.id)} aria-pressed={x.id === route} className={cn('rounded-lg border px-3 py-2 text-left text-sm', x.id === route ? 'border-primary bg-accent' : 'hover:bg-muted')}>
            {x.name}
            <span className="block text-xs text-muted-foreground">rund {f0(x.distanceNm)} NM</span>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-6 gap-1 sm:grid-cols-12" role="group" aria-label="Abfahrtsmonat">
        {r.months.map((m, i) => (
          <button
            key={MONTHS[i]}
            type="button"
            onClick={() => setMonth(i)}
            aria-pressed={i === month}
            title={`${MONTHS[i]}: ${SUIT[m].label}`}
            className={cn('rounded-md py-1.5 text-xs font-semibold', SUIT[m].cls, i === month ? 'ring-2 ring-foreground ring-offset-2 ring-offset-background' : 'hover:brightness-110')}
          >
            {MONTHS[i].slice(0, 3)}
          </button>
        ))}
      </div>
      <p role="status" className={cn('rounded-lg border p-3 text-sm', s === 'good' ? 'border-success/40 bg-success/5' : s === 'fair' ? 'border-amber-500/40 bg-amber-500/5' : 'border-destructive/40 bg-destructive/5')}>
        <span className="font-semibold">
          {MONTHS[month]}: {SUIT[s].label}.
        </span>{' '}
        {r.why[s]}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Etmal und Vorräte */

export function EtmalProvisionWidget() {
  const [distance, setDistance] = useState(2800)
  const [etmal, setEtmal] = useState(140)
  const [depart, setDepart] = useState('2026-11-22')
  const [crew, setCrew] = useState(4)
  const [litres, setLitres] = useState(3)
  const [tank, setTank] = useState(300)
  const days = passageDays(distance, etmal)
  const water = passageWater(crew, days, litres)
  const valid = /^\d{4}-\d{2}-\d{2}$/.test(depart)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Das Etmal ist die Strecke von Mittag zu Mittag. Ein Fahrtenboot schafft auf der Passatroute oft 120–160 NM. Daraus folgen Reisedauer, Ankunft und Vorräte – mit {Math.round(PROVISION_RESERVE * 100)} % Reserve, denn Flauten, Bruch oder Umwege verlängern jede Überfahrt.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Slide label="Distanz" value={`${f0(distance)} NM`} min={300} max={4000} step={50} v={distance} on={setDistance} />
        <Slide label="Etmal" value={`${etmal} NM`} min={80} max={200} step={5} v={etmal} on={setEtmal} />
        <label className="space-y-1 text-sm font-medium">
          Abfahrt
          <input type="date" value={depart} onChange={(e) => setDepart(e.target.value)} className="h-9 w-full rounded-md border bg-background px-3 text-sm" />
        </label>
        <Slide label="Crew" value={`${crew} Personen`} min={1} max={8} step={1} v={crew} on={setCrew} />
        <Slide label="Trinkwasser pro Person und Tag" value={`${f1(litres)} l`} min={2} max={5} step={0.5} v={litres} on={setLitres} />
        <Slide label="Wassertank und Kanister" value={`${tank} l`} min={50} max={800} step={10} v={tank} on={setTank} />
      </div>
      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-4">
        <Tile label="mittlere Fahrt" value={`${f1(etmalSpeed(etmal))} kn`} />
        <Tile label="Reisedauer" value={`${f1(days)} Tage`} />
        <Tile label="Ankunft (ohne Reserve)" value={valid ? de(arrivalDate(depart, days)) : '–'} />
        <Tile label={`Trinkwasser + ${Math.round(PROVISION_RESERVE * 100)} %`} value={`${f0(water)} l`} tone={water <= tank ? 'ok' : 'bad'} />
      </div>
      <p className={cn('rounded-lg border p-3 text-sm', water <= tank ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
        {water <= tank
          ? `Das Wasser reicht für ${f1(days * (1 + PROVISION_RESERVE))} Tage mit Reserve. Einen Teil getrennt lagern (Kanister), falls der Tank verunreinigt wird.`
          : `Es fehlen etwa ${f0(water - tank)} l: zusätzliche Kanister, ein Wassermacher (mit Handpumpe als Rückfall) oder weniger Verbrauch einplanen.`}
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Zeitzonen */

export function TimeZoneWidget() {
  const [from, setFrom] = useState(-15.4)
  const [to, setTo] = useState(-61.8)
  const [etmal, setEtmal] = useState(140)
  const [lat, setLat] = useState(17)
  const h = clockChangeHours(from, to)
  const lonPerDay = longitudePerDay(etmal, lat)
  const daysPerHour = daysPerClockHour(etmal, lat)
  const lonLabel = (l: number) => `${f1(Math.abs(l))}° ${l < 0 ? 'W' : 'E'}`
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Je 15° Länge verschiebt sich die Sonnenzeit um eine Stunde. Auf einer Ost-West-Passage stellt man die Bordzeit deshalb schrittweise um – nach Westen zurück, nach Osten vor –, damit Mittag und Wachen zum Tageslicht passen.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Abfahrtslänge" value={lonLabel(from)} min={-80} max={10} step={0.1} v={from} on={setFrom} />
        <Slide label="Ziellänge" value={lonLabel(to)} min={-80} max={10} step={0.1} v={to} on={setTo} />
        <Slide label="Etmal" value={`${etmal} NM`} min={80} max={200} step={5} v={etmal} on={setEtmal} />
        <Slide label="Breite der Route" value={`${lat}° N`} min={0} max={50} step={1} v={lat} on={setLat} />
      </div>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <Tile label="Zeitverschiebung" value={`${h >= 0 ? '+' : '−'}${f1(Math.abs(h))} h`} />
        <Tile label="Längenänderung pro Tag" value={`${f1(lonPerDay)}°`} />
        <Tile label="Eine Stunde alle" value={`${f1(daysPerHour)} Tage`} />
      </div>
      <p className="text-xs text-muted-foreground">
        {h < 0 ? `Nach Westen: Uhr insgesamt um etwa ${f0(Math.abs(h))} h zurückstellen.` : h > 0 ? `Nach Osten: Uhr insgesamt um etwa ${f0(h)} h vorstellen.` : 'Keine Längenänderung.'} Längenänderung pro Tag = Etmal / (60 · cos Breite), bei Kurs West oder Ost. Für Funk- und Wetterzeiten bleibt UTC maßgeblich.
      </p>
    </div>
  )
}

