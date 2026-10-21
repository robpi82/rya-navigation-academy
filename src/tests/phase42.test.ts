import { describe, expect, it } from 'vitest'
import { coriolis, frontArrivalHours, geostrophicWind, gradientWind, surfaceWindFrom, surfaceWindSpeed } from '@/calculations'
import { YACHT_TOPIC_IDS } from '@/data/topics'
import { curriculum } from '@/lib/studyPlan'
import { skillOf } from '@/lib/calcSkills'
import { QUESTION_BANK, QUESTION_BY_ID } from '@/questions'

describe('Wind aus dem Isobarenabstand', () => {
  it('4 hPa auf 100 NM bei 50° N ≈ 31 kn, am Boden ≈ 23 kn', () => {
    expect(geostrophicWind(4, 100, 50)).toBeCloseTo(30.7, 0)
    expect(surfaceWindSpeed(geostrophicWind(4, 100, 50))).toBeCloseTo(23, 0)
  })
  it('halber Abstand = doppelter Wind; weiter südlich mehr Wind', () => {
    expect(geostrophicWind(4, 50, 50) / geostrophicWind(4, 100, 50)).toBeCloseTo(2)
    expect(geostrophicWind(4, 100, 35)).toBeGreaterThan(geostrophicWind(4, 100, 50))
    expect(coriolis(-50)).toBeCloseTo(coriolis(50))
  })
})

describe('Krümmung', () => {
  const vg = geostrophicWind(4, 100, 50)
  it('um ein Tief schwächer, um ein Hoch stärker als geostrophisch', () => {
    expect(gradientWind(vg, 300, 50, 'low')!).toBeLessThan(vg)
    expect(gradientWind(10, 600, 50, 'high')!).toBeGreaterThan(10)
  })
  it('sehr großer Radius: beinahe geostrophisch', () => {
    expect(gradientWind(vg, 1e6, 50, 'low')!).toBeCloseTo(vg, 0)
  })
  it('enge Isobaren um ein Hoch mit kleinem Radius sind nicht möglich', () => {
    expect(gradientWind(vg, 150, 50, 'high')).toBeNull()
  })
})

describe('Windrichtung (Nordhalbkugel)', () => {
  it('um ein Tief gegen den Uhrzeigersinn, um 15° zum Tief hin', () => {
    expect(surfaceWindFrom(0, 'low', 0)).toBe(90) // nördlich des Tiefs: Ostwind
    expect(surfaceWindFrom(180, 'low', 0)).toBe(270) // südlich: Westwind
    expect(surfaceWindFrom(180, 'low')).toBe(255)
  })
  it('um ein Hoch im Uhrzeigersinn, aus dem Hoch heraus', () => {
    expect(surfaceWindFrom(0, 'high', 0)).toBe(270) // nördlich des Hochs: Westwind
    expect(surfaceWindFrom(180, 'high', 0)).toBe(90)
    expect(surfaceWindFrom(0, 'high')).toBe(255)
  })
  it('Buys Ballot: mit dem Wind im Rücken liegt das Tief links', () => {
    for (const b of [0, 45, 90, 180, 270]) {
      const blowsTo = (surfaceWindFrom(b, 'low', 0) + 180) % 360
      const left = (blowsTo + 270) % 360
      // Richtung vom Ort zum Tief = b + 180
      expect(Math.abs(((left - (b + 180)) % 360 + 540) % 360 - 180)).toBeLessThan(1e-9)
    }
  })
})

describe('Einbindung', () => {
  it('Front, Lektion, Lernplan, Fragen, Rechenart', () => {
    expect(frontArrivalHours(120, 25)).toBeCloseTo(4.8)
    expect(YACHT_TOPIC_IDS).toContain('weather-charts')
    expect(curriculum('yachtmaster-offshore').map((i) => i.id)).toContain('weather-charts')
    expect(QUESTION_BANK.filter((q) => q.topic === 'weather-charts')).toHaveLength(10)
    expect(skillOf(QUESTION_BY_ID['yw-001'])!.id).toBe('wind')
  })
})
