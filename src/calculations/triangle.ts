import type {
  CourseToSteerResult,
  SimulationInput,
  SimulationResult,
  Vector2,
  VelocityTriangle,
} from '@/types/navigation'
import { degToRad, normalizeAngle, radToDeg } from './angles'
import { addVectors, direction, dot, fromPolar, magnitude, scaleVector, ZERO_THRESHOLD } from './vectors'

/** Water Track = Heading + Leeway (Leeway positiv = Abdrift nach Steuerbord). */
export const waterTrackFromHeading = (heading: number, leeway: number): number =>
  normalizeAngle(heading + leeway)

/**
 * Berechnet das Geschwindigkeitsdreieck:
 * Fahrt durchs Wasser (entlang des Water Track) + Strom = Fahrt über Grund.
 */
export function computeVelocityTriangle(
  input: Pick<SimulationInput, 'heading' | 'stw' | 'tideDirection' | 'tideRate' | 'leeway'>,
): VelocityTriangle {
  const waterTrack = waterTrackFromHeading(input.heading, input.leeway)
  const waterVelocity = fromPolar(input.stw, waterTrack)
  const tideVelocity = fromPolar(input.tideRate, input.tideDirection)
  const groundVelocity = addVectors(waterVelocity, tideVelocity)
  const sogRaw = magnitude(groundVelocity)
  const sog = sogRaw < ZERO_THRESHOLD ? 0 : sogRaw
  return {
    waterTrack,
    waterVelocity,
    tideVelocity,
    groundVelocity,
    sog,
    cog: direction(groundVelocity),
  }
}

/** Vollständige Simulation über eine Dauer: Distanzen und Endpunkte in NM relativ zum Start. */
export function simulate(input: SimulationInput): SimulationResult {
  const tri = computeVelocityTriangle(input)
  const t = Math.max(0, input.durationMin) / 60
  return {
    ...tri,
    durationHours: t,
    waterTrackEnd: scaleVector(tri.waterVelocity, t),
    groundTrackEnd: scaleVector(tri.groundVelocity, t),
    headingEnd: fromPolar(input.stw * t, input.heading),
    distanceThroughWater: input.stw * t,
    distanceOverGround: tri.sog * t,
    tideDrift: input.tideRate * t,
  }
}

/** Position nach `elapsedHours` (für die Animation). */
export const positionAt = (groundVelocity: Vector2, elapsedHours: number): Vector2 =>
  scaleVector(groundVelocity, elapsedHours)

/**
 * Course to Steer (Stromdreieck „rückwärts"):
 * Gesucht ist der Water Track w, sodass (STW entlang w) + Strom exakt auf dem gewünschten
 * Kurs über Grund liegt. Zerlegt man den Strom in eine Komponente entlang des Sollkurses (Ta)
 * und quer dazu (Tc, positiv nach Steuerbord), muss gelten: STW · sin(w − Kurs) = −Tc.
 * Ist |Tc| > STW, kann der Kurs nicht gehalten werden.
 * Anschließend wird Leeway berücksichtigt: Heading = Water Track − Leeway.
 */
export function courseToSteer(params: {
  desiredTrack: number
  stw: number
  tideDirection: number
  tideRate: number
  leeway?: number
  distance?: number
}): CourseToSteerResult {
  const { desiredTrack, stw, tideDirection, tideRate, leeway = 0, distance } = params
  if (!(stw > 0)) {
    return {
      feasible: false,
      reason: 'no-speed',
      message: 'Ohne Fahrt durchs Wasser (STW = 0) kann kein Kurs gesteuert werden.',
    }
  }
  const along = fromPolar(1, desiredTrack)
  const starboard = fromPolar(1, desiredTrack + 90)
  const tide = fromPolar(tideRate, tideDirection)
  const ta = dot(tide, along)
  const tc = dot(tide, starboard)

  const ratio = -tc / stw
  if (Math.abs(ratio) > 1 + 1e-12) {
    return {
      feasible: false,
      reason: 'cross-tide-too-strong',
      message: `Die Querkomponente des Stroms (${Math.abs(tc).toFixed(2)} kn) ist größer als die Fahrt durchs Wasser (${stw.toFixed(2)} kn). Der gewünschte Kurs kann nicht gehalten werden.`,
    }
  }
  const alpha = radToDeg(Math.asin(Math.max(-1, Math.min(1, ratio))))
  const sog = stw * Math.cos(degToRad(alpha)) + ta
  if (sog <= ZERO_THRESHOLD) {
    return {
      feasible: false,
      reason: 'no-progress',
      message: `Der Gegenstrom ist zu stark: Entlang des gewünschten Kurses ergibt sich keine Fahrt über Grund (${sog.toFixed(2)} kn). Das Ziel ist so nicht erreichbar.`,
    }
  }
  const waterTrack = normalizeAngle(desiredTrack + alpha)
  return {
    feasible: true,
    waterTrack,
    courseToSteer: normalizeAngle(waterTrack - leeway),
    sog,
    timeHours: distance !== undefined && distance >= 0 ? distance / sog : null,
  }
}
