import { normalizeAngle } from './angles'

/**
 * Ozeanwetter und Kommunikation (Yachtmaster Ocean): tropische Wirbelstürme, Windgürtel und Funkreichweite.
 * Vereinfachte Lernmodelle.
 */

export type Hemisphere = 'N' | 'S'
export type WindShift = 'veer' | 'back' | 'steady'
export type StormPosition = 'dangerous' | 'navigable' | 'track'

/**
 * Peilung zum Sturmzentrum aus der Windrichtung: Mit dem Gesicht zum Wind liegt das Zentrum auf der Nordhalbkugel
 * 90° (nahe am Zentrum) bis 135° (weiter entfernt) rechts, auf der Südhalbkugel entsprechend links.
 */
export function stormCentreBearing(windFrom: number, hemisphere: Hemisphere): { near: number; far: number } {
  const s = hemisphere === 'N' ? 1 : -1
  return { near: normalizeAngle(windFrom + s * 90), far: normalizeAngle(windFrom + s * 135) }
}

/**
 * Lage zum Sturm aus der Winddrehung bei fallendem Druck: Nordhalbkugel – rechtsdrehend (veering) = gefährlicher Halbkreis,
 * rückdrehend (backing) = fahrbarer Halbkreis, gleichbleibend = auf der Zugbahn. Südhalbkugel umgekehrt.
 */
export function stormPosition(shift: WindShift, hemisphere: Hemisphere): StormPosition {
  if (shift === 'steady') return 'track'
  const dangerousShift: WindShift = hemisphere === 'N' ? 'veer' : 'back'
  return shift === dangerousShift ? 'dangerous' : 'navigable'
}

export type TropicalClass = 'depression' | 'storm' | 'hurricane'

/** Einstufung nach mittlerem Wind: unter 34 kn tropisches Tief, 34–63 kn tropischer Sturm, ab 64 kn Hurrikan (Taifun, Zyklon). */
export const tropicalClass = (windKn: number): TropicalClass => (windKn >= 64 ? 'hurricane' : windKn >= 34 ? 'storm' : 'depression')

/** UKW-Reichweite (NM) als Funkhorizont: rund 2,2 × (√H + √h), Antennenhöhen in m. */
export const vhfRange = (antennaA: number, antennaB: number): number => 2.2 * (Math.sqrt(Math.max(0, antennaA)) + Math.sqrt(Math.max(0, antennaB)))
