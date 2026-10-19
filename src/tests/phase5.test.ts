import { describe, expect, it } from 'vitest'
import {
  actualDepth,
  beaufortFromKnots,
  BEAUFORT,
  collisionRisk,
  cpa,
  encounter,
  knotsToKmh,
  knotsToMs,
  lowPressureDirection,
  msToKnots,
  pressureTendency,
  relativeBearing,
  rhumbDestination,
  steerAdvice,
  tackOf,
  trackInfo,
  visibilityTerm,
  visibleLights,
  vmg,
  windShift,
  type Vessel,
} from '@/calculations'

const v = (x: number, y: number, course: number, kind: Vessel['kind'] = 'power'): Vessel => ({ pos: { x, y }, course, kind })
const OWN = v(0, 0, 0)

describe('COLREGs: Begegnungen', () => {
  it('relative Peilung: positiv = Steuerbord', () => {
    expect(relativeBearing(OWN, v(1, 1, 0))).toBeCloseTo(45)
    expect(relativeBearing(OWN, v(-1, 1, 0))).toBeCloseTo(-45)
    expect(relativeBearing(OWN, v(0, -1, 0))).toBeCloseTo(180)
  })
  it('entgegengesetzte Kurse: beide weichen aus (Rule 14)', () => {
    const e = encounter(OWN, v(0, 2, 180))
    expect(e.situation).toBe('head-on')
    expect(e.own).toBe('both-give-way')
    expect(e.rule).toBe('Rule 14')
  })
  it('Kreuzen: wer den anderen an Steuerbord hat, weicht aus (Rule 15)', () => {
    const e = encounter(OWN, v(1.414, 1.414, 270))
    expect(e.situation).toBe('crossing')
    expect(e.own).toBe('give-way')
    expect(e.other).toBe('stand-on')
  })
  it('Kreuzen: anderer an Backbord → ich bin Kurshalter', () => {
    const e = encounter(OWN, v(-1.414, 1.414, 90))
    expect(e.own).toBe('stand-on')
    expect(e.other).toBe('give-way')
  })
  it('Überholen: der Überholende weicht aus (Rule 13), auch gegenüber dem Segler', () => {
    expect(encounter(OWN, v(0, 0.5, 0)).own).toBe('give-way')
    expect(encounter(OWN, v(0, -0.5, 0)).own).toBe('stand-on')
    expect(encounter(OWN, v(0, 0.5, 0, 'sail')).situation).toBe('overtaking')
    expect(encounter(OWN, v(0, 0.5, 0, 'sail')).own).toBe('give-way')
  })
  it('Maschine gegen Segler: Maschine weicht aus (Rule 18)', () => {
    const e = encounter(OWN, v(-1.414, 1.414, 90, 'sail'))
    expect(e.situation).toBe('power-vs-sail')
    expect(e.own).toBe('give-way')
    expect(encounter(v(0, 0, 0, 'sail'), v(1.414, 1.414, 270)).own).toBe('stand-on')
  })
  it('Segler gegen Segler: Backbordbug weicht aus (Rule 12)', () => {
    const own = v(0, 0, 0, 'sail') // Wind von West → Wind von Backbord → Backbordbug
    const e = encounter(own, v(1.414, 1.414, 180, 'sail'), 270)
    expect(e.situation).toBe('sail-opposite-tacks')
    expect(e.own).toBe('give-way')
    expect(e.rule).toBe('Rule 12(a)(i)')
    // Wind von Ost: gleiche Positionen, jetzt ist der eigene Bug Steuerbordbug
    expect(encounter(own, v(1.414, 1.414, 180, 'sail'), 90).own).toBe('stand-on')
  })
  it('Segler, gleicher Bug: Luvboot weicht aus', () => {
    const own = v(0, 0, 0, 'sail')
    const other = v(1, 0.2, 0, 'sail')
    const e = encounter(own, other, 270)
    expect(e.situation).toBe('sail-same-tack')
    expect(e.own).toBe('give-way') // eigenes Boot liegt weiter westlich = Luv
    const f = encounter(v(1, 0.2, 0, 'sail'), v(0, 0, 0, 'sail'), 270)
    expect(f.own).toBe('stand-on')
  })
  it('auseinanderlaufende Fahrzeuge: keine Pflichten', () => {
    expect(encounter(OWN, v(0, -1, 180)).situation).toBe('diverging')
  })
  it('Bug aus Windrichtung', () => {
    expect(tackOf(0, 270)).toBe('port')
    expect(tackOf(0, 90)).toBe('starboard')
    expect(tackOf(0, 0)).toBeNull()
    expect(tackOf(0, 180)).toBeNull()
  })
})

describe('COLREGs: Lichter', () => {
  const ids = (vessel: Parameters<typeof visibleLights>[0], b: number, way = true) => visibleLights(vessel, b, way).map((l) => l.id).sort()
  it('Maschinenfahrzeug: Topplicht und beide Seitenlichter von vorn, nur Hecklicht von achtern', () => {
    expect(ids('power', 0)).toEqual(['green', 'masthead', 'red'])
    expect(ids('power', 90)).toEqual(['green', 'masthead'])
    expect(ids('power', -90)).toEqual(['masthead', 'red'])
    expect(ids('power', 180)).toEqual(['stern'])
    expect(ids('power', 120)).toEqual(['stern'])
    expect(ids('power', 100)).toEqual(['green', 'masthead'])
  })
  it('Segler hat kein Topplicht', () => {
    expect(ids('sail', 0)).toEqual(['green', 'red'])
    expect(ids('sail', 180)).toEqual(['stern'])
  })
  it('vor Anker: weißes Rundumlicht aus jeder Richtung', () => {
    for (const b of [0, 90, 180, -90]) expect(ids('anchor', b)).toEqual(['anchor'])
  })
  it('manövrierunfähig: zwei rote Rundumlichter, Seiten- und Hecklicht nur bei Fahrt', () => {
    expect(ids('nuc', 0, false)).toEqual(['nuc1', 'nuc2'])
    expect(ids('nuc', 0, true)).toEqual(['green', 'nuc1', 'nuc2', 'red'])
  })
  it('manövrierbehindert: rot-weiß-rot; Trawler: grün über weiß', () => {
    const r = visibleLights('restricted', 0, false)
    expect(r.map((l) => l.color)).toEqual(['red', 'white', 'red'])
    const t = visibleLights('trawling', 0, false)
    expect(t.map((l) => l.color)).toEqual(['green', 'white'])
    expect(t[0].height).toBeGreaterThan(t[1].height)
  })
})

describe('Wetter', () => {
  it('Beaufort aus Knoten', () => {
    const cases: [number, number][] = [[0, 0], [0.4, 0], [1, 1], [3, 1], [4, 2], [6, 2], [7, 3], [10, 3], [11, 4], [16.4, 4], [16.6, 5], [21, 5], [22, 6], [33, 7], [34, 8], [40, 8], [41, 9], [48, 10], [56, 11], [63, 11], [64, 12], [100, 12]]
    for (const [kn, f] of cases) expect(beaufortFromKnots(kn), `${kn} kn`).toBe(f)
  })
  it('Tabelle ist lückenlos und aufsteigend', () => {
    expect(BEAUFORT).toHaveLength(13)
    for (let i = 1; i < BEAUFORT.length; i++) {
      expect(BEAUFORT[i].minKn).toBe((BEAUFORT[i - 1].maxKn ?? 0) + 1)
      expect(BEAUFORT[i].waveHeight).toBeGreaterThanOrEqual(BEAUFORT[i - 1].waveHeight)
    }
  })
  it('Einheitenumrechnung', () => {
    expect(knotsToMs(10)).toBeCloseTo(5.144, 3)
    expect(msToKnots(knotsToMs(17.3))).toBeCloseTo(17.3)
    expect(knotsToKmh(10)).toBeCloseTo(18.52)
  })
  it('Buys-Ballot-Regel', () => {
    expect(lowPressureDirection(270)).toBe(0) // Westwind: Tief im Norden
    expect(lowPressureDirection(0)).toBe(90) // Nordwind: Tief im Osten
    expect(lowPressureDirection(270, 'south')).toBe(180)
  })
  it('Winddrehung: veering = rechtsdrehend, backing = linksdrehend', () => {
    expect(windShift(270, 300)).toEqual({ kind: 'veer', degrees: 30 })
    expect(windShift(10, 350)).toEqual({ kind: 'back', degrees: 20 })
    expect(windShift(350, 10)).toEqual({ kind: 'veer', degrees: 20 })
    expect(windShift(90, 90).kind).toBe('none')
  })
  it('Druck- und Sichtbegriffe', () => {
    expect(pressureTendency(0.05)).toContain('beständig')
    expect(pressureTendency(1)).toContain('steigend')
    expect(pressureTendency(1)).toContain('langsam')
    expect(pressureTendency(-2)).toBe('fallend (falling)')
    expect(pressureTendency(-5)).toContain('quickly')
    expect(pressureTendency(-7)).toContain('very rapidly')
    expect(visibilityTerm(8)).toContain('gut')
    expect(visibilityTerm(3)).toContain('mäßig')
    expect(visibilityTerm(1)).toContain('schlecht')
    expect(visibilityTerm(0.3)).toContain('Nebel')
  })
})

describe('Elektronische Navigation', () => {
  const from = { lat: 50.7, lon: -1.3 }
  const to = rhumbDestination(from, 90, 10)
  it('XTE: Boot südlich einer Ost-Linie liegt rechts, Rückkehr durch Steuern nach links', () => {
    const onLine = rhumbDestination(from, 90, 4)
    const boat = rhumbDestination(onLine, 180, 0.5)
    const t = trackInfo(from, to, boat)
    expect(t.xte).toBeCloseTo(0.5, 2)
    expect(t.alongTrack).toBeCloseTo(4, 1)
    expect(t.legLength).toBeCloseTo(10, 1)
    expect(t.trackBearing).toBeCloseTo(90, 1)
    expect(t.dtw).toBeCloseTo(Math.hypot(6, 0.5), 1)
    expect(steerAdvice(t.xte)).toBe('steer-left')
  })
  it('XTE: nördlich der Linie negativ, auf der Linie null', () => {
    const north = rhumbDestination(rhumbDestination(from, 90, 5), 0, 0.3)
    expect(trackInfo(from, to, north).xte).toBeCloseTo(-0.3, 2)
    expect(steerAdvice(-0.3)).toBe('steer-right')
    expect(steerAdvice(0.01)).toBe('on-track')
    expect(trackInfo(from, to, rhumbDestination(from, 90, 2)).xte).toBeCloseTo(0, 3)
  })
  it('VMG zum Wegpunkt', () => {
    expect(vmg(6, 90, 60)).toBeCloseTo(5.196, 3)
    expect(vmg(6, 90, 90)).toBeCloseTo(6)
    expect(vmg(6, 270, 90)).toBeCloseTo(-6)
    expect(vmg(6, 0, 90)).toBeCloseTo(0, 6)
  })
  const own = { pos: { x: 0, y: 0 }, course: 0, speed: 10 }
  it('CPA: Gegenkurs → Kollision in 15 Minuten', () => {
    const r = cpa(own, { pos: { x: 0, y: 5 }, course: 180, speed: 10 })
    expect(r.cpa).toBeCloseTo(0)
    expect(r.tcpaMinutes).toBeCloseTo(15)
    expect(r.closing).toBe(true)
  })
  it('CPA: kreuzend mit Versatz', () => {
    const r = cpa(own, { pos: { x: 3, y: 2 }, course: 270, speed: 10 })
    expect(r.cpa).toBeCloseTo(0.7071, 3)
    expect(r.tcpaMinutes).toBeCloseTo(15)
  })
  it('CPA: auseinanderlaufend oder parallel → keine Annäherung', () => {
    expect(cpa(own, { pos: { x: 0, y: -3 }, course: 180, speed: 10 }).closing).toBe(false)
    const par = cpa(own, { pos: { x: 1, y: 1 }, course: 0, speed: 10 })
    expect(par.closing).toBe(false)
    expect(par.tcpaMinutes).toBeNull()
    expect(par.cpa).toBeCloseTo(Math.SQRT2)
  })
  it('Gefahrenbewertung', () => {
    const mk = (cpaNm: number, tcpa: number) => ({ cpa: cpaNm, tcpaMinutes: tcpa, closing: true, currentDistance: 5 })
    expect(collisionRisk(mk(0.3, 10))).toBe('danger')
    expect(collisionRisk(mk(0.3, 30))).toBe('warning')
    expect(collisionRisk(mk(0.7, 10))).toBe('watch')
    expect(collisionRisk(mk(1.2, 10))).toBe('none')
    expect(collisionRisk({ cpa: 0, tcpaMinutes: null, closing: false, currentDistance: 3 })).toBe('none')
  })
  it('Echolot: Bezug Geber, Kiel oder Wasserlinie', () => {
    expect(actualDepth(3, 'transducer', 0.4, 1.8)).toBeCloseTo(3.4)
    expect(actualDepth(1.5, 'keel', 0.4, 1.8)).toBeCloseTo(3.3)
    expect(actualDepth(3, 'waterline', 0.4, 1.8)).toBe(3)
  })
})
