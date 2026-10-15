import type { Question, TermId } from '@/types/learning'
import { DAY_SKIPPER_BASICS } from './dayskipper-basics'
import { DAY_SKIPPER_ADVANCED } from './dayskipper-advanced'

export const QUESTION_BANK: Question[] = [...DAY_SKIPPER_BASICS, ...DAY_SKIPPER_ADVANCED]

export const QUESTION_BY_ID: Record<string, Question> = Object.fromEntries(
  QUESTION_BANK.map((q) => [q.id, q]),
)

export const questionsForTopics = (topics: TermId[]): Question[] =>
  topics.length === 0 ? QUESTION_BANK : QUESTION_BANK.filter((q) => topics.includes(q.topic))
