import { degToRad } from './angles'

/**
 * Navigation ohne GPS (Coastal): Abstand aus zwei Seitenpeilungen (Verdoppelung des Bugwinkels, Vierstrichpeilung),
 * Fehlerkreis des Koppelorts, Lotung auf Kartennull reduzieren. Vereinfachte Modelle für Lernzwecke.
 */

/**
 * Abstand zur Marke zum Zeitpunkt der zweiten Peilung (NM), aus zwei Bugwinkeln (relativ zum Kurs, 0–180°) und der
 * dazwischen gelaufenen Strecke: d₂ = Strecke · sin(α₁) / sin(α₂ − α₁). Bei α₂ = 2·α₁ ist d₂ = Strecke.
 */
export function distanceOffFromBowAngles(firstAngle: number, secondAngle: number, runNm: number): number | null {
  const diff = secondAngle - firstAngle
  if (firstAngle <= 0 || secondAngle >= 180 || diff <= 0) return null
  return (runNm * Math.sin(degToRad(firstAngle))) / Math.sin(degToRad(diff))
}

/** Passierabstand querab (NM), wenn Kurs und Fahrt gleich bleiben: d₂ · sin(α₂). */
export function abeamDistance(firstAngle: number, secondAngle: number, runNm: number): number | null {
  const d2 = distanceOffFromBowAngles(firstAngle, secondAngle, runNm)
  return d2 === null ? null : d2 * Math.sin(degToRad(secondAngle))
}

/** Richtwert für die Unsicherheit eines Koppelorts: Anteil der seit dem letzten sicheren Ort gelaufenen Strecke (10 %). */
export const EP_ERROR_FRACTION = 0.1

/** Radius des Fehlerkreises um den Koppelort (NM). */
export const epErrorRadius = (distanceRunNm: number, fraction = EP_ERROR_FRACTION): number => distanceRunNm * fraction

/** Lotung auf Kartennull reduzieren: Echolot-Anzeige + Tiefe des Gebers unter der Wasserlinie − Höhe der Gezeit. */
export const reduceSounding = (displayedDepth: number, transducerDepth: number, heightOfTide: number): number => displayedDepth + transducerDepth - heightOfTide
