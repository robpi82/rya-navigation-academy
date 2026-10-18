import { interpolateTidalRate } from '@/calculations'
import { STANDARD_PORT, TIDAL_DIAMONDS, type TidalDiamond } from '@/data/chartArea'

/** Strom an einem Tidal Diamond zur Stunde `hourOffset` (−6 … +6 relativ HW) bei Tidenhub `range`. */
export function tideAtDiamond(diamond: TidalDiamond, hourOffset: number, range: number) {
  const row = diamond.rows[Math.max(-6, Math.min(6, Math.round(hourOffset))) + 6]
  const interp = interpolateTidalRate({
    springRate: row.spring,
    neapRate: row.neap,
    range,
    springRange: STANDARD_PORT.springRange,
    neapRange: STANDARD_PORT.neapRange,
  })!
  return { set: row.set, rate: interp.rate, spring: row.spring, neap: row.neap, factor: interp.factor }
}

export const diamondById = (id: string) => TIDAL_DIAMONDS.find((d) => d.id === id)!
