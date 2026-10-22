/**
 * Fotos für die fotografischen Dashboard-Bereiche (Dateien unter public/images/dashboard).
 * Solange ein Eintrag fehlt, zeigt die Fläche einen maritimen Farbverlauf.
 */
export interface DashboardImages {
  hero?: string
  dayskipper?: string
  coastal?: string
  yachtmaster?: string
  glossary?: string
  simulator?: string
  quiz?: string
  flashcards?: string
  review?: string
  motivation?: string
}

export const DASHBOARD_IMAGES: DashboardImages = {}
