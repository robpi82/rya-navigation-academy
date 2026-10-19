import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { describeLight, formatNumber, geographicRange, LIGHT_CSS_COLOR, lightTimeline, parseLight, waterDepth } from '@/calculations'
import { CHART_SYMBOLS, SYMBOL_CATEGORY_LABEL, type SymbolCategory } from '@/data/chartSymbols'
import { useLightPhase } from '@/hooks/useLightPhase'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, fieldsValid, useNumberField } from '@/modules/calculators/fields'

/* ------------------------------------------------------------------ Symbol- und Abkürzungsverzeichnis */

export function SymbolBrowserWidget() {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState<SymbolCategory | 'all'>('all')
  const q = query.trim().toLowerCase()
  const list = CHART_SYMBOLS.filter(
    (s) => (cat === 'all' || s.category === cat) && (!q || [s.abbr, s.english, s.german, s.note ?? ''].some((t) => t.toLowerCase().includes(q))),
  )
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative w-full sm:w-72">
          <Search className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen: Wk, Wrack, Sand …"
            aria-label="Symbole suchen"
            className="h-10 w-full rounded-md border bg-background pr-3 pl-9 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-1.5" role="group" aria-label="Kategorie">
          <Button size="sm" variant={cat === 'all' ? 'default' : 'outline'} onClick={() => setCat('all')} aria-pressed={cat === 'all'}>
            Alle
          </Button>
          {(Object.keys(SYMBOL_CATEGORY_LABEL) as SymbolCategory[]).map((c) => (
            <Button key={c} size="sm" variant={cat === c ? 'default' : 'outline'} onClick={() => setCat(c)} aria-pressed={cat === c}>
              {SYMBOL_CATEGORY_LABEL[c]}
            </Button>
          ))}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {list.length} von {CHART_SYMBOLS.length} Einträgen
      </p>
      <ul className="grid gap-2 md:grid-cols-2">
        {list.map((s) => (
          <li key={s.id} className="flex gap-3 rounded-lg border p-3">
            <div className="flex h-10 min-w-16 items-center justify-center rounded-md bg-[var(--chart-water)] px-2 font-mono text-sm font-semibold">{s.abbr}</div>
            <div className="min-w-0">
              <div className="text-sm font-medium">
                {s.german} <span className="font-normal text-muted-foreground">· {s.english}</span>
              </div>
              {s.note && <p className="text-xs text-muted-foreground">{s.note}</p>}
              <Badge variant="outline" className="mt-1">
                {SYMBOL_CATEGORY_LABEL[s.category]}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
      {list.length === 0 && <p className="text-sm text-muted-foreground">Nichts gefunden – andere Schreibweise oder Kategorie probieren.</p>}
    </div>
  )
}

/* ------------------------------------------------------------------ Feuerkennung entschlüsseln */

const EXAMPLES = ['Fl(2) 10s 24m 15M', 'Iso WR 6s 18m 12M', 'Q(6)+LFl 15s', 'VQ(3) 5s', 'Oc(2) WRG 12s 20m 14M', 'LFl 10s', 'Mo(A) 8s', 'Fl(2+1) R 10s', 'F G 15m 5M']

export function LightDecoderWidget() {
  const [text, setText] = useState(EXAMPLES[0])
  const result = useMemo(() => parseLight(text), [text])
  const timeline = result.ok ? lightTimeline(result.spec) : null
  const on = useLightPhase(timeline)
  const color = result.ok ? LIGHT_CSS_COLOR[result.spec.colors[0]] : '#fff'
  const total = timeline?.reduce((s, x) => s + x.duration, 0) ?? 0

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="light-input" className="text-sm font-medium">
          Kennung wie in der Karte (z. B. <span className="font-mono">Fl(2) WR 10s 24m 15M</span>)
        </label>
        <input
          id="light-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          aria-invalid={!result.ok}
          className={cn('h-11 w-full max-w-lg rounded-md border bg-background px-3 font-mono text-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none', !result.ok && 'border-destructive')}
        />
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((e) => (
            <Button key={e} size="sm" variant={text === e ? 'secondary' : 'outline'} className="font-mono text-xs" onClick={() => setText(e)}>
              {e}
            </Button>
          ))}
        </div>
      </div>
      {!result.ok && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{result.error}</p>}
      {result.ok && (
        <div className="grid gap-4 md:grid-cols-[1fr_220px]">
          <div className="space-y-3">
            <ul className="list-disc space-y-1 pl-5 text-sm">
              {describeLight(result.spec).map((l) => (
                <li key={l}>{l}</li>
              ))}
            </ul>
            {timeline ? (
              <div>
                <div className="mb-1 text-xs text-muted-foreground">Eine Periode ({formatNumber(total, 1)} s) – gelb = Licht an</div>
                <div className="flex h-6 overflow-hidden rounded border bg-black" aria-hidden>
                  {timeline.map((seg, i) => (
                    <div key={i} style={{ width: `${(seg.duration / total) * 100}%`, background: seg.on ? color : 'transparent' }} />
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-sm text-destructive">Diese Kennung passt zeitlich nicht in die angegebene Periode.</p>
            )}
          </div>
          <div className="flex flex-col items-center justify-center rounded-lg bg-[#0a1424] p-4" aria-label="Animiertes Feuer">
            <svg viewBox="0 0 80 100" className="h-28 w-24">
              <circle cx={40} cy={30} r={on ? 26 : 0} fill={color} opacity={0.3} />
              <circle cx={40} cy={30} r={9} fill={on ? color : '#374151'} stroke="#000" strokeOpacity={0.4} />
              <path d="M30,92 L34,40 L46,40 L50,92 Z" fill="#e5e7eb" />
              <rect x={32} y={58} width={16} height={8} fill="#ef4444" />
              <rect x={31} y={76} width={18} height={8} fill="#ef4444" />
            </svg>
            <div className="text-xs text-slate-400">{on ? 'an' : 'aus'}</div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Tiefen im Kartenausschnitt */

interface ChartPoint {
  id: string
  x: number
  y: number
  /** positiv = Lotung, negativ = Trockenhöhe */
  charted: number
  label: string
}

const POINTS: ChartPoint[] = [
  { id: 'a', x: 40, y: 38, charted: 9.4, label: 'Tiefwasser' },
  { id: 'b', x: 120, y: 62, charted: 4.1, label: 'Fahrwasser' },
  { id: 'c', x: 205, y: 48, charted: 2.2, label: 'Flachstelle' },
  { id: 'd', x: 270, y: 92, charted: -0.8, label: 'Sandbank (trockenfallend)' },
  { id: 'e', x: 90, y: 118, charted: -2.1, label: 'Felsen (trockenfallend)' },
  { id: 'f', x: 185, y: 118, charted: 1.3, label: 'Untiefe' },
]

function Sounding({ p }: { p: ChartPoint }) {
  const v = Math.abs(p.charted)
  const whole = Math.floor(v + 1e-9)
  const dec = Math.round((v - whole) * 10)
  const drying = p.charted < 0
  return (
    <g fontFamily="serif" fill="#1e3a8a" fontStyle="italic">
      <text x={p.x} y={p.y} fontSize={15} textDecoration={drying ? 'underline' : undefined}>
        {whole}
      </text>
      <text x={p.x + (whole >= 10 ? 17 : 9)} y={p.y + 4} fontSize={9} textDecoration={drying ? 'underline' : undefined}>
        {dec}
      </text>
    </g>
  )
}

export function SoundingsWidget() {
  const [ht, setHt] = useState(2.0)
  const draught = useNumberField('1.6', { min: 0.2, max: 4 })
  const margin = useNumberField('0.5', { min: 0, max: 2 })
  const valid = fieldsValid(draught, margin)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Gelesene Tiefen beziehen sich auf das Kartennull. Die <b>tatsächliche</b> Tiefe ist Kartentiefe + Höhe der Gezeit. <b>Unterstrichene</b> Zahlen sind Trockenhöhen: Wassertiefe = Höhe der Gezeit − Trockenhöhe.
      </p>
      <div className="grid gap-4 md:grid-cols-[360px_1fr]">
        <svg viewBox="0 0 320 150" className="h-auto w-full rounded-lg border" role="img" aria-label="Kartenausschnitt mit Lotungen">
          <rect width={320} height={150} fill="var(--chart-water)" />
          <path d="M215,150 Q240,112 262,98 Q290,82 320,86 L320,150 Z" fill="#c9e6a9" opacity={0.7} />
          <path d="M70,140 Q82,112 108,112 Q120,130 110,150 Z" fill="#c9e6a9" opacity={0.7} />
          {POINTS.map((p) => {
            const depth = valid ? waterDepth(p.charted, ht) : 0
            const bad = valid && depth < draught.value! + margin.value!
            return (
              <g key={p.id}>
                <circle cx={p.x + 6} cy={p.y - 5} r={17} fill={bad ? 'var(--destructive)' : 'var(--success)'} opacity={0.18} />
                <Sounding p={p} />
              </g>
            )
          })}
        </svg>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 sm:max-w-xs">
            <NumberField label="Tiefgang" unit="m" field={draught} />
            <NumberField label="Sicherheit" unit="m" field={margin} />
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">Höhe der Gezeit</span>
              <span className="font-mono">{formatNumber(ht, 1)} m</span>
            </div>
            <Slider value={[ht]} min={0} max={6} step={0.1} onValueChange={([v]) => setHt(v)} aria-label="Höhe der Gezeit" />
          </div>
          {valid && (
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="font-medium">Stelle</th>
                  <th className="font-medium">Karte</th>
                  <th className="font-medium">Wassertiefe</th>
                  <th className="font-medium">befahrbar?</th>
                </tr>
              </thead>
              <tbody>
                {POINTS.map((p) => {
                  const depth = waterDepth(p.charted, ht)
                  const ok = depth >= draught.value! + margin.value!
                  return (
                    <tr key={p.id} className="border-t">
                      <td className="py-1 pr-2">{p.label}</td>
                      <td className="font-mono">{p.charted < 0 ? `${formatNumber(-p.charted, 1)} trocken` : formatNumber(p.charted, 1)}</td>
                      <td className="font-mono">{depth < 0 ? 'trocken' : `${formatNumber(depth, 1)} m`}</td>
                      <td className={ok ? 'text-success' : 'text-destructive'}>{ok ? 'ja' : 'nein'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Sichtweite von Feuern */

export function LightRangeWidget() {
  const lightH = useNumberField('24', { min: 0, max: 300 })
  const eyeH = useNumberField('2.5', { min: 0, max: 60 })
  const nominal = useNumberField('15', { min: 1, max: 40 })
  const valid = fieldsValid(lightH, eyeH, nominal)
  const geo = valid ? geographicRange(lightH.value!, eyeH.value!) : 0
  const visible = valid ? Math.min(geo, nominal.value!) : 0
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Die Karte nennt Feuerhöhe und nominelle Tragweite (bei guter Sicht). Wie weit du das Feuer wirklich siehst, begrenzt außerdem die Erdkrümmung: <b>geografische Sichtweite = 2,08 · (√Feuerhöhe + √Augenhöhe)</b> in Seemeilen.
      </p>
      <div className="grid gap-3 sm:grid-cols-3">
        <NumberField label="Feuerhöhe" unit="m" field={lightH} />
        <NumberField label="Augenhöhe" unit="m" field={eyeH} />
        <NumberField label="Nominelle Tragweite" unit="M" field={nominal} />
      </div>
      {valid && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          <div className="rounded-lg bg-muted/60 p-2.5">
            <div className="text-xs text-muted-foreground">Geografische Sichtweite</div>
            <div className="font-mono font-semibold">{formatNumber(geo, 1)} NM</div>
          </div>
          <div className="rounded-lg bg-primary/10 p-2.5 ring-1 ring-primary/40">
            <div className="text-xs text-muted-foreground">Erste Sichtung (kleinerer Wert)</div>
            <div className="font-mono font-semibold text-primary">{formatNumber(visible, 1)} NM</div>
          </div>
        </div>
      )}
    </div>
  )
}
