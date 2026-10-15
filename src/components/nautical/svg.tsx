import type { Vector2 } from '@/types/navigation'

/** Abbildung von Navigationskoordinaten (x Ost, y Nord) auf SVG-Pixel (y nach unten). */
export interface Projection {
  toPx: (p: Vector2) => { x: number; y: number }
  /** Pixel pro Einheit (NM oder kn) */
  scale: number
}

export function makeProjection(origin: { x: number; y: number }, scale: number, center: Vector2 = { x: 0, y: 0 }): Projection {
  return {
    scale,
    toPx: (p) => ({ x: origin.x + (p.x - center.x) * scale, y: origin.y - (p.y - center.y) * scale }),
  }
}

interface VectorArrowProps {
  from: { x: number; y: number }
  to: { x: number; y: number }
  color: string
  /** Anzahl der Pfeilspitzen in der Linienmitte (RYA: Water Track 1, Ground Track 2, Strom 3) */
  chevrons?: 0 | 1 | 2 | 3
  dashed?: boolean
  width?: number
  head?: boolean
  label?: string
  labelOffset?: number
  /** Position des Labels entlang der Linie (0 = Anfang, 1 = Spitze) */
  labelAt?: number
}

/** Zeichnet einen Vektor mit Pfeilspitze und optionalen RYA-Markierungspfeilen. */
export function VectorArrow({ from, to, color, chevrons = 0, dashed, width = 3, head = true, label, labelOffset = 14, labelAt = 0.5 }: VectorArrowProps) {
  const dx = to.x - from.x
  const dy = to.y - from.y
  const len = Math.hypot(dx, dy)
  if (len < 1) return null
  const ux = dx / len
  const uy = dy / len
  const nx = -uy
  const ny = ux
  const headLen = Math.min(12, len * 0.4)
  const headW = headLen * 0.5
  const lineEnd = head ? { x: to.x - ux * headLen * 0.8, y: to.y - uy * headLen * 0.8 } : to

  const chevronEls = []
  const cLen = 7
  for (let i = 0; i < chevrons; i++) {
    const t = 0.5 + (i - (chevrons - 1) / 2) * (12 / len)
    const cx = from.x + dx * t
    const cy = from.y + dy * t
    chevronEls.push(
      <polyline
        key={i}
        points={`${cx - ux * cLen + nx * cLen * 0.7},${cy - uy * cLen + ny * cLen * 0.7} ${cx},${cy} ${cx - ux * cLen - nx * cLen * 0.7},${cy - uy * cLen - ny * cLen * 0.7}`}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />,
    )
  }

  // Label seitlich der Linie; Textanker zeigt von der Linie weg, damit er sie nicht überdeckt
  const mid = { x: from.x + dx * labelAt, y: from.y + dy * labelAt }
  const side = nx > 0 || (nx === 0 && ny < 0) ? 1 : -1
  const ox = nx * labelOffset * side
  const oy = ny * labelOffset * side
  const labelPos = { x: mid.x + ox, y: mid.y + oy }
  const anchor = ox > 4 ? 'start' : ox < -4 ? 'end' : 'middle'

  return (
    <g>
      <line
        x1={from.x}
        y1={from.y}
        x2={lineEnd.x}
        y2={lineEnd.y}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        strokeDasharray={dashed ? '7 6' : undefined}
      />
      {head && (
        <polygon
          points={`${to.x},${to.y} ${to.x - ux * headLen + nx * headW},${to.y - uy * headLen + ny * headW} ${to.x - ux * headLen - nx * headW},${to.y - uy * headLen - ny * headW}`}
          fill={color}
        />
      )}
      {chevronEls}
      {label && (
        <text
          x={labelPos.x}
          y={labelPos.y}
          fill={color}
          fontSize={12}
          fontWeight={600}
          textAnchor={anchor}
          dominantBaseline="middle"
          className="select-none"
          style={{ paintOrder: 'stroke', stroke: 'var(--card)', strokeWidth: 4 }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** Draufsicht Segelboot, Bug zeigt in Richtung `heading`. Größe in Pixel (nicht maßstäblich). */
export function BoatIcon({ x, y, heading, size = 34 }: { x: number; y: number; heading: number; size?: number }) {
  const s = size / 34
  return (
    <g transform={`translate(${x} ${y}) rotate(${heading}) scale(${s})`}>
      <path
        d="M0,-17 C7,-9 8,2 6,15 L-6,15 C-8,2 -7,-9 0,-17 Z"
        fill="var(--card)"
        stroke="var(--foreground)"
        strokeWidth={1.6}
        strokeLinejoin="round"
      />
      <line x1={0} y1={-6} x2={0} y2={11} stroke="var(--foreground)" strokeWidth={1.4} />
      <circle cx={0} cy={-6} r={1.8} fill="var(--foreground)" />
      <rect x={-3} y={9} width={6} height={4} rx={1} fill="var(--muted-foreground)" />
    </g>
  )
}

/** Kleine Nordpfeil-Rose */
export function NorthArrow({ x, y, size = 22 }: { x: number; y: number; size?: number }) {
  return (
    <g transform={`translate(${x} ${y})`} aria-label="Nordpfeil">
      <circle r={size} fill="var(--card)" stroke="var(--border)" />
      <path d={`M0,${-size + 4} L5,0 L0,-3 L-5,0 Z`} fill="var(--destructive)" />
      <path d={`M0,${size - 4} L5,0 L0,3 L-5,0 Z`} fill="var(--muted-foreground)" />
      <text y={-size - 6} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)">
        N
      </text>
    </g>
  )
}

/**
 * Kreisbogen zwischen zwei nautischen Richtungen um einen Punkt (für den Leeway-Winkel).
 */
export function AngleArc({
  cx,
  cy,
  r,
  fromDeg,
  toDeg,
  color,
  label,
}: {
  cx: number
  cy: number
  r: number
  fromDeg: number
  toDeg: number
  color: string
  label?: string
}) {
  let delta = ((toDeg - fromDeg + 540) % 360) - 180
  if (Math.abs(delta) < 0.5) return null
  const pt = (deg: number) => {
    const rad = (deg * Math.PI) / 180
    return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) }
  }
  const a = pt(fromDeg)
  const b = pt(fromDeg + delta)
  const sweep = delta > 0 ? 1 : 0
  const m = pt(fromDeg + delta / 2)
  const lm = { x: cx + (m.x - cx) * 1.35, y: cy + (m.y - cy) * 1.35 }
  delta = Math.abs(delta)
  return (
    <g>
      <path d={`M${a.x},${a.y} A${r},${r} 0 0 ${sweep} ${b.x},${b.y}`} fill="none" stroke={color} strokeWidth={2.5} />
      {label && (
        <text
          x={lm.x}
          y={lm.y}
          fill={color}
          fontSize={11}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="middle"
          style={{ paintOrder: 'stroke', stroke: 'var(--card)', strokeWidth: 4 }}
        >
          {label}
        </text>
      )}
    </g>
  )
}

/** Wählt eine „schöne" Gitter-/Maßstabsweite (1, 2, 5 × 10^n), sodass ca. `target` Einheiten in `span` passen. */
export function niceStep(span: number, target = 5): number {
  if (!(span > 0)) return 1
  const raw = span / target
  const pow = 10 ** Math.floor(Math.log10(raw))
  const n = raw / pow
  const nice = n < 1.5 ? 1 : n < 3.5 ? 2 : n < 7.5 ? 5 : 10
  return nice * pow
}

export const VEC_COLORS = {
  heading: 'var(--vec-heading)',
  water: 'var(--vec-water)',
  tide: 'var(--vec-tide)',
  ground: 'var(--vec-ground)',
  leeway: 'var(--vec-leeway)',
} as const
