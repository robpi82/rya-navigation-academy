import { describe, expect, it } from 'vitest'
import { pilotagePlan, transitOffset, transitSeparation } from '@/calculations'

describe('Schlagplan', () => {
  const pts = [
    { name: 'A', pos: { lat: 50, lon: 0 } },
    { name: 'B', pos: { lat: 50.1, lon: 0 } },
    { name: 'C', pos: { lat: 50.1, lon: 0.1 } },
  ]
  it('Kurs, Distanz und Zeiten je Schlag', () => {
    const plan = pilotagePlan(pts, 6, 10)
    expect(plan[0].bearing).toBeCloseTo(0)
    expect(plan[0].distance).toBeCloseTo(6)
    expect(plan[0].minutes).toBeCloseTo(60)
    expect(plan[0].eta).toBeCloseTo(11)
    expect(plan[1].bearing).toBeCloseTo(90, 0)
    expect(plan[1].distance).toBeCloseTo(6 * Math.cos((50.1 * Math.PI) / 180), 1)
    expect(plan[1].eta).toBeGreaterThan(11)
  })
})

describe('Leitlinie (Deckpeilung)', () => {
  it('auf der Linie: kein Versatz, Zeichen in Deckung', () => {
    expect(transitOffset(0, 0, 1)).toBeCloseTo(0)
    expect(transitSeparation(0, 1, 2)).toBeCloseTo(0)
  })
  it('Peilung zum vorderen Zeichen kleiner als die Leitlinie: Boot steht an Steuerbord der Linie', () => {
    // Boot 0,05 NM östlich, vorderes Zeichen 1 NM voraus (Leitlinie 000°)
    const brg = (Math.atan2(-0.05, 1) * 180) / Math.PI + 360
    expect(transitOffset(brg, 0, 1)).toBeCloseTo(0.05, 3)
    expect(transitOffset(4, 0, 1)).toBeLessThan(0)
  })
  it('Boot an Steuerbord: vorderes Zeichen erscheint links vom hinteren → nach Backbord zum vorderen Zeichen steuern', () => {
    expect(transitSeparation(0.05, 1, 2)).toBeLessThan(0)
    expect(transitSeparation(-0.05, 1, 2)).toBeGreaterThan(0)
  })
  it('weiter auseinanderliegende Zeichen zeigen den Versatz deutlicher', () => {
    expect(Math.abs(transitSeparation(0.05, 1, 3))).toBeGreaterThan(Math.abs(transitSeparation(0.05, 1, 1.5)))
  })
})

import { pointInPolygon } from '@/calculations'
import { LAND } from '@/data/chartArea'
import { PILOTAGE_POINTS } from '@/modules/coastal/pilotageWidgets'

describe('Pilotage-Plan im Übungsrevier', () => {
  it('alle Teilstrecken liegen im Wasser (außer dem Hafenbecken am Ziel)', () => {
    const onLand = (p: { lat: number; lon: number }) => LAND.some((l) => pointInPolygon(p, l.outline))
    for (let i = 1; i < PILOTAGE_POINTS.length - 1; i++) {
      const a = PILOTAGE_POINTS[i - 1].pos
      const b = PILOTAGE_POINTS[i].pos
      for (let k = 0; k <= 20; k++) {
        const p = { lat: a.lat + ((b.lat - a.lat) * k) / 20, lon: a.lon + ((b.lon - a.lon) * k) / 20 }
        expect(onLand(p), `${PILOTAGE_POINTS[i].name} ${k}`).toBe(false)
      }
    }
  })
})
