import { contours } from 'd3-contour'
import { fromMercator, meridionalParts, pointInPolygon } from '@/calculations/chart'
import { CHART_BOUNDS, LAND } from '@/data/chartArea'
import { DREDGED, SHOALS } from '@/data/chartFeatures'
import { rng } from '@/lib/coastline'
import type { LatLon } from '@/types/navigation'

/**
 * Synthetisches Tiefenmodell des fiktiven Übungsreviers (Kartennull, Meter). Die Tiefe wächst mit dem Abstand zur
 * Küste, nach Süden (offene See) wird es tiefer; Untiefen, Watt und ausgebaggerte Rinnen werden eingeblendet und eine
 * glatte Rauschfunktion sorgt für natürliche Unregelmäßigkeit. Negative Werte = trockenfallend (Höhe über Kartennull).
 * Erfunden, nicht vermessen – nicht zur Navigation.
 */

const COS = Math.cos(((CHART_BOUNDS.north + CHART_BOUNDS.south) / 2) * (Math.PI / 180))
const SOLID = LAND.filter((l) => l.kind !== 'drying')

/** Küstenabschnitte in NM-Koordinaten (ax, ay, dx, dy, |d|²), einmal vorberechnet */
const SEGMENTS: Float64Array = (() => {
  const segs: number[] = []
  for (const l of SOLID) {
    const o = l.outline
    for (let i = 0; i < o.length; i++) {
      const a = o[i]
      const b = o[(i + 1) % o.length]
      const ax = a[0] * 60 * COS
      const ay = a[1] * 60
      const dx = b[0] * 60 * COS - ax
      const dy = b[1] * 60 - ay
      segs.push(ax, ay, dx, dy, dx * dx + dy * dy)
    }
  }
  return Float64Array.from(segs)
})()

/** Abstand eines Punktes zur nächsten Küste in NM (lokal eben gerechnet). */
export function distanceToCoast(p: LatLon): number {
  let best = Infinity
  const px = p.lon * 60 * COS
  const py = p.lat * 60
  for (let s = 0; s < SEGMENTS.length; s += 5) {
    const ax = SEGMENTS[s]
    const ay = SEGMENTS[s + 1]
    const dx = SEGMENTS[s + 2]
    const dy = SEGMENTS[s + 3]
    const len2 = SEGMENTS[s + 4]
    const t = len2 > 0 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / len2)) : 0
    const ex = px - ax - t * dx
    const ey = py - ay - t * dy
    const d2 = ex * ex + ey * ey
    if (d2 < best) best = d2
  }
  return Math.sqrt(best)
}

/* Glatte Wertrauschfunktion auf einem festen Gitter (reproduzierbar) */
const NOISE_N = 64
const NOISE = (() => {
  const r = rng(4711)
  return Array.from({ length: NOISE_N * NOISE_N }, () => r() * 2 - 1)
})()
function noise(x: number, y: number): number {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const fx = x - xi
  const fy = y - yi
  const v = (i: number, j: number) => NOISE[(((j % NOISE_N) + NOISE_N) % NOISE_N) * NOISE_N + (((i % NOISE_N) + NOISE_N) % NOISE_N)]
  const sx = fx * fx * (3 - 2 * fx)
  const sy = fy * fy * (3 - 2 * fy)
  const top = v(xi, yi) + (v(xi + 1, yi) - v(xi, yi)) * sx
  const bot = v(xi, yi + 1) + (v(xi + 1, yi + 1) - v(xi, yi + 1)) * sx
  return top + (bot - top) * sy
}
/** zwei Oktaven, Koordinaten in NM */
const fbm = (xNm: number, yNm: number) => noise(xNm / 2.2, yNm / 2.2) * 0.7 + noise(xNm / 0.9 + 17, yNm / 0.9 + 5) * 0.3

const smooth = (t: number) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t))

/** Kartentiefe in Metern (negativ = trockenfallend, an Land ≈ −3). */
export function depthAt(p: LatLon): number {
  if (SOLID.some((l) => pointInPolygon(p, l.outline))) return -3
  const xNm = p.lon * 60 * COS
  const yNm = p.lat * 60
  const d = distanceToCoast(p)
  // nach Süden (offene See) tiefer; Bucht zwischen Festland und Insel flacher
  const open = smooth((50.7 - p.lat) / 0.13)
  const maxDepth = 23 + 20 * open + 7 * fbm(xNm + 40, yNm)
  const shelf = 2.1 + 1.1 * fbm(xNm, yNm + 30)
  let depth = -0.9 + (maxDepth + 0.9) * (1 - Math.exp(-d / shelf))
  depth += fbm(xNm * 1.7, yNm * 1.7) * Math.min(5, 0.2 * depth + 0.5)

  for (const s of SHOALS) {
    const dist = Math.hypot((p.lon - s.pos.lon) * 60 * COS, (p.lat - s.pos.lat) * 60)
    const w = Math.exp(-((dist / s.radiusNm) ** 2) * 1.6)
    if (w > 0.002) depth = Math.min(depth, depth * (1 - w) + s.depth * w)
  }
  for (const c of DREDGED) {
    const ax = c.from.lon * 60 * COS
    const ay = c.from.lat * 60
    const dx = c.to.lon * 60 * COS - ax
    const dy = c.to.lat * 60 - ay
    const t = Math.max(0, Math.min(1, ((xNm - ax) * dx + (yNm - ay) * dy) / (dx * dx + dy * dy)))
    const off = Math.hypot(xNm - ax - t * dx, yNm - ay - t * dy)
    const w = 1 - smooth((off - c.halfWidthNm) / 0.08)
    if (w > 0) depth = Math.max(depth, depth + (c.minDepth - depth) * w)
  }
  return depth
}

/* ------------------------------------------------------------------ Gitter und Konturen */

/** Kartenkoordinaten wie in SeaChart: x = Länge in Minuten, y = −Meridionalteile */
export const toMapXY = (p: LatLon) => ({ x: p.lon * 60, y: -meridionalParts(p.lat) })
const fromMapXY = (x: number, y: number): LatLon => fromMercator({ x, y: -y })

export const CONTOUR_DEPTHS = [2, 5, 10, 20, 30] as const

export interface DepthModel {
  /** Flächenfüllungen als SVG-Pfad (Kartenkoordinaten) */
  bands: { maxDepth: number; d: string }[]
  /** Tiefenlinien als SVG-Pfad */
  lines: { depth: number; d: string; labels: { x: number; y: number; angle: number }[] }[]
  soundings: Sounding[]
}

export interface Sounding {
  x: number
  y: number
  depth: number
  /** 0 = auch in der Übersicht, 1 = mittlere, 2 = nur in starker Vergrößerung */
  level: 0 | 1 | 2
}

const CELL = 0.2 // Kartenminuten
const MARGIN = 1.2

let cached: DepthModel | null = null

/** bereits berechnetes Modell oder null (ohne Rechenaufwand) */
export const peekDepthModel = () => cached

export function depthModel(): DepthModel {
  if (cached) return cached
  const x0 = CHART_BOUNDS.west * 60 - MARGIN
  const x1 = CHART_BOUNDS.east * 60 + MARGIN
  const y0 = -meridionalParts(CHART_BOUNDS.north) - MARGIN
  const y1 = -meridionalParts(CHART_BOUNDS.south) + MARGIN
  const nx = Math.ceil((x1 - x0) / CELL) + 1
  const ny = Math.ceil((y1 - y0) / CELL) + 1
  // d3-contour: Werte ≥ Schwelle liegen innen → negierte Tiefe, damit „flacher als“ innen ist
  const values = new Float64Array(nx * ny)
  for (let j = 0; j < ny; j++)
    for (let i = 0; i < nx; i++) values[j * nx + i] = -depthAt(fromMapXY(x0 + i * CELL, y0 + j * CELL))

  const gen = contours().size([nx, ny]).smooth(true)
  const toPath = (mp: GeoJSON.MultiPolygon) =>
    mp.coordinates
      .map((poly) => poly.map((ring) => 'M' + ring.map(([gx, gy]) => `${(x0 + (gx - 0.5) * CELL).toFixed(3)},${(y0 + (gy - 0.5) * CELL).toFixed(3)}`).join('L') + 'Z').join(''))
      .join('')

  const bands = [10, 5, 0].map((maxDepth) => ({ maxDepth, d: toPath(gen.contour(values as unknown as number[], -maxDepth)) }))

  const lines = CONTOUR_DEPTHS.map((depth) => {
    const mp = gen.contour(values as unknown as number[], -depth)
    // Beschriftungspunkte entlang längerer Linien, etwa alle 7 Kartenminuten
    const labels: { x: number; y: number; angle: number }[] = []
    for (const poly of mp.coordinates)
      for (const ring of poly) {
        let acc = 3.5
        for (let k = 1; k < ring.length; k++) {
          const ax = x0 + (ring[k - 1][0] - 0.5) * CELL
          const ay = y0 + (ring[k - 1][1] - 0.5) * CELL
          const bx = x0 + (ring[k][0] - 0.5) * CELL
          const by = y0 + (ring[k][1] - 0.5) * CELL
          acc += Math.hypot(bx - ax, by - ay)
          if (acc < 7) continue
          const inside = bx > CHART_BOUNDS.west * 60 + 1 && bx < CHART_BOUNDS.east * 60 - 1 && by > y0 + MARGIN + 1 && by < y1 - MARGIN - 1
          if (!inside) continue
          let angle = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI
          if (angle > 90) angle -= 180
          if (angle < -90) angle += 180
          labels.push({ x: bx, y: by, angle })
          acc = 0
        }
      }
    return { depth, d: toPath(mp), labels }
  })

  cached = { bands, lines, soundings: makeSoundings() }
  return cached
}

/** Lotungen auf einem leicht verrauschten Raster; jede Stufe verdoppelt die Dichte. */
function makeSoundings(): Sounding[] {
  const r = rng(99)
  const step = 0.55 // Kartenminuten im feinsten Raster
  const out: Sounding[] = []
  const xs = CHART_BOUNDS.west * 60 + step / 2
  const ys = -meridionalParts(CHART_BOUNDS.north) + step / 2
  const ye = -meridionalParts(CHART_BOUNDS.south)
  for (let j = 0; ys + j * step < ye; j++)
    for (let i = 0; xs + i * step < CHART_BOUNDS.east * 60; i++) {
      const x = xs + i * step + (r() - 0.5) * step * 0.85
      const y = ys + j * step + (r() - 0.5) * step * 0.85
      const p = fromMapXY(x, y)
      if (LAND.some((l) => pointInPolygon(p, l.outline))) continue
      const depth = depthAt(p)
      if (depth < -2.5) continue
      const level: 0 | 1 | 2 = i % 4 === 0 && j % 4 === 0 ? 0 : i % 2 === 0 && j % 2 === 0 ? 1 : 2
      out.push({ x, y, depth: Math.round(depth * 10) / 10, level })
    }
  return out
}

/** Lotung im Kartenformat: Meter mit tiefgestellten Dezimetern unter 21 m, trockenfallend unterstrichen. */
export function formatSounding(depth: number): { whole: string; tenth: string; drying: boolean } {
  const drying = depth < 0
  const a = Math.abs(depth)
  if (!drying && a >= 21) return { whole: String(Math.round(a)), tenth: '', drying }
  const whole = Math.floor(a + 1e-9)
  const tenth = Math.round((a - whole) * 10)
  return tenth === 10 ? { whole: String(whole + 1), tenth: '', drying } : { whole: String(whole), tenth: tenth ? String(tenth) : '', drying }
}
