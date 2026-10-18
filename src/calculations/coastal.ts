import type { Vector2 } from '@/types/navigation'
import { angleDifference } from './angles'
import { fromPolar } from './vectors'

/** Kumulierte Zwölftel je Stunde nach Niedrigwasser (Zwölftelregel 1-2-3-3-2-1). */
const TWELFTHS = [0, 1, 3, 6, 9, 11, 12]

/**
 * Wasserhöhe nach der Zwölftelregel bei steigendem Wasser.
 * Zwischen den vollen Stunden wird linear interpoliert. Gilt näherungsweise für ~6 h Steigdauer.
 */
export function heightByTwelfths(lwHeight: number, hwHeight: number, hoursAfterLw: number): number {
  const h = Math.max(0, Math.min(6, hoursAfterLw))
  const i = Math.floor(h)
  const frac = h - i
  const twelfths = i >= 6 ? 12 : TWELFTHS[i] + (TWELFTHS[i + 1] - TWELFTHS[i]) * frac
  return lwHeight + ((hwHeight - lwHeight) * twelfths) / 12
}

/** Früheste Zeit (h nach NW), zu der die Wasserhöhe `required` erreicht ist; null wenn nie. */
export function timeForHeight(lwHeight: number, hwHeight: number, required: number): number | null {
  if (required <= lwHeight) return 0
  if (required > hwHeight) return null
  let lo = 0
  let hi = 6
  for (let k = 0; k < 60; k++) {
    const mid = (lo + hi) / 2
    if (heightByTwelfths(lwHeight, hwHeight, mid) >= required) hi = mid
    else lo = mid
  }
  return hi
}

/**
 * Versegelungspeilung (Running Fix): Dasselbe Objekt wird zweimal gepeilt. Die erste Standlinie wird
 * um den zwischenzeitlich über Grund zurückgelegten Weg (`run`, NM) versetzt und mit der zweiten geschnitten.
 * Rückgabe: Position zum Zeitpunkt der 2. Peilung relativ zum Objekt (NM, x Ost, y Nord), oder null bei
 * (nahezu) parallelen Standlinien.
 */
export function runningFix(bearing1: number, bearing2: number, run: Vector2): Vector2 | null {
  // Standlinie: Boot liegt auf O − s·u(b), s ≥ 0. Erste Linie versetzt um run.
  const u1 = fromPolar(1, bearing1)
  const u2 = fromPolar(1, bearing2)
  // run − s1·u1 = −s2·u2  →  s1·u1 − s2·u2 = run
  const det = u1.x * -u2.y - -u2.x * u1.y
  if (Math.abs(det) < 1e-6) return null
  const s1 = (run.x * -u2.y - -u2.x * run.y) / det
  return { x: run.x - s1 * u1.x, y: run.y - s1 * u1.y }
}

/**
 * Gefahrenpeilung (Clearing Bearing): „NMT" = not more than, „NLT" = not less than.
 * Liefert true, wenn die beobachtete Peilung auf der sicheren Seite liegt.
 */
export function isClearOfDanger(observed: number, limit: number, type: 'NMT' | 'NLT'): boolean {
  const d = angleDifference(limit, observed)
  return type === 'NMT' ? d <= 0 : d >= 0
}
