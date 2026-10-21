import { useEffect, useState } from 'react'

export type Route =
  | { name: 'dashboard' }
  | { name: 'glossary'; termId?: string }
  | { name: 'simulator' }
  | { name: 'quiz'; preset?: 'review'; topic?: string }
  | { name: 'exam' }
  | { name: 'flashcards' }
  | { name: 'calculators' }
  | { name: 'themen'; lessonId?: string }
  | { name: 'chart' }
  | { name: 'coastal'; lessonId?: string }
  | { name: 'yachtmaster'; lessonId?: string }
  | { name: 'plan' }
  | { name: 'roadmap' }
  | { name: 'about' }

export function parseHash(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/').filter(Boolean)
  switch (parts[0]) {
    case 'glossar':
      return { name: 'glossary', termId: parts[1] }
    case 'simulator':
      return { name: 'simulator' }
    case 'quiz':
      if (parts[1] === 'thema' && parts[2]) return { name: 'quiz', topic: parts[2] }
      return { name: 'quiz', preset: parts[1] === 'wiederholen' ? 'review' : undefined }
    case 'pruefung':
      return { name: 'exam' }
    case 'lernkarten':
      return { name: 'flashcards' }
    case 'rechner':
      return { name: 'calculators' }
    case 'themen':
      return { name: 'themen', lessonId: parts[1] }
    case 'seekarte':
      return { name: 'chart' }
    case 'coastal':
      return { name: 'coastal', lessonId: parts[1] }
    case 'yachtmaster':
      return { name: 'yachtmaster', lessonId: parts[1] }
    case 'lernplan':
      return { name: 'plan' }
    case 'roadmap':
      return { name: 'roadmap' }
    case 'info':
      return { name: 'about' }
    default:
      return { name: 'dashboard' }
  }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState<Route>(() => parseHash(window.location.hash))
  useEffect(() => {
    const onChange = () => {
      setRoute(parseHash(window.location.hash))
      window.scrollTo({ top: 0 })
    }
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return route
}
