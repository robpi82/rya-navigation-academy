import { anchorChainLength } from './tides'

/**
 * Ankern (Coastal): Kettenlänge, Schwojkreis und Wassertiefe am Ankerplatz über die ganze Tide.
 * Höhen in m über Kartennull, Längen in m. Vereinfachte Faustregeln für Lernzwecke.
 */

/** Faustregel: Kette mindestens 4 × Wassertiefe, Leine (mit Kettenvorlauf) mindestens 6 ×. */
export const SCOPE_CHAIN = 4
export const SCOPE_ROPE = 6

/** Größte Wassertiefe am Ankerplatz: Kartentiefe plus Höhe der Gezeit bei Hochwasser. */
export const maxDepth = (chartedDepth: number, hwHeight: number): number => chartedDepth + hwHeight

/** Zu steckende Kette (m): Verhältnis × größte Wassertiefe (plus optional Höhe der Bugrolle über Wasser). */
export const anchorRode = (chartedDepth: number, hwHeight: number, scope = SCOPE_CHAIN, bowHeight = 0): number => anchorChainLength(maxDepth(chartedDepth, hwHeight), bowHeight, scope)

/**
 * Schwojkreis (m) um den Anker: horizontale Länge der Kette bei Niedrigwasser (Kette fast gestreckt angenommen) plus Bootslänge.
 * Bei Niedrigwasser ist die Tiefe am kleinsten, der Kreis also am größten.
 */
export function swingRadius(rode: number, depthAtLw: number, boatLength: number): number {
  const horizontal = rode > depthAtLw ? Math.sqrt(rode * rode - depthAtLw * depthAtLw) : 0
  return horizontal + boatLength
}

/** Wasser unter dem Kiel bei Niedrigwasser (m): Kartentiefe + Höhe der Gezeit bei NW − Tiefgang. */
export const clearanceAtLw = (chartedDepth: number, lwHeight: number, draught: number): number => chartedDepth + lwHeight - draught

/** Kleinste Kartentiefe (m), in der man ankern darf: Tiefgang + Sicherheitsabstand − Höhe der Gezeit bei NW. */
export const minChartedDepth = (draught: number, margin: number, lwHeight: number): number => draught + margin - lwHeight
