/**
 * Festmachen bei Gezeiten (Coastal): Leinenlänge zwischen Klampe an Bord (steigt und fällt mit dem Wasser) und Poller
 * an der Pier (fest). Höhen in m über Kartennull, horizontale Abstände in m.
 */

/** Höhenunterschied Poller – Klampe: Pollerhöhe minus (Höhe der Gezeit + Freibord an der Klampe). */
export const verticalGap = (bollardHeight: number, tideHeight: number, freeboard: number): number => bollardHeight - (tideHeight + freeboard)

/** Leinenlänge (m) bei gegebenem horizontalem Abstand und Höhenunterschied. */
export const lineLength = (horizontal: number, vertical: number): number => Math.hypot(horizontal, vertical)

/**
 * Zusätzliche Leinenlänge, die zwischen zwei Gezeitenhöhen nötig ist (positiv = Leine muss länger werden).
 * Lange Leinen (großer horizontaler Abstand, z. B. Springs) brauchen viel weniger Nachstellen als kurze Querleinen.
 */
export function lineAdjustment(horizontal: number, bollardHeight: number, freeboard: number, fromTide: number, toTide: number): number {
  return lineLength(horizontal, verticalGap(bollardHeight, toTide, freeboard)) - lineLength(horizontal, verticalGap(bollardHeight, fromTide, freeboard))
}

/** Höhenunterschied Pierkante – Deck (m): positiv = Pier liegt höher als das Deck (Leiter nötig). */
export const climb = (quayEdge: number, tideHeight: number, deckFreeboard: number): number => quayEdge - (tideHeight + deckFreeboard)
