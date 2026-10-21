/** Checkliste vor dem Ablegen (eigenständig formuliert, vereinfacht). */
export interface ChecklistGroup {
  id: string
  title: string
  items: { id: string; text: string }[]
}

export const DEPARTURE_CHECKLIST: ChecklistGroup[] = [
  {
    id: 'weather',
    title: 'Wetter und Gezeiten',
    items: [
      { id: 'forecast', text: 'Seewetterbericht und Vorhersage für die ganze Törndauer – auch für die Rückfahrt' },
      { id: 'tides', text: 'Gezeiten und Strom für Abfahrt, Strecke und Ziel; Wind gegen Strom vermeiden' },
      { id: 'gates', text: 'Tidentore: Schwellen, Barren, Brücken, Schleusenzeiten' },
    ],
  },
  {
    id: 'plan',
    title: 'Törnplan',
    items: [
      { id: 'route', text: 'Route mit Kursen, Distanzen und Gefahren in der Karte, Wegpunkte geprüft' },
      { id: 'refuge', text: 'Ausweichhäfen für den Fall, dass Wetter oder Crew nicht mitspielen' },
      { id: 'ashore', text: 'Törnplan bei einer Person an Land hinterlassen (Route, ETA, Crew, Boot)' },
    ],
  },
  {
    id: 'boat',
    title: 'Boot und Maschine',
    items: [
      { id: 'engine', text: 'Maschine: Öl, Kühlwasser und Seeventil, Keilriemen, Kraftstoff' },
      { id: 'bilge', text: 'Bilge trocken, Lenzpumpen funktionieren, Seeventile geprüft' },
      { id: 'electrics', text: 'Batterien, Navigationslichter, Funkgerät (Funkcheck), Plotter' },
    ],
  },
  {
    id: 'safety',
    title: 'Sicherheit',
    items: [
      { id: 'lifejackets', text: 'Rettungswesten und Lifebelts für alle, angepasst und geprüft' },
      { id: 'mob', text: 'MOB-Ausrüstung, Rettungsinsel, Signalmittel, Feuerlöscher, Erste Hilfe' },
      { id: 'briefing', text: 'Sicherheitsbriefing für die ganze Crew gehalten' },
    ],
  },
  {
    id: 'crew',
    title: 'Crew und Versorgung',
    items: [
      { id: 'roles', text: 'Aufgaben und ggf. Wachen verteilt, Erfahrung der Crew berücksichtigt' },
      { id: 'seasick', text: 'Seekrankheit vorbeugen, warme und wasserdichte Kleidung' },
      { id: 'provisions', text: 'Proviant und Trinkwasser mit Reserve' },
    ],
  },
]

export interface BriefingItem {
  id: string
  text: string
  belongs: boolean
}

/** Was gehört in das Sicherheitsbriefing vor dem Ablegen? */
export const BRIEFING_ITEMS: BriefingItem[] = [
  { id: 'lifejackets', text: 'Rettungswesten anlegen, Lifebelts einpicken – wann und wo', belongs: true },
  { id: 'mob', text: 'Mensch über Bord: rufen, zeigen, Boje werfen – wer tut was', belongs: true },
  { id: 'fire', text: 'Feuerlöscher und Löschdecke: wo und wie', belongs: true },
  { id: 'radio', text: 'UKW-Funk: Notruf absetzen, falls der Skipper ausfällt', belongs: true },
  { id: 'gas', text: 'Gas: Absperrhahn, Verhalten bei Gasgeruch', belongs: true },
  { id: 'seacocks', text: 'Seeventile und Bordtoilette richtig bedienen', belongs: true },
  { id: 'liferaft', text: 'Rettungsinsel, Notfalltasche und Signalmittel', belongs: true },
  { id: 'firstaid', text: 'Erste-Hilfe-Kasten und Seekrankheit', belongs: true },
  { id: 'trim', text: 'Feintrimm des Großsegels für Höhe am Wind', belongs: false },
  { id: 'fees', text: 'Hafengebühren und Bordkasse', belongs: false },
  { id: 'history', text: 'Geschichte und Vorbesitzer des Bootes', belongs: false },
]
