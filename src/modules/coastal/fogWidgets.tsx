import { useState } from 'react'
import { closingSpeed, formatNumber, safeSpeedForVisibility, secondsToMeet, stoppingDistance } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { FOG_STEPS } from '@/data/fog'
import { cn } from '@/lib/utils'
import { OrderExercise } from '@/modules/daylessons/safetyWidgets'

const f1 = (n: number) => formatNumber(n, 1)

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

function Cell({ label, value, tone }: { label: string; value: string; tone?: 'danger' | 'ok' }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', tone === 'danger' ? 'border-destructive bg-destructive/10' : tone === 'ok' ? 'border-success bg-success/10' : 'bg-muted/50')}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}

export function FogEncounterWidget() {
  const [visM, setVisM] = useState(200)
  const [own, setOwn] = useState(6)
  const [other, setOther] = useState(12)
  const [angle, setAngle] = useState(180)
  const vis = visM / 1852
  const closing = closingSpeed(own, other, angle)
  const secs = secondsToMeet(vis, closing)
  const stop = stoppingDistance(own)
  const safe = safeSpeedForVisibility(vis)
  const tooFast = own > safe + 0.05
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bei Nebel taucht ein anderes Fahrzeug erst an der Sichtgrenze auf. Wie viel Zeit bleibt dann noch – und kannst du innerhalb der halben Sichtweite anhalten? Annahme: 30 s zum Erkennen, Entscheiden und Handeln, dann „voll zurück" mit 0,3 m/s² Verzögerung.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Sichtweite" value={`${visM} m`} min={50} max={2000} step={50} v={visM} on={setVisM} />
        <Slide label="Winkel zwischen den Kursen" value={angle === 180 ? '180° (Gegenkurs)' : `${angle}°`} min={0} max={180} step={15} v={angle} on={setAngle} />
        <Slide label="Eigene Fahrt" value={`${own} kn`} min={0} max={12} step={0.5} v={own} on={setOwn} />
        <Slide label="Fahrt des anderen" value={`${other} kn`} min={0} max={25} step={1} v={other} on={setOther} />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Cell label="Annäherung" value={`${f1(closing)} kn`} />
        <Cell label="Zeit ab Sichtkontakt" value={Number.isFinite(secs) ? `${Math.round(secs)} s` : '—'} tone={secs < 60 ? 'danger' : undefined} />
        <Cell label="Eigener Anhalteweg" value={`${Math.round(stop)} m`} tone={tooFast ? 'danger' : 'ok'} />
        <Cell label="Höchstens (halbe Sicht)" value={`${f1(safe)} kn`} tone={tooFast ? 'danger' : 'ok'} />
      </div>
      <p className={cn('rounded-lg border p-3 text-sm', tooFast || secs < 60 ? 'border-destructive/40 bg-destructive/5' : 'border-success/40 bg-success/5')}>
        {tooFast ? `Zu schnell: Mit ${own} kn brauchst du ${Math.round(stop)} m bis zum Stillstand – mehr als die halbe Sichtweite (${Math.round(visM / 2)} m). ` : 'Deine Fahrt erlaubt das Anhalten innerhalb der halben Sichtweite. '}
        {secs < 60 && Number.isFinite(secs) ? `Bei ${f1(closing)} kn Annäherung bleiben nur ${Math.round(secs)} s – zu wenig für ein überlegtes Manöver. Radar, AIS und Gehör müssen das Fahrzeug viel früher melden.` : ''}
      </p>
      <p className="text-xs text-muted-foreground">Faustregel und vereinfachtes Modell. Rule 6/19 verlangen eine sichere Geschwindigkeit, die den Umständen angepasst ist – auch die Fahrt des anderen, Verkehr und Manövrierfähigkeit zählen.</p>
    </div>
  )
}

export function FogActionsWidget() {
  return (
    <OrderExercise
      steps={FOG_STEPS}
      intro="Nebel zieht auf. Bringe die Maßnahmen in eine sinnvolle Reihenfolge. In der Praxis laufen viele davon gleichzeitig – die Position zuerst, solange du noch weißt, wo du bist."
    />
  )
}
