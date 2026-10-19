import { useMemo, useState } from 'react'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { LIGHT_CSS_COLOR, lightTimeline, parseLight } from '@/calculations'
import { BuoyIcon } from '@/components/nautical/BuoyIcon'
import { BUOYS, BUOY_BY_ID, BUOY_GROUP_LABEL, type BuoyInfo } from '@/data/buoyage'
import { useLightPhase } from '@/hooks/useLightPhase'
import { shuffle } from '@/lib/quiz'
import type { BuoyId } from '@/types/learning'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'

/** Tonne mit animiertem Licht */
export function LitBuoy({ id, className }: { id: BuoyId; className?: string }) {
  const info = BUOY_BY_ID[id]
  const parsed = useMemo(() => parseLight(info.lightExample), [info.lightExample])
  const timeline = parsed.ok ? lightTimeline(parsed.spec) : null
  const on = useLightPhase(timeline)
  const color = parsed.ok ? LIGHT_CSS_COLOR[parsed.spec.colors[0]] : '#fff'
  return <BuoyIcon id={id} className={className} light={{ color, on }} title={info.name} />
}

/* ------------------------------------------------------------------ Galerie */

const GROUPS = ['lateral', 'cardinal', 'other'] as const

export function BuoyGalleryWidget() {
  const [group, setGroup] = useState<(typeof GROUPS)[number]>('lateral')
  const list = BUOYS.filter((b) => b.group === group)
  const [selected, setSelected] = useState<BuoyId>('port')
  const current = list.find((b) => b.id === selected) ?? list[0]

  return (
    <div className="space-y-4">
      <Toggle label="Gruppe" value={group} onChange={(g) => { setGroup(g); setSelected(BUOYS.find((b) => b.group === g)!.id) }} options={GROUPS.map((g) => ({ value: g, label: BUOY_GROUP_LABEL[g] }))} />
      <div className="grid gap-4 md:grid-cols-[minmax(0,260px)_1fr]">
        <div className="grid grid-cols-2 gap-2" role="listbox" aria-label="Tonnen">
          {list.map((b) => (
            <button
              key={b.id}
              role="option"
              aria-selected={b.id === current.id}
              onClick={() => setSelected(b.id)}
              className={cn('rounded-lg border p-2 text-center text-xs transition-colors', b.id === current.id ? 'border-primary bg-accent' : 'hover:bg-muted')}
            >
              <BuoyIcon id={b.id} className="mx-auto h-24 w-auto" />
              <span className="mt-1 block leading-tight font-medium">{b.name.split(' (')[0]}</span>
            </button>
          ))}
        </div>
        <BuoyDetail info={current} />
      </div>
    </div>
  )
}

function BuoyDetail({ info }: { info: BuoyInfo }) {
  const rows: [string, string][] = [
    ['Farbe', info.look],
    ['Form', info.shape],
    ['Toppzeichen', info.topmark],
    ['Kennung', info.light],
    ['Bedeutung', info.meaning],
    ['Passieren', info.action],
  ]
  return (
    <div className="grid gap-4 sm:grid-cols-[150px_1fr]">
      <div className="mx-auto w-36 rounded-lg bg-[#0a1424] p-2">
        <LitBuoy id={info.id} className="h-auto w-full" />
        <div className="text-center text-[11px] text-slate-400">{info.lightExample}</div>
      </div>
      <div className="space-y-2">
        <div>
          <h3 className="font-semibold">{info.name}</h3>
          <p className="text-sm text-muted-foreground">{info.english}</p>
        </div>
        <dl className="space-y-1.5 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="grid grid-cols-[96px_1fr] gap-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <p className="rounded-lg bg-accent/50 p-2.5 text-sm">
          <b>Merke:</b> {info.mnemonic}
        </p>
        {info.id === 'new-danger' && <p className="text-xs text-muted-foreground">In Wirklichkeit blinkt das Licht abwechselnd blau und gelb; die Animation zeigt nur den Blinkrhythmus.</p>}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Erkennungs-Training */

function pickRound(exclude?: BuoyId) {
  const pool = BUOYS.filter((b) => b.id !== exclude)
  const target = shuffle(pool)[0]
  const options = shuffle([target, ...shuffle(BUOYS.filter((b) => b.id !== target.id)).slice(0, 3)])
  return { target, options }
}

export function BuoyTrainerWidget() {
  const [round, setRound] = useState(() => pickRound())
  const [picked, setPicked] = useState<BuoyId | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const answered = picked !== null
  const ok = picked === round.target.id

  const choose = (id: BuoyId) => {
    if (answered) return
    setPicked(id)
    setScore((s) => ({ right: s.right + (id === round.target.id ? 1 : 0), total: s.total + 1 }))
  }
  const next = () => {
    setRound(pickRound(round.target.id))
    setPicked(null)
  }

  return (
    <div className="grid gap-4 md:grid-cols-[170px_1fr]">
      <div className="mx-auto w-40 rounded-lg bg-[var(--chart-water)] p-2">
        <BuoyIcon id={round.target.id} className="h-auto w-full" title="Welche Tonne ist das?" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <p className="font-medium">Welche Tonne siehst du?</p>
          <Badge variant="outline">
            {score.right} / {score.total} richtig
          </Badge>
        </div>
        <div className="grid gap-2" role="radiogroup" aria-label="Antworten">
          {round.options.map((o) => {
            const isTarget = o.id === round.target.id
            const isPicked = o.id === picked
            return (
              <button
                key={o.id}
                role="radio"
                aria-checked={isPicked}
                disabled={answered}
                onClick={() => choose(o.id)}
                className={cn(
                  'flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                  !answered && 'hover:bg-muted',
                  answered && isTarget && 'border-success bg-success/10',
                  answered && isPicked && !isTarget && 'border-destructive bg-destructive/10',
                  answered && !isTarget && !isPicked && 'opacity-60',
                )}
              >
                {answered && isTarget && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                {answered && isPicked && !isTarget && <XCircle className="size-4 shrink-0 text-destructive" />}
                {o.name}
              </button>
            )
          })}
        </div>
        {answered && (
          <div className={cn('space-y-1 rounded-lg p-3 text-sm', ok ? 'bg-success/10' : 'bg-destructive/10')} role="status">
            <p className="font-semibold">{ok ? 'Richtig!' : `Nicht ganz – das ist: ${round.target.name}.`}</p>
            <p>
              <b>Passieren:</b> {round.target.action}
            </p>
            <p className="text-muted-foreground">
              {round.target.look}; {round.target.topmark}.
            </p>
            <Button size="sm" onClick={next} className="mt-1">
              <RotateCcw /> Nächste Tonne
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Fahrwasser: einlaufen / auslaufen */

export function LateralDirectionWidget() {
  const [region, setRegion] = useState<'A' | 'B'>('A')
  const [dir, setDir] = useState<'in' | 'out'>('in')
  // Region A: rot = Backbord beim Einlaufen. Region B: grün = Backbord beim Einlaufen.
  const leftWhenEntering: BuoyId = region === 'A' ? 'port' : 'starboard'
  const rightWhenEntering: BuoyId = region === 'A' ? 'starboard' : 'port'
  // Im Auslaufen ist die Fahrtrichtung entgegengesetzt: links/rechts vertauscht (aus Sicht des Bootes).
  const leftOfBoat = dir === 'in' ? leftWhenEntering : rightWhenEntering
  const rightOfBoat = dir === 'in' ? rightWhenEntering : leftWhenEntering
  // Bilddarstellung: Boot fährt nach oben (Einlaufen = Fahrtrichtung zum Hafen oben)
  const label = (id: BuoyId) => (id === 'port' ? 'rot' : 'grün')
  const side = (id: BuoyId) => (id === leftOfBoat ? 'Backbord (links)' : 'Steuerbord (rechts)')
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">
        <Toggle label="Region" value={region} onChange={setRegion} options={[{ value: 'A', label: 'System A (Europa u. a.)' }, { value: 'B', label: 'System B (Amerika, Japan …)' }]} />
        <Toggle label="Fahrtrichtung" value={dir} onChange={setDir} options={[{ value: 'in', label: 'Einlaufen (Richtung Hafen)' }, { value: 'out', label: 'Auslaufen (aufs Meer)' }]} />
      </div>
      <div className="grid items-center gap-4 md:grid-cols-[320px_1fr]">
        <div className="relative mx-auto h-64 w-full max-w-xs rounded-lg bg-[var(--chart-water)]">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 text-[11px] text-muted-foreground">{dir === 'in' ? 'Hafen ↑' : 'Meer ↑'}</div>
          {[0, 1].map((row) => (
            <div key={row}>
              <div style={{ top: 24 + row * 100 }} className="absolute left-5 w-16">
                <BuoyIcon id={leftOfBoat} className="h-24 w-auto" />
              </div>
              <div style={{ top: 24 + row * 100 }} className="absolute right-5 w-16">
                <BuoyIcon id={rightOfBoat} className="h-24 w-auto" />
              </div>
            </div>
          ))}
          <svg viewBox="0 0 40 70" className="absolute bottom-3 left-1/2 h-16 -translate-x-1/2" role="img" aria-label="Boot fährt nach oben">
            <path d="M20,4 C30,16 31,40 28,64 L12,64 C9,40 10,16 20,4 Z" fill="var(--card)" stroke="var(--foreground)" strokeWidth={2} />
            <line x1={20} y1={14} x2={20} y2={50} stroke="var(--foreground)" />
          </svg>
        </div>
        <div className="space-y-2 text-sm">
          <p>
            <b>Links vom Boot ({dir === 'in' ? 'Einlaufen' : 'Auslaufen'}):</b> {label(leftOfBoat)}e Tonnen – {side(leftOfBoat)}.
          </p>
          <p>
            <b>Rechts vom Boot:</b> {label(rightOfBoat)}e Tonnen – {side(rightOfBoat)}.
          </p>
          <p className="rounded-lg bg-accent/50 p-2.5">
            {region === 'A'
              ? 'System A: Beim Einlaufen („in Richtung der Betonnung") ist rot an Backbord und grün an Steuerbord. Beim Auslaufen kehrt sich das um: rot ist dann rechts.'
              : 'System B: genau umgekehrt – beim Einlaufen ist rot an Steuerbord (rechts) und grün an Backbord (links): „red right returning". (Hier sind nur die Farben vertauscht dargestellt; die Formen – Zylinder bzw. Kegel – sind in System B ebenfalls den Farben zugeordnet.)'}
          </p>
          <p className="text-muted-foreground">Die Richtung der Betonnung steht in der Seekarte (Pfeil mit Doppellinie) – nicht nur vom Gefühl „Land/See" ableiten!</p>
        </div>
      </div>
    </div>
  )
}
