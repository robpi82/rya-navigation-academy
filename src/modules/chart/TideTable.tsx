import { formatNumber } from '@/calculations'
import { hourLabel, STANDARD_PORT } from '@/data/chartArea'
import { diamondById, tideAtDiamond } from '@/lib/chartTides'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

/** Stromtabelle eines Tidal Diamonds inkl. für den Tidenhub interpolierter Rate. */
export function TideTable({
  diamond,
  range,
  highlightFrom,
  highlightCount = 1,
}: {
  diamond: 'A' | 'B' | 'C'
  range: number
  /** erste hervorgehobene Stunde (relativ HW) */
  highlightFrom?: number
  highlightCount?: number
}) {
  const d = diamondById(diamond)
  const pos = `${formatNumber(Math.floor(d.pos.lat), 0)}°${formatNumber((d.pos.lat % 1) * 60, 1)}′N ${formatNumber(Math.floor(Math.abs(d.pos.lon)), 0)}°${formatNumber((Math.abs(d.pos.lon) % 1) * 60, 1)}′W`
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">
          <span className="text-[var(--chart-diamond)]">◆ {diamond}</span> Gezeitenstrom
        </CardTitle>
        <CardDescription>
          {pos} · bezogen auf HW {STANDARD_PORT.name} (Spring {formatNumber(STANDARD_PORT.springRange, 1)} m, Nipp {formatNumber(STANDARD_PORT.neapRange, 1)} m)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <table className="w-full text-right font-mono text-xs tabular-nums">
          <thead className="text-muted-foreground">
            <tr>
              <th className="py-1 text-left font-medium">Zeit</th>
              <th className="font-medium">Set</th>
              <th className="font-medium">Spring</th>
              <th className="font-medium">Nipp</th>
              <th className="font-medium">bei {formatNumber(range, 1)} m</th>
            </tr>
          </thead>
          <tbody>
            {d.rows.map((r, i) => {
              const h = i - 6
              const active = highlightFrom !== undefined && h >= highlightFrom && h < highlightFrom + highlightCount
              return (
                <tr key={h} className={cn('border-t', active && 'bg-accent/70 font-semibold')}>
                  <td className="py-0.5 text-left">{hourLabel(h)}</td>
                  <td>{String(r.set).padStart(3, '0')}°</td>
                  <td>{formatNumber(r.spring, 1)}</td>
                  <td>{formatNumber(r.neap, 1)}</td>
                  <td>{formatNumber(tideAtDiamond(d, h, range).rate, 2)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}
