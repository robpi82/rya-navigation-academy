/**
 * Törnvorbereitung (Day Skipper): Kraftstoff, Trinkwasser und Tageslichtreserve. Faustregeln für Lernzwecke.
 */

/** Übliche Kraftstoffreserve auf die berechnete Menge (20 %). */
export const FUEL_RESERVE = 0.2

/** Kraftstoff (l) für eine Strecke unter Maschine: Fahrzeit × Verbrauch, plus Reserve. */
export const fuelNeeded = (distanceNm: number, sogKn: number, litresPerHour: number, reserve = FUEL_RESERVE): number => (distanceNm / sogKn) * litresPerHour * (1 + reserve)

/** Drittelregel: ein Drittel hin, ein Drittel zurück, ein Drittel Reserve. Wie weit (NM) darf man hinausfahren? */
export const thirdsRange = (tankLitres: number, litresPerHour: number, sogKn: number): number => (tankLitres / 3 / litresPerHour) * sogKn

/** Trinkwasser (l) für Crew und Tage, mit Liter pro Person und Tag. */
export const waterNeeded = (crew: number, days: number, litresPerPersonDay = 3): number => crew * days * litresPerPersonDay

/** Reserve bis Sonnenuntergang (h): Sonnenuntergang − (Abfahrt + Distanz / Fahrt). Negativ = Ankunft im Dunkeln. */
export const daylightMargin = (departHour: number, distanceNm: number, sogKn: number, sunsetHour: number): number => sunsetHour - (departHour + distanceNm / sogKn)
