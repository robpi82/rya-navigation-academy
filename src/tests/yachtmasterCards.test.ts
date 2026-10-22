import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { YACHT_LESSONS } from '@/modules/yachtmaster/YachtmasterPage'
import { YACHT_LESSON_CARD_FILES, YACHT_LESSON_CARD_IMAGES } from '@/modules/yachtmaster/cardImages'

describe('Yachtmaster-Bildkarten', () => {
  it('jede Lektion hat die Bildkarte mit ihrer Lektionsnummer', () => {
    expect(YACHT_LESSONS).toHaveLength(12)
    expect(Object.keys(YACHT_LESSON_CARD_FILES)).toHaveLength(12)
    YACHT_LESSONS.forEach((l, i) => {
      expect(YACHT_LESSON_CARD_FILES[l.id]?.startsWith(`${String(i + 1).padStart(2, '0')}-`), l.id).toBe(true)
    })
  })

  it('alle Bilddateien liegen in public/images/yachtmaster', () => {
    for (const file of Object.values(YACHT_LESSON_CARD_FILES)) {
      expect(existsSync(path.resolve(__dirname, '../../public/images/yachtmaster', file)), file).toBe(true)
    }
    for (const src of Object.values(YACHT_LESSON_CARD_IMAGES)) expect(src).toMatch(/^\/images\/yachtmaster\/\d{2}-[a-z-]+\.png$/)
  })
})
