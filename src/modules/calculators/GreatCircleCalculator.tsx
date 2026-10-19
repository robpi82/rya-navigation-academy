import { compareRoutes, formatBearing, formatLatLon, formatNumber, greatCirclePoints } from '@/calculations'
import { NumberField, ResultPanel, ResultValue, fieldsValid, useNumberField } from './fields'

/** Großkreis (kürzester Weg) gegen Loxodrome (konstanter Kurs). Koordinaten in Dezimalgrad, N/E positiv. */
export function GreatCircleCalculator() {
  const lat1 = useNumberField('50.7', { min: -90, max: 90 })
  const lon1 = useNumberField('-1.3', { min: -180, max: 180 })
  const lat2 = useNumberField('40.7', { min: -90, max: 90 })
  const lon2 = useNumberField('-74', { min: -180, max: 180 })
  const valid = fieldsValid(lat1, lon1, lat2, lon2)
  const from = { lat: lat1.value ?? 0, lon: lon1.value ?? 0 }
  const to = { lat: lat2.value ?? 0, lon: lon2.value ?? 0 }
  const r = valid ? compareRoutes(from, to) : null
  const points = r ? greatCirclePoints(from, to, 6) : []
  const f1 = (n: number) => formatNumber(n, 1)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Auf einer Mercatorkarte ist die Loxodrome eine Gerade, der kürzeste Weg (Großkreis) aber eine Kurve. Auf langen Ost-West-Strecken in höheren Breiten spart der Großkreis Distanz; man segelt ihn in Teilstücken mit je einem Kurs. Eingabe in Dezimalgrad (Nord und Ost positiv, Süd und West negativ).
      </p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <NumberField label="Start: Breite" unit="°" field={lat1} />
        <NumberField label="Start: Länge" unit="°" field={lon1} />
        <NumberField label="Ziel: Breite" unit="°" field={lat2} />
        <NumberField label="Ziel: Länge" unit="°" field={lon2} />
      </div>
      <ResultPanel
        valid={valid && !!r}
        steps={
          r
            ? [
                `Großkreisdistanz: ${f1(r.greatCircle.distance)} NM (Kugelmodell, 1′ = 1 NM).`,
                `Anfangskurs ${formatBearing(r.greatCircle.initialBearing)}, Endkurs ${formatBearing(r.greatCircle.finalBearing)} – der Kurs ändert sich unterwegs um ${f1(Math.abs(r.greatCircle.finalBearing - r.greatCircle.initialBearing))}°.`,
                `Loxodrome: konstanter Kurs ${r.rhumbBearing === null ? '–' : formatBearing(r.rhumbBearing)}, ${f1(r.rhumbDistance)} NM.`,
                `Ersparnis des Großkreises: ${f1(r.saving)} NM (${f1((r.saving / r.rhumbDistance) * 100)} %).`,
                `Scheitelpunkt (höchste Breite): ${f1(Math.abs(r.greatCircle.vertexLat))}° ${r.greatCircle.vertexLat >= 0 ? 'N' : 'S'}.`,
              ]
            : []
        }
      >
        {r && (
          <>
            <ResultValue label="Großkreis" value={`${f1(r.greatCircle.distance)} NM`} sub={`Anfangskurs ${formatBearing(r.greatCircle.initialBearing, 0)}`} highlight />
            <ResultValue label="Loxodrome" value={`${f1(r.rhumbDistance)} NM`} sub={r.rhumbBearing === null ? undefined : `Kurs ${formatBearing(r.rhumbBearing, 0)}`} />
            <ResultValue label="Ersparnis" value={`${f1(r.saving)} NM`} />
          </>
        )}
      </ResultPanel>
      {r && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-72 text-sm">
            <caption className="pb-1 text-left text-xs text-muted-foreground">Wegpunkte auf dem Großkreis (gleiche Abstände)</caption>
            <tbody className="font-mono tabular-nums">
              {points.map((p, i) => (
                <tr key={i} className="border-t">
                  <td className="py-1 pr-3 text-muted-foreground">{i === 0 ? 'Start' : i === points.length - 1 ? 'Ziel' : `WP ${i}`}</td>
                  <td>{formatLatLon(p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
