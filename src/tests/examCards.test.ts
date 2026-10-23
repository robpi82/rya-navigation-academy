import { existsSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { EXAM_PRESETS } from '@/lib/exam'
import { EXAM_IMAGE_FOLDER, EXAM_IMAGES } from '@/modules/exam/examImages'

describe('Probeprüfungs-Bildkarten', () => {
  it('jede Prüfung hat ihr Bild in der vorgesehenen Reihenfolge', () => {
    expect(EXAM_PRESETS).toHaveLength(7)
    EXAM_PRESETS.forEach((p, i) => {
      expect(EXAM_IMAGES[p.id]?.file.startsWith(`${String(i + 1).padStart(2, '0')}-`), p.id).toBe(true)
    })
  })

  it('alle Bilddateien liegen im Repository', () => {
    for (const { file } of Object.values(EXAM_IMAGES)) {
      expect(existsSync(path.resolve(__dirname, '../../public/images', EXAM_IMAGE_FOLDER, file)), file).toBe(true)
    }
  })
})
