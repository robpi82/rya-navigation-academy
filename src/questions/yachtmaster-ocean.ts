import type { MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify, YachtTopicId } from '@/types/learning'

/**
 * Phase 45: Ozeanpassage (Yachtmaster). Eigenständig erstellt und vereinfacht, keine Originalfragen.
 * Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
 */
let counter = 3

function mc(id: string, topic: YachtTopicId, difficulty: 1 | 2 | 3, category: MultipleChoiceQuestion['category'], prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic, difficulty, level: 'yachtmaster-offshore', category, prompt, options, correctIndex: idx, solution: correct, steps }
}

function num(id: string, topic: YachtTopicId, difficulty: 1 | 2 | 3, prompt: string, answer: number, tolerance: number, unit: NumericQuestion['unit'], verify: QuestionVerify, solution: string, steps: string[]): NumericQuestion {
  return { id, type: 'numeric', topic, difficulty, level: 'yachtmaster-offshore', category: 'calculation', prompt, answer, tolerance, unit, verify, solution, steps }
}

export const YACHTMASTER_OCEAN: Question[] = [
  num('yo-001', 'ocean-passage', 1, 'Das Etmal (Mittag bis Mittag) betrug 144 NM. Wie hoch war die mittlere Fahrt?', 6, 0.05, 'kn', { kind: 'ocean', quantity: 'speed', etmalNm: 144 }, '6 kn', ['Ein Etmal umfasst 24 Stunden.', '144 / 24 = 6 kn.']),
  num('yo-002', 'ocean-passage', 1, 'Bis zum Ziel sind es 2700 NM, du rechnest mit einem Etmal von 150 NM. Wie viele Tage dauert die Überfahrt?', 18, 0.05, 'Tage', { kind: 'ocean', quantity: 'days', distanceNm: 2700, etmalNm: 150 }, '18 Tage', ['2700 / 150 = 18 Tage.', 'Für Vorräte rechnet man mit Reserve, z. B. 30 % mehr.']),
  num('yo-003', 'ocean-passage', 2, 'Vier Personen, geplant 20 Tage, 3 Liter Trinkwasser pro Person und Tag, dazu 30 % Reserve. Wie viele Liter brauchst du?', 312, 1, 'l', { kind: 'ocean', quantity: 'water', crew: 4, days: 20, litresPerPersonDay: 3, reserve: 0.3 }, '312 l', ['4 × 20 × 3 = 240 l.', 'Plus 30 %: 240 × 1,3 = 312 l – einen Teil getrennt in Kanistern lagern.']),
  num('yo-004', 'ocean-passage', 2, 'Von Las Palmas (15,4° W) nach Antigua (61,8° W). Um wie viele Stunden stellst du die Bordzeit unterwegs insgesamt zurück?', 3.1, 0.1, 'h', { kind: 'ocean', quantity: 'clockBack', fromLon: -15.4, toLon: -61.8 }, 'etwa 3 Stunden', ['Längenunterschied: 61,8 − 15,4 = 46,4°.', '46,4 / 15 ≈ 3,1 h – nach Westen wird die Uhr zurückgestellt.']),
  num('yo-005', 'ocean-passage', 1, 'Die Crew hat 20 Tage Zeit für 2800 NM. Welches Etmal muss das Boot im Schnitt schaffen?', 140, 1, 'NM', { kind: 'ocean', quantity: 'etmalNeeded', distanceNm: 2800, days: 20 }, '140 NM pro Tag', ['2800 / 20 = 140 NM.', 'Das entspricht knapp 5,8 kn im Mittel – Flautentage eingerechnet.']),
  num('yo-006', 'ocean-passage', 3, 'Kurs genau West auf 17° N mit einem Etmal von 140 NM. Nach wie vielen Tagen stellst du die Uhr jeweils um eine Stunde zurück?', 6.15, 0.1, 'Tage', { kind: 'ocean', quantity: 'daysPerHour', etmalNm: 140, latDeg: 17 }, 'etwa alle 6 Tage', ['Längenänderung pro Tag: 140 / (60 · cos 17°) ≈ 2,44°.', '15° / 2,44° ≈ 6,2 Tage je Stunde.']),
  mc('yo-007', 'ocean-passage', 1, 'concept', 'Wann ist im Nordatlantik offiziell Hurrikansaison?', 'Von Juni bis November', ['Von Januar bis März, im Nordwinter', 'Nur im Juli und August, sonst nie', 'Von Dezember bis Februar in der Karibik'], ['Offiziell 1. Juni bis 30. November, mit einem Höhepunkt im August und September.', 'Deshalb starten Atlantiküberquerungen nach Westen meist ab Ende November.']),
  mc('yo-008', 'ocean-passage', 2, 'concept', 'Warum starten viele Yachten ihre Atlantiküberquerung von den Kanaren in die Karibik Ende November?', 'Die Hurrikansaison endet, der Passat wird beständig', ['Weil der Golfstrom dann am stärksten nach Westen setzt', 'Weil im Winter die Tage auf See am längsten sind', 'Weil die Kanaren im Sommer für Yachten gesperrt sind'], ['Bei der Ankunft im Dezember ist die Karibik außerhalb der Hurrikansaison.', 'Der Golfstrom setzt im Nordatlantik nach Nordosten, nicht nach Westen.']),
  mc('yo-009', 'ocean-passage', 2, 'concept', 'Was zeigt eine Pilot Chart?', 'Monatliche Mittelwerte von Wind, Strom und Stürmen', ['Die genaue Wettervorhersage für die nächsten zehn Tage der Überfahrt', 'Die Tiefenlinien und Gefahren für die Hafeneinfahrt', 'Die Lichter aller Leuchtfeuer entlang der Ozeanroute'], ['Pilot Charts fassen langjährige Beobachtungen für jeden Monat zusammen – Windrosen, Strom, Sturmhäufigkeit, Nebel, Eisgrenze.', 'Sie zeigen, was typisch ist, nicht was kommt.']),
  mc('yo-010', 'ocean-passage', 2, 'concept', 'Wie segelt man üblicherweise von der Karibik zurück nach Europa?', 'Nordwärts in die Westwinde, über Bermuda oder die Azoren', ['Gegen den Passat auf direktem Weg nach Osten zurück', 'Südlich über die Kapverden mit dem Nordostpassat', 'Entlang des Äquators im Mallungsgürtel mit beständigem Ostwind'], ['Gegen den Passat zu kreuzen wäre lang und hart.', 'Im Mallungsgürtel (Doldrums) herrschen Flauten und Gewitter, kein beständiger Wind.']),
]
