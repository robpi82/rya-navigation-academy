/**
 * Natürlich gegliederte Küstenlinien aus wenigen Ankerpunkten: rekursive Mittelpunktverschiebung mit festem
 * Startwert (immer dasselbe Ergebnis). Ankerpunkte bleiben exakt erhalten; in der Nähe geschützter Punkte (Häfen,
 * Landmarken) wird nicht verschoben, damit Aufgabenobjekte ihre Lage zur Küste behalten.
 */

type Pt = [number, number] // [lon, lat]

/** Kleiner, reproduzierbarer Zufallsgenerator (mulberry32). */
export function rng(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface RefineOptions {
  seed: number
  /** Rekursionstiefe (jede Stufe halbiert die Segmente) */
  levels: number
  /** Verschiebung relativ zur Segmentlänge */
  amplitude: number
  /** Punkte, um die herum die Küste unverändert bleibt */
  protect?: Pt[]
  /** Schutzradius in Grad Breite */
  protectRadius?: number
  /** Segmente, die nicht verfeinert werden (z. B. Kanten jenseits des Kartenrands) */
  keep?: (a: Pt, b: Pt) => boolean
}

export function refineOutline(anchors: Pt[], o: RefineOptions): Pt[] {
  const rand = rng(o.seed)
  const lat0 = anchors.reduce((s, p) => s + p[1], 0) / anchors.length
  const cos = Math.cos((lat0 * Math.PI) / 180)
  const protectedNear = (p: Pt) =>
    (o.protect ?? []).some((q) => Math.hypot((p[0] - q[0]) * cos, p[1] - q[1]) < (o.protectRadius ?? 0))

  const split = (a: Pt, b: Pt, level: number, out: Pt[]) => {
    if (level === 0) return
    const mid: Pt = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2]
    // senkrecht zur Segmentrichtung im lokal winkeltreuen System verschieben
    const dx = (b[0] - a[0]) * cos
    const dy = b[1] - a[1]
    const len = Math.hypot(dx, dy)
    const r = rand() * 2 - 1
    if (len > 0 && !protectedNear(mid) && !protectedNear(a) && !protectedNear(b)) {
      const off = r * o.amplitude * len
      mid[0] += ((-dy / len) * off) / cos
      mid[1] += (dx / len) * off
    }
    split(a, mid, level - 1, out)
    out.push(mid)
    split(mid, b, level - 1, out)
  }

  const out: Pt[] = []
  for (let i = 0; i < anchors.length; i++) {
    const a = anchors[i]
    const b = anchors[(i + 1) % anchors.length]
    out.push(a)
    if (!o.keep?.(a, b)) split(a, b, o.levels, out)
  }
  return out
}
