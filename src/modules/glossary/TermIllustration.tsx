import type { ReactNode } from 'react'
import type { TermId } from '@/types/learning'
import { computeVelocityTriangle } from '@/calculations'
import { AngleArc, BoatIcon, VectorArrow, VEC_COLORS } from '@/components/nautical/svg'

const W = 280
const H = 200

/** Vektoren aus dem Rechenkern werden für die Illustration in Pixel umgerechnet (y nach unten). */
const px = (o: { x: number; y: number }, v: { x: number; y: number }, s: number) => ({ x: o.x + v.x * s, y: o.y - v.y * s })

function Frame({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={label}>
      <rect width={W} height={H} rx={12} fill="var(--chart-sea)" />
      {children}
    </svg>
  )
}

function North({ x = W - 22, y = 26 }: { x?: number; y?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1={0} y1={10} x2={0} y2={-10} stroke="var(--muted-foreground)" strokeWidth={1.5} />
      <path d="M0,-14 L4,-6 L-4,-6 Z" fill="var(--muted-foreground)" />
      <text y={22} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
        N
      </text>
    </g>
  )
}

function Fix({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={7} fill="none" stroke="var(--foreground)" strokeWidth={2} />
      <circle cx={x} cy={y} r={1.8} fill="var(--foreground)" />
      {label && (
        <text x={x - 10} y={y + 18} fontSize={10} textAnchor="end" fill="var(--foreground)" fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  )
}

function EPSymbol({ x, y, label }: { x: number; y: number; label?: string }) {
  return (
    <g>
      <polygon points={`${x},${y - 9} ${x + 8},${y + 6} ${x - 8},${y + 6}`} fill="none" stroke="var(--foreground)" strokeWidth={2} />
      <circle cx={x} cy={y + 1} r={1.8} fill="var(--foreground)" />
      {label && (
        <text x={x + 12} y={y + 4} fontSize={10} fill="var(--foreground)" fontWeight={600}>
          {label}
        </text>
      )}
    </g>
  )
}

/** Standard-Stromdreieck HDG 000°, 5 kn, Strom 090° 2 kn als Basis für mehrere Illustrationen */
function Triangle({ highlight }: { highlight: 'cog' | 'sog' | 'ground' }) {
  const tri = computeVelocityTriangle({ heading: 0, stw: 5, tideDirection: 90, tideRate: 2, leeway: 0 })
  const o = { x: 100, y: 180 }
  const s = 30
  const w = px(o, tri.waterVelocity, s)
  const g = px(o, tri.groundVelocity, s)
  const dim = (k: typeof highlight) => (highlight === k ? 1 : 0.9)
  return (
    <>
      <VectorArrow from={o} to={w} color={VEC_COLORS.water} chevrons={1} head={false} label="5 kn" labelOffset={-16} width={2.5} />
      <VectorArrow from={w} to={g} color={VEC_COLORS.tide} chevrons={3} head={false} label="2 kn" width={2.5} />
      <g opacity={dim('ground')}>
        <VectorArrow
          from={o}
          to={g}
          color={VEC_COLORS.ground}
          chevrons={2}
          width={highlight === 'ground' ? 5 : 3.5}
          label={highlight === 'sog' ? 'SOG 5,39 kn' : highlight === 'cog' ? '' : 'Ground Track'}
          labelOffset={22}
        />
      </g>
      {highlight === 'cog' && (
        <>
          <line x1={o.x} y1={o.y} x2={o.x} y2={20} stroke="var(--muted-foreground)" strokeDasharray="3 4" />
          <AngleArc cx={o.x} cy={o.y} r={70} fromDeg={0} toDeg={tri.cog!} color={VEC_COLORS.ground} label="COG 021,8°" />
        </>
      )}
      <BoatIcon x={o.x} y={o.y - 4} heading={0} size={22} />
    </>
  )
}

export function TermIllustration({ id }: { id: TermId }) {
  switch (id) {
    case 'hdg':
      return (
        <Frame label="Heading: Bugrichtung des Bootes">
          <North />
          <line x1={140} y1={110} x2={140} y2={20} stroke="var(--muted-foreground)" strokeDasharray="3 4" />
          <VectorArrow from={{ x: 140, y: 110 }} to={{ x: 140 + 85 * Math.sin(1.047), y: 110 - 85 * Math.cos(1.047) }} color={VEC_COLORS.heading} width={3.5} label="HDG 060°" labelOffset={18} />
          <AngleArc cx={140} cy={110} r={40} fromDeg={0} toDeg={60} color={VEC_COLORS.heading} />
          <BoatIcon x={140} y={110} heading={60} size={38} />
          <text x={16} y={186} fontSize={11} fill="var(--muted-foreground)">
            gemessen im Uhrzeigersinn von Nord
          </text>
        </Frame>
      )
    case 'stw':
      return (
        <Frame label="STW: Fahrt relativ zum Wasser">
          {[40, 80, 120, 160].map((y) => (
            <path key={y} d={`M10,${y} q15,-8 30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0 t30,0`} fill="none" stroke={VEC_COLORS.tide} strokeOpacity={0.35} strokeWidth={1.5} />
          ))}
          <BoatIcon x={80} y={100} heading={90} size={40} />
          <VectorArrow from={{ x: 104, y: 100 }} to={{ x: 230, y: 100 }} color={VEC_COLORS.water} width={4} chevrons={1} label="STW 5 kn (Log)" labelOffset={-18} />
          <text x={16} y={186} fontSize={11} fill="var(--muted-foreground)">
            Das Log misst nur das vorbeiströmende Wasser
          </text>
        </Frame>
      )
    case 'water-track':
    case 'leeway':
      return (
        <Frame label="Leeway: Winkel zwischen Heading und Water Track">
          <North />
          {/* Wind von links (West) */}
          {[60, 95, 130].map((y) => (
            <VectorArrow key={y} from={{ x: 14, y }} to={{ x: 54, y }} color="var(--muted-foreground)" width={1.5} />
          ))}
          <text x={14} y={48} fontSize={10} fill="var(--muted-foreground)">
            Wind
          </text>
          <VectorArrow from={{ x: 140, y: 175 }} to={{ x: 140, y: 30 }} color={VEC_COLORS.heading} dashed width={2.5} label="HDG 000°" labelOffset={-18} />
          <VectorArrow
            from={{ x: 140, y: 175 }}
            to={{ x: 140 + 145 * Math.sin(0.209), y: 175 - 145 * Math.cos(0.209) }}
            color={VEC_COLORS.water}
            chevrons={1}
            width={id === 'water-track' ? 4 : 2.5}
            label="Water Track 012°"
            labelOffset={20}
          />
          <AngleArc cx={140} cy={175} r={70} fromDeg={0} toDeg={12} color={VEC_COLORS.leeway} label="12°" />
          <BoatIcon x={140} y={150} heading={0} size={30} />
          <text x={W - 10} y={190} fontSize={10} textAnchor="end" fill="var(--muted-foreground)">
            Abdrift nach Lee (Steuerbord)
          </text>
        </Frame>
      )
    case 'cog':
      return (
        <Frame label="COG: Richtung der Bewegung über Grund">
          <North />
          <Triangle highlight="cog" />
        </Frame>
      )
    case 'sog':
      return (
        <Frame label="SOG: Betrag des Vektors über Grund">
          <North />
          <Triangle highlight="sog" />
        </Frame>
      )
    case 'ground-track':
      return (
        <Frame label="Ground Track zwischen Start und Ziel">
          <North />
          <Fix x={50} y={160} label="A" />
          <VectorArrow from={{ x: 50, y: 160 }} to={{ x: 220, y: 50 }} color={VEC_COLORS.ground} chevrons={2} width={3.5} label="Ground Track 057°, 8 NM" labelOffset={18} />
          <circle cx={226} cy={46} r={8} fill="none" stroke="var(--foreground)" strokeWidth={2} strokeDasharray="2 2" />
          <text x={232} y={70} fontSize={10} fill="var(--foreground)" fontWeight={600}>
            B
          </text>
          <text x={16} y={22} fontSize={10} fill="var(--muted-foreground)">
            RYA: zwei Pfeile &gt;&gt;
          </text>
        </Frame>
      )
    case 'fix':
      return (
        <Frame label="Position Fix durch Drei-Linien-Kreuzpeilung">
          <North />
          {/* Landmarken */}
          <g fill="var(--muted-foreground)" fontSize={10}>
            <path d="M30,20 l6,14 h-12 z" />
            <text x={42} y={30}>Leuchtturm</text>
            <rect x={240} y={150} width={10} height={14} />
            <text x={196} y={182}>Kirche</text>
            <circle cx={20} cy={170} r={6} />
            <text x={30} y={186}>Kap</text>
          </g>
          {/* Peillinien mit kleinem Fehlerdreieck */}
          <line x1={30} y1={30} x2={170} y2={130} stroke={VEC_COLORS.ground} strokeWidth={2} />
          <line x1={245} y1={156} x2={110} y2={92} stroke={VEC_COLORS.water} strokeWidth={2} />
          <line x1={20} y1={170} x2={175} y2={88} stroke={VEC_COLORS.tide} strokeWidth={2} />
          <Fix x={136} y={107} />
          <text x={150} y={124} fontSize={11} fontWeight={700} fill="var(--foreground)">
            Fix 14:20
          </text>
          <text x={150} y={137} fontSize={9} fill="var(--muted-foreground)">
            (cocked hat)
          </text>
        </Frame>
      )
    case 'ep': {
      const tri = computeVelocityTriangle({ heading: 0, stw: 5, tideDirection: 90, tideRate: 2, leeway: 0 })
      const o = { x: 90, y: 180 }
      const s = 30
      const w = px(o, tri.waterVelocity, s)
      const g = px(o, tri.groundVelocity, s)
      return (
        <Frame label="Konstruktion der Estimated Position">
          <North />
          <VectorArrow from={o} to={w} color={VEC_COLORS.water} chevrons={1} head={false} label="Log 5 NM" labelOffset={-18} width={2.5} />
          <line x1={w.x - 6} y1={w.y - 6} x2={w.x + 6} y2={w.y + 6} stroke={VEC_COLORS.water} strokeWidth={2} />
          <text x={w.x - 10} y={w.y - 4} fontSize={9} textAnchor="end" fill="var(--muted-foreground)">
            DR
          </text>
          <VectorArrow from={w} to={g} color={VEC_COLORS.tide} chevrons={3} head={false} label="Strom 2 NM" labelOffset={-14} width={2.5} />
          <line x1={o.x} y1={o.y} x2={g.x} y2={g.y} stroke={VEC_COLORS.ground} strokeWidth={1.5} strokeDasharray="4 4" />
          <Fix x={o.x} y={o.y} label="Fix 10:00" />
          <EPSymbol x={g.x} y={g.y} label="EP 11:00" />
        </Frame>
      )
    }
  }
}
