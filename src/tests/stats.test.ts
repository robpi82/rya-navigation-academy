import { describe, expect, it } from 'vitest'
import { computeStreak, questionsNeedingReview, topicStats } from '@/lib/stats'

describe('Lernstreak', () => {
  it('zählt aufeinanderfolgende Tage bis heute', () => {
    expect(computeStreak(['2026-10-13', '2026-10-14', '2026-10-15'], '2026-10-15')).toBe(3)
  })
  it('heute noch nicht gelernt: Serie bis gestern bleibt bestehen', () => {
    expect(computeStreak(['2026-10-13', '2026-10-14'], '2026-10-15')).toBe(2)
  })
  it('Lücke beendet die Serie', () => {
    expect(computeStreak(['2026-10-12', '2026-10-15'], '2026-10-15')).toBe(1)
    expect(computeStreak(['2026-10-10'], '2026-10-15')).toBe(0)
  })
  it('funktioniert über Monatsgrenzen', () => {
    expect(computeStreak(['2026-09-30', '2026-10-01'], '2026-10-01')).toBe(2)
  })
})

describe('Themenstatistik', () => {
  it('berechnet Fehlerquoten', () => {
    const s = topicStats(
      [
        {
          id: 'a',
          date: '',
          mode: 'learn',
          durationSec: 10,
          answers: [
            { questionId: '1', topic: 'sog', correct: true, given: 0 },
            { questionId: '2', topic: 'sog', correct: false, given: 1 },
          ],
        },
      ],
      ['sog', 'cog'],
    )
    expect(s[0].errorRate).toBe(0.5)
    expect(s[1].answered).toBe(0)
  })
  it('Wiederholungsbedarf = zuletzt falsch beantwortet', () => {
    expect(
      questionsNeedingReview({
        a: { correct: 1, wrong: 1, lastCorrect: false, lastAnswered: '' },
        b: { correct: 2, wrong: 0, lastCorrect: true, lastAnswered: '' },
      }),
    ).toEqual(['a'])
  })
})

import { niceStep } from '@/components/nautical/svg'
describe('Maßstab (niceStep)', () => {
  it('liefert 1-2-5-Schritte', () => {
    expect(niceStep(6, 6)).toBe(1)
    expect(niceStep(12, 6)).toBe(2)
    expect(niceStep(0.6, 6)).toBeCloseTo(0.1)
    expect(niceStep(30, 6)).toBe(5)
  })
})
