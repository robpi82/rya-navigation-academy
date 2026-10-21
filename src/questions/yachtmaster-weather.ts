import type { MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify, YachtTopicId } from '@/types/learning'

/**
 * Phase 42: Wetterkarten lesen (Yachtmaster, Nordhalbkugel). Eigenständig erstellt und vereinfacht, keine Originalfragen.
 * Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
 */
let counter = 2

function mc(id: string, topic: YachtTopicId, difficulty: 1 | 2 | 3, category: MultipleChoiceQuestion['category'], prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic, difficulty, level: 'yachtmaster-offshore', category, prompt, options, correctIndex: idx, solution: correct, steps }
}

function num(id: string, topic: YachtTopicId, difficulty: 1 | 2 | 3, prompt: string, answer: number, tolerance: number, unit: NumericQuestion['unit'], verify: QuestionVerify, solution: string, steps: string[], isBearing = false): NumericQuestion {
  return { id, type: 'numeric', topic, difficulty, level: 'yachtmaster-offshore', category: isBearing ? 'course' : 'calculation', prompt, answer, tolerance, unit, isBearing: isBearing || undefined, verify, solution, steps }
}

export const YACHTMASTER_WEATHER: Question[] = [
  num('yw-001', 'weather-charts', 2, 'Auf 50° N liegen zwei Isobaren (4 hPa Unterschied) 100 NM auseinander. Wie stark ist der geostrophische Wind (V = Δp / (ρ · f · Δn), ρ = 1,225 kg/m³)?', 30.7, 1, 'kn', { kind: 'wxchart', quantity: 'geostrophic', intervalHpa: 4, spacingNm: 100, latDeg: 50 }, 'etwa 31 kn', ['f = 2 · 7,29·10⁻⁵ · sin 50° ≈ 1,12·10⁻⁴ 1/s; Δn = 185 200 m; Δp = 400 Pa.', 'V = 400 / (1,225 · 1,12·10⁻⁴ · 185 200) ≈ 15,8 m/s ≈ 31 kn.']),
  num('yw-002', 'weather-charts', 2, 'Gleiche Lage (31 kn geostrophisch). Mit welchem Bodenwind über See rechnest du nach der Faustregel „drei Viertel“?', 23, 1, 'kn', { kind: 'wxchart', quantity: 'surface', intervalHpa: 4, spacingNm: 100, latDeg: 50 }, 'etwa 23 kn (Bft 6)', ['Reibung bremst den Wind über See auf rund drei Viertel.', '0,75 × 30,7 ≈ 23 kn – Böen können deutlich stärker sein.']),
  num('yw-003', 'weather-charts', 2, 'Du stehst genau südlich eines Tiefs (Nordhalbkugel). Aus welcher Richtung weht der Bodenwind über See, wenn er um 15° zum Tief hin gedreht ist?', 255, 5, '°', { kind: 'wxchart', quantity: 'surfaceDir', bearingFromCentre: 180, system: 'low' }, 'aus etwa 255° (WSW)', ['Südlich eines Tiefs weht der Wind parallel zu den Isobaren aus West (270°).', 'Reibung dreht ihn 15° zum Tief hin, also nach links: aus etwa 255°.'], true),
  num('yw-004', 'weather-charts', 1, 'Eine Kaltfront liegt 120 NM westlich und zieht mit 25 kn nach Osten. In wie vielen Stunden erreicht sie dich?', 4.8, 0.05, 'h', { kind: 'wxchart', quantity: 'frontHours', distanceNm: 120, speedKn: 25 }, 'in etwa 4,8 Stunden', ['120 / 25 = 4,8 h ≈ 4 h 48 min.', 'Reffen und das Schiff klarmachen, bevor die Böen kommen.']),
  num('yw-005', 'weather-charts', 3, 'Die Isobaren aus Aufgabe 1 (31 kn geostrophisch, 50° N) sind um ein Tief mit 300 NM Radius gekrümmt. Wie stark ist der Gradientwind?', 25, 1, 'kn', { kind: 'wxchart', quantity: 'gradient', intervalHpa: 4, spacingNm: 100, latDeg: 50, radiusNm: 300, system: 'low' }, 'etwa 25 kn', ['Um ein Tief gilt V = −fR/2 + √((fR/2)² + fR · Vg).', 'Mit f ≈ 1,12·10⁻⁴, R = 555 600 m, Vg ≈ 15,8 m/s: V ≈ 13 m/s ≈ 25 kn – schwächer als geostrophisch.']),
  num('yw-006', 'weather-charts', 2, 'Gleicher Isobarenabstand (4 hPa auf 100 NM), aber auf 35° N statt 50° N. Wie stark ist der geostrophische Wind dort?', 41, 1, 'kn', { kind: 'wxchart', quantity: 'geostrophic', intervalHpa: 4, spacingNm: 100, latDeg: 35 }, 'etwa 41 kn', ['Der Wind ist umgekehrt proportional zu sin φ.', '30,7 × sin 50° / sin 35° ≈ 30,7 × 1,34 ≈ 41 kn – gleiche Isobaren bedeuten im Süden mehr Wind.']),
  mc('yw-007', 'weather-charts', 2, 'concept', 'Warum weht der Bodenwind über See nicht genau parallel zu den Isobaren?', 'Reibung bremst ihn und lenkt ihn zum Tief hin ab', ['Weil die Corioliskraft über Wasser nicht wirkt und er geradeaus weht', 'Weil der Gezeitenstrom ihn stets um 15° mitnimmt', 'Weil Isobaren über See grundsätzlich ungenau gezeichnet sind'], ['Ohne Reibung wäre der Wind geostrophisch, also isobarenparallel.', 'Über See: rund drei Viertel der Stärke, etwa 15° zum Tief hin; über Land mehr.']),
  mc('yw-008', 'weather-charts', 3, 'concept', 'Die Isobaren um ein Tief sind stark gekrümmt. Wie verhält sich der Wind im Vergleich zum Wert aus dem Isobarenabstand?', 'Er ist schwächer als der geostrophische Wert', ['Er ist genauso stark, die Krümmung spielt keine Rolle', 'Er ist deutlich stärker, weil das Tief ihn ansaugt', 'Er dreht in die Gegenrichtung'], ['Bei Krümmung um ein Tief ist der Gradientwind kleiner als der geostrophische.', 'Um ein Hoch ist er etwas größer – dort liegen die Isobaren aber meist weit auseinander.']),
  mc('yw-009', 'weather-charts', 1, 'concept', 'Was erwartest du beim Durchzug einer Kaltfront (Nordhalbkugel)?', 'Schauerböen, der Wind dreht rechts, der Druck steigt', ['Lang anhaltenden Nieselregen und weiter fallenden Druck', 'Abflauenden Wind, der langsam links dreht, und Nebel', 'Steigende Temperatur und tagelangen Landregen danach'], ['Hinter der Kaltfront folgt kühlere Luft mit guter Sicht und Schauern.', 'Nieselregen und schlechte Sicht gehören zum Warmsektor.']),
  mc('yw-010', 'weather-charts', 2, 'concept', 'Was zeigt eine Okklusion in der Bodenkarte?', 'Die Kaltfront hat die Warmfront eingeholt', ['Eine Front, die sich nicht mehr bewegt und langsam auflöst', 'Die Grenze zwischen zwei Hochdruckgebieten über See', 'Eine Linie gleichen Luftdrucks am Boden'], ['Der Warmsektor wird vom Boden abgehoben – das Tief ist meist schon älter.', 'Symbol: abwechselnd Dreiecke und Halbkreise, oft lila.']),
]
