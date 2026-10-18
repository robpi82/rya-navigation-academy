import type { CoastalTopicId, TopicId } from '@/types/learning'
import { TERM_BY_ID } from './glossary'

export const COASTAL_TOPICS: Record<CoastalTopicId, { abbr: string; english: string; german: string }> = {
  'multi-hour-tide': { abbr: 'CTS+', english: 'Multi-hour Course to Steer', german: 'Kurs über mehrere Stromstunden' },
  'running-fix': { abbr: 'RF', english: 'Running Fix', german: 'Versegelungspeilung' },
  'clearing-bearing': { abbr: 'CB', english: 'Clearing Bearing', german: 'Gefahrenpeilung' },
  'tidal-height': { abbr: 'TH', english: 'Tidal Height', german: 'Gezeitenhöhe' },
  'passage-planning': { abbr: 'PP', english: 'Passage Planning', german: 'Törnplanung' },
}

export const COASTAL_TOPIC_IDS = Object.keys(COASTAL_TOPICS) as CoastalTopicId[]

/** Kürzel und englischer Name eines Themas (Grundbegriff oder Coastal-Thema) */
export function topicInfo(topic: TopicId): { abbr: string; english: string } {
  if (topic in TERM_BY_ID) {
    const t = TERM_BY_ID[topic as keyof typeof TERM_BY_ID]
    return { abbr: t.abbr, english: t.english }
  }
  return COASTAL_TOPICS[topic as CoastalTopicId]
}
