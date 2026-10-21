import { describe, expect, it } from 'vitest'
import { approxDeclination, correctSunAltitude, dip, dm, noonAltitude, noonLatitude, noonTimeUT, refraction, toDegMin } from '@/calculations'

describe('Beschickung der Sonnenhöhe', () => {
  it('Kimmtiefe: −1,76′·√h', () => {
    expect(dip(4)).toBeCloseTo(-3.52)
    expect(dip(0)).toBeCloseTo(0)
  })
  it('Refraktion: rund −1′ bei 45°, rund −34′ am Horizont, nimmt mit der Höhe ab', () => {
    expect(refraction(45)).toBeCloseTo(-0.99, 1)
    expect(refraction(0)).toBeCloseTo(-34.5, 0)
    expect(Math.abs(refraction(10))).toBeGreaterThan(Math.abs(refraction(30)))
    expect(refraction(90)).toBeCloseTo(0, 1)
  })
  it('Unterrand bei 45°: Gesamtbeschickung ohne Kimmtiefe ≈ +15′ (Almanach-Größenordnung)', () => {
    const c = correctSunAltitude(45, 0)
    expect((c.observed - 45) * 60).toBeGreaterThan(14.5)
    expect((c.observed - 45) * 60).toBeLessThan(15.5)
  })
  it('Indexberichtigung, Kimmtiefe und Oberrand gehen mit Vorzeichen ein', () => {
    const base = correctSunAltitude(40, 3)
    expect((correctSunAltitude(40, 3, 2).observed - base.observed) * 60).toBeCloseTo(2, 1)
    expect((correctSunAltitude(40, 3, 0, true).observed - base.observed) * 60).toBeCloseTo(-32, 0)
    expect(base.apparent).toBeCloseTo(40 + dip(3) / 60)
  })
})

describe('Mittagsbreite', () => {
  it('Sonne im Süden: Breite = Deklination + Zenitdistanz', () => {
    expect(noonLatitude(52, 12, 'S')).toBeCloseTo(50)
    expect(noonLatitude(dm(40, 30), dm(-10, 0), 'S')).toBeCloseTo(39.5)
  })
  it('Sonne im Norden: Breite = Deklination − Zenitdistanz', () => {
    expect(noonLatitude(70, 20, 'N')).toBeCloseTo(0)
    expect(noonLatitude(60, 10, 'N')).toBeCloseTo(-20)
  })
  it('Hin- und Rückrechnung stimmen überein', () => {
    for (const [lat, dec] of [[50.7, 15], [-33.9, 20], [10, 22], [60, -23]]) {
      const h = noonAltitude(lat, dec)
      expect(noonLatitude(h.altitude, dec, h.bearing)).toBeCloseTo(lat)
    }
  })
})

describe('Zeit der Kulmination und Deklination', () => {
  it('Greenwich ohne Zeitgleichung: 12:00 UT; 15° West: 13:00 UT; Zeitgleichung +16 min: 16 min früher', () => {
    expect(noonTimeUT(0)).toBeCloseTo(12)
    expect(noonTimeUT(-15)).toBeCloseTo(13)
    expect(noonTimeUT(0, 16) * 60).toBeCloseTo(12 * 60 - 16)
  })
  it('Deklination: Tagundnachtgleiche ≈ 0°, Sommersonnenwende ≈ +23,4°, Wintersonnenwende ≈ −23,4°', () => {
    expect(Math.abs(approxDeclination(80))).toBeLessThan(1)
    expect(approxDeclination(172)).toBeGreaterThan(23)
    expect(approxDeclination(355)).toBeLessThan(-23)
  })
  it('Grad/Minuten-Umrechnung', () => {
    expect(dm(50, 30)).toBeCloseTo(50.5)
    expect(dm(-10, 15)).toBeCloseTo(-10.25)
    expect(toDegMin(50.5)).toEqual({ deg: 50, min: 30, sign: 1 })
    expect(toDegMin(-0.9999)).toEqual({ deg: 1, min: 0, sign: -1 })
  })
})

import { parseNumberInput } from '@/lib/quiz'

describe('Zahleneingabe', () => {
  it('akzeptiert typografisches Minus und Bogenminuten-Zeichen', () => {
    expect(parseNumberInput('−3,5′')).toBeCloseTo(-3.5)
    expect(parseNumberInput("-3.5'")).toBeCloseTo(-3.5)
    expect(parseNumberInput('45°')).toBe(45)
  })
})
