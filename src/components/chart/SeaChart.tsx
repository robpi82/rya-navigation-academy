import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { Maximize, Minus, Plus } from 'lucide-react'
import { fromMercator, meridionalParts, toMercator } from '@/calculations/chart'
import { degToRad } from '@/calculations/angles'
import { CHART_BOUNDS, LAND, MARKS, TIDAL_DIAMONDS, type ChartMark } from '@/data/chartArea'
import type { LatLon } from '@/types/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ Koordinaten */

/** Kartenkoordinaten (SVG): x = Länge in Minuten, y = −Meridionalteile (Norden oben). */
const toMap = (p: LatLon) => {
  const m = toMercator(p)
  return { x: m.x, y: -m.y }
}
const fromMap = (x: number, y: number): LatLon => fromMercator({ x, y: -y })

export function formatLat(lat: number, decimals = 1): string {
  const a = Math.abs(lat)
  const d = Math.floor(a)
  const m = (a - d) * 60
  return `${d}°${m.toFixed(decimals).replace('.', ',').padStart(decimals ? 3 + decimals : 2, '0')}′${lat >= 0 ? 'N' : 'S'}`
}
export function formatLon(lon: number, decimals = 1): string {
  const a = Math.abs(lon)
  const d = Math.floor(a)
  const m = (a - d) * 60
  return `${String(d).padStart(3, '0')}°${m.toFixed(decimals).replace('.', ',').padStart(decimals ? 3 + decimals : 2, '0')}′${lon >= 0 ? 'E' : 'W'}`
}

/* ------------------------------------------------------------------ Overlays */

export type PointSymbol = 'fix' | 'ep' | 'dr' | 'wp' | 'cross'

export type ChartOverlay =
  | { kind: 'point'; id: string; pos: LatLon; symbol: PointSymbol; label?: string; color?: string }
  | {
      kind: 'line'
      id: string
      from: LatLon
      to: LatLon
      color: string
      chevrons?: 0 | 1 | 2 | 3
      dashed?: boolean
      label?: string
      width?: number
      arrow?: boolean
    }
  | { kind: 'circle'; id: string; center: LatLon; radiusNm: number; color: string }

interface Viewport {
  cx: number
  cy: number
  /** Pixel pro Kartenminute */
  s: number
}

const BOUNDS_MAP = {
  x0: CHART_BOUNDS.west * 60,
  x1: CHART_BOUNDS.east * 60,
  y0: -meridionalParts(CHART_BOUNDS.north),
  y1: -meridionalParts(CHART_BOUNDS.south),
}

const GRID_STEPS = [0.1, 0.2, 0.5, 1, 2, 5, 10, 15, 30] // Bogenminuten

export interface SeaChartProps {
  overlays?: ChartOverlay[]
  onMapClick?: (pos: LatLon) => void
  /** Cursor über der Karte, z. B. 'crosshair' beim Setzen von Punkten */
  cursor?: string
  className?: string
  /** zusätzliche Elemente in der rechten oberen Ecke (HTML) */
  topRight?: ReactNode
  showDiamonds?: boolean
  /** Anfangsausschnitt: Mittelpunkt und halbe Höhe des Ausschnitts in NM (sonst ganzes Revier) */
  focus?: { center: LatLon; halfSpanNm: number }
}

export function SeaChart({ overlays = [], onMapClick, cursor, className, topRight, showDiamonds = true, focus }: SeaChartProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const [size, setSize] = useState({ w: 800, h: 560 })
  const [vp, setVp] = useState<Viewport | null>(null)
  const [hover, setHover] = useState<LatLon | null>(null)
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const gesture = useRef<{ moved: number; pinchDist?: number } | null>(null)

  const fitViewport = useCallback(
    (w: number, h: number): Viewport => {
      const bw = BOUNDS_MAP.x1 - BOUNDS_MAP.x0
      const bh = BOUNDS_MAP.y1 - BOUNDS_MAP.y0
      return { cx: (BOUNDS_MAP.x0 + BOUNDS_MAP.x1) / 2, cy: (BOUNDS_MAP.y0 + BOUNDS_MAP.y1) / 2, s: Math.min(w / bw, h / bh) }
    },
    [],
  )

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => {
      const w = Math.max(200, e.contentRect.width)
      const h = Math.max(200, e.contentRect.height)
      setSize({ w, h })
      setVp((v) => {
        if (v) return v
        if (!focus) return fitViewport(w, h)
        // 1 NM ≈ 1 Meridionalteil-Minute in der Höhe; Maßstab so, dass ±halfSpanNm in die kleinere Seite passt
        const c = toMap(focus.center)
        return { cx: c.x, cy: c.y, s: Math.min(w, h) / (2 * focus.halfSpanNm / Math.cos(degToRad(focus.center.lat))) }
      })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [fitViewport])

  const view = vp ?? fitViewport(size.w, size.h)
  const minS = fitViewport(size.w, size.h).s * 0.6
  const maxS = minS * 25
  const k = 1 / view.s // Kartenminuten pro Pixel
  const vb = { x: view.cx - size.w / 2 / view.s, y: view.cy - size.h / 2 / view.s, w: size.w / view.s, h: size.h / view.s }

  const clientToMap = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return null
    const ctm = svg.getScreenCTM()
    if (!ctm) return null
    const pt = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse())
    return { x: pt.x, y: pt.y }
  }, [])

  const zoomAt = useCallback(
    (factor: number, clientX?: number, clientY?: number) => {
      setVp((prev) => {
        const v = prev ?? fitViewport(size.w, size.h)
        const s = Math.min(maxS, Math.max(minS, v.s * factor))
        if (clientX === undefined || clientY === undefined) return { ...v, s }
        const m = clientToMap(clientX, clientY)
        if (!m) return { ...v, s }
        // Punkt unter dem Cursor bleibt fest
        return { cx: m.x - (m.x - v.cx) * (v.s / s), cy: m.y - (m.y - v.cy) * (v.s / s), s }
      })
    },
    [clientToMap, fitViewport, maxS, minS, size.h, size.w],
  )

  // Mausrad (nicht passiv, damit die Seite nicht scrollt)
  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomAt(e.deltaY < 0 ? 1.2 : 1 / 1.2, e.clientX, e.clientY)
    }
    svg.addEventListener('wheel', onWheel, { passive: false })
    return () => svg.removeEventListener('wheel', onWheel)
  }, [zoomAt])

  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as Element).setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) gesture.current = { moved: 0 }
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      gesture.current = { moved: 99, pinchDist: Math.hypot(a.x - b.x, a.y - b.y) }
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    const m = clientToMap(e.clientX, e.clientY)
    if (m) setHover(fromMap(m.x, m.y))
    const prev = pointers.current.get(e.pointerId)
    if (!prev || !gesture.current) return
    const dx = e.clientX - prev.x
    const dy = e.clientY - prev.y
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 2 && gesture.current.pinchDist) {
      const [a, b] = [...pointers.current.values()]
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      zoomAt(dist / gesture.current.pinchDist, (a.x + b.x) / 2, (a.y + b.y) / 2)
      gesture.current.pinchDist = dist
      return
    }
    gesture.current.moved += Math.abs(dx) + Math.abs(dy)
    if (gesture.current.moved > 4) setVp((v) => (v ? { ...v, cx: v.cx - dx / v.s, cy: v.cy - dy / v.s } : v))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    const g = gesture.current
    pointers.current.delete(e.pointerId)
    if (pointers.current.size === 0) {
      if (g && g.moved <= 4 && onMapClick) {
        const m = clientToMap(e.clientX, e.clientY)
        if (m) onMapClick(fromMap(m.x, m.y))
      }
      gesture.current = null
    }
  }

  /* ---------------- Gitter ---------------- */
  const grid = useMemo(() => {
    const west = vb.x / 60
    const east = (vb.x + vb.w) / 60
    const north = fromMap(0, vb.y).lat
    const south = fromMap(0, vb.y + vb.h).lat
    const spanMin = (east - west) * 60
    const step = GRID_STEPS.find((g) => spanMin / g <= 9) ?? 30
    const lons: number[] = []
    for (let m = Math.ceil((west * 60) / step) * step; m <= east * 60; m += step) lons.push(m / 60)
    const lats: number[] = []
    for (let m = Math.ceil((south * 60) / step) * step; m <= north * 60; m += step) lats.push(m / 60)
    // feine Teilung für den Breitenmaßstab
    const fine = step >= 5 ? 1 : step >= 1 ? 0.5 : 0.1
    const ticks: number[] = []
    for (let m = Math.ceil((south * 60) / fine) * fine; m <= north * 60; m += fine) ticks.push(m / 60)
    return { lons, lats, step, fine, ticks, midLat: (north + south) / 2 }
  }, [vb.x, vb.y, vb.w, vb.h])

  const decimals = grid.step < 1 ? 1 : 0
  const scaleNm = [0.2, 0.5, 1, 2, 5, 10].find((n) => (n * view.s) / Math.cos(degToRad(grid.midLat)) >= 70) ?? 10
  const scalePx = (scaleNm * view.s) / Math.cos(degToRad(grid.midLat))

  return (
    <div ref={wrapRef} className={cn('relative h-[62vh] min-h-[380px] w-full overflow-hidden rounded-xl border select-none', className)}>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 block h-full w-full touch-none"
        style={{ cursor: cursor ?? 'grab', background: 'var(--chart-water)' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}
        role="application"
        aria-label="Interaktive Übungsseekarte"
      >
        {/* Land */}
        {LAND.map((l) => (
          <path
            key={l.name}
            d={'M' + l.outline.map(([lon, lat]) => { const p = toMap({ lat, lon }); return `${p.x},${p.y}` }).join('L') + 'Z'}
            fill="var(--chart-land)"
            stroke="var(--chart-coast)"
            strokeWidth={1.2}
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {/* 5-m-Linie um Grauer Stein (Gefahrenbereich) */}
        <circle cx={toMap(MARKS.find((m) => m.id === 'dg-stein')!.pos).x} cy={toMap(MARKS.find((m) => m.id === 'dg-stein')!.pos).y} r={0.9} fill="none" stroke="var(--chart-coast)" strokeDasharray="4 3" strokeWidth={1} vectorEffect="non-scaling-stroke" />

        {/* Gitter */}
        <g stroke="var(--chart-gridline)" strokeWidth={1} vectorEffect="non-scaling-stroke">
          {grid.lons.map((lon) => (
            <line key={`lo${lon}`} x1={lon * 60} x2={lon * 60} y1={vb.y} y2={vb.y + vb.h} vectorEffect="non-scaling-stroke" />
          ))}
          {grid.lats.map((lat) => (
            <line key={`la${lat}`} y1={toMap({ lat, lon: 0 }).y} y2={toMap({ lat, lon: 0 }).y} x1={vb.x} x2={vb.x + vb.w} vectorEffect="non-scaling-stroke" />
          ))}
        </g>

        {/* Kompassrose (rechtweisend) */}
        <CompassRose center={toMap({ lat: 50.605, lon: -1.04 })} r={3.2} k={k} />

        {/* Seezeichen & Landmarken */}
        {MARKS.map((m) => (
          <MarkSymbol key={m.id} mark={m} k={k} />
        ))}

        {/* Tidal Diamonds */}
        {showDiamonds &&
          TIDAL_DIAMONDS.map((d) => {
            const p = toMap(d.pos)
            const r = 9 * k
            return (
              <g key={d.id}>
                <path d={`M${p.x},${p.y - r} L${p.x + r * 0.8},${p.y} L${p.x},${p.y + r} L${p.x - r * 0.8},${p.y} Z`} fill="var(--chart-diamond)" stroke="white" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                <text x={p.x} y={p.y + 3.5 * k} fontSize={10 * k} fontWeight={700} textAnchor="middle" fill="white">
                  {d.id}
                </text>
              </g>
            )
          })}

        {/* Overlays */}
        {overlays.map((o) => (
          <OverlayItem key={o.id} o={o} k={k} />
        ))}
      </svg>

      {/* Randbeschriftung (HTML, damit sie beim Zoomen lesbar bleibt) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-5 bg-card/85 text-[10px] font-medium text-muted-foreground">
        {grid.lons.map((lon) => (
          <span key={lon} className="absolute top-0.5 -translate-x-1/2 whitespace-nowrap" style={{ left: (lon * 60 - vb.x) * view.s }}>
            {formatLon(lon, decimals)}
          </span>
        ))}
      </div>
      {/* Breitenmaßstab links: 1′ Breite = 1 NM */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[62px] bg-card/85 text-[10px] font-medium text-muted-foreground">
        <svg className="absolute inset-y-0 right-0 h-full w-3" aria-hidden>
          {grid.ticks.map((lat, i) => {
            const y = (toMap({ lat, lon: 0 }).y - vb.y) * view.s
            const next = grid.ticks[i + 1]
            const y2 = next !== undefined ? (toMap({ lat: next, lon: 0 }).y - vb.y) * view.s : y
            return <rect key={lat} x={4} y={Math.min(y, y2)} width={6} height={Math.abs(y - y2)} fill={i % 2 ? 'var(--foreground)' : 'transparent'} stroke="var(--foreground)" strokeWidth={0.5} />
          })}
        </svg>
        {grid.lats.map((lat) => (
          <span key={lat} className="absolute left-1 -translate-y-1/2 whitespace-nowrap" style={{ top: (toMap({ lat, lon: 0 }).y - vb.y) * view.s }}>
            {formatLat(lat, decimals).replace(/(\d+°)/, '$1​')}
          </span>
        ))}
      </div>

      {/* Maßstab & Position */}
      <div className="pointer-events-none absolute bottom-2 left-[72px] rounded-md bg-card/90 px-2 py-1 text-[11px] shadow-sm">
        <div className="mb-0.5 h-1.5 border-x-2 border-b-2 border-foreground" style={{ width: scalePx }} />
        {String(scaleNm).replace('.', ',')} NM<span className="hidden sm:inline"> · Breitenmaßstab links: 1′ = 1 NM</span>
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 hidden rounded-md bg-card/90 px-2 py-1 font-mono text-[11px] tabular-nums shadow-sm sm:block">
        {hover ? `${formatLat(hover.lat, 2)} ${formatLon(hover.lon, 2)}` : 'Position: Maus über Karte'}
      </div>
      <div className="absolute top-7 right-2 flex flex-col gap-1">
        {topRight}
        <Button size="icon" variant="outline" className="size-8" onClick={() => zoomAt(1.4)} aria-label="Hineinzoomen">
          <Plus />
        </Button>
        <Button size="icon" variant="outline" className="size-8" onClick={() => zoomAt(1 / 1.4)} aria-label="Herauszoomen">
          <Minus />
        </Button>
        <Button size="icon" variant="outline" className="size-8" onClick={() => setVp(fitViewport(size.w, size.h))} aria-label="Ganze Karte anzeigen">
          <Maximize />
        </Button>
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 text-[9px] font-semibold tracking-wide text-muted-foreground/80 uppercase sm:right-12 sm:bottom-9 sm:text-[10px]">
        Fiktives Übungsrevier – nicht zur Navigation
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Bausteine */

function CompassRose({ center, r, k }: { center: { x: number; y: number }; r: number; k: number }) {
  const ticks = []
  for (let d = 0; d < 360; d += 10) {
    const a = degToRad(d)
    const len = d % 30 === 0 ? 0.35 : 0.18
    ticks.push(
      <line key={d} x1={center.x + Math.sin(a) * r} y1={center.y - Math.cos(a) * r} x2={center.x + Math.sin(a) * (r - len)} y2={center.y - Math.cos(a) * (r - len)} stroke="var(--chart-diamond)" strokeWidth={1} vectorEffect="non-scaling-stroke" />,
    )
    if (d % 90 === 0)
      ticks.push(
        <text key={`t${d}`} x={center.x + Math.sin(a) * (r + 14 * k)} y={center.y - Math.cos(a) * (r + 14 * k) + 4 * k} fontSize={10 * k} textAnchor="middle" fill="var(--chart-diamond)" fontWeight={700}>
          {d === 0 ? 'N' : String(d).padStart(3, '0')}
        </text>,
      )
  }
  return (
    <g opacity={0.85}>
      <circle cx={center.x} cy={center.y} r={r} fill="none" stroke="var(--chart-diamond)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <circle cx={center.x} cy={center.y} r={r * 0.6} fill="none" stroke="var(--chart-diamond)" strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
      {ticks}
      <path d={`M${center.x},${center.y - r * 0.95} L${center.x + r * 0.08},${center.y} L${center.x - r * 0.08},${center.y} Z`} fill="var(--chart-diamond)" />
    </g>
  )
}

function MarkSymbol({ mark, k }: { mark: ChartMark; k: number }) {
  const p = toMap(mark.pos)
  const s = 7 * k
  let sym: ReactNode
  switch (mark.kind) {
    case 'lighthouse':
      sym = (
        <>
          <path d={`M${p.x - s * 0.5},${p.y} L${p.x},${p.y - s * 1.6} L${p.x + s * 0.5},${p.y} Z`} fill="var(--chart-diamond)" />
          <circle cx={p.x} cy={p.y} r={s * 0.35} fill="var(--foreground)" />
        </>
      )
      break
    case 'church':
      sym = (
        <>
          <circle cx={p.x} cy={p.y} r={s * 0.55} fill="none" stroke="var(--foreground)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          <line x1={p.x} y1={p.y - s * 1.4} x2={p.x} y2={p.y - s * 0.55} stroke="var(--foreground)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
          <line x1={p.x - s * 0.4} y1={p.y - s} x2={p.x + s * 0.4} y2={p.y - s} stroke="var(--foreground)" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
        </>
      )
      break
    case 'mast':
      sym = <path d={`M${p.x - s * 0.5},${p.y} L${p.x},${p.y - s * 1.8} L${p.x + s * 0.5},${p.y}`} fill="none" stroke="var(--foreground)" strokeWidth={1.3} vectorEffect="non-scaling-stroke" />
      break
    case 'daymark':
      sym = <rect x={p.x - s * 0.4} y={p.y - s * 1.2} width={s * 0.8} height={s * 1.2} fill="var(--foreground)" />
      break
    case 'harbour':
      sym = (
        <g stroke="var(--foreground)" strokeWidth={1.3} fill="none" vectorEffect="non-scaling-stroke">
          <circle cx={p.x} cy={p.y - s * 0.7} r={s * 0.25} vectorEffect="non-scaling-stroke" />
          <line x1={p.x} y1={p.y - s * 0.45} x2={p.x} y2={p.y + s * 0.6} vectorEffect="non-scaling-stroke" />
          <path d={`M${p.x - s * 0.6},${p.y + s * 0.1} Q${p.x},${p.y + s * 0.9} ${p.x + s * 0.6},${p.y + s * 0.1}`} vectorEffect="non-scaling-stroke" />
        </g>
      )
      break
    case 'buoy-north':
    case 'buoy-south':
      sym = (
        <>
          <rect x={p.x - s * 0.35} y={p.y - s * 0.6} width={s * 0.7} height={s * 1.0} fill="#facc15" stroke="#111" strokeWidth={0.8} vectorEffect="non-scaling-stroke" />
          {mark.kind === 'buoy-north' ? (
            <>
              <path d={`M${p.x - s * 0.4},${p.y - s * 0.9} L${p.x},${p.y - s * 1.5} L${p.x + s * 0.4},${p.y - s * 0.9} Z`} fill="#111" />
              <path d={`M${p.x - s * 0.4},${p.y - s * 1.4} L${p.x},${p.y - s * 2.0} L${p.x + s * 0.4},${p.y - s * 1.4} Z`} fill="#111" />
            </>
          ) : (
            <>
              <path d={`M${p.x - s * 0.4},${p.y - s * 1.5} L${p.x},${p.y - s * 0.9} L${p.x + s * 0.4},${p.y - s * 1.5} Z`} fill="#111" />
              <path d={`M${p.x - s * 0.4},${p.y - s * 2.0} L${p.x},${p.y - s * 1.4} L${p.x + s * 0.4},${p.y - s * 2.0} Z`} fill="#111" />
            </>
          )}
        </>
      )
      break
    case 'buoy-safe':
      sym = (
        <>
          <circle cx={p.x} cy={p.y - s * 0.3} r={s * 0.55} fill="#ef4444" stroke="white" strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <circle cx={p.x} cy={p.y - s * 1.2} r={s * 0.28} fill="#ef4444" />
        </>
      )
      break
    case 'danger':
      sym = (
        <text x={p.x} y={p.y + s * 0.4} fontSize={s * 1.6} textAnchor="middle" fill="var(--foreground)">
          ✱
        </text>
      )
      break
  }
  return (
    <g>
      {sym}
      <text x={p.x + s * 0.9} y={p.y + s * 0.2} fontSize={10 * k} fill="var(--foreground)" fontStyle={mark.kind.startsWith('buoy') || mark.kind === 'danger' ? 'italic' : undefined} style={{ paintOrder: 'stroke', stroke: 'var(--chart-water)', strokeWidth: 3 * k }}>
        {mark.name}
      </text>
      {mark.note && (
        <text x={p.x + s * 0.9} y={p.y + s * 0.2 + 11 * k} fontSize={8.5 * k} fill="var(--chart-diamond)" style={{ paintOrder: 'stroke', stroke: 'var(--chart-water)', strokeWidth: 3 * k }}>
          {mark.note}
        </text>
      )}
    </g>
  )
}

function OverlayItem({ o, k }: { o: ChartOverlay; k: number }) {
  if (o.kind === 'circle') {
    const c = toMap(o.center)
    const r = o.radiusNm / Math.cos(degToRad(o.center.lat)) // 1 NM = 1′ Breite → in Mercator-Einheiten skaliert
    return <circle cx={c.x} cy={c.y} r={r} fill={o.color} fillOpacity={0.12} stroke={o.color} strokeDasharray="4 3" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
  }
  if (o.kind === 'point') {
    const p = toMap(o.pos)
    const s = 8 * k
    const color = o.color ?? 'var(--foreground)'
    let sym: ReactNode
    switch (o.symbol) {
      case 'fix':
        sym = (
          <>
            <circle cx={p.x} cy={p.y} r={s} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <circle cx={p.x} cy={p.y} r={s * 0.22} fill={color} />
          </>
        )
        break
      case 'ep':
        sym = (
          <>
            <path d={`M${p.x},${p.y - s * 1.1} L${p.x + s},${p.y + s * 0.7} L${p.x - s},${p.y + s * 0.7} Z`} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <circle cx={p.x} cy={p.y + s * 0.1} r={s * 0.22} fill={color} />
          </>
        )
        break
      case 'dr':
        sym = <line x1={p.x - s} y1={p.y + s} x2={p.x + s} y2={p.y - s} stroke={color} strokeWidth={2.5} vectorEffect="non-scaling-stroke" />
        break
      case 'wp':
        sym = (
          <>
            <rect x={p.x - s * 0.8} y={p.y - s * 0.8} width={s * 1.6} height={s * 1.6} fill="none" stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke" />
            <circle cx={p.x} cy={p.y} r={s * 0.22} fill={color} />
          </>
        )
        break
      case 'cross':
        sym = (
          <g stroke={color} strokeWidth={2} vectorEffect="non-scaling-stroke">
            <line x1={p.x - s} y1={p.y} x2={p.x + s} y2={p.y} vectorEffect="non-scaling-stroke" />
            <line x1={p.x} y1={p.y - s} x2={p.x} y2={p.y + s} vectorEffect="non-scaling-stroke" />
          </g>
        )
        break
    }
    return (
      <g>
        {sym}
        {o.label && (
          <text x={p.x + s * 1.3} y={p.y - s * 0.9} fontSize={11 * k} fontWeight={700} fill={color} style={{ paintOrder: 'stroke', stroke: 'var(--chart-water)', strokeWidth: 3.5 * k }}>
            {o.label}
          </text>
        )}
      </g>
    )
  }
  // Linie mit optionaler Pfeilspitze und RYA-Markierungspfeilen
  const a = toMap(o.from)
  const b = toMap(o.to)
  const dx = b.x - a.x
  const dy = b.y - a.y
  const len = Math.hypot(dx, dy)
  if (len < 1e-9) return null
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const c = 6 * k
  const chev = []
  for (let i = 0; i < (o.chevrons ?? 0); i++) {
    const t = 0.5 + (i - ((o.chevrons ?? 1) - 1) / 2) * ((10 * k) / len)
    const cx = a.x + dx * t
    const cy = a.y + dy * t
    chev.push(<polyline key={i} points={`${cx - ux * c + nx * c * 0.7},${cy - uy * c + ny * c * 0.7} ${cx},${cy} ${cx - ux * c - nx * c * 0.7},${cy - uy * c - ny * c * 0.7}`} fill="none" stroke={o.color} strokeWidth={2} vectorEffect="non-scaling-stroke" />)
  }
  const h = 11 * k
  const mid = { x: a.x + dx * 0.5 + nx * 12 * k, y: a.y + dy * 0.5 + ny * 12 * k }
  return (
    <g>
      <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={o.color} strokeWidth={o.width ?? 2.5} strokeDasharray={o.dashed ? '7 5' : undefined} vectorEffect="non-scaling-stroke" strokeLinecap="round" />
      {o.arrow && <polygon points={`${b.x},${b.y} ${b.x - ux * h + nx * h * 0.45},${b.y - uy * h + ny * h * 0.45} ${b.x - ux * h - nx * h * 0.45},${b.y - uy * h - ny * h * 0.45}`} fill={o.color} />}
      {chev}
      {o.label && (
        <text x={mid.x} y={mid.y} fontSize={11 * k} fontWeight={700} fill={o.color} textAnchor="middle" style={{ paintOrder: 'stroke', stroke: 'var(--chart-water)', strokeWidth: 3.5 * k }}>
          {o.label}
        </text>
      )}
    </g>
  )
}
