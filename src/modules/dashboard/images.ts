/** Fotos für die fotografischen Dashboard-Bereiche (Dateien unter public/images/dashboard). Fehlt ein Eintrag, zeigt die Fläche einen maritimen Farbverlauf. */
export interface DashboardImages {
  hero?: string
  dayskipper?: string
  coastal?: string
  yachtmaster?: string
  glossary?: string
  simulator?: string
  quiz?: string
  flashcards?: string
  plan?: string
  review?: string
  motivation?: string
}

export const DASHBOARD_IMAGE_FILES: Record<keyof DashboardImages, string> = {
  hero: '01-hero-segelboot.png',
  dayskipper: '02-day-skipper.png',
  coastal: '03-coastal-skipper.png',
  yachtmaster: '04-yachtmaster.png',
  glossary: '05-glossar.png',
  simulator: '06-navigationssimulator.png',
  quiz: '07-pruefungstrainer.png',
  flashcards: '08-lernkarten.png',
  plan: '09-kuestenlandschaft.png',
  review: '10-seekarte.png',
  motivation: '11-leuchtturm-nacht.png',
}

export const DASHBOARD_IMAGES: DashboardImages = Object.fromEntries(
  Object.entries(DASHBOARD_IMAGE_FILES).map(([key, file]) => [key, `${import.meta.env.BASE_URL}images/dashboard/${file}`]),
)
