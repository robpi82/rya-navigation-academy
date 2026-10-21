import type { Vector2 } from '@/types/navigation'
import { angleDifference, normalizeAngle, radToDeg } from './angles'

/**
 * Kollisionsverhütungsregeln (COLREGs, KVR) – geometrische Beurteilung einer Begegnung.
 * Vereinfachte Lernhilfe für zwei Fahrzeuge bei erkannter Kollisionsgefahr; ersetzt nicht das Urteil an Bord.
 * Winkel: positiv = Steuerbord (rechts), negativ = Backbord (links).
 */
export type VesselKind = 'power' | 'sail'

export interface Vessel {
  /** Position in NM (x Ost, y Nord) */
  pos: Vector2
  /** Kurs über Grund in ° */
  course: number
  kind: VesselKind
}

/** Scheinbare Peilung von `from` nach `to`, relativ zum Kurs von `from` (positiv = Steuerbord). */
export function relativeBearing(from: Vessel, to: Vessel): number {
  const dx = to.pos.x - from.pos.x
  const dy = to.pos.y - from.pos.y
  const brg = normalizeAngle(radToDeg(Math.atan2(dx, dy)))
  return angleDifference(from.course, brg)
}

/** Ein Fahrzeug im Sektor über 112,5° von recht voraus (22,5° achterlicher als querab) ist von achtern gesehen. */
export const OVERTAKING_SECTOR = 112.5
/** Als „voraus oder fast voraus" (Rule 14) gilt hier ein Sektor von ±10° – im Zweifel gilt Rule 14. */
export const HEAD_ON_LIMIT = 10

export type Situation = 'overtaking' | 'head-on' | 'crossing' | 'power-vs-sail' | 'sail-opposite-tacks' | 'sail-same-tack' | 'diverging'
export type Role = 'give-way' | 'stand-on' | 'both-give-way' | 'none'

export interface Encounter {
  situation: Situation
  own: Role
  other: Role
  rule: string
  explanation: string
  action: string
}

/** Törn: Wind von Steuerbord = Steuerbordbug (Starboard tack). null bei Wind genau von vorn oder achtern. */
export function tackOf(course: number, windFrom: number): 'starboard' | 'port' | null {
  const rel = angleDifference(course, windFrom)
  if (Math.abs(rel) < 1 || Math.abs(rel) > 179) return null
  return rel > 0 ? 'starboard' : 'port'
}

export function encounter(own: Vessel, other: Vessel, windFrom?: number): Encounter {
  const relOther = relativeBearing(own, other) // wo sehe ich den anderen
  const relOwn = relativeBearing(other, own) // wo sieht mich der andere

  const ownBehind = Math.abs(relOwn) > OVERTAKING_SECTOR // ich bin im Heck-Sektor des anderen
  const otherBehind = Math.abs(relOther) > OVERTAKING_SECTOR

  if (ownBehind && otherBehind)
    return { situation: 'diverging', own: 'none', other: 'none', rule: 'Rule 7', explanation: 'Beide Fahrzeuge liegen im Heck-Sektor des jeweils anderen – sie entfernen sich voneinander.', action: 'Keine Kollisionsgefahr aus dieser Geometrie; weiter Ausguck halten.' }
  if (ownBehind)
    return { situation: 'overtaking', own: 'give-way', other: 'stand-on', rule: 'Rule 13', explanation: 'Du näherst dich von achtern (mehr als 22,5° achterlicher als querab des anderen). Wer überholt, muss ausweichen – egal ob Segler oder Motorboot.', action: 'Früh und deutlich ausweichen, bis du völlig klar bist. Der andere hält Kurs und Fahrt.' }
  if (otherBehind)
    return { situation: 'overtaking', own: 'stand-on', other: 'give-way', rule: 'Rule 13', explanation: 'Der andere nähert sich von achtern und überholt dich. Du bist Kurshalter.', action: 'Kurs und Fahrt halten; bei Gefahr Schallsignal (5 kurze Töne) geben.' }

  if (own.kind === 'sail' && other.kind === 'sail') {
    if (windFrom === undefined) return { situation: 'sail-same-tack', own: 'none', other: 'none', rule: 'Rule 12', explanation: 'Für zwei Segelfahrzeuge wird die Windrichtung benötigt.', action: 'Windrichtung eingeben.' }
    const t1 = tackOf(own.course, windFrom)
    const t2 = tackOf(other.course, windFrom)
    if (t1 && t2 && t1 !== t2) {
      const ownPort = t1 === 'port'
      return {
        situation: 'sail-opposite-tacks',
        own: ownPort ? 'give-way' : 'stand-on',
        other: ownPort ? 'stand-on' : 'give-way',
        rule: 'Rule 12(a)(i)',
        explanation: `Du segelst auf ${t1 === 'port' ? 'Backbordbug' : 'Steuerbordbug'}, der andere auf ${t2 === 'port' ? 'Backbordbug' : 'Steuerbordbug'}. Das Fahrzeug mit dem Wind von Backbord (Backbordbug) weicht aus.`,
        action: ownPort ? 'Ausweichen: früh abfallen oder wenden.' : 'Kurs und Fahrt halten.',
      }
    }
    if (t1 && t2) {
      // gleicher Bug: Luvschiff weicht aus
      const windVec = { x: Math.sin((windFrom * Math.PI) / 180), y: Math.cos((windFrom * Math.PI) / 180) }
      const ownUp = own.pos.x * windVec.x + own.pos.y * windVec.y
      const otherUp = other.pos.x * windVec.x + other.pos.y * windVec.y
      const ownWindward = ownUp > otherUp
      return {
        situation: 'sail-same-tack',
        own: ownWindward ? 'give-way' : 'stand-on',
        other: ownWindward ? 'stand-on' : 'give-way',
        rule: 'Rule 12(a)(ii)',
        explanation: 'Beide Boote haben den Wind von derselben Seite. Das Luvboot (dem Wind näher) muss dem Leeboot ausweichen.',
        action: ownWindward ? 'Du bist Luvboot: ausweichen (anluven ist kaum möglich – eher abfallen oder abdrehen).' : 'Du bist Leeboot: Kurs und Fahrt halten.',
      }
    }
    return { situation: 'sail-same-tack', own: 'none', other: 'none', rule: 'Rule 12', explanation: 'Wind genau von vorn oder achtern – Bug nicht eindeutig. Im Zweifel ausweichen.', action: 'Im Zweifel früh ausweichen.' }
  }

  if (own.kind !== other.kind) {
    const ownPower = own.kind === 'power'
    return {
      situation: 'power-vs-sail',
      own: ownPower ? 'give-way' : 'stand-on',
      other: ownPower ? 'stand-on' : 'give-way',
      rule: 'Rule 18(a)',
      explanation: 'Ein Maschinenfahrzeug hält sich vom Segelfahrzeug fern (außer beim Überholen, Rule 13, oder in engen Fahrwassern/Verkehrstrennungsgebieten).',
      action: ownPower ? 'Du fährst unter Maschine: früh und deutlich ausweichen.' : 'Kurs und Fahrt halten. Achtung: Maschine laufen lassen heißt „Maschinenfahrzeug".',
    }
  }

  if (Math.abs(relOther) <= HEAD_ON_LIMIT && Math.abs(relOwn) <= HEAD_ON_LIMIT)
    return { situation: 'head-on', own: 'both-give-way', other: 'both-give-way', rule: 'Rule 14', explanation: 'Entgegengesetzte oder fast entgegengesetzte Kurse, der andere liegt voraus oder fast voraus.', action: 'Beide weichen nach Steuerbord aus und passieren Backbord an Backbord. Ein kurzer Ton: „Ich ändere Kurs nach Steuerbord".' }

  const ownGivesWay = relOther > 0
  const otherGivesWay = relOwn > 0
  if (ownGivesWay && !otherGivesWay)
    return { situation: 'crossing', own: 'give-way', other: 'stand-on', rule: 'Rule 15', explanation: 'Kreuzende Kurse: Du siehst den anderen an Steuerbord (rechts). „Rechts vor links": Wer den anderen an Steuerbord hat, weicht aus.', action: 'Früh und deutlich ausweichen – am besten nach Steuerbord hinter dem Heck des anderen vorbei. Nicht vor dem Bug kreuzen.' }
  if (otherGivesWay && !ownGivesWay)
    return { situation: 'crossing', own: 'stand-on', other: 'give-way', rule: 'Rule 15/17', explanation: 'Du siehst den anderen an Backbord (links). Er hat dich an Steuerbord und muss ausweichen. Du bist Kurshalter.', action: 'Kurs und Fahrt halten (Rule 17). Weicht er nicht aus, darfst du handeln – aber nicht nach Backbord drehen, wenn der andere an Backbord liegt.' }
  if (ownGivesWay && otherGivesWay)
    return { situation: 'head-on', own: 'both-give-way', other: 'both-give-way', rule: 'Rule 14', explanation: 'Beide sehen den anderen an Steuerbord (fast entgegengesetzte Kurse). Im Zweifel gilt die Regel für entgegengesetzte Kurse.', action: 'Beide weichen nach Steuerbord aus.' }
  return { situation: 'diverging', own: 'none', other: 'none', rule: 'Rule 7', explanation: 'Beide sehen den anderen an Backbord und fahren auseinander.', action: 'Weiter Ausguck halten.' }
}

/* ------------------------------------------------------------------ Lichter */

export type LightColor = 'white' | 'red' | 'green' | 'yellow'
export interface VisibleLight {
  id: string
  color: LightColor
  /** Position relativ zum Fahrzeug für die Darstellung: Höhe 0 = unten */
  height: number
  allRound?: boolean
  description: string
}

export type LightVessel = 'power' | 'sail' | 'anchor' | 'nuc' | 'restricted' | 'trawling' | 'aground'

/**
 * Lichter, die ein Beobachter bei `bearingOfObserver` (relativ zum Bug des Fahrzeugs, positiv = Steuerbord)
 * sieht. Fahrzeuge unter 50 m Länge, Nachtbild, vereinfacht.
 */
export function visibleLights(vessel: LightVessel, bearingOfObserver: number, makingWay = true): VisibleLight[] {
  const b = angleDifference(0, bearingOfObserver)
  const out: VisibleLight[] = []
  const masthead = Math.abs(b) <= OVERTAKING_SECTOR
  const green = b >= 0 && b <= OVERTAKING_SECTOR
  const red = b <= 0 && b >= -OVERTAKING_SECTOR
  const stern = Math.abs(b) >= OVERTAKING_SECTOR

  const sides = () => {
    if (green) out.push({ id: 'green', color: 'green', height: 0.4, description: 'Grünes Seitenlicht (Steuerbord, 112,5°)' })
    if (red) out.push({ id: 'red', color: 'red', height: 0.4, description: 'Rotes Seitenlicht (Backbord, 112,5°)' })
    if (stern) out.push({ id: 'stern', color: 'white', height: 0.3, description: 'Hecklicht (weiß, 135°)' })
  }

  switch (vessel) {
    case 'power':
      if (masthead) out.push({ id: 'masthead', color: 'white', height: 1, description: 'Topplicht (weiß, 225° nach vorn)' })
      sides()
      break
    case 'sail':
      sides()
      break
    case 'anchor':
      out.push({ id: 'anchor', color: 'white', height: 0.8, allRound: true, description: 'Ankerlicht (weiß, rundum)' })
      break
    case 'nuc':
      out.push({ id: 'nuc1', color: 'red', height: 1.2, allRound: true, description: 'Oberes rotes Rundumlicht' }, { id: 'nuc2', color: 'red', height: 0.9, allRound: true, description: 'Unteres rotes Rundumlicht' })
      if (makingWay) sides()
      break
    case 'restricted':
      out.push(
        { id: 'r1', color: 'red', height: 1.3, allRound: true, description: 'Oberes rotes Rundumlicht' },
        { id: 'r2', color: 'white', height: 1.0, allRound: true, description: 'Mittleres weißes Rundumlicht' },
        { id: 'r3', color: 'red', height: 0.7, allRound: true, description: 'Unteres rotes Rundumlicht' },
      )
      if (makingWay) {
        // Rule 27(b)(iii): mit Fahrt durchs Wasser zusätzlich Topplicht, Seitenlichter und Hecklicht
        if (masthead) out.push({ id: 'masthead', color: 'white', height: 1.6, description: 'Topplicht (weiß, 225° nach vorn)' })
        sides()
      }
      break
    case 'trawling':
      out.push({ id: 't1', color: 'green', height: 1.1, allRound: true, description: 'Oberes grünes Rundumlicht (Schleppnetzfischerei)' }, { id: 't2', color: 'white', height: 0.8, allRound: true, description: 'Unteres weißes Rundumlicht' })
      if (makingWay) sides()
      break
    case 'aground':
      out.push({ id: 'g0', color: 'white', height: 1.2, allRound: true, description: 'Ankerlicht (weiß, rundum)' }, { id: 'g1', color: 'red', height: 0.9, allRound: true, description: 'Oberes rotes Rundumlicht' }, { id: 'g2', color: 'red', height: 0.6, allRound: true, description: 'Unteres rotes Rundumlicht' })
      break
  }
  return out
}
