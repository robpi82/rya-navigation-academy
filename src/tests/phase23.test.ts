import { describe, expect, it } from 'vitest'
import { daylightDepartureWindow, isDark, lightWindow, watchLoad, watchSchedule } from '@/calculations'

describe('Wachplan', () => {
  it('zwei Wachen à 3 h von 20 bis 08 Uhr: vier Wachen je Team, je 6 h an Deck', () => {
    const w = watchSchedule(20, 32, 3, 2)
    expect(w).toHaveLength(4)
    expect(w.map((x) => x.team)).toEqual([0, 1, 0, 1])
    expect(watchLoad(w, 2).map((l) => l.onWatch)).toEqual([6, 6])
    expect(watchLoad(w, 2)[0].longestRest).toBe(3)
  })
  it('drei Wachen verlängern die Ruhezeit', () => {
    const w = watchSchedule(20, 32, 3, 3)
    const load = watchLoad(w, 3)
    expect(load.reduce((s, l) => s + l.onWatch, 0)).toBe(12)
    expect(load[0].longestRest).toBe(6)
  })
  it('letzte Wache wird am Planende gekürzt', () => {
    const w = watchSchedule(20, 31, 4, 2)
    expect(w[w.length - 1]).toMatchObject({ start: 28, end: 31 })
  })
  it('ungültige Eingaben ergeben keinen Plan', () => {
    expect(watchSchedule(20, 18, 3, 2)).toEqual([])
    expect(watchSchedule(20, 32, 0, 2)).toEqual([])
  })
})

describe('Ankunft bei Tageslicht', () => {
  it('60 NM mit 5 kn, Sonnenaufgang 06:00, Puffer 1 h: Abfahrt frühestens 19:00 am Vortag', () => {
    const w = daylightDepartureWindow(60, 5, 6, 20, 1, 1)!
    expect(w.hours).toBe(12)
    expect(w.earliest).toBeCloseTo(19)
    expect(w.latest).toBeCloseTo(24 + 20 - 1 - 12) // spätestens 07:00 am Ankunftstag
  })
  it('kein Fenster, wenn der Tag zu kurz ist', () => {
    expect(daylightDepartureWindow(10, 5, 8, 9, 1)).toBeNull()
    expect(daylightDepartureWindow(10, 0, 6, 20)).toBeNull()
  })
  it('Dunkelheit zwischen Sonnenuntergang und Sonnenaufgang, auch am Folgetag', () => {
    expect(isDark(22, 6, 20)).toBe(true)
    expect(isDark(12, 6, 20)).toBe(false)
    expect(isDark(29, 6, 20)).toBe(true) // 05:00 am Folgetag
    expect(isDark(31, 6, 20)).toBe(false)
  })
})

describe('Feuer entlang der Route', () => {
  const lt = { name: 'Kap', characteristic: 'Fl 5s', along: 20, offset: 6, range: 10 }
  it('Sichtabschnitt aus dem Satz des Pythagoras: ±8 NM um den Querab-Punkt', () => {
    const w = lightWindow(lt, 60, 5, 20)
    expect(w.fromNm).toBeCloseTo(12)
    expect(w.toNm).toBeCloseTo(28)
    expect(w.fromTime).toBeCloseTo(20 + 12 / 5)
    expect(w.closest).toBe(6)
  })
  it('Feuer außerhalb der Reichweite wird nie gesehen; Abschnitt wird auf die Route begrenzt', () => {
    expect(lightWindow({ ...lt, offset: 12 }, 60, 5, 20).fromNm).toBeNull()
    const start = lightWindow({ ...lt, along: 2 }, 60, 5, 20)
    expect(start.fromNm).toBe(0)
  })
})

import { parseNumberInput } from '@/lib/quiz'

describe('Zahleneingabe mit Stunden', () => {
  it('akzeptiert „19 h" und „19 Uhr"', () => {
    expect(parseNumberInput('19 h')).toBe(19)
    expect(parseNumberInput('19 Uhr')).toBe(19)
    expect(parseNumberInput('6,5h')).toBe(6.5)
    expect(parseNumberInput('15 min')).toBe(15)
  })
})
