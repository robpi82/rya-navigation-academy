import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { DAY_LESSONS } from '@/modules/daylessons/DayLessonsPage'
import { DAY_LESSON_CARD_FILES, DAY_LESSON_CARD_IMAGES } from '@/modules/daylessons/cardImages'

describe('Day-Skipper-Bildkarten', () => {
  it('jede Lektion hat die Bildkarte mit ihrer Lektionsnummer', () => {
    expect(DAY_LESSONS).toHaveLength(13)
    DAY_LESSONS.forEach((l, i) => {
      expect(DAY_LESSON_CARD_FILES[l.id].startsWith(`${String(i + 1).padStart(2, '0')}-`), l.id).toBe(true)
    })
  })

  it('alle Bilddateien liegen in public/images/dayskipper', () => {
    for (const file of Object.values(DAY_LESSON_CARD_FILES)) {
      expect(existsSync(path.resolve(__dirname, '../../public/images/dayskipper', file)), file).toBe(true)
    }
    for (const src of Object.values(DAY_LESSON_CARD_IMAGES)) expect(src).toMatch(/^\/images\/dayskipper\/\d{2}-[a-z-]+\.png$/)
  })
})
