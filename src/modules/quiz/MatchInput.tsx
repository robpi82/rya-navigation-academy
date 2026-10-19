import { useMemo } from 'react'
import { CheckCircle2, XCircle } from 'lucide-react'
import type { MatchQuestion } from '@/types/learning'
import { shuffle } from '@/lib/quiz'
import { cn } from '@/lib/utils'

/** Zuordnungsaufgabe: jedem linken Begriff wird per Auswahlliste ein Element der rechten Seite zugeordnet. */
export function MatchInput({
  question,
  value,
  onChange,
  revealed,
  order: fixedOrder,
}: {
  question: MatchQuestion
  value: (number | null)[]
  onChange: (v: (number | null)[]) => void
  revealed: boolean
  /** feste Reihenfolge der rechten Seite (Original-Indizes), z. B. für die Probeprüfung */
  order?: number[]
}) {
  // Rechte Seite einmal pro Frage mischen; der Wert ist immer der Original-Index
  const order = useMemo(() => fixedOrder ?? shuffle(question.pairs.map((_, i) => i)), [question, fixedOrder])

  return (
    <div className="space-y-2">
      {question.pairs.map((pair, i) => {
        const chosen = value[i]
        const ok = chosen === i
        return (
          <div
            key={pair.left}
            className={cn(
              'grid items-center gap-2 rounded-lg border p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]',
              revealed && (ok ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'),
            )}
          >
            <label htmlFor={`match-${question.id}-${i}`} className="flex items-center gap-2 text-sm font-semibold">
              {revealed && (ok ? <CheckCircle2 className="size-4 text-success" /> : <XCircle className="size-4 text-destructive" />)}
              {pair.left}
            </label>
            <div>
              <select
                id={`match-${question.id}-${i}`}
                disabled={revealed}
                value={chosen ?? ''}
                onChange={(e) => {
                  const next = [...value]
                  next[i] = e.target.value === '' ? null : Number(e.target.value)
                  onChange(next)
                }}
                className="h-10 w-full rounded-md border bg-background px-2 text-sm focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <option value="">– bitte wählen –</option>
                {order.map((r) => (
                  <option key={r} value={r}>
                    {question.pairs[r].right}
                  </option>
                ))}
              </select>
              {revealed && !ok && <p className="mt-1 text-xs text-success">Richtig: {pair.right}</p>}
            </div>
          </div>
        )
      })}
    </div>
  )
}
