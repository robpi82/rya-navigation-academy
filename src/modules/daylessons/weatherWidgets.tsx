import { useState } from 'react'
import { Search } from 'lucide-react'
import {
  BEAUFORT,
  beaufortFromKnots,
  formatBearing,
  formatNumber,
  knotsToKmh,
  knotsToMs,
  lowPressureDirection,
  pressureTendency,
  visibilityTerm,
  windShift,
} from '@/calculations'
import { FORECAST_GROUP_LABEL, FORECAST_TERMS } from '@/data/weather'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, Toggle, fieldsValid, useNumberField } from '@/modules/calculators/fields'

const f1 = (n: number) => formatNumber(n, 1)

/* ------------------------------------------------------------------ Beaufort */

export function BeaufortWidget() {
  const [kn, setKn] = useState(18)
  const force = beaufortFromKnots(kn)
  const level = BEAUFORT[force]
  const amp = Math.min(34, 4 + level.waveHeight * 3)
  const wave = Array.from({ length: 41 }, (_, i) => `${i * 8},${60 - Math.sin((i / 40) * Math.PI * 6) * amp}`).join(' ')
  const tone = force >= 8 ? 'text-destructive' : force >= 6 ? 'text-warning' : 'text-success'
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Windgeschwindigkeit</span>
          <span className="font-mono">{kn} kn</span>
        </div>
        <Slider value={[kn]} min={0} max={70} step={1} onValueChange={([v]) => setKn(v)} aria-label="Windgeschwindigkeit in Knoten" />
      </div>
      <div className="grid gap-4 md:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <div className="rounded-lg bg-primary/10 p-2.5 ring-1 ring-primary/40">
              <div className="text-xs text-muted-foreground">Windstärke</div>
              <div className={cn('font-mono text-xl font-semibold', tone)}>Bft {force}</div>
            </div>
            <div className="rounded-lg bg-muted/60 p-2.5">
              <div className="text-xs text-muted-foreground">m/s</div>
              <div className="font-mono font-semibold">{f1(knotsToMs(kn))}</div>
            </div>
            <div className="rounded-lg bg-muted/60 p-2.5">
              <div className="text-xs text-muted-foreground">km/h</div>
              <div className="font-mono font-semibold">{f1(knotsToKmh(kn))}</div>
            </div>
            <div className="rounded-lg bg-muted/60 p-2.5">
              <div className="text-xs text-muted-foreground">Wellenhöhe (grob)</div>
              <div className="font-mono font-semibold">≈ {f1(level.waveHeight)} m</div>
            </div>
          </div>
          <div className="space-y-1 text-sm">
            <p>
              <b>{level.name}</b> – Seegang: {level.sea}
            </p>
            <p className="text-muted-foreground">{level.effect}</p>
          </div>
        </div>
        <svg viewBox="0 0 320 90" className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Wellenbild">
          <polyline points={wave} fill="none" stroke="var(--vec-tide)" strokeWidth={3} />
          <polyline points={`${wave} 320,90 0,90`} fill="var(--vec-tide)" opacity={0.15} />
        </svg>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr>
              <th className="py-1 font-medium">Bft</th>
              <th className="font-medium">Knoten</th>
              <th className="font-medium">Bezeichnung</th>
              <th className="font-medium">Wellen (≈)</th>
            </tr>
          </thead>
          <tbody>
            {BEAUFORT.map((b) => (
              <tr key={b.force} className={cn('cursor-pointer border-t', b.force === force && 'bg-accent/70 font-semibold')} onClick={() => setKn(Math.max(b.minKn, 0))}>
                <td className="py-1 font-mono">{b.force}</td>
                <td className="font-mono">{b.maxKn === null ? `ab ${b.minKn}` : b.minKn === b.maxKn ? b.minKn : `${b.minKn}–${b.maxKn}`}</td>
                <td>{b.name}</td>
                <td className="font-mono">{f1(b.waveHeight)} m</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-1 text-xs text-muted-foreground">Wellenhöhen sind grobe Richtwerte für ausgereiften Seegang auf offener See; in Küstennähe, bei Strom oder Wind gegen Strom kann es steiler und höher werden.</p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Buys Ballot und Winddrehung */

export function BuysBallotWidget() {
  const [windFrom, setWindFrom] = useState(270)
  const [hem, setHem] = useState<'north' | 'south'>('north')
  const [shiftFrom, setShiftFrom] = useState(225)
  const [shiftTo, setShiftTo] = useState(270)
  const low = lowPressureDirection(windFrom, hem)
  const C = 110
  const R = 82
  const pt = (d: number, r: number) => ({ x: C + r * Math.sin((d * Math.PI) / 180), y: C - r * Math.cos((d * Math.PI) / 180) })
  const lowP = pt(low, R - 22)
  const from = pt(windFrom, R)
  const to = pt(windFrom + 180, 22)
  const shift = windShift(shiftFrom, shiftTo)
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-[240px_1fr]">
        <svg viewBox="0 0 220 220" className="mx-auto h-auto w-full max-w-[240px]" role="img" aria-label="Buys-Ballot-Regel">
          <circle cx={C} cy={C} r={R} fill="var(--chart-sea)" stroke="var(--border)" strokeWidth={2} />
          {[0, 90, 180, 270].map((d) => (
            <text key={d} x={pt(d, R + 12).x} y={pt(d, R + 12).y + 4} fontSize={11} textAnchor="middle" fill="var(--muted-foreground)">
              {d === 0 ? 'N' : d === 90 ? 'O' : d === 180 ? 'S' : 'W'}
            </text>
          ))}
          <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="var(--vec-water)" strokeWidth={4} strokeLinecap="round" />
          <polygon points={`${to.x},${to.y} ${to.x + 10 * Math.sin(((windFrom + 180 + 150) * Math.PI) / 180)},${to.y - 10 * Math.cos(((windFrom + 180 + 150) * Math.PI) / 180)} ${to.x + 10 * Math.sin(((windFrom + 180 - 150) * Math.PI) / 180)},${to.y - 10 * Math.cos(((windFrom + 180 - 150) * Math.PI) / 180)}`} fill="var(--vec-water)" />
          <circle cx={C} cy={C} r={5} fill="var(--foreground)" />
          <text x={C + 8} y={C + 16} fontSize={10} fill="var(--foreground)">Du</text>
          <circle cx={lowP.x} cy={lowP.y} r={16} fill="var(--destructive)" opacity={0.2} />
          <text x={lowP.x} y={lowP.y + 5} fontSize={14} fontWeight={800} textAnchor="middle" fill="var(--destructive)">T</text>
        </svg>
        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Wind weht aus</span>
              <span className="font-mono">{formatBearing(windFrom, 0)}</span>
            </div>
            <Slider value={[windFrom]} min={0} max={359} step={1} onValueChange={([v]) => setWindFrom(v)} aria-label="Windrichtung" />
          </div>
          <Toggle label="Halbkugel" value={hem} onChange={setHem} options={[{ value: 'north', label: 'Nordhalbkugel' }, { value: 'south', label: 'Südhalbkugel' }]} />
          <p className="rounded-lg bg-accent/50 p-3 text-sm">
            <b>Buys-Ballot-Regel:</b> Stellst du dich mit dem Rücken zum Wind, liegt auf der Nordhalbkugel das <b>Tief links</b> (Südhalbkugel: rechts). Hier liegt es in Richtung <b>{formatBearing(low, 0)}</b>. Um ein Tief weht der Wind gegen den Uhrzeigersinn (Nordhalbkugel), um ein Hoch im Uhrzeigersinn.
          </p>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <h3 className="mb-2 text-sm font-semibold">Winddrehung: Veering oder Backing?</h3>
        <div className="grid gap-3 sm:grid-cols-2">
          <Slide2 label="Wind vorher aus" value={shiftFrom} onChange={setShiftFrom} />
          <Slide2 label="Wind danach aus" value={shiftTo} onChange={setShiftTo} />
        </div>
        <p className="mt-2 text-sm">
          {shift.kind === 'none' ? 'Keine Drehung.' : shift.kind === 'veer' ? `Der Wind dreht rechts herum (im Uhrzeigersinn) um ${shift.degrees}° – „veering".` : `Der Wind dreht links herum (gegen den Uhrzeigersinn) um ${shift.degrees}° – „backing".`}
        </p>
        <p className="text-xs text-muted-foreground">Beim Durchzug einer Kaltfront dreht der Wind rechts (veering), vor einer Warmfront meist links (backing).</p>
      </div>
    </div>
  )
}

function Slide2({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{formatBearing(value, 0)}</span>
      </div>
      <Slider value={[value]} min={0} max={359} step={5} onValueChange={([v]) => onChange(v)} aria-label={label} />
    </div>
  )
}

/* ------------------------------------------------------------------ Seewetterbericht-Begriffe */

export function ForecastTermsWidget() {
  const [query, setQuery] = useState('')
  const [group, setGroup] = useState<keyof typeof FORECAST_GROUP_LABEL | 'all'>('all')
  const q = query.trim().toLowerCase()
  const list = FORECAST_TERMS.filter((t) => (group === 'all' || t.group === group) && (!q || (t.term + t.meaning).toLowerCase().includes(q)))
  const change = useNumberField('-4', { min: -30, max: 30 })
  const vis = useNumberField('3', { min: 0, max: 50 })
  const valid = fieldsValid(change, vis)
  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2 rounded-lg border p-3">
          <h3 className="text-sm font-semibold">Luftdruckänderung in 3 Stunden</h3>
          <NumberField label="Änderung" hint="negativ = fallend" unit="hPa" field={change} />
          {valid && <p className="rounded-lg bg-primary/10 p-2 text-sm font-medium">Im Seewetterbericht: {pressureTendency(change.value!)}</p>}
        </div>
        <div className="space-y-2 rounded-lg border p-3">
          <h3 className="text-sm font-semibold">Sichtweite</h3>
          <NumberField label="Sichtweite" unit="NM" field={vis} />
          {valid && <p className="rounded-lg bg-primary/10 p-2 text-sm font-medium">Im Seewetterbericht: {visibilityTerm(vis.value!)}</p>}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" aria-hidden />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Begriff suchen: Gale, Soon, Front …" aria-label="Begriffe suchen" className="h-10 w-full rounded-md border bg-background pr-3 pl-9 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none" />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Gruppe">
          <Button size="sm" variant={group === 'all' ? 'default' : 'outline'} onClick={() => setGroup('all')} aria-pressed={group === 'all'}>
            Alle
          </Button>
          {(Object.keys(FORECAST_GROUP_LABEL) as (keyof typeof FORECAST_GROUP_LABEL)[]).map((g) => (
            <Button key={g} size="sm" variant={group === g ? 'default' : 'outline'} onClick={() => setGroup(g)} aria-pressed={group === g}>
              {FORECAST_GROUP_LABEL[g]}
            </Button>
          ))}
        </div>
      </div>
      <ul className="grid gap-2 md:grid-cols-2">
        {list.map((t) => (
          <li key={t.id} className="rounded-lg border p-3 text-sm">
            <div className="font-semibold">{t.term}</div>
            <div className="text-muted-foreground">{t.meaning}</div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Nichts gefunden.</p>}
    </div>
  )
}
