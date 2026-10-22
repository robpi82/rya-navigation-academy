import { formatBearing, formatNumber, greatCircle, rhumbDestination, rhumbLine } from '@/calculations'
import { AREA_BY_ID } from '@/data/practiceAreas'
import { dm, formatLat, formatLon } from '@/lib/coords'
import type { CourseLevel } from '@/types/learning'
import type { LatLon } from '@/types/navigation'
import type { AnswerField } from './chartExercises'

/**
 * Kartenaufgaben auf der realen OpenSeaMap-Karte. Die Positionen sind feste Übungs-Wegpunkte in offenem Wasser
 * (mit Abstand zur Küste gewählt und gegen die gemeinfreien Natural-Earth-Küstenlinien geprüft); Lagehinweise sind
 * nur grobe Orientierung. Musterlösungen werden aus den Koordinaten berechnet (Loxodrome, Kugelmodell wie bei den
 * Aufgaben im Übungsrevier) – keine hart codierten Ergebnisse.
 */

export interface RealWaypoint {
  name: string
  /** ungefähre Lagebeschreibung (Orientierung, keine Navigationsangabe) */
  hint: string
  pos: LatLon
}

interface Base {
  id: string
  title: string
  areaId: string
  level: CourseLevel
  difficulty: 1 | 2 | 3
}

export type RealExercise = Base &
  (
    | { type: 'course-distance'; from: RealWaypoint; to: RealWaypoint }
    /** Koppelort: vom Startpunkt Kurs und Distanz absetzen, Endposition plotten */
    | { type: 'dr-plot'; from: RealWaypoint; course: number; distance: number }
    /** Position nach Koordinaten in die Karte eintragen */
    | { type: 'plot-position'; target: RealWaypoint }
  )


const wp = (name: string, hint: string, lat: [number, number], lon: [number, number, 'E' | 'W']): RealWaypoint => ({
  name,
  hint,
  pos: { lat: dm(lat[0], lat[1], 'N'), lon: dm(lon[0], lon[1], lon[2]) },
})

export const REAL_CHART_EXERCISES: RealExercise[] = [
  // Solent / Isle of Wight
  {
    id: 'rc-01',
    title: 'Kurs und Distanz südlich der Isle of Wight',
    areaId: 'solent',
    level: 'day-skipper',
    difficulty: 1,
    type: 'course-distance',
    from: wp('WP 1', 'etwa 2,5 sm südlich von St Catherine’s Point', [50, 32.0], [1, 17.0, 'W']),
    to: wp('WP 2', 'etwa 4 sm südwestlich der Needles', [50, 37.0], [1, 40.0, 'W']),
  },
  {
    id: 'rc-02',
    title: 'Koppelort östlich von St Catherine’s Point',
    areaId: 'solent',
    level: 'day-skipper',
    difficulty: 2,
    type: 'dr-plot',
    from: wp('WP 3', 'etwa 5 sm ostsüdöstlich von St Catherine’s Point', [50, 33.0], [1, 10.0, 'W']),
    course: 45,
    distance: 6,
  },
  // Plymouth
  {
    id: 'rc-03',
    title: 'Kurs und Distanz vor Plymouth Sound',
    areaId: 'plymouth',
    level: 'day-skipper',
    difficulty: 1,
    type: 'course-distance',
    from: wp('WP A', 'etwa 2 sm südlich des Wellenbrechers von Plymouth Sound', [50, 18.0], [4, 9.0, 'W']),
    to: wp('WP B', 'offenes Wasser östlich der Ansteuerung, rund 2 sm vor der Küste', [50, 16.0], [4, 2.0, 'W']),
  },
  {
    id: 'rc-04',
    title: 'Position eintragen: Ansteuerung Plymouth',
    areaId: 'plymouth',
    level: 'day-skipper',
    difficulty: 1,
    type: 'plot-position',
    target: wp('Position P', 'rund 4 sm südlich von Rame Head', [50, 15.0], [4, 15.0, 'W']),
  },
  // Portsmouth Harbour
  {
    id: 'rc-05',
    title: 'Von Spithead zur Hafenansteuerung Portsmouth',
    areaId: 'portsmouth',
    level: 'day-skipper',
    difficulty: 1,
    type: 'course-distance',
    from: wp('WP S', 'Spithead, nördlich von Ryde', [50, 45.0], [1, 8.0, 'W']),
    to: wp('WP H', 'Ansteuerung südlich der Hafeneinfahrt', [50, 46.8], [1, 6.6, 'W']),
  },
  {
    id: 'rc-06',
    title: 'Koppelort nach dem Auslaufen aus Portsmouth',
    areaId: 'portsmouth',
    level: 'day-skipper',
    difficulty: 2,
    type: 'dr-plot',
    from: wp('WP H', 'Ansteuerung südlich der Hafeneinfahrt', [50, 46.8], [1, 6.6, 'W']),
    course: 200,
    distance: 1.5,
  },
  // Baiona und Ría de Vigo
  {
    id: 'rc-07',
    title: 'Durch die Boca Sur in die Ría de Vigo',
    areaId: 'vigo',
    level: 'day-skipper',
    difficulty: 1,
    type: 'course-distance',
    from: wp('WP 1', 'Südeinfahrt der Ría (Boca Sur), südlich der Islas Cíes', [42, 10.0], [8, 53.5, 'W']),
    to: wp('WP 2', 'Ría de Vigo, Mitte', [42, 14.5], [8, 47.0, 'W']),
  },
  {
    id: 'rc-08',
    title: 'Position eintragen: vor Cabo Silleiro',
    areaId: 'vigo',
    level: 'day-skipper',
    difficulty: 1,
    type: 'plot-position',
    target: wp('Position P', 'rund 3,5 sm nordwestlich von Cabo Silleiro', [42, 8.0], [8, 58.0, 'W']),
  },
  // Kieler Förde
  {
    id: 'rc-09',
    title: 'Aus der Kieler Außenförde in die Bucht',
    areaId: 'kiel',
    level: 'day-skipper',
    difficulty: 1,
    type: 'course-distance',
    from: wp('WP 1', 'Kieler Außenförde', [54, 26.0], [10, 13.0, 'E']),
    to: wp('WP 2', 'Kieler Bucht, Ansteuerung der Förde', [54, 29.0], [10, 16.0, 'E']),
  },
  {
    id: 'rc-10',
    title: 'Koppelort in der Kieler Bucht',
    areaId: 'kiel',
    level: 'day-skipper',
    difficulty: 2,
    type: 'dr-plot',
    from: wp('WP 1', 'Kieler Außenförde', [54, 26.0], [10, 13.0, 'E']),
    course: 60,
    distance: 3,
  },
]

export const REAL_EXERCISE_BY_ID: Record<string, RealExercise> = Object.fromEntries(REAL_CHART_EXERCISES.map((e) => [e.id, e]))

export const formatPos = (p: LatLon) => `${formatLat(p.lat, 1)} ${formatLon(p.lon, 1)}`

export interface RealSolution {
  prompt: string
  /** Zahlenfelder (Kurs, Distanz) */
  fields: AnswerField[]
  /** zu plottende Position */
  plot?: { pos: LatLon; toleranceNm: number }
  steps: string[]
  /** in der Karte angezeigte Aufgabenmarker */
  markers: { name: string; pos: LatLon; symbol: 'start' | 'target' }[]
  /** Linie der Musterlösung */
  solutionLine?: { points: LatLon[]; label: string }
  /** Startausschnitt der Karte (verrät die Lösung nicht) */
  fitTo: LatLon[]
  /** nur bei Kurs/Distanz-Aufgaben */
  rhumb?: { bearing: number; distance: number }
  greatCircle?: { initialBearing: number; distance: number }
}

/** Toleranzen wie bei den Aufgaben im Übungsrevier: Kurs ± 2°, Distanz ± 0,2 sm; geplottete Positionen ± 0,2 sm (Koppelort) bzw. ± 0,15 sm */
export const COURSE_TOLERANCE = 2
export const DISTANCE_TOLERANCE = 0.2
export const DR_TOLERANCE = 0.2
export const POSITION_TOLERANCE = 0.15

const f2 = (n: number) => formatNumber(n, 2)
const course3 = (c: number) => String(Math.round(c)).padStart(3, '0') + '°'

export function solveRealExercise(e: RealExercise): RealSolution {
  switch (e.type) {
    case 'course-distance': {
      const r = rhumbLine(e.from.pos, e.to.pos)
      const gc = greatCircle(e.from.pos, e.to.pos)!
      return {
        prompt: `Miss in der Karte den rechtweisenden Kurs und die Distanz von ${e.from.name} (${formatPos(e.from.pos)}, ${e.from.hint}) nach ${e.to.name} (${formatPos(e.to.pos)}, ${e.to.hint}).`,
        fields: [
          { key: 'course', label: 'Kurs (rechtweisend)', unit: '°', value: r.bearing!, tolerance: COURSE_TOLERANCE, bearing: true },
          { key: 'distance', label: 'Distanz', unit: 'NM', value: r.distance, tolerance: DISTANCE_TOLERANCE },
        ],
        steps: [
          `Beide Wegpunkte anhand ihrer Koordinaten suchen (Positionsanzeige unten rechts); ${e.from.name} und ${e.to.name} liegen in offenem Wasser.`,
          'Werkzeug „Messen“ wählen, erst den Startpunkt, dann den Zielpunkt anklicken (Klicks rasten an den Aufgabenmarkern ein).',
          `Kurs entlang der Kurslinie (Loxodrome, auf der Mercatorkarte eine Gerade): ${formatBearing(r.bearing)}.`,
          `Distanz: ${f2(r.distance)} sm – 1 sm entspricht einer Bogenminute Breite.`,
          `Zum Vergleich der Großkreis: Anfangskurs ${formatBearing(gc.initialBearing)}, ${f2(gc.distance)} sm. Auf Küstenstrecken ist der Unterschied vernachlässigbar; gesteuert wird der Loxodromenkurs.`,
        ],
        markers: [
          { name: e.from.name, pos: e.from.pos, symbol: 'start' },
          { name: e.to.name, pos: e.to.pos, symbol: 'target' },
        ],
        solutionLine: { points: [e.from.pos, e.to.pos], label: `Lösung ${formatBearing(r.bearing, 0)} · ${f2(r.distance)} sm` },
        fitTo: [e.from.pos, e.to.pos],
        rhumb: { bearing: r.bearing!, distance: r.distance },
        greatCircle: { initialBearing: gc.initialBearing, distance: gc.distance },
      }
    }
    case 'dr-plot': {
      const end = rhumbDestination(e.from.pos, e.course, e.distance)
      // Ausschnitt: Kreis mit der Distanz um den Start – verrät die Richtung nicht
      const ring = [0, 90, 180, 270].map((b) => rhumbDestination(e.from.pos, b, e.distance))
      return {
        prompt: `Du startest bei ${e.from.name} (${formatPos(e.from.pos)}, ${e.from.hint}) und läufst über Grund ${course3(e.course)} rechtweisend für ${formatNumber(e.distance, 1)} sm. Trage den Koppelort (DR) in die Karte ein.`,
        fields: [],
        plot: { pos: end, toleranceNm: DR_TOLERANCE },
        steps: [
          `Vom Startpunkt ${e.from.name} aus die Kurslinie ${course3(e.course)} als Gerade absetzen (auf der Mercatorkarte ist ein konstanter Kurs eine Gerade).`,
          `Auf der Linie ${formatNumber(e.distance, 1)} sm abtragen – Distanzen am Breitenmaßstab messen (1′ Breite = 1 sm). In der App zeigt die Anzeige „von ${e.from.name}“ Kurs und Distanz zu deiner gesetzten Position.`,
          `Koppelort: ${formatPos(end)} (Toleranz ± ${formatNumber(DR_TOLERANCE, 1)} sm). Als DR-Symbol einen Strich quer zur Kurslinie mit der Uhrzeit eintragen.`,
        ],
        markers: [{ name: e.from.name, pos: e.from.pos, symbol: 'start' }],
        solutionLine: { points: [e.from.pos, end], label: `${course3(e.course)} · ${formatNumber(e.distance, 1)} sm` },
        fitTo: ring,
      }
    }
    case 'plot-position': {
      const b = AREA_BY_ID[e.areaId].bounds
      return {
        prompt: `Trage die Position ${formatPos(e.target.pos)} in die Karte ein (${e.target.hint}).`,
        fields: [],
        plot: { pos: e.target.pos, toleranceNm: POSITION_TOLERANCE },
        steps: [
          'Breite am Gitter bzw. in der Positionsanzeige suchen: Grad und Minuten nach Norden zählen (1′ Breite = 1 sm).',
          'Länge ebenso entlang der Breitenparallele abgreifen; Westlängen nehmen nach Westen zu, Ostlängen nach Osten.',
          `Position im Schnittpunkt setzen: ${formatPos(e.target.pos)} (Toleranz ± ${formatNumber(POSITION_TOLERANCE, 2)} sm).`,
        ],
        markers: [],
        fitTo: [
          { lat: b.south, lon: b.west },
          { lat: b.north, lon: b.east },
        ],
      }
    }
  }
}

export const REAL_TYPE_LABEL: Record<RealExercise['type'], string> = {
  'course-distance': 'Kurs und Distanz',
  'dr-plot': 'Koppelort plotten',
  'plot-position': 'Position eintragen',
}
