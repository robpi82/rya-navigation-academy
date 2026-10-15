import { useId, useState, type ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FieldSpec {
  min: number
  max: number
  /** Winkel: wird auf 0–360 normiert, 360 ist erlaubt (= 000) */
  bearing?: boolean
  integer?: boolean
  optional?: boolean
}

export interface NumberFieldState {
  text: string
  setText: (t: string) => void
  /** gültiger Zahlenwert oder null */
  value: number | null
  error: string | null
  spec: FieldSpec
}

/** Hält den Text einer Zahleneingabe und validiert ihn (deutsches Komma erlaubt). */
export function useNumberField(initial: string, spec: FieldSpec): NumberFieldState {
  const [text, setText] = useState(initial)
  const trimmed = text.trim().replace(',', '.')
  let value: number | null = null
  let error: string | null = null
  if (trimmed === '') {
    if (!spec.optional) error = 'Pflichtfeld'
  } else if (!/^-?\d*\.?\d+$/.test(trimmed)) {
    error = 'Bitte eine Zahl eingeben'
  } else {
    const n = Number(trimmed)
    if (spec.integer && !Number.isInteger(n)) error = 'Bitte eine ganze Zahl eingeben'
    else if (n < spec.min || n > spec.max) error = `Erlaubt: ${fmt(spec.min)} bis ${fmt(spec.max)}`
    else value = spec.bearing ? n % 360 : n
  }
  return { text, setText, value, error, spec }
}

const fmt = (n: number) => String(n).replace('.', ',')

export function NumberField({ label, hint, unit, field, className }: { label: string; hint?: string; unit?: string; field: NumberFieldState; className?: string }) {
  const id = useId()
  const [touched, setTouched] = useState(false)
  const showError = touched && field.error
  return (
    <div className={cn('space-y-1', className)}>
      <label htmlFor={id} className="block text-sm font-medium leading-tight">
        {label}
        {field.spec.optional && <span className="font-normal text-muted-foreground"> (optional)</span>}
        {hint && <span className="block text-xs font-normal text-muted-foreground">{hint}</span>}
      </label>
      <div className="flex items-center gap-2">
        <input
          id={id}
          inputMode="decimal"
          autoComplete="off"
          value={field.text}
          onChange={(e) => {
            field.setText(e.target.value)
            setTouched(true)
          }}
          onBlur={() => setTouched(true)}
          aria-invalid={!!showError}
          className={cn(
            'h-10 w-full min-w-0 rounded-md border bg-background px-3 font-mono tabular-nums focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
            showError && 'border-destructive',
          )}
        />
        {unit && <span className="w-8 shrink-0 text-sm text-muted-foreground">{unit}</span>}
      </div>
      {showError && <p className="text-xs text-destructive">{field.error}</p>}
    </div>
  )
}

export function Toggle<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="inline-flex rounded-lg bg-muted p-1" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === o.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/** Ergebnisblock: zeigt Hinweis, solange Eingaben ungültig sind. */
export function ResultPanel({ valid, children, steps }: { valid: boolean; children?: ReactNode; steps?: ReactNode[] }) {
  if (!valid)
    return (
      <div className="flex items-center gap-2 rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        <AlertTriangle className="size-4" /> Bitte alle Pflichtfelder gültig ausfüllen.
      </div>
    )
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">{children}</div>
      {steps && steps.length > 0 && (
        <div className="rounded-lg bg-muted/50 p-4">
          <p className="mb-2 text-sm font-semibold">Rechenweg</p>
          <ol className="list-decimal space-y-1.5 pl-5 text-sm leading-relaxed">
            {steps.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export function ResultValue({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: string }) {
  return (
    <div className={cn('rounded-lg p-3', highlight ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-muted/60')}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('font-mono text-lg font-semibold tabular-nums', highlight && 'text-primary')}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

export const fieldsValid = (...fs: NumberFieldState[]) => fs.every((f) => f.error === null)
