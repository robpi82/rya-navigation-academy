import type { DayTopicId, MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify } from '@/types/learning'

/**
 * Phase 38: Törnvorbereitung und Seemannschaft (Day Skipper).
 * Eigenständig erstellt und vereinfacht, keine Originalprüfungsfragen. Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
 */
let counter = 1

function mc(id: string, topic: DayTopicId, difficulty: 1 | 2 | 3, category: MultipleChoiceQuestion['category'], prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic, difficulty, level: 'day-skipper', category, prompt, options, correctIndex: idx, solution: correct, steps }
}

function num(id: string, topic: DayTopicId, difficulty: 1 | 2 | 3, prompt: string, answer: number, tolerance: number, unit: NumericQuestion['unit'], verify: QuestionVerify, solution: string, steps: string[]): NumericQuestion {
  return { id, type: 'numeric', topic, difficulty, level: 'day-skipper', category: 'calculation', prompt, answer, tolerance, unit, verify, solution, steps }
}

export const DAY_SKIPPER_PREP: Question[] = [
  num('dp-001', 'preparation', 1, 'Die Strecke ist 24 NM lang. Unter Maschine läufst du 6 kn und verbrauchst 3 l/h. Wie viel Diesel brauchst du mit 20 % Reserve?', 14.4, 0.1, 'l', { kind: 'prep', quantity: 'fuel', distanceNm: 24, sogKn: 6, litresPerHour: 3, reserve: 0.2 }, '14,4 l', ['Fahrzeit 24 / 6 = 4 h → 4 × 3 = 12 l.', 'Plus 20 %: 12 × 1,2 = 14,4 l.']),
  num('dp-002', 'preparation', 2, 'Im Tank sind 60 l, die Maschine verbraucht 4 l/h bei 6 kn. Wie weit darfst du nach der Drittelregel hinausfahren?', 30, 0.5, 'NM', { kind: 'prep', quantity: 'thirds', tankLitres: 60, litresPerHour: 4, sogKn: 6 }, '30 NM', ['Ein Drittel: 20 l → 20 / 4 = 5 h.', '5 h × 6 kn = 30 NM hinaus, ein Drittel für den Rückweg, ein Drittel Reserve.']),
  num('dp-003', 'preparation', 1, 'Vier Personen, drei Tage, 3 Liter Trinkwasser pro Person und Tag. Wie viele Liter Trinkwasser brauchst du mindestens?', 36, 0.5, 'l', { kind: 'prep', quantity: 'water', crew: 4, days: 3, litresPerPersonDay: 3 }, '36 l', ['4 × 3 × 3 = 36 l.', 'Dazu Reserve, falls der Törn länger dauert.']),
  num('dp-004', 'preparation', 2, 'Abfahrt 09:00, 30 NM bei 5 kn, Sonnenuntergang 17:30. Wie viele Stunden Reserve bis Sonnenuntergang bleiben?', 2.5, 0.05, 'h', { kind: 'prep', quantity: 'margin', departHour: 9, distanceNm: 30, sogKn: 5, sunsetHour: 17.5 }, '2,5 h', ['Fahrzeit 30 / 5 = 6 h → Ankunft 15:00.', '17:30 − 15:00 = 2,5 h Reserve.']),
  mc('dp-005', 'preparation', 1, 'concept', 'Wem hinterlässt du vor einem Törn deinen Törnplan?', 'Einer verlässlichen Person an Land (in UK auch über RYA SafeTrx) – mit Route, ETA und Crew, damit sie bei Überfälligkeit Alarm schlagen kann', ['Niemandem, das ist Privatsache', 'Nur dem Hafenmeister im Zielhafen', 'Der Crew – an Bord reicht das'], ['Ohne Törnplan an Land merkt niemand, dass du überfällig bist.', 'Nach der Ankunft Bescheid geben, sonst gibt es Fehlalarm.']),
  mc('dp-006', 'preparation', 1, 'concept', 'Wer bekommt das Sicherheitsbriefing vor dem Ablegen?', 'Alle an Bord – auch erfahrene Crew, denn jedes Boot ist anders ausgerüstet', ['Nur Anfänger', 'Nur der Steuermann', 'Niemand, die Sicherheitsausrüstung ist beschriftet'], ['Wo liegen Löscher, Signalmittel, Gashahn auf genau diesem Boot?', 'Fällt der Skipper aus, muss die Crew handeln können.']),
  mc('dp-007', 'preparation', 2, 'concept', 'Du hast die Maschine gestartet. Was prüfst du sofort?', 'Ob Kühlwasser aus dem Auspuff kommt', ['Den Ölstand – jetzt ist er am genauesten', 'Ob der Kompass richtig zeigt', 'Ob der Anker gut verstaut ist'], ['Ohne Kühlwasserfluss überhitzt der Motor in Minuten (Seeventil zu? Impeller defekt?).', 'Den Ölstand misst man vor dem Start bei stehender Maschine.']),
  mc('dp-008', 'preparation', 2, 'error', 'Ein Skipper prüft morgens nur die Vorhersage für die nächsten zwei Stunden und legt zu einem Tagestörn mit Rückfahrt am Abend ab. Was ist falsch?', 'Die Vorhersage muss die ganze Törndauer abdecken – einschließlich der Rückfahrt und möglicher Ausweichhäfen', ['Nichts, das Wetter am Morgen entscheidet', 'Er hätte gar keine Vorhersage gebraucht', 'Er hätte nur den Barometerstand prüfen müssen'], ['Gerade nachmittags kann der Wind zunehmen (Seewind, Front).', 'Bei unsicherer Lage den Plan anpassen oder im Hafen bleiben.']),
  mc('dp-009', 'preparation', 1, 'concept', 'Was gehört zum Maschinen-Check vor dem Start?', 'Ölstand, Kühlwasser und Seeventil, Keilriemen, Kraftstoff und ein Blick in die Bilge', ['Nur der Kraftstoffstand', 'Nichts – Schiffsdiesel prüfen sich selbst', 'Nur ein Probelauf unter Volllast im Hafen'], ['Fehler im Hafen zu finden ist viel einfacher als auf See.', 'Öl bei stehender Maschine messen.']),
  mc('dp-010', 'preparation', 2, 'concept', 'Warum gehören Ausweichhäfen in den Törnplan?', 'Wenn Wetter, Boot oder Crew nicht mitspielen, braucht man ein Ziel, das auch bei diesen Bedingungen sicher anzulaufen ist', ['Damit man unterwegs einkaufen kann', 'Weil der Zielhafen immer voll ist', 'Weil sie vorgeschrieben im Logbuch stehen müssen'], ['Eine Barre bei auflandigem Starkwind ist kein Ausweichhafen.', 'Gezeiten des Ausweichhafens gleich mitprüfen.']),
]
