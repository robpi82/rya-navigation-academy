import { describe, expect, it } from 'vitest'
import { computeAltitudeAzimuth, fromPolar, intercept, iteratedSightFix, localHourAngle, rhumbLine, sightFix, sunGHA } from '@/calculations'

describe('Berechnete Höhe und Azimut', () => {
  it('Gestirn im Zenit: Hc = 90°', () => {
    expect(computeAltitudeAzimuth({ lat: 10, lon: 20 }, 340, 10).hc).toBeCloseTo(90)
  })
  it('Meridiandurchgang: Hc = 90° − |Breite − Deklination|, Azimut Süd bzw. Nord', () => {
    const s = computeAltitudeAzimuth({ lat: 50, lon: 0 }, 0, 20)
    expect(s.hc).toBeCloseTo(60)
    expect(s.zn).toBeCloseTo(180)
    const n = computeAltitudeAzimuth({ lat: -30, lon: 0 }, 0, 10)
    expect(n.hc).toBeCloseTo(50)
    expect(n.zn % 360).toBeCloseTo(0)
  })
  it('Vormittag: Sonne im Osten (LHA > 180°), Nachmittag im Westen', () => {
    expect(computeAltitudeAzimuth({ lat: 50, lon: 0 }, 300, 0).zn).toBeLessThan(180)
    expect(computeAltitudeAzimuth({ lat: 50, lon: 0 }, 60, 0).zn).toBeGreaterThan(180)
  })
  it('Äquator, Deklination 0, LHA 90°: Gestirn am Horizont im Westen', () => {
    const c = computeAltitudeAzimuth({ lat: 0, lon: 0 }, 90, 0)
    expect(c.hc).toBeCloseTo(0)
    expect(c.zn).toBeCloseTo(270)
  })
  it('LHA = GHA + Länge (Ost +)', () => {
    expect(localHourAngle(30, -45)).toBeCloseTo(345)
    expect(localHourAngle(350, 20)).toBeCloseTo(10)
  })
  it('Sonnen-GHA: 12:00 UT ohne Zeitgleichung = 0°, 18:00 UT = 90°', () => {
    expect(sunGHA(12)).toBeCloseTo(0)
    expect(sunGHA(18)).toBeCloseTo(90)
    expect(sunGHA(12, 4)).toBeCloseTo(1)
  })
})

describe('Intercept und Fix', () => {
  const truth = { lat: 49.6, lon: -16.2 }
  const ap = { lat: 50, lon: -16 }
  const sun = { gha: 340, dec: 12 } // Vormittag
  const star = { gha: 100, dec: 40 } // anderes Azimut
  const ho = (b: { gha: number; dec: number }) => computeAltitudeAzimuth(truth, b.gha, b.dec).hc
  it('Intercept positiv (toward), wenn die wahre Position näher am Bildpunkt liegt', () => {
    const i = intercept(ap, sun.gha, sun.dec, computeAltitudeAzimuth(ap, sun.gha, sun.dec).hc + 5 / 60)
    expect(i.intercept).toBeCloseTo(5)
    expect(rhumbLine(ap, i.footPoint).distance).toBeCloseTo(5, 1)
    expect(i.lineDirection).toBeCloseTo((i.zn + 90) % 360)
  })
  it('die Höhenstandlinie läuft (nahezu) durch die wahre Position', () => {
    const i = intercept(ap, sun.gha, sun.dec, ho(sun))
    // Abstand der wahren Position von der Linie, ebene Näherung
    const dx = (truth.lon - i.footPoint.lon) * 60 * Math.cos((truth.lat * Math.PI) / 180)
    const dy = (truth.lat - i.footPoint.lat) * 60
    const z = (i.zn * Math.PI) / 180
    expect(Math.abs(dx * Math.sin(z) + dy * Math.cos(z))).toBeLessThan(0.3)
  })
  it('zwei Höhenstandlinien schneiden sich nahe der wahren Position', () => {
    const fix = sightFix(ap, intercept(ap, sun.gha, sun.dec, ho(sun)), intercept(ap, star.gha, star.dec, ho(star)))!
    expect(rhumbLine(fix, truth).distance).toBeLessThan(1) // AP rund 26 NM entfernt: Näherungsfehler der geraden Standlinie
  })
  it('Nachrechnen mit dem Fix als neuer AP verringert den Fehler deutlich', () => {
    const obs = (b: { gha: number; dec: number }) => ({ gha: b.gha, declination: b.dec, observedAltitude: ho(b) })
    const once = iteratedSightFix(ap, obs(sun), obs(star), 1)!
    const twice = iteratedSightFix(ap, obs(sun), obs(star), 2)!
    expect(rhumbLine(twice, truth).distance).toBeLessThan(0.05)
    expect(rhumbLine(twice, truth).distance).toBeLessThan(rhumbLine(once, truth).distance)
  })
  it('gleiches Azimut: kein Schnitt', () => {
    const a = intercept(ap, sun.gha, sun.dec, 30)
    expect(sightFix(ap, a, a)).toBeNull()
  })
})

import { offsetPosition as offsetPos, sunRunSun } from '@/calculations'

describe('Sonne – Versegelung – Sonne', () => {
  const start = { lat: 48, lon: -20 }
  const dec = 15
  const sight = (pos: { lat: number; lon: number }, ut: number) => {
    const gha = sunGHAForTest(ut)
    return { gha, declination: dec, observedAltitude: computeAltitudeAzimuth(pos, gha, dec).hc }
  }
  // GHA wie sunGHA ohne Zeitgleichung
  function sunGHAForTest(ut: number) {
    return (((15 * (ut - 12)) % 360) + 360) % 360
  }
  it('exakt geschätzter Weg: Running Fix trifft die wahre Position', () => {
    const run = fromPolar(18, 240) // 3 h mit 6 kn auf 240°
    const p2 = offsetPos(start, run)
    const r = sunRunSun(start, sight(start, 10.5), sight(p2, 13.5), 240, 18)
    expect(rhumbLine(r.fix!, p2).distance).toBeLessThan(0.5)
    expect(Math.abs(r.first.zn - r.second.zn)).toBeGreaterThan(30) // Sonne hat genug Azimut gewandert
  })
  it('unbekannter Strom verschiebt den Fix – der Fehler hängt vom Versatz ab', () => {
    const run = fromPolar(18, 240)
    const drift = fromPolar(3, 180) // 3 NM Strom nach Süd, nicht im geschätzten Weg enthalten
    const p2 = offsetPos(start, { x: run.x + drift.x, y: run.y + drift.y })
    const r = sunRunSun(start, sight(start, 10.5), sight(p2, 13.5), 240, 18)
    const err = rhumbLine(r.fix!, p2).distance
    expect(err).toBeGreaterThan(0.5)
    expect(err).toBeLessThan(4)
    expect(rhumbLine(r.dr, p2).distance).toBeCloseTo(3, 0)
  })
})
