import { useMemo, useState } from 'react'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import { CALL_LABEL, CALL_SCENARIOS, DISTRESS_SIGNALS, MAYDAY_STEPS, MOB_STEPS, type Step } from '@/data/safety'
import { shuffle } from '@/lib/quiz'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ Reihenfolge-Aufgabe */

export function OrderExercise({ steps, intro }: { steps: Step[]; intro: string }) {
  const [pool, setPool] = useState(() => shuffle(steps))
  const [chosen, setChosen] = useState<Step[]>([])
  const [checked, setChecked] = useState(false)
  const remaining = pool.filter((s) => !chosen.includes(s))
  const allPlaced = remaining.length === 0
  const correctCount = chosen.filter((s, i) => steps[i].id === s.id).length

  const reset = () => {
    setPool(shuffle(steps))
    setChosen([])
    setChecked(false)
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{intro}</p>
      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <h3 className="mb-2 text-sm font-semibold">Schritte (antippen, um sie einzuordnen)</h3>
          <ul className="space-y-1.5">
            {remaining.map((s) => (
              <li key={s.id}>
                <button type="button" disabled={checked} onClick={() => setChosen((c) => [...c, s])} className="w-full rounded-lg border p-2.5 text-left text-sm hover:bg-muted disabled:opacity-60">
                  {s.text}
                </button>
              </li>
            ))}
            {remaining.length === 0 && <li className="text-sm text-muted-foreground">Alle Schritte eingeordnet.</li>}
          </ul>
        </div>
        <div>
          <h3 className="mb-2 text-sm font-semibold">Deine Reihenfolge</h3>
          <ol className="space-y-1.5">
            {chosen.map((s, i) => {
              const ok = checked && steps[i].id === s.id
              const bad = checked && !ok
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={checked}
                    onClick={() => setChosen((c) => c.filter((x) => x !== s))}
                    aria-label={`Schritt ${i + 1} entfernen: ${s.text}`}
                    className={cn('flex w-full items-start gap-2 rounded-lg border p-2.5 text-left text-sm', ok && 'border-success bg-success/10', bad && 'border-destructive bg-destructive/10', !checked && 'hover:bg-muted')}
                  >
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-xs">{i + 1}</span>
                    <span className="flex-1">{s.text}</span>
                    {ok && <CheckCircle2 className="size-4 shrink-0 text-success" />}
                    {bad && <XCircle className="size-4 shrink-0 text-destructive" />}
                  </button>
                </li>
              )
            })}
            {chosen.length === 0 && <li className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Noch leer – beginne mit dem ersten Schritt.</li>}
          </ol>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {!checked ? (
          <Button onClick={() => setChecked(true)} disabled={!allPlaced}>
            Prüfen
          </Button>
        ) : (
          <Button variant="outline" onClick={reset}>
            <RotateCcw /> Nochmal (neu gemischt)
          </Button>
        )}
        {checked && (
          <Badge variant={correctCount === steps.length ? 'success' : 'destructive'}>
            {correctCount} von {steps.length} an der richtigen Stelle
          </Badge>
        )}
      </div>
      {checked && correctCount < steps.length && (
        <div className="rounded-lg bg-muted/50 p-3 text-sm">
          <p className="mb-1 font-semibold">Richtige Reihenfolge</p>
          <ol className="list-decimal space-y-0.5 pl-5">
            {steps.map((s) => (
              <li key={s.id}>{s.text}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export const MaydayOrderWidget = () => (
  <OrderExercise steps={MAYDAY_STEPS} intro="Ordne die Teile eines Mayday-Notrufs über UKW-Seefunk. Die Reihenfolge ist wichtig: Wer hört, soll sofort wissen, wer du bist, wo du bist und was los ist." />
)

export const MobOrderWidget = () => (
  <OrderExercise steps={MOB_STEPS} intro="Mann über Bord: Ordne die Sofortmaßnahmen nach Dringlichkeit. In der Praxis laufen mehrere Schritte gleichzeitig – dafür braucht es Rollen an Bord, die vorher besprochen sind." />
)

/* ------------------------------------------------------------------ Notruf-Arten */

export function CallTypeWidget() {
  const [order, setOrder] = useState(() => shuffle(CALL_SCENARIOS))
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<string | null>(null)
  const [score, setScore] = useState({ right: 0, total: 0 })
  const scenario = order[index % order.length]
  const answered = picked !== null
  const options = useMemo(() => Object.keys(CALL_LABEL) as (keyof typeof CALL_LABEL)[], [])

  return (
    <div className="space-y-4">
      <div className="grid gap-2 text-sm md:grid-cols-3">
        <div className="rounded-lg border p-2.5">
          <b>MAYDAY</b> – Seenot: schwere und unmittelbare Gefahr für Schiff oder Menschen, sofortige Hilfe nötig.
        </div>
        <div className="rounded-lg border p-2.5">
          <b>PAN-PAN</b> – Dringlichkeit: dringende Nachricht zur Sicherheit von Schiff oder Person, aber keine unmittelbare Gefahr.
        </div>
        <div className="rounded-lg border p-2.5">
          <b>SÉCURITÉ</b> – Sicherheit: wichtige Navigations- oder Wetterwarnung an alle.
        </div>
      </div>
      <div className="rounded-lg border p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="font-medium">Welcher Funkspruch passt?</p>
          <Badge variant="outline">
            {score.right} / {score.total} richtig
          </Badge>
        </div>
        <p className="mb-3 rounded-lg bg-muted/50 p-3 text-sm">{scenario.text}</p>
        <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="Funkspruch wählen">
          {options.map((o) => {
            const isTarget = o === scenario.correct
            const isPicked = picked === o
            return (
              <button
                key={o}
                role="radio"
                aria-checked={isPicked}
                disabled={answered}
                onClick={() => {
                  setPicked(o)
                  setScore((s) => ({ right: s.right + (isTarget ? 1 : 0), total: s.total + 1 }))
                }}
                className={cn('min-h-11 rounded-lg border px-3 py-2 text-sm font-medium', !answered && 'hover:bg-muted', answered && isTarget && 'border-success bg-success/10', answered && isPicked && !isTarget && 'border-destructive bg-destructive/10', answered && !isTarget && !isPicked && 'opacity-60')}
              >
                {CALL_LABEL[o]}
              </button>
            )
          })}
        </div>
        {answered && (
          <div className="mt-3 space-y-2 text-sm" role="status">
            <p className={picked === scenario.correct ? 'font-semibold text-success' : 'font-semibold text-destructive'}>
              {picked === scenario.correct ? 'Richtig!' : `Nicht ganz – richtig ist ${CALL_LABEL[scenario.correct]}.`}
            </p>
            <p className="text-muted-foreground">{scenario.why}</p>
            <Button
              size="sm"
              onClick={() => {
                if ((index + 1) % order.length === 0) setOrder(shuffle(CALL_SCENARIOS))
                setIndex((i) => i + 1)
                setPicked(null)
              }}
            >
              Nächste Situation
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Seenotzeichen */

export function DistressSignalsWidget() {
  const [items] = useState(() => shuffle(DISTRESS_SIGNALS))
  const [answers, setAnswers] = useState<Record<string, boolean>>({})
  const done = Object.keys(answers).length
  const right = items.filter((i) => answers[i.id] === i.distress).length
  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">Ist das ein anerkanntes Seenotzeichen? Entscheide für jedes Beispiel – du bekommst sofort die Begründung.</p>
      <ul className="space-y-2">
        {items.map((i) => {
          const a = answers[i.id]
          const answered = a !== undefined
          const ok = a === i.distress
          return (
            <li key={i.id} className={cn('rounded-lg border p-3', answered && (ok ? 'border-success bg-success/5' : 'border-destructive bg-destructive/5'))}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm font-medium">{i.text}</span>
                <span className="flex gap-1.5">
                  <Button size="sm" variant={answered && a ? 'default' : 'outline'} disabled={answered} onClick={() => setAnswers((x) => ({ ...x, [i.id]: true }))}>
                    Seenotzeichen
                  </Button>
                  <Button size="sm" variant={answered && !a ? 'default' : 'outline'} disabled={answered} onClick={() => setAnswers((x) => ({ ...x, [i.id]: false }))}>
                    kein Seenotzeichen
                  </Button>
                </span>
              </div>
              {answered && (
                <p className={cn('mt-1.5 flex items-start gap-1.5 text-sm', ok ? 'text-success' : 'text-destructive')} role="status">
                  {ok ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <XCircle className="mt-0.5 size-4 shrink-0" />}
                  <span>
                    {ok ? 'Richtig. ' : `Falsch – es ${i.distress ? 'ist' : 'ist kein'} Seenotzeichen. `}
                    <span className="text-muted-foreground">{i.why}</span>
                  </span>
                </p>
              )}
            </li>
          )
        })}
      </ul>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant={done === items.length && right === items.length ? 'success' : 'outline'}>
          {right} richtig von {done} beantworteten ({items.length} gesamt)
        </Badge>
        {done > 0 && (
          <Button size="sm" variant="ghost" onClick={() => setAnswers({})}>
            <RotateCcw /> Zurücksetzen
          </Button>
        )}
      </div>
    </div>
  )
}
