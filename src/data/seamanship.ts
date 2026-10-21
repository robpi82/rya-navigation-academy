/**
 * Bootskunde und Knoten (Day Skipper) – eigenständig formuliert. Lage der Teile in einer Skizze (viewBox 320 × 240),
 * Slup mit dem Bug nach rechts.
 */
export interface BoatPart {
  id: string
  german: string
  english: string
  what: string
  x: number
  y: number
}

export const BOAT_PARTS: BoatPart[] = [
  { id: 'bow', german: 'Bug', english: 'Bow', what: 'Vorderes Ende des Rumpfes.', x: 286, y: 166 },
  { id: 'stern', german: 'Heck', english: 'Stern', what: 'Hinteres Ende des Rumpfes.', x: 34, y: 168 },
  { id: 'keel', german: 'Kiel', english: 'Keel', what: 'Ballast unter dem Rumpf: hält das Boot aufrecht und verhindert Abdrift.', x: 157, y: 214 },
  { id: 'rudder', german: 'Ruder(blatt)', english: 'Rudder', what: 'Steuert das Boot, bewegt mit Pinne oder Rad.', x: 66, y: 210 },
  { id: 'mast', german: 'Mast', english: 'Mast', what: 'Trägt die Segel; gehalten von Stagen und Wanten.', x: 150, y: 155 },
  { id: 'boom', german: 'Baum', english: 'Boom', what: 'Spiere am Unterliek des Großsegels – Vorsicht beim Halsen!', x: 108, y: 143 },
  { id: 'main', german: 'Großsegel', english: 'Mainsail', what: 'Segel hinter dem Mast, am Baum gefahren.', x: 126, y: 100 },
  { id: 'jib', german: 'Vorsegel (Fock, Genua)', english: 'Headsail (jib, genoa)', what: 'Segel vor dem Mast, am Vorstag gefahren.', x: 224, y: 123 },
  { id: 'forestay', german: 'Vorstag', english: 'Forestay', what: 'Hält den Mast nach vorn; daran fährt das Vorsegel.', x: 166, y: 37 },
  { id: 'backstay', german: 'Achterstag', english: 'Backstay', what: 'Hält den Mast nach achtern.', x: 79, y: 110 },
  { id: 'shrouds', german: 'Wanten', english: 'Shrouds', what: 'Halten den Mast seitlich, über die Salinge abgespreizt.', x: 158, y: 118 },
  { id: 'head', german: 'Kopf', english: 'Head', what: 'Obere Ecke eines Segels, dort greift das Fall an.', x: 152, y: 26 },
  { id: 'tack', german: 'Hals', english: 'Tack', what: 'Vordere untere Ecke eines Segels.', x: 158, y: 137 },
  { id: 'clew', german: 'Schothorn', english: 'Clew', what: 'Hintere untere Ecke eines Segels, dort greift die Schot an.', x: 76, y: 137 },
  { id: 'leech', german: 'Achterliek', english: 'Leech', what: 'Hintere Kante eines Segels (Vorliek vorn, Unterliek unten).', x: 115, y: 80 },
]

export interface Knot {
  id: string
  german: string
  english: string
  use: string
  caution: string
}

export const KNOTS: Knot[] = [
  { id: 'bowline', german: 'Palstek', english: 'Bowline', use: 'Festes Auge, das sich unter Last nicht zuzieht – z. B. zum Überwerfen auf einen Poller.', caution: 'Unter Last nicht zu lösen.' },
  { id: 'clove', german: 'Webeleinstek', english: 'Clove hitch', use: 'Schnelles Anbinden an Stange oder Reling – z. B. Fender vorübergehend.', caution: 'Kann sich bei wechselndem Zug lösen; nur kurzzeitig.' },
  { id: 'eight', german: 'Achtknoten', english: 'Figure of eight', use: 'Stopper am Leinenende, damit Schoten nicht aus Blöcken rauschen.', caution: 'Kein Verbindungsknoten in dieser Form.' },
  { id: 'roundturn', german: 'Rundtörn mit zwei halben Schlägen', english: 'Round turn and two half hitches', use: 'Leine an Ring, Pfahl oder Poller belegen – auch unter Last wieder lösbar.', caution: 'Der Rundtörn nimmt die Last, die Schläge sichern nur.' },
  { id: 'reef', german: 'Kreuzknoten', english: 'Reef knot', use: 'Reffbändsel um das gereffte Segel binden; gleich dicke Enden.', caution: 'Nicht zum Verbinden von Leinen unter Last – er kann kentern.' },
  { id: 'sheetbend', german: 'Schotstek', english: 'Sheet bend', use: 'Zwei Leinen verbinden, auch unterschiedlich dick.', caution: 'Bei sehr ungleichen Dicken doppelt stecken.' },
  { id: 'rolling', german: 'Stopperstek', english: 'Rolling hitch', use: 'Last von einer Leine nehmen, z. B. bei einem Überläufer auf der Winsch.', caution: 'In Zugrichtung legen, sonst rutscht er.' },
  { id: 'cleat', german: 'Belegen auf der Klampe', english: 'Cleat hitch', use: 'Festmacher und Fallen sichern: Rundtörn, Kreuzschläge, Kopfschlag.', caution: 'Nicht nur Kopfschläge – sonst klemmt die Leine fest.' },
]

/** Zuordnungsaufgaben: Welcher Knoten passt? */
export const KNOT_TASKS: { situation: string; knot: string }[] = [
  { situation: 'Ein festes Auge im Festmacher, das du an Land über einen Poller werfen kannst', knot: 'bowline' },
  { situation: 'Ein Fender soll für ein kurzes Anlegemanöver an die Reling', knot: 'clove' },
  { situation: 'Die Schotenden sollen nicht durch die Umlenkblöcke ausrauschen', knot: 'eight' },
  { situation: 'Die Vorleine an einem Ring der Kaimauer belegen – später unter Zug wieder lösbar', knot: 'roundturn' },
  { situation: 'Die Reffbändsel um das eingebundene Tuch des Großsegels', knot: 'reef' },
  { situation: 'Eine dünne Leine an eine dickere anstecken, um sie zu verlängern', knot: 'sheetbend' },
  { situation: 'Die Genuaschot hat einen Überläufer auf der Winsch – die Last muss herunter', knot: 'rolling' },
  { situation: 'Der Festmacher wird an Bord auf der Klampe gesichert', knot: 'cleat' },
]
