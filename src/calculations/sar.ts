import { KN_TO_MS } from './weather'

/**
 * Notfälle auf Hochsee (Yachtmaster): Mensch über Bord, Suchmuster nach IAMSAR (vereinfacht) und Zeit bis zur Hilfe.
 * Vereinfachte Modelle für Lernzwecke.
 */

/** Strecke (m), die das Boot zurücklegt, bevor es reagiert. */
export const distanceAwayM = (speedKn: number, seconds: number): number => speedKn * KN_TO_MS * seconds

/** Versatz (NM) einer Person im Wasser durch den Strom nach `minutes` – gegenüber dem über Grund gespeicherten MOB-Punkt. */
export const datumDriftNm = (currentKn: number, minutes: number): number => (currentKn * minutes) / 60

/** Schenkel eines Suchmusters „wachsendes Quadrat“ (Expanding Square): S, S, 2S, 2S, 3S, 3S, … */
export function expandingSquareLegs(spacingNm: number, legs: number): number[] {
  return Array.from({ length: legs }, (_, i) => spacingNm * (Math.floor(i / 2) + 1))
}

/** Gesamtlänge (NM) der ersten `legs` Schenkel des wachsenden Quadrats. */
export const expandingSquareLength = (spacingNm: number, legs: number): number => expandingSquareLegs(spacingNm, legs).reduce((s, l) => s + l, 0)

/** Sektorsuche (Sector Search): drei gleichseitige Dreiecke mit Schenkellänge R – Gesamtweg 9 R. */
export const sectorSearchLength = (radiusNm: number): number => 9 * radiusNm

/** Fahrzeit (min) für eine Suchstrecke. */
export const searchMinutes = (lengthNm: number, speedKn: number): number => (lengthNm / speedKn) * 60

/** Stunden, bis ein Helfer aus `distanceNm` Entfernung mit `speedKn` eintrifft. */
export const rescueHours = (distanceNm: number, speedKn: number): number => distanceNm / speedKn
