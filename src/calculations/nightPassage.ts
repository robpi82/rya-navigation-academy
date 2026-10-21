/**
 * Törnplanung über Nacht (Yachtmaster-Vorgriff): Wachplan, Abfahrt für eine Ankunft bei Tageslicht und
 * wann welche Leuchtfeuer entlang der Route in Sicht kommen. Zeiten in Stunden ab Mitternacht des Abfahrtstages.
 */

export interface Watch {
  start: number
  end: number
  /** Index der Wache (Team) */
  team: number
}

/**
 * Wachplan: Die Crew wird in `teams` Wachen geteilt, die sich im Abstand `watchHours` zwischen `from` und `to` ablösen.
 * Die letzte Wache endet spätestens zu `to`.
 */
export function watchSchedule(from: number, to: number, watchHours: number, teams: number): Watch[] {
  const out: Watch[] = []
  if (watchHours <= 0 || teams < 1 || to <= from) return out
  for (let t = from, i = 0; t < to - 1e-9; t += watchHours, i++) out.push({ start: t, end: Math.min(t + watchHours, to), team: i % teams })
  return out
}

/** Stunden an Wache und längste zusammenhängende Ruhezeit je Team. */
export function watchLoad(watches: Watch[], teams: number): { onWatch: number; longestRest: number }[] {
  return Array.from({ length: teams }, (_, team) => {
    const own = watches.filter((w) => w.team === team)
    const onWatch = own.reduce((s, w) => s + (w.end - w.start), 0)
    let longestRest = 0
    for (let k = 1; k < own.length; k++) longestRest = Math.max(longestRest, own[k].start - own[k - 1].end)
    if (own.length && watches.length) {
      // Ruhe vor der ersten bzw. nach der letzten eigenen Wache innerhalb des Plans
      longestRest = Math.max(longestRest, own[0].start - watches[0].start, watches[watches.length - 1].end - own[own.length - 1].end)
    }
    return { onWatch, longestRest }
  })
}

export interface DepartureWindow {
  /** Fahrtdauer in Stunden */
  hours: number
  /** früheste und späteste Abfahrt (Stunden, ggf. negativ = Vortag) für Ankunft im Tageslicht */
  earliest: number
  latest: number
}

/**
 * Abfahrtsfenster für eine Ankunft zwischen Sonnenaufgang + Puffer und Sonnenuntergang − Puffer am Ankunftstag.
 * `arrivalDayOffset` = 0: Ankunft am Abfahrtstag, 1: am Folgetag.
 */
export function daylightDepartureWindow(distance: number, speed: number, sunrise: number, sunset: number, margin = 1, arrivalDayOffset = 1): DepartureWindow | null {
  if (speed <= 0 || distance < 0) return null
  const hours = distance / speed
  const earliestArrival = arrivalDayOffset * 24 + sunrise + margin
  const latestArrival = arrivalDayOffset * 24 + sunset - margin
  if (latestArrival < earliestArrival) return null
  return { hours, earliest: earliestArrival - hours, latest: latestArrival - hours }
}

export interface RouteLight {
  name: string
  characteristic: string
  /** Lage entlang der Route ab Start (NM) */
  along: number
  /** seitlicher Abstand zur Route (NM) */
  offset: number
  /** wirksame Sichtweite (NM): kleinerer Wert aus Nenntragweite und geografischer Sichtweite */
  range: number
}

export interface LightWindow {
  light: RouteLight
  /** Streckenabschnitt [von, bis] in NM, in dem das Feuer in Sicht ist (null = nie) */
  fromNm: number | null
  toNm: number | null
  /** Uhrzeiten (h) bei Fahrt `speed` ab `depart` */
  fromTime: number | null
  toTime: number | null
  /** kleinster Passierabstand */
  closest: number
}

/** Wann ist ein Feuer auf einer geraden Route in Sicht? Abstand² = (s − along)² + offset² ≤ range². */
export function lightWindow(light: RouteLight, routeLength: number, speed: number, depart: number): LightWindow {
  const closest = Math.abs(light.offset)
  if (closest > light.range || speed <= 0) return { light, fromNm: null, toNm: null, fromTime: null, toTime: null, closest }
  const half = Math.sqrt(light.range ** 2 - light.offset ** 2)
  const a = Math.max(0, light.along - half)
  const b = Math.min(routeLength, light.along + half)
  if (a > b) return { light, fromNm: null, toNm: null, fromTime: null, toTime: null, closest }
  return { light, fromNm: a, toNm: b, fromTime: depart + a / speed, toTime: depart + b / speed, closest }
}

/** Liegt eine Uhrzeit (Stunden, beliebig groß) in der Dunkelheit zwischen Sonnenuntergang und Sonnenaufgang? */
export function isDark(time: number, sunrise: number, sunset: number): boolean {
  const t = ((time % 24) + 24) % 24
  return t < sunrise || t >= sunset
}
