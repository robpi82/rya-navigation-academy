import type { ComponentType } from 'react'

export interface LessonWidget {
  title: string
  description?: string
  Comp: ComponentType
}

export interface Lesson {
  id: string
  title: string
  english: string
  summary: string
  body: string[]
  /** Kernaussagen als Stichpunkte */
  keyPoints?: string[]
  mnemonic: string
  widgets: LessonWidget[]
  links?: { label: string; href: string }[]
}
