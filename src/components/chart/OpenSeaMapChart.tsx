import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { AlertTriangle, Layers } from 'lucide-react'
import { MAP_PROVIDERS, NAV_DISCLAIMER, type TileProvider } from '@/config/mapProviders'
import type { PracticeArea } from '@/data/practiceAreas'
import { formatLat, formatLon } from '@/lib/coords'
import { nauticalScale } from '@/lib/measure'
import { cn } from '@/lib/utils'
import type { LatLon } from '@/types/navigation'

/**
 * Interaktive Webkarte mit echten Kartendaten: OpenStreetMap als Grundkarte, OpenSeaMap-Seezeichen als transparente
 * Ebene darüber (Anbieter und URLs aus config/mapProviders.ts). Projektion Web-Mercator (EPSG:3857), Koordinaten WGS84.
 * Eigene Inhalte (Aufgabenmarker, Messlinien, Peillinien) kommen als Overlays mit Ebenenzuordnung.
 */

export type MapLayerKey = 'basemap' | 'seamarks' | 'bathymetry' | 'tasks' | 'measure' | 'bearings'
export type OverlayLayer = 'tasks' | 'measure' | 'bearings'
export type MapPointSymbol = 'start' | 'target' | 'cross' | 'fix' | 'wp' | 'object'

export type MapOverlay =
  | { kind: 'point'; id: string; layer: OverlayLayer; pos: LatLon; symbol: MapPointSymbol; label?: string; color?: string }
  | { kind: 'line'; id: string; layer: OverlayLayer; points: LatLon[]; color: string; dashed?: boolean; label?: string; arrow?: boolean; width?: number }
  | { kind: 'circle'; id: string; layer: OverlayLayer; center: LatLon; radiusNm: number; color: string }

export interface OpenSeaMapChartProps {
  area: PracticeArea
  overlays?: MapOverlay[]
  /** Klick in die Karte (auf Touchgeräten: Tippen); rastet an snapTargets ein */
  onMapClick?: (pos: LatLon) => void
  /** Positionen, an denen Klicks einrasten (z. B. Aufgabenmarker), Radius 14 px */
  snapTargets?: LatLon[]
  className?: string
  /** zusätzliche Bedienelemente oben links unter den Zoomknöpfen */
  toolbar?: ReactNode
  /** Ausschnitt so wählen, dass diese Positionen sichtbar sind (statt Mittelpunkt/Zoom des Gebiets) */
  fitTo?: LatLon[]
}

const LAYER_LABELS: { key: MapLayerKey; label: string }[] = [
  { key: 'basemap', label: 'Grundkarte (OpenStreetMap)' },
  { key: 'seamarks', label: 'Seezeichen (OpenSeaMap)' },
  { key: 'bathymetry', label: 'Tiefendaten' },
  { key: 'tasks', label: 'RYA-Aufgabenmarker' },
  { key: 'measure', label: 'Eigene Messlinien' },
  { key: 'bearings', label: 'Peillinien und Positionskreuze' },
]

const LAYER_STORAGE = 'openseamap-layers'
const DEFAULT_LAYERS: Record<MapLayerKey, boolean> = { basemap: true, seamarks: true, bathymetry: true, tasks: true, measure: true, bearings: true }

function loadLayers(): Record<MapLayerKey, boolean> {
  try {
    const raw = localStorage.getItem(LAYER_STORAGE)
    if (raw) return { ...DEFAULT_LAYERS, ...(JSON.parse(raw) as Partial<Record<MapLayerKey, boolean>>) }
  } catch {
    /* Speicher nicht verfügbar */
  }
  return DEFAULT_LAYERS
}

function tileLayer(p: TileProvider, zIndex: number): L.TileLayer {
  const common = { attribution: p.attribution, minZoom: p.minZoom, maxZoom: p.maxZoom, maxNativeZoom: p.maxNativeZoom, zIndex }
  if (p.kind === 'wms') return L.tileLayer.wms(p.url, { ...common, layers: p.wmsLayers ?? '', format: 'image/png', transparent: true })
  return L.tileLayer(p.url, common)
}

export function OpenSeaMapChart({ area, overlays = [], onMapClick, snapTargets = [], className, toolbar, fitTo }: OpenSeaMapChartProps) {
  const hostRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const tilesRef = useRef<Partial<Record<'basemap' | 'seamarks' | 'bathymetry', L.TileLayer>>>({})
  const groupRef = useRef<L.LayerGroup | null>(null)
  const clickRef = useRef(onMapClick)
  const snapRef = useRef(snapTargets)
  clickRef.current = onMapClick
  snapRef.current = snapTargets

  const [hover, setHover] = useState<LatLon | null>(null)
  const [view, setView] = useState({ lat: area.center.lat, zoom: area.zoom })
  const [layers, setLayers] = useState(loadLayers)
  const [menu, setMenu] = useState(false)
  const [tileState, setTileState] = useState<Record<string, { ok: number; err: number }>>({})
  const menuId = useId()

  // Karte einmalig anlegen
  useEffect(() => {
    const host = hostRef.current
    if (!host) return
    const map = L.map(host, {
      center: [area.center.lat, area.center.lon],
      zoom: area.zoom,
      zoomControl: true,
      attributionControl: true,
      doubleClickZoom: false,
      worldCopyJump: true,
    })
    map.attributionControl.setPrefix('<a href="https://leafletjs.com" target="_blank" rel="noopener">Leaflet</a>')
    const p = MAP_PROVIDERS
    const t: typeof tilesRef.current = { basemap: tileLayer(p.basemap, 1), seamarks: tileLayer(p.seamarks, 3) }
    if (p.bathymetry) t.bathymetry = tileLayer(p.bathymetry, 2)
    for (const [key, layer] of Object.entries(t)) {
      layer.on('tileload', () => setTileState((s) => ({ ...s, [key]: { ok: (s[key]?.ok ?? 0) + 1, err: s[key]?.err ?? 0 } })))
      layer.on('tileerror', () => setTileState((s) => ({ ...s, [key]: { ok: s[key]?.ok ?? 0, err: (s[key]?.err ?? 0) + 1 } })))
    }
    tilesRef.current = t
    groupRef.current = L.layerGroup().addTo(map)

    let frame = 0
    map.on('mousemove', (e: L.LeafletMouseEvent) => {
      cancelAnimationFrame(frame)
      const ll = e.latlng.wrap()
      frame = requestAnimationFrame(() => setHover({ lat: ll.lat, lon: ll.lng }))
    })
    map.on('mouseout', () => setHover(null))
    map.on('moveend zoomend', () => setView({ lat: map.getCenter().lat, zoom: map.getZoom() }))
    map.on('click', (e: L.LeafletMouseEvent) => {
      const cb = clickRef.current
      if (!cb) return
      const ll = e.latlng.wrap()
      let pos: LatLon = { lat: ll.lat, lon: ll.lng }
      // an Aufgabenmarkern einrasten (Abstand in Bildschirmpixeln)
      let best = 14
      for (const s of snapRef.current) {
        const d = map.latLngToContainerPoint([s.lat, s.lon]).distanceTo(e.containerPoint)
        if (d <= best) {
          best = d
          pos = s
        }
      }
      setHover(pos)
      cb(pos)
    })
    const ro = new ResizeObserver(() => map.invalidateSize())
    ro.observe(host)
    mapRef.current = map
    return () => {
      ro.disconnect()
      cancelAnimationFrame(frame)
      map.remove()
      mapRef.current = null
    }
    // nur beim Einhängen; Gebietswechsel siehe unten
  }, [])

  // Gebiets- bzw. Aufgabenwechsel
  const fitKey = fitTo?.map((p) => `${p.lat},${p.lon}`).join(';') ?? ''
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (fitTo && fitTo.length > 0) {
      map.fitBounds(L.latLngBounds(fitTo.map((p) => [p.lat, p.lon] as [number, number])), { padding: [60, 60], maxZoom: 13 })
      return
    }
    const narrow = (hostRef.current?.clientWidth ?? 800) < 560
    map.setView([area.center.lat, area.center.lon], area.zoom - (narrow ? 1 : 0))
    // fitTo wird über fitKey verglichen
  }, [area, fitKey])

  // Kachelebenen ein-/ausblenden
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    for (const key of ['basemap', 'bathymetry', 'seamarks'] as const) {
      const layer = tilesRef.current[key]
      if (!layer) continue
      if (layers[key] && !map.hasLayer(layer)) layer.addTo(map)
      if (!layers[key] && map.hasLayer(layer)) map.removeLayer(layer)
    }
  }, [layers])

  // eigene Overlays zeichnen
  useEffect(() => {
    const group = groupRef.current
    if (!group) return
    group.clearLayers()
    for (const o of overlays) if (layers[o.layer]) drawOverlay(group, o)
  }, [overlays, layers])

  const toggle = (key: MapLayerKey) =>
    setLayers((l) => {
      const next = { ...l, [key]: !l[key] }
      try {
        localStorage.setItem(LAYER_STORAGE, JSON.stringify(next))
      } catch {
        /* nur für diese Sitzung */
      }
      return next
    })

  const scale = nauticalScale(view.lat, view.zoom)
  const failing = (['basemap', 'seamarks'] as const).filter((k) => layers[k] && (tileState[k]?.err ?? 0) > 0 && (tileState[k]?.ok ?? 0) === 0)

  return (
    <div className={cn('osm-chart relative h-[62vh] min-h-[380px] w-full overflow-hidden rounded-xl border', className)}>
      <div ref={hostRef} className="absolute inset-0" style={{ cursor: onMapClick ? 'crosshair' : undefined }} role="application" aria-label={`Seekarte ${area.name} (OpenStreetMap und OpenSeaMap)`} />

      {/* Hinweis – dauerhaft sichtbar */}
      <div className="pointer-events-none absolute top-2 left-1/2 z-[1000] max-w-[calc(100%-120px)] -translate-x-1/2 rounded-md bg-white/90 px-2 py-0.5 text-center text-[10px] font-semibold text-[#7a1d1d] shadow-sm sm:text-[11px]">
        {NAV_DISCLAIMER}
      </div>

      {toolbar && <div className="absolute top-[86px] left-2.5 z-[1000] flex flex-col gap-1">{toolbar}</div>}

      {/* Ebenen */}
      <div className="absolute top-2 right-2 z-[1100] flex flex-col items-end gap-1">
        <button
          type="button"
          className="flex size-[34px] items-center justify-center rounded border-2 border-black/20 bg-white bg-clip-padding text-[#303D47] hover:bg-slate-100"
          onClick={() => setMenu((m) => !m)}
          aria-label="Kartenebenen"
          aria-expanded={menu}
          aria-controls={menuId}
        >
          <Layers className="size-4" />
        </button>
        {menu && (
          <fieldset id={menuId} className="w-60 rounded-lg border border-slate-300 bg-white p-2 text-xs text-[#303D47] shadow-md">
            <legend className="sr-only">Kartenebenen</legend>
            <p className="mb-1 font-semibold">Kartenebenen</p>
            {LAYER_LABELS.map((l) => {
              const unavailable = l.key === 'bathymetry' && !MAP_PROVIDERS.bathymetry
              return (
                <label key={l.key} className={cn('flex items-start gap-2 rounded px-1 py-1', unavailable ? 'opacity-70' : 'cursor-pointer hover:bg-slate-100')}>
                  <input type="checkbox" className="mt-0.5 size-3.5 accent-[#303D47]" checked={layers[l.key] && !unavailable} disabled={unavailable} onChange={() => toggle(l.key)} />
                  <span>
                    {l.label}
                    {unavailable && <span className="block text-[10px] text-slate-600">keine lizenzierte Quelle konfiguriert (VITE_BATHYMETRY_URL)</span>}
                  </span>
                </label>
              )
            })}
            <p className="mt-1 px-1 text-[10px] leading-snug text-slate-600">OpenSeaMap enthält Seezeichen, aber keine Tiefenlinien oder Lotungen.</p>
          </fieldset>
        )}
      </div>

      {failing.length > 0 && (
        <div className="absolute top-10 left-1/2 z-[1000] flex max-w-[calc(100%-120px)] -translate-x-1/2 items-start gap-1.5 rounded-md bg-amber-50 px-2 py-1 text-[11px] text-amber-900 shadow-sm" role="status">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          Kartenkacheln ({failing.map((k) => (k === 'basemap' ? 'Grundkarte' : 'Seezeichen')).join(', ')}) konnten nicht geladen werden – keine Internetverbindung oder Dienst nicht erreichbar.
        </div>
      )}

      {/* Maßstab in Seemeilen */}
      <div className="pointer-events-none absolute bottom-10 left-2 z-[1000] sm:bottom-6 rounded bg-white/85 px-1.5 py-0.5 text-[11px] text-[#303D47]">
        <div className="mb-0.5 h-1.5 border-x-2 border-b-2 border-[#303D47]" style={{ width: scale.px }} />
        {String(scale.nm).replace('.', ',')} sm
      </div>
      {/* Position unter dem Mauszeiger bzw. letzter Klick */}
      <div className="pointer-events-none absolute right-2 bottom-10 z-[1000] sm:bottom-6 rounded bg-white/90 px-2 py-0.5 font-mono text-[11px] text-[#303D47] tabular-nums" aria-live="off">
        {hover ? `${formatLat(hover.lat, 2)} ${formatLon(hover.lon, 2)}` : 'Position: Zeiger über Karte'}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Overlays */

const SYMBOL_SVG: Record<MapPointSymbol, (c: string) => string> = {
  start: (c) => `<circle cx="12" cy="12" r="7" fill="none" stroke="${c}" stroke-width="2.5"/><circle cx="12" cy="12" r="2" fill="${c}"/>`,
  target: (c) => `<rect x="5" y="5" width="14" height="14" fill="none" stroke="${c}" stroke-width="2.5"/><circle cx="12" cy="12" r="2" fill="${c}"/>`,
  wp: (c) => `<rect x="5" y="5" width="14" height="14" fill="none" stroke="${c}" stroke-width="2"/><circle cx="12" cy="12" r="1.8" fill="${c}"/>`,
  fix: (c) => `<circle cx="12" cy="12" r="7" fill="none" stroke="${c}" stroke-width="2"/><circle cx="12" cy="12" r="1.8" fill="${c}"/>`,
  cross: (c) => `<path d="M4 12H20M12 4V20" stroke="${c}" stroke-width="2.2"/>`,
  object: (c) => `<path d="M12 4 L19 18 H5 Z" fill="none" stroke="${c}" stroke-width="2"/><circle cx="12" cy="14" r="1.6" fill="${c}"/>`,
}

const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]!)

function label(group: L.LayerGroup, at: L.LatLngExpression, text: string, color: string, offset: [number, number] = [10, -10]) {
  L.tooltip({ permanent: true, direction: 'right', offset, className: 'osm-chart-label', interactive: false })
    .setLatLng(at)
    .setContent(`<span style="color:${color}">${escapeHtml(text)}</span>`)
    .addTo(group)
}

function drawOverlay(group: L.LayerGroup, o: MapOverlay) {
  if (o.kind === 'point') {
    const c = o.color ?? '#1e3a5f'
    L.marker([o.pos.lat, o.pos.lon], {
      interactive: false,
      keyboard: false,
      icon: L.divIcon({ className: 'osm-chart-symbol', html: `<svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">${SYMBOL_SVG[o.symbol](c)}</svg>`, iconSize: [24, 24], iconAnchor: [12, 12] }),
    }).addTo(group)
    if (o.label) label(group, [o.pos.lat, o.pos.lon], o.label, c)
    return
  }
  if (o.kind === 'circle') {
    L.circle([o.center.lat, o.center.lon], { radius: o.radiusNm * 1852, color: o.color, weight: 1.5, dashArray: '5 4', fillOpacity: 0.1, interactive: false }).addTo(group)
    return
  }
  const pts = o.points.map((p) => [p.lat, p.lon] as [number, number])
  if (pts.length < 2) return
  L.polyline(pts, { color: o.color, weight: o.width ?? 3, dashArray: o.dashed ? '8 6' : undefined, interactive: false, lineCap: 'round' }).addTo(group)
  const a = o.points[o.points.length - 2]
  const b = o.points[o.points.length - 1]
  if (o.arrow) {
    // Richtung auf dem Bildschirm = Loxodromen-Kurs (Mercator ist winkeltreu)
    const y1 = Math.log(Math.tan(Math.PI / 4 + (a.lat * Math.PI) / 360))
    const y2 = Math.log(Math.tan(Math.PI / 4 + (b.lat * Math.PI) / 360))
    const deg = (Math.atan2(((b.lon - a.lon) * Math.PI) / 180, y2 - y1) * 180) / Math.PI
    L.marker([b.lat, b.lon], {
      interactive: false,
      keyboard: false,
      icon: L.divIcon({ className: 'osm-chart-symbol', html: `<svg width="22" height="22" viewBox="0 0 22 22" style="transform:rotate(${deg}deg)" aria-hidden="true"><path d="M11 2 L17 15 L11 12 L5 15 Z" fill="${o.color}"/></svg>`, iconSize: [22, 22], iconAnchor: [11, 11] }),
    }).addTo(group)
  }
  if (o.label) label(group, [(a.lat + b.lat) / 2, (a.lon + b.lon) / 2], o.label, o.color, [12, 0])
}
