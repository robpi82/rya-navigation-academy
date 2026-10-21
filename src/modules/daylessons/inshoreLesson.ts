import type { DayLesson } from './types'
import { FogOrderWidget, PortSignalsWidget, SectorLightWidget } from './inshoreWidgets'

/** Phase 51: Pilotage und Nebel im Küstennahbereich (Day Skipper). Inhalte eigenständig formuliert und vereinfacht. */
export const INSHORE_LESSON: DayLesson = {
  id: 'inshore',
  title: 'Pilotage und Nebel (küstennah)',
  english: 'Inshore Pilotage & Restricted Visibility',
  summary: 'In einen fremden Hafen finden: Pilotageplan, Deckpeilungen, Sektorenfeuer und Hafensignale – und was zu tun ist, wenn Nebel aufzieht.',
  body: [
    'Pilotage heißt navigieren nach Sicht: mit Marken, Deckpeilungen und Feuern statt mit Kurs und Koppelort. Weil an Deck kaum Zeit für die Karte bleibt, wird vorher ein Pilotageplan geschrieben – je Abschnitt Marke, Kurs, Distanz, Zeit und was als Nächstes kommt, dazu Gefahren und die Tiefe. Eine Deckpeilung (zwei Marken in Linie) zeigt sofort, ob man auf dem Kurs ist: Wandert die vordere Marke zur Seite aus, steuert man zur vorderen Marke hin, bis beide wieder übereinander stehen.',
    'Nachts helfen Leit- und Sektorenfeuer. Ein Sektorenfeuer zeigt im sicheren Bereich weiß, links und rechts davon rot oder grün; die Sektorgrenzen stehen in der Seekarte als Peilung von See zum Feuer. Welche Farbe auf welcher Seite liegt, ist von Feuer zu Feuer verschieden – nachsehen, nicht raten. An vielen Häfen regeln Lichtsignale den Verkehr: drei rote Lichter übereinander verbieten das Ein- und Auslaufen, blinken sie, herrscht ein ernster Notfall; drei grüne erlauben die Fahrt im Einbahnverkehr. Hafenhandbuch und Revierführer nennen die örtlichen Signale.',
    'Zieht Nebel auf, zählt die Reihenfolge: zuerst den Ort bestimmen, solange noch Marken zu sehen sind, dann Westen an, Ausguck und Horchwache, Lichter und Schallsignale – eine Segelyacht unter Segeln gibt lang–kurz–kurz, mindestens alle zwei Minuten, unter Maschine einen langen Ton. Fahrt so weit verringern, dass man innerhalb der Sichtweite stoppen kann, und möglichst in flacheres Wasser abseits der Schifffahrtswege ausweichen, wo große Schiffe nicht fahren. Die Coastal-Lektionen Pilotage und Nebel vertiefen das.',
  ],
  keyPoints: [
    'Pilotageplan vorher: Marken, Kurse, Distanzen, Zeiten, Gefahren je Abschnitt.',
    'Deckpeilung: zur vorderen Marke hin steuern, bis beide wieder in Linie sind.',
    'Sektorenfeuer: weiß = sicher; welche Seite rot oder grün ist, steht in der Karte.',
    'Nebel: Ort bestimmen, Westen, Ausguck, Signale, langsam, ins flache Wasser abseits der Schifffahrt.',
  ],
  mnemonic: 'Weiß ist richtig – und bei Nebel erst der Ort, dann der Rest.',
  widgets: [
    { title: 'Sektorenfeuer an der Einfahrt', description: 'Welche Farbe siehst du wo?', Comp: SectorLightWidget },
    { title: 'Hafensignale', description: 'Drei Lichter übereinander.', Comp: PortSignalsWidget },
    { title: 'Nebel zieht auf', description: 'Die ersten Maßnahmen.', Comp: FogOrderWidget },
  ],
  links: [
    { label: 'Pilotage (Coastal)', href: '#/coastal/pilotage' },
    { label: 'Nebel (Coastal)', href: '#/coastal/fog' },
    { label: 'Kartenkunde: Feuer', href: '#/themen/chart-reading' },
  ],
}
