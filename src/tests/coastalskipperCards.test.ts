import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { LESSONS } from '@/modules/coastal/CoastalPage'
import { COASTAL_LESSON_CARD_FILES, COASTAL_LESSON_CARD_IMAGES } from '@/modules/coastal/cardImages'

describe('Coastal-Skipper-Bildkarten', () => {
  it('jede Lektion hat die Bildkarte mit ihrer Lektionsnummer', () => {
    expect(LESSONS).toHaveLength(14)
    LESSONS.forEach((l, i) => {
      expect(COASTAL_LESSON_CARD_FILES[l.id].startsWith(`${String(i + 1).padStart(2, '0')}-`), l.id).toBe(true)
    })
  })

  it('alle Bilddateien liegen in public/images/coastalskipper', () => {
    for (const file of Object.values(COASTAL_LESSON_CARD_FILES)) {
      expect(existsSync(path.resolve(__dirname, '../../public/images/coastalskipper', file)), file).toBe(true)
    }
    for (const src of Object.values(COASTAL_LESSON_CARD_IMAGES)) expect(src).toMatch(/^\/images\/coastalskipper\/\d{2}-[a-z-]+\.png$/)
  })
})
