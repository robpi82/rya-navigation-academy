/**
 * Meeresumwelt (Day Skipper): vereinfachte Müllregeln nach MARPOL Anlage V (sinngemäß, ohne Gewähr) und Fäkalientank.
 * Maßgeblich sind der Regeltext und nationale Vorschriften, die oft strenger sind.
 */

export type GarbageItem = 'plastic' | 'food-ground' | 'food-whole' | 'glass-metal' | 'paper' | 'oily-rags'

export const GARBAGE_LABEL: Record<GarbageItem, string> = {
  plastic: 'Kunststoff (Verpackung, Folie, Leinenreste)',
  'food-ground': 'Lebensmittelreste, zerkleinert (≤ 25 mm)',
  'food-whole': 'Lebensmittelreste, unzerkleinert',
  'glass-metal': 'Glas und Dosen',
  paper: 'Papier und Pappe',
  'oily-rags': 'Ölige Lappen, Ölbindetücher',
}

/**
 * Kleinster Abstand zum nächsten Land (NM), ab dem etwas in Fahrt über Bord gegeben werden darf – null = nie.
 * Außerhalb von Sondergebieten: zerkleinerte Lebensmittelreste ab 3 NM, unzerkleinerte ab 12 NM.
 * In Sondergebieten (z. B. Nordsee, Ostsee, Mittelmeer): nur zerkleinerte Lebensmittelreste ab 12 NM.
 */
export function minDistanceForDischarge(item: GarbageItem, specialArea: boolean): number | null {
  if (item === 'food-ground') return specialArea ? 12 : 3
  if (item === 'food-whole') return specialArea ? null : 12
  return null
}

/** Darf das hier über Bord? */
export function dischargeAllowed(item: GarbageItem, distanceNm: number, specialArea: boolean, underway: boolean): boolean {
  const min = minDistanceForDischarge(item, specialArea)
  return min !== null && underway && distanceNm >= min
}

/** Tage, bis ein Fäkalientank voll ist. */
export const holdingTankDays = (tankLitres: number, crew: number, litresPerPersonDay: number): number => tankLitres / (crew * litresPerPersonDay)
