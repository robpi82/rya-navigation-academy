import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { LESSONS } from '@/modules/coastal/CoastalPage'
import { COASTAL_LESSON_CARD_FILES, COASTAL_LESSON_CARD_IMAGES } from '@/modules/coastal/cardImages'

describe('Coastal-Skipper-Bildkarten', () => {
  it('ordnet nur vorhandene Lektionen zu, jedes Bild höchstens einmal', () => {
    const ids = LESSONS.map((l) => l.id as string)
    for (const id of Object.keys(COASTAL_LESSON_CARD_FILES)) expect(ids, id).toContain(id)
    const files = Object.values(COASTAL_LESSON_CARD_FILES)
    expect(new Set(files).size).toBe(files.length)
  })

  it('alle Bilddateien liegen in public/images/coastalskipper', () => {
    for (const file of Object.values(COASTAL_LESSON_CARD_FILES)) {
      expect(existsSync(path.resolve(__dirname, '../../public/images/coastalskipper', file!)), file).toBe(true)
    }
    for (const src of Object.values(COASTAL_LESSON_CARD_IMAGES)) expect(src).toMatch(/^\/images\/coastalskipper\/\d{2}-[a-z-]+\.png$/)
  })
})
