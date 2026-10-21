import type { DayTopicId, MultipleChoiceQuestion, Question } from '@/types/learning'

/**
 * Phase 48: Leinen, Knoten und Bootskunde (Day Skipper). Eigenständig erstellt und vereinfacht, keine Originalprüfungsfragen.
 */
let counter = 2

function mc(id: string, topic: DayTopicId, difficulty: 1 | 2 | 3, category: MultipleChoiceQuestion['category'], prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic, difficulty, level: 'day-skipper', category, prompt, options, correctIndex: idx, solution: correct, steps }
}

export const DAY_SKIPPER_SEAMANSHIP: Question[] = [
  mc('sk-001', 'seamanship', 1, 'concept', 'Wofür nimmt man an Bord einen Palstek?', 'Für ein festes Auge, das sich unter Last nicht zuzieht', ['Um zwei unterschiedlich dicke Leinen sicher zu verbinden', 'Um einen Fender kurzzeitig an der Reling festzumachen', 'Um das Ende einer Schot gegen Ausrauschen zu sichern'], ['Typisch: Auge im Festmacher zum Überwerfen auf einen Poller.', 'Unter Last lässt er sich nicht lösen.']),
  mc('sk-002', 'seamanship', 1, 'concept', 'Wofür eignet sich der Webeleinstek?', 'Fender vorübergehend an der Reling anbinden', ['Zwei Leinen unter hoher Last dauerhaft verbinden', 'Ein Auge zum Überwerfen auf einen Poller knüpfen', 'Die Ankerkette am Schiff sicher befestigen'], ['Er ist schnell gelegt und schnell gelöst.', 'Bei wechselndem Zug kann er sich lösen – nur kurzzeitig verwenden.']),
  mc('sk-003', 'seamanship', 1, 'concept', 'Wozu dient ein Achtknoten am Ende einer Schot?', 'Er verhindert, dass die Schot aus dem Block rauscht', ['Er verbindet die Schot dauerhaft mit dem Schothorn des Segels', 'Er kürzt die Schot, damit sie nicht ins Wasser hängt', 'Er markiert die richtige Trimmstellung für Am-Wind-Kurse'], ['Der Achtknoten ist ein Stopperknoten.', 'Er lässt sich auch nach Zug gut wieder lösen.']),
  mc('sk-004', 'seamanship', 1, 'concept', 'Zwei Leinen unterschiedlicher Dicke sollen verbunden werden. Welcher Knoten passt?', 'Schotstek', ['Kreuzknoten', 'Webeleinstek', 'Achtknoten'], ['Der Schotstek hält auch bei ungleichen Dicken; bei sehr ungleichen doppelt stecken.', 'Der Kreuzknoten ist dafür nicht geeignet.']),
  mc('sk-005', 'seamanship', 2, 'error', 'Ein Crewmitglied verbindet zwei Festmacher unter Last mit einem Kreuzknoten. Was ist falsch?', 'Ein Kreuzknoten kann unter Last kentern und aufgehen', ['Nichts – der Kreuzknoten ist der stärkste Verbindungsknoten', 'Er hätte beide Leinen vorher nass machen müssen, damit er hält', 'Festmacher dürfen grundsätzlich niemals verbunden werden'], ['Der Kreuzknoten ist für Reffbändsel um das Segel gedacht.', 'Zum Verbinden von Leinen: Schotstek.']),
  mc('sk-006', 'seamanship', 2, 'concept', 'Die Genuaschot hat einen Überläufer auf der Winsch. Womit nimmst du die Last herunter?', 'Mit einem Stopperstek und einer zweiten Leine', ['Mit einem Kreuzknoten zwischen Schot und Relingsdraht', 'Mit einem Achtknoten direkt vor der Winschtrommel', 'Mit einem Webeleinstek um den Mast'], ['Der Stopperstek greift die belastete Schot und hält sie, während man den Überläufer löst.', 'In Zugrichtung legen, sonst rutscht er.']),
  mc('sk-007', 'seamanship', 1, 'concept', 'Womit belegt man eine Leine an einem Ring so, dass sie unter Last lösbar bleibt?', 'Rundtörn mit zwei halben Schlägen', ['Kreuzknoten um den Ring gelegt und gesichert', 'Achtknoten mit zusätzlichem Kopfschlag', 'Webeleinstek um den Ring'], ['Der Rundtörn nimmt die Last auf, die halben Schläge sichern nur.', 'Zum Lösen erst die Schläge aufmachen, dann den Törn kontrolliert fieren.']),
  mc('sk-008', 'seamanship', 1, 'concept', 'Wie heißt die hintere Kante des Großsegels?', 'Achterliek', ['Vorliek', 'Unterliek', 'Achterstag'], ['Kanten: Vorliek (vorn), Achterliek (hinten), Unterliek (unten).', 'Das Achterstag ist ein Draht, der den Mast nach achtern hält.']),
  mc('sk-009', 'seamanship', 1, 'concept', 'Womit wird ein Segel gesetzt (hochgezogen)?', 'Mit dem Fall', ['Mit der Schot', 'Mit dem Niederholer', 'Mit der Reffleine'], ['Das Fall greift am Kopf des Segels an.', 'Mit der Schot wird das Segel getrimmt.']),
  mc('sk-010', 'seamanship', 2, 'concept', 'Wie belegt man eine Leine richtig auf einer Klampe?', 'Rundtörn, dann Kreuzschläge, zum Schluss ein Kopfschlag', ['Nur mehrere Kopfschläge übereinander, damit wirklich nichts rutscht', 'Mit einem Palstek um beide Hörner der Klampe', 'Lose um die Klampe wickeln, ohne zu kreuzen'], ['So hält die Leine und lässt sich auch unter Last schnell lösen.', 'Viele Kopfschläge ziehen sich fest und klemmen.']),
  mc('sk-011', 'seamanship', 1, 'concept', 'Was halten die Wanten?', 'Den Mast seitlich', ['Den Mast nach vorn und achtern', 'Den Baum in seiner Höhe', 'Das Vorsegel am Vorstag'], ['Vorstag und Achterstag halten den Mast in Längsrichtung.', 'Die Salinge spreizen die Wanten ab.']),
  mc('sk-012', 'seamanship', 1, 'concept', 'Warum schützt man Festmacher an scharfen Kanten mit einem Scheuerschutz?', 'Damit sie nicht durchscheuern und brechen', ['Damit sie bei Regen nicht nass werden', 'Damit sie im Dunkeln besser sichtbar sind', 'Damit sie schneller über die Klampe gleiten'], ['Bei Schwell bewegt sich die Leine ständig über die Kante.', 'Ein Schlauchstück oder Tuch verhindert das Durchscheuern.']),
]
