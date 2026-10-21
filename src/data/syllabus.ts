import type { CourseLevel, TopicId } from '@/types/learning'

/**
 * Themenbereiche der RYA-Theoriekurse – eigenständig und sinngemäß zusammengestellt nach öffentlich beschriebenen
 * Kursinhalten, als Orientierung und ohne Gewähr. Maßgeblich ist der aktuelle RYA-Syllabus.
 * `status` bewertet ehrlich, wie weit die App den Bereich abdeckt.
 */
export type CoverageStatus = 'covered' | 'partial' | 'none'

export interface SyllabusArea {
  id: string
  title: string
  status: CoverageStatus
  /** Lektionen oder Bereiche der App */
  links: { label: string; href: string }[]
  /** Themen für die Fragenzählung */
  topics: TopicId[]
  note?: string
  /** gehört beim RYA zum eigenen Kurs Yachtmaster Ocean */
  ocean?: boolean
}

export interface SyllabusLevel {
  level: CourseLevel
  title: string
  areas: SyllabusArea[]
}

const day = (id: string, label: string) => ({ label, href: `#/themen/${id}` })
const coastal = (id: string, label: string) => ({ label, href: `#/coastal/${id}` })
const yacht = (id: string, label: string) => ({ label, href: `#/yachtmaster/${id}` })

export const SYLLABUS: SyllabusLevel[] = [
  {
    level: 'day-skipper',
    title: 'Day Skipper (Theorie)',
    areas: [
      { id: 'd-terms', title: 'Seemännische Begriffe und Bootskunde', status: 'covered', links: [day('seamanship', 'Leinen, Knoten und Bootskunde'), { label: 'Glossar', href: '#/glossar' }], topics: ['seamanship', 'hdg', 'stw', 'water-track', 'leeway', 'cog', 'sog', 'ground-track', 'fix', 'ep'] },
      { id: 'd-ropes', title: 'Leinen und Knoten', status: 'covered', links: [day('seamanship', 'Leinen, Knoten und Bootskunde')], topics: ['seamanship'], note: 'Theorie und Zuordnung – das Knüpfen selbst lernt man nur mit der Leine in der Hand.' },
      { id: 'd-anchor', title: 'Ankern und Festmachen', status: 'covered', links: [day('tides', 'Gezeiten (Ankern bei Gezeiten)'), coastal('anchoring', 'Ankern'), coastal('mooring', 'Festmachen')], topics: ['anchoring', 'mooring'], note: 'Vertiefung in den Coastal-Lektionen.' },
      { id: 'd-safety', title: 'Sicherheit und Seenot', status: 'covered', links: [day('safety', 'Sicherheit & Seefunk'), day('preparation', 'Törnvorbereitung')], topics: ['safety', 'preparation'] },
      { id: 'd-colregs', title: 'Kollisionsverhütung (KVR/COLREGs)', status: 'covered', links: [day('colregs', 'Kollisionsverhütung')], topics: ['colregs'] },
      { id: 'd-charts', title: 'Seekarten und nautische Veröffentlichungen', status: 'covered', links: [day('chart-reading', 'Kartenkunde'), { label: 'Seekarte', href: '#/seekarte' }], topics: ['chart-reading'] },
      { id: 'd-compass', title: 'Kompass: Missweisung und Ablenkung', status: 'covered', links: [day('compass', 'Kompass')], topics: ['compass'] },
      { id: 'd-fix', title: 'Ortsbestimmung: Koppeln, Peilungen, Fix', status: 'covered', links: [day('bearings', 'Peilen'), { label: 'Simulator', href: '#/simulator' }], topics: ['bearings', 'fix', 'ep'] },
      { id: 'd-cts', title: 'Kurs gegen Strom (Course to Steer)', status: 'covered', links: [{ label: 'Simulator', href: '#/simulator' }, { label: 'Rechner', href: '#/rechner' }], topics: ['water-track', 'cog'] },
      { id: 'd-tides', title: 'Gezeiten und Gezeitenströme', status: 'covered', links: [day('tides', 'Gezeiten')], topics: ['tides'] },
      { id: 'd-buoys', title: 'Betonnung und Leuchtfeuer', status: 'covered', links: [day('buoyage', 'Seezeichen'), day('chart-reading', 'Kartenkunde')], topics: ['buoyage'] },
      { id: 'd-pilotage', title: 'Pilotage', status: 'covered', links: [day('inshore', 'Pilotage und Nebel (küstennah)'), coastal('pilotage', 'Pilotage (Coastal)')], topics: ['inshore', 'pilotage'] },
      { id: 'd-enav', title: 'Elektronische Navigation (GPS, Plotter, AIS)', status: 'covered', links: [day('electronics', 'Elektronische Navigation')], topics: ['electronics'] },
      { id: 'd-weather', title: 'Wetter', status: 'covered', links: [day('weather', 'Wetter')], topics: ['weather'] },
      { id: 'd-passage', title: 'Törnplanung', status: 'covered', links: [day('preparation', 'Törnvorbereitung'), { label: 'Lernplan', href: '#/lernplan' }], topics: ['preparation'] },
      { id: 'd-fog', title: 'Navigation bei verminderter Sicht', status: 'covered', links: [day('inshore', 'Pilotage und Nebel (küstennah)'), coastal('fog', 'Nebel (Coastal)')], topics: ['inshore', 'fog'] },
      { id: 'd-env', title: 'Meeresumwelt und Umweltschutz', status: 'covered', links: [day('environment', 'Meeresumwelt und Umweltschutz')], topics: ['environment'], note: 'Regeln vereinfacht nach MARPOL Anlage V; nationale Vorschriften beachten.' },
    ],
  },
  {
    level: 'coastal-skipper',
    title: 'Coastal Skipper / Yachtmaster Offshore (Theorie)',
    areas: [
      { id: 'c-fix', title: 'Ortsbestimmung: Versegelung, Peilungsfehler, ohne GPS', status: 'covered', links: [coastal('running-fix', 'Versegelungspeilung'), coastal('no-gps', 'Navigation ohne GPS')], topics: ['running-fix', 'no-gps'] },
      { id: 'c-tides', title: 'Gezeiten: Sekundärhäfen, Höhe zu einer Zeit, Zeit zu einer Höhe', status: 'covered', links: [coastal('tidal-height', 'Gezeitenhöhe'), coastal('secondary-ports', 'Sekundärhäfen')], topics: ['tidal-height', 'secondary-ports'] },
      { id: 'c-cts', title: 'Kurs über mehrere Stromstunden', status: 'covered', links: [coastal('multi-hour-tide', 'Kurs über mehrere Stromstunden'), yacht('tidal-atlas', 'Gezeitenstromatlas')], topics: ['multi-hour-tide', 'tidal-atlas'] },
      { id: 'c-radar', title: 'Elektronische Navigation und Radar', status: 'covered', links: [day('electronics', 'Elektronische Navigation'), yacht('radar-plotting', 'Radarplotting')], topics: ['electronics', 'radar-plotting'] },
      { id: 'c-passage', title: 'Törnplanung', status: 'covered', links: [coastal('passage-planning', 'Törnplanung'), yacht('night-passage', 'Törnplanung über Nacht')], topics: ['passage-planning', 'night-passage'] },
      { id: 'c-pilotage', title: 'Pilotage, Leitlinien und Gefahrenpeilungen', status: 'covered', links: [coastal('pilotage', 'Pilotage'), coastal('clearing-bearing', 'Gefahrenpeilung')], topics: ['pilotage', 'clearing-bearing'] },
      { id: 'c-weather', title: 'Wetter: Fronten, Wetterkarten, Vorhersagen', status: 'covered', links: [day('weather', 'Wetter'), yacht('weather-charts', 'Wetterkarten lesen')], topics: ['weather', 'weather-charts'] },
      { id: 'c-colregs', title: 'Kollisionsverhütung einschließlich Lichter bei Nacht', status: 'covered', links: [day('colregs', 'Kollisionsverhütung'), yacht('night-navigation', 'Nachtnavigation')], topics: ['colregs', 'night-navigation'] },
      { id: 'c-safety', title: 'Sicherheit und Notfälle', status: 'covered', links: [coastal('emergencies', 'Notfälle unter Segeln'), yacht('offshore-emergency', 'Notfälle auf Hochsee')], topics: ['emergencies', 'offshore-emergency'] },
      { id: 'c-heavy', title: 'Schwerwetter', status: 'covered', links: [coastal('heavy-weather', 'Schwerwetter')], topics: ['heavy-weather'] },
      { id: 'c-fog', title: 'Navigation bei verminderter Sicht', status: 'covered', links: [coastal('fog', 'Nebel')], topics: ['fog'] },
      { id: 'c-anchor', title: 'Ankern, Festmachen und Strom an Kaps', status: 'covered', links: [coastal('anchoring', 'Ankern'), coastal('mooring', 'Festmachen'), coastal('tidal-races', 'Strom an Kaps')], topics: ['anchoring', 'mooring', 'tidal-races'] },
      { id: 'c-env', title: 'Meeresumwelt und Umweltschutz', status: 'covered', links: [day('environment', 'Meeresumwelt und Umweltschutz')], topics: ['environment'], note: 'Gemeinsame Lektion mit Day Skipper.' },
    ],
  },
  {
    level: 'yachtmaster-offshore',
    title: 'Yachtmaster Ocean (Theorie)',
    areas: [
      { id: 'o-gc', title: 'Großkreis und Kartenprojektionen', status: 'covered', links: [yacht('great-circle', 'Großkreisnavigation')], topics: ['great-circle'], ocean: true },
      { id: 'o-astro', title: 'Astronavigation: Sextant, Mittagsbreite, Höhenstandlinie', status: 'covered', links: [yacht('celestial', 'Astronavigation'), yacht('sight-reduction', 'Höhenstandlinie')], topics: ['celestial', 'sight-reduction'], ocean: true, note: 'Ohne Gestirne außer der Sonne und ohne Nautisches Jahrbuch im Original.' },
      { id: 'o-weather', title: 'Ozeanwetter: globale Windsysteme, tropische Wirbelstürme', status: 'covered', links: [yacht('ocean-weather', 'Ozeanwetter und Kommunikation'), yacht('ocean-passage', 'Ozeanpassage'), yacht('weather-routing', 'Wetterrouting')], topics: ['ocean-weather', 'ocean-passage', 'weather-routing'], ocean: true },
      { id: 'o-passage', title: 'Planung von Ozeanpassagen', status: 'covered', links: [yacht('ocean-passage', 'Ozeanpassage')], topics: ['ocean-passage'], ocean: true },
      { id: 'o-comms', title: 'Kommunikation auf Hochsee (Satellit, Kurzwelle)', status: 'covered', links: [yacht('ocean-weather', 'Ozeanwetter und Kommunikation'), yacht('offshore-emergency', 'Notfälle auf Hochsee')], topics: ['ocean-weather', 'offshore-emergency'], ocean: true, note: 'Überblick über Systeme und Reichweiten, keine Gerätebedienung.' },
    ],
  },
]

export const STATUS_LABEL: Record<CoverageStatus, string> = { covered: 'abgedeckt', partial: 'teilweise', none: 'fehlt' }
