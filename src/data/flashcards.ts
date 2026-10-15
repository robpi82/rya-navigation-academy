import type { TermId } from '@/types/learning'
import { GLOSSARY } from './glossary'

export interface Flashcard {
  id: string
  /** Vorderseite: englischer Fachbegriff */
  english: string
  abbr?: string
  /** Rückseite */
  german: string
  definition: string
  mnemonic: string
  example: string
  /** Verknüpfung zum Glossar, falls vorhanden */
  termId?: TermId
  deck: 'grundbegriffe' | 'erweitert'
}

/** Die neun Glossarbegriffe als Grunddeck */
const CORE: Flashcard[] = GLOSSARY.map((t) => ({
  id: t.id,
  english: t.english,
  abbr: t.abbr,
  german: t.german,
  definition: t.definition,
  mnemonic: t.mnemonic,
  example: t.example,
  termId: t.id,
  deck: 'grundbegriffe',
}))

/** Ergänzende Begriffe rund um Koppel- und Stromnavigation */
const EXTENDED: Flashcard[] = [
  {
    id: 'dr',
    english: 'Dead Reckoning Position',
    abbr: 'DR',
    german: 'Koppelort (ohne Strom)',
    definition: 'Position, die nur aus Kurs und Logdistanz seit dem letzten Fix berechnet wird – ohne Stromeinfluss.',
    mnemonic: 'DR = nur Kurs und Log, kein Strom. EP = DR + Strom.',
    example: 'Fix 09:00, 1 h mit 5 kn auf 090° gesteuert: DR 10:00 liegt 5 NM östlich des Fixes.',
    deck: 'erweitert',
  },
  {
    id: 'set',
    english: 'Set',
    german: 'Stromrichtung (wohin der Strom setzt)',
    definition: 'Die Richtung, in die sich das Wasser bewegt – angegeben in ° rechtweisend.',
    mnemonic: 'Strom: WOHIN er setzt. Wind: WOHER er weht.',
    example: 'Set 270° bedeutet: Der Strom fließt nach Westen (er kommt aus Osten).',
    deck: 'erweitert',
  },
  {
    id: 'rate',
    english: 'Rate',
    german: 'Stromgeschwindigkeit',
    definition: 'Die Geschwindigkeit des Gezeitenstroms in Knoten; sie wird zwischen Spring- und Nipptide interpoliert.',
    mnemonic: 'Rate = wie schnell, Drift = wie weit.',
    example: 'Stromatlas: Spring 2,8 kn, Nipp 1,4 kn. Bei mittlerem Tidenhub ca. 2,1 kn.',
    deck: 'erweitert',
  },
  {
    id: 'drift',
    english: 'Drift',
    german: 'Stromversatz (Strecke)',
    definition: 'Die Strecke, um die der Strom das Boot in einer bestimmten Zeit versetzt: Rate × Zeit.',
    mnemonic: 'Drift = Rate × Zeit (in NM).',
    example: '2 kn Strom über 30 Minuten ergeben 1 NM Drift.',
    deck: 'erweitert',
  },
  {
    id: 'cts',
    english: 'Course to Steer',
    abbr: 'CTS',
    german: 'Zu steuernder Kurs',
    definition: 'Der Kurs, den man steuern muss, damit Strom und Leeway das Boot genau auf dem gewünschten Ground Track halten.',
    mnemonic: 'CTS: gegen den Strom vorhalten, gegen den Wind vorhalten.',
    example: 'Sollkurs 000°, Strom setzt 090° 2 kn, STW 5 kn → CTS ≈ 336°.',
    deck: 'erweitert',
  },
  {
    id: 'tidal-stream',
    english: 'Tidal Stream',
    german: 'Gezeitenstrom',
    definition: 'Horizontale Wasserbewegung durch die Gezeiten; Richtung und Stärke ändern sich stündlich.',
    mnemonic: 'Tidal Stream = horizontal. Tide (Höhe) = vertikal.',
    example: 'Der Stromatlas zeigt für HW+2 an einer Tidal Diamond: 045°, 1,8 kn (Spring).',
    deck: 'erweitert',
  },
  {
    id: 'cocked-hat',
    english: 'Cocked Hat',
    german: 'Fehlerdreieck',
    definition: 'Das kleine Dreieck, das bei einer Drei-Linien-Kreuzpeilung durch unvermeidliche Peilfehler entsteht.',
    mnemonic: 'Großes Dreieck = Fehler suchen. Gefahrnächste Ecke annehmen.',
    example: 'Drei Peilungen schneiden sich nicht in einem Punkt, sondern bilden ein Dreieck von 0,2 NM.',
    deck: 'erweitert',
  },
  {
    id: 'transit',
    english: 'Transit',
    german: 'Deckpeilung / Leitlinie',
    definition: 'Zwei Objekte stehen genau hintereinander. Die Verbindungslinie ist eine sehr genaue Standlinie ohne Kompassfehler.',
    mnemonic: 'Transit = zwei in einer Linie – genauer als jeder Kompass.',
    example: 'Kirchturm und Leuchtturm decken sich: Du bist exakt auf deren Verbindungslinie.',
    deck: 'erweitert',
  },
  {
    id: 'nautical-mile',
    english: 'Nautical Mile',
    abbr: 'NM',
    german: 'Seemeile',
    definition: '1852 m; entspricht einer Bogenminute Breite. Abstände werden deshalb am seitlichen Breitenmaßstab der Karte gemessen.',
    mnemonic: '1′ Breite = 1 NM – nie am Längenmaßstab messen!',
    example: 'Zwischen 50°10′N und 50°16′N liegen 6 NM.',
    deck: 'erweitert',
  },
  {
    id: 'knot',
    english: 'Knot',
    abbr: 'kn',
    german: 'Knoten',
    definition: 'Geschwindigkeitseinheit: eine Seemeile pro Stunde (1,852 km/h).',
    mnemonic: 'Knoten × Stunden = Seemeilen.',
    example: '6 kn über 2,5 h ergeben 15 NM.',
    deck: 'erweitert',
  },
  {
    id: 'variation',
    english: 'Variation',
    german: 'Missweisung',
    definition: 'Winkel zwischen geografisch Nord und magnetisch Nord; ortsabhängig und jährlich veränderlich (Kompassrose der Karte).',
    mnemonic: 'Variation = Erde. Deviation = Schiff.',
    example: 'Variation 2°W: Ein rechtweisender Kurs von 090°T entspricht 092°M.',
    deck: 'erweitert',
  },
  {
    id: 'deviation',
    english: 'Deviation',
    german: 'Ablenkung (Deviation)',
    definition: 'Ablenkung des Bordkompasses durch Eisen und Elektrik an Bord; kursabhängig, aus der Deviationstabelle.',
    mnemonic: 'Deviation hängt vom Heading ab – jedes Schiff hat seine eigene Tabelle.',
    example: 'Bei Kurs 090°M zeigt die Deviationstabelle 3°E → Kompasskurs 087°C.',
    deck: 'erweitert',
  },
]

export const FLASHCARDS: Flashcard[] = [...CORE, ...EXTENDED]
export const FLASHCARD_BY_ID: Record<string, Flashcard> = Object.fromEntries(FLASHCARDS.map((c) => [c.id, c]))
