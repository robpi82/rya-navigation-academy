import { describe, expect, it } from 'vitest'
import { MENU_GROUPS } from '@/navigation/menu'
import { YACHT_LESSON_COUNT } from '@/data/lessonIds'
import { YACHT_TOPIC_IDS } from '@/data/topics'
import { parseHash } from '@/hooks/useHashRoute'

describe('Seitenleiste', () => {
  const items = MENU_GROUPS.flatMap((g) => g.items)
  it('alle drei Stufen stehen gemeinsam unter „Lektionen“', () => {
    const lessons = MENU_GROUPS.find((g) => g.title === 'Lektionen')!
    expect(lessons.items.map((i) => i.label)).toEqual(['Day Skipper', 'Coastal Skipper', 'Yachtmaster'])
    expect(lessons.items.map((i) => i.href)).toEqual(['#/themen', '#/coastal', '#/yachtmaster'])
  })
  it('jeder Eintrag führt zur passenden Route, keiner doppelt', () => {
    for (const i of items) expect(parseHash(i.href).name, i.label).toBe(i.route)
    expect(new Set(items.map((i) => i.href)).size).toBe(items.length)
  })
  it('Lektionszahl Yachtmaster stimmt', () => {
    expect(YACHT_LESSON_COUNT).toBe(YACHT_TOPIC_IDS.length)
  })
})
