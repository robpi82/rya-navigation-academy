import { useEffect, useState } from 'react'

export type Route =
  | { name: 'dashboard' }
  | { name: 'glossary'; termId?: string }
  | { name: 'simulator' }
  | { name: 'quiz'; preset?: 'review' }
  | { name: 'flashcards' }
  | { name: 'calculators' }
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
      return { name: 'quiz', preset: parts[1] === 'wiederholen' ? 'review' : undefined }
    case 'lernkarten':
      return { name: 'flashcards' }
    case 'rechner':
      return { name: 'calculators' }
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
