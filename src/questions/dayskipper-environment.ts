import type { DayTopicId, MultipleChoiceQuestion, NumericQuestion, Question, QuestionVerify } from '@/types/learning'

/**
 * Phase 49: Meeresumwelt (Day Skipper). Eigenständig erstellt, Regeln vereinfacht und sinngemäß, keine Originalprüfungsfragen.
 * Rechenaufgaben werden in src/tests/questions.test.ts nachgerechnet.
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

export const DAY_SKIPPER_ENVIRONMENT: Question[] = [
  mc('en-001', 'environment', 1, 'concept', 'Wann darf Kunststoff über Bord gegeben werden?', 'Nie', ['Ab 12 NM vom nächsten Land', 'Ab 3 NM, wenn er zerkleinert ist', 'Nur über tiefem Wasser ab 50 m'], ['Nach MARPOL Anlage V ist Kunststoff überall verboten – auch Leinenreste und Folien.', 'An Bord sammeln und an Land entsorgen.']),
  num('en-002', 'environment', 2, 'Außerhalb von Sondergebieten, in Fahrt: Ab wie vielen Seemeilen vom nächsten Land dürfen zerkleinerte Lebensmittelreste über Bord (vereinfacht nach MARPOL Anlage V)?', 3, 0, 'NM', { kind: 'env', quantity: 'minDistance', item: 'food-ground', specialArea: false }, 'ab 3 NM', ['Zerkleinert heißt: Stücke bis 25 mm.', 'Unzerkleinert erst ab 12 NM; in Sondergebieten strenger.']),
  num('en-003', 'environment', 2, 'Außerhalb von Sondergebieten, in Fahrt: Ab wie vielen Seemeilen dürfen unzerkleinerte Lebensmittelreste über Bord?', 12, 0, 'NM', { kind: 'env', quantity: 'minDistance', item: 'food-whole', specialArea: false }, 'ab 12 NM', ['Unzerkleinerte Reste erst ab 12 NM vom nächsten Land.', 'Am besten trotzdem an Land entsorgen.']),
  num('en-004', 'environment', 1, 'Der Fäkalientank fasst 60 l. Vier Personen an Bord, Richtwert 2,5 l pro Person und Tag. Nach wie vielen Tagen ist der Tank voll?', 6, 0.05, 'Tage', { kind: 'env', quantity: 'tankDays', tankLitres: 60, crew: 4, litresPerPersonDay: 2.5 }, 'nach 6 Tagen', ['4 × 2,5 = 10 l pro Tag.', '60 / 10 = 6 Tage – Absaugstationen einplanen.']),
  mc('en-005', 'environment', 1, 'concept', 'In der Bilge schwimmt Diesel. Was tust du?', 'Mit Ölbindetüchern aufnehmen und an Land entsorgen', ['Abpumpen, sobald das Boot weit genug von Land entfernt ist', 'Mit Spülmittel verteilen, damit es sich schneller auflöst', 'In der Bilge lassen, Diesel verdunstet von selbst'], ['Ölige Abfälle dürfen nie ins Meer.', 'Spülmittel verteilt das Öl nur und schadet zusätzlich.']),
  mc('en-006', 'environment', 1, 'concept', 'Voraus taucht eine Gruppe Wale auf. Wie verhältst du dich?', 'Fahrt reduzieren, Abstand halten, nicht direkt anfahren', ['Mit voller Fahrt vorbei, damit die Störung kurz bleibt', 'Langsam direkt auf sie zuhalten, um sie besser zu sehen', 'Mit dem Signalhorn warnen, damit sie abtauchen'], ['Die Tiere bestimmen die Nähe; nie zwischen Mutter und Kalb fahren.', 'Hohe Fahrt erhöht die Gefahr einer Kollision.']),
  mc('en-007', 'environment', 1, 'concept', 'Warum soll man nicht in Seegraswiesen ankern?', 'Anker und Kette reißen die Pflanzen aus', ['Weil der Anker dort immer besonders gut hält', 'Weil Seegras die Ankerkette chemisch angreift', 'Weil Seegraswiesen nur bei Niedrigwasser zu sehen sind'], ['Seegraswiesen sind Kinderstube vieler Arten und oft geschützt.', 'Auf Sand daneben ankern oder eine Boje nutzen.']),
  mc('en-008', 'environment', 2, 'concept', 'Was ist beim Antifouling zu beachten?', 'Nur zugelassene Farbe nutzen, Schleifstaub auffangen', ['Altes Antifouling im Wasser abkratzen, das spart Zeit beim Kranen', 'TBT-haltige Farbe wählen, weil sie am längsten wirkt', 'Möglichst dicke Schichten auftragen, dann nie wieder streichen'], ['Zinnorganische Anstriche wie TBT sind international verboten.', 'Schleifstaub und Farbreste sind Sondermüll.']),
  mc('en-009', 'environment', 2, 'concept', 'Welche Yachten müssen die Müllregeln (MARPOL Anlage V) an Bord aushängen?', 'Yachten ab 12 m Länge', ['Nur gewerblich genutzte Charteryachten', 'Yachten ab 24 m Länge', 'Nur Yachten mit Motoren über 100 kW'], ['Ab 12 m Länge ist ein Aushang (Placard) mit den Regeln vorgeschrieben.', 'Die Regeln selbst gelten für alle Fahrzeuge.']),
  mc('en-010', 'environment', 1, 'concept', 'Robben liegen auf einer Sandbank. Was ist richtig?', 'Abstand halten, langsam und leise vorbeifahren', ['Nahe heranfahren, damit die Crew fotografieren kann', 'Mit dem Horn warnen, damit sie ins Wasser gehen', 'Anlanden, um nachzusehen, ob ein Tier verletzt ist'], ['Aufgeschreckte Robben lassen Jungtiere zurück.', 'In Nationalparks gelten Schutzzonen und Befahrensregeln.']),
  mc('en-011', 'environment', 2, 'concept', 'Warum reinigt man das Unterwasserschiff vor einem Revierwechsel?', 'Um keine fremden Arten einzuschleppen', ['Damit der Kompass nicht abgelenkt wird', 'Weil sonst das Echolot falsche Tiefen anzeigt', 'Weil die Hafengebühr nach dem Bewuchs berechnet wird'], ['Muscheln, Algen und Seepocken reisen am Rumpf mit und können heimische Arten verdrängen.', 'Sauberes Unterwasserschiff spart außerdem Treibstoff.']),
  mc('en-012', 'environment', 2, 'concept', 'Welche Seegebiete sind nach MARPOL Anlage V Sondergebiete mit strengeren Müllregeln?', 'Zum Beispiel Nordsee, Ostsee und Mittelmeer', ['Nur die Hohe See jenseits von 200 Seemeilen vor der Küste', 'Nur Häfen und deren Zufahrten', 'Ausschließlich die Polargebiete'], ['Dort dürfen nur zerkleinerte Lebensmittelreste ab 12 NM über Bord.', 'Weitere Sondergebiete sind z. B. Schwarzes Meer, Rotes Meer und die Karibik.']),
]
