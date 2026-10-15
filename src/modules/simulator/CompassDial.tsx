import { formatBearing } from '@/calculations'
import { VEC_COLORS } from '@/components/nautical/svg'

interface Needle {
  label: string
  deg: number | null
  color: string
  length: number
  dashed?: boolean
}

const R = 110
const C = 130

const pt = (deg: number, r: number) => {
  const rad = (deg * Math.PI) / 180
  return { x: C + r * Math.sin(rad), y: C - r * Math.cos(rad) }
}

/** Kompassrose mit Richtungsnadeln für Heading, Water Track, COG und Stromrichtung. */
export function CompassDial({
  heading,
  waterTrack,
  cog,
  tideDirection,
  showTide,
}: {
  heading: number
  waterTrack: number
  cog: number | null
  tideDirection: number
  showTide: boolean
}) {
  const needles: Needle[] = [
    { label: 'HDG', deg: heading, color: VEC_COLORS.heading, length: R - 8, dashed: true },
    { label: 'WT', deg: waterTrack, color: VEC_COLORS.water, length: R - 22 },
    ...(showTide ? [{ label: 'Set', deg: tideDirection, color: VEC_COLORS.tide, length: R - 50 }] : []),
    { label: 'COG', deg: cog, color: VEC_COLORS.ground, length: R - 4 },
  ]

  const ticks = []
  for (let d = 0; d < 360; d += 10) {
    const major = d % 30 === 0
    const a = pt(d, R)
    const b = pt(d, R - (major ? 10 : 5))
    ticks.push(<line key={d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="var(--muted-foreground)" strokeWidth={major ? 1.5 : 1} />)
    if (major) {
      const t = pt(d, R + 12)
      ticks.push(
        <text key={`t${d}`} x={t.x} y={t.y} fontSize={9} textAnchor="middle" dominantBaseline="middle" fill="var(--muted-foreground)">
          {d === 0 ? 'N' : d === 90 ? 'E' : d === 180 ? 'S' : d === 270 ? 'W' : String(d).padStart(3, '0')}
        </text>,
      )
    }
  }

  return (
    <svg viewBox="0 0 260 260" className="mx-auto h-auto w-full max-w-[260px]" role="img" aria-label="Kompassrose mit Kursnadeln">
      <circle cx={C} cy={C} r={R} fill="var(--chart-sea)" stroke="var(--border)" strokeWidth={2} />
      {ticks}
      {needles.map((n) => {
        if (n.deg === null) return null
        const tip = pt(n.deg, n.length)
        const lab = pt(n.deg, n.length - 16)
        return (
          <g key={n.label}>
            <line
              x1={C}
              y1={C}
              x2={tip.x}
              y2={tip.y}
              stroke={n.color}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={n.dashed ? '5 4' : undefined}
            />
            <circle cx={tip.x} cy={tip.y} r={4} fill={n.color} />
            <text
              x={lab.x}
              y={lab.y}
              fontSize={9}
              fontWeight={700}
              textAnchor="middle"
              dominantBaseline="middle"
              fill={n.color}
              style={{ paintOrder: 'stroke', stroke: 'var(--chart-sea)', strokeWidth: 3 }}
            >
              {n.label}
            </text>
          </g>
        )
      })}
      <circle cx={C} cy={C} r={5} fill="var(--foreground)" />
      <text x={C} y={C + 24} fontSize={11} textAnchor="middle" fill="var(--foreground)" fontWeight={600}>
        COG {formatBearing(cog)}
      </text>
    </svg>
  )
}
