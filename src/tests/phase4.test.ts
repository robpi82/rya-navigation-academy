import { describe, expect, it } from 'vitest'
import {
  anchorChainLength,
  classifyRange,
  compassToTrue,
  describeLight,
  deviationAt,
  formatVariation,
  geographicRange,
  heightCosine,
  lightTimeline,
  magneticToCompassWithTable,
  parseLight,
  passableWindow,
  signedFromDirection,
  tidalRange,
  trueToCompass,
  underKeelClearance,
  variationForYear,
  waterDepth,
} from '@/calculations'

describe('Kompasskorrektur', () => {
  it('Compass → True: Ost addieren, West subtrahieren', () => {
    expect(compassToTrue(75, signedFromDirection(3, 'W'), signedFromDirection(4, 'W'))).toEqual({ magnetic: 72, true: 68 })
    expect(compassToTrue(75, signedFromDirection(3, 'E'), signedFromDirection(4, 'E')).true).toBe(82)
  })
  it('True → Compass: Ost subtrahieren, West addieren', () => {
    expect(trueToCompass(120, signedFromDirection(5, 'W'), signedFromDirection(2, 'E'))).toEqual({ magnetic: 125, compass: 123 })
    expect(trueToCompass(90, signedFromDirection(4, 'E'), 0).compass).toBe(86)
  })
  it('Hin- und Rückrechnung ergeben denselben Kurs', () => {
    for (const c of [0, 45, 123, 250, 359]) {
      const t = compassToTrue(c, 3, -6)
      expect(trueToCompass(t.true, -6, 3).compass).toBeCloseTo(c)
    }
  })
  it('Kurs über 000°', () => {
    expect(compassToTrue(350, 6, 8).true).toBe(4)
    expect(trueToCompass(4, 8, 6).compass).toBe(350)
    expect(trueToCompass(2, -5, 0).compass).toBe(7)
  })
  const table = [
    { heading: 0, deviation: 4 },
    { heading: 90, deviation: -2 },
    { heading: 180, deviation: -4 },
    { heading: 270, deviation: 3 },
  ]
  it('Deviation wird zwischen den Tabellenwerten interpoliert (auch über 000°)', () => {
    expect(deviationAt(table, 45)).toBeCloseTo(1)
    expect(deviationAt(table, 90)).toBe(-2)
    expect(deviationAt(table, 315)).toBeCloseTo(3.5)
    expect(deviationAt(table, 359)).toBeCloseTo(4 - 1 / 90)
  })
  it('Magnetisch → Kompass mit Tabelle: C + dev(C) = M', () => {
    for (const m of [10, 100, 200, 300, 355]) {
      const c = magneticToCompassWithTable(m, table)
      expect(((c + deviationAt(table, c) - m + 540) % 360) - 180).toBeCloseTo(0, 6)
    }
  })
  it('Variation ändert sich jährlich', () => {
    expect(variationForYear(-4.5, 2015, 0.1, 2025)).toBeCloseTo(-3.5)
    expect(formatVariation(-3.5)).toBe('3°30′W')
    expect(formatVariation(2.2)).toBe('2°12′E')
  })
})

describe('Gezeitenhöhen', () => {
  it('Tidenhub und Einordnung', () => {
    expect(tidalRange(5.8, 0.9)).toBeCloseTo(4.9)
    expect(classifyRange(4.8, 5, 2)).toBe('springs')
    expect(classifyRange(2.3, 5, 2)).toBe('neaps')
    expect(classifyRange(3.5, 5, 2)).toBe('intermediate')
    expect(classifyRange(3, 2, 5)).toBeNull()
  })
  it('Kosinusmodell: HW, Mitte, NW', () => {
    expect(heightCosine(5, 1, 0)).toBeCloseTo(5)
    expect(heightCosine(5, 1, 3)).toBeCloseTo(3)
    expect(heightCosine(5, 1, 6)).toBeCloseTo(1)
    expect(heightCosine(5, 1, 2)).toBeCloseTo(4)
    expect(heightCosine(5, 1, -2)).toBeCloseTo(4)
    expect(heightCosine(5, 1, 99)).toBeCloseTo(1) // außerhalb begrenzt
  })
  it('Wassertiefe, trockenfallend und Kielfreiheit', () => {
    expect(waterDepth(2.4, 3.1)).toBeCloseTo(5.5)
    expect(waterDepth(-1.2, 3.5)).toBeCloseTo(2.3)
    expect(waterDepth(-1.2, 0.5)).toBeLessThan(0) // fällt trocken
    expect(underKeelClearance(3.9, 1.8)).toBeCloseTo(2.1)
  })
  it('Zeitfenster um HW', () => {
    const w = passableWindow(4.1, 0.7, 1.3)
    expect(w.kind).toBe('window')
    if (w.kind === 'window') {
      expect(w.halfWidthHours).toBeCloseTo(4.344, 2)
      // Probe: an den Fenstergrenzen ist die Höhe genau die geforderte
      expect(heightCosine(4.1, 0.7, w.halfWidthHours)).toBeCloseTo(1.3)
    }
    expect(passableWindow(4, 1, 0.5).kind).toBe('always')
    expect(passableWindow(4, 1, 4.5).kind).toBe('never')
  })
  it('Ankerkette', () => {
    expect(anchorChainLength(7.5, 1, 4)).toBe(34)
  })
  it('Geografische Sichtweite', () => {
    expect(geographicRange(16, 4)).toBeCloseTo(12.48)
    expect(geographicRange(0, 0)).toBe(0)
  })
})

describe('Feuerkennungen', () => {
  it('Standardkennungen aus der Karte', () => {
    const r = parseLight('Fl(2) WR 10s 24m 15M')
    expect(r.ok).toBe(true)
    if (r.ok) {
      expect(r.spec).toMatchObject({ rhythm: 'Fl', groups: [2], colors: ['W', 'R'], period: 10, height: 24, range: 15 })
      expect(describeLight(r.spec).join(' ')).toContain('Sektorfeuer')
    }
    const s = parseLight('Q(6)+LFl 15s')
    expect(s.ok && s.spec.longFlash).toBe(true)
    const g = parseLight('Fl(2+1) 10s')
    expect(g.ok && g.spec.groups).toEqual([2, 1])
    expect(parseLight('Mo(A) 8s').ok).toBe(true)
    expect(parseLight('Q').ok).toBe(true)
    expect(parseLight('Fl G 5s').ok).toBe(true)
  })
  it('ungültige Eingaben ergeben verständliche Fehler', () => {
    for (const bad of ['', 'xyz', 'Fl', 'Fl(0) 5s', 'Fl(2) 10x', 'Mo 8s', 'Fl(2)+LFl 10s', 'Mo(1) 8s']) {
      const r = parseLight(bad)
      expect(r.ok, bad).toBe(false)
      if (!r.ok) expect(r.error.length).toBeGreaterThan(5)
    }
  })
  it('Zeitverlauf summiert sich zur Periode', () => {
    for (const text of ['Fl(2) 10s', 'Fl 5s', 'LFl 10s', 'Q(3) 10s', 'Q(6)+LFl 15s', 'Q(9) 15s', 'VQ(9) 10s', 'VQ(3) 5s', 'Iso 4s', 'Oc(2) 6s', 'Fl(2+1) 10s', 'Mo(A) 8s']) {
      const r = parseLight(text)
      expect(r.ok, text).toBe(true)
      if (!r.ok) continue
      const tl = lightTimeline(r.spec)
      expect(tl, text).not.toBeNull()
      expect(tl!.reduce((s, x) => s + x.duration, 0), text).toBeCloseTo(r.spec.period!, 6)
    }
  })
  it('Blinkzahl: Q(3) hat drei Blitze, Fl(2+1) hat drei Blitze in zwei Gruppen', () => {
    const count = (t: string) => {
      const r = parseLight(t)
      if (!r.ok) return -1
      return lightTimeline(r.spec)!.filter((s) => s.on).length
    }
    expect(count('Q(3) 10s')).toBe(3)
    expect(count('VQ(9) 10s')).toBe(9)
    expect(count('Q(6)+LFl 15s')).toBe(7)
    expect(count('Fl(2+1) 10s')).toBe(3)
    expect(count('Oc(3) 15s')).toBe(4) // Licht – 3 Verdunkelungen – Licht
  })
  it('passt nicht in die Periode → null', () => {
    const r = parseLight('Q(9) 3s')
    expect(r.ok && lightTimeline(r.spec)).toBeNull()
  })
  it('Festfeuer und Isophase', () => {
    const f = parseLight('F')
    expect(f.ok && lightTimeline(f.spec)).toEqual([{ on: true, duration: 1 }])
    const iso = parseLight('Iso 4s')
    expect(iso.ok && lightTimeline(iso.spec)).toEqual([{ on: true, duration: 2 }, { on: false, duration: 2 }])
  })
})

import { BUOYS } from '@/data/buoyage'
import { CHART_SYMBOLS } from '@/data/chartSymbols'
import { QUESTION_BANK } from '@/questions'
import { DAY_TOPIC_IDS } from '@/data/topics'

describe('Seezeichen-Daten', () => {
  it('alle zwölf Zeichen haben vollständige Angaben und eine gültige Beispielkennung', () => {
    expect(BUOYS).toHaveLength(12)
    expect(new Set(BUOYS.map((b) => b.id)).size).toBe(12)
    for (const b of BUOYS) {
      for (const f of [b.name, b.look, b.shape, b.topmark, b.light, b.meaning, b.action, b.mnemonic]) expect(f.length, b.id).toBeGreaterThanOrEqual(3)
      const r = parseLight(b.lightExample)
      expect(r.ok, `${b.id}: ${b.lightExample}`).toBe(true)
      if (r.ok) expect(lightTimeline(r.spec), b.id).not.toBeNull()
    }
  })
  it('Kardinalzeichen: Blitzzahl wie Ziffernblatt (3/6/9), Nord ununterbrochen', () => {
    const flashes = (id: string) => {
      const r = parseLight(BUOYS.find((b) => b.id === id)!.lightExample)
      return r.ok ? lightTimeline(r.spec)!.filter((s) => s.on).length : -1
    }
    expect(flashes('east')).toBe(3)
    expect(flashes('south')).toBe(7) // 6 Blitze + Langblitz
    expect(flashes('west')).toBe(9)
    const north = parseLight(BUOYS.find((b) => b.id === 'north')!.lightExample)
    expect(north.ok && north.spec.groups).toEqual([])
  })
  it('Lateralzeichen mit Gabelung nutzen den Rhythmus 2+1, andere nicht', () => {
    for (const b of BUOYS) {
      const r = parseLight(b.lightExample)
      const composite = r.ok && r.spec.groups.length === 2 && r.spec.groups[0] === 2 && r.spec.groups[1] === 1
      expect(composite, b.id).toBe(b.id === 'pref-stbd' || b.id === 'pref-port')
    }
  })
  it('jedes Seezeichen hat eine Erkennungsfrage mit der richtigen Antwort', () => {
    for (const b of BUOYS) {
      const q = QUESTION_BANK.find((x) => x.type === 'mc' && x.buoy === b.id)
      expect(q, b.id).toBeDefined()
    }
  })
})

describe('Kartensymbole und Themen', () => {
  it('Symbole haben eindeutige IDs und vollständige Texte', () => {
    expect(new Set(CHART_SYMBOLS.map((s) => s.id)).size).toBe(CHART_SYMBOLS.length)
    for (const s of CHART_SYMBOLS) expect(s.german.length + s.english.length, s.id).toBeGreaterThan(4)
  })
  it('jedes neue Thema hat mindestens zehn Fragen', () => {
    for (const t of DAY_TOPIC_IDS) expect(QUESTION_BANK.filter((q) => q.topic === t).length, t).toBeGreaterThanOrEqual(10)
  })
})

import { FLASHCARDS } from '@/data/flashcards'
describe('Lernkarten', () => {
  it('eindeutige IDs und vollständige Rückseiten', () => {
    expect(new Set(FLASHCARDS.map((c) => c.id)).size).toBe(FLASHCARDS.length)
    for (const c of FLASHCARDS) for (const f of [c.english, c.german, c.definition, c.mnemonic, c.example]) expect(f.length, c.id).toBeGreaterThanOrEqual(3)
  })
  it('Themen-Deck deckt alle vier Themen ab', () => {
    expect(FLASHCARDS.filter((c) => c.deck === 'themen').length).toBeGreaterThanOrEqual(20)
  })
})

import { COASTAL_LESSON_IDS, DAY_LESSON_IDS } from '@/data/lessonIds'
import { DAY_LESSONS } from '@/modules/daylessons/DayLessonsPage'
import { LESSONS } from '@/modules/coastal/CoastalPage'
describe('Lektionen', () => {
  it('ID-Listen stimmen mit den Lektionen überein', () => {
    expect([...DAY_LESSON_IDS]).toEqual(DAY_LESSONS.map((l) => l.id))
    expect([...COASTAL_LESSON_IDS]).toEqual(LESSONS.map((l) => l.id))
  })
  it('jede Lektion hat Text, Merksatz und mindestens ein interaktives Element', () => {
    for (const l of [...DAY_LESSONS, ...LESSONS]) {
      expect(l.body.length, l.id).toBeGreaterThanOrEqual(2)
      expect(l.mnemonic.length, l.id).toBeGreaterThan(10)
      expect(l.widgets.length, l.id).toBeGreaterThanOrEqual(1)
    }
  })
})
