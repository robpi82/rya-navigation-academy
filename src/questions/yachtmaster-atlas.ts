import type { MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify, YachtTopicId } from '@/types/learning'

/**
 * Phase 43: Gezeitenstromatlas (Yachtmaster). Eigenständig erstellt und vereinfacht, keine Originalfragen.
 * Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
 */
let counter = 1

function mc(id: string, topic: YachtTopicId, difficulty: 1 | 2 | 3, category: MultipleChoiceQuestion['category'], prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic, difficulty, level: 'yachtmaster-offshore', category, prompt, options, correctIndex: idx, solution: correct, steps }
}

function num(id: string, topic: YachtTopicId, difficulty: 1 | 2 | 3, prompt: string, answer: number, tolerance: number, unit: NumericQuestion['unit'], verify: QuestionVerify, solution: string, steps: string[], isBearing = false): NumericQuestion {
  return { id, type: 'numeric', topic, difficulty, level: 'yachtmaster-offshore', category: isBearing ? 'course' : 'calculation', prompt, answer, tolerance, unit, isBearing: isBearing || undefined, verify, solution, steps }
}

const easterly = { set: 90, rate: 1.5 }

export const YACHTMASTER_ATLAS: Question[] = [
  num('yt-001', 'tidal-atlas', 2, 'Der Atlas zeigt „08,16“. Nipp-Hub 1,9 m, Spring-Hub 4,1 m, heute 3,0 m. Wie stark ist der Strom heute?', 1.2, 0.05, 'kn', { kind: 'atlas', quantity: 'rate', label: '08,16', range: 3, neapRange: 1.9, springRange: 4.1 }, '1,2 kn', ['„08,16“: Nipp 0,8 kn, Spring 1,6 kn.', 'Anteil: (3,0 − 1,9) / (4,1 − 1,9) = 0,5 → 0,8 + 0,5 · 0,8 = 1,2 kn.']),
  num('yt-002', 'tidal-atlas', 3, 'Gleiche Angabe „08,16“, aber heute ist der Tidenhub 4,5 m – größer als der Spring-Hub von 4,1 m (Nipp 1,9 m). Wie stark ist der Strom?', 1.75, 0.05, 'kn', { kind: 'atlas', quantity: 'rate', label: '08,16', range: 4.5, neapRange: 1.9, springRange: 4.1 }, 'etwa 1,75 kn – mehr als der Springwert', ['Anteil: (4,5 − 1,9) / 2,2 ≈ 1,18 – über 1 hinaus.', '0,8 + 1,18 · 0,8 ≈ 1,75 kn: über den Springwert hinaus extrapolieren.']),
  num('yt-003', 'tidal-atlas', 1, 'HW im Bezugshafen ist um 10:40. Welche Atlasseite gilt um 13:15? Antwort in Stunden nach HW (z. B. 3 für HW+3).', 3, 0, 'h', { kind: 'atlas', quantity: 'page', minutesFromHw: 155 }, 'Seite HW+3', ['13:15 − 10:40 = 2 h 35 min nach HW.', 'Nächste volle Stunde: HW+3 (gilt von HW+2:30 bis HW+3:30).']),
  num('yt-004', 'tidal-atlas', 2, 'Du legst um HW−2:20 ab. Welche Atlasseite nimmst du für die zweite Stunde der Überfahrt? Antwort als Zahl (HW−1 = −1).', -1, 0, 'h', { kind: 'atlas', quantity: 'passagePage', minutesFromHw: -140, hourIndex: 1 }, 'Seite HW−1', ['Die zweite Stunde läuft von HW−1:20 bis HW−0:20, ihre Mitte ist HW−0:50.', 'Nächste volle Stunde zur Mitte: HW−1.']),
  num('yt-005', 'tidal-atlas', 1, 'Für drei Stunden zeigt der Atlas (bereits für heute umgerechnet) 070° mit 1,2 kn, 070° mit 1,6 kn und 070° mit 1,0 kn. Wie weit versetzt dich der Strom insgesamt?', 3.8, 0.05, 'NM', { kind: 'atlas', quantity: 'drift', tides: [{ set: 70, rate: 1.2 }, { set: 70, rate: 1.6 }, { set: 70, rate: 1 }], hours: 3 }, '3,8 NM nach 070°', ['Alle drei Vektoren zeigen in dieselbe Richtung.', '1,2 + 1,6 + 1,0 = 3,8 NM.']),
  num('yt-006', 'tidal-atlas', 3, 'Kurs über Grund 000°, 12 NM, Fahrt durchs Wasser 6 kn. Der Atlas zeigt für jede Stunde 090° mit 1,5 kn. Welchen Kurs steuerst du für die ganze Überfahrt?', 345.5, 1, '°', { kind: 'passage', desiredTrack: 0, distance: 12, stw: 6, tides: [easterly, easterly, easterly], quantity: 'cts' }, 'etwa 345°', ['Fahrzeit etwa 2 h 04 min → Stromversatz ≈ 3,1 NM nach Ost.', 'Wasserweg ≈ 12,4 NM; sin α = 3,1 / 12,4 → α ≈ 14,5° → CTS ≈ 345,5°.'], true),
  mc('yt-007', 'tidal-atlas', 1, 'concept', 'Was bedeutet die Atlasangabe „08,15“?', 'Nipp 0,8 kn, Spring 1,5 kn', ['Strom setzt von 08 bis 15 Uhr mit voller Stärke', 'Spring 0,8 kn, Nipp 1,5 kn', 'Setzrichtung 080°, Rate 1,5 kn bei Springzeit'], ['Die Zahlen sind Zehntelknoten, zuerst Nipp, dann Spring.', 'Die Richtung zeigt der Pfeil.']),
  mc('yt-008', 'tidal-atlas', 2, 'concept', 'Warum nimmt man für jede Stunde einer Überfahrt die Seite zur Mitte dieser Stunde?', 'Weil jede Seite den Strom ±30 min um ihre Stunde zeigt', ['Weil der Atlas nur volle Stunden kennt und Minuten ignoriert werden müssen', 'Weil der Strom zur vollen Stunde immer am stärksten ist', 'Weil man sonst Spring- und Nippwerte vertauschen würde'], ['Eine Seite gilt von 30 min vor bis 30 min nach ihrer Stunde.', 'Die Mitte der Fahrtstunde trifft so die passende Seite.']),
  mc('yt-009', 'tidal-atlas', 2, 'concept', 'Der Tidenhub heute ist größer als der Spring-Hub des Atlas. Was tust du?', 'Über den Springwert hinaus extrapolieren', ['Den Springwert nehmen, mehr Strom gibt es nicht', 'Den Nippwert nehmen, um vorsichtig zu sein', 'Den Atlas weglassen und ganz ohne Strom koppeln'], ['Die Rate wächst etwa linear mit dem Tidenhub – auch über Spring hinaus.', 'Bei sehr großen Tiden ist der Strom stärker als im Atlas angegeben.']),
  mc('yt-010', 'tidal-atlas', 2, 'concept', 'Warum steuert man über mehrere Stunden einen einzigen CTS, statt jede Stunde neu gegenzuhalten?', 'Die Versätze heben sich teils auf, der Weg wird kürzer', ['Weil ein Kurswechsel auf See nur zur vollen Stunde erlaubt ist', 'Weil sich der Strom während einer Überfahrt nicht ändert', 'Weil man so jederzeit genau auf der Kurslinie bleibt'], ['Wer jede Stunde gegenhält, segelt gegen Strom an, der später ohnehin zurücksetzt.', 'Dafür verlässt man zwischendurch die Kurslinie – Gefahren daneben beachten.']),
]
