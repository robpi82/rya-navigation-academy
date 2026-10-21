/**
 * Fiktives Kap „Kap Sturmvogel“ (Übungsdaten, nicht für die Navigation): Strom bei Springzeit in kn,
 * Stunde HW−6 … HW+6 des Bezugshafens, positiv = westlaufend, negativ = ostlaufend.
 */
export const CAPE_STREAM_SPRINGS = [-2.7, -1.3, 0.3, 1.9, 3.1, 3.4, 2.9, 1.7, 0.0, -1.7, -2.9, -3.4, -3.1]

/** Szenario für die Kap-Umrundung: Kurs West um das Kap, Wind aus West. */
export const CAPE_SCENARIO = {
  windFrom: 270,
  windKn: 18,
  distanceNm: 12,
  stwKn: 6,
}

export interface RouteOption {
  id: string
  name: string
  detail: string
  correct: boolean
  feedback: string
}

/** Wie rundet man das Kap bei Springzeit und West 5? Das Race reicht laut Revierführer bis 3 NM vor das Kap. */
export const CAPE_ROUTES: RouteOption[] = [
  {
    id: 'inshore',
    name: 'Inshore-Passage dicht unter Land',
    detail: '0,2–0,5 NM vom Kap, laut Revierführer nur bei ruhigem Wetter',
    correct: false,
    feedback: 'Die Inshore-Passage ist eine Schönwetter-Route: Bei West 5 steht auch dicht unter Land kabbelige See, und ein Fehler bringt dich sofort auf die Felsen.',
  },
  {
    id: 'race',
    name: 'Mitten durch das Race',
    detail: 'kürzester Weg, 1–2 NM vom Kap',
    correct: false,
    feedback: 'Bei Springzeit und Wind gegen Strom steht im Race steile, brechende See – auch für große Yachten gefährlich.',
  },
  {
    id: 'offshore',
    name: 'Weit außen herum',
    detail: '5 NM vom Kap, deutlich außerhalb des Race',
    correct: true,
    feedback: 'Richtig: Der Umweg von wenigen Seemeilen ist der Preis für ruhigeres Wasser. Zusätzlich die Ankunft auf das Stillwasser legen.',
  },
]
