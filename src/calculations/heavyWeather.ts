import { degToRad, radToDeg } from './angles'

/**
 * Schwerwetter (Coastal): scheinbarer Wind, Winddruck und Reffempfehlung.
 * TWA/AWA: Winkel zwischen Bug und Wind (0° = genau von vorn, 180° = genau von achtern), auf beiden Bugen gleich.
 */

export interface ApparentWind {
  speed: number
  angle: number
}

/** Scheinbarer Wind aus wahrem Wind (Geschwindigkeit, Winkel zum Bug) und Fahrt durchs Wasser. */
export function apparentWind(trueWindSpeed: number, trueWindAngle: number, boatSpeed: number): ApparentWind {
  const twa = degToRad(Math.abs(trueWindAngle))
  const speed = Math.sqrt(trueWindSpeed ** 2 + boatSpeed ** 2 + 2 * trueWindSpeed * boatSpeed * Math.cos(twa))
  if (speed < 1e-9) return { speed: 0, angle: 0 }
  const cosA = (trueWindSpeed * Math.cos(twa) + boatSpeed) / speed
  return { speed, angle: radToDeg(Math.acos(Math.max(-1, Math.min(1, cosA)))) }
}

/** Verhältnis der Winddruckkräfte: Der Druck wächst mit dem Quadrat der Windgeschwindigkeit. */
export const windForceRatio = (from: number, to: number): number => (from <= 0 ? Infinity : (to / from) ** 2)

export type ReefStage = 'none' | 'reef1' | 'reef2' | 'reef3' | 'storm'

/** Reffempfehlung nach scheinbarem Wind (typische Fahrtenyacht, Richtwerte). */
export function reefStage(apparentSpeed: number): ReefStage {
  if (apparentSpeed < 16) return 'none'
  if (apparentSpeed < 21) return 'reef1'
  if (apparentSpeed < 26) return 'reef2'
  if (apparentSpeed < 32) return 'reef3'
  return 'storm'
}

export const REEF_LABEL: Record<ReefStage, string> = {
  none: 'Volle Besegelung',
  reef1: '1. Reff im Groß',
  reef2: '2. Reff, Vorsegel verkleinern',
  reef3: '3. Reff, kleine Fock',
  storm: 'Sturmbesegelung (Trysegel, Sturmfock) oder beiliegen',
}
