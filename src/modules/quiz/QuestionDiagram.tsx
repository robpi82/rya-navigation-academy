import { computeVelocityTriangle, fromPolar } from '@/calculations'
import { VectorArrow } from '@/components/nautical/svg'
import type { QuestionDiagram as Diagram } from '@/types/learning'

const W = 320
const H = 240
const PAD = 36

/**
 * Neutrales Vektordiagramm für Interpretationsaufgaben: alle Vektoren in derselben Farbe,
 * nur mit Buchstaben beschriftet – die Bedeutung soll aus der Geometrie erkannt werden.
 */
export function QuestionDiagram({ diagram }: { diagram: Diagram }) {
  const tri = computeVelocityTriangle(diagram)
  const heading = fromPolar(diagram.stw, diagram.heading)
  const pts = [{ x: 0, y: 0 }, tri.waterVelocity, tri.groundVelocity, ...(diagram.labels.heading ? [heading] : [])]
  const xs = pts.map((p) => p.x)
  const ys = pts.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const scale = Math.min((W - 2 * PAD) / Math.max(maxX - minX, 1), (H - 2 * PAD) / Math.max(maxY - minY, 1))
  const cx = (minX + maxX) / 2
  const cy = (minY + maxY) / 2
  const px = (p: { x: number; y: number }) => ({ x: W / 2 + (p.x - cx) * scale, y: H / 2 - (p.y - cy) * scale })
  const o = px({ x: 0, y: 0 })
  const color = 'var(--foreground)'
  const { labels } = diagram

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full max-w-sm rounded-lg border" role="img" aria-label="Vektordiagramm zur Aufgabe">
      <rect width={W} height={H} fill="var(--chart-sea)" />
      <g transform={`translate(${W - 22} 30)`}>
        <line x1={0} y1={10} x2={0} y2={-12} stroke="var(--muted-foreground)" strokeWidth={1.5} />
        <path d="M0,-16 L4,-8 L-4,-8 Z" fill="var(--muted-foreground)" />
        <text y={22} fontSize={10} textAnchor="middle" fill="var(--muted-foreground)">
          N
        </text>
      </g>
      {labels.heading && <VectorArrow from={o} to={px(heading)} color={color} dashed width={2} label={labels.heading} labelAt={0.85} labelOffset={-14} />}
      {labels.water && <VectorArrow from={o} to={px(tri.waterVelocity)} color={color} width={2.5} label={labels.water} labelAt={0.55} labelOffset={labels.heading ? 16 : -14} />}
      {labels.tide && <VectorArrow from={px(tri.waterVelocity)} to={px(tri.groundVelocity)} color={color} width={2.5} label={labels.tide} labelOffset={14} />}
      {labels.ground && <VectorArrow from={o} to={px(tri.groundVelocity)} color={color} width={2.5} label={labels.ground} labelAt={0.55} labelOffset={14} />}
      <circle cx={o.x} cy={o.y} r={4} fill={color} />
    </svg>
  )
}
