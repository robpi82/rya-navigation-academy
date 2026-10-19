/**
 * Feuerkennungen aus der Seekarte lesen: „Fl(2) WR 10s 24m 15M", „Q(6)+LFl 15s", „Iso 4s" …
 * Parser, deutsche Beschreibung und Zeitverlauf (für die Animation).
 */
export type Rhythm = 'F' | 'Fl' | 'LFl' | 'Q' | 'VQ' | 'Iso' | 'Oc' | 'Mo'

export interface LightSpec {
  rhythm: Rhythm
  /** Gruppen, z. B. Fl(2+1) → [2, 1]; leer = ungruppiert */
  groups: number[]
  /** Q(6)+LFl: zusätzlicher langer Blitz am Ende der Gruppe */
  longFlash: boolean
  morse?: string
  colors: string[]
  period?: number
  height?: number
  range?: number
}

export type ParseResult = { ok: true; spec: LightSpec } | { ok: false; error: string }

const COLORS: Record<string, string> = { W: 'weiß', R: 'rot', G: 'grün', Y: 'gelb', Bu: 'blau', Vi: 'violett', Or: 'orange' }
export const LIGHT_CSS_COLOR: Record<string, string> = { W: '#fff7c2', R: '#ff3b30', G: '#34c759', Y: '#ffd60a', Bu: '#3b82f6', Vi: '#a855f7', Or: '#ff9500' }

const NAMES: Record<Rhythm, string> = {
  F: 'Festfeuer (dauernd leuchtend)',
  Fl: 'Blinkfeuer (Licht kürzer als Dunkelheit)',
  LFl: 'Langblinkfeuer (Blitz ≥ 2 s)',
  Q: 'Funkelfeuer (50–79 Blitze/min)',
  VQ: 'Schnelles Funkelfeuer (80–159 Blitze/min)',
  Iso: 'Gleichtaktfeuer (Licht und Dunkelheit gleich lang)',
  Oc: 'Unterbrochenes Feuer (Licht länger als Dunkelheit)',
  Mo: 'Morsefeuer',
}

const MORSE: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....', I: '..', J: '.---', K: '-.-', L: '.-..', M: '--',
  N: '-.', O: '---', P: '.--.', Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-', Y: '-.--', Z: '--..',
}

export function parseLight(input: string): ParseResult {
  const text = input.trim().replace(/\s+/g, ' ')
  if (!text) return { ok: false, error: 'Bitte eine Kennung eingeben, z. B. Fl(2) 10s' }
  const m = /^(LFl|Fl|VQ|Iso|Oc|Mo|Q|F)(?:\(([^)]*)\))?(\+LFl)?(.*)$/.exec(text)
  if (!m) return { ok: false, error: `„${text}" beginnt mit keiner bekannten Kennung (F, Fl, LFl, Q, VQ, Iso, Oc, Mo).` }
  const rhythm = m[1] as Rhythm
  const inner = m[2]
  const spec: LightSpec = { rhythm, groups: [], longFlash: !!m[3], colors: [] }
  if (inner !== undefined) {
    if (rhythm === 'Mo') {
      const letter = inner.trim().toUpperCase()
      if (!MORSE[letter]) return { ok: false, error: `Mo(${inner}) – ungültiger Morsebuchstabe.` }
      spec.morse = letter
    } else {
      const parts = inner.split('+').map((p) => Number(p))
      if (parts.some((n) => !Number.isInteger(n) || n < 1 || n > 12)) return { ok: false, error: `Ungültige Gruppe „(${inner})" – erwartet z. B. (2) oder (2+1).` }
      spec.groups = parts
    }
  } else if (rhythm === 'Mo') return { ok: false, error: 'Mo braucht einen Buchstaben, z. B. Mo(A).' }
  if (spec.longFlash && rhythm !== 'Q' && rhythm !== 'VQ') return { ok: false, error: '„+LFl" gibt es nur bei Q und VQ (Südtonne).' }

  for (const tok of m[4].split(' ').filter(Boolean)) {
    let t = /^(\d+(?:[.,]\d+)?)s$/.exec(tok)
    if (t) spec.period = Number(t[1].replace(',', '.'))
    else if ((t = /^(\d+(?:[.,]\d+)?)m$/.exec(tok))) spec.height = Number(t[1].replace(',', '.'))
    else if ((t = /^(\d+)M$/.exec(tok))) spec.range = Number(t[1])
    else if (/^(?:W|R|G|Y|Bu|Vi|Or)+$/.test(tok)) spec.colors = tok.match(/W|R|G|Y|Bu|Vi|Or/g) ?? []
    else return { ok: false, error: `„${tok}" nicht verständlich (erwartet Farbe, z. B. W, Periode 10s, Höhe 24m oder Reichweite 15M).` }
  }
  if (rhythm !== 'F' && rhythm !== 'Q' && rhythm !== 'VQ' && !spec.period) return { ok: false, error: 'Es fehlt die Periode (z. B. 10s).' }
  if ((rhythm === 'Q' || rhythm === 'VQ') && spec.groups.length > 0 && !spec.period) return { ok: false, error: 'Gruppierte Funkelfeuer brauchen eine Periode (z. B. 10s).' }
  if (spec.colors.length === 0 && rhythm !== 'F') spec.colors = ['W']
  if (spec.colors.length === 0) spec.colors = ['W']
  return { ok: true, spec }
}

export function describeLight(spec: LightSpec): string[] {
  const out: string[] = [NAMES[spec.rhythm]]
  if (spec.morse) out.push(`Morsebuchstabe ${spec.morse} (${MORSE[spec.morse].replace(/\./g, '·').replace(/-/g, '–')})`)
  if (spec.groups.length === 1) out.push(`Gruppe von ${spec.groups[0]} ${spec.rhythm === 'Oc' ? 'Verdunkelungen' : 'Blitzen'}`)
  if (spec.groups.length > 1) out.push(`Zusammengesetzte Gruppe: ${spec.groups.join(' + ')} (mit größerer Pause zwischen den Teilgruppen)`)
  if (spec.longFlash) out.push('danach ein Langblitz (typisch für Südtonnen)')
  if (spec.period) out.push(`Periode: ${spec.period} s (bis sich das Bild wiederholt)`)
  const names = spec.colors.map((c) => COLORS[c])
  out.push(names.length > 1 ? `Farben: ${names.join(' und ')} (Sektorfeuer – Farbe hängt von der Peilrichtung ab)` : `Farbe: ${names[0]}`)
  if (spec.height !== undefined) out.push(`Feuerhöhe: ${spec.height} m über MHWS (mittleres Springhochwasser)`)
  if (spec.range !== undefined) out.push(`Nominelle Tragweite: ${spec.range} Seemeilen`)
  return out
}

export interface LightSegment {
  on: boolean
  duration: number
}

const FLASH = { Fl: [0.6, 1.0], Q: [0.2, 0.4], VQ: [0.15, 0.3], LFl: [2.0, 1.2] } as const
const SUBGROUP_GAP = 1.5
const MORSE_DOT = 0.4
const MORSE_DASH = 1.2

/** Zeitverlauf einer Periode (Segmente an/aus). null, wenn die Kennung nicht in die Periode passt. */
export function lightTimeline(spec: LightSpec): LightSegment[] | null {
  const seg: LightSegment[] = []
  const on = (d: number) => seg.push({ on: true, duration: d })
  const off = (d: number) => seg.push({ on: false, duration: d })
  const total = () => seg.reduce((s, x) => s + x.duration, 0)
  let period = spec.period

  switch (spec.rhythm) {
    case 'F':
      return [{ on: true, duration: 1 }]
    case 'Iso':
      on(period! / 2)
      off(period! / 2)
      return seg
    case 'Oc': {
      const groups = spec.groups.length ? spec.groups : [1]
      groups.forEach((n, gi) => {
        if (gi > 0) on(SUBGROUP_GAP)
        for (let i = 0; i < n; i++) {
          on(0.8)
          off(0.8)
        }
      })
      break
    }
    case 'Mo': {
      const code = MORSE[spec.morse!]
      for (let i = 0; i < code.length; i++) {
        on(code[i] === '.' ? MORSE_DOT : MORSE_DASH)
        if (i < code.length - 1) off(MORSE_DOT)
      }
      break
    }
    default: {
      const kind = spec.rhythm === 'Fl' || spec.rhythm === 'LFl' || spec.rhythm === 'Q' || spec.rhythm === 'VQ' ? spec.rhythm : 'Fl'
      const [fl, gap] = FLASH[kind]
      if (!spec.groups.length && !spec.longFlash && !period) {
        // ungruppiertes Q/VQ ohne Periode: fortlaufendes Funkeln
        const cycle = kind === 'Q' ? 1.0 : 0.6
        on(fl)
        off(cycle - fl)
        return seg
      }
      const groups = spec.groups.length ? spec.groups : [1]
      groups.forEach((n, gi) => {
        if (gi > 0) off(SUBGROUP_GAP - gap)
        for (let i = 0; i < n; i++) {
          on(fl)
          if (i < n - 1) off(gap)
        }
        if (gi < groups.length - 1) off(gap)
      })
      if (spec.longFlash) {
        off(1.2)
        on(FLASH.LFl[0])
      }
    }
  }
  if (!period) period = total() + 1
  const rest = period - total()
  if (rest < -1e-9) return null
  if (spec.rhythm === 'Oc') {
    // Oc: nach der Gruppe wieder Licht
    on(Math.max(0, rest))
  } else if (rest > 1e-9) off(rest)
  return seg.filter((s) => s.duration > 1e-9)
}
