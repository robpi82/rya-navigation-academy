import type { MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify } from '@/types/learning'

/**
 * Phase 10: Sekundärhäfen. Fiktive Übungsdaten (siehe data/secondaryPorts.ts) – bei echten Aufgaben immer die Werte des
 * Almanachs verwenden. Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
 */
const REF = 'Standardhafen Ankerstedt: HW Springs 5,0 m, HW Nipp 4,0 m, NW Nipp 2,0 m, NW Springs 1,0 m.'
let counter = 0

function mc(id: string, difficulty: 1 | 2 | 3, prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic: 'secondary-ports', difficulty, level: 'coastal-skipper', category: 'concept', prompt, options, correctIndex: idx, solution: correct, steps }
}

function num(id: string, difficulty: 1 | 2 | 3, prompt: string, answer: number, tolerance: number, unit: NumericQuestion['unit'], verify: QuestionVerify, solution: string, steps: string[]): NumericQuestion {
  return { id, type: 'numeric', topic: 'secondary-ports', difficulty, level: 'coastal-skipper', category: 'calculation', prompt: `${prompt} ${REF}`, answer, tolerance, unit, verify, solution, steps }
}

const std = (hwHeight: number, lwHeight: number) => ({ stdHwTime: 630, stdHwHeight: hwHeight, stdLwTime: 1005, stdLwHeight: lwHeight })

export const COASTAL_SECONDARY: Question[] = [
  num('cs-040', 1, 'Im Standardhafen ist HW um 10:30 mit 4,5 m und NW um 16:45 mit 1,5 m. Inselhafen Kranich: HW −0:25 / −0,6 m Springs, −0,4 m Nipp. Welche HW-Höhe gilt in Kranich?', 4.0, 0.05, 'm', { kind: 'secondary', quantity: 'hwHeight', ...std(4.5, 1.5), port: 'kranich' }, '4,0 m', ['4,5 m liegt genau in der Mitte zwischen Nipp (4,0) und Springs (5,0): Faktor 0,5.', 'Unterschied = −0,4 + 0,5 × (−0,6 − (−0,4)) = −0,5 m.', 'HW Kranich = 4,5 − 0,5 = 4,0 m.']),
  num('cs-041', 2, 'Standardhafen: HW 4,5 m um 10:30, NW 1,5 m um 16:45. Nordbucht: NW +0,3 m Springs, +0,2 m Nipp. Welche NW-Höhe gilt in der Nordbucht?', 1.75, 0.05, 'm', { kind: 'secondary', quantity: 'lwHeight', ...std(4.5, 1.5), port: 'nordbucht' }, '1,75 m', ['1,5 m liegt zwischen NW Nipp (2,0) und NW Springs (1,0): Faktor 0,5.', 'Unterschied = +0,2 + 0,5 × (0,3 − 0,2) = +0,25 m.', 'NW Nordbucht = 1,5 + 0,25 = 1,75 m.']),
  num('cs-042', 2, 'Standardhafen: HW 23:50 mit 4,5 m, NW 1,5 m. Nordbucht: HW +0:50. Wie viele Minuten nach Mitternacht (des Folgetags) ist HW in der Nordbucht?', 40, 1, 'min', { kind: 'secondary', quantity: 'hwTimeMin', stdHwTime: 1430, stdHwHeight: 4.5, stdLwTime: 1805, stdLwHeight: 1.5, port: 'nordbucht' }, '00:40 Uhr (40 min nach Mitternacht)', ['23:50 + 0:50 = 24:40.', '24:40 entspricht 00:40 am Folgetag: 40 Minuten nach Mitternacht.']),
  num('cs-043', 3, 'Standardhafen: HW 4,5 m um 10:30, NW 1,5 m um 16:45. Wie groß ist der Tidenhub in der Nordbucht (HW +0,8 / +0,6, NW +0,3 / +0,2 m Springs/Nipp)?', 3.45, 0.05, 'm', { kind: 'secondary', quantity: 'range', ...std(4.5, 1.5), port: 'nordbucht' }, '3,45 m', ['HW: Faktor 0,5 → Unterschied 0,6 + 0,5 × 0,2 = 0,7 m → HW = 5,2 m.', 'NW: Faktor 0,5 → Unterschied +0,25 m → NW = 1,75 m.', 'Tidenhub = 5,2 − 1,75 = 3,45 m.']),
  num('cs-044', 2, 'Bei Springtide ist im Standardhafen HW 5,0 m und NW 1,0 m. Inselhafen Kranich: HW −0,6 m Springs. Welche HW-Höhe gilt in Kranich?', 4.4, 0.05, 'm', { kind: 'secondary', quantity: 'hwHeight', ...std(5.0, 1.0), port: 'kranich' }, '4,4 m', ['Standardhafen-HW entspricht genau dem Springwert: Faktor 1.', 'Es gilt der Springunterschied −0,6 m: 5,0 − 0,6 = 4,4 m.']),
  num('cs-045', 2, 'Bei Nipptide ist im Standardhafen HW 4,0 m und NW 2,0 m. Nordbucht: HW +0,6 m Nipp. Welche HW-Höhe gilt in der Nordbucht?', 4.6, 0.05, 'm', { kind: 'secondary', quantity: 'hwHeight', ...std(4.0, 2.0), port: 'nordbucht' }, '4,6 m', ['Standardhafen-HW entspricht genau dem Nippwert: Faktor 0.', 'Es gilt der Nippunterschied +0,6 m: 4,0 + 0,6 = 4,6 m.']),
  mc('cs-046', 1, 'Was ist ein Sekundärhafen?', 'Ein Hafen, berechnet über Unterschiede zu einem Standardhafen', ['Ein Hafen, der nur nachts angelaufen werden darf', 'Ein Hafen ohne Gezeiten', 'Ein Hafen, dessen Gezeiten direkt im Almanach als Tabelle stehen'], ['Für Standardhäfen enthält der Almanach tägliche Vorhersagen.', 'Für Sekundärhäfen gibt es Unterschiede (Zeit und Höhe) zum Standardhafen.']),
  mc('cs-047', 2, 'Warum werden die Höhenunterschiede für Springs und Nipp getrennt angegeben und interpoliert?', 'Weil sich die Unterschiede mit dem Tidenhub ändern', ['Weil Springtide nur im Sommer und Nipptide nur im Winter auftritt', 'Weil der Mond bei Nipptide nicht wirkt', 'Weil sonst die Zeit nicht berechnet werden kann'], ['Der Unterschied zwischen zwei Häfen ist nicht konstant, sondern hängt vom Tidenhub (Springs/Nipp) ab.', 'Man schätzt ihn nach der Lage der Standardhafen-Höhe zwischen Nipp- und Springwert.']),
  mc('cs-048', 2, 'Die Zeitunterschiede eines Sekundärhafens beziehen sich auf …', 'die HW-/NW-Zeiten des Standardhafens', ['die Uhrzeit des Sonnenaufgangs', 'die Zeit der vorigen Tide im Sekundärhafen', 'den Mondaufgang'], ['Man nimmt die Zeit von HW/NW des Standardhafens am selben Tag und addiert den Unterschied.', 'Bei Überschreiten von 24:00 Uhr wechselt das Datum.']),
]
