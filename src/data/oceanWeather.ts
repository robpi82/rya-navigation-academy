/**
 * Globale Windgürtel über dem Atlantik – stark vereinfachtes Lernmodell. Die Mallungen (ITCZ) liegen im Nordwinter nahe
 * dem Äquator und wandern im Nordsommer nach Norden; die anderen Gürtel verschieben sich mit.
 */
export type Season = 'jan' | 'jul'

export interface WindBelt {
  id: string
  name: string
  wind: string
  note: string
}

const BELTS: Record<string, WindBelt> = {
  itcz: { id: 'itcz', name: 'Mallungen (ITCZ)', wind: 'schwach und wechselnd', note: 'Flauten, Gewitter, Böen und Starkregen – möglichst rasch und schmal queren.' },
  'ne-trades': { id: 'ne-trades', name: 'Nordostpassat', wind: 'beständig aus Nordost, oft 4–5 Bft', note: 'Die klassische Route nach Westen; Squalls vor allem nachts.' },
  'se-trades': { id: 'se-trades', name: 'Südostpassat', wind: 'beständig aus Südost, oft 4–5 Bft', note: 'Gegenstück zum Nordostpassat auf der Südhalbkugel.' },
  'n-high': { id: 'n-high', name: 'Subtropisches Hoch (Rossbreiten, z. B. Azorenhoch)', wind: 'schwach, oft Flaute', note: 'Viel Sonne, wenig Wind – unter Motor oder mit Geduld.' },
  's-high': { id: 's-high', name: 'Subtropisches Hoch der Südhalbkugel', wind: 'schwach, oft Flaute', note: 'Spiegelbild der Rossbreiten im Süden.' },
  'n-westerlies': { id: 'n-westerlies', name: 'Westwindzone (Nord)', wind: 'vorherrschend West, wechselhaft, oft stark', note: 'Tiefdruckgebiete ziehen nach Osten – der Rückweg von der Karibik nach Europa.' },
  's-westerlies': { id: 's-westerlies', name: 'Westwindzone (Süd)', wind: 'vorherrschend West, oft stürmisch', note: 'Die „Roaring Forties“ – ohne Land, das die Tiefs bremst.' },
  polar: { id: 'polar', name: 'Polare Ostwinde', wind: 'kalt, aus östlichen Richtungen', note: 'Außerhalb der üblichen Fahrtenrouten.' },
}

/** Windgürtel für eine Breite (positiv = Nord) und Jahreszeit. */
export function windBelt(lat: number, season: Season): WindBelt {
  const shift = season === 'jul' ? 7 : 0
  const itcz = 3 + shift
  if (Math.abs(lat - itcz) <= 3) return BELTS.itcz
  if (lat > itcz) {
    if (lat < 27 + shift) return BELTS['ne-trades']
    if (lat < 35 + shift) return BELTS['n-high']
    if (lat < 62) return BELTS['n-westerlies']
    return BELTS.polar
  }
  if (lat > -27 + shift) return BELTS['se-trades']
  if (lat > -35 + shift) return BELTS['s-high']
  if (lat > -62) return BELTS['s-westerlies']
  return BELTS.polar
}

/** Kommunikation und Wetterdaten auf Hochsee – typische Reichweiten (Richtwerte). */
export interface CommsSystem {
  id: string
  name: string
  what: string
  /** ungefähre Reichweite vor der Küste in NM; null = weltweit bzw. über Satellit */
  rangeNm: number | null
}

export const COMMS_SYSTEMS: CommsSystem[] = [
  { id: 'vhf', name: 'UKW-Sprechfunk mit DSC', what: 'Sprechfunk, Notalarm; Seegebiet A1', rangeNm: 30 },
  { id: 'navtex', name: 'NAVTEX (518 kHz)', what: 'Wetter- und Navigationswarnungen als Text', rangeNm: 300 },
  { id: 'mf', name: 'Grenzwelle (MF) mit DSC', what: 'Sprechfunk und Notalarm; Seegebiet A2', rangeNm: 150 },
  { id: 'hf', name: 'Kurzwelle (HF, SSB)', what: 'Sprechfunk, Wetterfax, E-Mail per Funk über große Entfernungen', rangeNm: null },
  { id: 'sat', name: 'Satellit (z. B. Inmarsat, Iridium)', what: 'Telefon, E-Mail, GRIB-Wetterdaten, Sicherheitsmeldungen', rangeNm: null },
  { id: 'epirb', name: 'EPIRB (406 MHz)', what: 'Notalarm mit Position über Satellit', rangeNm: null },
]

/** GMDSS-Seegebiete (vereinfacht). */
export const GMDSS_AREAS = [
  { id: 'A1', text: 'Reichweite einer UKW-Küstenfunkstelle mit DSC (rund 20–30 NM)' },
  { id: 'A2', text: 'Reichweite einer Grenzwellen-Küstenfunkstelle (rund 100–150 NM), außerhalb A1' },
  { id: 'A3', text: 'Abdeckung eines anerkannten Satellitendienstes, außerhalb A1 und A2 (etwa bis 70° Breite)' },
  { id: 'A4', text: 'Alle übrigen Gebiete, vor allem die Polargebiete' },
]
