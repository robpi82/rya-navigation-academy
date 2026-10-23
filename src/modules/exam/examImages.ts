import type { Crop, ResolvedImage } from '@/modules/quiz/calcImages'

/**
 * Bildzuordnung der Probeprüfungs-Karten (Dateien unter public/images/probeprüfung/dayskipper – Ordnername so im Repository).
 * Die Bilder sind Ausschnitte aus Designentwürfen: `crop` schneidet die eingebrannten Kartenrahmen am Rand ab,
 * bei 05 zusätzlich den angeschnittenen Titel „Coastal Probeprüfung“ am unteren Rand.
 */
export const EXAM_IMAGE_FOLDER = 'probeprüfung/dayskipper'

export const EXAM_IMAGES: Record<string, { file: string; crop: Crop }> = {
  kurz: { file: '01-kurztest-chronometer.png', crop: { x: 0.02, y: 0.03, w: 0.97, h: 0.95 } },
  standard: { file: '02-standard-navigation.png', crop: { x: 0.04, y: 0.04, w: 0.96, h: 0.96 } },
  lang: { file: '03-intensiv-schwerwetter.png', crop: { x: 0.06, y: 0.03, w: 0.94, h: 0.97 } },
  coastal: { file: '04-coastal-test-hafeneinfahrt.png', crop: { x: 0.012, y: 0.06, w: 0.988, h: 0.94 } },
  'coastal-full': { file: '05-coastal-probepruefung-radar.png', crop: { x: 0.04, y: 0.075, w: 0.96, h: 0.775 } },
  yacht: { file: '06-yachtmaster-kurz-sextant.png', crop: { x: 0.06, y: 0.065, w: 0.94, h: 0.935 } },
  'yacht-full': { file: '07-yachtmaster-probepruefung-offshore.png', crop: { x: 0, y: 0.1, w: 1, h: 0.9 } },
}

export function examImage(presetId: string): ResolvedImage | undefined {
  const img = EXAM_IMAGES[presetId]
  return img && { src: `${import.meta.env.BASE_URL}images/${encodeURI(EXAM_IMAGE_FOLDER)}/${img.file}`, crop: img.crop }
}
