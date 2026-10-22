import type { CoastalTopicId } from '@/types/learning'

/**
 * Bildkarten der Coastal-Skipper-Übersicht. Die Bildthemen weichen von den Lektionen ab;
 * zugeordnet sind nur Lektionen, deren Thema eindeutig zu einem Bild passt. Die übrigen
 * Lektionen behalten die Textkarte. Die Nummer im Dateinamen ist die Bildnummer, nicht
 * die Position der Lektion in der App.
 */
export const COASTAL_LESSON_CARD_FILES: Partial<Record<CoastalTopicId, string>> = {
  'passage-planning': '01-passageplanung.png',
  pilotage: '04-hafenmanoever-ansteuerung.png',
  fog: '13-eingeschraenkte-sicht.png',
  emergencies: '10-sicherheit-auf-see.png',
}

export const COASTAL_LESSON_CARD_IMAGES = Object.fromEntries(
  Object.entries(COASTAL_LESSON_CARD_FILES).map(([id, file]) => [id, `${import.meta.env.BASE_URL}images/coastalskipper/${file}`]),
) as Partial<Record<CoastalTopicId, string>>

/** Pixelmaß der Coastal-Bilder (3:2) für Seitenverhältnis und Platzhaltergröße. */
export const COASTAL_LESSON_CARD_SIZE = { width: 366, height: 244 }
