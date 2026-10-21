import { memo, useCallback, useEffect, useId, useMemo, useRef, useState, type ReactNode } from 'react'
import { Layers, Maximize, Minus, Plus } from 'lucide-react'
import { fromMercator, meridionalParts, toMercator } from '@/calculations/chart'
import { degToRad } from '@/calculations/angles'
import { CHART_BOUNDS, LAND, MARKS, TIDAL_DIAMONDS } from '@/data/chartArea'
import { BUILT_UP, FEATURES, MOLES, PLACE_NAMES, RESTRICTED_AREAS, type PlaceStyle } from '@/data/chartFeatures'
import { depthModel, formatSounding, peekDepthModel, type DepthModel } from '@/lib/bathymetry'
import { CHART_COLORS, FeatureGlyph, MarkGlyph } from './chartSymbols'
import type { LatLon } from '@/types/navigation'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { formatLat, formatLon } from '@/lib/coords'

/* ------------------------------------------------------------------ Koordinaten */

/** Kartenkoordinaten (SVG): x = Länge in Minuten, y = −Meridionalteile (Norden oben). */
const toMap = (p: LatLon) => {
  const m = toMercator(p)
  return { x: m.x, y: -m.y }
}
const fromMap = (x: number, y: number): LatLon => fromMercator({ x, y: -y })

export { formatLat, formatLon }

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
  const menuId = useId()

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
    const step = GRID_STEPS.find((g) => spanMin / g <= 9 && (g * size.w) / spanMin >= 64) ?? 30
    const lons: number[] = []
    for (let m = Math.ceil((west * 60) / step) * step; m <= east * 60; m += step) lons.push(m / 60)
    const lats: number[] = []
    for (let m = Math.ceil((south * 60) / step) * step; m <= north * 60; m += step) lats.push(m / 60)
    // feine Teilung für den Breitenmaßstab
    const fine = step >= 5 ? 1 : step >= 1 ? 0.5 : 0.1
    const ticks: number[] = []
    for (let m = Math.ceil((south * 60) / fine) * fine; m <= north * 60; m += fine) ticks.push(m / 60)
    return { lons, lats, step, fine, ticks, midLat: (north + south) / 2 }
  }, [vb.x, vb.y, vb.w, vb.h, size.w])

  const decimals = grid.step < 1 ? 1 : 0
  const scaleNm = [0.2, 0.5, 1, 2, 5, 10].find((n) => (n * view.s) / Math.cos(degToRad(grid.midLat)) >= 70) ?? 10
  const scalePx = (scaleNm * view.s) / Math.cos(degToRad(grid.midLat))

  /* ---------------- Tiefenmodell (einmalig, nach dem ersten Zeichnen) ---------------- */
  const [model, setModel] = useState<DepthModel | null>(peekDepthModel)
  useEffect(() => {
    if (model) return
    const id = window.setTimeout(() => setModel(depthModel()), 0)
    return () => window.clearTimeout(id)
  }, [model])

  const [layers, setLayers] = useState<Record<LayerKey, boolean>>(loadLayers)
  const [layerMenu, setLayerMenu] = useState(false)
  const toggleLayer = (key: LayerKey) =>
    setLayers((l) => {
      const next = { ...l, [key]: !l[key] }
      try {
        localStorage.setItem(LAYER_STORAGE, JSON.stringify(next))
      } catch {
        /* Speicher nicht verfügbar – Einstellung gilt nur für diese Sitzung */
      }
      return next
    })

  /** Detailstufe: 1 ≈ ganze Karte auf einem Desktop-Bildschirm */
  const detail = view.s / REF_SCALE
  const u = 7 * k // Symbolgröße
  const scene = useMemo(
    () => buildScene({ vb, s: view.s, k, detail, layers, model }),
    // vb ist pro Render neu, daher die Einzelwerte
    [vb.x, vb.y, vb.w, vb.h, view.s, layers, model],
  )

  return (
    <div ref={wrapRef} className={cn('chart-paper relative h-[62vh] min-h-[380px] w-full overflow-hidden rounded-xl border select-none', className)}>
      <svg
        ref={svgRef}
        viewBox={`${vb.x} ${vb.y} ${vb.w} ${vb.h}`}
        preserveAspectRatio="xMidYMid meet"
        className="absolute inset-0 block h-full w-full touch-none"
        style={{ cursor: cursor ?? 'grab', background: CHART_COLORS.deep, fontFamily: CHART_FONT }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onPointerLeave={() => setHover(null)}
        role="application"
        aria-label="Interaktive Übungsseekarte"
      >
        <ChartBase model={model} areas={layers.depthAreas} contours={layers.contours} />

        {/* Gitter */}
        {layers.grid && (
          <g stroke={CHART_COLORS.grid} strokeOpacity={0.45} strokeWidth={0.7} vectorEffect="non-scaling-stroke">
            {grid.lons.map((lon) => (
              <line key={`lo${lon}`} x1={lon * 60} x2={lon * 60} y1={vb.y} y2={vb.y + vb.h} vectorEffect="non-scaling-stroke" />
            ))}
            {grid.lats.map((lat) => (
              <line key={`la${lat}`} y1={toMap({ lat, lon: 0 }).y} y2={toMap({ lat, lon: 0 }).y} x1={vb.x} x2={vb.x + vb.w} vectorEffect="non-scaling-stroke" />
            ))}
          </g>
        )}

        {/* Kartenrand: außerhalb des Reviers keine Karteninhalte */}
        <path
          d={`M${vb.x - 1},${vb.y - 1}h${vb.w + 2}v${vb.h + 2}h${-vb.w - 2}Z M${BOUNDS_MAP.x0},${BOUNDS_MAP.y0}V${BOUNDS_MAP.y1}H${BOUNDS_MAP.x1}V${BOUNDS_MAP.y0}Z`}
          fill="#E7EBE9"
          fillRule="evenodd"
        />
        <rect x={BOUNDS_MAP.x0} y={BOUNDS_MAP.y0} width={BOUNDS_MAP.x1 - BOUNDS_MAP.x0} height={BOUNDS_MAP.y1 - BOUNDS_MAP.y0} fill="none" stroke={CHART_COLORS.label} strokeWidth={1.2} vectorEffect="non-scaling-stroke" />

        {layers.navInfo && (
          <>
            {/* Kompassrose (rechtweisend), magenta */}
            <CompassRose center={toMap(ROSE_CENTER)} r={ROSE_RADIUS} k={k} />
            {/* Sperrgebiet: T-Linie (INT 1 N 2.1) */}
            {RESTRICTED_AREAS.map((a) => (
              <RestrictedArea key={a.name} outline={a.outline} k={k} />
            ))}
          </>
        )}

        {/* Tiefenzahlen */}
        {scene.soundings.map((sd) => (
          <SoundingText key={sd.key} x={sd.x} y={sd.y} depth={sd.depth} k={k} />
        ))}
        {/* Beschriftung der Tiefenlinien */}
        {scene.contourLabels.map((c) => (
          <text key={c.key} x={c.x} y={c.y} transform={`rotate(${c.angle} ${c.x} ${c.y})`} fontSize={8 * k} textAnchor="middle" dominantBaseline="central" fill={CHART_COLORS.contour} fontStyle="italic" style={{ paintOrder: 'stroke', stroke: CHART_COLORS.deep, strokeWidth: 2.5 * k }}>
            {c.text}
          </text>
        ))}

        {/* zusätzliche Seezeichen, Feuer, Wracks, Ankerplätze */}
        {scene.features.map((f) => (
          <FeatureGlyph key={f.id} kind={f.kind} x={toMap(f.pos).x} y={toMap(f.pos).y} u={u * (f.kind === 'anchorage' ? 1 : 0.9)} />
        ))}

        {/* Aufgabenobjekte – immer sichtbar */}
        {MARKS.map((m) => (
          <MarkGlyph key={m.id} kind={m.kind} x={toMap(m.pos).x} y={toMap(m.pos).y} u={u} />
        ))}

        {/* Tidal Diamonds (INT 1 H 46) */}
        {showDiamonds && layers.navInfo &&
          TIDAL_DIAMONDS.map((d) => {
            const p = toMap(d.pos)
            const r = 9 * k
            return (
              <g key={d.id}>
                <path d={`M${p.x},${p.y - r} L${p.x + r * 0.8},${p.y} L${p.x},${p.y + r} L${p.x - r * 0.8},${p.y} Z`} fill={CHART_COLORS.deep} stroke={CHART_COLORS.magenta} strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
                <text x={p.x} y={p.y + 3.5 * k} fontSize={10 * k} fontWeight={700} textAnchor="middle" fill={CHART_COLORS.magenta}>
                  {d.id}
                </text>
              </g>
            )
          })}

        {/* Beschriftungen (kollisionsfrei platziert) */}
        {scene.labels.map((l) => (
          <text
            key={l.key}
            x={l.x}
            y={l.y}
            fontSize={l.size * k}
            textAnchor={l.anchor}
            fill={l.color}
            fontStyle={l.italic ? 'italic' : undefined}
            fontWeight={l.bold ? 600 : undefined}
            letterSpacing={l.spacing ? l.spacing * k : undefined}
            style={{ paintOrder: 'stroke', stroke: l.halo, strokeWidth: 3 * k, strokeLinejoin: 'round' }}
          >
            {l.lines.map((t, i) => (
              <tspan key={i} x={l.x} dy={i === 0 ? 0 : l.size * 1.15 * k} fontSize={i === 0 ? undefined : l.size * 0.88 * k} fontStyle={i === 0 ? undefined : 'normal'}>
                {t}
              </tspan>
            ))}
          </text>
        ))}

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
      <div className="absolute top-7 right-2 flex flex-col items-end gap-1">
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
        <Button size="icon" variant={layerMenu ? 'secondary' : 'outline'} className="size-8" onClick={() => setLayerMenu((v) => !v)} aria-label="Kartenebenen" aria-expanded={layerMenu} aria-controls={menuId}>
          <Layers />
        </Button>
        {layerMenu && (
          <fieldset id={menuId} className="mt-1 w-48 rounded-lg border bg-card p-2 text-xs shadow-md">
            <legend className="sr-only">Kartenebenen</legend>
            <p className="mb-1 font-semibold">Kartenebenen</p>
            {LAYERS.map((l) => (
              <label key={l.key} className="flex cursor-pointer items-center gap-2 rounded px-1 py-1 hover:bg-muted">
                <input type="checkbox" className="size-3.5 accent-[#303D47]" checked={layers[l.key]} onChange={() => toggleLayer(l.key)} />
                {l.label}
              </label>
            ))}
            <p className="mt-1 px-1 text-[10px] leading-snug text-muted-foreground">Aufgabenobjekte bleiben immer sichtbar. Tiefen in Metern unter Kartennull.</p>
          </fieldset>
        )}
      </div>
      <div className="pointer-events-none absolute right-2 bottom-2 text-[9px] font-semibold tracking-wide text-muted-foreground uppercase sm:right-12 sm:bottom-9 sm:text-[10px]">
        Fiktives Übungsrevier – nicht zur Navigation
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Ebenen */

type LayerKey = 'depthAreas' | 'contours' | 'soundings' | 'aids' | 'labels' | 'grid' | 'navInfo'

const LAYERS: { key: LayerKey; label: string }[] = [
  { key: 'depthAreas', label: 'Tiefenflächen' },
  { key: 'contours', label: 'Tiefenlinien' },
  { key: 'soundings', label: 'Tiefenzahlen' },
  { key: 'aids', label: 'Weitere Seezeichen & Gefahren' },
  { key: 'labels', label: 'Beschriftungen' },
  { key: 'navInfo', label: 'Kompassrose, Strom, Sperrgebiet' },
  { key: 'grid', label: 'Gradnetz' },
]

const LAYER_STORAGE = 'seachart-layers'
const DEFAULT_LAYERS: Record<LayerKey, boolean> = { depthAreas: true, contours: true, soundings: true, aids: true, labels: true, grid: true, navInfo: true }

function loadLayers(): Record<LayerKey, boolean> {
  try {
    const raw = localStorage.getItem(LAYER_STORAGE)
    if (raw) return { ...DEFAULT_LAYERS, ...(JSON.parse(raw) as Partial<Record<LayerKey, boolean>>) }
  } catch {
    /* ignorieren */
  }
  return DEFAULT_LAYERS
}

/** Pixel je Kartenminute, die als Detailstufe 1 gelten (ganze Karte auf ~800 px Breite) */
const REF_SCALE = 16
const ROSE_CENTER = { lat: 50.618, lon: -1.035 }
const ROSE_RADIUS = 3.2 // Kartenminuten
const CHART_FONT = "'Inter', ui-sans-serif, system-ui, sans-serif"

/* ------------------------------------------------------------------ Grundkarte (statisch) */

const pathOf = (outline: [number, number][]) => 'M' + outline.map(([lon, lat]) => { const p = toMap({ lat, lon }); return `${p.x.toFixed(3)},${p.y.toFixed(3)}` }).join('L') + 'Z'
const lineOf = (line: [number, number][]) => 'M' + line.map(([lon, lat]) => { const p = toMap({ lat, lon }); return `${p.x.toFixed(3)},${p.y.toFixed(3)}` }).join('L')

const SOLID_LAND = LAND.filter((l) => l.kind !== 'drying')
const DRYING_LAND = LAND.filter((l) => l.kind === 'drying')
const LAND_PATH = SOLID_LAND.map((l) => pathOf(l.outline)).join('')
const BAND_FILL: Record<number, string> = { 10: CHART_COLORS.shallow, 5: CHART_COLORS.veryShallow, 0: CHART_COLORS.drying }

/** Tiefenflächen, Tiefenlinien, Land, Ortsflächen und Molen – hängt nicht vom Ausschnitt ab. */
const ChartBase = memo(function ChartBase({ model, areas, contours }: { model: DepthModel | null; areas: boolean; contours: boolean }) {
  return (
    <g>
      <defs>
        <clipPath id="seachart-bounds">
          <rect x={BOUNDS_MAP.x0} y={BOUNDS_MAP.y0} width={BOUNDS_MAP.x1 - BOUNDS_MAP.x0} height={BOUNDS_MAP.y1 - BOUNDS_MAP.y0} />
        </clipPath>
        <clipPath id="seachart-land">
          <path d={LAND_PATH} />
        </clipPath>
      </defs>
      {model && (
        <g clipPath="url(#seachart-bounds)">
          {areas && model.bands.map((b) => <path key={b.maxDepth} d={b.d} fill={BAND_FILL[b.maxDepth]} fillRule="evenodd" />)}
          {contours &&
            model.lines.map((l) => (
              <path key={l.depth} d={l.d} fill="none" stroke={CHART_COLORS.contour} strokeWidth={l.depth <= 5 ? 0.9 : 0.75} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            ))}
        </g>
      )}
      {/* trockenfallende Felsen */}
      {DRYING_LAND.map((l, i) => (
        <path key={i} d={pathOf(l.outline)} fill={CHART_COLORS.drying} stroke={CHART_COLORS.coast} strokeWidth={0.7} vectorEffect="non-scaling-stroke" />
      ))}
      {/* Land und Küstenlinie */}
      <path d={LAND_PATH} fill={CHART_COLORS.land} stroke={CHART_COLORS.coast} strokeWidth={1.1} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      <g clipPath="url(#seachart-land)">
        {BUILT_UP.map((b) => (
          <path key={b.name} d={pathOf(b.outline)} fill={CHART_COLORS.builtUp} />
        ))}
      </g>
      {/* Molen */}
      {MOLES.map((m) => (
        <path key={m.name} d={lineOf(m.line)} fill="none" stroke={CHART_COLORS.coast} strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      ))}
    </g>
  )
})

/* ------------------------------------------------------------------ Szene: Auswahl & Beschriftung je Ausschnitt */

interface PlacedLabel {
  key: string
  x: number
  y: number
  lines: string[]
  size: number
  anchor: 'start' | 'middle' | 'end'
  color: string
  halo: string
  italic?: boolean
  bold?: boolean
  spacing?: number
}

interface Box {
  x0: number
  y0: number
  x1: number
  y1: number
}

/** einfache Belegungsliste in Bildschirmpixeln (Raster-Hash für schnelle Kollisionsprüfung) */
class Occupancy {
  private cells = new Map<string, Box[]>()
  private static C = 48
  private keys(b: Box) {
    const out: string[] = []
    for (let i = Math.floor(b.x0 / Occupancy.C); i <= Math.floor(b.x1 / Occupancy.C); i++)
      for (let j = Math.floor(b.y0 / Occupancy.C); j <= Math.floor(b.y1 / Occupancy.C); j++) out.push(`${i},${j}`)
    return out
  }
  hits(b: Box) {
    for (const key of this.keys(b))
      for (const o of this.cells.get(key) ?? []) if (b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) return true
    return false
  }
  add(b: Box) {
    for (const key of this.keys(b)) {
      const list = this.cells.get(key)
      if (list) list.push(b)
      else this.cells.set(key, [b])
    }
  }
}

const textWidth = (t: string, size: number, spacing = 0) => t.length * (size * 0.56 + spacing)

interface SceneInput {
  vb: { x: number; y: number; w: number; h: number }
  s: number
  k: number
  detail: number
  layers: Record<LayerKey, boolean>
  model: DepthModel | null
}

function buildScene({ vb, s, k, detail, layers, model }: SceneInput) {
  const px = (x: number, y: number) => ({ x: (x - vb.x) * s, y: (y - vb.y) * s })
  const W = vb.w * s
  const H = vb.h * s
  const onScreen = (q: { x: number; y: number }, m = 30) => q.x > -m && q.y > -m && q.x < W + m && q.y < H + m
  const occ = new Occupancy()
  const labels: PlacedLabel[] = []
  const u = 7 // Symbolgröße in px
  // Randleisten (HTML) freihalten
  occ.add({ x0: -100, y0: -100, x1: W + 100, y1: 20 })
  occ.add({ x0: -100, y0: -100, x1: 62, y1: H + 100 })

  const features = layers.aids ? FEATURES.filter((f) => detail >= (f.minZoom ?? 0) && onScreen(px(toMap(f.pos).x, toMap(f.pos).y))) : []

  // Symbole belegen ihren Platz zuerst
  const symbolBox = (q: { x: number; y: number }, tall = 2.2) => ({ x0: q.x - u * 0.9, y0: q.y - u * tall, x1: q.x + u * 0.9, y1: q.y + u * 0.5 })
  for (const m of MARKS) occ.add(symbolBox(px(toMap(m.pos).x, toMap(m.pos).y)))
  for (const f of features) occ.add(symbolBox(px(toMap(f.pos).x, toMap(f.pos).y), f.kind.startsWith('cardinal') ? 3.4 : 2))
  if (layers.navInfo) {
    const c = px(toMap(ROSE_CENTER).x, toMap(ROSE_CENTER).y)
    const r = ROSE_RADIUS * s + 14
    occ.add({ x0: c.x - r, y0: c.y - r, x1: c.x + r, y1: c.y + r })
  }
  if (layers.navInfo) for (const d of TIDAL_DIAMONDS) { const q = px(toMap(d.pos).x, toMap(d.pos).y); occ.add({ x0: q.x - 9, y0: q.y - 10, x1: q.x + 9, y1: q.y + 10 }) }

  /** Beschriftung neben einem Symbol: rechts, links, darunter oder darüber – die erste freie Stelle gewinnt */
  const placeBeside = (key: string, x: number, y: number, lines: string[], size: number, opts: Partial<PlacedLabel> = {}, force = false) => {
    const q = px(x, y)
    if (!onScreen(q, 80)) return
    const w = Math.max(...lines.map((t, i) => textWidth(t, i === 0 ? size : size * 0.88)))
    const h = size * 1.15 * lines.length
    const cands: { dx: number; dy: number; anchor: 'start' | 'end' | 'middle' }[] = [
      { dx: u * 1.1, dy: size * 0.35 - u * 0.4, anchor: 'start' },
      { dx: -u * 1.1, dy: size * 0.35 - u * 0.4, anchor: 'end' },
      { dx: 0, dy: u * 0.8 + size, anchor: 'middle' },
      { dx: 0, dy: -u * 2.6 - h + size, anchor: 'middle' },
    ]
    for (const c of cands) {
      const x0 = c.anchor === 'start' ? q.x + c.dx : c.anchor === 'end' ? q.x + c.dx - w : q.x - w / 2
      const top = q.y + c.dy - size
      const box = { x0, y0: top, x1: x0 + w, y1: top + h }
      if (!occ.hits(box) || (force && c === cands[cands.length - 1])) {
        occ.add(box)
        labels.push({ key, x: x + c.dx * k, y: y + c.dy * k, lines, size, anchor: c.anchor, color: CHART_COLORS.label, halo: CHART_COLORS.deep, ...opts })
        return
      }
    }
  }

  // 1) Aufgabenobjekte: Name und Kennung (ab mittlerer Vergrößerung Pflicht – notfalls überlappend)
  const overview = detail < 0.9
  for (const m of MARKS) {
    const p = toMap(m.pos)
    const italic = m.kind.startsWith('buoy') || m.kind === 'danger'
    placeBeside(m.id, p.x, p.y, m.note && !overview ? [m.name, m.note] : [m.name], overview ? 9 : 10, { italic }, !overview)
  }
  // 2) weitere Seezeichen: Name (kursiv) und Feuerkennung
  if (layers.labels)
    for (const f of features) {
      const lines = [f.name, f.light].filter(Boolean) as string[]
      if (lines.length === 0) continue
      const p = toMap(f.pos)
      placeBeside(f.id, p.x, p.y, lines, 9, { italic: !!f.name })
    }
  // 3) Orts- und Gebietsnamen
  if (layers.labels) {
    for (const n of PLACE_NAMES) {
      if (detail < (n.minZoom ?? 0)) continue
      const p = toMap(n.pos)
      const q = px(p.x, p.y)
      if (!onScreen(q, 60)) continue
      const style = PLACE_STYLE[n.style]
      const w = textWidth(n.text, style.size, style.spacing)
      const box = { x0: q.x - w / 2, y0: q.y - style.size * 0.8, x1: q.x + w / 2, y1: q.y + style.size * 0.3 }
      if (occ.hits(box)) continue
      occ.add(box)
      labels.push({ key: `pn-${n.text}`, x: p.x, y: p.y, lines: [n.text], size: style.size, anchor: 'middle', color: CHART_COLORS.label, halo: style.halo, italic: style.italic, bold: style.bold, spacing: style.spacing })
    }
    if (layers.navInfo)
      for (const a of RESTRICTED_AREAS) {
        const c = a.outline.reduce((acc, [lon, lat]) => ({ lon: acc.lon + lon / a.outline.length, lat: acc.lat + lat / a.outline.length }), { lon: 0, lat: 0 })
        const p = toMap(c)
        const q = px(p.x, p.y)
        const lines = ['Sperrgebiet', '(Übungsgebiet)']
        const box = { x0: q.x - 36, y0: q.y - 10, x1: q.x + 36, y1: q.y + 14 }
        if (detail >= 1 && onScreen(q) && !occ.hits(box)) {
          occ.add(box)
          labels.push({ key: `ra-${a.name}`, x: p.x, y: p.y, lines, size: 9, anchor: 'middle', color: CHART_COLORS.magenta, halo: CHART_COLORS.deep, italic: true })
        }
      }
  }

  // 4) Beschriftung der Tiefenlinien
  const contourLabels: { key: string; x: number; y: number; angle: number; text: string }[] = []
  if (model && layers.contours && layers.labels && detail >= 1.6)
    for (const l of model.lines)
      l.labels.forEach((c, i) => {
        const q = px(c.x, c.y)
        if (!onScreen(q, 0)) return
        const box = { x0: q.x - 7, y0: q.y - 6, x1: q.x + 7, y1: q.y + 6 }
        if (occ.hits(box)) return
        occ.add(box)
        contourLabels.push({ key: `cl${l.depth}-${i}`, x: c.x, y: c.y, angle: c.angle, text: String(l.depth) })
      })

  // 5) Tiefenzahlen: Dichte nach Zoomstufe, frei von Symbolen und Schrift
  const soundings: { key: string; x: number; y: number; depth: number }[] = []
  if (model && layers.soundings) {
    const spacing = [2.2, 1.1, 0.55] // Kartenminuten je Stufe
    let maxLevel = -1
    for (let lv = 0; lv < 3; lv++) if (spacing[lv] * s >= 30) maxLevel = lv
    if (maxLevel >= 0)
      model.soundings.forEach((sd, i) => {
        if (sd.level > maxLevel) return
        const q = px(sd.x, sd.y)
        if (!onScreen(q, 0)) return
        const f = formatSounding(sd.depth)
        const half = (f.whole.length * 5.3 + (f.tenth ? 4.5 : 0)) / 2 + 2
        const box = { x0: q.x - half, y0: q.y - 8, x1: q.x + half, y1: q.y + 5 }
        if (occ.hits(box)) return
        occ.add(box)
        soundings.push({ key: `s${i}`, x: sd.x, y: sd.y, depth: sd.depth })
      })
  }

  return { features, labels, contourLabels, soundings }
}

const PLACE_STYLE: Record<PlaceStyle, { size: number; italic?: boolean; bold?: boolean; spacing: number; halo: string }> = {
  land: { size: 12, bold: true, spacing: 2, halo: CHART_COLORS.land },
  town: { size: 11, bold: true, spacing: 1.2, halo: CHART_COLORS.land },
  water: { size: 13, italic: true, spacing: 1, halo: CHART_COLORS.deep },
  feature: { size: 10, italic: true, spacing: 0.3, halo: CHART_COLORS.deep },
}

/* ------------------------------------------------------------------ Bausteine */

/** Tiefenzahl: Meter, Dezimeter tiefgestellt; trockenfallende Höhen unterstrichen */
function SoundingText({ x, y, depth, k }: { x: number; y: number; depth: number; k: number }) {
  const f = formatSounding(depth)
  const size = 9.5 * k
  const w = (f.whole.length * 0.56 + (f.tenth ? 0.45 : 0)) * size
  return (
    <g fill={CHART_COLORS.label} fontStyle="italic">
      <text x={x} y={y} fontSize={size} textAnchor="middle">
        {f.whole}
        {f.tenth && (
          <tspan fontSize={size * 0.72} dy={size * 0.28}>
            {f.tenth}
          </tspan>
        )}
      </text>
      {f.drying && <line x1={x - w / 2} x2={x + w / 2} y1={y + size * 0.42} y2={y + size * 0.42} stroke={CHART_COLORS.label} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />}
    </g>
  )
}

/** Grenze eines Sperrgebiets: gestrichelte Magenta-Linie mit nach innen weisenden „T“ (INT 1 N 2.1) */
function RestrictedArea({ outline, k }: { outline: [number, number][]; k: number }) {
  const pts = outline.map(([lon, lat]) => toMap({ lat, lon }))
  const cx = pts.reduce((a, p) => a + p.x, 0) / pts.length
  const cy = pts.reduce((a, p) => a + p.y, 0) / pts.length
  const ticks: string[] = []
  const gap = 16 * k
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i]
    const b = pts[(i + 1) % pts.length]
    const len = Math.hypot(b.x - a.x, b.y - a.y)
    const ux = (b.x - a.x) / len
    const uy = (b.y - a.y) / len
    let nx = -uy
    let ny = ux
    if ((cx - a.x) * nx + (cy - a.y) * ny < 0) {
      nx = -nx
      ny = -ny
    }
    for (let t = gap / 2; t < len; t += gap) {
      const x = a.x + ux * t
      const y = a.y + uy * t
      ticks.push(`M${x},${y}L${x + nx * 5 * k},${y + ny * 5 * k}`)
    }
  }
  return (
    <g stroke={CHART_COLORS.magenta} fill="none" strokeWidth={1.1}>
      <path d={'M' + pts.map((p) => `${p.x},${p.y}`).join('L') + 'Z'} strokeDasharray="7 4" vectorEffect="non-scaling-stroke" />
      <path d={ticks.join('')} vectorEffect="non-scaling-stroke" />
    </g>
  )
}

function CompassRose({ center, r, k }: { center: { x: number; y: number }; r: number; k: number }) {
  const col = CHART_COLORS.magenta
  const ticks = []
  for (let d = 0; d < 360; d += 5) {
    const a = degToRad(d)
    const len = d % 30 === 0 ? 0.35 : d % 10 === 0 ? 0.22 : 0.12
    ticks.push(
      <line key={d} x1={center.x + Math.sin(a) * r} y1={center.y - Math.cos(a) * r} x2={center.x + Math.sin(a) * (r - len)} y2={center.y - Math.cos(a) * (r - len)} stroke={col} strokeWidth={0.8} vectorEffect="non-scaling-stroke" />,
    )
    if (d % 30 === 0)
      ticks.push(
        <text key={`t${d}`} x={center.x + Math.sin(a) * (r + 9 * k)} y={center.y - Math.cos(a) * (r + 9 * k) + 3 * k} fontSize={(d % 90 === 0 ? 9 : 7.5) * k} textAnchor="middle" fill={col} fontWeight={d % 90 === 0 ? 700 : 400}>
          {d === 0 ? 'N' : String(d).padStart(3, '0')}
        </text>,
      )
  }
  return (
    <g opacity={0.9}>
      <circle cx={center.x} cy={center.y} r={r} fill="none" stroke={col} strokeWidth={1} vectorEffect="non-scaling-stroke" />
      <circle cx={center.x} cy={center.y} r={r * 0.6} fill="none" stroke={col} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
      {ticks}
      <path d={`M${center.x},${center.y - r * 0.95} L${center.x + r * 0.07},${center.y} L${center.x - r * 0.07},${center.y} Z`} fill={col} />
      <line x1={center.x - r * 0.6} x2={center.x + r * 0.6} y1={center.y} y2={center.y} stroke={col} strokeWidth={0.6} vectorEffect="non-scaling-stroke" />
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
