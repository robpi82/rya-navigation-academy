import { describe, expect, it } from 'vitest'
import {
  angleDifference,
  computeVelocityTriangle,
  courseToSteer,
  direction,
  formatBearing,
  formatDuration,
  fromPolar,
  normalizeAngle,
  offsetPosition,
  reciprocal,
  simulate,
  timeFrom,
} from '@/calculations'

const base = { heading: 0, stw: 5, tideDirection: 0, tideRate: 0, leeway: 0 }

describe('Winkel', () => {
  it('normiert Winkel auf 0–360', () => {
    expect(normalizeAngle(360)).toBe(0)
    expect(normalizeAngle(-10)).toBe(350)
    expect(normalizeAngle(725)).toBe(5)
    expect(normalizeAngle(-1e-14)).toBe(0)
  })
  it('berechnet Winkeldifferenz über 000°', () => {
    expect(angleDifference(350, 10)).toBeCloseTo(20)
    expect(angleDifference(10, 350)).toBeCloseTo(-20)
    expect(angleDifference(0, 180)).toBeCloseTo(180)
  })
  it('Gegenkurs', () => {
    expect(reciprocal(45)).toBe(225)
    expect(reciprocal(270)).toBe(90)
  })
  it('formatiert Kurse dreistellig und ohne 360,0°', () => {
    expect(formatBearing(21.8014)).toBe('021,8°')
    expect(formatBearing(359.96)).toBe('000,0°')
    expect(formatBearing(5, 0)).toBe('005°')
    expect(formatBearing(null)).toBe('–')
  })
})

describe('Vektoren (x = Ost, y = Nord)', () => {
  it('fromPolar folgt x = v·sin θ, y = v·cos θ', () => {
    const e = fromPolar(2, 90)
    expect(e.x).toBeCloseTo(2)
    expect(e.y).toBeCloseTo(0)
    const s = fromPolar(3, 180)
    expect(s.y).toBeCloseTo(-3)
  })
  it('direction nutzt atan2(x, y) und liefert null für Nullvektor', () => {
    expect(direction({ x: 1, y: 1 })).toBeCloseTo(45)
    expect(direction({ x: -1, y: 0 })).toBeCloseTo(270)
    expect(direction({ x: 0, y: 0 })).toBeNull()
  })
})

describe('Geschwindigkeitsdreieck', () => {
  it('Referenzbeispiel: HDG 000°, 5 kn, Strom 090° 2 kn → COG ≈ 021,8°, SOG ≈ 5,39 kn', () => {
    const r = computeVelocityTriangle({ ...base, tideDirection: 90, tideRate: 2 })
    expect(r.waterTrack).toBe(0)
    expect(r.cog!).toBeCloseTo(21.801, 2)
    expect(r.sog).toBeCloseTo(5.385, 3)
    expect(formatBearing(r.cog)).toBe('021,8°')
  })

  it('keine Strömung: COG = Heading, SOG = STW', () => {
    const r = computeVelocityTriangle({ ...base, heading: 135, stw: 6 })
    expect(r.cog!).toBeCloseTo(135)
    expect(r.sog).toBeCloseTo(6)
  })

  it('Strom genau voraus (mitlaufend): SOG = STW + Rate', () => {
    const r = computeVelocityTriangle({ ...base, heading: 60, tideDirection: 60, tideRate: 2 })
    expect(r.sog).toBeCloseTo(7)
    expect(r.cog!).toBeCloseTo(60)
  })

  it('Strom genau achteraus (Gegenstrom): SOG = STW − Rate', () => {
    const r = computeVelocityTriangle({ ...base, heading: 60, tideDirection: 240, tideRate: 2 })
    expect(r.sog).toBeCloseTo(3)
    expect(r.cog!).toBeCloseTo(60)
  })

  it('Querströmung von Steuerbord nach Backbord', () => {
    const r = computeVelocityTriangle({ ...base, heading: 90, stw: 4, tideDirection: 0, tideRate: 3 })
    expect(r.sog).toBeCloseTo(5)
    expect(r.cog!).toBeCloseTo(90 - 36.87, 1)
  })

  it('starke Gegenströmung: Boot treibt rückwärts über Grund', () => {
    const r = computeVelocityTriangle({ ...base, heading: 0, stw: 2, tideDirection: 180, tideRate: 3 })
    expect(r.sog).toBeCloseTo(1)
    expect(r.cog!).toBeCloseTo(180)
  })

  it('Windabdrift: Water Track = Heading + Leeway', () => {
    const r = computeVelocityTriangle({ ...base, heading: 90, leeway: 10 })
    expect(r.waterTrack).toBe(100)
    expect(r.cog!).toBeCloseTo(100)
    const l = computeVelocityTriangle({ ...base, heading: 90, leeway: -10 })
    expect(l.waterTrack).toBe(80)
  })

  it('Leeway und Strom kombiniert', () => {
    const r = computeVelocityTriangle({ heading: 0, stw: 5, leeway: 5, tideDirection: 270, tideRate: 1 })
    expect(r.waterTrack).toBe(5)
    const x = 5 * Math.sin((5 * Math.PI) / 180) - 1
    const y = 5 * Math.cos((5 * Math.PI) / 180)
    expect(r.sog).toBeCloseTo(Math.hypot(x, y))
    expect(r.cog!).toBeCloseTo(normalizeAngle((Math.atan2(x, y) * 180) / Math.PI))
  })

  it('Kurswechsel über 000°: Heading 355° + Leeway 10° → Water Track 005°', () => {
    const r = computeVelocityTriangle({ ...base, heading: 355, leeway: 10 })
    expect(r.waterTrack).toBe(5)
    expect(r.cog!).toBeCloseTo(5)
  })

  it('COG knapp westlich von Nord wird als ~35x° statt negativ ausgegeben', () => {
    const r = computeVelocityTriangle({ ...base, heading: 0, tideDirection: 270, tideRate: 1 })
    expect(r.cog!).toBeGreaterThan(348)
    expect(r.cog!).toBeLessThan(360)
  })

  it('Stillstand über Grund: SOG = 0, COG undefiniert (null)', () => {
    const r = computeVelocityTriangle({ ...base, heading: 0, stw: 3, tideDirection: 180, tideRate: 3 })
    expect(r.sog).toBe(0)
    expect(r.cog).toBeNull()
    const still = computeVelocityTriangle({ ...base, stw: 0 })
    expect(still.cog).toBeNull()
  })

  it('STW 0: Boot treibt nur mit dem Strom', () => {
    const r = computeVelocityTriangle({ ...base, stw: 0, tideDirection: 225, tideRate: 1.5 })
    expect(r.cog!).toBeCloseTo(225)
    expect(r.sog).toBeCloseTo(1.5)
  })
})

describe('Simulation über Zeit', () => {
  it('berechnet Distanzen und Endpunkte maßstabsgetreu', () => {
    const r = simulate({ ...base, tideDirection: 90, tideRate: 2, durationMin: 30 })
    expect(r.distanceThroughWater).toBeCloseTo(2.5)
    expect(r.tideDrift).toBeCloseTo(1)
    expect(r.groundTrackEnd.x).toBeCloseTo(1)
    expect(r.groundTrackEnd.y).toBeCloseTo(2.5)
    expect(r.distanceOverGround).toBeCloseTo(Math.hypot(1, 2.5))
  })
  it('Dauer 0 → keine Strecke', () => {
    const r = simulate({ ...base, durationMin: 0 })
    expect(r.distanceOverGround).toBe(0)
  })
})

describe('Course to Steer', () => {
  it('ohne Strom: CTS = gewünschter Kurs', () => {
    const r = courseToSteer({ desiredTrack: 45, stw: 5, tideDirection: 0, tideRate: 0 })
    expect(r.feasible).toBe(true)
    if (r.feasible) {
      expect(r.courseToSteer).toBeCloseTo(45)
      expect(r.sog).toBeCloseTo(5)
    }
  })

  it('Querstrom: vorhalten gegen den Strom', () => {
    const r = courseToSteer({ desiredTrack: 0, stw: 5, tideDirection: 90, tideRate: 2, distance: 10 })
    expect(r.feasible).toBe(true)
    if (r.feasible) {
      const alpha = (Math.asin(2 / 5) * 180) / Math.PI
      expect(r.courseToSteer).toBeCloseTo(360 - alpha)
      expect(r.sog).toBeCloseTo(Math.sqrt(25 - 4))
      expect(r.timeHours!).toBeCloseTo(10 / Math.sqrt(21))
      // Probe: mit dem CTS gesteuert ergibt sich exakt der Sollkurs
      const check = computeVelocityTriangle({ heading: r.courseToSteer, stw: 5, tideDirection: 90, tideRate: 2, leeway: 0 })
      expect(check.cog!).toBeCloseTo(0)
    }
  })

  it('Leeway wird zusätzlich vorgehalten (Heading = Water Track − Leeway)', () => {
    const r = courseToSteer({ desiredTrack: 90, stw: 6, tideDirection: 0, tideRate: 0, leeway: 5 })
    expect(r.feasible && r.courseToSteer).toBeCloseTo(85)
  })

  it('Probe über 000° mit Strom und Leeway', () => {
    const p = { desiredTrack: 10, stw: 5, tideDirection: 120, tideRate: 2.5, leeway: -6 }
    const r = courseToSteer(p)
    expect(r.feasible).toBe(true)
    if (r.feasible) {
      const check = computeVelocityTriangle({ heading: r.courseToSteer, stw: 5, tideDirection: 120, tideRate: 2.5, leeway: -6 })
      expect(angleDifference(10, check.cog!)).toBeCloseTo(0, 6)
    }
  })

  it('nicht erreichbar: Querstrom stärker als STW', () => {
    const r = courseToSteer({ desiredTrack: 0, stw: 2, tideDirection: 90, tideRate: 3 })
    expect(r.feasible).toBe(false)
    if (!r.feasible) expect(r.reason).toBe('cross-tide-too-strong')
  })

  it('nicht erreichbar: Gegenstrom stärker als STW', () => {
    const r = courseToSteer({ desiredTrack: 0, stw: 2, tideDirection: 180, tideRate: 3 })
    expect(r.feasible).toBe(false)
    if (!r.feasible) expect(r.reason).toBe('no-progress')
  })

  it('nicht erreichbar: keine Fahrt durchs Wasser', () => {
    const r = courseToSteer({ desiredTrack: 0, stw: 0, tideDirection: 0, tideRate: 1 })
    expect(r.feasible).toBe(false)
  })
})

describe('Distance-Speed-Time & Position', () => {
  it('Zeit = Distanz / Geschwindigkeit', () => {
    expect(timeFrom(12, 4)).toBe(3)
    expect(timeFrom(12, 0)).toBeNull()
    expect(formatDuration(1.5)).toBe('1 h 30 min')
    expect(formatDuration(0.25)).toBe('15 min')
  })
  it('Positionsversatz: 6 NM nach Nord = 6′ Breite', () => {
    const p = offsetPosition({ lat: 50, lon: -1 }, { x: 0, y: 6 })
    expect(p.lat).toBeCloseTo(50.1)
    expect(p.lon).toBeCloseTo(-1)
    const e = offsetPosition({ lat: 60, lon: 0 }, { x: 3, y: 0 })
    expect(e.lon).toBeCloseTo(0.1) // cos 60° = 0,5 → 3 NM = 6′ Länge
  })
})
