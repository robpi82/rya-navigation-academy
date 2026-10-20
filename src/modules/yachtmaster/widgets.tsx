import { useState } from 'react'
import { compareRoutes, formatBearing, formatLatLon, formatNumber, geographicRange, greatCircleLegs, greatCirclePoints, meridionalParts } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'

const f1 = (n: number) => formatNumber(n, 1)

/* ------------------------------------------------------------------ Großkreis auf der Mercatorkarte */

const ROUTES = [
  { id: 'ny', label: 'Kanal → New York', from: { lat: 50.7, lon: -1.3 }, to: { lat: 40.7, lon: -74 } },
  { id: 'hx', label: 'Biskaya → Halifax', from: { lat: 47.5, lon: -4.5 }, to: { lat: 44.6, lon: -63.5 } },
  { id: 'az', label: 'Azoren → Bermuda', from: { lat: 38.7, lon: -27.2 }, to: { lat: 32.3, lon: -64.8 } },
]

const LON0 = -80
const LON1 = 5
const LAT0 = 28
const LAT1 = 62
const mp0 = meridionalParts(LAT0)
const mp1 = meridionalParts(LAT1)
const px = (lon: number) => (lon - LON0) * 60
const py = (lat: number) => mp1 - meridionalParts(lat)
const W = (LON1 - LON0) * 60
const H = mp1 - mp0

export function GreatCircleMapWidget() {
  const [routeId, setRouteId] = useState('ny')
  const [segments, setSegments] = useState(3)
  const route = ROUTES.find((r) => r.id === routeId)!
  const cmp = compareRoutes(route.from, route.to)!
  const curve = greatCirclePoints(route.from, route.to, 48)
  const { legs, total } = greatCircleLegs(route.from, route.to, segments)
  const wps = [route.from, ...legs.map((l) => l.to)]
  const pt = (p: { lat: number; lon: number }) => `${px(p.lon)},${py(p.lat)}`

  return (
    <div className="space-y-4">
      <Toggle value={routeId} onChange={setRouteId} label="Strecke" options={ROUTES.map((r) => ({ value: r.id, label: r.label }))} />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Mercatorkarte des Nordatlantiks mit Loxodrome als Gerade und Großkreis als Kurve">
        {Array.from({ length: 9 }, (_, i) => LON0 + i * 10).map((lon) => (
          <g key={lon}>
            <line x1={px(lon)} y1={0} x2={px(lon)} y2={H} stroke="currentColor" strokeOpacity={0.15} vectorEffect="non-scaling-stroke" />
            <text x={px(lon) + 20} y={H - 25} fontSize={90} fill="currentColor" fillOpacity={0.6}>{Math.abs(lon)}°{lon < 0 ? 'W' : lon > 0 ? 'E' : ''}</text>
          </g>
        ))}
        {[30, 40, 50, 60].map((lat) => (
          <g key={lat}>
            <line x1={0} y1={py(lat)} x2={W} y2={py(lat)} stroke="currentColor" strokeOpacity={0.15} vectorEffect="non-scaling-stroke" />
            <text x={20} y={py(lat) - 20} fontSize={90} fill="currentColor" fillOpacity={0.6}>{lat}°N</text>
          </g>
        ))}
        <line x1={px(route.from.lon)} y1={py(route.from.lat)} x2={px(route.to.lon)} y2={py(route.to.lat)} stroke="#f97316" strokeWidth={2.5} strokeDasharray="8 5" vectorEffect="non-scaling-stroke" />
        <polyline points={curve.map(pt).join(' ')} fill="none" stroke="#2dd4bf" strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        <polyline points={wps.map(pt).join(' ')} fill="none" stroke="#e11d48" strokeWidth={2} vectorEffect="non-scaling-stroke" />
        {wps.map((p, i) => (
          <circle key={i} cx={px(p.lon)} cy={py(p.lat)} r={i === 0 || i === wps.length - 1 ? 38 : 28} fill="#e11d48" stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
        ))}
      </svg>
      <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span><span className="mr-1 inline-block h-0.5 w-5 bg-[#f97316] align-middle" /> Loxodrome (gerade Linie, konstanter Kurs)</span>
        <span><span className="mr-1 inline-block h-0.5 w-5 bg-[#2dd4bf] align-middle" /> Großkreis (kürzester Weg)</span>
        <span><span className="mr-1 inline-block h-0.5 w-5 bg-[#e11d48] align-middle" /> Teilstücke mit je einem Kurs</span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-sm">
          <span className="font-medium">Anzahl Teilstücke</span>
          <span className="font-mono">{segments}</span>
        </div>
        <Slider value={[segments]} min={1} max={8} step={1} onValueChange={([v]) => setSegments(v)} aria-label="Anzahl der Teilstücke" />
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Cell label="Loxodrome" value={`${f1(cmp.rhumbDistance)} NM`} />
        <Cell label="Großkreis" value={`${f1(cmp.greatCircle.distance)} NM`} highlight />
        <Cell label={`${segments} Teilstücke`} value={`${f1(total)} NM`} />
        <Cell label="Mehrweg gegenüber Großkreis" value={`${formatNumber(total - cmp.greatCircle.distance, 1)} NM`} />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-80 text-sm">
          <thead className="text-left text-xs text-muted-foreground">
            <tr><th className="pb-1 font-medium">Teilstück</th><th className="font-medium">Zielpunkt</th><th className="font-medium">Kurs</th><th className="text-right font-medium">Distanz</th></tr>
          </thead>
          <tbody className="font-mono tabular-nums">
            {legs.map((l, i) => (
              <tr key={i} className="border-t">
                <td className="py-1">{i + 1}</td>
                <td>{formatLatLon(l.to)}</td>
                <td>{l.bearing === null ? '–' : formatBearing(l.bearing, 0)}</td>
                <td className="text-right">{f1(l.distance)} NM</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Feuer am Horizont */

export function LightHorizonWidget() {
  const [lightH, setLightH] = useState(30)
  const [eyeH, setEyeH] = useState(3)
  const [nominal, setNominal] = useState(15)
  const [dist, setDist] = useState(12)
  const geo = geographicRange(lightH, eyeH)
  const horizon = geographicRange(0, eyeH)
  const limit = Math.min(geo, nominal)
  const visible = dist <= limit
  const limited = geo < nominal ? 'Erdkrümmung (geografische Sichtweite)' : 'Lichtstärke und Sicht (Nenntragweite)'
  const max = 30
  const x = (nm: number) => `${(nm / max) * 100}%`

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Slide label="Feuerhöhe" value={`${lightH} m`} min={5} max={100} step={1} v={lightH} on={setLightH} />
        <Slide label="Augenhöhe" value={`${f1(eyeH)} m`} min={0.5} max={10} step={0.5} v={eyeH} on={setEyeH} />
        <Slide label="Nenntragweite laut Karte" value={`${nominal} NM`} min={5} max={25} step={1} v={nominal} on={setNominal} />
        <Slide label="Abstand zum Feuer" value={`${dist} NM`} min={1} max={max} step={1} v={dist} on={setDist} />
      </div>
      <div className="space-y-2" role="img" aria-label={`Balkendiagramm: Nenntragweite ${nominal} NM, geografische Sichtweite ${f1(geo)} NM, Abstand ${dist} NM`}>
        <Bar label="Nenntragweite" nm={nominal} max={max} color="bg-sky-500" />
        <Bar label="Geografische Sichtweite" nm={geo} max={max} color="bg-teal-500" />
        <div className="relative h-6">
          <div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: x(dist) }} />
          <div className="absolute top-0 -translate-x-1/2 rounded bg-foreground px-1.5 text-xs text-background" style={{ left: x(dist) }}>Boot</div>
        </div>
      </div>
      <div className={cn('rounded-lg border p-3 text-sm', visible ? 'border-success/50 bg-success/5' : 'border-destructive/40 bg-destructive/5')} aria-live="polite">
        <p className="font-semibold">{visible ? 'Das Feuer ist sichtbar.' : 'Das Feuer ist noch nicht zu sehen.'}</p>
        <p className="text-muted-foreground">
          Erste Sicht ab {f1(limit)} NM – begrenzt durch {limited}. Geografische Sichtweite = 2,08 · (√{lightH} + √{formatNumber(eyeH, 1)}) = {f1(geo)} NM; dein eigener Horizont liegt bei {f1(horizon)} NM.
          {!visible && dist <= nominal && ' Tipp: Eine höhere Augenhöhe (Salingsposition) bringt das Feuer früher in Sicht.'}
        </p>
      </div>
    </div>
  )
}

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

function Bar({ label, nm, max, color }: { label: string; nm: number; max: number; color: string }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-40 shrink-0 text-muted-foreground">{label}</span>
      <div className="h-3 flex-1 overflow-hidden rounded bg-muted">
        <div className={cn('h-full rounded', color)} style={{ width: `${Math.min(100, (nm / max) * 100)}%` }} />
      </div>
      <span className="w-16 text-right font-mono tabular-nums">{f1(nm)} NM</span>
    </div>
  )
}

function Cell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('rounded-lg border px-3 py-2', highlight ? 'border-primary bg-primary/10' : 'bg-muted/50')}>
      <div className="text-[11px] text-muted-foreground">{label}</div>
      <div className="font-mono text-sm font-semibold tabular-nums">{value}</div>
    </div>
  )
}
