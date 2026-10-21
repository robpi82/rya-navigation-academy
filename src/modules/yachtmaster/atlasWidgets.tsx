import { useState } from 'react'
import { atlasPage, atlasRateForDay, atlasTides, formatBearing, formatNumber, pagesForPassage, parseAtlasLabel, planPassage } from '@/calculations'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { ATLAS_HOURS, ATLAS_NEAP_RANGE, ATLAS_PASSAGE, ATLAS_SPRING_RANGE, ATLAS_STATIONS } from '@/data/tidalAtlas'
import { cn } from '@/lib/utils'

const f1 = (n: number) => formatNumber(n, 1)
const pageLabel = (h: number) => (h === 0 ? 'HW' : `HW${h > 0 ? '+' : '−'}${Math.abs(h)}`)
const hm = (min: number) => {
  const sign = min < 0 ? '−' : '+'
  const a = Math.round(Math.abs(min))
  return `HW${sign}${Math.floor(a / 60)}:${String(a % 60).padStart(2, '0')}`
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

const rangeHint = (r: number) => (r <= ATLAS_NEAP_RANGE + 0.1 ? 'Nipp' : r >= ATLAS_SPRING_RANGE - 0.1 ? (r > ATLAS_SPRING_RANGE + 0.1 ? 'über Spring' : 'Spring') : 'zwischen Nipp und Spring')

/* ------------------------------------------------------------------ Atlas blättern */

export function AtlasBrowserWidget() {
  const [page, setPage] = useState(-2)
  const [range, setRange] = useState(3)
  const [sel, setSel] = useState('B')
  const W = 320
  const H = 220
  const sx = (x: number) => (x / 100) * W
  const sy = (y: number) => (y / 100) * H
  const st = ATLAS_STATIONS.find((s) => s.id === sel)!
  const entry = st.pages[page]
  const rates = parseAtlasLabel(entry.label)!
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Ein Stromatlas hat für jede Stunde vor und nach Hochwasser des Bezugshafens eine Seite. Pfeile zeigen die Setzrichtung, Zahlen wie „08,15“ die Rate in Zehntelknoten: zuerst Nipp (0,8 kn), dann Spring (1,5 kn). Für den Tag wird über den Tidenhub umgerechnet. Übungsatlas, fiktiv.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Stundenseite" value={pageLabel(page)} min={-6} max={6} step={1} v={page} on={setPage} />
        <Slide label="Tidenhub heute" value={`${f1(range)} m (${rangeHint(range)})`} min={1.5} max={5} step={0.1} v={range} on={setRange} />
      </div>
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-xl rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label={`Atlasseite ${pageLabel(page)}`}>
          <path d={`M0 0 H${W} V${sy(14)} Q${sx(60)} ${sy(24)} ${sx(30)} ${sy(16)} T0 ${sy(20)} Z`} fill="var(--chart-land)" stroke="var(--chart-coast)" />
          <path d={`M0 ${H} H${W} V${sy(90)} Q${sx(70)} ${sy(82)} ${sx(45)} ${sy(92)} T0 ${sy(86)} Z`} fill="var(--chart-land)" stroke="var(--chart-coast)" />
          <text x={8} y={14} fontSize={10} fill="currentColor">{pageLabel(page)} Port Möwe</text>
          <defs>
            <marker id="atlasArrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
            </marker>
          </defs>
          {ATLAS_STATIONS.map((s) => {
            const e = s.pages[page]
            const r = parseAtlasLabel(e.label)!
            const len = 10 + atlasRateForDay(r, range, ATLAS_NEAP_RANGE, ATLAS_SPRING_RANGE) * 12
            const dx = Math.sin((e.set * Math.PI) / 180) * len
            const dy = -Math.cos((e.set * Math.PI) / 180) * len
            const x = sx(s.x)
            const y = sy(s.y)
            return (
              <g key={s.id} onClick={() => setSel(s.id)} className="cursor-pointer">
                {r.spring > 0 && <line x1={x - dx / 2} y1={y - dy / 2} x2={x + dx / 2} y2={y + dy / 2} stroke="#0284c7" strokeWidth={s.id === sel ? 3.5 : 2.5} markerEnd="url(#atlasArrow)" />}
                <circle cx={x} cy={y} r={s.id === sel ? 4 : 2.5} fill={s.id === sel ? '#e11d48' : '#0f172a'} />
                <text x={x + 6} y={y + 14} fontSize={10} fontFamily="monospace" fill="currentColor">{e.label}</text>
              </g>
            )
          })}
        </svg>
        <div className="space-y-2 text-sm">
          <div className="flex flex-wrap gap-1">
            {ATLAS_STATIONS.map((s) => (
              <Button key={s.id} size="sm" variant={s.id === sel ? 'default' : 'outline'} onClick={() => setSel(s.id)} aria-pressed={s.id === sel}>
                {s.id}
              </Button>
            ))}
          </div>
          <p className="font-medium">
            {st.id} · {st.name}
          </p>
          <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1">
            <dt className="text-muted-foreground">Atlasangabe</dt>
            <dd className="font-mono">{entry.label}</dd>
            <dt className="text-muted-foreground">Setzrichtung</dt>
            <dd className="font-mono">{formatBearing(entry.set, 0)}</dd>
            <dt className="text-muted-foreground">Nipp / Spring</dt>
            <dd className="font-mono">
              {f1(rates.neap)} / {f1(rates.spring)} kn
            </dd>
            <dt className="text-muted-foreground">heute</dt>
            <dd className="font-mono font-semibold">{f1(atlasRateForDay(rates, range, ATLAS_NEAP_RANGE, ATLAS_SPRING_RANGE))} kn</dd>
          </dl>
          <p className="text-xs text-muted-foreground">
            Nipp-Hub {f1(ATLAS_NEAP_RANGE)} m, Spring-Hub {f1(ATLAS_SPRING_RANGE)} m. Liegt der Hub darüber, wird über den Springwert hinaus gerechnet.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Welche Seite? */

const PAGE_TASKS = [
  { hw: '10:40', at: '13:15', min: 155 },
  { hw: '06:10', at: '05:50', min: -20 },
  { hw: '14:25', at: '11:00', min: -205 },
  { hw: '09:00', at: '12:41', min: 221 },
  { hw: '22:50', at: '01:15 (Folgetag)', min: 145 },
  { hw: '17:35', at: '13:20', min: -255 },
]

export function AtlasPageQuizWidget() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<number | null>(null)
  const t = PAGE_TASKS[i % PAGE_TASKS.length]
  const right = atlasPage(t.min)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Der häufigste Fehler beim Atlas ist die falsche Seite. Rechne die Zeit relativ zum Hochwasser des Bezugshafens und nimm die Seite, deren Stunde am nächsten liegt – jede Seite gilt von 30 min davor bis 30 min danach.
      </p>
      <p className="rounded-lg border bg-muted/50 p-3 text-sm">
        HW Port Möwe <span className="font-mono font-semibold">{t.hw}</span> (Ortszeit). Welche Seite gilt um <span className="font-mono font-semibold">{t.at}</span>?
      </p>
      <div className="flex flex-wrap gap-1.5">
        {ATLAS_HOURS.map((h) => (
          <Button
            key={h}
            size="sm"
            variant="outline"
            onClick={() => setPick(h)}
            aria-pressed={pick === h}
            className={cn('font-mono', pick === h && (h === right ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'))}
          >
            {pageLabel(h)}
          </Button>
        ))}
      </div>
      {pick !== null && (
        <p role="status" className={cn('rounded-lg border p-3 text-sm', pick === right ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
          {pick === right ? 'Richtig. ' : 'Nicht ganz. '}
          {t.at} ist {hm(t.min)} – die nächste volle Stunde ist {pageLabel(right)}.
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
        Nächste Aufgabe
      </Button>
    </div>
  )
}

/* ------------------------------------------------------------------ Überfahrt mit dem Atlas */

export function AtlasPassageWidget() {
  const [depart, setDepart] = useState(-200)
  const [stw, setStw] = useState(5)
  const [range, setRange] = useState(3.5)
  const st = ATLAS_STATIONS.find((s) => s.id === ATLAS_PASSAGE.station)!
  const hoursAvail = 6
  const tides = atlasTides(st.pages, depart, hoursAvail, range, ATLAS_NEAP_RANGE, ATLAS_SPRING_RANGE)
  const pages = pagesForPassage(depart, hoursAvail)
  const plan = planPassage({ desiredTrack: ATLAS_PASSAGE.track, distance: ATLAS_PASSAGE.distance, stw, tides })
  const used = plan.feasible ? Math.ceil(plan.hours - 1e-9) : 0
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Von {ATLAS_PASSAGE.from} nach {ATLAS_PASSAGE.to}: {ATLAS_PASSAGE.distance} NM über Grund auf {formatBearing(ATLAS_PASSAGE.track, 0)} quer durch die Rinne, Strom aus dem Atlas an Stelle {st.id} ({st.name}). Für jede angefangene Stunde gilt die Seite zur Mitte dieser Stunde; alle Stromvektoren werden addiert und ein gemeinsamer Kurs gesteuert.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slide label="Abfahrt" value={hm(depart)} min={-360} max={120} step={10} v={depart} on={setDepart} />
        <Slide label="Fahrt durchs Wasser" value={`${f1(stw)} kn`} min={3} max={8} step={0.5} v={stw} on={setStw} />
        <Slide label="Tidenhub heute" value={`${f1(range)} m`} min={1.5} max={5} step={0.1} v={range} on={setRange} />
      </div>
      {plan.feasible ? (
        <>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[22rem] text-sm">
              <thead className="text-left text-xs text-muted-foreground">
                <tr>
                  <th className="py-1 pr-3 font-medium">Stunde</th>
                  <th className="py-1 pr-3 font-medium">Seite</th>
                  <th className="py-1 pr-3 font-medium">Atlas</th>
                  <th className="py-1 pr-3 font-medium">Set</th>
                  <th className="py-1 font-medium">Rate heute</th>
                </tr>
              </thead>
              <tbody className="font-mono">
                {tides.slice(0, used).map((td, k) => (
                  <tr key={k} className="border-t">
                    <td className="py-1 pr-3">
                      {k + 1}
                      {k === used - 1 && plan.hours < used ? ` (${Math.round((plan.hours - k) * 60)} min)` : ''}
                    </td>
                    <td className="py-1 pr-3">{pageLabel(pages[k])}</td>
                    <td className="py-1 pr-3">{st.pages[pages[k]].label}</td>
                    <td className="py-1 pr-3">{formatBearing(td.set, 0)}</td>
                    <td className="py-1">{f1(td.rate)} kn</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-lg border border-primary bg-accent px-3 py-2">
              <div className="text-[11px] text-muted-foreground">Kurs zu steuern</div>
              <div className="font-mono font-semibold">{formatBearing(plan.courseToSteer, 0)}</div>
            </div>
            <div className="rounded-lg border bg-muted/50 px-3 py-2">
              <div className="text-[11px] text-muted-foreground">Fahrzeit</div>
              <div className="font-mono font-semibold">
                {Math.floor(plan.hours)} h {String(Math.round((plan.hours % 1) * 60)).padStart(2, '0')} min
              </div>
            </div>
            <div className="rounded-lg border bg-muted/50 px-3 py-2">
              <div className="text-[11px] text-muted-foreground">Ankunft</div>
              <div className="font-mono font-semibold">{hm(depart + plan.hours * 60)}</div>
            </div>
          </div>
        </>
      ) : (
        <p className="rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-sm">{plan.message}</p>
      )}
      <p className="text-xs text-muted-foreground">Ein Kurs für die ganze Überfahrt: Der Strom versetzt dich zwischendurch von der Kurslinie, die Versätze heben sich aber teilweise auf. Auf eine Gefahr nahe der Kurslinie achten!</p>
    </div>
  )
}
