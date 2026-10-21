import type { ReactNode } from 'react'
import type { MarkKind } from '@/data/chartArea'
import type { FeatureKind } from '@/data/chartFeatures'

/**
 * Kartenfarben und Symbole im Stil amtlicher Papierseekarten. Die Symbole folgen sinngemäß den Kartenzeichen der IHO
 * (INT 1, Abschnitte J–Q), vereinfacht für die Bildschirmdarstellung. Alle Maße in Pixeln × k (Kartenminuten je Pixel).
 */
export const CHART_COLORS = {
  deep: '#F8FAF9',
  shallow: '#DCEFF2',
  veryShallow: '#B9E0E8',
  /** trockenfallende Flächen (Watt, Felsen): übliches Grün-Oliv amtlicher Karten */
  drying: '#CBD9B4',
  land: '#F2E4BF',
  builtUp: '#E4CF98',
  coast: '#555B58',
  contour: '#6DABB9',
  magenta: '#BD458A',
  label: '#303D47',
  grid: '#8E9AA0',
  buoyRed: '#C23B32',
  buoyGreen: '#2F8048',
  buoyYellow: '#E5C02E',
  black: '#1F2528',
} as const

const C = CHART_COLORS
const thin = { vectorEffect: 'non-scaling-stroke' as const }

/** Positionskreis am Fuß von Tonnen und Baken (INT 1 Q 1) */
const PosCircle = ({ x, y, u }: { x: number; y: number; u: number }) => (
  <circle cx={x} cy={y} r={u * 0.28} fill={C.deep} stroke={C.black} strokeWidth={0.9} {...thin} />
)

/** Feuerflagge (INT 1 P 1): magentafarbener Tropfen, schräg vom Standort weg */
export function LightFlare({ x, y, u, angle = 135 }: { x: number; y: number; u: number; angle?: number }) {
  const L = u * 2.1
  const w = u * 0.55
  return (
    <path
      d={`M0,0 C${w},${-L * 0.35} ${w * 0.9},${-L * 0.85} 0,${-L} C${-w * 0.9},${-L * 0.85} ${-w},${-L * 0.35} 0,0 Z`}
      transform={`translate(${x},${y}) rotate(${angle - 180})`}
      fill={C.magenta}
      fillOpacity={0.9}
    />
  )
}

/** Tonnenkörper, leicht geneigt wie in der Karte; Fuß auf der Position */
function BuoyBody({ x, y, u, shape, bands, children }: { x: number; y: number; u: number; shape: 'can' | 'cone' | 'pillar' | 'sphere'; bands: string[]; children?: ReactNode }) {
  const id = `b${Math.round(x * 1e4)}_${Math.round(y * 1e4)}`
  let outline: string
  switch (shape) {
    case 'can':
      outline = `M${-u * 0.55},0 L${u * 0.55},0 L${u * 0.55},${-u * 1.1} L${-u * 0.55},${-u * 1.1} Z`
      break
    case 'cone':
      outline = `M${-u * 0.6},0 L${u * 0.6},0 L0,${-u * 1.3} Z`
      break
    case 'pillar':
      outline = `M${-u * 0.55},0 L${u * 0.55},0 L${u * 0.22},${-u * 1.8} L${-u * 0.22},${-u * 1.8} Z`
      break
    case 'sphere':
      outline = `M${-u * 0.6},${-u * 0.6} A${u * 0.6},${u * 0.6} 0 1 1 ${u * 0.6},${-u * 0.6} A${u * 0.6},${u * 0.6} 0 1 1 ${-u * 0.6},${-u * 0.6} Z`
      break
  }
  const h = shape === 'pillar' ? u * 1.8 : shape === 'cone' ? u * 1.3 : u * 1.2
  return (
    <g transform={`translate(${x},${y}) rotate(18)`}>
      <clipPath id={id}>
        <path d={outline} />
      </clipPath>
      <g clipPath={`url(#${id})`}>
        {shape === 'sphere'
          ? bands.map((c, i) => <rect key={i} x={-u * 0.6 + (i * u * 1.2) / bands.length} y={-u * 1.25} width={(u * 1.2) / bands.length + 0.0001} height={u * 1.3} fill={c} />)
          : bands.map((c, i) => <rect key={i} x={-u} y={-h + (i * h) / bands.length} width={u * 2} height={h / bands.length + 0.0001} fill={c} />)}
      </g>
      <path d={outline} fill="none" stroke={C.black} strokeWidth={0.9} {...thin} />
      {children}
    </g>
  )
}

/** Toppzeichen der Kardinalzeichen: zwei schwarze Kegel (Spitzen nach N oben, S unten, O auseinander, W zueinander) */
function CardinalTopmark({ u, top, dir }: { u: number; top: number; dir: 'n' | 'e' | 's' | 'w' }) {
  const cone = (base: number, up: boolean) => {
    const tip = up ? base - u * 0.55 : base + u * 0.55
    return `M${-u * 0.35},${base} L${u * 0.35},${base} L0,${tip} Z`
  }
  const y1 = -top - u * 0.15
  const parts =
    dir === 'n'
      ? [cone(y1 - u * 0.05, true), cone(y1 - u * 0.65, true)]
      : dir === 's'
        ? [cone(y1 - u * 0.6, false), cone(y1 - u * 1.2, false)]
        : dir === 'e'
          ? [cone(y1 - u * 0.62, true), cone(y1 - u * 0.62, false)]
          : [cone(y1 - u * 0.05, true), cone(y1 - u * 1.2, false)]
  return (
    <g>
      <line x1={0} y1={-top} x2={0} y2={y1 - u * 0.1} stroke={C.black} strokeWidth={0.9} {...thin} />
      {parts.map((d, i) => (
        <path key={i} d={d} fill={C.black} />
      ))}
    </g>
  )
}

const CARDINAL_BANDS: Record<'n' | 'e' | 's' | 'w', string[]> = {
  n: [C.black, C.buoyYellow], // BY
  s: [C.buoyYellow, C.black], // YB
  e: [C.black, C.buoyYellow, C.black], // BYB
  w: [C.buoyYellow, C.black, C.buoyYellow], // YBY
}

export function CardinalBuoy({ x, y, u, dir, lit = true }: { x: number; y: number; u: number; dir: 'n' | 'e' | 's' | 'w'; lit?: boolean }) {
  return (
    <g>
      {lit && <LightFlare x={x} y={y} u={u} />}
      <BuoyBody x={x} y={y} u={u} shape="pillar" bands={CARDINAL_BANDS[dir]}>
        <CardinalTopmark u={u} top={u * 1.8} dir={dir} />
      </BuoyBody>
      <PosCircle x={x} y={y} u={u} />
    </g>
  )
}

export function LateralBuoy({ x, y, u, side }: { x: number; y: number; u: number; side: 'port' | 'stbd' }) {
  return (
    <g>
      <LightFlare x={x} y={y} u={u} />
      <BuoyBody x={x} y={y} u={u} shape={side === 'port' ? 'can' : 'cone'} bands={[side === 'port' ? C.buoyRed : C.buoyGreen]} />
      <PosCircle x={x} y={y} u={u} />
    </g>
  )
}

/** Ansteuerungstonne (Mitte des Fahrwassers): rot-weiß senkrecht gestreift, Toppzeichen roter Ball */
export function SafeWaterBuoy({ x, y, u }: { x: number; y: number; u: number }) {
  return (
    <g>
      <LightFlare x={x} y={y} u={u} />
      <BuoyBody x={x} y={y} u={u} shape="sphere" bands={[C.buoyRed, '#fff', C.buoyRed, '#fff']}>
        <line x1={0} y1={-u * 1.2} x2={0} y2={-u * 1.5} stroke={C.black} strokeWidth={0.9} {...thin} />
        <circle cx={0} cy={-u * 1.75} r={u * 0.28} fill={C.buoyRed} stroke={C.black} strokeWidth={0.6} {...thin} />
      </BuoyBody>
      <PosCircle x={x} y={y} u={u} />
    </g>
  )
}

/** Molenfeuer: Positionspunkt mit Feuerflagge (INT 1 P 1) */
export const MinorLight = ({ x, y, u }: { x: number; y: number; u: number }) => (
  <g>
    <LightFlare x={x} y={y} u={u * 0.9} />
    <circle cx={x} cy={y} r={u * 0.2} fill={C.black} />
  </g>
)

/** Gefahrenlinie (gepunktet, INT 1 K 1) um ein Symbol */
const DangerRing = ({ x, y, r }: { x: number; y: number; r: number }) => (
  <ellipse cx={x} cy={y} rx={r * 1.25} ry={r} fill="#fff" fillOpacity={0.5} stroke={C.black} strokeWidth={1} strokeDasharray="1.2 2.4" strokeLinecap="round" {...thin} />
)

/** Wrack: gefährlich, Tiefe unbekannt (INT 1 K 29) bzw. für die Überwasserschifffahrt ungefährlich (K 30) */
export function Wreck({ x, y, u, dangerous }: { x: number; y: number; u: number; dangerous: boolean }) {
  return (
    <g>
      {dangerous && <DangerRing x={x} y={y} r={u * 0.9} />}
      <g stroke={C.black} strokeWidth={1.1} {...thin}>
        <line x1={x - u * 0.9} y1={y} x2={x + u * 0.9} y2={y} {...thin} />
        {[-0.45, 0, 0.45].map((d) => (
          <line key={d} x1={x + u * d} y1={y - u * 0.35} x2={x + u * d} y2={y + u * 0.35} {...thin} />
        ))}
      </g>
    </g>
  )
}

/** Unterwasserfels, Tiefe unbekannt, gefährlich (INT 1 K 13) */
export function UnderwaterRock({ x, y, u }: { x: number; y: number; u: number }) {
  return (
    <g>
      <DangerRing x={x} y={y} r={u * 0.7} />
      <g stroke={C.black} strokeWidth={1.1} {...thin}>
        <line x1={x - u * 0.45} y1={y} x2={x + u * 0.45} y2={y} {...thin} />
        <line x1={x} y1={y - u * 0.45} x2={x} y2={y + u * 0.45} {...thin} />
      </g>
    </g>
  )
}

/** Fels, der trockenfällt (INT 1 K 11) */
export function DryingRock({ x, y, u }: { x: number; y: number; u: number }) {
  const r = u * 0.55
  return (
    <g stroke={C.black} strokeWidth={1.2} strokeLinecap="round" {...thin}>
      <line x1={x - r} y1={y} x2={x + r} y2={y} {...thin} />
      <line x1={x} y1={y - r} x2={x} y2={y + r} {...thin} />
      <line x1={x - r * 0.7} y1={y - r * 0.7} x2={x + r * 0.7} y2={y + r * 0.7} {...thin} />
      <line x1={x - r * 0.7} y1={y + r * 0.7} x2={x + r * 0.7} y2={y - r * 0.7} {...thin} />
    </g>
  )
}

/** Ankerplatz (INT 1 N 10), magenta */
export function Anchor({ x, y, u, color = C.magenta }: { x: number; y: number; u: number; color?: string }) {
  return (
    <g stroke={color} strokeWidth={1.3} fill="none" strokeLinecap="round" {...thin}>
      <circle cx={x} cy={y - u * 0.75} r={u * 0.2} {...thin} />
      <line x1={x} y1={y - u * 0.55} x2={x} y2={y + u * 0.7} {...thin} />
      <line x1={x - u * 0.35} y1={y - u * 0.3} x2={x + u * 0.35} y2={y - u * 0.3} {...thin} />
      <path d={`M${x - u * 0.6},${y + u * 0.2} Q${x - u * 0.5},${y + u * 0.75} ${x},${y + u * 0.7} Q${x + u * 0.5},${y + u * 0.75} ${x + u * 0.6},${y + u * 0.2}`} {...thin} />
    </g>
  )
}

/** Sportboothafen (INT 1 U 1.1), magenta */
export function YachtHarbour({ x, y, u }: { x: number; y: number; u: number }) {
  return (
    <g fill="none" stroke={C.magenta} strokeWidth={1.3} strokeLinejoin="round" {...thin}>
      <path d={`M${x - u * 0.1},${y - u * 1.1} L${x - u * 0.1},${y + u * 0.15} L${x - u * 0.8},${y + u * 0.15} Z`} {...thin} />
      <path d={`M${x + u * 0.05},${y - u * 0.9} L${x + u * 0.05},${y + u * 0.15} L${x + u * 0.6},${y + u * 0.15} Z`} {...thin} />
      <path d={`M${x - u * 0.9},${y + u * 0.35} L${x + u * 0.8},${y + u * 0.35} L${x + u * 0.5},${y + u * 0.7} L${x - u * 0.6},${y + u * 0.7} Z`} {...thin} />
    </g>
  )
}

/** Symbole der Aufgabenobjekte (MARKS) */
export function MarkGlyph({ kind, x, y, u }: { kind: MarkKind; x: number; y: number; u: number }) {
  switch (kind) {
    case 'lighthouse':
      // Leuchtfeuer an Land: Stern mit Feuerflagge (INT 1 P 1, E 10)
      return (
        <g>
          <LightFlare x={x} y={y} u={u * 1.3} />
          <path d={starPath(x, y, u * 0.75, u * 0.3)} fill={C.black} />
          <circle cx={x} cy={y} r={u * 0.14} fill={C.deep} />
        </g>
      )
    case 'church':
      // Kirche (INT 1 E 10.1)
      return (
        <g stroke={C.black} strokeWidth={1.2} {...thin}>
          <circle cx={x} cy={y} r={u * 0.22} fill={C.black} />
          <line x1={x} y1={y - u * 1.1} x2={x} y2={y - u * 0.2} {...thin} />
          <line x1={x - u * 0.38} y1={y - u * 0.75} x2={x + u * 0.38} y2={y - u * 0.75} {...thin} />
        </g>
      )
    case 'mast':
      // Funkmast (INT 1 E 28) mit Hindernisfeuer
      return (
        <g>
          <LightFlare x={x} y={y} u={u} angle={120} />
          <path d={`M${x - u * 0.45},${y} L${x},${y - u * 1.8} L${x + u * 0.45},${y}`} fill="none" stroke={C.black} strokeWidth={1.2} {...thin} />
          <circle cx={x} cy={y} r={u * 0.18} fill={C.black} />
        </g>
      )
    case 'daymark':
      // Bake / Tagesmarke (INT 1 Q 80)
      return (
        <g>
          <line x1={x} y1={y} x2={x} y2={y - u * 1.6} stroke={C.black} strokeWidth={1.2} {...thin} />
          <path d={`M${x - u * 0.4},${y - u * 1.2} L${x + u * 0.4},${y - u * 1.2} L${x},${y - u * 1.9} Z`} fill={C.black} />
          <PosCircle x={x} y={y} u={u} />
        </g>
      )
    case 'harbour':
      return <YachtHarbour x={x} y={y} u={u} />
    case 'buoy-north':
      return <CardinalBuoy x={x} y={y} u={u} dir="n" />
    case 'buoy-south':
      return <CardinalBuoy x={x} y={y} u={u} dir="s" />
    case 'buoy-safe':
      return <SafeWaterBuoy x={x} y={y} u={u} />
    case 'danger':
      return <DryingRock x={x} y={y} u={u} />
  }
}

export function FeatureGlyph({ kind, x, y, u }: { kind: FeatureKind; x: number; y: number; u: number }) {
  switch (kind) {
    case 'lateral-port':
      return <LateralBuoy x={x} y={y} u={u} side="port" />
    case 'lateral-stbd':
      return <LateralBuoy x={x} y={y} u={u} side="stbd" />
    case 'cardinal-n':
      return <CardinalBuoy x={x} y={y} u={u} dir="n" />
    case 'cardinal-e':
      return <CardinalBuoy x={x} y={y} u={u} dir="e" />
    case 'cardinal-s':
      return <CardinalBuoy x={x} y={y} u={u} dir="s" />
    case 'cardinal-w':
      return <CardinalBuoy x={x} y={y} u={u} dir="w" />
    case 'pierhead-light':
      return <MinorLight x={x} y={y} u={u} />
    case 'wreck-dangerous':
      return <Wreck x={x} y={y} u={u} dangerous />
    case 'wreck':
      return <Wreck x={x} y={y} u={u} dangerous={false} />
    case 'rock-underwater':
      return <UnderwaterRock x={x} y={y} u={u} />
    case 'anchorage':
      return <Anchor x={x} y={y} u={u * 1.1} />
  }
}

function starPath(x: number, y: number, R: number, r: number): string {
  const pts: string[] = []
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5
    const rad = i % 2 ? r : R
    pts.push(`${x + Math.sin(a) * rad},${y - Math.cos(a) * rad}`)
  }
  return 'M' + pts.join('L') + 'Z'
}
