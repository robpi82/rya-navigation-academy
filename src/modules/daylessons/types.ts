import type { Lesson } from '@/modules/lessons/types'
import type { DayTopicId } from '@/types/learning'

export type DayLesson = Lesson & { id: DayTopicId }
