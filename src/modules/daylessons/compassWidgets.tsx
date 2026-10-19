import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import {
  compassToTrue,
  deviationAt,
  formatBearing,
  formatNumber,
  formatVariation,
  magneticToCompassWithTable,
  normalizeAngle,
  signedFromDirection,
  trueToCompass,
  variationForYear,
  type DeviationPoint,
} from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, Toggle, fieldsValid, useNumberField } from '@/modules/calculators/fields'

const f1 = (n: number) => formatNumber(n, 1)
const signed = (n: number) => (n === 0 ? '0°' : `${n > 0 ? '+' : '−'}${f1(Math.abs(n))}°`)

function Chain({ items, highlight }: { items: { key: string; label: string; value: string; note?: string }[]; highlight?: string }) {
  return (
    <ol className="flex flex-wrap items-stretch gap-1.5" aria-label="Umrechnungskette">
      {items.map((it, i) => (
        <li key={it.key} className="flex items-center gap-1.5">
          <div className={cn('min-w-24 rounded-lg border px-3 py-2 text-center', highlight === it.key ? 'border-primary bg-primary/10' : 'bg-muted/50')}>
            <div className="text-[11px] text-muted-foreground">{it.label}</div>
            <div className="font-mono text-lg font-semibold tabular-nums">{it.value}</div>
            {it.note && <div className="text-[11px] text-muted-foreground">{it.note}</div>}
          </div>
          {i < items.length - 1 && <ArrowRight className="size-4 text-muted-foreground" aria-hidden />}
        </li>
      ))}
    </ol>
  )
}

/* ------------------------------------------------------------------ Umrechnung C ↔ T */

export function CompassConverterWidget() {
  const [mode, setMode] = useState<'toTrue' | 'toCompass'>('toTrue')
  const [varDir, setVarDir] = useState<'E' | 'W'>('W')
  const [devDir, setDevDir] = useState<'E' | 'W'>('E')
  const course = useNumberField('075', { min: 0, max: 360, bearing: true })
  const variation = useNumberField('3', { min: 0, max: 40 })
  const deviation = useNumberField('2', { min: 0, max: 40 })
  const valid = fieldsValid(course, variation, deviation)
  const v = valid ? signedFromDirection(variation.value!, varDir) : 0
  const d = valid ? signedFromDirection(deviation.value!, devDir) : 0

  let chain = null
  let rule = ''
  if (valid) {
    if (mode === 'toTrue') {
      const r = compassToTrue(course.value!, d, v)
      rule = 'Kompass → rechtweisend: Ost addieren, West subtrahieren.'
      chain = (
        <Chain
          highlight="T"
          items={[
            { key: 'C', label: 'Compass', value: formatBearing(course.value!, 0) },
            { key: 'D', label: 'Deviation', value: signed(d), note: devDir === 'E' ? 'Ost: +' : 'West: −' },
            { key: 'M', label: 'Magnetic', value: formatBearing(r.magnetic, 0) },
            { key: 'V', label: 'Variation', value: signed(v), note: varDir === 'E' ? 'Ost: +' : 'West: −' },
            { key: 'T', label: 'True', value: formatBearing(r.true, 0) },
          ]}
        />
      )
    } else {
      const r = trueToCompass(course.value!, v, d)
      rule = 'Rechtweisend → Kompass: Ost subtrahieren, West addieren.'
      chain = (
        <Chain
          highlight="C"
          items={[
            { key: 'T', label: 'True', value: formatBearing(course.value!, 0) },
            { key: 'V', label: 'Variation', value: signed(-v), note: varDir === 'E' ? 'Ost: −' : 'West: +' },
            { key: 'M', label: 'Magnetic', value: formatBearing(r.magnetic, 0) },
            { key: 'D', label: 'Deviation', value: signed(-d), note: devDir === 'E' ? 'Ost: −' : 'West: +' },
            { key: 'C', label: 'Compass', value: formatBearing(r.compass, 0) },
          ]}
        />
      )
    }
  }

  return (
    <div className="space-y-4">
      <Toggle
        label="Richtung der Umrechnung"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'toTrue', label: 'Kompass → rechtweisend' },
          { value: 'toCompass', label: 'Rechtweisend → Kompass' },
        ]}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField label={mode === 'toTrue' ? 'Kompasskurs' : 'Rechtweisender Kurs'} unit="°" field={course} />
        <div className="space-y-2">
          <NumberField label="Variation" unit="°" field={variation} />
          <Toggle label="Variation Ost oder West" value={varDir} onChange={setVarDir} options={[{ value: 'E', label: 'Ost' }, { value: 'W', label: 'West' }]} />
        </div>
        <div className="space-y-2">
          <NumberField label="Deviation" unit="°" field={deviation} />
          <Toggle label="Deviation Ost oder West" value={devDir} onChange={setDevDir} options={[{ value: 'E', label: 'Ost' }, { value: 'W', label: 'West' }]} />
        </div>
      </div>
      {chain ?? <p className="text-sm text-muted-foreground">Bitte gültige Werte eingeben.</p>}
      {rule && (
        <p className="rounded-lg bg-accent/50 p-3 text-sm">
          <b>Regel:</b> {rule} Merkhilfe: <b>C</b>adbury's <b>D</b>airy <b>M</b>ilk <b>V</b>ery <b>T</b>asty – von C nach T gilt „Ost-Plus".
        </p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Deviationstabelle */

export const DEMO_DEVIATION: DeviationPoint[] = [
  { heading: 0, deviation: 3 },
  { heading: 45, deviation: 5 },
  { heading: 90, deviation: 4 },
  { heading: 135, deviation: 1 },
  { heading: 180, deviation: -2 },
  { heading: 225, deviation: -5 },
  { heading: 270, deviation: -4 },
  { heading: 315, deviation: -1 },
]

export function DeviationTableWidget() {
  const [heading, setHeading] = useState(60)
  const dev = deviationAt(DEMO_DEVIATION, heading)
  const magnetic = normalizeAngle(heading + dev)
  const W = 340
  const H = 150
  const x = (h: number) => 28 + (h / 360) * (W - 40)
  const y = (dv: number) => H / 2 - dv * 8
  const pts = [...DEMO_DEVIATION, { heading: 360, deviation: DEMO_DEVIATION[0].deviation }]

  return (
    <div className="grid gap-4 md:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Die Deviationstabelle (Deviationskarte) gilt für <b>Kompasskurse</b> und wird beim Kompassjustieren auf dem Boot erstellt. Zwischen den Tabellenwerten wird linear interpoliert.
        </p>
        <table className="w-full max-w-md text-right font-mono text-sm tabular-nums">
          <thead className="text-muted-foreground">
            <tr>
              <th className="text-left font-medium">Kompasskurs</th>
              <th className="font-medium">Deviation</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_DEVIATION.map((p) => (
              <tr key={p.heading} className="border-t">
                <td className="py-0.5 text-left">{formatBearing(p.heading, 0)}</td>
                <td>{p.deviation >= 0 ? `${p.deviation}°E` : `${-p.deviation}°W`}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="space-y-1">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Kompasskurs</span>
            <span className="font-mono">{formatBearing(heading, 0)}</span>
          </div>
          <Slider value={[heading]} min={0} max={359} step={1} onValueChange={([v]) => setHeading(v)} aria-label="Kompasskurs" />
        </div>
        <Chain
          highlight="M"
          items={[
            { key: 'C', label: 'Compass', value: formatBearing(heading, 0) },
            { key: 'D', label: 'Deviation (interpoliert)', value: signed(dev) },
            { key: 'M', label: 'Magnetic', value: formatBearing(magnetic, 0) },
          ]}
        />
        <p className="text-sm text-muted-foreground">
          Umgekehrt (Magnetisch → Kompass) muss die Tabelle „rückwärts" gelesen werden: Kompass-Kurs für Magnetic {formatBearing(magnetic, 0)} = {formatBearing(magneticToCompassWithTable(magnetic, DEMO_DEVIATION), 0)}.
        </p>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Deviationskurve">
        <line x1={28} x2={W - 12} y1={y(0)} y2={y(0)} stroke="var(--muted-foreground)" />
        {[0, 90, 180, 270, 360].map((h) => (
          <g key={h}>
            <line x1={x(h)} x2={x(h)} y1={10} y2={H - 22} stroke="var(--chart-grid)" />
            <text x={x(h)} y={H - 8} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
              {h === 360 ? '000' : String(h).padStart(3, '0')}
            </text>
          </g>
        ))}
        {[-5, 0, 5].map((dv) => (
          <text key={dv} x={4} y={y(dv) + 3} fontSize={9} fill="var(--muted-foreground)">
            {dv > 0 ? `+${dv}` : dv}
          </text>
        ))}
        <polyline points={pts.map((p) => `${x(p.heading)},${y(p.deviation)}`).join(' ')} fill="none" stroke="var(--vec-ground)" strokeWidth={2.5} />
        <circle cx={x(heading)} cy={y(dev)} r={5} fill="var(--vec-water)" />
        <text x={W / 2} y={12} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
          Deviation (+ Ost / − West) über Kompasskurs
        </text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Variation im Jahr */

export function VariationYearWidget() {
  const [dir, setDir] = useState<'E' | 'W'>('W')
  const [changeDir, setChangeDir] = useState<'E' | 'W'>('E')
  const deg = useNumberField('4', { min: 0, max: 40, integer: true })
  const min = useNumberField('30', { min: 0, max: 59, integer: true })
  const chartYear = useNumberField('2015', { min: 1900, max: 2100, integer: true })
  const change = useNumberField('6', { min: 0, max: 30 })
  const year = useNumberField(String(new Date().getFullYear()), { min: 1900, max: 2100, integer: true })
  const valid = fieldsValid(deg, min, chartYear, change, year)
  const base = valid ? signedFromDirection(deg.value! + min.value! / 60, dir) : 0
  const annual = valid ? signedFromDirection(change.value! / 60, changeDir) : 0
  const now = valid ? variationForYear(base, chartYear.value!, annual, year.value!) : 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Die Kompassrose der Karte nennt Variation, Jahr und jährliche Änderung (z. B. „4°30′W 2015 (6′E)": westliche Variation nimmt jährlich um 6′ ab, weil der Wert nach Osten wandert).
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="Grad" field={deg} />
          <NumberField label="Minuten" field={min} />
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Richtung</div>
          <Toggle label="Variation Ost oder West" value={dir} onChange={setDir} options={[{ value: 'E', label: 'Ost' }, { value: 'W', label: 'West' }]} />
        </div>
        <NumberField label="Jahr der Karte" field={chartYear} />
        <NumberField label="Zieljahr" field={year} />
        <NumberField label="Jährliche Änderung" unit="′" field={change} />
        <div className="space-y-2">
          <div className="text-sm font-medium">Änderung nach …</div>
          <Toggle label="Änderung Ost oder West" value={changeDir} onChange={setChangeDir} options={[{ value: 'E', label: 'Ost' }, { value: 'W', label: 'West' }]} />
        </div>
      </div>
      {valid ? (
        <div className="rounded-lg bg-primary/10 p-3 ring-1 ring-primary/40">
          <div className="text-xs text-muted-foreground">Variation {year.value}</div>
          <div className="font-mono text-xl font-semibold">{formatVariation(now)}</div>
          <div className="text-sm text-muted-foreground">
            Rechnung: {formatVariation(base)} {annual >= 0 ? '+' : '−'} {year.value! - chartYear.value!} Jahre × {formatNumber(Math.abs(change.value!), 0)}′ = {formatVariation(now)} (gerundet in der Praxis: {Math.round(now) === 0 ? '0°' : `${Math.abs(Math.round(now))}°${now >= 0 ? 'E' : 'W'}`})
          </div>
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">Bitte gültige Werte eingeben.</p>
      )}
    </div>
  )
}
