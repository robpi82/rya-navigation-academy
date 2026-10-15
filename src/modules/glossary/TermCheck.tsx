import { useState } from 'react'
import { CheckCircle2, RotateCcw, XCircle } from 'lucide-react'
import type { ChoiceCheck } from '@/types/learning'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/** Kleine Verständnisfrage mit sofortigem Feedback. */
export function TermCheck({ check, onAnswered }: { check: ChoiceCheck; onAnswered: (correct: boolean) => void }) {
  const [selected, setSelected] = useState<number | null>(null)
  const answered = selected !== null
  return (
    <div className="space-y-3">
      <p className="font-medium">{check.question}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {check.options.map((opt, i) => {
          const isCorrect = i === check.correctIndex
          const isSelected = i === selected
          return (
            <button
              key={opt}
              type="button"
              disabled={answered}
              onClick={() => {
                setSelected(i)
                onAnswered(isCorrect)
              }}
              className={cn(
                'flex min-h-11 items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors',
                !answered && 'hover:border-primary hover:bg-accent',
                answered && isCorrect && 'border-success bg-success/10 text-success',
                answered && isSelected && !isCorrect && 'border-destructive bg-destructive/10 text-destructive',
                answered && !isCorrect && !isSelected && 'opacity-60',
              )}
            >
              {answered && isCorrect && <CheckCircle2 className="size-4 shrink-0" />}
              {answered && isSelected && !isCorrect && <XCircle className="size-4 shrink-0" />}
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className="flex flex-wrap items-start justify-between gap-2 rounded-lg bg-muted p-3 text-sm">
          <p>
            <b className={selected === check.correctIndex ? 'text-success' : 'text-destructive'}>
              {selected === check.correctIndex ? 'Richtig! ' : 'Leider falsch. '}
            </b>
            {check.explanation}
          </p>
          <Button variant="ghost" size="sm" onClick={() => setSelected(null)}>
            <RotateCcw /> Nochmal
          </Button>
        </div>
      )}
    </div>
  )
}
