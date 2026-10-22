import type { CoastalTopicId } from '@/types/learning'

/** Bildkarten der Coastal-Skipper-Übersicht; die Dateinummer entspricht der Lektionsnummer. */
export const COASTAL_LESSON_CARD_FILES: Record<CoastalTopicId, string> = {
  'multi-hour-tide': '01-course-to-steer-stromstunden.png',
  'running-fix': '02-versegelungspeilung-running-fix.png',
  'clearing-bearing': '03-gefahrenpeilung-clearing-bearing.png',
  'tidal-height': '04-gezeitenhoehe-zwoelftelregel.png',
  'passage-planning': '05-toernplanung.png',
  'secondary-ports': '06-sekundaerhaefen.png',
  pilotage: '07-pilotage-ansteuerung.png',
  'no-gps': '08-navigation-ohne-gps.png',
  fog: '09-navigation-bei-nebel.png',
  'heavy-weather': '10-schwerwetter.png',
  mooring: '11-festmachen-bei-gezeiten.png',
  'tidal-races': '12-strom-an-kaps-engstellen.png',
  anchoring: '13-ankern.png',
  emergencies: '14-notfaelle-unter-segeln.png',
}

export const COASTAL_LESSON_CARD_IMAGES = Object.fromEntries(
  Object.entries(COASTAL_LESSON_CARD_FILES).map(([id, file]) => [id, `${import.meta.env.BASE_URL}images/coastalskipper/${file}`]),
) as Record<CoastalTopicId, string>

/** Pixelmaß der Coastal-Bilder (3:2) für Seitenverhältnis und Platzhaltergröße. */
export const COASTAL_LESSON_CARD_SIZE = { width: 365, height: 243 }
