import { useMemo, useState } from 'react'
import { formatNumber } from '@/calculations'
import { buildOrder } from './order'
import { parseNumberInput } from '@/lib/quiz'
import type { ExamAnswer } from '@/lib/exam'
import type { Question } from '@/types/learning'
import { cn } from '@/lib/utils'
import { MatchInput } from '@/modules/quiz/MatchInput'

/** Antworteingabe für alle drei Fragetypen ohne Sofort-Rückmeldung (Prüfungsmodus). */
export function QuestionInput({ q, seed, value, onChange }: { q: Question; seed: number; value: ExamAnswer; onChange: (a: ExamAnswer) => void }) {
  if (q.type === 'mc')
    return (
      <div className="grid gap-2" role="radiogroup" aria-label="Antwortmöglichkeiten">
        {q.options.map((opt, i) => (
          <button
            key={opt}
            type="button"
            role="radio"
            aria-checked={value === i}
            onClick={() => onChange(value === i ? null : i)}
            className={cn('flex min-h-12 items-center gap-3 rounded-lg border px-4 py-2.5 text-left text-sm transition-colors', value === i ? 'border-primary bg-accent' : 'hover:bg-muted')}
          >
            <span className={cn('flex size-6 shrink-0 items-center justify-center rounded-full border font-mono text-xs', value === i && 'border-primary bg-primary text-primary-foreground')}>{String.fromCharCode(65 + i)}</span>
            {opt}
          </button>
        ))}
      </div>
    )
  if (q.type === 'match') return <MatchEntry q={q} seed={seed} value={value} onChange={onChange} />
  return <NumericEntry q={q} value={value} onChange={onChange} />
}

function MatchEntry({ q, seed, value, onChange }: { q: Extract<Question, { type: 'match' }>; seed: number; value: ExamAnswer; onChange: (a: ExamAnswer) => void }) {
  const order = useMemo(() => buildOrder(q.id, q.pairs.length, seed), [q, seed])
  const current = Array.isArray(value) ? value : q.pairs.map(() => null)
  return <MatchInput question={q} value={current} order={order} revealed={false} onChange={(v) => onChange(v.every((x) => x === null) ? null : v)} />
}

function NumericEntry({ q, value, onChange }: { q: Extract<Question, { type: 'numeric' }>; value: ExamAnswer; onChange: (a: ExamAnswer) => void }) {
  const [text, setText] = useState(typeof value === 'number' ? String(value).replace('.', ',') : '')
  const invalid = text.trim() !== '' && parseNumberInput(text) === null
  return (
    <div className="space-y-1">
      <label htmlFor={`exam-num-${q.id}`} className="text-sm font-medium">
        Deine Antwort
      </label>
      <div className="flex items-center gap-2">
        <input
          id={`exam-num-${q.id}`}
          inputMode="decimal"
          autoComplete="off"
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            onChange(parseNumberInput(e.target.value))
          }}
          aria-invalid={invalid}
          className="h-11 w-40 rounded-md border bg-background px-3 font-mono text-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
        />
        <span className="text-muted-foreground">{q.unit}</span>
      </div>
      {invalid && <p className="text-sm text-destructive">Bitte eine Zahl eingeben, z. B. 5,4</p>}
      <p className="text-xs text-muted-foreground">Toleranz ± {formatNumber(q.tolerance, q.tolerance < 0.1 ? 2 : 1)} {q.unit}</p>
    </div>
  )
}
