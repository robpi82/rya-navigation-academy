/** Bildkarten der Yachtmaster-Übersicht; die Dateinummer entspricht der Lektionsnummer. */
export const YACHT_LESSON_CARD_FILES: Record<string, string> = {
  'great-circle': '01-grosskreisnavigation.png',
  'night-navigation': '02-nachtnavigation.png',
  'tidal-atlas': '03-gezeitenstromatlas.png',
  'weather-charts': '04-wetterkarten-lesen.png',
  'weather-routing': '05-wetterrouting.png',
  'ocean-passage': '06-ozeanpassage.png',
  'ocean-weather': '07-ozeanwetter-kommunikation.png',
  celestial: '08-astronavigation-mittagsbreite.png',
  'sight-reduction': '09-astronavigation-hoehenstandlinie.png',
  'night-passage': '10-toernplanung-ueber-nacht.png',
  'radar-plotting': '11-radarplotting.png',
  'offshore-emergency': '12-notfaelle-auf-hochsee.png',
}

export const YACHT_LESSON_CARD_IMAGES: Record<string, string> = Object.fromEntries(
  Object.entries(YACHT_LESSON_CARD_FILES).map(([id, file]) => [id, `${import.meta.env.BASE_URL}images/yachtmaster/${file}`]),
)

/** Die Yachtmaster-Bilder sind höher als die Day-Skipper-Bilder (ca. 372 × 309 px). */
export const YACHT_LESSON_CARD_SIZE = { width: 372, height: 309 }
