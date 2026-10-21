import type { DayLesson } from './types'
import { BoatPartsWidget, KnotChooserWidget, KnotOverviewWidget } from './seamanshipWidgets'

/** Phase 48: Leinen, Knoten und Bootskunde. Inhalte eigenständig formuliert und vereinfacht. */
export const SEAMANSHIP_LESSON: DayLesson = {
  id: 'seamanship',
  title: 'Leinen, Knoten und Bootskunde',
  english: 'Ropes, Knots & Parts of a Yacht',
  summary: 'Die Teile einer Segelyacht und ihrer Segel benennen, die acht wichtigsten Knoten mit Zweck und Grenzen kennen und Leinen richtig belegen.',
  body: [
    'An Bord muss jeder Befehl sofort verstanden werden – deshalb haben alle Teile feste Namen. Der Rumpf hat Bug und Heck, Backbord und Steuerbord; darunter halten Kiel und Ruder das Boot auf Kurs. Der Mast wird nach vorn vom Vorstag, nach achtern vom Achterstag und seitlich von den Wanten gehalten. Das Großsegel fährt hinter dem Mast am Baum, das Vorsegel am Vorstag. Jedes Segel hat drei Ecken – Kopf, Hals und Schothorn – und drei Kanten: Vorliek, Achterliek und Unterliek. Mit dem Fall wird ein Segel gesetzt, mit der Schot getrimmt.',
    'Für die meisten Aufgaben reichen acht Knoten. Der Palstek gibt ein festes Auge, das sich nicht zuzieht. Der Webeleinstek hält einen Fender kurzzeitig an der Reling, der Achtknoten verhindert, dass Schoten aus den Blöcken rauschen. Mit Rundtörn und zwei halben Schlägen belegt man eine Leine an einem Ring so, dass sie auch unter Last wieder lösbar ist. Der Kreuzknoten bindet Reffbändsel, darf aber keine Leinen unter Last verbinden; dafür gibt es den Schotstek. Der Stopperstek nimmt die Last von einer Leine, etwa bei einem Überläufer auf der Winsch.',
    'Auf der Klampe belegt man mit einem Rundtörn, einigen Kreuzschlägen und einem abschließenden Kopfschlag – so hält die Leine und lässt sich trotzdem schnell lösen. Leinen werden aufgeschossen, damit sie klar zum Gebrauch sind, ihre Enden gegen Aufdrehen gesichert und an Kanten mit Scheuerschutz versehen. Knoten lernt man nur mit der Leine in der Hand: Übe jeden Knoten, bis er im Dunkeln sitzt.',
  ],
  keyPoints: [
    'Mast: Vorstag nach vorn, Achterstag nach achtern, Wanten seitlich.',
    'Segel: Kopf, Hals, Schothorn – Vorliek, Achterliek, Unterliek; Fall setzt, Schot trimmt.',
    'Palstek = festes Auge, Schotstek = Leinen verbinden, Kreuzknoten nur für Reffbändsel.',
    'Klampe: Rundtörn, Kreuzschläge, Kopfschlag.',
  ],
  mnemonic: 'Ein Knoten, den du nicht im Dunkeln kannst, kannst du nicht.',
  widgets: [
    { title: 'Teile einer Segelyacht', description: 'Erkunden oder abfragen.', Comp: BoatPartsWidget },
    { title: 'Die acht wichtigsten Knoten', description: 'Zweck und Grenzen.', Comp: KnotOverviewWidget },
    { title: 'Welcher Knoten passt?', description: 'Acht Situationen an Bord.', Comp: KnotChooserWidget },
  ],
  links: [
    { label: 'Festmachen bei Gezeiten (Coastal)', href: '#/coastal/mooring' },
    { label: 'Ankern (Coastal)', href: '#/coastal/anchoring' },
    { label: 'Glossar', href: '#/glossar' },
  ],
}
