import type { CoastalTopicId, DayTopicId, TopicId, YachtTopicId } from '@/types/learning'
import { TERM_BY_ID } from './glossary'

export const COASTAL_TOPICS: Record<CoastalTopicId, { abbr: string; english: string; german: string }> = {
  emergencies: { abbr: 'NOT', english: 'Emergencies under Way', german: 'Notfälle unter Segeln' },
  'no-gps': { abbr: 'OHNE', english: 'Navigation without GPS', german: 'Navigation ohne GPS' },
  'tidal-races': { abbr: 'RACE', english: 'Tidal Races and Overfalls', german: 'Strom an Kaps und Engstellen' },
  anchoring: { abbr: 'ANK', english: 'Anchoring', german: 'Ankern' },
  mooring: { abbr: 'FEST', english: 'Mooring in Tidal Waters', german: 'Festmachen bei Gezeiten' },
  'heavy-weather': { abbr: 'STURM', english: 'Heavy Weather', german: 'Schwerwetter' },
  fog: { abbr: 'NEBEL', english: 'Restricted Visibility', german: 'Navigation bei Nebel' },
  pilotage: { abbr: 'PILOT', english: 'Pilotage', german: 'Pilotage und Ansteuerung' },
  'secondary-ports': { abbr: 'SEK', english: 'Secondary Ports', german: 'Sekundärhäfen' },
  'multi-hour-tide': { abbr: 'CTS+', english: 'Multi-hour Course to Steer', german: 'Kurs über mehrere Stromstunden' },
  'running-fix': { abbr: 'RF', english: 'Running Fix', german: 'Versegelungspeilung' },
  'clearing-bearing': { abbr: 'CB', english: 'Clearing Bearing', german: 'Gefahrenpeilung' },
  'tidal-height': { abbr: 'TH', english: 'Tidal Height', german: 'Gezeitenhöhe' },
  'passage-planning': { abbr: 'PP', english: 'Passage Planning', german: 'Törnplanung' },
}

export const DAY_TOPICS: Record<DayTopicId, { abbr: string; english: string; german: string }> = {
  compass: { abbr: 'KOMP', english: 'Compass, Variation & Deviation', german: 'Kompass' },
  tides: { abbr: 'TIDE', english: 'Tides & Heights of Tide', german: 'Gezeiten' },
  'chart-reading': { abbr: 'KARTE', english: 'Chart Reading', german: 'Kartenkunde' },
  buoyage: { abbr: 'TONNE', english: 'Buoyage (IALA A)', german: 'Seezeichen' },
  colregs: { abbr: 'KVR', english: 'Collision Regulations (COLREGs)', german: 'Kollisionsverhütung' },
  weather: { abbr: 'WETTER', english: 'Weather & Forecasts', german: 'Wetter' },
  safety: { abbr: 'SICHER', english: 'Safety & Radio', german: 'Sicherheit & Seefunk' },
  electronics: { abbr: 'E-NAV', english: 'Electronic Navigation', german: 'Elektronische Navigation' },
  bearings: { abbr: 'PEIL', english: 'Bearings & Transits', german: 'Peilen' },
  seamanship: { abbr: 'SEEM', english: 'Ropes, Knots & Parts of a Yacht', german: 'Leinen, Knoten und Bootskunde' },
  inshore: { abbr: 'PILOT', english: 'Inshore Pilotage & Restricted Visibility', german: 'Pilotage und Nebel (küstennah)' },
  environment: { abbr: 'UMWELT', english: 'The Marine Environment', german: 'Meeresumwelt' },
  preparation: { abbr: 'VORB', english: 'Passage Preparation & Seamanship', german: 'Törnvorbereitung' },
}

export const YACHT_TOPICS: Record<YachtTopicId, { abbr: string; english: string; german: string }> = {
  'great-circle': { abbr: 'GK', english: 'Great Circle Sailing', german: 'Großkreisnavigation' },
  'night-navigation': { abbr: 'NACHT', english: 'Night Navigation', german: 'Nachtnavigation' },
  'tidal-atlas': { abbr: 'ATLAS', english: 'Tidal Stream Atlas', german: 'Gezeitenstromatlas' },
  'weather-charts': { abbr: 'KARTE', english: 'Reading Weather Charts', german: 'Wetterkarten lesen' },
  'weather-routing': { abbr: 'ROUTE', english: 'Weather Routing', german: 'Wetterrouting' },
  'ocean-passage': { abbr: 'OZEAN', english: 'Ocean Passage Planning', german: 'Ozeanpassage' },
  'ocean-weather': { abbr: 'OZWX', english: 'Ocean Weather & Communications', german: 'Ozeanwetter und Kommunikation' },
  'radar-plotting': { abbr: 'RADAR', english: 'Radar Plotting', german: 'Radarplotting' },
  'offshore-emergency': { abbr: 'SAR', english: 'Offshore Emergencies', german: 'Notfälle auf Hochsee' },
  'night-passage': { abbr: 'TÖRN', english: 'Night Passage Planning', german: 'Törnplanung über Nacht' },
  'sight-reduction': { abbr: 'HSL', english: 'Position Lines from Sights', german: 'Höhenstandlinie' },
  celestial: { abbr: 'ASTRO', english: 'Celestial Navigation: Noon Sight', german: 'Astronavigation (Mittagsbreite)' },
}

export const YACHT_TOPIC_IDS = Object.keys(YACHT_TOPICS) as YachtTopicId[]

export const DAY_TOPIC_IDS = Object.keys(DAY_TOPICS) as DayTopicId[]

export const COASTAL_TOPIC_IDS = Object.keys(COASTAL_TOPICS) as CoastalTopicId[]

/** Kürzel und englischer Name eines Themas (Grundbegriff oder Coastal-Thema) */
export function topicInfo(topic: TopicId): { abbr: string; english: string } {
  if (topic in TERM_BY_ID) {
    const t = TERM_BY_ID[topic as keyof typeof TERM_BY_ID]
    return { abbr: t.abbr, english: t.english }
  }
  if (topic in DAY_TOPICS) return DAY_TOPICS[topic as DayTopicId]
  if (topic in YACHT_TOPICS) return YACHT_TOPICS[topic as YachtTopicId]
  return COASTAL_TOPICS[topic as CoastalTopicId]
}
