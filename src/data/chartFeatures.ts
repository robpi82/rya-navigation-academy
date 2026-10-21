import type { LatLon } from '@/types/navigation'

/**
 * Zusätzliche Karteninhalte des fiktiven Übungsreviers „Nordbucht“ (nicht zur Navigation): Seezeichen nach IALA
 * Region A, Molen, Wracks, Ankerplätze, Sperrgebiet, Ortsflächen und Namen. Symbole sinngemäß nach den Kartenzeichen
 * der IHO (INT 1). Die Aufgabenobjekte stehen unverändert in chartArea.ts (MARKS).
 */

export type FeatureKind =
  | 'lateral-port'
  | 'lateral-stbd'
  | 'cardinal-n'
  | 'cardinal-e'
  | 'cardinal-s'
  | 'cardinal-w'
  | 'pierhead-light'
  | 'wreck-dangerous'
  | 'wreck'
  | 'rock-underwater'
  | 'anchorage'

export interface ChartFeature {
  id: string
  kind: FeatureKind
  pos: LatLon
  /** Name (kursiv bei Seezeichen) */
  name?: string
  /** Kennung des Feuers, z. B. „Fl R 4s“ */
  light?: string
  /** Lichtfarbe für die Feuerflagge */
  lightColor?: 'R' | 'G' | 'W'
  /** ab welcher Zoomstufe sichtbar (1 = ganze Karte) */
  minZoom?: number
  note?: string
}

export const FEATURES: ChartFeature[] = [
  // Ansteuerung Ankerstedt: von See (Süden) einlaufend Rot an Backbord (West), Grün an Steuerbord (Ost)
  { id: 'an-1', kind: 'lateral-port', pos: { lat: 50.7705, lon: -1.3088 }, name: 'A1', light: 'Fl R 3s', lightColor: 'R', minZoom: 1.6 },
  { id: 'an-2', kind: 'lateral-stbd', pos: { lat: 50.7705, lon: -1.3012 }, name: 'A2', light: 'Fl G 3s', lightColor: 'G', minZoom: 1.6 },
  { id: 'an-w', kind: 'pierhead-light', pos: { lat: 50.776, lon: -1.3085 }, light: 'Fl R 4s 6m 3M', lightColor: 'R', minZoom: 2.2 },
  { id: 'an-e', kind: 'pierhead-light', pos: { lat: 50.776, lon: -1.3015 }, light: 'Fl G 4s 6m 3M', lightColor: 'G', minZoom: 2.2 },
  // Inselhafen Kranich: von See (Norden) einlaufend Rot an Backbord (Ost), Grün an Steuerbord (West)
  { id: 'kr-1', kind: 'lateral-port', pos: { lat: 50.6645, lon: -1.2962 }, name: 'K1', light: 'Fl R 2,5s', lightColor: 'R', minZoom: 1.6 },
  { id: 'kr-2', kind: 'lateral-stbd', pos: { lat: 50.6645, lon: -1.3038 }, name: 'K2', light: 'Fl G 2,5s', lightColor: 'G', minZoom: 1.6 },
  { id: 'kr-w', kind: 'pierhead-light', pos: { lat: 50.6605, lon: -1.3035 }, light: 'Fl G 5s', lightColor: 'G', minZoom: 2.2 },
  { id: 'kr-e', kind: 'pierhead-light', pos: { lat: 50.6605, lon: -1.2965 }, light: 'Fl R 5s', lightColor: 'R', minZoom: 2.2 },
  // Kardinalzeichen an den Klippen der Insel
  { id: 'cw-kranich', kind: 'cardinal-w', pos: { lat: 50.6175, lon: -1.4405 }, name: 'Kranichriff W', light: 'Q(9) 15s', lightColor: 'W' },
  { id: 'ce-ostklippe', kind: 'cardinal-e', pos: { lat: 50.6255, lon: -1.172 }, name: 'Ostklippe O', light: 'Q(3) 10s', lightColor: 'W' },
  // Wracks und Unterwasserhindernisse
  { id: 'wk-1', kind: 'wreck-dangerous', pos: { lat: 50.69, lon: -1.565 }, note: 'Wrack, Tiefe unbekannt', minZoom: 1.2 },
  { id: 'wk-2', kind: 'wreck', pos: { lat: 50.726, lon: -1.06 }, note: 'Wrack, ungefährlich (Tiefe > 20 m)', minZoom: 1.6 },
  { id: 'rk-1', kind: 'rock-underwater', pos: { lat: 50.7445, lon: -1.4705 }, note: 'Unterwasserfels', minZoom: 1.6 },
  { id: 'rk-2', kind: 'rock-underwater', pos: { lat: 50.6125, lon: -1.4285 }, note: 'Unterwasserfels', minZoom: 1.6 },
  // Ankerplätze
  { id: 'anch-west', kind: 'anchorage', pos: { lat: 50.7735, lon: -1.372 }, note: 'Ankerplatz', minZoom: 1.2 },
  { id: 'anch-kranich', kind: 'anchorage', pos: { lat: 50.6625, lon: -1.245 }, note: 'Ankerplatz', minZoom: 1.2 },
]

/** Molen als Linien [lon, lat] – Wasserseite bleibt befahrbar. */
export const MOLES: { name: string; line: [number, number][] }[] = [
  { name: 'Westmole Ankerstedt', line: [[-1.315, 50.784], [-1.311, 50.7795], [-1.3085, 50.776]] },
  { name: 'Ostmole Ankerstedt', line: [[-1.29, 50.784], [-1.2985, 50.779], [-1.3015, 50.776]] },
  { name: 'Westmole Kranich', line: [[-1.3085, 50.6556], [-1.3055, 50.6585], [-1.3035, 50.6605]] },
  { name: 'Ostmole Kranich', line: [[-1.2915, 50.6555], [-1.2945, 50.6585], [-1.2965, 50.6605]] },
]

/** Sperrgebiet (magenta, T-Linie) */
export const RESTRICTED_AREAS: { name: string; outline: [number, number][] }[] = [
  { name: 'Sperrgebiet (Übungsgebiet)', outline: [[-1.02, 50.705], [-0.95, 50.705], [-0.95, 50.75], [-1.02, 50.75]] },
]

/** Bebaute Flächen (Ortschaften) */
export const BUILT_UP: { name: string; outline: [number, number][] }[] = [
  { name: 'Ankerstedt', outline: [[-1.33, 50.791], [-1.316, 50.787], [-1.303, 50.7925], [-1.288, 50.788], [-1.282, 50.797], [-1.3, 50.803], [-1.322, 50.8]] },
  { name: 'Kranich', outline: [[-1.315, 50.6555], [-1.312, 50.651], [-1.29, 50.6505], [-1.286, 50.6545], [-1.29, 50.6553]] },
]

export type PlaceStyle = 'land' | 'town' | 'water' | 'feature'

/** Namen in der Karte: Land aufrecht, Wasserflächen kursiv (Kartenkonvention). */
export const PLACE_NAMES: { text: string; pos: LatLon; style: PlaceStyle; minZoom?: number; rotate?: number }[] = [
  { text: 'INSEL KRANICH', pos: { lat: 50.623, lon: -1.305 }, style: 'land' },
  { text: 'ANKERSTEDT', pos: { lat: 50.81, lon: -1.305 }, style: 'town' },
  { text: 'Kap Möwe', pos: { lat: 50.77, lon: -1.47 }, style: 'feature', minZoom: 1.2 },
  { text: 'N O R D B U C H T', pos: { lat: 50.73, lon: -1.25 }, style: 'water' },
  { text: 'Kranichsund', pos: { lat: 50.682, lon: -1.42 }, style: 'water', minZoom: 1.2 },
  { text: 'Möwenbank', pos: { lat: 50.7335, lon: -1.533 }, style: 'water', minZoom: 1.4 },
  { text: 'Möwenklippen', pos: { lat: 50.7495, lon: -1.432 }, style: 'feature', minZoom: 2 },
  { text: 'Kranichklippen', pos: { lat: 50.621, lon: -1.436 }, style: 'feature', minZoom: 2 },
  { text: 'Nordhöhe', pos: { lat: 50.815, lon: -1.15 }, style: 'feature', minZoom: 1.2 },
]

/**
 * Bathymetrie-Bausteine für das Tiefenmodell: Untiefen (Tiefe im Zentrum, negativ = trockenfallend),
 * ausgebaggerte Fahrrinnen (Mindesttiefe) und Watt.
 */
export const SHOALS: { name: string; pos: LatLon; radiusNm: number; depth: number }[] = [
  { name: 'Grauer Stein', pos: { lat: 50.697, lon: -1.15 }, radiusNm: 0.55, depth: -1.2 },
  { name: 'Möwenbank', pos: { lat: 50.733, lon: -1.535 }, radiusNm: 1.1, depth: 1.8 },
  { name: 'Kranichriff', pos: { lat: 50.6175, lon: -1.425 }, radiusNm: 0.7, depth: -0.5 },
  { name: 'Ostklippe', pos: { lat: 50.6255, lon: -1.19 }, radiusNm: 0.45, depth: -0.3 },
  { name: 'Möwenklippen', pos: { lat: 50.7505, lon: -1.456 }, radiusNm: 0.5, depth: -0.4 },
  { name: 'Watt Ankerstedt West', pos: { lat: 50.7835, lon: -1.345 }, radiusNm: 0.7, depth: -1.0 },
  { name: 'Watt Nordhöhe', pos: { lat: 50.79, lon: -1.19 }, radiusNm: 0.6, depth: -0.6 },
]

export const DREDGED: { name: string; from: LatLon; to: LatLon; halfWidthNm: number; minDepth: number }[] = [
  { name: 'Fahrrinne Ankerstedt', from: { lat: 50.762, lon: -1.305 }, to: { lat: 50.789, lon: -1.305 }, halfWidthNm: 0.16, minDepth: 3.2 },
  { name: 'Hafen Kranich', from: { lat: 50.6565, lon: -1.3 }, to: { lat: 50.6675, lon: -1.3 }, halfWidthNm: 0.14, minDepth: 2.8 },
]
