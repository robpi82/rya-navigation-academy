import type { BuoyId } from '@/types/learning'

/**
 * Betonnung nach IALA-System A (Europa, Afrika, Asien, Australien). Eigenständig formuliert –
 * vor ernsthafter Nutzung bitte mit einer offiziellen Quelle (IALA, Seehandbuch) abgleichen.
 */
export interface BuoyInfo {
  id: BuoyId
  group: 'lateral' | 'cardinal' | 'other'
  name: string
  english: string
  /** Farbe/Aussehen in Worten */
  look: string
  shape: string
  topmark: string
  /** Typische Kennung, wie in der Karte angegeben */
  light: string
  /** Beispielkennung im Kartenformat (für die Animation) */
  lightExample: string
  meaning: string
  /** Wie man die Tonne passiert */
  action: string
  mnemonic: string
}

export const BUOYS: BuoyInfo[] = [
  {
    id: 'port',
    group: 'lateral',
    name: 'Backbordtonne (Fahrwasserrand links)',
    english: 'Port hand mark',
    look: 'rot',
    shape: 'Spiere oder stumpf (Tonne mit flachem Kopf)',
    topmark: 'roter Zylinder (falls vorhanden)',
    light: 'Fl R 4s (rotes Licht, beliebiger Rhythmus außer 2+1)',
    lightExample: 'Fl R 4s',
    meaning: 'Markiert die linke Seite des Fahrwassers, wenn man vom Meer her einläuft (in Richtung der Betonnung).',
    action: 'Beim Einlaufen die Tonne an Backbord (links) lassen.',
    mnemonic: 'Rot = Backbord = links beim Einlaufen („rot-links").',
  },
  {
    id: 'starboard',
    group: 'lateral',
    name: 'Steuerbordtonne (Fahrwasserrand rechts)',
    english: 'Starboard hand mark',
    look: 'grün',
    shape: 'Spiere oder Kegel (Spitze nach oben)',
    topmark: 'grüner Kegel, Spitze nach oben (falls vorhanden)',
    light: 'Fl G 4s (grünes Licht, beliebiger Rhythmus außer 2+1)',
    lightExample: 'Fl G 4s',
    meaning: 'Markiert die rechte Seite des Fahrwassers beim Einlaufen.',
    action: 'Beim Einlaufen die Tonne an Steuerbord (rechts) lassen.',
    mnemonic: 'Grün = Steuerbord = rechts beim Einlaufen. Kegel = „Kegel-Spitze zeigt zum Himmel".',
  },
  {
    id: 'pref-stbd',
    group: 'lateral',
    name: 'Abzweigung – bevorzugtes Fahrwasser an Steuerbord',
    english: 'Preferred channel to starboard',
    look: 'rot mit breitem grünem Band',
    shape: 'Spiere oder stumpf',
    topmark: 'roter Zylinder (falls vorhanden)',
    light: 'Fl(2+1) R 10s (rot, zusammengesetzte Gruppe 2+1)',
    lightExample: 'Fl(2+1) R 10s',
    meaning: 'An einer Fahrwassergabelung: Das Hauptfahrwasser liegt an Steuerbord dieser Tonne.',
    action: 'Man kann sie auf beiden Seiten passieren; das Hauptfahrwasser verläuft an Steuerbord. Gilt als Backbordtonne des Hauptfahrwassers (oberes Band = Farbe der Fahrwasserseite).',
    mnemonic: 'Die Hauptfarbe (rot/grün) zeigt, wie die Tonne im Hauptfahrwasser wirkt; das Band zeigt die Abzweigung.',
  },
  {
    id: 'pref-port',
    group: 'lateral',
    name: 'Abzweigung – bevorzugtes Fahrwasser an Backbord',
    english: 'Preferred channel to port',
    look: 'grün mit breitem rotem Band',
    shape: 'Spiere oder Kegel',
    topmark: 'grüner Kegel, Spitze nach oben (falls vorhanden)',
    light: 'Fl(2+1) G 10s (grün, zusammengesetzte Gruppe 2+1)',
    lightExample: 'Fl(2+1) G 10s',
    meaning: 'An einer Fahrwassergabelung: Das Hauptfahrwasser liegt an Backbord dieser Tonne.',
    action: 'Man kann sie auf beiden Seiten passieren; das Hauptfahrwasser verläuft an Backbord.',
    mnemonic: 'Wie bei der anderen Gabelungstonne: zusammengesetzte Gruppe (2+1) verrät die Abzweigung.',
  },
  {
    id: 'north',
    group: 'cardinal',
    name: 'Nordtonne',
    english: 'North cardinal mark',
    look: 'oben schwarz, unten gelb',
    shape: 'Spiere oder Fass-/Pfeilertonne',
    topmark: 'zwei schwarze Kegel, beide Spitzen nach oben',
    light: 'Q oder VQ, weiß (ununterbrochen)',
    lightExample: 'Q',
    meaning: 'Das tiefe, sichere Wasser liegt nördlich der Tonne – die Gefahr liegt südlich.',
    action: 'Nördlich der Tonne passieren.',
    mnemonic: 'Schwarz zeigt in die Richtung der Spitzen: beide Kegel nach oben = Nord, schwarz oben.',
  },
  {
    id: 'east',
    group: 'cardinal',
    name: 'Osttonne',
    english: 'East cardinal mark',
    look: 'schwarz – gelb – schwarz (gelbes Band)',
    shape: 'Spiere oder Fass-/Pfeilertonne',
    topmark: 'zwei schwarze Kegel, Basis an Basis („Diamant")',
    light: 'VQ(3) 5s oder Q(3) 10s, weiß',
    lightExample: 'Q(3) 10s',
    meaning: 'Sicheres Wasser liegt östlich der Tonne.',
    action: 'Östlich der Tonne passieren.',
    mnemonic: 'Ziffernblatt: 3 Blitze = 3 Uhr = Osten. Kegel-Basis an Basis wie ein Ei.',
  },
  {
    id: 'south',
    group: 'cardinal',
    name: 'Südtonne',
    english: 'South cardinal mark',
    look: 'oben gelb, unten schwarz',
    shape: 'Spiere oder Fass-/Pfeilertonne',
    topmark: 'zwei schwarze Kegel, beide Spitzen nach unten',
    light: 'VQ(6)+LFl 10s oder Q(6)+LFl 15s, weiß',
    lightExample: 'Q(6)+LFl 15s',
    meaning: 'Sicheres Wasser liegt südlich der Tonne.',
    action: 'Südlich der Tonne passieren.',
    mnemonic: '6 Blitze = 6 Uhr = Süden, dazu ein Langblitz („damit man nicht 3 oder 9 verwechselt"). Spitzen nach unten.',
  },
  {
    id: 'west',
    group: 'cardinal',
    name: 'Westtonne',
    english: 'West cardinal mark',
    look: 'gelb – schwarz – gelb (schwarzes Band)',
    shape: 'Spiere oder Fass-/Pfeilertonne',
    topmark: 'zwei schwarze Kegel, Spitze an Spitze („Sanduhr")',
    light: 'VQ(9) 10s oder Q(9) 15s, weiß',
    lightExample: 'Q(9) 15s',
    meaning: 'Sicheres Wasser liegt westlich der Tonne.',
    action: 'Westlich der Tonne passieren.',
    mnemonic: '9 Blitze = 9 Uhr = Westen. Kegelspitzen berühren sich wie ein Weinglas (W).',
  },
  {
    id: 'isolated',
    group: 'other',
    name: 'Einzelgefahrenzeichen',
    english: 'Isolated danger mark',
    look: 'schwarz mit einem oder mehreren roten Querbändern',
    shape: 'Spiere oder Fass-/Pfeilertonne',
    topmark: 'zwei schwarze Kugeln übereinander',
    light: 'Fl(2) 5s, weiß',
    lightExample: 'Fl(2) 5s',
    meaning: 'Steht auf oder über einer kleinen, rundum befahrbaren Gefahr (z. B. Wrack, Felsen).',
    action: 'Mit reichlich Abstand umfahren – auf beliebiger Seite.',
    mnemonic: 'Zwei Kugeln, zwei Blitze: „Hier ist eine einzelne Gefahr – Finger weg".',
  },
  {
    id: 'safe',
    group: 'other',
    name: 'Mitte-Fahrwasser-/Ansteuerungstonne',
    english: 'Safe water mark',
    look: 'rot-weiß senkrecht gestreift',
    shape: 'Kugel oder Pfeilertonne mit roter Kugel',
    topmark: 'eine rote Kugel (bei Pfeilertonne)',
    light: 'Iso, Oc, LFl 10s oder Mo(A), weiß',
    lightExample: 'Iso 4s',
    meaning: 'Ringsum befahrbares Wasser: Mitte des Fahrwassers oder Ansteuerung/Landfall.',
    action: 'Kann auf allen Seiten passiert werden; markiert häufig den Beginn eines betonnten Fahrwassers.',
    mnemonic: 'Rot-weiß wie ein Leuchtturm-Streifen: „Hier ist es frei – komm herein".',
  },
  {
    id: 'special',
    group: 'other',
    name: 'Spezialtonne',
    english: 'Special mark',
    look: 'gelb',
    shape: 'beliebig (nicht verwechselbar mit Lateralzeichen)',
    topmark: 'gelbes X (falls vorhanden)',
    light: 'gelb, beliebiger Rhythmus außer den für Kardinal-/Gefahrentonnen vorbehaltenen',
    lightExample: 'Fl Y 5s',
    meaning: 'Kennzeichnet besondere Bereiche oder Anlagen, z. B. Sperrgebiete, Kabel, Messstationen, Badezonen.',
    action: 'Karte oder Seehandbuch beachten, was gekennzeichnet wird.',
    mnemonic: 'Gelbes X = „besondere Zone, genau hinschauen".',
  },
  {
    id: 'new-danger',
    group: 'other',
    name: 'Notkennzeichnung neuer Gefahren',
    english: 'Emergency wreck marking',
    look: 'blau-gelb senkrecht gestreift',
    shape: 'Spiere oder Pfeilertonne',
    topmark: 'gelbes aufrechtes Kreuz (falls vorhanden)',
    light: 'abwechselnd blau und gelb (Al Bu Y)',
    lightExample: 'Fl Bu 5s',
    meaning: 'Markiert eine neue, noch nicht in Karten verzeichnete Gefahr (z. B. frisches Wrack).',
    action: 'Mit großem Abstand passieren; Seewarnungen beachten.',
    mnemonic: 'Blau-gelb: „neu und gefährlich" – Alarmfarben.',
  },
]

export const BUOY_BY_ID: Record<BuoyId, BuoyInfo> = Object.fromEntries(BUOYS.map((b) => [b.id, b])) as Record<BuoyId, BuoyInfo>
export const BUOY_GROUP_LABEL = { lateral: 'Lateralzeichen', cardinal: 'Kardinalzeichen', other: 'Weitere Zeichen' } as const
