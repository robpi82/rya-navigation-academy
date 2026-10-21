import type { MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify, YachtTopicId } from '@/types/learning'

/**
 * Phase 46: Notfälle auf Hochsee (Yachtmaster). Eigenständig erstellt und vereinfacht, keine Originalfragen.
 * Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
 */
let counter = 0

function mc(id: string, topic: YachtTopicId, difficulty: 1 | 2 | 3, category: MultipleChoiceQuestion['category'], prompt: string, correct: string, wrong: [string, string, string], steps: string[]): MultipleChoiceQuestion {
  const idx = counter++ % 4
  const options = [...wrong]
  options.splice(idx, 0, correct)
  return { id, type: 'mc', topic, difficulty, level: 'yachtmaster-offshore', category, prompt, options, correctIndex: idx, solution: correct, steps }
}

function num(id: string, topic: YachtTopicId, difficulty: 1 | 2 | 3, prompt: string, answer: number, tolerance: number, unit: NumericQuestion['unit'], verify: QuestionVerify, solution: string, steps: string[]): NumericQuestion {
  return { id, type: 'numeric', topic, difficulty, level: 'yachtmaster-offshore', category: 'calculation', prompt, answer, tolerance, unit, verify, solution, steps }
}

export const YACHTMASTER_SAR: Question[] = [
  num('yx-001', 'offshore-emergency', 1, 'Nachts fällt jemand bei 6 kn über Bord. Bis die Crew reagiert, vergehen 20 Sekunden. Wie weit ist das Boot dann entfernt?', 62, 1, 'm', { kind: 'sar', quantity: 'distanceAwayM', speedKn: 6, seconds: 20 }, 'etwa 62 m', ['6 kn ≈ 3,09 m/s.', '3,09 × 20 ≈ 62 m – rund fünf Bootslängen.']),
  num('yx-002', 'offshore-emergency', 2, 'Die MOB-Taste wurde sofort gedrückt. Der Strom setzt mit 1,5 kn. Wie weit ist die Person nach 40 Minuten vom gespeicherten MOB-Punkt entfernt?', 1, 0.05, 'NM', { kind: 'sar', quantity: 'datumDriftNm', currentKn: 1.5, minutes: 40 }, '1 NM', ['Der MOB-Punkt ist ein Ort über Grund, die Person treibt mit dem Wasser.', '1,5 kn × 40/60 h = 1,0 NM in Stromrichtung.']),
  num('yx-003', 'offshore-emergency', 2, 'Suchmuster „wachsendes Quadrat“ mit Bahnabstand 0,2 NM. Wie lang sind die ersten acht Schenkel zusammen?', 4, 0.05, 'NM', { kind: 'sar', quantity: 'squareLength', spacingNm: 0.2, legs: 8 }, '4 NM', ['Schenkel: S, S, 2S, 2S, 3S, 3S, 4S, 4S = 20 S.', '20 × 0,2 NM = 4 NM.']),
  num('yx-004', 'offshore-emergency', 2, 'Für dieselben acht Schenkel (4 NM) fährst du 5 kn. Wie viele Minuten dauert das?', 48, 0.5, 'min', { kind: 'sar', quantity: 'squareMinutes', spacingNm: 0.2, legs: 8, speedKn: 5 }, '48 min', ['4 / 5 = 0,8 h.', '0,8 × 60 = 48 min.']),
  num('yx-005', 'offshore-emergency', 2, 'Sektorsuche mit Radius 0,5 NM: Wie lang ist ein vollständiges Muster aus drei Dreiecken?', 4.5, 0.05, 'NM', { kind: 'sar', quantity: 'sectorLength', radiusNm: 0.5 }, '4,5 NM', ['Drei gleichseitige Dreiecke mit je drei Schenkeln der Länge R.', '9 × 0,5 = 4,5 NM.']),
  num('yx-006', 'offshore-emergency', 1, 'Das nächste Schiff, das helfen kann, ist 90 NM entfernt und läuft 15 kn. Wie viele Stunden dauert es, bis es da ist?', 6, 0.05, 'h', { kind: 'sar', quantity: 'rescueHours', distanceNm: 90, speedKn: 15 }, '6 Stunden', ['90 / 15 = 6 h.', 'So lange muss sich die Crew selbst helfen – Wärme, Wasser, Signalmittel.']),
  mc('yx-007', 'offshore-emergency', 1, 'concept', 'Was macht eine EPIRB auf 406 MHz?', 'Sie meldet den Notfall über Satellit an eine Rettungsleitstelle', ['Sie zeigt auf dem Radar eines Suchschiffs eine Linie aus Punkten', 'Sie ist ein UKW-Handfunkgerät mit Kanal 16 für die Rettungsinsel', 'Sie blinkt hell, um Schiffe in Sichtweite zu alarmieren'], ['Das Cospas-Sarsat-System empfängt das Signal; mit GNSS-Empfänger ist die Position schnell bekannt.', 'Zusätzlich sendet sie meist auf 121,5 MHz zum Anpeilen.']),
  mc('yx-008', 'offshore-emergency', 2, 'concept', 'Was sieht ein Suchschiff von einem Radar-SART auf seinem Radarschirm?', 'Eine Linie aus 12 Punkten in Richtung des SART', ['Einen einzelnen großen Leuchtfleck mitten auf dem Schirm', 'Name und Position wie ein AIS-Ziel mit allen Daten', 'Nichts – ein SART sendet nur über Satellit an Land'], ['Der SART antwortet auf das X-Band-Radar (9 GHz); die Punkte beginnen am Ort des SART.', 'In der Nähe werden aus den Punkten Bögen und Kreise. Ein AIS-SART erscheint dagegen als AIS-Ziel.']),
  mc('yx-009', 'offshore-emergency', 2, 'concept', 'Was beschreibt die Regel „1-10-1“ beim Sturz ins kalte Wasser?', '1 min Kälteschock, 10 min Bewegung, 1 h bis zur Unterkühlung', ['1 h schwimmen, 10 min ausruhen, dann 1 Rettungsversuch', '1 Rettungsweste, 10 m Leine und 1 Signallicht für jede Person', '1 NM Suchradius, 10 min Suche, 1 Notruf je Stunde'], ['Erste Minute: Atem kontrollieren, nicht in Panik schwimmen.', 'Rund zehn Minuten sinnvolle Bewegung, danach werden Arme und Hände schwach; Bewusstlosigkeit durch Unterkühlung meist erst nach etwa einer Stunde.']),
  mc('yx-010', 'offshore-emergency', 3, 'concept', 'Wofür ist der Williamson-Turn gedacht?', 'Unter Maschine auf dem eigenen Kielwasser zurückzukehren', ['Unter Segeln möglichst schnell eine Wende einzuleiten', 'Ein Suchgebiet in wachsenden Quadraten abzufahren', 'Bei Sturm das Boot vor Topp und Takel ablaufen zu lassen'], ['Ruder hart über, nach etwa 60° Kursänderung hart zur anderen Seite – das Fahrzeug kommt auf Gegenkurs im eigenen Kielwasser an.', 'Unter Segeln ist der Quick-Stop meist schneller und hält das Boot nah an der Person.']),
  mc('yx-011', 'offshore-emergency', 2, 'error', 'Wann steigt man in die Rettungsinsel um?', 'Erst wenn das Schiff nicht mehr zu halten ist', ['Sobald Wasser in der Bilge steht, egal wie viel', 'Gleich nach dem Mayday, um keine Zeit zu verlieren', 'Wenn der Wetterbericht einen Sturm ankündigt'], ['Ein schwimmendes Schiff ist sicherer und besser zu finden als eine Insel.', 'Insel vorher klarmachen und mit belegter Reißleine bereithalten.']),
]
