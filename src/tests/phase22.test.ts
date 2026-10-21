import { describe, expect, it } from 'vitest'
import { computeAltitudeAzimuth, intercept, iteratedSightFix, localHourAngle, rhumbLine, sightFix, sunGHA } from '@/calculations'

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
