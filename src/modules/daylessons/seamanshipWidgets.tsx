import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { BOAT_PARTS, KNOTS, KNOT_TASKS } from '@/data/seamanship'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'

/* ------------------------------------------------------------------ Bootsteile */

function BoatSketch({ active, marked, onPick }: { active: string | null; marked?: Record<string, 'right' | 'wrong'>; onPick: (id: string) => void }) {
  return (
    <svg viewBox="0 0 320 240" className="h-auto w-full max-w-xl rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Seitenansicht einer Slup mit wählbaren Bauteilen">
      <line x1={0} y1={186} x2={320} y2={186} stroke="#0284c7" strokeWidth={1} opacity={0.6} />
      {/* Rumpf, Kiel, Ruder */}
      <path d="M30 165 L290 165 Q282 188 252 195 L72 195 Q42 191 30 165 Z" fill="var(--card)" stroke="currentColor" strokeWidth={1.5} />
      <path d="M142 195 L172 195 L166 230 L150 230 Z" fill="currentColor" opacity={0.75} />
      <path d="M60 195 L73 195 L71 222 L62 222 Z" fill="currentColor" opacity={0.75} />
      {/* Rigg */}
      <line x1={150} y1={18} x2={150} y2={165} stroke="currentColor" strokeWidth={3} />
      <line x1={150} y1={20} x2={286} y2={165} stroke="currentColor" strokeWidth={1} />
      <line x1={150} y1={20} x2={34} y2={165} stroke="currentColor" strokeWidth={1} />
      <line x1={150} y1={44} x2={158} y2={165} stroke="currentColor" strokeWidth={1} opacity={0.7} />
      <line x1={142} y1={90} x2={158} y2={90} stroke="currentColor" strokeWidth={1.5} />
      <line x1={152} y1={140} x2={62} y2={140} stroke="currentColor" strokeWidth={3} />
      {/* Segel */}
      <path d="M152 25 L152 138 L76 138 Z" fill="var(--accent)" stroke="currentColor" strokeWidth={1} opacity={0.9} />
      <path d="M184 56 L275 160 L215 152 Z" fill="var(--accent)" stroke="currentColor" strokeWidth={1} opacity={0.9} />
      {BOAT_PARTS.map((p, i) => {
        const state = marked?.[p.id]
        return (
          <g
            key={p.id}
            onClick={() => onPick(p.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onPick(p.id)
              }
            }}
            tabIndex={0}
            className="cursor-pointer outline-none [&:focus-visible>circle]:stroke-[3px] [&:focus-visible>circle]:stroke-[var(--ring)]"
            role="button"
            aria-label={`Teil ${i + 1}`}
          >
            <circle
              cx={p.x}
              cy={p.y}
              r={7}
              fill={state === 'right' ? 'var(--success)' : state === 'wrong' ? 'var(--destructive)' : p.id === active ? 'var(--primary)' : 'var(--card)'}
              stroke="currentColor"
              strokeWidth={1.2}
            />
            <text x={p.x} y={p.y + 3} fontSize={8} textAnchor="middle" fill={p.id === active || state ? 'white' : 'currentColor'} pointerEvents="none">
              {i + 1}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

export function BoatPartsWidget() {
  const [mode, setMode] = useState<'learn' | 'quiz'>('learn')
  const [active, setActive] = useState<string | null>('mast')
  const [ask, setAsk] = useState(0)
  const [result, setResult] = useState<Record<string, 'right' | 'wrong'>>({})
  const [score, setScore] = useState({ right: 0, total: 0 })
  const order = [...BOAT_PARTS].sort((a, b) => (a.id < b.id ? -1 : 1))
  const target = order[(ask * 7) % order.length]
  const part = BOAT_PARTS.find((p) => p.id === active)

  const pick = (id: string) => {
    if (mode === 'learn') return setActive(id)
    if (result[target.id] !== undefined) return
    const ok = id === target.id
    setResult({ [target.id]: 'right', ...(ok ? {} : { [id]: 'wrong' }) })
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }))
  }
  const next = () => {
    setAsk((a) => a + 1)
    setResult({})
  }

  return (
    <div className="space-y-4">
      <Toggle
        value={mode}
        onChange={(m) => {
          setMode(m)
          setResult({})
        }}
        label="Modus"
        options={[{ value: 'learn', label: 'Erkunden' }, { value: 'quiz', label: 'Abfragen' }]}
      />
      <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,16rem)]">
        <BoatSketch active={mode === 'learn' ? active : null} marked={mode === 'quiz' ? result : undefined} onPick={pick} />
        {mode === 'learn' ? (
          <div className="space-y-2 text-sm">
            {part ? (
              <div className="rounded-lg border bg-muted/50 p-3">
                <p className="font-semibold">{part.german}</p>
                <p className="text-muted-foreground italic">{part.english}</p>
                <p className="mt-1">{part.what}</p>
              </div>
            ) : (
              <p className="text-muted-foreground">Tippe auf eine Nummer.</p>
            )}
            <ol className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
              {BOAT_PARTS.map((p, i) => (
                <li key={p.id}>
                  <button type="button" onClick={() => setActive(p.id)} className={cn('hover:text-foreground', p.id === active && 'font-semibold text-foreground')}>
                    {i + 1}. {p.german.split(' ')[0]}
                  </button>
                </li>
              ))}
            </ol>
          </div>
        ) : (
          <div className="space-y-3 text-sm">
            <p className="rounded-lg border bg-muted/50 p-3">
              Wo ist <span className="font-semibold">{target.german}</span> <span className="text-muted-foreground">({target.english})</span>? Tippe in der Skizze darauf.
            </p>
            {result[target.id] && (
              <p role="status" className={cn('rounded-lg border p-3', Object.values(result).includes('wrong') ? 'border-destructive/40 bg-destructive/5' : 'border-success/40 bg-success/5')}>
                {Object.values(result).includes('wrong') ? 'Nicht ganz – grün markiert ist die richtige Stelle. ' : 'Richtig! '}
                {target.what}
              </p>
            )}
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono tabular-nums text-muted-foreground">
                {score.right}/{score.total} richtig
              </span>
              <Button size="sm" variant="outline" onClick={next} disabled={!result[target.id]}>
                Nächstes Teil
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Knotenübersicht */

export function KnotOverviewWidget() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {KNOTS.map((k) => (
        <div key={k.id} className="space-y-1 rounded-lg border p-3 text-sm">
          <p className="font-semibold">
            {k.german} <span className="font-normal text-muted-foreground italic">· {k.english}</span>
          </p>
          <p>{k.use}</p>
          <p className="text-xs text-muted-foreground">⚠ {k.caution}</p>
        </div>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ Welcher Knoten? */

export function KnotChooserWidget() {
  const [i, setI] = useState(0)
  const [pick, setPick] = useState<string | null>(null)
  const task = KNOT_TASKS[i % KNOT_TASKS.length]
  const right = KNOTS.find((k) => k.id === task.knot)!
  const chosen = KNOTS.find((k) => k.id === pick)
  return (
    <div className="space-y-4">
      <p className="rounded-lg border bg-muted/50 p-3 text-sm">
        <span className="text-muted-foreground">
          Aufgabe {(i % KNOT_TASKS.length) + 1} von {KNOT_TASKS.length}:
        </span>{' '}
        {task.situation}
      </p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {KNOTS.map((k) => (
          <Button
            key={k.id}
            size="sm"
            variant="outline"
            onClick={() => setPick(k.id)}
            aria-pressed={pick === k.id}
            className={cn('h-auto min-h-9 whitespace-normal py-1.5', pick === k.id && (k.id === task.knot ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'))}
          >
            {k.german}
          </Button>
        ))}
      </div>
      {chosen && (
        <p role="status" className={cn('rounded-lg border p-3 text-sm', chosen.id === right.id ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
          {chosen.id === right.id ? `Richtig: ${right.german}. ${right.use}` : `Hier passt besser: ${right.german}. ${right.use} – Zum ${chosen.german}: ${chosen.caution}`}
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
