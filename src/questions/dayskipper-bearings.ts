import type { DayTopicId, MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify } from '@/types/learning'

/**
 * Phase 6: Peilen (Standlinien, Kreuzpeilung, Deckpeilung, Kompassfehler). Eigenständig erstellt und vereinfacht,
 * keine Originalprüfungsfragen. Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
 */
const TOPIC: DayTopicId = 'bearings'
let counter = 1

function mc(id: string, difficulty: 1 | 2 | 3, category: MultipleChoiceQuestion['category'], prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic: TOPIC, difficulty, level: 'day-skipper', category, prompt, options, correctIndex: idx, solution: correct, steps }
}

function num(id: string, difficulty: 1 | 2 | 3, prompt: string, answer: number, tolerance: number, verify: QuestionVerify, solution: string, steps: string[], isBearing = false): NumericQuestion {
  return { id, type: 'numeric', topic: TOPIC, difficulty, level: 'day-skipper', category: 'calculation', prompt, answer, tolerance, unit: '°', isBearing: isBearing || undefined, verify, solution, steps }
}

export const DAY_SKIPPER_BEARINGS: Question[] = [
  num('pl-001', 1, 'Du peilst einen Leuchtturm rechtweisend in 072°. In welche Richtung verläuft die Standlinie vom Leuchtturm aus, auf der dein Boot liegt?', 252, 1, { kind: 'bearing', quantity: 'reciprocal', bearing: 72 }, '252°', ['Das Boot liegt auf der Gegenpeilung vom Objekt aus.', '072° + 180° = 252°.'], true),
  num('pl-002', 1, 'Eine Kirche peilst du rechtweisend 305°. Wie lautet die Gegenpeilung (Richtung der Standlinie von der Kirche aus)?', 125, 1, { kind: 'bearing', quantity: 'reciprocal', bearing: 305 }, '125°', ['Bei Peilungen über 180° wird 180° subtrahiert.', '305° − 180° = 125°.'], true),
  num('pl-003', 2, 'Zwei Peilungen: 350° und 040°. Wie groß ist der Schnittwinkel der beiden Standlinien?', 50, 1, { kind: 'bearing', quantity: 'cutAngle', bearing: 350, bearing2: 40 }, '50°', ['Differenz über 000° hinweg: 350° → 040° sind 50°.', 'Ein Winkel unter 30° wäre unbrauchbar; 50° ist brauchbar.']),
  num('pl-004', 2, 'Zwei Peilungen: 050° und 095°. Wie groß ist der Schnittwinkel? (Bewertung: Ist der Schnitt noch brauchbar?)', 45, 1, { kind: 'bearing', quantity: 'cutAngle', bearing: 50, bearing2: 95 }, '45° – gerade noch brauchbar, besser wären 60–90°', ['95° − 50° = 45°.', 'Unter 30° ist der Schnitt ungenau, über 60° gut.']),
  num('pl-005', 2, 'Eine Deckpeilung liegt laut Karte rechtweisend in 123°. Dein Kompass zeigt für dieselbe Linie 128°. Wie groß ist der Gesamtfehler des Kompasses in ° West?', 5, 0.5, { kind: 'bearing', quantity: 'errorWest', trueBearing: 123, observed: 128 }, '5° West', ['Wahr − Kompass = 123° − 128° = −5°.', 'Negativ bedeutet West: Der Kompass zeigt zu viel.']),
  num('pl-006', 3, 'Deckpeilung: wahr 090°, Kompass 096°. Die Karte nennt eine Variation von 4° West. Wie groß ist die Deviation in ° West?', 2, 0.5, { kind: 'bearing', quantity: 'deviationWest', trueBearing: 90, observed: 96, variation: -4 }, '2° West', ['Gesamtfehler = 090° − 096° = −6° (6° West).', 'Deviation = Gesamtfehler − Variation = −6° − (−4°) = −2°.', 'Also 2° West.']),
  num('pl-007', 3, 'Deckpeilung: wahr 200°, Kompass 195°. Die Variation beträgt 2° Ost. Wie groß ist die Deviation in ° Ost?', 3, 0.5, { kind: 'bearing', quantity: 'deviationEast', trueBearing: 200, observed: 195, variation: 2 }, '3° Ost', ['Gesamtfehler = 200° − 195° = +5° (Ost).', 'Deviation = 5° − 2° = +3°.']),
  mc('pl-008', 1, 'concept', 'Du peilst einen Leuchtturm und erhältst 075°. Wo liegt dein Boot?', 'Auf einer Linie, die vom Leuchtturm in Richtung 255° verläuft', ['Auf einer Linie, die vom Leuchtturm in Richtung 075° verläuft', 'Genau 075° vom Boot aus gemessen am Kartenrand', 'Auf dem Breitenkreis des Leuchtturms'], ['Die Peilung führt vom Boot zum Objekt.', 'In der Karte trägt man vom Objekt aus die Gegenpeilung (075° + 180° = 255°) ab.']),
  mc('pl-009', 1, 'concept', 'Welche Anordnung der Peilobjekte liefert bei zwei Peilungen den genauesten Schnittpunkt?', 'Die Objekte liegen etwa im rechten Winkel (90°) zueinander', ['Die Objekte liegen fast in derselben Richtung (unter 20°)', 'Die Objekte liegen genau entgegengesetzt (180°)', 'Es spielt keine Rolle, solange die Objekte weit weg sind'], ['Bei etwa 90° wirkt ein kleiner Peilfehler nur wenig auf die Position.', 'Bei sehr kleinen Winkeln wird der Schnittpunkt unsicher – 180° ist nur eine Standlinie in beide Richtungen.']),
  mc('pl-010', 2, 'error', 'Alle drei Peilungen haben denselben Fehler von +4°, weil die Deviation vergessen wurde. Das Fehlerdreieck ist klein. Was folgt daraus?', 'Die Position ist verschoben, obwohl das Dreieck klein wirkt', ['Die Position ist exakt, weil das Dreieck klein ist', 'Das Dreieck muss deutlich größer sein, wenn Fehler vorliegen', 'Die Position ist nur bei Nacht verschoben'], ['Ein gemeinsamer Fehler verschiebt alle Standlinien in dieselbe Richtung.', 'Das Dreieck sagt nur etwas über zufällige Einzelfehler, nicht über systematische.']),
  mc('pl-011', 2, 'concept', 'Du erhältst ein ungewöhnlich großes Fehlerdreieck. Was ist am sinnvollsten?', 'Neu peilen, Objekte und Kompassfehler prüfen und die Position erst dann verwenden', ['Den Mittelpunkt als verlässlichen Fix eintragen', 'Die längste Standlinie verwerfen und mit der kürzesten weiterarbeiten', 'Den Kurs beibehalten und später peilen'], ['Ein großes Dreieck zeigt Fehler bei Peilung, Objektidentifikation oder Kompass.', 'Neu peilen, Objekte identifizieren, Zeit notieren.']),
  mc('pl-012', 2, 'concept', 'Das Fehlerdreieck liegt in der Nähe einer Untiefe. Welche Position nimmst du für die Sicherheit an?', 'Die Ecke des Dreiecks, die der Gefahr am nächsten liegt', ['Den Mittelpunkt des Dreiecks', 'Die Ecke, die am weitesten von der Gefahr entfernt liegt', 'Keine, bis das Dreieck verschwunden ist'], ['Bei Gefahren plant man vorsichtig.', 'Immer die ungünstigste Position annehmen.']),
  mc('pl-013', 2, 'concept', 'In welcher Reihenfolge peilt man bei drei Objekten sinnvoll?', 'Zuerst voraus/achteraus liegende Objekte, zuletzt das querab liegende', ['Zuerst das querab liegende Objekt', 'Immer in alphabetischer Reihenfolge der Objekte', 'Zuerst das am weitesten entfernte Objekt, egal in welcher Richtung'], ['Die Peilung zu voraus oder achteraus liegenden Objekten ändert sich langsam.', 'Querab ändert sie sich am schnellsten, daher zuletzt – und Zeit notieren.']),
  mc('pl-014', 1, 'concept', 'Was ist der besondere Vorteil einer Deckpeilung?', 'Die Peilung ist aus der Karte exakt bekannt, so dass der Kompassfehler bestimmt werden kann', ['Sie liefert zwei Positionen gleichzeitig', 'Sie funktioniert nur bei Nacht', 'Sie ersetzt die Seekarte'], ['Zwei Objekte in einer Linie definieren eine Standlinie, deren Richtung die Karte liefert.', 'Wahr − Kompass = Kompassfehler.']),
  mc('pl-015', 2, 'concept', 'Wie lässt sich eine Handpeilkompass-Peilung in eine rechtweisende Peilung umrechnen, wenn du fern von Eisenteilen peilst?', 'Variation anbringen: Ost addieren, West subtrahieren', ['Immer die Deviationstabelle des Bordkompasses nutzen', 'Beides ist unnötig, der Kompass zeigt wahr Nord', 'Die Gegenpeilung bilden und 10° addieren'], ['Ein Handpeilkompass ohne Eisenteile in der Nähe hat praktisch keine Deviation.', 'Kompass → wahr: Ost +, West −.']),
  {
    id: 'pl-016',
    type: 'match',
    topic: TOPIC,
    difficulty: 1,
    level: 'day-skipper',
    category: 'matching',
    prompt: 'Ordne die Begriffe ihrer Bedeutung zu.',
    pairs: [
      { left: 'Standlinie', right: 'Linie, auf der das Boot nach einer Peilung liegt' },
      { left: 'Deckpeilung', right: 'Zwei Objekte stehen in einer Linie hintereinander' },
      { left: 'Fehlerdreieck', right: 'Dreieck aus drei Standlinien, das Peilfehler sichtbar macht' },
      { left: 'Gegenpeilung', right: 'Peilung ± 180°' },
    ],
    solution: 'Standlinie – Linie des Bootes; Deckpeilung – Objekte in einer Linie; Fehlerdreieck – Dreieck aus 3 Standlinien; Gegenpeilung – ± 180°',
    steps: ['Eine Peilung ergibt eine Standlinie.', 'Drei Standlinien bilden das Fehlerdreieck.'],
  },
]
