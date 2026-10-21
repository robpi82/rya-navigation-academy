import type { Vector2 } from '@/types/navigation'
import { dot, fromPolar, magnitude, subtractVectors } from './vectors'

/**
 * Strom an Kaps und Engstellen (Coastal): Wind gegen Strom, Stromrate an einem Kap über die Tide und Ankunftszeit am Kap.
 * Vereinfachte Modelle für Lernzwecke.
 */

export type WindTideRelation = 'against' | 'with' | 'across'

export interface WindOverWater {
  /** Wind relativ zur strömenden Wasseroberfläche (kn) – er erzeugt den Seegang */
  speed: number
  relation: WindTideRelation
  vector: Vector2
}

/**
 * Wind über dem Wasser: Windvektor (weht nach windFrom + 180°) minus Stromvektor.
 * Läuft der Strom gegen den Wind, wächst die wirksame Windgeschwindigkeit, und die Wellen werden zusätzlich kürzer und steiler.
 */
export function windOverWater(windFrom: number, windKn: number, streamSet: number, streamKn: number): WindOverWater {
  const wind = fromPolar(windKn, windFrom + 180)
  const stream = fromPolar(streamKn, streamSet)
  const vector = subtractVectors(wind, stream)
  let relation: WindTideRelation = 'across'
  if (streamKn > 0 && windKn > 0) {
    const cos = dot(fromPolar(1, windFrom + 180), fromPolar(1, streamSet))
    if (cos <= -0.5) relation = 'against'
    else if (cos >= 0.5) relation = 'with'
  }
  return { speed: magnitude(vector), relation, vector }
}

/** Stromrate zu einer Stunde (relativ zu HW, auch gebrochen) aus einer Stundentabelle HW−6 … HW+6, linear interpoliert. */
export function streamAtHour(table: number[], hour: number): number {
  const i = Math.min(Math.max(hour + 6, 0), table.length - 1)
  const lo = Math.floor(i)
  const hi = Math.min(lo + 1, table.length - 1)
  return table[lo] + (table[hi] - table[lo]) * (i - lo)
}

/** Ankunft am Kap (Stunden relativ zu HW): Abfahrt + Distanz / Fahrt durchs Wasser (Strom auf dem Weg dorthin vernachlässigt). */
export const arrivalHour = (departHour: number, distanceNm: number, stwKn: number): number => departHour + distanceNm / stwKn

/** Fahrt über Grund am Kap, wenn der Strom genau mit (positiv) oder gegen (negativ) die Fahrtrichtung läuft. */
export const sogAlongStream = (stwKn: number, streamAlongKn: number): number => stwKn + streamAlongKn
