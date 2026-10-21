import { useState } from 'react'
import { daylightDepartureWindow, formatNumber, isDark, lightWindow, watchLoad, watchSchedule, type RouteLight } from '@/calculations'
import { formatClockTime, formatDuration } from '@/calculations/dst'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, Toggle, fieldsValid, useNumberField } from '@/modules/calculators/fields'

const f1 = (n: number) => formatNumber(n, 1)
const DAY = ['Vortag', 'Tag 1', 'Tag 2', 'Tag 3']
/** Stunden (ab Mitternacht Tag 1, auch negativ) → „Tag 1, 20:00" */
const clock = (h: number) => {
  const c = formatClockTime(h * 60)
  return `${DAY[c.dayOffset + 1] ?? `Tag ${c.dayOffset + 1}`}, ${c.time}`
}
const TEAM_COLORS = ['bg-sky-500', 'bg-amber-500', 'bg-emerald-500']

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

/* ------------------------------------------------------------------ Wachplan */

export function WatchPlanWidget() {
  const [crew, setCrew] = useState(4)
  const [teamsSel, setTeamsSel] = useState<'2' | '3'>('2')
  const [hours, setHours] = useState(3)
  const teams = Math.min(Number(teamsSel), crew)
  const from = 20
  const to = 32
  const watches = watchSchedule(from, to, hours, teams)
  const load = watchLoad(watches, teams)
  const members = Array.from({ length: teams }, (_, t) => Array.from({ length: crew }, (_, i) => i).filter((i) => i % teams === t).map((i) => `P${i + 1}`))
  const solo = members.some((m) => m.length < 2)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Nachtfahrt von 20:00 bis 08:00. Die Crew wird in Wachen eingeteilt, die sich regelmäßig ablösen. Wer nicht Wache hat, schläft – Ruhe ist Sicherheitsausrüstung.</p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slide label="Crew an Bord" value={`${crew} Personen`} min={2} max={6} step={1} v={crew} on={setCrew} />
        <Slide label="Wachdauer" value={`${hours} h`} min={2} max={4} step={1} v={hours} on={setHours} />
        <div className="space-y-1">
          <span className="text-sm font-medium">Wachsystem</span>
          <Toggle value={teamsSel} onChange={setTeamsSel} label="Wachsystem" options={[{ value: '2', label: 'Zwei Wachen' }, { value: '3', label: 'Drei Wachen' }]} />
        </div>
      </div>
      <div className="space-y-1" role="img" aria-label="Zeitleiste der Wachen von 20 bis 08 Uhr">
        <div className="flex h-8 overflow-hidden rounded border">
          {watches.map((w, i) => (
            <div key={i} className={cn('flex items-center justify-center border-r text-[11px] font-semibold text-white', TEAM_COLORS[w.team])} style={{ width: `${((w.end - w.start) / (to - from)) * 100}%` }}>
              W{w.team + 1}
            </div>
          ))}
        </div>
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
          {Array.from({ length: 7 }, (_, i) => from + i * 2).map((h) => (
            <span key={h}>{String(h % 24).padStart(2, '0')}:00</span>
          ))}
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-3">
        {load.map((l, t) => (
          <div key={t} className="rounded-lg border p-3 text-sm">
            <div className="flex items-center gap-2 font-semibold">
              <span className={cn('inline-block size-3 rounded', TEAM_COLORS[t])} aria-hidden /> Wache {t + 1}: {members[t].join(', ')}
            </div>
            <div className="text-muted-foreground">An Deck {f1(l.onWatch)} h · längste Ruhe {f1(l.longestRest)} h</div>
          </div>
        ))}
      </div>
      <ul className="space-y-1 text-sm">
        {hours >= 4 && <li className="text-amber-600 dark:text-amber-400">4-Stunden-Wachen sind nachts lang – Müdigkeit und Kälte senken die Aufmerksamkeit.</li>}
        {solo && <li className="text-amber-600 dark:text-amber-400">Mindestens eine Wache ist allein an Deck: nur mit Lifebelt, eingepickt, und mit klarer Regel, wann der Skipper geweckt wird.</li>}
        {teams === 3 && <li className="text-muted-foreground">Drei Wachen geben deutlich mehr Schlaf, brauchen aber mindestens drei Personen.</li>}
        <li className="text-muted-foreground">Bei der Übergabe: Kurs, Position, Verkehr, Wetter, Segelstellung und besondere Anweisungen ins Logbuch und mündlich.</li>
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------ Ankunft bei Tageslicht */

export function DaylightArrivalWidget() {
  const dist = useNumberField('65', { min: 1, max: 300 })
  const speed = useNumberField('5', { min: 1, max: 15 })
  const sunrise = useNumberField('6.5', { min: 3, max: 10 })
  const sunset = useNumberField('20', { min: 15, max: 23 })
  const margin = useNumberField('1', { min: 0, max: 4 })
  const valid = fieldsValid(dist, speed, sunrise, sunset, margin)
  const w = valid ? daylightDepartureWindow(dist.value!, speed.value!, sunrise.value!, sunset.value!, margin.value!, 1) : null
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Unbekannte Häfen läuft man möglichst bei Tageslicht an. Aus Distanz und geplanter Fahrt ergibt sich, wann man frühestens und spätestens ablegen kann, um am Folgetag mit Puffer nach Sonnenaufgang und vor Sonnenuntergang anzukommen. Zeiten in Dezimalstunden.</p>
      <div className="grid gap-3 sm:grid-cols-5">
        <NumberField label="Distanz" unit="NM" field={dist} />
        <NumberField label="Fahrt (SOG)" unit="kn" field={speed} />
        <NumberField label="Sonnenaufgang" unit="h" field={sunrise} />
        <NumberField label="Sonnenuntergang" unit="h" field={sunset} />
        <NumberField label="Puffer" unit="h" field={margin} />
      </div>
      {valid && w ? (
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/50 px-3 py-2"><div className="text-[11px] text-muted-foreground">Fahrtdauer</div><div className="font-mono font-semibold">{formatDuration(w.hours)}</div></div>
          <div className="rounded-lg border border-primary bg-primary/10 px-3 py-2"><div className="text-[11px] text-muted-foreground">Früheste Abfahrt</div><div className="font-mono font-semibold">{clock(w.earliest)}</div></div>
          <div className="rounded-lg border border-primary bg-primary/10 px-3 py-2"><div className="text-[11px] text-muted-foreground">Späteste Abfahrt</div><div className="font-mono font-semibold">{clock(w.latest)}</div></div>
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">{valid ? 'Kein Zeitfenster: Der Tag ist mit diesem Puffer zu kurz.' : 'Bitte gültige Werte eingeben.'}</p>
      )}
      <p className="text-xs text-muted-foreground">Ankunft am Folgetag (Tag 2). Strom, Wetter und Reserve für langsamere Fahrt sind nicht berücksichtigt – lieber großzügig planen.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ Feuer entlang der Route */

export const ROUTE_LIGHTS: RouteLight[] = [
  { name: 'Lt. Kap Möwe', characteristic: 'Fl(2) 10s', along: 6, offset: 4, range: 15 },
  { name: 'Lt. Nordklippe', characteristic: 'Oc WR 8s', along: 28, offset: 9, range: 14 },
  { name: 'Lt. Insel Kranich', characteristic: 'Iso 6s', along: 45, offset: -7, range: 12 },
  { name: 'Ansteuerung Zielhafen', characteristic: 'LFl 10s', along: 64, offset: 0.5, range: 8 },
  { name: 'Lt. Weite Bank', characteristic: 'Q(9) 15s', along: 36, offset: 16, range: 10 },
]

export function RouteLightsWidget() {
  const [depart, setDepart] = useState(19)
  const [speed, setSpeed] = useState(5)
  const routeLength = 65
  const sunrise = 6.5
  const sunset = 20
  const rows = ROUTE_LIGHTS.map((l) => lightWindow(l, routeLength, speed, depart)).sort((a, b) => (a.fromNm ?? 999) - (b.fromNm ?? 999))
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Route über 65 NM, Sonnenuntergang 20:00, Sonnenaufgang 06:30. Für jede Nachtfahrt gehört in den Plan, welche Feuer wann in Sicht kommen – mit Kennung, damit man sie sicher identifiziert. Ein Feuer, das zur erwarteten Zeit nicht auftaucht, ist ein Warnsignal.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Abfahrt" value={clock(depart)} min={12} max={23} step={0.5} v={depart} on={setDepart} />
        <Slide label="Fahrt (SOG)" value={`${speed} kn`} min={3} max={8} step={0.5} v={speed} on={setSpeed} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="pb-1 font-medium">Feuer</th>
              <th className="font-medium">Kennung</th>
              <th className="font-medium">In Sicht ab</th>
              <th className="font-medium">Außer Sicht</th>
              <th className="text-right font-medium">Passierabstand</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d1 = r.fromTime !== null && isDark(r.fromTime, sunrise, sunset)
              const d2 = r.toTime !== null && isDark(r.toTime, sunrise, sunset)
              const tag = d1 && d2 ? 'Nacht' : d1 || d2 ? 'teils hell' : 'Tag'
              return (
                <tr key={r.light.name} className="border-t">
                  <td className="py-1.5">{r.light.name}</td>
                  <td className="font-mono">{r.light.characteristic}</td>
                  <td className="font-mono">{r.fromTime === null ? 'nicht in Sicht' : clock(r.fromTime)}</td>
                  <td className="font-mono">{r.toTime === null ? '—' : clock(r.toTime)}</td>
                  <td className="text-right font-mono">
                    {f1(r.closest)} NM {r.fromTime !== null && <span className={cn('ml-1 rounded px-1 text-[10px]', tag === 'Nacht' ? 'bg-slate-800 text-white' : tag === 'Tag' ? 'bg-amber-100 text-amber-900' : 'bg-slate-300 text-slate-900')}>{tag}</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-muted-foreground">Sichtweite = kleinerer Wert aus Nenntragweite und geografischer Sichtweite; hier als wirksame Reichweite vorgegeben. Sichtabschnitt aus dem Satz des Pythagoras: ± √(Reichweite² − Querabstand²) um den Querab-Punkt. Kein Strom, gerade Route.</p>
    </div>
  )
}
