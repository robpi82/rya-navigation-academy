import type { DayTopicId, MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify } from '@/types/learning'

/**
 * Phase 51: Pilotage und Nebel im Küstennahbereich (Day Skipper). Eigenständig erstellt und vereinfacht, keine Originalprüfungsfragen.
 * Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
 */
let counter = 3

function mc(id: string, topic: DayTopicId, difficulty: 1 | 2 | 3, category: MultipleChoiceQuestion['category'], prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic, difficulty, level: 'day-skipper', category, prompt, options, correctIndex: idx, solution: correct, steps }
}

function num(id: string, topic: DayTopicId, difficulty: 1 | 2 | 3, prompt: string, answer: number, tolerance: number, unit: NumericQuestion['unit'], verify: QuestionVerify, solution: string, steps: string[]): NumericQuestion {
  return { id, type: 'numeric', topic, difficulty, level: 'day-skipper', category: 'calculation', prompt, answer, tolerance, unit, verify, solution, steps }
}

export const DAY_SKIPPER_INSHORE: Question[] = [
  num('ip-001', 'inshore', 1, 'Im Pilotageplan ist der nächste Abschnitt 1,2 NM lang, du läufst 4 kn. Nach wie vielen Minuten sollte die nächste Marke querab sein?', 18, 0.5, 'min', { kind: 'inshore', quantity: 'legMinutes', distanceNm: 1.2, speedKn: 4 }, '18 min', ['1,2 / 4 = 0,3 h.', '0,3 × 60 = 18 min – mit der Uhr kontrollieren, ob die Marke kommt.']),
  num('ip-002', 'inshore', 1, 'Abschnitt 0,8 NM bei 5 kn. Wie viele Minuten dauert er?', 9.6, 0.2, 'min', { kind: 'inshore', quantity: 'legMinutes', distanceNm: 0.8, speedKn: 5 }, 'knapp 10 min', ['0,8 / 5 = 0,16 h.', '0,16 × 60 = 9,6 min.']),
  mc('ip-003', 'inshore', 1, 'concept', 'Du läufst nachts auf ein Sektorenfeuer zu und siehst es weiß. Was bedeutet das?', 'Du bist im sicheren Sektor der Einfahrt', ['Du bist zu weit nach Backbord geraten und musst wenden', 'Das Feuer ist ausgefallen und zeigt nur noch die Ersatzfarbe', 'Die Einfahrt ist gesperrt, du musst draußen warten'], ['Bei Sektorenfeuern markiert in der Regel der weiße Sektor das sichere Fahrwasser.', 'Grenzen und Farben stehen in der Seekarte.']),
  mc('ip-004', 'inshore', 2, 'concept', 'Statt Weiß siehst du plötzlich Rot. Was tust du?', 'In der Karte die Seite prüfen und zurück ins Weiß', ['Weiterfahren, Rot bedeutet nur, dass der Hafen voll ist', 'Sofort stoppen und auf Tageslicht warten, egal wo du bist', 'Den Kurs beibehalten, Rot und Weiß sind gleichwertig'], ['Rot oder Grün heißt: neben dem sicheren Sektor.', 'Welche Seite welche Farbe hat, ist je Feuer verschieden.']),
  mc('ip-005', 'inshore', 1, 'concept', 'An der Hafeneinfahrt leuchten drei feste rote Lichter senkrecht übereinander. Was gilt?', 'Ein- und Auslaufen verboten', ['Einfahrt frei, aber nur mit Lotsen', 'Hafen geschlossen, aber Yachten dürfen einlaufen', 'Gegenverkehr im Fahrwasser, Vorsicht'], ['Internationale Hafensignale: drei rote Lichter = nicht weiterfahren.', 'Blinken sie, herrscht ein ernster Notfall – stoppen oder nach Anweisung ausweichen.']),
  mc('ip-006', 'inshore', 2, 'concept', 'Drei grüne Lichter senkrecht übereinander an der Hafeneinfahrt bedeuten …', 'Fahrt frei, Einbahnverkehr', ['Ein- und Auslaufen nur nach Anmeldung über Funk', 'Hafen wegen Sturm geschlossen', 'Nur Berufsschifffahrt darf fahren'], ['Drei grüne Lichter: Das Fahrwasser ist frei, der Verkehr läuft in einer Richtung.', 'Örtliche Zusatzsignale stehen im Hafenhandbuch.']),
  mc('ip-007', 'inshore', 2, 'concept', 'Du fährst eine Deckpeilung ein. Die vordere Marke wandert nach links von der hinteren. Wohin steuerst du?', 'Nach links, zur vorderen Marke hin', ['Nach rechts, von der vorderen Marke weg', 'Geradeaus weiter, das gleicht sich aus', 'Zur hinteren Marke hin, also nach rechts'], ['Die nähere Marke scheint sich entgegen deinem Versatz zu bewegen – du bist rechts der Linie.', 'Steuere zur vorderen Marke hin, bis beide wieder übereinander stehen.']),
  mc('ip-008', 'inshore', 1, 'concept', 'Auf einem Küstentörn zieht Nebel auf. Was tust du zuerst?', 'Ort bestimmen und eintragen', ['Sofort mit voller Fahrt in den Hafen laufen', 'Alle Lichter ausschalten, um Strom zu sparen', 'Den Anker werfen, egal wie tief es ist'], ['Solange noch Marken sichtbar sind, ist ein sicherer Ort Gold wert.', 'Danach: Westen, Ausguck, Signale, Fahrt reduzieren.']),
  mc('ip-009', 'inshore', 2, 'concept', 'Welches Schallsignal gibt eine Segelyacht unter Segeln im Nebel?', 'Lang–kurz–kurz, mindestens alle 2 Minuten', ['Ein langer Ton, mindestens alle 2 Minuten', 'Zwei lange Töne, mindestens alle 2 Minuten', 'Fünf kurze Töne, sobald ein Schiff in Sicht kommt'], ['Regel 35(c): lang–kurz–kurz für Segelfahrzeuge (und z. B. manövrierbehinderte Fahrzeuge).', 'Unter Maschine in Fahrt: ein langer Ton.']),
  mc('ip-010', 'inshore', 2, 'concept', 'Wohin navigierst du bei Nebel möglichst?', 'In flacheres Wasser abseits der Schifffahrtswege', ['In die Mitte des Fahrwassers, dort ist es am tiefsten', 'Dicht hinter ein großes Schiff, um ihm zu folgen', 'Auf die offene See, möglichst weit weg von jeder Küste'], ['Große Schiffe fahren nicht ins flache Wasser.', 'Tiefe ständig kontrollieren; ggf. ankern, bis sich der Nebel lichtet.']),
  mc('ip-011', 'inshore', 1, 'concept', 'Warum setzt man bei Nebel einen Radarreflektor?', 'Damit andere Schiffe dich auf dem Radar erkennen', ['Damit dein eigenes Radar weiter reicht', 'Weil er die Nebelsignale verstärkt', 'Damit das GPS die eigene Position genauer bestimmen kann'], ['Eine kleine Yacht ist auf dem Radar sonst kaum zu sehen.', 'AIS ergänzt das, ersetzt aber nicht den Reflektor.']),
  mc('ip-012', 'inshore', 1, 'concept', 'Was gehört in einen Pilotageplan?', 'Marken, Kurse, Distanzen und Gefahren je Abschnitt', ['Nur die Hafengebühren und Öffnungszeiten', 'Die Wettervorhersage für die nächsten zwei Wochen im Revier', 'Die Liste aller Crewmitglieder mit Adresse'], ['Kurz und groß geschrieben, damit er an Deck lesbar ist.', 'Dazu Zeiten, Tiefen und was als Nächstes kommt.']),
]
