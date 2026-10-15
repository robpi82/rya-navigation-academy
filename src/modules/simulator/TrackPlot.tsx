import { useMemo } from 'react'
import type { SimulationInput, SimulationResult, Vector2 } from '@/types/navigation'
import { formatBearing, formatNumber } from '@/calculations'
import { scaleVector } from '@/calculations/vectors'
import { AngleArc, BoatIcon, NorthArrow, VectorArrow, VEC_COLORS, makeProjection, niceStep } from '@/components/nautical/svg'

const W = 640
const H = 520
const PAD = 70

interface TrackPlotProps {
  input: SimulationInput
  result: SimulationResult
  /** vergangene Simulationsminuten */
  elapsed: number
}

/**
 * Maßstabsgetreuer Plot (Einheit NM): Start-Fix, Heading, Water Track (>), Strom (>>>),
 * Ground Track (>>) und EP. Das Boot bewegt sich entlang des Ground Track.
 */
export function TrackPlot({ input, result, elapsed }: TrackPlotProps) {
  const duration = input.durationMin
  const frac = duration > 0 ? Math.min(1, elapsed / duration) : 0

  const { proj, step, gridLines } = useMemo(() => {
    const pts: Vector2[] = [{ x: 0, y: 0 }, result.waterTrackEnd, result.groundTrackEnd, result.headingEnd]
    const xs = pts.map((p) => p.x)
    const ys = pts.map((p) => p.y)
    const minX = Math.min(...xs)
    const maxX = Math.max(...xs)
    const minY = Math.min(...ys)
    const maxY = Math.max(...ys)
    const span = Math.max(maxX - minX, maxY - minY, 0.5)
    const scale = Math.min((W - 2 * PAD) / Math.max(maxX - minX, span * 0.3), (H - 2 * PAD) / Math.max(maxY - minY, span * 0.3))
    const center = { x: (minX + maxX) / 2, y: (minY + maxY) / 2 }
    const proj = makeProjection({ x: W / 2, y: H / 2 }, scale, center)
    const step = niceStep(Math.max(W, H) / scale, 6)
    // Sichtbarer Bereich in NM
    const left = center.x - W / 2 / scale
    const right = center.x + W / 2 / scale
    const bottom = center.y - H / 2 / scale
    const top = center.y + H / 2 / scale
    const gridLines: { x1: number; y1: number; x2: number; y2: number; key: string }[] = []
    for (let gx = Math.ceil(left / step) * step; gx <= right; gx += step) {
      const a = proj.toPx({ x: gx, y: bottom })
      const b = proj.toPx({ x: gx, y: top })
      gridLines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `x${gx.toFixed(4)}` })
    }
    for (let gy = Math.ceil(bottom / step) * step; gy <= top; gy += step) {
      const a = proj.toPx({ x: left, y: gy })
      const b = proj.toPx({ x: right, y: gy })
      gridLines.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, key: `y${gy.toFixed(4)}` })
    }
    return { proj, step, gridLines }
  }, [result])

  const o = proj.toPx({ x: 0, y: 0 })
  const wEnd = proj.toPx(result.waterTrackEnd)
  const gEnd = proj.toPx(result.groundTrackEnd)
  const hEnd = proj.toPx(result.headingEnd)
  const boat = proj.toPx(scaleVector(result.groundTrackEnd, frac))
  const ghost = proj.toPx(scaleVector(result.waterTrackEnd, frac))
  const hasDistance = result.distanceThroughWater > 1e-6 || result.tideDrift > 1e-6
  const scaleBarPx = step * proj.scale
  const elapsedH = (elapsed / 60) * result.sog

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full touch-none select-none"
      role="img"
      aria-label={`Track-Plot: Heading ${formatBearing(input.heading, 0)}, Water Track ${formatBearing(result.waterTrack)}, COG ${formatBearing(result.cog)}, SOG ${formatNumber(result.sog, 2)} Knoten`}
    >
      <rect width={W} height={H} fill="var(--chart-sea)" />
      {gridLines.map((l) => (
        <line key={l.key} x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2} stroke="var(--chart-grid)" strokeWidth={1} />
      ))}

      {hasDistance && (
        <>
          {/* Heading-Strahl */}
          <VectorArrow from={o} to={hEnd} color={VEC_COLORS.heading} dashed width={2} label="HDG" labelAt={0.9} labelOffset={-14} />
          {/* Water Track (>) */}
          <VectorArrow from={o} to={wEnd} color={VEC_COLORS.water} chevrons={1} head={false} label="Water Track" labelOffset={-16} labelAt={0.4} />
          {/* Strom (>>>) vom Water-Track-Ende */}
          <VectorArrow from={wEnd} to={gEnd} color={VEC_COLORS.tide} chevrons={3} head={false} label="Strom" />
          {/* Ground Track (>>) */}
          <VectorArrow from={o} to={gEnd} color={VEC_COLORS.ground} chevrons={2} width={3.5} label="Ground Track" labelAt={0.62} labelOffset={16} />
          {/* Leeway-Winkel */}
          {input.leeway !== 0 && input.stw > 0 && (
            <AngleArc
              cx={o.x}
              cy={o.y}
              r={46}
              fromDeg={input.heading}
              toDeg={result.waterTrack}
              color={VEC_COLORS.leeway}
              label={`${Math.abs(input.leeway)}°`}
            />
          )}
          {/* Positionssymbole */}
          {result.distanceThroughWater > 1e-6 && result.tideDrift > 1e-6 && (
            <g>
              <line
                x1={wEnd.x - 7}
                y1={wEnd.y - 7}
                x2={wEnd.x + 7}
                y2={wEnd.y + 7}
                stroke={VEC_COLORS.water}
                strokeWidth={2.5}
              />
              <text x={wEnd.x - 10} y={wEnd.y + 18} fontSize={11} textAnchor="end" fill="var(--muted-foreground)">
                ohne Strom
              </text>
            </g>
          )}
          <g>
            <polygon
              points={`${gEnd.x},${gEnd.y - 11} ${gEnd.x + 10},${gEnd.y + 7} ${gEnd.x - 10},${gEnd.y + 7}`}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={2}
            />
            <circle cx={gEnd.x} cy={gEnd.y + 1} r={2.2} fill="var(--foreground)" />
            <text x={gEnd.x + 14} y={gEnd.y + 4} fontSize={12} fontWeight={700} fill="var(--foreground)">
              EP {duration} min
            </text>
          </g>
          {/* Geisterboot (nur Wasserbewegung) und aktueller Stromversatz */}
          {frac > 0 && frac < 1 && (
            <g opacity={0.8}>
              <line x1={ghost.x} y1={ghost.y} x2={boat.x} y2={boat.y} stroke={VEC_COLORS.tide} strokeWidth={1.5} strokeDasharray="3 3" />
              <circle cx={ghost.x} cy={ghost.y} r={5} fill="none" stroke={VEC_COLORS.water} strokeWidth={2} />
            </g>
          )}
        </>
      )}

      {/* Start-Fix ⊙ */}
      <circle cx={o.x} cy={o.y} r={9} fill="none" stroke="var(--foreground)" strokeWidth={2} />
      <circle cx={o.x} cy={o.y} r={2.2} fill="var(--foreground)" />
      <text x={o.x} y={o.y + 26} fontSize={12} fontWeight={700} fill="var(--foreground)" textAnchor="middle" style={{ paintOrder: 'stroke', stroke: 'var(--chart-sea)', strokeWidth: 4 }}>
        Start (Fix)
      </text>

      <BoatIcon x={boat.x} y={boat.y} heading={input.heading} />

      {/* Nordpfeil */}
      <NorthArrow x={W - 36} y={44} />

      {/* Maßstab */}
      <g transform={`translate(16 ${H - 24})`}>
        <rect x={-6} y={-24} width={scaleBarPx + 66} height={38} rx={6} fill="var(--card)" opacity={0.9} />
        <line x1={0} y1={0} x2={scaleBarPx} y2={0} stroke="var(--foreground)" strokeWidth={2} />
        <line x1={0} y1={-5} x2={0} y2={5} stroke="var(--foreground)" strokeWidth={2} />
        <line x1={scaleBarPx} y1={-5} x2={scaleBarPx} y2={5} stroke="var(--foreground)" strokeWidth={2} />
        <rect x={0} y={-3} width={scaleBarPx / 2} height={3} fill="var(--foreground)" />
        <text x={scaleBarPx + 8} y={4} fontSize={12} fill="var(--foreground)" fontWeight={600}>
          {formatNumber(step, step < 1 ? (step < 0.1 ? 2 : 1) : 0)} NM
        </text>
        <text x={0} y={-10} fontSize={10} fill="var(--muted-foreground)">
          Gitter = {formatNumber(step, step < 1 ? (step < 0.1 ? 2 : 1) : 0)} NM
        </text>
      </g>

      {/* Zeitanzeige */}
      <g transform="translate(16 16)">
        <rect width={200} height={44} rx={8} fill="var(--card)" opacity={0.92} />
        <text x={10} y={18} fontSize={12} fill="var(--muted-foreground)">
          t = {Math.round(elapsed)} / {duration} min
        </text>
        <text x={10} y={35} fontSize={12} fill="var(--foreground)" fontWeight={600}>
          über Grund: {formatNumber(elapsedH, 2)} NM
        </text>
      </g>

      {!hasDistance && (
        <text x={W / 2} y={H / 2 + 50} textAnchor="middle" fontSize={13} fill="var(--muted-foreground)">
          {duration === 0 ? 'Simulationsdauer 0 min – keine zurückgelegte Strecke' : 'Keine Fahrt durchs Wasser und kein Strom'}
        </text>
      )}
      {hasDistance && result.cog === null && (
        <text x={W / 2} y={H - 60} textAnchor="middle" fontSize={13} fontWeight={600} fill="var(--destructive)">
          Stillstand über Grund – COG nicht definiert
        </text>
      )}
    </svg>
  )
}
