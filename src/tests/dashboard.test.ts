import { beforeEach, describe, expect, it } from 'vitest'
import { parseHash } from '@/hooks/useHashRoute'
import { useProgressStore } from '@/stores/progressStore'

describe('Dashboard: Weiterlernen', () => {
  beforeEach(() => useProgressStore.getState().reset())

  it('merkt sich die zuletzt geöffnete Lektion und führt zu ihrer Route', () => {
    expect(useProgressStore.getState().lastLesson).toBeNull()
    useProgressStore.getState().openLesson({ id: 'fog', title: 'Navigation bei Nebel', href: '#/coastal/fog' })
    const last = useProgressStore.getState().lastLesson
    expect(last?.href).toBe('#/coastal/fog')
    expect(parseHash(last!.href)).toEqual({ name: 'coastal', lessonId: 'fog' })
  })

  it('verändert beim Merken keine Lernstände', () => {
    useProgressStore.getState().toggleLesson('compass')
    useProgressStore.getState().openLesson({ id: 'tides', title: 'Gezeiten', href: '#/themen/tides' })
    expect(useProgressStore.getState().completedLessons).toEqual(['compass'])
  })

  it('Zurücksetzen löscht auch die zuletzt geöffnete Lektion', () => {
    useProgressStore.getState().openLesson({ id: 'tides', title: 'Gezeiten', href: '#/themen/tides' })
    useProgressStore.getState().reset()
    expect(useProgressStore.getState().lastLesson).toBeNull()
  })

  it('Fallback und Kurskarten zeigen auf die Kursübersichten', () => {
    expect(parseHash('#/themen')).toEqual({ name: 'themen', lessonId: undefined })
    expect(parseHash('#/coastal').name).toBe('coastal')
    expect(parseHash('#/yachtmaster').name).toBe('yachtmaster')
  })
})
