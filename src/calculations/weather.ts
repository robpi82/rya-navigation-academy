import { angleDifference, normalizeAngle } from './angles'

/** Beaufort-Skala. Windgeschwindigkeit in Knoten, Wellenhöhen als grobe Richtwerte (ausgereifter Seegang auf offener See). */
export interface BeaufortLevel {
  force: number
  name: string
  minKn: number
  maxKn: number | null
  sea: string
  /** typische Wellenhöhe in m */
  waveHeight: number
  effect: string
}

export const BEAUFORT: BeaufortLevel[] = [
  { force: 0, name: 'Windstille', minKn: 0, maxKn: 0, sea: 'spiegelglatt', waveHeight: 0, effect: 'Rauch steigt senkrecht auf; Segel schlagen.' },
  { force: 1, name: 'Leiser Zug', minKn: 1, maxKn: 3, sea: 'kleine Kräuselwellen', waveHeight: 0.1, effect: 'Rauch treibt leicht ab; kaum Fahrt.' },
  { force: 2, name: 'Leichte Brise', minKn: 4, maxKn: 6, sea: 'kurze Wellen, glasig', waveHeight: 0.2, effect: 'Wind im Gesicht spürbar; Segel füllen sich.' },
  { force: 3, name: 'Schwache Brise', minKn: 7, maxKn: 10, sea: 'Wellenkämme beginnen sich zu brechen', waveHeight: 0.6, effect: 'Fahnen wehen; gute Segelbedingungen.' },
  { force: 4, name: 'Mäßige Brise', minKn: 11, maxKn: 16, sea: 'zahlreiche Schaumköpfe', waveHeight: 1.0, effect: 'Staub und Papier fliegen; Yacht segelt zügig.' },
  { force: 5, name: 'Frische Brise', minKn: 17, maxKn: 21, sea: 'mäßige Wellen mit vielen Schaumkronen', waveHeight: 2.0, effect: 'Erstes Reffen der Segel ratsam.' },
  { force: 6, name: 'Starker Wind', minKn: 22, maxKn: 27, sea: 'große Wellen, Schaumstreifen', waveHeight: 3.0, effect: 'Tiefes Reff nötig; Pfeifen in den Wanten.' },
  { force: 7, name: 'Steifer Wind', minKn: 28, maxKn: 33, sea: 'See türmt sich, Schaum weht in Streifen', waveHeight: 4.0, effect: 'Für kleine Yachten kaum noch zumutbar.' },
  { force: 8, name: 'Stürmischer Wind (Sturm)', minKn: 34, maxKn: 40, sea: 'hohe Wellen, Gischt', waveHeight: 5.5, effect: 'Sturmwarnung („Gale"); Hafen suchen.' },
  { force: 9, name: 'Sturm', minKn: 41, maxKn: 47, sea: 'sehr hohe Wellen, dichte Schaumstreifen', waveHeight: 7.0, effect: 'Schwerer Sturm („Severe gale").' },
  { force: 10, name: 'Schwerer Sturm', minKn: 48, maxKn: 55, sea: 'überbrechende See, weiße Oberfläche', waveHeight: 9.0, effect: 'Orkanartiger Sturm („Storm").' },
  { force: 11, name: 'Orkanartiger Sturm', minKn: 56, maxKn: 63, sea: 'außergewöhnlich hohe See, Sicht stark vermindert', waveHeight: 11.5, effect: 'Heftiger Sturm („Violent storm").' },
  { force: 12, name: 'Orkan', minKn: 64, maxKn: null, sea: 'Luft mit Schaum und Gischt erfüllt', waveHeight: 14, effect: 'Orkan („Hurricane force").' },
]

/** Windstärke aus Knoten (auf ganze Knoten gerundet). */
export function beaufortFromKnots(kn: number): number {
  if (!Number.isFinite(kn) || kn < 0) return 0
  const k = Math.round(kn)
  if (k < 1) return 0
  for (const b of BEAUFORT) if (b.maxKn !== null && k <= b.maxKn) return b.force
  return 12
}

export const KN_TO_MS = 1852 / 3600
export const knotsToMs = (kn: number): number => kn * KN_TO_MS
export const msToKnots = (ms: number): number => ms / KN_TO_MS
export const knotsToKmh = (kn: number): number => kn * 1.852

/**
 * Buys-Ballot-Regel: Mit dem Rücken zum Wind liegt das Tiefdruckgebiet auf der Nordhalbkugel links
 * (auf der Südhalbkugel rechts). `windFrom` = Richtung, aus der der Wind weht.
 */
export function lowPressureDirection(windFrom: number, hemisphere: 'north' | 'south' = 'north'): number {
  return normalizeAngle(windFrom + (hemisphere === 'north' ? 90 : -90))
}

/** Winddrehung: im Uhrzeigersinn = „veering" (rechtsdrehend), gegen den Uhrzeigersinn = „backing". */
export function windShift(from: number, to: number): { kind: 'veer' | 'back' | 'none'; degrees: number } {
  const d = angleDifference(from, to)
  if (Math.abs(d) < 0.5) return { kind: 'none', degrees: 0 }
  return { kind: d > 0 ? 'veer' : 'back', degrees: Math.abs(d) }
}

/** Luftdruckänderung der letzten 3 Stunden (hPa) in den Begriffen des britischen Seewetterberichts. */
export function pressureTendency(changeHpaIn3h: number): string {
  const a = Math.abs(changeHpaIn3h)
  if (a < 0.1) return 'beständig (steady)'
  const dir = changeHpaIn3h > 0 ? 'steigend (rising)' : 'fallend (falling)'
  if (a <= 1.5) return `${dir} langsam (slowly)`
  if (a <= 3.5) return dir
  if (a <= 6.0) return `${dir} schnell (quickly)`
  return `${dir} sehr schnell (very rapidly)`
}

/** Sichtweiten-Begriffe des britischen Seewetterberichts. */
export function visibilityTerm(nm: number): string {
  if (nm > 5) return 'gut (good): über 5 NM'
  if (nm >= 2) return 'mäßig (moderate): 2 bis 5 NM'
  if (nm >= 0.54) return 'schlecht (poor): 1000 m bis 2 NM'
  return 'Nebel (fog): unter 1000 m'
}
