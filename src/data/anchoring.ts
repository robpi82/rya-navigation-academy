import type { Step } from './safety'

/** Ankermanöver – sinnvolle Reihenfolge (eigenständig formuliert, vereinfacht). */
export const ANCHORING_STEPS: Step[] = [
  { id: 'choose', text: 'Ankerplatz wählen: Schutz vor jetzigem und vorhergesagtem Wind, Tiefe bei Niedrigwasser, Ankergrund, Schwojraum' },
  { id: 'prepare', text: 'Kettenlänge festlegen, Kette markiert und klar, Anker zum Fallen bereit' },
  { id: 'approach', text: 'Langsam gegen Wind oder Strom (was stärker wirkt) zum Ankerpunkt fahren und aufstoppen' },
  { id: 'drop', text: 'Anker fallen lassen, sobald das Boot leicht achteraus treibt; Kette nach und nach stecken' },
  { id: 'dig', text: 'Rückwärts eindampfen, bis die Kette steif kommt und das Boot nicht mehr treibt' },
  { id: 'watch', text: 'Position und Peilungen notieren, Ankeralarm setzen, Ankerball bzw. Ankerlicht zeigen' },
]

export interface AnchorageOption {
  id: string
  name: string
  /** Sektor, aus dem der Ankerplatz geschützt ist */
  shelter: string
  chartedDepth: number
  ground: string
  swingRoom: string
  correct: boolean
  feedback: string
}

/** Szenario: Wind jetzt SW 4, Vorhersage für die Nacht: Drehung auf NW 5–6. Tiefgang 1,8 m, Höhe der Gezeit bei NW 0,5 m. */
export const ANCHORAGE_SCENARIO = {
  windNow: 225,
  windLater: 315,
  draught: 1.8,
  lwHeight: 0.5,
  hwHeight: 4.5,
}

export const ANCHORAGE_OPTIONS: AnchorageOption[] = [
  {
    id: 'west',
    name: 'Westbucht',
    shelter: 'S bis W',
    chartedDepth: 3,
    ground: 'Sand',
    swingRoom: 'reichlich',
    correct: false,
    feedback: 'Jetzt ruhig – aber nach der Winddrehung auf NW liegt die Bucht offen und wird zur Leeküste. Nachts umzuankern ist gefährlich.',
  },
  {
    id: 'north',
    name: 'Nordbucht hinter der Landzunge',
    shelter: 'W bis N',
    chartedDepth: 2.5,
    ground: 'Sand und Schlick',
    swingRoom: 'ausreichend',
    correct: true,
    feedback: 'Richtig: Schutz vor dem vorhergesagten NW-Wind, guter Haltegrund, und bei Niedrigwasser bleiben 2,5 + 0,5 − 1,8 = 1,2 m unter dem Kiel.',
  },
  {
    id: 'east',
    name: 'Ostbucht dicht unter Land',
    shelter: 'W bis N',
    chartedDepth: 0.8,
    ground: 'Schlick',
    swingRoom: 'eng',
    correct: false,
    feedback: 'Geschützt, aber zu flach: bei Niedrigwasser nur 0,8 + 0,5 = 1,3 m Wasser – das Boot sitzt mit 1,8 m Tiefgang auf.',
  },
  {
    id: 'weed',
    name: 'Vor dem Strand über Seegras',
    shelter: 'W bis N',
    chartedDepth: 3.5,
    ground: 'Seegras',
    swingRoom: 'reichlich',
    correct: false,
    feedback: 'Tiefe und Schutz passen, aber Seegras ist schlechter Haltegrund (der Anker greift oft nicht) – und Seegraswiesen sind vielerorts geschützt.',
  },
]
