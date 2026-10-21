import type { Question, TopicId } from '@/types/learning'
import { DAY_SKIPPER_BASICS } from './dayskipper-basics'
import { DAY_SKIPPER_ADVANCED } from './dayskipper-advanced'
import { COASTAL_SKIPPER } from './coastal-skipper'
import { DAY_SKIPPER_SAFETY } from './dayskipper-safety'
import { DAY_SKIPPER_TOPICS } from './dayskipper-topics'
import { DAY_SKIPPER_EXTRA3 } from './dayskipper-extra3'
import { DAY_SKIPPER_EXTRA2 } from './dayskipper-extra2'
import { DAY_SKIPPER_EXTRA } from './dayskipper-extra'
import { YACHTMASTER } from './yachtmaster'
import { YACHTMASTER_WEATHER } from './yachtmaster-weather'
import { YACHTMASTER_ATLAS } from './yachtmaster-atlas'
import { YACHTMASTER_OCEAN } from './yachtmaster-ocean'
import { YACHTMASTER_SAR } from './yachtmaster-sar'
import { YACHTMASTER_OCEANWEATHER } from './yachtmaster-oceanweather'
import { COASTAL_SECONDARY } from './coastal-secondary'
import { COASTAL_EXTRA } from './coastal-extra'
import { DAY_SKIPPER_BEARINGS } from './dayskipper-bearings'
import { DAY_SKIPPER_PREP } from './dayskipper-prep'
import { DAY_SKIPPER_SEAMANSHIP } from './dayskipper-seamanship'
import { DAY_SKIPPER_ENVIRONMENT } from './dayskipper-environment'
import { DAY_SKIPPER_INSHORE } from './dayskipper-inshore'

export const QUESTION_BANK: Question[] = [...DAY_SKIPPER_BASICS, ...DAY_SKIPPER_ADVANCED, ...DAY_SKIPPER_TOPICS, ...DAY_SKIPPER_SAFETY, ...DAY_SKIPPER_BEARINGS, ...DAY_SKIPPER_EXTRA, ...DAY_SKIPPER_EXTRA2, ...DAY_SKIPPER_EXTRA3, ...DAY_SKIPPER_PREP, ...DAY_SKIPPER_SEAMANSHIP, ...DAY_SKIPPER_ENVIRONMENT, ...DAY_SKIPPER_INSHORE, ...COASTAL_SKIPPER, ...COASTAL_EXTRA, ...COASTAL_SECONDARY, ...YACHTMASTER, ...YACHTMASTER_WEATHER, ...YACHTMASTER_ATLAS, ...YACHTMASTER_OCEAN, ...YACHTMASTER_SAR, ...YACHTMASTER_OCEANWEATHER]

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTION_BANK.map((q) => [q.id, q]),
)

export const questionsForTopics = (topics: TopicId[]): Question[] =>
  topics.length === 0 ? QUESTION_BANK : QUESTION_BANK.filter((q) => topics.includes(q.topic))
