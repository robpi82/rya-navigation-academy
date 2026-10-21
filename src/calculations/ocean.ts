/**
 * Ozeanpassage (Yachtmaster): Etmal (Distanz von Mittag zu Mittag), Reisedauer und Ankunft, Vorräte mit Reserve und
 * Zeitzonen unterwegs. Richtwerte für Lernzwecke.
 */

/** Mittlere Fahrt (kn) aus dem Etmal. */
export const etmalSpeed = (etmalNm: number): number => etmalNm / 24

/** Reisedauer in Tagen bei gleichbleibendem Etmal. */
export const passageDays = (distanceNm: number, etmalNm: number): number => distanceNm / etmalNm

/** Nötiges Etmal, um eine Strecke in einer Zahl von Tagen zu schaffen. */
export const etmalNeeded = (distanceNm: number, days: number): number => distanceNm / days

/** Ankunftsdatum (ISO, Tag) nach Abfahrtsdatum und Reisedauer (Tage, angefangene Tage zählen mit). */
export function arrivalDate(departIso: string, days: number): string {
  const d = new Date(`${departIso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + Math.ceil(days - 1e-9))
  return d.toISOString().slice(0, 10)
}

/** Übliche Vorratsreserve auf die geplante Reisedauer (30 %). */
export const PROVISION_RESERVE = 0.3

/** Trinkwasser (l) für Crew und Tage mit Reserve. */
export const passageWater = (crew: number, days: number, litresPerPersonDay = 3, reserve = PROVISION_RESERVE): number => crew * days * litresPerPersonDay * (1 + reserve)

/**
 * Zeitverschiebung der Bordzeit (h) zwischen zwei Längen (Ost positiv): je 15° eine Stunde.
 * Positiv = Uhr vorstellen (nach Osten), negativ = zurückstellen (nach Westen).
 */
export const clockChangeHours = (fromLon: number, toLon: number): number => (toLon - fromLon) / 15

/** Längenänderung (°) pro Tag bei Kurs genau West oder Ost: Etmal / (60 · cos Breite). */
export const longitudePerDay = (etmalNm: number, latDeg: number): number => etmalNm / (60 * Math.cos((latDeg * Math.PI) / 180))

/** Nach wie vielen Tagen sich die Bordzeit um eine Stunde verschiebt (15° Länge). */
export const daysPerClockHour = (etmalNm: number, latDeg: number): number => 15 / longitudePerDay(etmalNm, latDeg)
