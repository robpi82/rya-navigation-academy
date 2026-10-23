import type { Question } from '@/types/learning'
import type { CalcLevel } from '@/stores/calcTrainingStore'
import type { CourseLevel } from '@/types/learning'
import { skillOf } from '@/lib/calcSkills'

/**
 * Zentrale Bildzuordnung fürs Rechentraining (Dateien unter public/images/rechentraining/<Kursordner>).
 * Jeder Kurs nutzt nur Bilder aus seinem eigenen Ordner. Fehlt ein Eintrag oder lädt die Datei nicht,
 * zeigt die Fläche einen dunkelblauen Farbverlauf.
 *
 * `crop` schneidet einen Bereich aus (Anteile 0–1 von Breite/Höhe). Die gelieferten Entwurfsbilder enthalten
 * eingebrannte Titel, Badges und Balken; der Ausschnitt zeigt nur den sauberen Fotobereich. Für textfreie
 * Fotos den `crop` einfach weglassen, dann füllt das Bild die ganze Karte.
 */
export interface Crop {
  x: number
  y: number
  w: number
  h: number
}

export interface CalcImage {
  file: string
  crop?: Crop
}

interface CourseImages {
  folder: string
  hero?: CalcImage
  sidebar?: CalcImage
  /** Rechenart-ID (siehe CALC_SKILLS) → Bild */
  skills: Partial<Record<string, CalcImage>>
}

// Saubere Fotostreifen am oberen Rand der Entwurfskarten (darunter beginnen Icon, Titel und Badge)
const DAY_BAND: Crop = { x: 0.01, y: 0.02, w: 0.98, h: 0.25 }
const COASTAL_BAND: Crop = { x: 0.01, y: 0.03, w: 0.83, h: 0.24 }

export const CALC_IMAGES: Record<CourseLevel, CourseImages> = {
  'day-skipper': {
    folder: 'dayskipper',
    // linker Teil mit Kompass und Laterne
    hero: { file: '11-hero-kompass.png', crop: { x: 0.005, y: 0.02, w: 0.62, h: 0.96 } },
    // unten eingebrannt „Gute Navigation“
    sidebar: { file: '12-leuchtturm-sidebar.png', crop: { x: 0, y: 0, w: 1, h: 0.8 } },
    skills: {
      vectors: { file: '01-stromdreieck.png', crop: DAY_BAND },
      dst: { file: '02-weg-zeit-fahrt.png', crop: DAY_BAND },
      compass: { file: '03-kompass-peilungen.png', crop: DAY_BAND },
      tides: { file: '04-gezeitenhoehe-tiefe.png', crop: DAY_BAND },
      anchoring: { file: '05-ankern-festmachen.png', crop: DAY_BAND },
      chart: { file: '06-seekarte-sichtweite.png', crop: DAY_BAND },
      wind: { file: '07-wind-wetter.png', crop: DAY_BAND },
      collision: { file: '08-begegnung-cpa-nebel.png', crop: DAY_BAND },
      enav: { file: '09-vmg-echolot-leitlinien.png', crop: DAY_BAND },
      safety: { file: '10-vorbereitung-notfaelle.png', crop: DAY_BAND },
    },
  },
  'coastal-skipper': {
    // Ordnername so im Repository
    folder: 'costal',
    // links eingebrannter Titel „Navigation Training Center“
    hero: { file: '11-hero-kuestennavigation.png', crop: { x: 0.5, y: 0.03, w: 0.49, h: 0.94 } },
    sidebar: { file: '12-leuchtturm-sidebar.png' },
    skills: {
      vectors: { file: '01-stromdreieck.png', crop: COASTAL_BAND },
      dst: { file: '02-weg-zeit-fahrt.png', crop: COASTAL_BAND },
      tides: { file: '03-gezeitenhoehe-tiefe.png', crop: COASTAL_BAND },
      anchoring: { file: '04-ankern-festmachen.png', crop: COASTAL_BAND },
      nogps: { file: '05-navigation-ohne-gps.png', crop: COASTAL_BAND },
      wind: { file: '06-wind-wetter.png', crop: COASTAL_BAND },
      streams: { file: '07-strom-kaps-stromrate.png', crop: COASTAL_BAND },
      collision: { file: '08-begegnung-cpa-nebel.png', crop: COASTAL_BAND },
      enav: { file: '09-vmg-echolot-leitlinien.png', crop: COASTAL_BAND },
      safety: { file: '10-vorbereitung-notfaelle.png', crop: COASTAL_BAND },
    },
  },
  'yachtmaster-offshore': {
    folder: 'yachtmaster',
    // Ein eigenes Hero-Motiv gibt es nicht (mehr); die Nachtfahrt unter Sternen passt als Offshore-Motiv.
    hero: { file: '09-grosskreis-routing-nachtfahrt.png' },
    // Hochformat: Ausschnitt mit Segelboot im Sonnenuntergang
    sidebar: { file: '11-sidebar-motiv.png', crop: { x: 0, y: 0.12, w: 1, h: 0.5 } },
    // textfreie Fotos: füllen die ganze Karte
    skills: {
      vectors: { file: '01-stromdreieck-kurs-gegen-strom.png' },
      dst: { file: '02-weg-zeit-fahrt.png' },
      chart: { file: '03-seekarte-sichtweite.png' },
      wind: { file: '04-wind-wetter.png' },
      streams: { file: '05-strom-kaps-stromrate.png' },
      collision: { file: '06-begegnung-cpa-nebel.png' },
      enav: { file: '07-vmg-echolot-leitlinien.png' },
      safety: { file: '08-vorbereitung-notfaelle.png' },
      offshore: { file: '09-grosskreis-routing-nachtfahrt.png' },
      astro: { file: '10-astronavigation.png' },
    },
  },
}

export function imageUrl(level: CourseLevel, img: CalcImage): string {
  return `${import.meta.env.BASE_URL}images/rechentraining/${CALC_IMAGES[level].folder}/${img.file}`
}

export interface ResolvedImage {
  src: string
  crop?: Crop
}

const resolve = (level: CourseLevel, img: CalcImage | undefined): ResolvedImage | undefined =>
  img && { src: imageUrl(level, img), crop: img.crop }

export const heroImage = (level: CalcLevel) => (level === 'all' ? undefined : resolve(level, CALC_IMAGES[level].hero))
export const sidebarImage = (level: CalcLevel) => (level === 'all' ? undefined : resolve(level, CALC_IMAGES[level].sidebar))

/**
 * Bild einer Rechenart. Bei „Alle“ stammt es aus dem Kurs, der die meisten Aufgaben dieser Rechenart beisteuert
 * (und dafür ein Bild hat) – so bleibt jedes Bild bei seinem Kurs.
 */
export function skillImage(level: CalcLevel, skillId: string, pool: Question[]): ResolvedImage | undefined {
  if (level !== 'all') return resolve(level, CALC_IMAGES[level].skills[skillId])
  const counts = new Map<CourseLevel, number>()
  for (const q of pool) if (skillOf(q)?.id === skillId) counts.set(q.level, (counts.get(q.level) ?? 0) + 1)
  const best = [...counts.entries()].filter(([l]) => CALC_IMAGES[l].skills[skillId]).sort((a, b) => b[1] - a[1])[0]
  return best && resolve(best[0], CALC_IMAGES[best[0]].skills[skillId])
}
