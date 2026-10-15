import { useEffect, useId, useState } from 'react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface NumberSliderProps {
  label: string
  sublabel?: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  onChange: (v: number) => void
  /** Winkel: Eingaben wie 360 oder -5 werden auf 0–359 normiert */
  wrap?: boolean
  decimals?: number
  colorClass?: string
  formatValue?: (v: number) => string
}

export function NumberSlider({
  label,
  sublabel,
  value,
  min,
  max,
  step,
  unit,
  onChange,
  wrap,
  decimals = 0,
  colorClass,
  formatValue,
}: NumberSliderProps) {
  const id = useId()
  const display = (v: number) => (formatValue ? formatValue(v) : v.toFixed(decimals).replace('.', ','))
  const [text, setText] = useState(display(value))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setText(display(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const commit = (raw: string) => {
    const n = Number(raw.replace(',', '.').replace(/[°\s]|kn|min/gi, ''))
    if (raw.trim() === '' || !Number.isFinite(n)) {
      setError('Bitte eine Zahl eingeben')
      setText(display(value))
      return
    }
    let v = n
    if (wrap) v = ((v % 360) + 360) % 360
    if (v < min || v > max) {
      setError(`Erlaubt: ${min}–${max} ${unit}`)
      v = Math.min(max, Math.max(min, v))
    } else setError(null)
    const rounded = Math.round(v / step) * step
    const fixed = Number(rounded.toFixed(4))
    onChange(fixed)
    setText(display(fixed))
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="min-w-0 text-sm font-medium leading-tight">
          <span className={cn('mr-1.5 inline-block size-2.5 rounded-full align-middle', colorClass ?? 'hidden')} />
          {label}
          {sublabel && <span className="block text-xs font-normal text-muted-foreground">{sublabel}</span>}
        </label>
        <div className="flex shrink-0 items-center gap-1">
          <input
            id={id}
            inputMode="decimal"
            className="h-9 w-20 rounded-md border bg-background px-2 text-right font-mono text-sm tabular-nums focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onBlur={(e) => commit(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit((e.target as HTMLInputElement).value)
            }}
            aria-invalid={!!error}
          />
          <span className="w-8 text-xs text-muted-foreground">{unit}</span>
        </div>
      </div>
      <Slider
        value={[Math.min(max, Math.max(min, value))]}
        min={min}
        max={max}
        step={step}
        onValueChange={([v]) => {
          setError(null)
          onChange(Number(v.toFixed(4)))
        }}
        aria-label={label}
      />
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
