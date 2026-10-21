import { useState } from 'react'
import { collisionRisk, cpaAfterAlteration, formatBearing, formatNumber, fromPolar, plotTarget, type RadarObservation } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, Toggle, fieldsValid, useNumberField } from '@/modules/calculators/fields'

const f1 = (n: number) => formatNumber(n, 1)

const SCENARIOS = {
  crossing: { label: 'Kreuzer von Steuerbord', first: { bearing: 45, range: 7.1 }, second: { bearing: 45, range: 6.3 }, own: { course: 0, speed: 6 } },
  overtake: { label: 'Überholer von achtern', first: { bearing: 190, range: 4 }, second: { bearing: 191, range: 3.2 }, own: { course: 0, speed: 5 } },
  fisher: { label: 'Stillliegendes Ziel', first: { bearing: 15, range: 6 }, second: { bearing: 16.6, range: 5.42 }, own: { course: 0, speed: 6 } },
} as const

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

function Cell({ label, value, highlight, tone }: { label: string; value: string; highlight?: boolean; tone?: 'danger' | 'ok' }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', highlight ? 'border-primary bg-primary/10' : 'bg-muted/50', tone === 'danger' && 'border-destructive bg-destructive/10', tone === 'ok' && 'border-success bg-success/10')}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}

const aspectText = (a: number | null) => (a === null ? '—' : Math.abs(a) < 1 ? 'genau voraus' : `${a > 0 ? 'Grün' : 'Rot'} ${Math.round(Math.abs(a))}°`)

/** Vergrößerte Darstellung des Plotdreiecks (die 6-Minuten-Wege sind im Radarbild sehr klein). */
function TriangleInset({ w, o, a }: { w: { x: number; y: number }; o: { x: number; y: number }; a: { x: number; y: number } }) {
  const pts = [w, o, a]
  const minX = Math.min(...pts.map((p) => p.x))
  const maxX = Math.max(...pts.map((p) => p.x))
  const minY = Math.min(...pts.map((p) => p.y))
  const maxY = Math.max(...pts.map((p) => p.y))
  const s = Math.min(110 / Math.max(maxX - minX, 0.01), 95 / Math.max(maxY - minY, 0.01))
  const X = (x: number) => 30 + (110 - (maxX - minX) * s) / 2 + (x - minX) * s
  const Y = (y: number) => 30 + (95 - (maxY - minY) * s) / 2 + (maxY - y) * s
  const lbl = (p: { x: number; y: number }, t: string) => <text x={Math.min(X(p.x) + 6, 175 - t.length * 6)} y={Y(p.y) - 6} fontSize={12} fontWeight={600} fill="currentColor">{t}</text>
  return (
    <svg viewBox="0 0 180 150" className="h-auto w-full max-w-56 rounded-lg border bg-muted/40" role="img" aria-label="Plotdreieck vergrößert">
      <text x={6} y={14} fontSize={10} fill="currentColor" fillOpacity={0.7}>Plotdreieck vergrößert (N oben)</text>
      <line x1={X(w.x)} y1={Y(w.y)} x2={X(o.x)} y2={Y(o.y)} stroke="#3b82f6" strokeWidth={2} strokeDasharray="5 3" />
      <line x1={X(w.x)} y1={Y(w.y)} x2={X(a.x)} y2={Y(a.y)} stroke="#16a34a" strokeWidth={2.5} />
      <line x1={X(o.x)} y1={Y(o.y)} x2={X(a.x)} y2={Y(a.y)} stroke="#dc2626" strokeWidth={2.5} />
      {[w, o, a].map((p, i) => <circle key={i} cx={X(p.x)} cy={Y(p.y)} r={3.5} fill="currentColor" />)}
      {Math.hypot(a.x - w.x, a.y - w.y) * s < 12 ? (
        lbl(a, 'A = W (Ziel liegt still)')
      ) : (
        <>
          {lbl(w, 'W')}
          {lbl(a, 'A')}
        </>
      )}
      {lbl(o, 'O')}
    </svg>
  )
}

export function RadarPlotWidget() {
  const [scenario, setScenario] = useState<keyof typeof SCENARIOS>('crossing')
  const sc = SCENARIOS[scenario]
  const b1 = useNumberField(String(sc.first.bearing), { min: 0, max: 360, bearing: true })
  const r1 = useNumberField(String(sc.first.range), { min: 0.1, max: 24 })
  const b2 = useNumberField(String(sc.second.bearing), { min: 0, max: 360, bearing: true })
  const r2 = useNumberField(String(sc.second.range), { min: 0.1, max: 24 })
  const mins = useNumberField('6', { min: 1, max: 30 })
  const oc = useNumberField(String(sc.own.course), { min: 0, max: 360, bearing: true })
  const os = useNumberField(String(sc.own.speed), { min: 0, max: 30 })
  const [alter, setAlter] = useState(0)
  const pick = (k: keyof typeof SCENARIOS) => {
    setScenario(k)
    const s = SCENARIOS[k]
    b1.setText(String(s.first.bearing))
    r1.setText(String(s.first.range))
    b2.setText(String(s.second.bearing))
    r2.setText(String(s.second.range))
    oc.setText(String(s.own.course))
    os.setText(String(s.own.speed))
    mins.setText('6')
    setAlter(0)
  }
  const valid = fieldsValid(b1, r1, b2, r2, mins, oc, os)
  const p = valid ? plotTarget({ bearing: b1.value!, range: r1.value! } as RadarObservation, { bearing: b2.value!, range: r2.value! }, mins.value!, oc.value!, os.value!) : null
  const alt = p && alter !== 0 ? cpaAfterAlteration(p, (oc.value! + alter + 360) % 360, os.value!) : null
  const risk = p ? collisionRisk({ cpa: p.cpa, tcpaMinutes: p.tcpaMinutes, closing: p.tcpaMinutes !== null, currentDistance: r2.value! }, 1, 20) : 'none'

  const maxR = Math.max(6, r1.value ?? 0, r2.value ?? 0) * 1.15
  const S = 130 / maxR
  const C = 150
  const X = (x: number) => C + x * S
  const Y = (y: number) => C - y * S
  const ext = p ? { x: p.a.x + p.relative.x * 1.2, y: p.a.y + p.relative.y * 1.2 } : null
  const ownHead = fromPolar(maxR * 0.5, oc.value ?? 0)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Nordstabilisiertes Radarbild, eigenes Schiff in der Mitte. Zwei Beobachtungen desselben Ziels (O und A) im Abstand von meist 6 Minuten ergeben die Relativbewegung. Verlängert man O→A, sieht man den kleinsten Abstand (CPA). Mit dem eigenen Weg (W→O) entsteht das Plotdreieck: W→A ist der wahre Weg des Ziels.
      </p>
      <Toggle value={scenario} onChange={pick} label="Beispiel" options={(Object.keys(SCENARIOS) as (keyof typeof SCENARIOS)[]).map((k) => ({ value: k, label: SCENARIOS[k].label }))} />
      <div className="grid gap-3 sm:grid-cols-4">
        <NumberField label="1. Peilung (rw)" unit="°" field={b1} />
        <NumberField label="1. Abstand" unit="NM" field={r1} />
        <NumberField label="2. Peilung (rw)" unit="°" field={b2} />
        <NumberField label="2. Abstand" unit="NM" field={r2} />
        <NumberField label="Zeit dazwischen" unit="min" field={mins} />
        <NumberField label="Eigener Kurs" unit="°" field={oc} />
        <NumberField label="Eigene Fahrt" unit="kn" field={os} />
      </div>
      {p && (
        <div className="grid gap-4 md:grid-cols-[300px_1fr]">
          <svg viewBox="0 0 300 300" className="h-auto w-full rounded-full border bg-slate-900" role="img" aria-label="Radarbild mit Plotdreieck, Relativbewegung und CPA">
            {[0.25, 0.5, 0.75, 1].map((k) => (
              <circle key={k} cx={C} cy={C} r={130 * k} fill="none" stroke="#22c55e" strokeOpacity={0.25} />
            ))}
            <text x={C + 3} y={C - 130 + 10} fontSize={9} fill="#86efac">{f1(maxR)} NM</text>
            <line x1={C} y1={C} x2={X(ownHead.x)} y2={Y(ownHead.y)} stroke="#e2e8f0" strokeOpacity={0.5} strokeDasharray="2 3" />
            <line x1={X(p.w.x)} y1={Y(p.w.y)} x2={X(p.o.x)} y2={Y(p.o.y)} stroke="#93c5fd" strokeWidth={1.5} strokeDasharray="4 2" />
            <line x1={X(p.w.x)} y1={Y(p.w.y)} x2={X(p.a.x)} y2={Y(p.a.y)} stroke="#4ade80" strokeWidth={2} />
            {ext && <line x1={X(p.o.x)} y1={Y(p.o.y)} x2={X(ext.x)} y2={Y(ext.y)} stroke="#f87171" strokeWidth={1.5} strokeDasharray="5 3" />}
            <line x1={X(p.o.x)} y1={Y(p.o.y)} x2={X(p.a.x)} y2={Y(p.a.y)} stroke="#f87171" strokeWidth={2.5} />
            {p.tcpaMinutes !== null && <line x1={C} y1={C} x2={X(p.cpaPoint.x)} y2={Y(p.cpaPoint.y)} stroke="#fbbf24" strokeWidth={1.5} />}
            {(['o', 'a', 'w'] as const).map((k) => (
              <g key={k}>
                <circle cx={X(p[k].x)} cy={Y(p[k].y)} r={3.5} fill={k === 'w' ? '#93c5fd' : '#f87171'} />
                <text x={X(p[k].x) + 5} y={Y(p[k].y) - 4} fontSize={11} fontWeight={600} fill="#f8fafc">{k.toUpperCase()}</text>
              </g>
            ))}
            <circle cx={C} cy={C} r={4} fill="#f8fafc" />
            <text x={C + 6} y={C + 14} fontSize={9} fill="#e2e8f0">eigenes Schiff</text>
            <text x={C - 4} y={14} fontSize={10} fill="#e2e8f0">N</text>
          </svg>
          <div className="space-y-3">
            <TriangleInset w={p.w} o={p.o} a={p.a} />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              <Cell label="Relativbewegung" value={`${p.relativeCourse === null ? '—' : formatBearing(p.relativeCourse, 0)} · ${f1(p.relativeSpeed)} kn`} />
              <Cell label="Wahrer Kurs des Ziels" value={p.targetSpeed < 0.5 ? 'liegt still' : formatBearing(p.targetCourse!, 0)} highlight />
              <Cell label="Wahre Fahrt des Ziels" value={`${f1(p.targetSpeed)} kn`} highlight />
              <Cell label="CPA" value={`${formatNumber(p.cpa, 2)} NM`} tone={risk === 'danger' || risk === 'warning' ? 'danger' : p.tcpaMinutes !== null ? undefined : 'ok'} />
              <Cell label="TCPA (ab 2. Beobachtung)" value={p.tcpaMinutes === null ? 'öffnet sich' : `${Math.round(p.tcpaMinutes)} min`} />
              <Cell label="Aspekt (wir vom Ziel aus)" value={aspectText(p.aspect)} />
            </div>
            <p className="text-xs text-muted-foreground">
              Rot: Relativbewegung O→A und Verlängerung · Grün: wahrer Weg des Ziels W→A · Blau gestrichelt: eigener Weg W→O · Gelb: CPA. Aspekt „Rot" heißt: Das Ziel sieht uns an seiner Backbordseite – wir sehen sein rotes Seitenlicht.
            </p>
            <div className="space-y-2 rounded-lg border p-3">
              <Slide label="Ausweichmanöver: Kursänderung" value={`${alter > 0 ? '+' : alter < 0 ? '−' : ''}${Math.abs(alter)}° → ${formatBearing(((oc.value ?? 0) + alter + 360) % 360, 0)}`} min={-90} max={90} step={5} v={alter} on={setAlter} />
              {alt ? (
                <p className="text-sm">
                  Neuer CPA: <b className="font-mono">{formatNumber(alt.cpa, 2)} NM</b>
                  {alt.tcpaMinutes !== null && ` nach ${Math.round(alt.tcpaMinutes)} min`} – {alt.cpa >= 1 ? 'deutlich frei.' : 'noch zu knapp.'}
                  {alter < 0 && ' Achtung: Bei einem Ziel von vorn oder von Steuerbord nach Möglichkeit nicht nach Backbord ausweichen (Rule 19 bei verminderter Sicht).'}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">Verschiebe den Regler, um ein Ausweichmanöver ab der zweiten Beobachtung zu testen. Große, frühe Kursänderungen sind auf dem Radar des anderen gut zu erkennen.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
