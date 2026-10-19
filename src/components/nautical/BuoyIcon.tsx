import { useId } from 'react'
import type { BuoyId } from '@/types/learning'

type Shape = 'can' | 'cone' | 'pillar' | 'sphere'
type Topmark = 'cylinder' | 'cone-up' | 'cones-up' | 'cones-down' | 'cones-base' | 'cones-point' | 'spheres2' | 'sphere1' | 'x' | 'cross' | 'none'

const BLACK = '#1b1b1f'
const YELLOW = '#facc15'
const RED = '#e5322d'
const GREEN = '#1faa59'
const WHITE = '#f8fafc'
const BLUE = '#2563eb'

interface Spec {
  shape: Shape
  /** horizontale Bänder von oben nach unten: [Farbe, Anteil] */
  bands?: [string, number][]
  /** senkrechte Streifen */
  stripes?: [string, string]
  topmark: Topmark
  topColor: string
}

const SPECS: Record<BuoyId, Spec> = {
  port: { shape: 'can', bands: [[RED, 1]], topmark: 'cylinder', topColor: RED },
  starboard: { shape: 'cone', bands: [[GREEN, 1]], topmark: 'cone-up', topColor: GREEN },
  'pref-stbd': { shape: 'can', bands: [[RED, 0.36], [GREEN, 0.28], [RED, 0.36]], topmark: 'cylinder', topColor: RED },
  'pref-port': { shape: 'cone', bands: [[GREEN, 0.36], [RED, 0.28], [GREEN, 0.36]], topmark: 'cone-up', topColor: GREEN },
  north: { shape: 'pillar', bands: [[BLACK, 0.5], [YELLOW, 0.5]], topmark: 'cones-up', topColor: BLACK },
  east: { shape: 'pillar', bands: [[BLACK, 0.34], [YELLOW, 0.32], [BLACK, 0.34]], topmark: 'cones-base', topColor: BLACK },
  south: { shape: 'pillar', bands: [[YELLOW, 0.5], [BLACK, 0.5]], topmark: 'cones-down', topColor: BLACK },
  west: { shape: 'pillar', bands: [[YELLOW, 0.34], [BLACK, 0.32], [YELLOW, 0.34]], topmark: 'cones-point', topColor: BLACK },
  isolated: { shape: 'pillar', bands: [[BLACK, 0.34], [RED, 0.32], [BLACK, 0.34]], topmark: 'spheres2', topColor: BLACK },
  safe: { shape: 'sphere', stripes: [RED, WHITE], topmark: 'sphere1', topColor: RED },
  special: { shape: 'can', bands: [[YELLOW, 1]], topmark: 'x', topColor: YELLOW },
  'new-danger': { shape: 'pillar', stripes: [BLUE, YELLOW], topmark: 'cross', topColor: YELLOW },
}

const BODY: Record<Shape, { top: number; bottom: number; path: string }> = {
  can: { top: 70, bottom: 125, path: 'M30,125 L30,76 Q30,70 36,70 L64,70 Q70,70 70,76 L70,125 Z' },
  cone: { top: 62, bottom: 125, path: 'M50,62 L74,125 L26,125 Z' },
  pillar: { top: 60, bottom: 125, path: 'M40,125 L40,66 Q40,60 46,60 L54,60 Q60,60 60,66 L60,125 Z' },
  sphere: { top: 68, bottom: 124, path: 'M50,68 A28,28 0 1,1 49.99,68 Z' },
}

const Cone = ({ x, y, up, h = 15, w = 22, fill }: { x: number; y: number; up: boolean; h?: number; w?: number; fill: string }) => (
  // y = Basislinie, Spitze zeigt nach oben (up) bzw. unten
  <polygon points={up ? `${x - w / 2},${y} ${x + w / 2},${y} ${x},${y - h}` : `${x - w / 2},${y} ${x + w / 2},${y} ${x},${y + h}`} fill={fill} stroke="#000" strokeOpacity={0.25} strokeWidth={0.8} />
)

function Topmark({ kind, base, color }: { kind: Topmark; base: number; color: string }) {
  const x = 50
  switch (kind) {
    case 'cylinder':
      return <rect x={x - 7} y={base - 18} width={14} height={18} fill={color} stroke="#000" strokeOpacity={0.25} />
    case 'cone-up':
      return <Cone x={x} y={base} up h={20} w={20} fill={color} />
    case 'cones-up':
      return (
        <>
          <Cone x={x} y={base - 1} up fill={color} />
          <Cone x={x} y={base - 18} up fill={color} />
        </>
      )
    case 'cones-down':
      return (
        <>
          <Cone x={x} y={base - 17} up={false} fill={color} />
          <Cone x={x} y={base - 34} up={false} fill={color} />
        </>
      )
    case 'cones-base':
      // Basis an Basis: unterer Kegel zeigt nach unten, oberer nach oben
      return (
        <>
          <Cone x={x} y={base - 17} up={false} fill={color} />
          <Cone x={x} y={base - 17} up fill={color} />
        </>
      )
    case 'cones-point':
      // Spitze an Spitze: oberer Kegel zeigt nach unten, unterer nach oben
      return (
        <>
          <Cone x={x} y={base - 1} up fill={color} />
          <Cone x={x} y={base - 31} up={false} fill={color} />
        </>
      )
    case 'spheres2':
      return (
        <>
          <circle cx={x} cy={base - 8} r={8} fill={color} />
          <circle cx={x} cy={base - 26} r={8} fill={color} />
        </>
      )
    case 'sphere1':
      return <circle cx={x} cy={base - 9} r={9} fill={color} stroke="#000" strokeOpacity={0.25} />
    case 'x':
      return (
        <g stroke={color} strokeWidth={5} strokeLinecap="round">
          <line x1={x - 9} y1={base - 20} x2={x + 9} y2={base - 2} />
          <line x1={x + 9} y1={base - 20} x2={x - 9} y2={base - 2} />
        </g>
      )
    case 'cross':
      return (
        <g stroke={color} strokeWidth={5} strokeLinecap="round">
          <line x1={x} y1={base - 22} x2={x} y2={base - 1} />
          <line x1={x - 10} y1={base - 14} x2={x + 10} y2={base - 14} />
        </g>
      )
    default:
      return null
  }
}

export function topmarkHeight(kind: Topmark): number {
  return { cylinder: 18, 'cone-up': 20, 'cones-up': 34, 'cones-down': 34, 'cones-base': 34, 'cones-point': 34, spheres2: 34, sphere1: 18, x: 20, cross: 22, none: 0 }[kind]
}

interface BuoyIconProps {
  id: BuoyId
  className?: string
  /** Licht zeichnen: Farbe (CSS) und Zustand an/aus */
  light?: { color: string; on: boolean }
  title?: string
}

export function BuoyIcon({ id, className, light, title }: BuoyIconProps) {
  const spec = SPECS[id]
  const body = BODY[spec.shape]
  const uid = useId().replace(/:/g, '')
  const h = body.bottom - body.top
  const sparTop = body.top - 12
  const lightY = sparTop - topmarkHeight(spec.topmark) - 9

  return (
    <svg viewBox="0 0 100 150" className={className} role="img" aria-label={title ?? `Tonne: ${id}`}>
      <defs>
        <clipPath id={`clip-${uid}`}>
          <path d={BODY[spec.shape].path} />
        </clipPath>
      </defs>
      <rect x={0} y={118} width={100} height={32} fill="var(--chart-water)" />
      {/* Spiere + Toppzeichen */}
      <line x1={50} y1={body.top} x2={50} y2={sparTop} stroke="#555" strokeWidth={3} />
      <Topmark kind={spec.topmark} base={sparTop} color={spec.topColor} />
      {/* Körper */}
      <g clipPath={`url(#clip-${uid})`}>
        {spec.bands?.reduce<{ el: React.ReactNode[]; y: number }>(
          (acc, [color, frac], i) => {
            const bh = h * frac
            acc.el.push(<rect key={i} x={0} y={acc.y} width={100} height={bh + 0.5} fill={color} />)
            acc.y += bh
            return acc
          },
          { el: [], y: body.top },
        ).el}
        {spec.stripes &&
          Array.from({ length: 8 }, (_, i) => <rect key={i} x={22 + i * 7} y={body.top} width={7.2} height={h} fill={spec.stripes![i % 2]} />)}
      </g>
      <path d={body.path} fill="none" stroke="#000" strokeOpacity={0.35} strokeWidth={1.2} />
      {/* Wellen */}
      <path d="M0,124 q8,-6 16,0 t16,0 t16,0 t16,0 t16,0 t16,0 t16,0" fill="none" stroke="var(--vec-tide)" strokeWidth={2} opacity={0.7} />
      {light && (
        <g>
          {light.on && <circle cx={50} cy={lightY} r={11} fill={light.color} opacity={0.35} />}
          <circle cx={50} cy={lightY} r={5} fill={light.on ? light.color : '#6b7280'} stroke="#000" strokeOpacity={0.4} strokeWidth={0.8} />
        </g>
      )}
    </svg>
  )
}
