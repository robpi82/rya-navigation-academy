import type { Vector2 } from '@/types/navigation'
import { degToRad, normalizeAngle, radToDeg } from './angles'

/** Unterhalb dieses Betrags gilt ein Vektor als Nullvektor (Richtung undefiniert). */
export const ZERO_THRESHOLD = 1e-6

/**
 * Wandelt Betrag und nautische Richtung in einen Vektor um.
 * x = v · sin(θ) (Ost), y = v · cos(θ) (Nord)
 */
export function fromPolar(magnitude: number, directionDeg: number): Vector2 {
  const r = degToRad(directionDeg)
  return { x: magnitude * Math.sin(r), y: magnitude * Math.cos(r) }
}

export const addVectors = (...vs: Vector2[]): Vector2 =>
  vs.reduce((acc, v) => ({ x: acc.x + v.x, y: acc.y + v.y }), { x: 0, y: 0 })

export const subtractVectors = (a: Vector2, b: Vector2): Vector2 => ({ x: a.x - b.x, y: a.y - b.y })

export const scaleVector = (v: Vector2, k: number): Vector2 => ({ x: v.x * k, y: v.y * k })

export const magnitude = (v: Vector2): number => Math.hypot(v.x, v.y)

/** Skalarprodukt */
export const dot = (a: Vector2, b: Vector2): number => a.x * b.x + a.y * b.y

/**
 * Nautische Richtung eines Vektors: atan2(x, y), normiert auf [0, 360).
 * Gibt null zurück, wenn der Vektor (nahezu) null ist – die Richtung ist dann nicht definiert.
 */
export function direction(v: Vector2): number | null {
  if (magnitude(v) < ZERO_THRESHOLD) return null
  return normalizeAngle(radToDeg(Math.atan2(v.x, v.y)))
}
