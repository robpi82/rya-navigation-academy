/** Sicherheit und Seefunk: Notverfahren, eigenständig formuliert. Vor ernsthafter Nutzung mit offiziellen Unterlagen und Funkkursen abgleichen. */

export interface Step {
  id: string
  text: string
}

/** Notmeldung (MAYDAY-Call) auf UKW in der empfohlenen Reihenfolge */
export const MAYDAY_STEPS: Step[] = [
  { id: 'prep', text: 'Funkgerät einschalten, Kanal 16 wählen (oder DSC-Notruftaste drücken), volle Sendeleistung' },
  { id: 'mayday', text: '„MAYDAY, MAYDAY, MAYDAY"' },
  { id: 'thisis', text: '„THIS IS" + Schiffsname dreimal' },
  { id: 'id', text: '„MAYDAY" + Schiffsname + Rufzeichen / MMSI' },
  { id: 'pos', text: 'Position (Länge und Breite, oder Peilung und Abstand zu einem bekannten Punkt)' },
  { id: 'nature', text: 'Art der Not (z. B. „sinking", „on fire")' },
  { id: 'help', text: 'Gewünschte Hilfe (z. B. „require immediate assistance")' },
  { id: 'persons', text: 'Anzahl der Personen an Bord und weitere nützliche Angaben' },
  { id: 'over', text: '„OVER" – dann auf Antwort warten' },
]

/** Mann über Bord: Sofortmaßnahmen in der Reihenfolge ihrer Dringlichkeit */
export const MOB_STEPS: Step[] = [
  { id: 'shout', text: 'Laut „Mensch über Bord!" rufen und auf die Person zeigen – eine Person behält sie dauernd im Blick' },
  { id: 'throw', text: 'Rettungsring, Rettungsweste oder Hufeisen mit Licht und Boje ins Wasser werfen' },
  { id: 'mob', text: 'MOB-Taste am GPS/Plotter drücken (Position speichern)' },
  { id: 'call', text: 'Notruf: Mayday auf Kanal 16, Crew einteilen' },
  { id: 'return', text: 'Manöver fahren und zur Person zurückkehren (Maschine vorsichtig, Schraube beachten)' },
  { id: 'recover', text: 'Person an Bord holen, Maschine aus, Erste Hilfe und Unterkühlung bekämpfen' },
]

export interface CallScenario {
  id: string
  text: string
  correct: 'mayday' | 'panpan' | 'securite'
  why: string
}

export const CALL_LABEL = {
  mayday: 'MAYDAY (Seenot)',
  panpan: 'PAN-PAN (Dringlichkeit)',
  securite: 'SÉCURITÉ (Sicherheit)',
} as const

export const CALL_SCENARIOS: CallScenario[] = [
  { id: 'sinking', text: 'Dein Boot nimmt viel Wasser, die Lenzpumpen halten nicht mit.', correct: 'mayday', why: 'Schwere und unmittelbare Gefahr für Schiff und Besatzung – Hilfe sofort nötig.' },
  { id: 'mob', text: 'Ein Crewmitglied ist über Bord gegangen und nicht mehr zu sehen.', correct: 'mayday', why: 'Gefahr für ein Menschenleben – Mayday, damit Rettungskräfte sofort alarmiert werden.' },
  { id: 'fire', text: 'Im Maschinenraum brennt es, du bekommst das Feuer nicht gelöscht.', correct: 'mayday', why: 'Brand an Bord ist unmittelbare, schwere Gefahr.' },
  { id: 'engine', text: 'Der Motor ist ausgefallen, du ankerst in sicherer Entfernung zu Gefahren und brauchst Schlepphilfe.', correct: 'panpan', why: 'Dringlich, aber keine unmittelbare Gefahr für Leib und Leben.' },
  { id: 'medical', text: 'Ein Crewmitglied ist verletzt und du brauchst ärztlichen Rat per Funk.', correct: 'panpan', why: 'Dringlichkeitslage; bei akuter Lebensgefahr wäre es Mayday.' },
  { id: 'buoy', text: 'Du hast eine treibende, nicht gekennzeichnete Gefahr (z. B. Container) im Fahrwasser gesehen.', correct: 'securite', why: 'Wichtige nautische Warnung für andere Schiffe – kein Notfall auf deinem Boot.' },
  { id: 'weather', text: 'Die Küstenfunkstelle kündigt eine Sturmwarnung an.', correct: 'securite', why: 'Wetter- und Navigationswarnungen werden mit Sécurité eingeleitet.' },
  { id: 'rudder', text: 'Ruderschaden: Das Boot treibt, das Wetter wird schlechter, aber die Lage ist noch beherrschbar.', correct: 'panpan', why: 'Dringlich; es besteht noch keine unmittelbare Gefahr.' },
]

export interface SignalItem {
  id: string
  text: string
  distress: boolean
  why: string
}

export const DISTRESS_SIGNALS: SignalItem[] = [
  { id: 'rocket', text: 'Rote Fallschirmrakete', distress: true, why: 'Anerkanntes Seenotzeichen.' },
  { id: 'redflare', text: 'Rote Handfackel', distress: true, why: 'Anerkanntes Seenotzeichen, besonders gut bei Dunkelheit sichtbar.' },
  { id: 'smoke', text: 'Orangefarbenes Rauchsignal', distress: true, why: 'Anerkanntes Seenotzeichen für Tageslicht.' },
  { id: 'arms', text: 'Langsames, wiederholtes Heben und Senken der ausgestreckten Arme', distress: true, why: 'Anerkanntes Seenotzeichen ohne Hilfsmittel.' },
  { id: 'mayday', text: 'MAYDAY per Funk', distress: true, why: 'Funk-Notruf – der klassische Notruf.' },
  { id: 'epirb', text: 'Auslösen einer Notfunkboje (EPIRB)', distress: true, why: 'Automatischer Notruf mit Position über Satellit.' },
  { id: 'sos', text: 'SOS im Morsecode mit Lichtsignal (… --- …)', distress: true, why: 'Weltweit anerkanntes Notsignal.' },
  { id: 'dsc', text: 'DSC-Notruf (roter Knopf am UKW-Gerät)', distress: true, why: 'Digitaler Selektivruf mit Position – löst Alarm bei Küstenfunkstellen und Schiffen aus.' },
  { id: 'panpan', text: 'PAN-PAN per Funk', distress: false, why: 'Dringlichkeitssignal – Vorrang, aber kein Seenotsignal.' },
  { id: 'whiteflare', text: 'Weiße Fackel', distress: false, why: 'Warnt ein nahendes Schiff vor Kollisionsgefahr; kein Seenotzeichen.' },
  { id: 'greenflare', text: 'Grüne Fackel', distress: false, why: 'Kein anerkanntes Seenotzeichen.' },
  { id: 'wave', text: 'Freundliches Winken mit einer Hand', distress: false, why: 'Wird nicht als Notsignal verstanden; das Notzeichen ist das langsame Heben und Senken beider Arme.' },
  { id: 'singleblast', text: 'Ein einzelner kurzer Hupton', distress: false, why: 'Manöversignal („Kurs nach Steuerbord"), kein Notzeichen.' },
]
