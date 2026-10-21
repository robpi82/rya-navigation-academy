import type { MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify, YachtTopicId } from '@/types/learning'

/**
 * Phase 52: Ozeanwetter und Kommunikation (Yachtmaster Ocean). Eigenständig erstellt und vereinfacht, keine Originalfragen.
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

export const YACHTMASTER_OCEANWEATHER: Question[] = [
  num('yc-001', 'ocean-weather', 2, 'Deine UKW-Antenne sitzt 16 m hoch, die der Küstenfunkstelle 100 m. Wie weit reicht UKW etwa (2,2 × (√H + √h))?', 30.8, 0.5, 'NM', { kind: 'oceanwx', quantity: 'vhfRange', antennaA: 16, antennaB: 100 }, 'etwa 31 NM', ['√16 = 4, √100 = 10.', '2,2 × 14 ≈ 30,8 NM – weiter draußen braucht man Grenzwelle, Kurzwelle oder Satellit.']),
  num('yc-002', 'ocean-weather', 1, 'Zwei Yachten mit je 12 m hohen UKW-Antennen. Wie weit reicht der Funk zwischen ihnen etwa?', 15.2, 0.3, 'NM', { kind: 'oceanwx', quantity: 'vhfRange', antennaA: 12, antennaB: 12 }, 'etwa 15 NM', ['√12 ≈ 3,46.', '2,2 × 6,93 ≈ 15,2 NM.']),
  num('yc-003', 'ocean-weather', 2, 'Nordhalbkugel, Wind aus 090°, du bist nah am Sturmzentrum. In welcher Richtung liegt das Zentrum (Gesicht zum Wind, 90° rechts)?', 180, 5, '°', { kind: 'oceanwx', quantity: 'centreNear', windFrom: 90, hemisphere: 'N' }, 'in etwa 180°', ['Gesicht zum Wind: Blick nach 090°.', 'Das Zentrum liegt 90° rechts davon: 180°.'], true),
  num('yc-004', 'ocean-weather', 3, 'Gleicher Wind aus 090°, aber weiter vom Zentrum entfernt (135° rechts). Wo liegt das Zentrum jetzt etwa?', 225, 5, '°', { kind: 'oceanwx', quantity: 'centreFar', windFrom: 90, hemisphere: 'N' }, 'in etwa 225°', ['Weiter außen strömt der Wind stärker ein – der Winkel wird größer.', '090° + 135° = 225°.'], true),
  mc('yc-005', 'ocean-weather', 1, 'concept', 'Ab welchem mittleren Wind spricht man von einem Hurrikan?', 'Ab 64 kn (Bft 12)', ['Ab 34 kn (Bft 8)', 'Ab 48 kn (Bft 10)', 'Erst ab 100 kn'], ['34–63 kn: tropischer Sturm; ab 64 kn: Hurrikan, im Pazifik Taifun, im Indischen Ozean Zyklon.', 'Böen liegen deutlich darüber.']),
  mc('yc-006', 'ocean-weather', 2, 'concept', 'Nordhalbkugel: Welcher Halbkreis eines tropischen Wirbelsturms ist der gefährliche?', 'Der rechte, in Zugrichtung gesehen', ['Der linke, in Zugrichtung gesehen', 'Der hintere, weil dort der Regen am stärksten ist', 'Keiner – beide Halbkreise sind gleich gefährlich'], ['Rechts addieren sich Windgeschwindigkeit und Zuggeschwindigkeit.', 'Der Wind treibt ein Schiff dort vor den Sturm auf seine Zugbahn.']),
  mc('yc-007', 'ocean-weather', 3, 'concept', 'Nordhalbkugel, der Druck fällt, und der Wind dreht stetig rechts (veering). Wo bist du?', 'Im gefährlichen Halbkreis', ['Im fahrbaren Halbkreis', 'Genau im Auge des Sturms', 'Hinter dem Sturm, er zieht ab'], ['Rechtsdrehend bei fallendem Druck = gefährlicher Halbkreis (Nordhalbkugel).', 'Rückdrehend = fahrbarer Halbkreis; gleichbleibend = auf der Zugbahn.']),
  mc('yc-008', 'ocean-weather', 2, 'concept', 'Der Wind bleibt in der Richtung gleich, nimmt aber zu, der Druck fällt rasch. Wo bist du vermutlich?', 'Etwa auf der Zugbahn vor dem Zentrum', ['Im fahrbaren Halbkreis, weit vom Zentrum entfernt', 'Hinter dem Sturm, das Schlimmste ist vorbei', 'Im Auge des Sturms'], ['Gleichbleibende Richtung bei zunehmendem Wind: Der Sturm kommt direkt auf dich zu.', 'Nordhalbkugel: Wind an Steuerbord achtern nehmen und in den fahrbaren Halbkreis laufen.']),
  mc('yc-009', 'ocean-weather', 1, 'concept', 'Was erwartet dich in den Mallungen (ITCZ)?', 'Flauten, Gewitter und Böen', ['Beständigen Passat mit 4–5 Bft', 'Dichten Nebel über kaltem Wasser', 'Eisberge und Treibeis'], ['Zwischen den Passaten steigt feuchte Luft auf – Schauer und Gewitter, dazwischen Flaute.', 'Man quert sie möglichst an einer schmalen Stelle.']),
  mc('yc-010', 'ocean-weather', 1, 'concept', 'Aus welcher Richtung weht der Passat auf der Nordhalbkugel?', 'Aus Nordost', ['Aus Südost', 'Aus West', 'Aus Nordwest'], ['Nordostpassat auf der Nordhalbkugel, Südostpassat auf der Südhalbkugel.', 'Deshalb segelt man von den Kanaren nach Westen.']),
  mc('yc-011', 'ocean-weather', 2, 'concept', 'Was empfängt man mit NAVTEX?', 'Wetter- und Warnmeldungen als Text auf 518 kHz', ['Die Positionen aller Schiffe in der Umgebung wie bei AIS', 'Satellitentelefonate mit der Rettungsleitstelle an Land', 'Sprechfunk mit anderen Yachten auf Kanal 16'], ['NAVTEX reicht rund 200–400 NM vor die Küste.', 'Auf Hochsee kommen Warnungen per Satellit oder Kurzwelle.']),
  mc('yc-012', 'ocean-weather', 2, 'concept', 'Was ist das GMDSS-Seegebiet A1?', 'Reichweite einer UKW-Küstenfunkstelle mit DSC', ['Das Gebiet zwischen 70° N und 70° S mit Satellitenabdeckung', 'Reichweite einer Grenzwellen-Küstenfunkstelle', 'Die Polargebiete jenseits der Satellitenabdeckung'], ['A1: UKW (rund 20–30 NM), A2: Grenzwelle, A3: Satellit, A4: übrige Gebiete.', 'Die Ausrüstung richtet sich nach dem Fahrtgebiet.']),
]
