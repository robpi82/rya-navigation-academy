import { degToRad } from './angles'

/**
 * Astronavigation (Yachtmaster-Vorgriff): Mittagsbreite aus einer Sonnenhöhe.
 * Vereinfachte Formeln für Lernzwecke – echte Beobachtungen werden mit dem Nautischen Almanach und dessen Tafeln beschickt.
 * Winkel in Grad, Korrekturen in Bogenminuten; Breite und Deklination Nord positiv, Länge Ost positiv.
 */

/** Kimmtiefe (dip) in Bogenminuten, negativ: −1,76′ · √(Augenhöhe in m). */
export const dip = (eyeHeight: number): number => -1.76 * Math.sqrt(Math.max(0, eyeHeight))

/** Astronomische Refraktion (Bennett) in Bogenminuten, negativ, für eine scheinbare Höhe in Grad. */
export function refraction(apparentAltitude: number): number {
  const h = Math.max(apparentAltitude, 0)
  return -1 / Math.tan(degToRad(h + 7.31 / (h + 4.4)))
}

/** Halbmesser der Sonne in Bogenminuten (Mittelwert). */
export const SUN_SEMI_DIAMETER = 16

export interface SextantCorrection {
  /** Sextantenhöhe Hs (°) */
  sextant: number
  indexError: number
  dip: number
  /** scheinbare Höhe Ha (°) */
  apparent: number
  refraction: number
  semiDiameter: number
  /** beobachtete (wahre) Höhe Ho (°) */
  observed: number
}

/**
 * Beschickung einer Sonnenhöhe (Unterrand): Ho = Hs + Indexberichtigung + Kimmtiefe + Refraktion + Halbmesser.
 * `indexError` in Bogenminuten mit Vorzeichen der Berichtigung (+ „off the arc", − „on the arc").
 */
export function correctSunAltitude(sextantAltitude: number, eyeHeight: number, indexError = 0, upperLimb = false): SextantCorrection {
  const d = dip(eyeHeight)
  const apparent = sextantAltitude + (indexError + d) / 60
  const r = refraction(apparent)
  const sd = upperLimb ? -SUN_SEMI_DIAMETER : SUN_SEMI_DIAMETER
  return { sextant: sextantAltitude, indexError, dip: d, apparent, refraction: r, semiDiameter: sd, observed: apparent + (r + sd) / 60 }
}

/**
 * Mittagsbreite: Zenitdistanz z = 90° − Ho. Steht die Sonne zur Kulmination im Süden, liegt der Beobachter
 * nördlich von ihr: Breite = Deklination + z. Steht sie im Norden: Breite = Deklination − z.
 */
export function noonLatitude(observedAltitude: number, declination: number, sunBearing: 'S' | 'N'): number {
  const z = 90 - observedAltitude
  return sunBearing === 'S' ? declination + z : declination - z
}

/** Höhe der Sonne bei Kulmination für eine bekannte Breite (Umkehrung, für Plausibilitätsprüfungen). */
export function noonAltitude(latitude: number, declination: number): { altitude: number; bearing: 'S' | 'N' } {
  const z = Math.abs(latitude - declination)
  return { altitude: 90 - z, bearing: latitude >= declination ? 'S' : 'N' }
}

/**
 * Zeit der Kulmination (Local Apparent Noon) in Stunden UT: 12 h − Länge/15 − Zeitgleichung.
 * `equationOfTime` in Minuten (wahre minus mittlere Sonnenzeit), Länge Ost positiv.
 */
export function noonTimeUT(longitude: number, equationOfTime = 0): number {
  return 12 - longitude / 15 - equationOfTime / 60
}

/** Grobe Sonnendeklination (°) nach Tag im Jahr (1–365) – Näherung, Fehler bis etwa 1°. */
export function approxDeclination(dayOfYear: number): number {
  return 23.44 * Math.sin(degToRad((360 / 365) * (dayOfYear - 81)))
}

/** Hilfsfunktion: Grad mit Dezimalminuten → Dezimalgrad. */
export const dm = (deg: number, min: number): number => (deg < 0 || Object.is(deg, -0) ? -1 : 1) * (Math.abs(deg) + min / 60)

export const toDegMin = (value: number): { deg: number; min: number; sign: 1 | -1 } => {
  const a = Math.abs(value)
  let deg = Math.floor(a)
  let min = Math.round((a - deg) * 600) / 10
  if (min >= 60) {
    deg += 1
    min -= 60
  }
  return { deg, min, sign: value < 0 ? -1 : 1 }
}

