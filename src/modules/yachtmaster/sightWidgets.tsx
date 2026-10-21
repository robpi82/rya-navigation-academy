import { useState } from 'react'
import { computeAltitudeAzimuth, cutAngle, formatBearing, formatLatLon, formatNumber, fromPolar, intercept, iteratedSightFix, rhumbLine, sunGHA, toDegMin, toLocalNm, type Intercept } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { NumberField, fieldsValid, useNumberField } from '@/modules/calculators/fields'
import type { LatLon } from '@/types/navigation'

const f1 = (n: number) => formatNumber(n, 1)
const degMin = (v: number) => {
  const d = toDegMin(v)
  return `${d.sign < 0 ? '−' : ''}${d.deg}°${f1(d.min).padStart(4, '0')}′`
}

function Step({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3 border-b py-1 text-sm', highlight && 'font-semibold text-primary')}>
      <span className={cn(!highlight && 'text-muted-foreground')}>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  )
}

/** Lokale Skizze um die AP: Standlinien als Geraden, Punkte als Kreise (x Ost, y Nord in NM). */
function LopPlot({ ap, lines, points, label }: { ap: LatLon; lines: { i: Intercept; color: string; name: string }[]; points: { pos: LatLon; color: string; name: string; symbol?: 'fix' | 'cross' }[]; label: string }) {
  const W = 260
  const H = 220
  const pts = [{ x: 0, y: 0 }, ...lines.map((l) => fromPolar(l.i.intercept, l.i.zn)), ...points.map((p) => toLocalNm(ap, p.pos))]
  const span = Math.max(8, ...pts.map((p) => Math.max(Math.abs(p.x), Math.abs(p.y)))) * 1.3
  const s = Math.min(W, H) / 2 / span
  const X = (x: number) => W / 2 + x * s
  const Y = (y: number) => H / 2 - y * s
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label={label}>
      <text x={W - 10} y={14} fontSize={9} textAnchor="end" fill="currentColor" fillOpacity={0.6}>N ↑ · Maßstab ±{Math.round(span)} NM</text>
      {lines.map(({ i, color, name }) => {
        const foot = fromPolar(i.intercept, i.zn)
        const az = fromPolar(span * 0.9, i.zn)
        const d = fromPolar(span * 3, i.lineDirection)
        return (
          <g key={name}>
            <line x1={X(0)} y1={Y(0)} x2={X(az.x)} y2={Y(az.y)} stroke={color} strokeOpacity={0.45} strokeDasharray="4 3" />
            <line x1={X(foot.x - d.x)} y1={Y(foot.y - d.y)} x2={X(foot.x + d.x)} y2={Y(foot.y + d.y)} stroke={color} strokeWidth={2} />
            <text x={X(az.x)} y={Y(az.y) - 4} fontSize={9} fill={color} textAnchor="middle">{name} {formatBearing(i.zn, 0)}</text>
          </g>
        )
      })}
      <circle cx={X(0)} cy={Y(0)} r={3} fill="currentColor" />
      <text x={X(0) + 5} y={Y(0) + 12} fontSize={9} fill="currentColor">AP</text>
      {points.map((p) => {
        const v = toLocalNm(ap, p.pos)
        return p.symbol === 'cross' ? (
          <g key={p.name}>
            <path d={`M ${X(v.x) - 4} ${Y(v.y) - 4} L ${X(v.x) + 4} ${Y(v.y) + 4} M ${X(v.x) - 4} ${Y(v.y) + 4} L ${X(v.x) + 4} ${Y(v.y) - 4}`} stroke={p.color} strokeWidth={1.5} />
            <text x={X(v.x) + 6} y={Y(v.y) + 12} fontSize={9} fill={p.color}>{p.name}</text>
          </g>
        ) : (
          <g key={p.name}>
            <circle cx={X(v.x)} cy={Y(v.y)} r={5} fill="none" stroke={p.color} strokeWidth={1.5} />
            <circle cx={X(v.x)} cy={Y(v.y)} r={1.5} fill={p.color} />
            <text x={X(v.x) + 7} y={Y(v.y) - 5} fontSize={9} fill={p.color}>{p.name}</text>
          </g>
        )
      })}
    </svg>
  )
}

/* ------------------------------------------------------------------ Intercept */

export function InterceptWidget() {
  const apLat = useNumberField('50', { min: -70, max: 70 })
  const apLon = useNumberField('-16', { min: -180, max: 180 })
  const ut = useNumberField('10', { min: 0, max: 24 })
  const dec = useNumberField('12', { min: -23.5, max: 23.5 })
  const eot = useNumberField('0', { min: -17, max: 17 })
  const ho = useNumberField('36.7', { min: 0, max: 90 })
  const valid = fieldsValid(apLat, apLon, ut, dec, eot, ho)
  const ap = { lat: apLat.value ?? 0, lon: apLon.value ?? 0 }
  const gha = valid ? sunGHA(ut.value!, eot.value!) : 0
  const i = valid ? intercept(ap, gha, dec.value!, ho.value!) : null
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Man nimmt eine gegisste Position (AP) an und berechnet, wie hoch die Sonne dort stehen müsste (Hc) und in welcher Richtung (Azimut Zn). Ist die gemessene Höhe Ho größer, steht man näher am Bildpunkt der Sonne: Der Abstand Ho − Hc in Bogenminuten ist der Versatz in Seemeilen zum Gestirn hin (toward), sonst davon weg (away). Die Standlinie steht senkrecht zum Azimut. Eingaben in Dezimalgrad, Nord und Ost positiv.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <NumberField label="AP Breite" unit="°" field={apLat} />
          <NumberField label="AP Länge" unit="°" field={apLon} />
          <NumberField label="Uhrzeit UT" hint="Dezimalstunden" unit="h" field={ut} />
          <NumberField label="Deklination Sonne" unit="°" field={dec} />
          <NumberField label="Zeitgleichung" unit="min" field={eot} />
          <NumberField label="Beobachtete Höhe Ho" unit="°" field={ho} />
        </div>
        {i ? (
          <div className="max-w-md">
            <Step label="GHA Sonne ≈ 15° · (UT − 12) + Zeitgleichung/4" value={degMin(gha)} />
            <Step label="LHA = GHA + Länge" value={degMin(i.lha)} />
            <Step label="Berechnete Höhe Hc" value={degMin(i.hc)} />
            <Step label="Azimut Zn" value={formatBearing(i.zn, 1)} />
            <Step label="Intercept (Ho − Hc) · 60" value={`${f1(Math.abs(i.intercept))} NM ${i.intercept >= 0 ? 'toward (zum Gestirn)' : 'away (weg)'}`} highlight />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Bitte gültige Werte eingeben.</p>
        )}
      </div>
      {i && <LopPlot ap={ap} lines={[{ i, color: '#f97316', name: 'Sonne' }]} points={[]} label="Skizze: AP, Azimut zur Sonne und Höhenstandlinie" />}
    </div>
  )
}

/* ------------------------------------------------------------------ Fix aus zwei Gestirnen */

const TRUTH = { lat: 49.6, lon: -16.2 }
const AP = { lat: 50, lon: -16 }
const BODIES = [
  { name: 'Stern A', gha: 20, dec: 28, color: '#2563eb' },
  { name: 'Stern B', gha: 115, dec: 45, color: '#16a34a' },
]

export function SightFixWidget() {
  const [errA, setErrA] = useState(0)
  const [errB, setErrB] = useState(0)
  const [iter, setIter] = useState(1)
  const obs = BODIES.map((b, k) => ({ gha: b.gha, declination: b.dec, observedAltitude: computeAltitudeAzimuth(TRUTH, b.gha, b.dec).hc + (k === 0 ? errA : errB) / 60 }))
  const ints = obs.map((o) => intercept(AP, o.gha, o.declination, o.observedAltitude))
  const fix = iteratedSightFix(AP, obs[0], obs[1], iter)
  const err = fix ? rhumbLine(fix, TRUTH).distance : null
  const cut = cutAngle(ints[0].zn, ints[1].zn)
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          In der Dämmerung misst man zwei oder mehr Sterne kurz nacheinander. Jede Höhe liefert eine Standlinie; ihr Schnitt ist der astronomische Fix. Hier sind die Höhen aus einer (sonst unbekannten) wahren Position erzeugt – stelle Messfehler ein und beobachte den Fix.
        </p>
        {BODIES.map((b, k) => (
          <div key={b.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium" style={{ color: b.color }}>{b.name}: Messfehler</span>
              <span className="font-mono">{(k === 0 ? errA : errB) >= 0 ? '+' : '−'}{Math.abs(k === 0 ? errA : errB)}′</span>
            </div>
            <Slider value={[k === 0 ? errA : errB]} min={-5} max={5} step={0.5} onValueChange={([v]) => (k === 0 ? setErrA(v) : setErrB(v))} aria-label={`Messfehler ${b.name}`} />
          </div>
        ))}
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4" checked={iter === 2} onChange={(e) => setIter(e.target.checked ? 2 : 1)} />
          Mit dem Fix als neuer AP nachrechnen
        </label>
        <div className="max-w-md">
          {ints.map((i, k) => (
            <Step key={k} label={`${BODIES[k].name}: Zn / Intercept`} value={`${formatBearing(i.zn, 0)} / ${f1(Math.abs(i.intercept))} NM ${i.intercept >= 0 ? 'T' : 'A'}`} />
          ))}
          <Step label="Schnittwinkel der Standlinien" value={`${Math.round(cut)}°`} />
          <Step label="Fix" value={fix ? formatLatLon(fix) : '—'} highlight />
          <Step label="Abstand zur wahren Position" value={err === null ? '—' : `${formatNumber(err, 2)} NM`} />
        </div>
        <p className="text-xs text-muted-foreground">1′ Messfehler verschiebt eine Standlinie um 1 NM. Ohne Nachrechnen bleibt ein kleiner Fehler, weil die gerade Standlinie den Standkreis nur nahe der AP gut annähert (hier liegt die AP rund 26 NM entfernt).</p>
      </div>
      <LopPlot
        ap={AP}
        lines={ints.map((i, k) => ({ i, color: BODIES[k].color, name: BODIES[k].name }))}
        points={[...(fix ? [{ pos: fix, color: '#e11d48', name: 'Fix' }] : []), { pos: TRUTH, color: '#64748b', name: 'wahr', symbol: 'cross' as const }]}
        label="Skizze: AP, zwei Höhenstandlinien, Fix und wahre Position"
      />
    </div>
  )
}
