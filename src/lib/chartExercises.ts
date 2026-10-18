import {
  angleDifference,
  computeVelocityTriangle,
  formatBearing,
  formatDuration,
  formatNumber,
  planPassage,
  rhumbDestination,
  rhumbLine,
  type HourlyTide,
} from '@/calculations'
import { hourLabel, MARK_BY_ID } from '@/data/chartArea'
import type { CourseLevel } from '@/types/learning'
import type { LatLon } from '@/types/navigation'
import { diamondById, tideAtDiamond } from './chartTides'

/**
 * Interaktive Kartenaufgaben im Übungsrevier. Alle Lösungen werden aus den Rechenfunktionen
 * abgeleitet (keine hart codierten Ergebnisse) und in src/tests/phase3.test.ts geprüft.
 */

const f1 = (n: number) => formatNumber(n, 1)
const f2 = (n: number) => formatNumber(n, 2)

interface Base {
  id: string
  title: string
  level: CourseLevel
  difficulty: 1 | 2 | 3
}

export type ChartExercise = Base &
  (
    | { type: 'course-distance'; from: string; to: string }
    | { type: 'tidal'; diamond: 'A' | 'B' | 'C'; hour: number; range: number }
    | { type: 'cts'; from: string; to: string; stw: number; leeway: number; diamond: 'A' | 'B' | 'C'; startHour: number; range: number }
    | { type: 'ep'; fix: LatLon; heading: number; leeway: number; stw: number; minutes: number; diamond: 'A' | 'B' | 'C'; hour: number; range: number }
    | { type: 'cross-bearing'; truePos: LatLon; marks: string[] }
  )

export const CHART_EXERCISES: ChartExercise[] = [
  { id: 'ce-01', title: 'Kurs und Distanz messen', level: 'day-skipper', difficulty: 1, type: 'course-distance', from: 'by-anst', to: 'by-riff' },
  { id: 'ce-02', title: 'Kurs und Distanz zwischen zwei Häfen', level: 'day-skipper', difficulty: 1, type: 'course-distance', from: 'hb-ankerstedt', to: 'hb-kranich' },
  { id: 'ce-03', title: 'Strom am Tidal Diamond ablesen', level: 'day-skipper', difficulty: 1, type: 'tidal', diamond: 'A', hour: -2, range: 3.2 },
  { id: 'ce-04', title: 'Strom bei Nipptide interpolieren', level: 'day-skipper', difficulty: 2, type: 'tidal', diamond: 'C', hour: 4, range: 2.6 },
  { id: 'ce-05', title: 'Kreuzpeilung plotten', level: 'day-skipper', difficulty: 2, type: 'cross-bearing', truePos: { lat: 50.716, lon: -1.37 }, marks: ['lt-moewe', 'ch-ankerstedt', 'lt-kranich'] },
  { id: 'ce-06', title: 'EP nach einer Stunde', level: 'day-skipper', difficulty: 2, type: 'ep', fix: { lat: 50.735, lon: -1.5 }, heading: 110, leeway: 0, stw: 5, minutes: 60, diamond: 'A', hour: -1, range: 3.5 },
  { id: 'ce-07', title: 'EP mit Leeway', level: 'day-skipper', difficulty: 3, type: 'ep', fix: { lat: 50.7, lon: -1.25 }, heading: 250, leeway: -6, stw: 6, minutes: 90, diamond: 'C', hour: 5, range: 3.0 },
  { id: 'ce-08', title: 'Course to Steer zur Inselansteuerung', level: 'day-skipper', difficulty: 2, type: 'cts', from: 'by-anst', to: 'hb-kranich', stw: 5, leeway: 0, diamond: 'C', startHour: -2, range: 3.0 },
  { id: 'ce-09', title: 'CTS um das Riff', level: 'day-skipper', difficulty: 3, type: 'cts', from: 'by-moewe', to: 'by-riff', stw: 5.5, leeway: 4, diamond: 'B', startHour: 3, range: 3.6 },
  { id: 'ce-10', title: 'Mehrstündige Passage mit kenterndem Strom', level: 'coastal-skipper', difficulty: 3, type: 'cts', from: 'by-riff', to: 'by-moewe', stw: 4.5, leeway: 0, diamond: 'C', startHour: 1, range: 3.4 },
  { id: 'ce-11', title: 'Kreuzpeilung mit Riff und Insel', level: 'day-skipper', difficulty: 2, type: 'cross-bearing', truePos: { lat: 50.672, lon: -1.19 }, marks: ['mast-nordhoehe', 'dm-kranich', 'lt-kranich'] },
]

export const CHART_EXERCISE_BY_ID: Record<string, ChartExercise> = Object.fromEntries(CHART_EXERCISES.map((e) => [e.id, e]))

/* ------------------------------------------------------------------ Lösungen */

export type AnswerField = { key: string; label: string; unit: string; value: number; tolerance: number; bearing?: boolean }

export interface ExerciseSolution {
  prompt: string
  /** Zahleneingaben (leer bei reinen Plotaufgaben) */
  fields: AnswerField[]
  /** Bei Plotaufgaben: gesuchte Position und Toleranzradius in NM */
  plot?: { pos: LatLon; toleranceNm: number; symbol: 'fix' | 'ep' }
  steps: string[]
  /** Hilfslinien für die Lösungsanzeige */
  lines: { from: LatLon; to: LatLon; kind: 'ground' | 'water' | 'tide' | 'bearing' }[]
  /** Punkte, die in der Aufgabe gegeben sind */
  given: { pos: LatLon; label: string; symbol: 'fix' | 'wp' }[]
}

const markName = (id: string) => MARK_BY_ID[id].name
const markPos = (id: string) => MARK_BY_ID[id].pos

function hourlyTides(diamond: 'A' | 'B' | 'C', startHour: number, range: number): HourlyTide[] {
  const d = diamondById(diamond)
  const out: HourlyTide[] = []
  for (let h = startHour; h <= 6; h++) {
    const t = tideAtDiamond(d, h, range)
    out.push({ set: t.set, rate: t.rate })
  }
  return out
}

export function solveExercise(e: ChartExercise): ExerciseSolution {
  switch (e.type) {
    case 'course-distance': {
      const a = markPos(e.from)
      const b = markPos(e.to)
      const r = rhumbLine(a, b)
      return {
        prompt: `Miss in der Karte den rechtweisenden Kurs und die Distanz von „${markName(e.from)}" nach „${markName(e.to)}".`,
        fields: [
          { key: 'course', label: 'Kurs', unit: '°', value: r.bearing!, tolerance: 2, bearing: true },
          { key: 'distance', label: 'Distanz', unit: 'NM', value: r.distance, tolerance: 0.2 },
        ],
        steps: [
          'Werkzeug „Messen": erst den Startpunkt, dann den Zielpunkt anklicken (Klicks rasten an Seezeichen ein).',
          `Kurs der Kurslinie: ${formatBearing(r.bearing)} – auf einer Mercatorkarte ist ein Kurs eine Gerade (Loxodrome).`,
          `Distanz: ${f2(r.distance)} NM – gemessen am seitlichen Breitenmaßstab (1′ = 1 NM), nie am Längenmaßstab.`,
        ],
        lines: [{ from: a, to: b, kind: 'ground' }],
        given: [],
      }
    }
    case 'tidal': {
      const d = diamondById(e.diamond)
      const t = tideAtDiamond(d, e.hour, e.range)
      return {
        prompt: `Tidenhub heute in Ankerstedt: ${f1(e.range)} m. Bestimme Set und Rate am Tidal Diamond ${e.diamond} für ${hourLabel(e.hour)}.`,
        fields: [
          { key: 'set', label: 'Set', unit: '°', value: t.set, tolerance: 1, bearing: true },
          { key: 'rate', label: 'Rate', unit: 'kn', value: t.rate, tolerance: 0.1 },
        ],
        steps: [
          `Tabelle Diamond ${e.diamond}, Zeile ${hourLabel(e.hour)}: Set ${String(t.set).padStart(3, '0')}°, Spring ${f1(t.spring)} kn, Nipp ${f1(t.neap)} kn.`,
          `Anteil zwischen Nipp und Spring: (${f1(e.range)} − 2,0) / (4,0 − 2,0) = ${f2(t.factor)}.`,
          `Rate = ${f1(t.neap)} + (${f1(t.spring)} − ${f1(t.neap)}) × ${f2(t.factor)} = ${f2(t.rate)} kn.`,
        ],
        lines: [],
        given: [],
      }
    }
    case 'cts': {
      const a = markPos(e.from)
      const b = markPos(e.to)
      const r = rhumbLine(a, b)
      const tides = hourlyTides(e.diamond, e.startHour, e.range)
      const plan = planPassage({ desiredTrack: r.bearing!, distance: r.distance, stw: e.stw, tides, leeway: e.leeway })
      if (!plan.feasible) throw new Error(`${e.id}: ${plan.message}`)
      const hoursUsed = Math.ceil(plan.hours - 1e-9)
      const tideEnd = rhumbDestination(a, Math.atan2(plan.tideTotal.x, plan.tideTotal.y) * (180 / Math.PI), Math.hypot(plan.tideTotal.x, plan.tideTotal.y))
      return {
        prompt: `Abfahrt bei „${markName(e.from)}" um ${hourLabel(e.startHour)}, Ziel „${markName(e.to)}". STW ${f1(e.stw)} kn${e.leeway ? `, Leeway ${e.leeway > 0 ? '+' : '−'}${Math.abs(e.leeway)}° (${e.leeway > 0 ? 'nach Steuerbord' : 'nach Backbord'})` : ', keine Leeway'}. Strom vom Tidal Diamond ${e.diamond}, Tidenhub ${f1(e.range)} m. Berechne den Course to Steer und die Fahrtzeit.`,
        fields: [
          { key: 'cts', label: 'Course to Steer', unit: '°', value: plan.courseToSteer, tolerance: 2, bearing: true },
          { key: 'time', label: 'Fahrtzeit', unit: 'min', value: plan.hours * 60, tolerance: 6 },
        ],
        steps: [
          `Ground Track ${formatBearing(r.bearing)}, Distanz ${f2(r.distance)} NM (in der Karte messen).`,
          `Strom ab ${hourLabel(e.startHour)} für ${hoursUsed} Stunde(n) aus Diamond ${e.diamond}: ${tides
            .slice(0, hoursUsed)
            .map((t, i) => `${hourLabel(e.startHour + i)} ${String(t.set).padStart(3, '0')}° ${f2(t.rate)} kn`)
            .join('; ')}.`,
          `Stromvektoren für die Fahrtzeit (${formatDuration(plan.hours)}) addieren: ${f2(Math.hypot(plan.tideTotal.x, plan.tideTotal.y))} NM nach ${formatBearing(Math.atan2(plan.tideTotal.x, plan.tideTotal.y) * (180 / Math.PI))}.`,
          `Vom Ende des Stromvektors ${f2(e.stw * plan.hours)} NM (STW × Zeit) bis zum Ground Track abtragen: Water Track ${formatBearing(plan.waterTrack)}.`,
          e.leeway ? `Leeway gegen den Wind vorhalten: CTS = ${formatBearing(plan.waterTrack)} − (${e.leeway}°) = ${formatBearing(plan.courseToSteer)}.` : `Keine Leeway: CTS = Water Track = ${formatBearing(plan.courseToSteer)}.`,
          `Mittlere SOG ${f2(plan.sogMean)} kn → Fahrtzeit ${formatDuration(plan.hours)}.`,
        ],
        lines: [
          { from: a, to: b, kind: 'ground' },
          { from: a, to: tideEnd, kind: 'tide' },
          { from: tideEnd, to: b, kind: 'water' },
        ],
        given: [],
      }
    }
    case 'ep': {
      const t = tideAtDiamond(diamondById(e.diamond), e.hour, e.range)
      const tri = computeVelocityTriangle({ heading: e.heading, stw: e.stw, leeway: e.leeway, tideDirection: t.set, tideRate: t.rate })
      const hours = e.minutes / 60
      const dr = rhumbDestination(e.fix, tri.waterTrack, e.stw * hours)
      const ep = rhumbDestination(dr, t.set, t.rate * hours)
      return {
        prompt: `Fix um ${hourLabel(e.hour)} (siehe Karte). Heading ${formatBearing(e.heading, 0)}, Log ${f1(e.stw)} kn${e.leeway ? `, Leeway ${e.leeway > 0 ? '+' : '−'}${Math.abs(e.leeway)}°` : ''}. Strom am Diamond ${e.diamond}, Tidenhub ${f1(e.range)} m. Setze die EP nach ${e.minutes} Minuten durch Klick in die Karte.`,
        fields: [],
        plot: { pos: ep, toleranceNm: 0.3, symbol: 'ep' },
        steps: [
          `Water Track = ${formatBearing(e.heading, 0)} ${e.leeway >= 0 ? '+' : '−'} ${Math.abs(e.leeway)}° = ${formatBearing(tri.waterTrack)}; Logdistanz = ${f1(e.stw)} kn × ${f2(hours)} h = ${f2(e.stw * hours)} NM (>).`,
          `Strom Diamond ${e.diamond} ${hourLabel(e.hour)}: ${String(t.set).padStart(3, '0')}°, ${f2(t.rate)} kn → Drift ${f2(t.rate * hours)} NM (>>>).`,
          `EP = Ende des Stromvektors. Ground Track ${formatBearing(rhumbLine(e.fix, ep).bearing)}, ${f2(rhumbLine(e.fix, ep).distance)} NM.`,
        ],
        lines: [
          { from: e.fix, to: dr, kind: 'water' },
          { from: dr, to: ep, kind: 'tide' },
          { from: e.fix, to: ep, kind: 'ground' },
        ],
        given: [{ pos: e.fix, label: `Fix ${hourLabel(e.hour)}`, symbol: 'fix' }],
      }
    }
    case 'cross-bearing': {
      const bearings = e.marks.map((id) => ({ id, brg: rhumbLine(e.truePos, markPos(id)).bearing! }))
      return {
        prompt: `Du peilst gleichzeitig: ${bearings.map((b) => `${markName(b.id)} ${formatBearing(Math.round(b.brg), 0)}`).join(', ')} (rechtweisend). Setze den Fix durch Klick in die Karte.`,
        fields: [],
        plot: { pos: e.truePos, toleranceNm: 0.3, symbol: 'fix' },
        steps: [
          ...bearings.map((b) => `Standlinie: vom Objekt „${markName(b.id)}" die Gegenpeilung ${formatBearing((Math.round(b.brg) + 180) % 360, 0)} zeichnen.`),
          'Der Schnittpunkt (bzw. das kleine Fehlerdreieck) ist der Fix – Kreis mit Punkt und Uhrzeit eintragen.',
          'Tipp: Objekte mit möglichst 60°–120° Winkelabstand wählen, nahe Objekte zuerst.',
        ],
        lines: bearings.map((b) => ({ from: markPos(b.id), to: rhumbDestination(markPos(b.id), (Math.round(b.brg) + 180) % 360, rhumbLine(markPos(b.id), e.truePos).distance * 1.25), kind: 'bearing' as const })),
        given: [],
      }
    }
  }
}

/** Prüft Zahleneingaben (Kurse über 000° hinweg) */
export function checkField(field: AnswerField, given: number): boolean {
  const diff = field.bearing ? Math.abs(angleDifference(field.value, given)) : Math.abs(field.value - given)
  return diff <= field.tolerance + 1e-9
}

/** Prüft eine geplottete Position */
export function checkPlot(target: LatLon, given: LatLon, toleranceNm: number): { ok: boolean; errorNm: number } {
  const errorNm = rhumbLine(target, given).distance
  return { ok: errorNm <= toleranceNm, errorNm }
}
