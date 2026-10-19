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
  deck: 'grundbegriffe' | 'erweitert' | 'themen'
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

/** Day-Skipper-Themen: Kompass, Gezeiten, Kartenkunde, Seezeichen */
const c = (id: string, english: string, german: string, definition: string, mnemonic: string, example: string, abbr?: string): Flashcard => ({
  id,
  english,
  abbr,
  german,
  definition,
  mnemonic,
  example,
  deck: 'themen',
})

const TOPICS: Flashcard[] = [
  c('tvmdc', 'Compass – Deviation – Magnetic – Variation – True', 'Kompasskorrektur (Kette)', 'Reihenfolge der Korrekturen zwischen Kompassanzeige (C) und rechtweisendem Kurs (T).', 'Cadbury\'s Dairy Milk Very Tasty. Von C nach T: Ost-Plus. Von T nach C: Ost-Minus.', 'C 075°, Dev 3°W, Var 4°W → M 072° → T 068°.', 'CDMVT'),
  c('hand-bearing', 'Hand Bearing Compass', 'Handpeilkompass', 'Kompass zum Peilen von Objekten, möglichst fern von Eisen und Elektrik benutzt – daher in der Regel ohne Deviation.', 'Handpeilkompass: nur Variation anbringen.', 'Gepeilt 045°M, Variation 3°W → 042°T.'),
  c('deviation-card', 'Deviation Card', 'Deviationstabelle', 'Tabelle der Deviation je Kompasskurs, beim Justieren des Bordkompasses erstellt.', 'Deviation hängt vom Kurs des Schiffes ab – jede Yacht hat ihre eigene Tabelle.', 'Bei 090°C zeigt die Tabelle 2°W.'),
  c('variation-rose', 'Variation Rose', 'Kompassrose der Karte', 'Nennt Variation, Jahr und jährliche Änderung. Der Wert muss auf das aktuelle Jahr hochgerechnet werden.', 'Karte lesen: „4°30′W 2015 (6′E)" heißt: jedes Jahr 6′ weniger West.', '2025: 4°30′W − 10 × 6′ = 3°30′W.'),
  c('range', 'Range of Tide', 'Tidenhub', 'Unterschied zwischen Hochwasser- und Niedrigwasserhöhe.', 'Hub = HW − NW.', 'HW 5,8 m, NW 0,9 m → 4,9 m.'),
  c('springs', 'Spring Tides', 'Springtide', 'Größter Tidenhub bei Neu- und Vollmond; kräftigste Gezeitenströme.', 'Spring = „springt weit": viel Hub, viel Strom.', 'Spring-Hub im Beispielhafen 5,0 m.'),
  c('neaps', 'Neap Tides', 'Nipptide', 'Kleinster Tidenhub bei Halbmond (Viertel); schwächste Ströme.', 'Neap = „knapp": wenig Hub, wenig Strom.', 'Nipp-Hub im Beispielhafen 2,0 m.'),
  c('chart-datum', 'Chart Datum (LAT)', 'Kartennull', 'Bezugsfläche der Tiefen in der Karte, meist der niedrigste astronomische Gezeitenstand.', 'Tiefen: Kartennull. Höhen: MHWS.', 'Die Karte nennt 2,4 m – bei Hochwasser (+3,1 m) sind es 5,5 m.'),
  c('height-of-tide', 'Height of Tide', 'Höhe der Gezeit', 'Wasserstand über dem Kartennull zu einer bestimmten Zeit.', 'Wassertiefe = Kartentiefe + Höhe der Gezeit.', 'Kartentiefe 1,5 m + Höhe 2,4 m = 3,9 m.'),
  c('drying-height', 'Drying Height', 'Trockenhöhe (unterstrichene Zahl)', 'Höhe einer trockenfallenden Stelle über dem Kartennull.', 'Unterstrichen = trocken bei NW. Tiefe = Höhe der Gezeit − Trockenhöhe.', '1,2 unterstrichen, Höhe der Gezeit 3,5 m → 2,3 m Wasser.'),
  c('ukc', 'Under Keel Clearance', 'Wasser unter dem Kiel', 'Wassertiefe minus Tiefgang – mit Sicherheitsreserve.', 'Immer mit Reserve planen (Seegang, Lotfehler, Tidenabweichung).', 'Tiefe 3,9 m, Tiefgang 1,8 m → 2,1 m unter dem Kiel.', 'UKC'),
  c('nautical-scale', 'Latitude Scale', 'Breitenmaßstab', 'Seitlicher Maßstab der Seekarte: 1′ Breite = 1 NM. Distanzen werden hier abgegriffen.', 'Nie am Längenmaßstab messen!', 'Zwischen 50°39,5′ und 50°47,0′ N liegen 7,5 NM.'),
  c('light-fl', 'Flashing / Occulting / Isophase', 'Blink-, unterbrochenes und Gleichtaktfeuer', 'Fl: kurzes Licht, lange Pause. Oc: langes Licht, kurze Pause. Iso: Licht und Dunkel gleich lang.', 'Fl = „Flash" kurz an. Oc = „Occult" kurz weg.', 'Iso 4s: 2 s an, 2 s aus.', 'Fl/Oc/Iso'),
  c('light-q', 'Quick / Very Quick / Long Flash', 'Funkelfeuer, schnelles Funkelfeuer, Langblitz', 'Q: 50–79 Blitze/min. VQ: 80–159 Blitze/min. LFl: Blitz von mindestens 2 s.', 'Q und VQ kennzeichnen Kardinaltonnen; LFl macht die Südtonne eindeutig.', 'Q(6)+LFl 15s: 6 schnelle Blitze plus Langblitz.', 'Q/VQ/LFl'),
  c('mhws', 'MHWS', 'Mittleres Springhochwasser', 'Bezug der Höhen von Landmarken, Brücken und Feuern in der Karte.', 'Höhen: MHWS. Tiefen: Kartennull.', 'Feuerhöhe 24 m über MHWS.', 'MHWS'),
  c('lateral-a', 'Lateral Marks (System A)', 'Lateralzeichen', 'Rot = Backbord, grün = Steuerbord – beim Einlaufen in Richtung der Betonnung.', 'Einlaufen: rot links, grün rechts. Auslaufen: umgekehrt.', 'Rote Spiere an Backbord beim Einlaufen in den Hafen.'),
  c('cardinal-n', 'North Cardinal', 'Nordtonne', 'Schwarz über Gelb, zwei Kegel nach oben, weiß Q/VQ dauernd. Sicher nördlich.', 'Schwarz zeigt zu den Kegelspitzen.', 'Nördlich der Tonne passieren.'),
  c('cardinal-e', 'East Cardinal', 'Osttonne', 'Schwarz-Gelb-Schwarz, Kegel Basis an Basis, Q(3) 10s / VQ(3) 5s. Sicher östlich.', '3 Blitze = 3 Uhr = Ost.', 'Östlich der Tonne passieren.'),
  c('cardinal-s', 'South Cardinal', 'Südtonne', 'Gelb über Schwarz, Kegel nach unten, Q(6)+LFl 15s. Sicher südlich.', '6 Blitze = 6 Uhr, Langblitz verhindert Verwechslung.', 'Südlich der Tonne passieren.'),
  c('cardinal-w', 'West Cardinal', 'Westtonne', 'Gelb-Schwarz-Gelb, Kegel Spitze an Spitze, Q(9) 15s / VQ(9) 10s. Sicher westlich.', '9 Blitze = 9 Uhr = West; Sanduhr/Weinglas.', 'Westlich der Tonne passieren.'),
  c('isolated-danger', 'Isolated Danger Mark', 'Einzelgefahrenzeichen', 'Schwarz mit rotem Band, zwei schwarze Kugeln, Fl(2) weiß. Steht auf einer Gefahr.', 'Zwei Kugeln, zwei Blitze: „einzelne Gefahr".', 'Mit Abstand rundum umfahren.'),
  c('safe-water', 'Safe Water Mark', 'Mitte-Fahrwasser-/Ansteuerungstonne', 'Rot-weiß gestreift, Kugel oder rote Kugel als Toppzeichen, Iso/Oc/LFl 10s/Mo(A) weiß.', 'Rot-weiß: „hier ist es ringsum frei".', 'Markiert oft den Anfang einer betonnten Zufahrt.'),
  c('special-mark', 'Special Mark', 'Spezialtonne', 'Gelb, ggf. gelbes X. Kennzeichnet besondere Bereiche oder Anlagen.', 'Gelbes X: besondere Zone – Karte lesen.', 'Z. B. Messstation, Kabelgebiet, Sperrgebiet.'),
  c('pref-channel', 'Preferred Channel Mark', 'Gabelungstonne (bevorzugtes Fahrwasser)', 'Lateraltonne mit Band in der anderen Farbe und Kennung Fl(2+1). Zeigt das Hauptfahrwasser an einer Abzweigung.', '2+1 gibt es nur bei Gabelungstonnen.', 'Rot mit grünem Band: Hauptfahrwasser an Steuerbord.'),
]

export const FLASHCARDS: Flashcard[] = [...CORE, ...EXTENDED, ...TOPICS]
export const FLASHCARD_BY_ID: Record<string, Flashcard> = Object.fromEntries(FLASHCARDS.map((c) => [c.id, c]))
