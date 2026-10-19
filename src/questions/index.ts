import type { Question, TopicId } from '@/types/learning'
import { DAY_SKIPPER_BASICS } from './dayskipper-basics'
import { DAY_SKIPPER_ADVANCED } from './dayskipper-advanced'
import { COASTAL_SKIPPER } from './coastal-skipper'
import { DAY_SKIPPER_SAFETY } from './dayskipper-safety'
import { DAY_SKIPPER_TOPICS } from './dayskipper-topics'
import { COASTAL_EXTRA } from './coastal-extra'
import { DAY_SKIPPER_BEARINGS } from './dayskipper-bearings'

export const QUESTION_BANK: Question[] = [...DAY_SKIPPER_BASICS, ...DAY_SKIPPER_ADVANCED, ...DAY_SKIPPER_TOPICS, ...DAY_SKIPPER_SAFETY, ...DAY_SKIPPER_BEARINGS, ...COASTAL_SKIPPER, ...COASTAL_EXTRA]

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTION_BANK.map((q) => [q.id, q]),
)

export const questionsForTopics = (topics: TopicId[]): Question[] =>
  topics.length === 0 ? QUESTION_BANK : QUESTION_BANK.filter((q) => topics.includes(q.topic))
