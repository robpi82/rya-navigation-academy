import { useState, type ReactNode } from 'react'
import { ArrowDown, ArrowRight, Calculator, CalendarClock, Map as MapIcon } from 'lucide-react'
import {
  deviationAt,
  formatBearing,
  formatNumber,
  formatVariation,
  magneticToCompassWithTable,
  normalizeAngle,
  signedFromDirection,
  type DeviationPoint,
} from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, fieldsValid, useNumberField } from '@/modules/calculators/fields'
import { conversionSteps, interpolationBracket, variationSteps, type ConversionStep } from './compass/lessonMath'

const f1 = (n: number) => formatNumber(n, 1)
/** ganze Zahlen ohne Nachkomma, sonst eine Stelle */
const num = (n: number) => (Number.isInteger(n) ? String(n) : f1(n))
const signed = (n: number) => (n === 0 ? '0°' : `${n > 0 ? '+' : '−'}${num(Math.abs(n))}°`)
const deg = (n: number) => formatBearing(n, Number.isInteger(n) ? 0 : 1)
const ew = (n: number) => (n === 0 ? '0°' : `${num(Math.abs(n))}°${n > 0 ? 'E' : 'W'}`)

const NAMES = {
  C: { en: 'Compass', de: 'Kompass' },
  D: { en: 'Deviation', de: 'Ablenkung' },
  M: { en: 'Magnetic', de: 'Missweisend' },
  V: { en: 'Variation', de: 'Missweisung' },
  T: { en: 'True', de: 'Rechtweisend' },
} as const

/* ------------------------------------------------------------------ Bausteine */

/** Umschalter mit türkiser Markierung (interaktive Elemente sind in Lektion 1 türkis). */
function Segmented<T extends string>({ value, options, onChange, label, className }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string; className?: string }) {
  return (
    <div className={cn('inline-flex max-w-full flex-wrap rounded-lg border bg-background/60 p-1', className)} role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'min-h-9 rounded-md px-3 py-1.5 text-sm font-medium transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
            value === o.value ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

const EW_OPTIONS = [
  { value: 'E' as const, label: 'Ost (E)' },
  { value: 'W' as const, label: 'West (W)' },
]

function Panel({ step, title, icon, children, className }: { step?: number; title: string; icon?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn('rounded-xl border bg-background/40 p-4 sm:p-5', className)}>
      <h4 className="mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide text-(--lesson-gold) uppercase">
        {step !== undefined && (
          <span className="grid size-6 place-items-center rounded-full bg-(--lesson-gold-soft) font-mono text-xs" aria-hidden>
            {step}
          </span>
        )}
        {icon}
        {title}
      </h4>
      {children}
    </section>
  )
}

type ChainItem = { key: keyof typeof NAMES; value: string; note?: string; kind: 'value' | 'correction' }

/** Kette Compass → Deviation → Magnetic → Variation → True; das Ergebnis ist golden hervorgehoben. */
function Chain({ items, result }: { items: ChainItem[]; result: keyof typeof NAMES }) {
  return (
    <ol className="flex flex-col items-stretch gap-1.5 md:flex-row md:items-center" aria-label="Umrechnungskette">
      {items.map((it, i) => {
        const isResult = it.key === result
        return (
          <li key={it.key} className="flex flex-col items-stretch gap-1.5 md:flex-1 md:flex-row md:items-center">
            <div
              className={cn(
                'flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 md:block md:flex-1 md:px-2 md:py-3 md:text-center',
                it.kind === 'correction' && 'border-primary/40 bg-(--lesson-teal-soft)',
                it.kind === 'value' && !isResult && 'bg-card',
                isResult && 'border-(--lesson-gold) bg-(--lesson-gold-soft) shadow-[0_0_0_1px_var(--lesson-gold),0_8px_30px_-12px_var(--lesson-gold)]',
              )}
              aria-current={isResult ? 'true' : undefined}
            >
              <div>
                <div className={cn('text-xs font-semibold tracking-wide uppercase', isResult ? 'text-(--lesson-gold)' : it.kind === 'correction' ? 'text-primary' : 'text-muted-foreground')}>
                  {NAMES[it.key].en}
                </div>
                <div className="text-[11px] text-muted-foreground">{isResult ? 'Ergebnis' : NAMES[it.key].de}</div>
              </div>
              <div className="text-right md:text-center">
                <div className={cn('font-mono font-semibold tabular-nums', isResult ? 'text-2xl text-(--lesson-gold) md:text-3xl' : 'text-lg')}>{it.value}</div>
                {it.note && <div className="text-[11px] text-muted-foreground">{it.note}</div>}
              </div>
            </div>
            {i < items.length - 1 && (
              <span className="flex justify-center text-muted-foreground" aria-hidden>
                <ArrowDown className="size-4 md:hidden" />
                <ArrowRight className="hidden size-4 shrink-0 md:block" />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}

/* ------------------------------------------------------------------ Umrechnung C ↔ T */

function ruleWord(mode: 'toTrue' | 'toCompass', signedValue: number) {
  if (signedValue === 0) return 'keine Korrektur'
  const east = signedValue > 0
  if (mode === 'toTrue') return east ? 'Ost addieren' : 'West subtrahieren'
  return east ? 'Ost subtrahieren' : 'West addieren'
}

function StepLine({ step, mode }: { step: ConversionStep; mode: 'toTrue' | 'toCompass' }) {
  const c = step.correction
  return (
    <li className="rounded-lg border bg-card/60 p-3">
      <div className="font-mono text-sm tabular-nums sm:text-base">
        <span className="text-muted-foreground">{NAMES[step.from.key].en}</span> {deg(step.from.value)}{' '}
        <span className="font-semibold text-primary">
          {step.applied < 0 ? '−' : '+'} {num(Math.abs(step.applied))}°
        </span>{' '}
        = <span className="font-semibold">{step.normalized ? `${num(step.raw)}°` : deg(step.raw)}</span>
        {step.normalized && <span className="text-muted-foreground"> → normiert {deg(step.to.value)}</span>}{' '}
        <span className="text-muted-foreground">{NAMES[step.to.key].en}</span>
      </div>
      <div className="mt-1 text-xs text-muted-foreground">
        {NAMES[c.key].en} {ew(c.signed)}: {ruleWord(mode, c.signed)}
        {step.normalized && ' · Ergebnisse über 360° bzw. unter 0° auf 000°–359° normieren'}
      </div>
    </li>
  )
}

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
  const steps = valid ? conversionSteps(mode, course.value!, d, v) : []

  let items: ChainItem[] = []
  if (valid) {
    const [s1, s2] = steps
    const sign = (s: ConversionStep) => `${s.correction.signed > 0 ? 'Ost' : 'West'}: ${s.applied >= 0 ? '+' : '−'}`
    items = [
      { key: s1.from.key, value: deg(s1.from.value), kind: 'value' },
      { key: s1.correction.key, value: signed(s1.applied), note: s1.correction.signed === 0 ? undefined : sign(s1), kind: 'correction' },
      { key: 'M', value: deg(s1.to.value), kind: 'value' },
      { key: s2.correction.key, value: signed(s2.applied), note: s2.correction.signed === 0 ? undefined : sign(s2), kind: 'correction' },
      { key: s2.to.key, value: deg(s2.to.value), kind: 'value' },
    ]
  }
  const rule = mode === 'toTrue' ? 'Kompass → rechtweisend: Ost addieren, West subtrahieren.' : 'Rechtweisend → Kompass: Ost subtrahieren, West addieren.'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Segmented
          label="Richtung der Umrechnung"
          value={mode}
          onChange={setMode}
          options={[
            { value: 'toTrue', label: 'Kompass → rechtweisend' },
            { value: 'toCompass', label: 'Rechtweisend → Kompass' },
          ]}
        />
        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="size-2 rounded-full bg-primary motion-safe:animate-pulse" aria-hidden /> Ergebnis rechnet bei jeder Eingabe mit
        </span>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Panel title={mode === 'toTrue' ? 'Kompasskurs' : 'Rechtweisender Kurs'}>
          <NumberField label={mode === 'toTrue' ? 'Kompasskurs (C)' : 'Rechtweisender Kurs (T)'} unit="°" field={course} />
        </Panel>
        <Panel title="Variation">
          <div className="space-y-3">
            <NumberField label="Variation (V)" unit="°" field={variation} />
            <Segmented label="Variation Ost oder West" value={varDir} onChange={setVarDir} options={EW_OPTIONS} />
          </div>
        </Panel>
        <Panel title="Deviation">
          <div className="space-y-3">
            <NumberField label="Deviation (D)" unit="°" field={deviation} />
            <Segmented label="Deviation Ost oder West" value={devDir} onChange={setDevDir} options={EW_OPTIONS} />
          </div>
        </Panel>
      </div>

      {valid ? (
        <>
          <div aria-live="polite">
            <Chain items={items} result={mode === 'toTrue' ? 'T' : 'C'} />
          </div>
          <div>
            <h4 className="mb-2 text-sm font-semibold">Rechenweg Schritt für Schritt</h4>
            <ol className="grid gap-2 lg:grid-cols-2">
              {steps.map((s) => (
                <StepLine key={s.from.key} step={s} mode={mode} />
              ))}
            </ol>
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Bitte gültige Werte eingeben.</p>
      )}
      <p className="rounded-xl border border-(--lesson-gold)/40 bg-(--lesson-gold-soft) p-4 text-sm leading-relaxed">
        <b className="text-(--lesson-gold)">Regel:</b> {rule} Merkhilfe: <b>C</b>adbury's <b>D</b>airy <b>M</b>ilk <b>V</b>ery <b>T</b>asty – von C nach T gilt „Ost-Plus".
      </p>
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

const devLabel = (dv: number) => (dv >= 0 ? `${dv}°E` : `${-dv}°W`)

export function DeviationTableWidget() {
  const [heading, setHeading] = useState(60)
  const dev = deviationAt(DEMO_DEVIATION, heading)
  const magnetic = normalizeAngle(heading + dev)
  const br = interpolationBracket(DEMO_DEVIATION, heading)
  const W = 440
  const H = 230
  const x = (h: number) => 34 + (h / 360) * (W - 48)
  const y = (dv: number) => H / 2 - 4 - dv * 15
  const pts = [...DEMO_DEVIATION, { heading: 360, deviation: DEMO_DEVIATION[0].deviation }]
  const inBracket = (p: DeviationPoint) => p.heading === br.a.heading || p.heading === br.b.heading

  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Die Deviationstabelle (Deviationskarte) gilt für <b className="term">Kompasskurse</b> und wird beim Kompassjustieren auf dem Boot erstellt. Zwischen den Tabellenwerten wird linear interpoliert.
      </p>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="overflow-hidden rounded-xl border bg-background/40">
          <table className="w-full text-right font-mono text-sm tabular-nums">
            <caption className="sr-only">Deviationstabelle des Beispielboots</caption>
            <thead className="bg-muted/60 text-xs tracking-wide text-(--lesson-gold) uppercase">
              <tr>
                <th scope="col" className="px-4 py-2.5 text-left font-semibold">Kompasskurs</th>
                <th scope="col" className="px-4 py-2.5 font-semibold">Deviation</th>
              </tr>
            </thead>
            <tbody>
              {DEMO_DEVIATION.map((p) => (
                <tr key={p.heading} className={cn('border-t transition-colors', inBracket(p) && 'bg-(--lesson-teal-soft) text-primary')}>
                  <td className="px-4 py-1.5 text-left">{formatBearing(p.heading, 0)}</td>
                  <td className="px-4 py-1.5">{devLabel(p.deviation)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <figure className="flex flex-col rounded-xl border bg-(--chart-sea) p-2">
          <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Deviationskurve; markiert: Kompasskurs ${formatBearing(heading, 0)}, Deviation ${signed(dev)}`}>
            <text x={W / 2} y={14} fontSize={11} textAnchor="middle" fill="var(--muted-foreground)">
              Deviation (+ Ost / − West) über Kompasskurs
            </text>
            {[-5, 0, 5].map((dv) => (
              <g key={dv}>
                <line x1={34} x2={W - 14} y1={y(dv)} y2={y(dv)} stroke={dv === 0 ? 'var(--muted-foreground)' : 'var(--chart-grid)'} strokeDasharray={dv === 0 ? undefined : '3 4'} />
                <text x={8} y={y(dv) + 4} fontSize={10} fill="var(--muted-foreground)">
                  {dv > 0 ? `+${dv}` : dv}
                </text>
              </g>
            ))}
            {[0, 90, 180, 270, 360].map((h) => (
              <g key={h}>
                <line x1={x(h)} x2={x(h)} y1={24} y2={H - 26} stroke="var(--chart-grid)" />
                <text x={x(h)} y={H - 10} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
                  {h === 360 ? '000' : String(h).padStart(3, '0')}
                </text>
              </g>
            ))}
            <polyline points={pts.map((p) => `${x(p.heading)},${y(p.deviation)}`).join(' ')} fill="none" stroke="var(--vec-ground)" strokeWidth={2.5} strokeLinejoin="round" />
            {pts.map((p) => (
              <circle key={p.heading} cx={x(p.heading)} cy={y(p.deviation)} r={3} fill="var(--vec-ground)" />
            ))}
            <line x1={x(heading)} x2={x(heading)} y1={24} y2={H - 26} stroke="var(--lesson-gold)" strokeDasharray="4 3" />
            <circle cx={x(heading)} cy={y(dev)} r={6.5} fill="var(--lesson-gold)" stroke="var(--background)" strokeWidth={2} />
          </svg>
          <figcaption className="px-2 pb-1 text-xs text-muted-foreground">Türkis: Werte der Tabelle · Gold: dein Kompasskurs</figcaption>
        </figure>
      </div>

      <div className="space-y-2 rounded-xl border bg-background/40 p-4 sm:p-5">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Kompasskurs</span>
          <span className="font-mono text-primary">{formatBearing(heading, 0)}</span>
        </div>
        <Slider value={[heading]} min={0} max={359} step={1} onValueChange={([val]) => setHeading(val)} aria-label="Kompasskurs" />
        <p className="pt-2 font-mono text-xs leading-relaxed text-muted-foreground sm:text-sm">
          Interpolation zwischen {formatBearing(br.a.heading, 0)} ({devLabel(br.a.deviation)}) und {formatBearing(br.bHeading, 0)} ({devLabel(br.b.deviation)}):{' '}
          {signed(br.a.deviation)} + ({signed(br.b.deviation)} − {signed(br.a.deviation)}) × {num(normalizeAngle(heading - br.a.heading))}/{br.bHeading - br.a.heading} ={' '}
          <span className="font-semibold text-primary">{signed(dev)}</span>
        </p>
      </div>

      <Chain
        result="M"
        items={[
          { key: 'C', value: formatBearing(heading, 0), kind: 'value' },
          { key: 'D', value: signed(dev), note: 'interpoliert', kind: 'correction' },
          { key: 'M', value: formatBearing(magnetic, 0), kind: 'value' },
        ]}
      />
      <p className="text-sm text-muted-foreground">
        Umgekehrt (Magnetisch → Kompass) muss die Tabelle „rückwärts" gelesen werden: Kompass-Kurs für Magnetic {formatBearing(magnetic, 0)} = {formatBearing(magneticToCompassWithTable(magnetic, DEMO_DEVIATION), 0)}.
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ Variation im Jahr */

export function VariationYearWidget() {
  const currentYear = new Date().getFullYear()
  const [dir, setDir] = useState<'E' | 'W'>('W')
  const [changeDir, setChangeDir] = useState<'E' | 'W'>('E')
  const deg0 = useNumberField('4', { min: 0, max: 40, integer: true })
  const min = useNumberField('30', { min: 0, max: 59, integer: true })
  const chartYear = useNumberField('2015', { min: 1900, max: 2100, integer: true })
  const change = useNumberField('6', { min: 0, max: 30 })
  const year = useNumberField(String(currentYear), { min: 1900, max: 2100, integer: true })
  const chartValid = fieldsValid(deg0, min, chartYear, change)
  const valid = chartValid && fieldsValid(year)
  const base = chartValid ? signedFromDirection(deg0.value! + min.value! / 60, dir) : 0
  const annual = chartValid ? signedFromDirection(change.value! / 60, changeDir) : 0
  const r = valid ? variationSteps(base, chartYear.value!, annual, year.value!) : null
  const now = r?.result ?? 0
  const rounded = Math.round(now) === 0 ? '0°' : `${Math.abs(Math.round(now))}°${now >= 0 ? 'E' : 'W'}`

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed text-muted-foreground">
        Die Kompassrose der Karte nennt Variation, Jahr und jährliche Änderung (z. B. „4°30′W 2015 (6′E)": westliche Variation nimmt jährlich um 6′ ab, weil der Wert nach Osten wandert).
      </p>
      <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
        <Panel step={1} title="Angaben aus der Seekarte" icon={<MapIcon className="size-4" aria-hidden />}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Grad" field={deg0} />
                <NumberField label="Minuten" field={min} />
              </div>
              <div className="space-y-1.5">
                <div className="text-sm font-medium">Richtung</div>
                <Segmented label="Variation Ost oder West" value={dir} onChange={setDir} options={EW_OPTIONS} />
              </div>
            </div>
            <div className="space-y-3">
              <NumberField label="Jahr der Karte" field={chartYear} />
              <NumberField label="Jährliche Änderung" unit="′" field={change} />
              <div className="space-y-1.5">
                <div className="text-sm font-medium">Änderung nach …</div>
                <Segmented label="Änderung Ost oder West" value={changeDir} onChange={setChangeDir} options={EW_OPTIONS} />
              </div>
            </div>
          </div>
          {chartValid && (
            <p className="mt-4 rounded-lg bg-muted/60 px-3 py-2 text-sm">
              So steht es in der Kartenrose:{' '}
              <span className="font-mono font-semibold text-(--lesson-gold)">
                {formatVariation(base)} {chartYear.value} ({num(change.value!)}′{changeDir})
              </span>
            </p>
          )}
        </Panel>
        <Panel step={2} title="Gewünschtes Zieljahr" icon={<CalendarClock className="size-4" aria-hidden />}>
          <div className="space-y-3">
            <NumberField label="Zieljahr" field={year} />
            {year.value !== currentYear && (
              <button type="button" onClick={() => year.setText(String(currentYear))} className="text-sm font-medium text-primary underline-offset-4 hover:underline">
                Aktuelles Jahr ({currentYear}) einsetzen
              </button>
            )}
            {r && (
              <p className="text-sm text-muted-foreground">
                {r.years === 0 ? 'Gleiches Jahr wie die Karte.' : `${Math.abs(r.years)} Jahre ${r.years > 0 ? 'nach' : 'vor'} dem Kartenjahr ${chartYear.value}.`}
              </p>
            )}
          </div>
        </Panel>
      </div>

      <Panel step={3} title="Berechnung und Ergebnis" icon={<Calculator className="size-4" aria-hidden />}>
        {r ? (
          <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-center">
            <ol className="space-y-2 text-sm">
              <li className="rounded-lg border bg-card/60 p-3">
                <span className="text-muted-foreground">Jahre:</span>{' '}
                <span className="font-mono">
                  {year.value} − {chartYear.value} = {r.years}
                </span>
              </li>
              <li className="rounded-lg border bg-card/60 p-3">
                <span className="text-muted-foreground">Änderung:</span>{' '}
                <span className="font-mono">
                  {r.years} × {num(change.value!)}′ {changeDir === 'E' ? 'Ost' : 'West'} = {formatVariation(r.total)}
                </span>
              </li>
              <li className="rounded-lg border bg-card/60 p-3">
                <span className="text-muted-foreground">Rechnung:</span>{' '}
                <span className="font-mono">
                  {formatVariation(base)} {annual >= 0 ? '+' : '−'} {r.years} Jahre × {formatNumber(Math.abs(change.value!), 0)}′ = <b className="text-primary">{formatVariation(now)}</b>
                </span>
                <div className="mt-1 text-xs text-muted-foreground">
                  Ost positiv, West negativ: {f1(base).replace('-', '−')}° {r.total >= 0 ? '+' : '−'} {f1(Math.abs(r.total))}° = {f1(now).replace('-', '−')}°
                </div>
              </li>
            </ol>
            <div className="rounded-xl border border-(--lesson-gold) bg-(--lesson-gold-soft) p-5 text-center shadow-[0_8px_30px_-12px_var(--lesson-gold)]" aria-live="polite">
              <div className="text-xs font-semibold tracking-wide text-(--lesson-gold) uppercase">Variation {year.value}</div>
              <div className="mt-1 font-mono text-3xl font-semibold text-(--lesson-gold)">{formatVariation(now)}</div>
              <div className="mt-1 text-sm text-muted-foreground">gerundet in der Praxis: {rounded}</div>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Bitte gültige Werte eingeben.</p>
        )}
      </Panel>
    </div>
  )
}
