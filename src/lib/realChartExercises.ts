import { formatBearing, formatNumber, greatCircle, rhumbLine } from '@/calculations'
import { dm, formatLat, formatLon } from '@/lib/coords'
import type { CourseLevel } from '@/types/learning'
import type { LatLon } from '@/types/navigation'
import type { AnswerField } from './chartExercises'

/**
 * Kartenaufgaben auf der realen OpenSeaMap-Karte. Positionen sind feste Übungs-Wegpunkte in offenem Wasser;
 * die Musterlösung wird aus den Koordinaten berechnet (Loxodrome, Kugelmodell wie bei den übrigen Kartenaufgaben).
 */

export interface RealWaypoint {
  name: string
  /** ungefähre Lagebeschreibung (Orientierung, keine Navigationsangabe) */
  hint: string
  pos: LatLon
}

export interface RealCourseExercise {
  id: string
  title: string
  areaId: string
  level: CourseLevel
  difficulty: 1 | 2 | 3
  type: 'course-distance'
  from: RealWaypoint
  to: RealWaypoint
}

export const REAL_CHART_EXERCISES: RealCourseExercise[] = [
  {
    id: 'rc-01',
    title: 'Kurs und Distanz südlich der Isle of Wight',
    areaId: 'solent',
    level: 'day-skipper',
    difficulty: 1,
    type: 'course-distance',
    from: { name: 'WP 1', hint: 'etwa 2,5 sm südlich von St Catherine’s Point', pos: { lat: dm(50, 32.0, 'N'), lon: dm(1, 17.0, 'W') } },
    to: { name: 'WP 2', hint: 'etwa 4 sm südwestlich der Needles', pos: { lat: dm(50, 37.0, 'N'), lon: dm(1, 40.0, 'W') } },
  },
]

export const formatPos = (p: LatLon) => `${formatLat(p.lat, 1)} ${formatLon(p.lon, 1)}`

export interface RealSolution {
  prompt: string
  fields: AnswerField[]
  steps: string[]
  rhumb: { bearing: number; distance: number }
  greatCircle: { initialBearing: number; distance: number }
}

/** Toleranzen wie bei den Aufgaben im Übungsrevier: Kurs ± 2°, Distanz ± 0,2 sm */
export const COURSE_TOLERANCE = 2
export const DISTANCE_TOLERANCE = 0.2

export function solveRealExercise(e: RealCourseExercise): RealSolution {
  const r = rhumbLine(e.from.pos, e.to.pos)
  const gc = greatCircle(e.from.pos, e.to.pos)!
  const f2 = (n: number) => formatNumber(n, 2)
  return {
    prompt: `Miss in der Karte den rechtweisenden Kurs und die Distanz von ${e.from.name} (${formatPos(e.from.pos)}, ${e.from.hint}) nach ${e.to.name} (${formatPos(e.to.pos)}, ${e.to.hint}).`,
    fields: [
      { key: 'course', label: 'Kurs (rechtweisend)', unit: '°', value: r.bearing!, tolerance: COURSE_TOLERANCE, bearing: true },
      { key: 'distance', label: 'Distanz', unit: 'NM', value: r.distance, tolerance: DISTANCE_TOLERANCE },
    ],
    steps: [
      `Beide Wegpunkte anhand ihrer Koordinaten suchen: Breite am Kartenrand bzw. in der Positionsanzeige ablesen, ${e.from.name} und ${e.to.name} liegen in offenem Wasser.`,
      'Werkzeug „Messen“ wählen, erst den Startpunkt, dann den Zielpunkt anklicken (Klicks rasten an den Aufgabenmarkern ein).',
      `Kurs entlang der Kurslinie (Loxodrome, auf der Mercatorkarte eine Gerade): ${formatBearing(r.bearing)}.`,
      `Distanz: ${f2(r.distance)} sm – 1 sm entspricht einer Bogenminute Breite.`,
      `Zum Vergleich der Großkreis: Anfangskurs ${formatBearing(gc.initialBearing)}, ${f2(gc.distance)} sm. Auf Küstenstrecken ist der Unterschied vernachlässigbar; gesteuert wird der Loxodromenkurs.`,
    ],
    rhumb: { bearing: r.bearing!, distance: r.distance },
    greatCircle: { initialBearing: gc.initialBearing, distance: gc.distance },
  }
}
