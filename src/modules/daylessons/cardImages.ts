import type { DayTopicId } from '@/types/learning'

/** Bildkarten der Day-Skipper-Übersicht; die Dateinummer entspricht der Lektionsnummer. */
export const DAY_LESSON_CARD_FILES: Record<DayTopicId, string> = {
  compass: '01-kompass-variation-deviation.png',
  tides: '02-gezeiten-gezeitenhoehen.png',
  'chart-reading': '03-seekarte-symbole-tiefen-feuer.png',
  buoyage: '04-seezeichen-betonnung.png',
  colregs: '05-kollisionsverhuetung.png',
  weather: '06-wetter-seewetterbericht.png',
  safety: '07-sicherheit-seefunk.png',
  electronics: '08-elektronische-navigation.png',
  bearings: '09-kreuzpeilung-deckpeilung.png',
  preparation: '10-toernvorbereitung.png',
  seamanship: '11-leinen-knoten-bootskunde.png',
  environment: '12-meeresumwelt-umweltschutz.png',
  inshore: '13-pilotage-nebel.png',
}

export const DAY_LESSON_CARD_IMAGES = Object.fromEntries(
  Object.entries(DAY_LESSON_CARD_FILES).map(([id, file]) => [id, `${import.meta.env.BASE_URL}images/dayskipper/${file}`]),
) as Record<DayTopicId, string>
