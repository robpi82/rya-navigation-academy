/**
 * Navigation bei verminderter Sicht (Coastal): Zeit bis zur Begegnung, Anhalteweg und sichere Geschwindigkeit.
 * Vereinfachte Modelle für Lernzwecke – tatsächliche Anhaltewege hängen von Boot, Maschine, Wind und Seegang ab.
 */
import { METERS_PER_NM } from './dst'
import { KN_TO_MS } from './weather'

/** Zeit für Erkennen, Entscheiden und Handeln (s), wenn ein Fahrzeug aus dem Nebel auftaucht. */
export const FOG_REACTION_SEC = 30

/** Zeit (s), bis ein Fahrzeug, das an der Sichtgrenze auftaucht, bei gegebener Annäherungsgeschwindigkeit heran ist. */
export function secondsToMeet(visibilityNm: number, closingKn: number): number {
  if (closingKn <= 0) return Infinity
  return (visibilityNm / closingKn) * 3600
}

/** Annäherungsgeschwindigkeit zweier Fahrzeuge auf Gegenkurs bzw. allgemein über den Winkel zwischen den Kursen. */
export function closingSpeed(ownKn: number, otherKn: number, angleBetweenCourses = 180): number {
  const a = (angleBetweenCourses * Math.PI) / 180
  return Math.sqrt(ownKn ** 2 + otherKn ** 2 - 2 * ownKn * otherKn * Math.cos(a))
}

/** Anhalteweg (m): Weg während der Reaktionszeit plus Bremsweg mit konstanter Verzögerung (Maschine voll zurück). */
export function stoppingDistance(speedKn: number, reactionSec = FOG_REACTION_SEC, decelMs2 = 0.3): number {
  const v = speedKn * KN_TO_MS
  return v * reactionSec + (v * v) / (2 * decelMs2)
}

/**
 * Höchstgeschwindigkeit (kn), bei der das Boot innerhalb der halben Sichtweite anhalten kann (Faustregel für Rule 6/19).
 * Löst v·t + v²/(2a) = Sichtweite/2 nach v.
 */
export function safeSpeedForVisibility(visibilityNm: number, reactionSec = FOG_REACTION_SEC, decelMs2 = 0.3): number {
  const d = (visibilityNm * METERS_PER_NM) / 2
  const a = decelMs2
  const t = reactionSec
  const v = -a * t + Math.sqrt((a * t) ** 2 + 2 * a * d)
  return v / KN_TO_MS
}
