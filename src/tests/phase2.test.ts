import { describe, expect, it } from 'vitest'
import { buildSession, formatInterval, isDue, isMastered, newCardState, review, MIN_EASE } from '@/lib/spacedRepetition'
import { computeEta, formatClockTime, interpolateTidalRate, parseClock } from '@/calculations'

const T0 = new Date('2026-10-15T08:00:00Z')
const days = (a: string, b: Date) => Math.round((new Date(a).getTime() - b.getTime()) / 86_400_000)

describe('Spaced Repetition', () => {
  it('neue Karte ist sofort fällig', () => {
    expect(isDue(newCardState(T0), T0)).toBe(true)
    expect(isDue(undefined, T0)).toBe(true)
  })

  it('„Gut" wächst 1 → 3 → ~7,5 Tage', () => {
    let s = review(newCardState(T0), 2, T0)
    expect(s.interval).toBe(1)
    s = review(s, 2, T0)
    expect(s.interval).toBe(3)
    s = review(s, 2, T0)
    expect(s.interval).toBe(Math.round(3 * 2.5))
    expect(days(s.due, T0)).toBe(s.interval)
    expect(isMastered(s)).toBe(true)
  })

  it('„Sehr leicht" ergibt längere Intervalle und höhere Leichtigkeit als „Gut"', () => {
    const good = review(newCardState(T0), 2, T0)
    const easy = review(newCardState(T0), 3, T0)
    expect(easy.interval).toBeGreaterThan(good.interval)
    expect(easy.ease).toBeGreaterThan(good.ease)
  })

  it('„Schwer" verkürzt gegenüber „Gut" und senkt die Leichtigkeit', () => {
    let s = review(newCardState(T0), 2, T0)
    s = review(s, 2, T0) // 3 Tage
    const hard = review(s, 1, T0)
    const good = review(s, 2, T0)
    expect(hard.interval).toBeLessThan(good.interval)
    expect(hard.ease).toBeLessThan(s.ease)
  })

  it('„Nicht gewusst" setzt zurück, zählt Fehler und macht die Karte sofort wieder fällig', () => {
    let s = review(review(newCardState(T0), 2, T0), 2, T0)
    s = review(s, 0, T0)
    expect(s.interval).toBe(0)
    expect(s.reps).toBe(0)
    expect(s.lapses).toBe(1)
    expect(isDue(s, T0)).toBe(true)
  })

  it('Leichtigkeit fällt nie unter das Minimum', () => {
    let s = newCardState(T0)
    for (let i = 0; i < 20; i++) s = review(s, 0, T0)
    expect(s.ease).toBe(MIN_EASE)
  })

  it('schwierige Karten werden häufiger wiederholt', () => {
    let hard = newCardState(T0)
    let easy = newCardState(T0)
    for (let i = 0; i < 4; i++) {
      hard = review(hard, 1, T0)
      easy = review(easy, 3, T0)
    }
    expect(hard.interval).toBeLessThan(easy.interval)
  })

  it('Sitzung: zuerst fällige (überfälligste) Karten, dann begrenzt neue', () => {
    const states = {
      a: { ...newCardState(T0), due: '2026-10-14T00:00:00Z', interval: 1 },
      b: { ...newCardState(T0), due: '2026-10-10T00:00:00Z', interval: 3 },
      c: { ...newCardState(T0), due: '2026-10-20T00:00:00Z', interval: 5 },
    }
    expect(buildSession(['a', 'b', 'c', 'n1', 'n2', 'n3'], states, 2, T0)).toEqual(['b', 'a', 'n1', 'n2'])
  })

  it('Intervall-Vorschau', () => {
    expect(formatInterval(0)).toBe('gleich')
    expect(formatInterval(1)).toBe('1 Tag')
    expect(formatInterval(60)).toBe('2 Monate')
  })
})

describe('Gezeitenstrom-Interpolation', () => {
  const base = { springRate: 3, neapRate: 1.4, springRange: 5.2, neapRange: 2.4 }
  it('Spring- und Nipptide ergeben die Tabellenwerte', () => {
    expect(interpolateTidalRate({ ...base, range: 5.2 })!.rate).toBeCloseTo(3)
    expect(interpolateTidalRate({ ...base, range: 2.4 })!.rate).toBeCloseTo(1.4)
  })
  it('Zwischenwert wird linear interpoliert', () => {
    const r = interpolateTidalRate({ ...base, range: 3.8 })!
    expect(r.rate).toBeCloseTo(2.2)
    expect(r.extrapolated).toBe(false)
  })
  it('außerhalb des Bereichs wird extrapoliert und markiert', () => {
    expect(interpolateTidalRate({ ...base, range: 6 })!.extrapolated).toBe(true)
  })
  it('ungültige Tidenhübe → null', () => {
    expect(interpolateTidalRate({ ...base, springRange: 2, neapRange: 3, range: 2.5 })).toBeNull()
  })
})

describe('ETA', () => {
  it('Uhrzeit lesen', () => {
    expect(parseClock('09:30')).toBe(570)
    expect(parseClock('9.05')).toBe(545)
    expect(parseClock('24:00')).toBeNull()
    expect(parseClock('abc')).toBeNull()
  })
  it('ETA = Abfahrt + Distanz / SOG', () => {
    const e = computeEta(parseClock('10:15')!, 12, 4.8)!
    expect(e.time).toBe('12:45')
    expect(e.dayOffset).toBe(0)
  })
  it('über Mitternacht', () => {
    const e = computeEta(parseClock('22:00')!, 15, 5)!
    expect(e.time).toBe('01:00')
    expect(e.dayOffset).toBe(1)
    expect(formatClockTime(-30).time).toBe('23:30')
  })
  it('SOG 0 → keine ETA', () => {
    expect(computeEta(600, 10, 0)).toBeNull()
  })
})
