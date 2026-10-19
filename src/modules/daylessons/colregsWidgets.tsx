import { useMemo, useState } from 'react'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import {
  angleDifference,
  encounter,
  formatBearing,
  fromPolar,
  visibleLights,
  type LightVessel,
  type Role,
  type Vessel,
  type VesselKind,
} from '@/calculations'
import { BoatIcon, VectorArrow } from '@/components/nautical/svg'
import { FOG_SIGNALS, LIGHT_VESSEL_INFO, RULE18_ORDER, SOUND_SIGNALS, type SoundSignal } from '@/data/colregs'
import { shuffle } from '@/lib/quiz'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'

/* ------------------------------------------------------------------ Begegnungs-Trainer */

const PRESETS: { label: string; bearing: number; course: number; own?: VesselKind; other?: VesselKind }[] = [
  { label: 'Entgegenkommend', bearing: 0, course: 180 },
  { label: 'Kreuzt von rechts', bearing: 50, course: 270 },
  { label: 'Kreuzt von links', bearing: -50, course: 90 },
  { label: 'Ich überhole', bearing: 0, course: 0 },
  { label: 'Ich werde überholt', bearing: 180, course: 0 },
  { label: 'Maschine vs. Segler', bearing: -50, course: 90, own: 'power', other: 'sail' },
]

const ROLE_LABEL: Record<Role, string> = {
  'give-way': 'ausweichpflichtig',
  'stand-on': 'Kurshalter',
  'both-give-way': 'beide weichen aus',
  none: 'keine Pflicht',
}

export function EncounterWidget() {
  const [ownKind, setOwnKind] = useState<VesselKind>('power')
  const [otherKind, setOtherKind] = useState<VesselKind>('power')
  const [bearing, setBearing] = useState(50)
  const [otherCourse, setOtherCourse] = useState(270)
  const [windFrom, setWindFrom] = useState(315)
  const dist = 2

  const own: Vessel = { pos: { x: 0, y: 0 }, course: 0, kind: ownKind }
  const otherPos = fromPolar(dist, bearing)
  const other: Vessel = { pos: otherPos, course: otherCourse, kind: otherKind }
  const result = useMemo(() => encounter(own, other, windFrom), [ownKind, otherKind, bearing, otherCourse, windFrom]) // eslint-disable-line react-hooks/exhaustive-deps
  const bothSail = ownKind === 'sail' && otherKind === 'sail'

  const W = 340
  const H = 300
  const s = 60
  const c = { x: W / 2, y: H / 2 + 40 }
  const px = (p: { x: number; y: number }) => ({ x: c.x + p.x * s, y: c.y - p.y * s })
  const o = px(own.pos)
  const t = px(otherPos)
  const ownTip = px(fromPolar(1.1, 0))
  const otherTip = px({ x: otherPos.x + fromPolar(1.1, otherCourse).x, y: otherPos.y + fromPolar(1.1, otherCourse).y })
  const wind = { x: W - 40, y: 36 }
  const windTip = { x: wind.x + 22 * Math.sin(((windFrom + 180) * Math.PI) / 180), y: wind.y - 22 * Math.cos(((windFrom + 180) * Math.PI) / 180) }
  const windTail = { x: wind.x - 22 * Math.sin(((windFrom + 180) * Math.PI) / 180), y: wind.y + 22 * Math.cos(((windFrom + 180) * Math.PI) / 180) }

  const verdictColor = result.own === 'give-way' || result.own === 'both-give-way' ? 'border-warning bg-warning/10' : result.own === 'stand-on' ? 'border-success bg-success/10' : 'border-border bg-muted/50'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Beispiele">
        {PRESETS.map((p) => (
          <Button
            key={p.label}
            size="sm"
            variant="outline"
            onClick={() => {
              setBearing(p.bearing)
              setOtherCourse(p.course)
              if (p.own) setOwnKind(p.own)
              if (p.other) setOtherKind(p.other)
            }}
          >
            {p.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Begegnung zweier Fahrzeuge">
          <circle cx={o.x} cy={o.y} r={dist * s} fill="none" stroke="var(--chart-grid)" strokeDasharray="4 4" />
          <VectorArrow from={o} to={ownTip} color="var(--vec-water)" width={2} />
          <VectorArrow from={t} to={otherTip} color="var(--vec-ground)" width={2} />
          <BoatIcon x={o.x} y={o.y} heading={0} size={34} />
          <BoatIcon x={t.x} y={t.y} heading={otherCourse} size={34} />
          <text x={o.x + 18} y={o.y + 22} fontSize={11} fontWeight={700} fill="var(--vec-water)">
            Du ({ownKind === 'power' ? 'Maschine' : 'Segler'})
          </text>
          <text x={t.x > W - 130 ? t.x - 18 : t.x + 18} y={t.y - 14} fontSize={11} fontWeight={700} textAnchor={t.x > W - 130 ? 'end' : 'start'} fill="var(--vec-ground)">
            Anderer ({otherKind === 'power' ? 'Maschine' : 'Segler'})
          </text>
          <text x={14} y={20} fontSize={11} fill="var(--muted-foreground)">
            Dein Kurs: 000° (oben)
          </text>
          {bothSail && (
            <g>
              <line x1={windTail.x} y1={windTail.y} x2={windTip.x} y2={windTip.y} stroke="var(--muted-foreground)" strokeWidth={2.5} />
              <circle cx={windTip.x} cy={windTip.y} r={3.5} fill="var(--muted-foreground)" />
              <text x={wind.x} y={wind.y + 40} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
                Wind aus {formatBearing(windFrom, 0)}
              </text>
            </g>
          )}
        </svg>
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <Toggle label="Du bist" value={ownKind} onChange={setOwnKind} options={[{ value: 'power', label: 'Maschinenboot' }, { value: 'sail', label: 'Segler' }]} />
            <Toggle label="Der andere ist" value={otherKind} onChange={setOtherKind} options={[{ value: 'power', label: 'Maschinenboot' }, { value: 'sail', label: 'Segler' }]} />
          </div>
          <Slide label="Peilung zum anderen (relativ zu deinem Bug)" value={bearing} min={-180} max={180} format={(v) => `${v > 0 ? '+' : ''}${v}° ${v > 0 ? '(Steuerbord)' : v < 0 ? '(Backbord)' : '(voraus)'}`} onChange={setBearing} />
          <Slide label="Kurs des anderen" value={otherCourse} min={0} max={359} format={(v) => formatBearing(v, 0)} onChange={setOtherCourse} />
          {bothSail && <Slide label="Wind weht aus" value={windFrom} min={0} max={359} format={(v) => formatBearing(v, 0)} onChange={setWindFrom} />}
          <div className={cn('space-y-1 rounded-lg border-2 p-3 text-sm', verdictColor)} role="status">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{result.rule}</Badge>
              <span className="font-semibold">Du bist: {ROLE_LABEL[result.own]}</span>
              <span className="text-muted-foreground">· Der andere: {ROLE_LABEL[result.other]}</span>
            </div>
            <p>{result.explanation}</p>
            <p className="font-medium">{result.action}</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Vereinfachung: Es wird von bestehender Kollisionsgefahr ausgegangen. Als „voraus oder fast voraus" gelten ±10°; im Zweifel gilt die Regel für entgegengesetzte Kurse. Ein Segler unter Maschine ist ein Maschinenfahrzeug.
          </p>
        </div>
      </div>
      <div className="rounded-lg bg-muted/50 p-3 text-sm">
        <p className="mb-1 font-semibold">Rangfolge (Rule 18): Jeder weicht den weiter oben Genannten aus</p>
        <ol className="list-decimal pl-5">
          {RULE18_ORDER.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <p className="mt-1 text-xs text-muted-foreground">Ausnahmen: Überholen (Rule 13) sowie enge Fahrwasser und Verkehrstrennungsgebiete (Rules 9, 10).</p>
      </div>
    </div>
  )
}

function Slide({ label, value, min, max, format, onChange }: { label: string; value: number; min: number; max: number; format: (v: number) => string; onChange: (v: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between gap-2 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{format(value)}</span>
      </div>
      <Slider value={[value]} min={min} max={max} step={1} onValueChange={([v]) => onChange(v)} aria-label={label} />
    </div>
  )
}

/* ------------------------------------------------------------------ Lichter */

const VESSELS = Object.keys(LIGHT_VESSEL_INFO) as LightVessel[]
const CSS = { white: '#fff7c2', red: '#ff3b30', green: '#22c55e', yellow: '#ffd60a' }

export function LightsWidget() {
  const [vessel, setVessel] = useState<LightVessel>('power')
  const [bearing, setBearing] = useState(0)
  const [makingWay, setMakingWay] = useState(true)
  const lights = visibleLights(vessel, bearing, makingWay)
  // Scheinbare Seitenlage: x = −a·cos(b) + f·sin(b) (Beobachter blickt auf das Fahrzeug)
  const b = (angleDifference(0, bearing) * Math.PI) / 180
  const pos: Record<string, { a: number; f: number }> = { masthead: { a: 0, f: 0.4 }, green: { a: 0.5, f: 0.3 }, red: { a: -0.5, f: 0.3 }, stern: { a: 0, f: -1 } }
  const xOf = (id: string) => {
    const p = pos[id] ?? { a: 0, f: 0.6 }
    return -p.a * Math.cos(b) + p.f * Math.sin(b)
  }
  const info = LIGHT_VESSEL_INFO[vessel]
  const hasWayOption = ['nuc', 'restricted', 'trawling'].includes(vessel)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Fahrzeugart">
        {VESSELS.map((v) => (
          <Button key={v} size="sm" variant={vessel === v ? 'default' : 'outline'} aria-pressed={vessel === v} onClick={() => setVessel(v)}>
            {LIGHT_VESSEL_INFO[v].label.split(' (')[0]}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-[320px_1fr]">
        <svg viewBox="0 0 320 200" className="h-auto w-full rounded-lg" role="img" aria-label="Nachtbild: sichtbare Lichter" style={{ background: '#050b16' }}>
          <line x1={0} y1={165} x2={320} y2={165} stroke="#1c2b45" />
          {lights.map((l) => (
            <g key={l.id}>
              <circle cx={160 + xOf(l.id) * 70} cy={150 - l.height * 70} r={12} fill={CSS[l.color]} opacity={0.25} />
              <circle cx={160 + xOf(l.id) * 70} cy={150 - l.height * 70} r={5.5} fill={CSS[l.color]} />
            </g>
          ))}
          {lights.length === 0 && (
            <text x={160} y={100} textAnchor="middle" fontSize={12} fill="#8aa0c0">
              Aus dieser Richtung ist kein Licht sichtbar.
            </text>
          )}
        </svg>
        <div className="space-y-3">
          <p className="text-sm">
            <b>{info.label}.</b> <span className="text-muted-foreground">{info.note}</span>
          </p>
          <Slide label="Du siehst das Fahrzeug von … (relativ zu seinem Bug)" value={bearing} min={-180} max={180} format={(v) => `${v > 0 ? '+' : ''}${v}° ${v === 0 ? '(von vorn)' : Math.abs(v) === 180 ? '(von achtern)' : v > 0 ? '(Steuerbordseite)' : '(Backbordseite)'}`} onChange={setBearing} />
          {hasWayOption && <Toggle label="Fahrt durchs Wasser" value={makingWay ? 'yes' : 'no'} onChange={(v) => setMakingWay(v === 'yes')} options={[{ value: 'yes', label: 'macht Fahrt' }, { value: 'no', label: 'ohne Fahrt' }]} />}
          <ul className="space-y-1 text-sm">
            {lights.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <span className="inline-block size-3 rounded-full" style={{ background: CSS[l.color] }} />
                {l.description}
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground">
            Von vorn erscheinen die Seitenlichter seitenverkehrt: Du siehst das rote Backbordlicht des Entgegenkommenden rechts von dir („rot an rot"). Sektoren: Topplicht 225°, Seitenlichter je 112,5°, Hecklicht 135°.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Schallsignale */

function Pattern({ pattern }: { pattern: string }) {
  return (
    <span className="inline-flex items-center gap-1.5" aria-label={`Signal: ${pattern.replace(/\./g, 'kurz ').replace(/-/g, 'lang ')}`}>
      {pattern.split('').map((c, i) => (
        <span key={i} className={cn('inline-block h-3 rounded-full bg-foreground', c === '.' ? 'w-3' : 'w-9')} />
      ))}
    </span>
  )
}

function pickSignal(exclude?: string): { target: SoundSignal; options: SoundSignal[] } {
  const target = shuffle(SOUND_SIGNALS.filter((s) => s.id !== exclude))[0]
  return { target, options: shuffle([target, ...shuffle(SOUND_SIGNALS.filter((s) => s.id !== target.id)).slice(0, 3)]) }
}

export function SoundSignalsWidget() {
  const [round, setRound] = useState(() => pickSignal())
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const answered = picked !== null
  return (
    <div className="space-y-5">
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Manöver- und Überholsignale (in Sicht)</h3>
          <ul className="space-y-1.5">
            {SOUND_SIGNALS.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-lg border p-2">
                <div className="w-28 shrink-0">
                  <Pattern pattern={s.pattern} />
                </div>
                <div className="text-sm">
                  <b>{s.title}</b> <span className="text-xs text-muted-foreground">({s.rule})</span>
                  <div className="text-muted-foreground">{s.meaning}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Nebelsignale (eingeschränkte Sicht)</h3>
          <ul className="space-y-1.5">
            {FOG_SIGNALS.map((s) => (
              <li key={s.id} className="flex items-center gap-3 rounded-lg border p-2">
                <div className="w-28 shrink-0">
                  <Pattern pattern={s.pattern} />
                </div>
                <div className="text-sm">
                  <b>{s.who}</b>
                  <div className="text-muted-foreground">{s.interval}</div>
                </div>
              </li>
            ))}
            <li className="rounded-lg border p-2 text-sm">
              <b>Vor Anker (unter 100 m):</b> schnelles Läuten der Glocke, etwa 5 Sekunden lang, jede Minute.
            </li>
          </ul>
          <p className="mt-2 text-xs text-muted-foreground">Kurzer Ton ≈ 1 s, langer Ton 4–6 s. In Nebel gelten die Vorfahrtsregeln für Sicht nicht: mit sicherer Geschwindigkeit fahren, Maschine bereit, Signale geben, auf Signale anderer hören.</p>
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-medium">Training: Was bedeutet dieses Signal?</p>
          <Badge variant="outline">
            {score.right} / {score.total} richtig
          </Badge>
        </div>
        <div className="mb-3">
          <Pattern pattern={round.target.pattern} />
        </div>
        <div className="grid gap-2" role="radiogroup" aria-label="Antworten">
          {round.options.map((o) => {
            const isTarget = o.id === round.target.id
            const isPicked = picked === o.id
            return (
              <button
                key={o.id}
                role="radio"
                aria-checked={isPicked}
                disabled={answered}
                onClick={() => {
                  setPicked(o.id)
                  setScore((s) => ({ right: s.right + (isTarget ? 1 : 0), total: s.total + 1 }))
                }}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm',
                  !answered && 'hover:bg-muted',
                  answered && isTarget && 'border-success bg-success/10',
                  answered && isPicked && !isTarget && 'border-destructive bg-destructive/10',
                  answered && !isTarget && !isPicked && 'opacity-60',
                )}
              >
                {answered && isTarget && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                {answered && isPicked && !isTarget && <XCircle className="size-4 shrink-0 text-destructive" />}
                {o.meaning}
              </button>
            )
          })}
        </div>
        {answered && (
          <Button size="sm" className="mt-3" onClick={() => { setRound(pickSignal(round.target.id)); setPicked(null) }}>
            <RotateCcw /> Nächstes Signal
          </Button>
        )}
      </div>
    </div>
  )
}
