import type { LatLon } from '@/types/navigation'

/**
 * Fiktives Übungsrevier „Nordbucht" – synthetisch erstellt, geografisch und mathematisch konsistent
 * (WGS84-Koordinaten, Mercatorprojektion), aber KEINE reale Seekarte und nicht zur Navigation geeignet.
 */

export const CHART_BOUNDS = { north: 50.84, south: 50.56, west: -1.72, east: -0.92 }

export interface LandArea {
  name: string
  /** Polygon als [lon, lat] */
  outline: [number, number][]
}

export const LAND: LandArea[] = [
  {
    name: 'Festland',
    outline: [
      [-1.75, 50.80], [-1.66, 50.795], [-1.6, 50.787], [-1.55, 50.776], [-1.51, 50.778], [-1.475, 50.768],
      [-1.455, 50.757], [-1.44, 50.759], [-1.425, 50.771], [-1.38, 50.779], [-1.335, 50.787], [-1.315, 50.784],
      [-1.305, 50.79], [-1.29, 50.784], [-1.25, 50.794], [-1.2, 50.789], [-1.16, 50.786], [-1.12, 50.792],
      [-1.07, 50.801], [-1.01, 50.806], [-0.95, 50.812], [-0.9, 50.815], [-0.9, 50.9], [-1.75, 50.9],
    ],
  },
  {
    name: 'Insel Kranich',
    outline: [
      [-1.405, 50.622], [-1.385, 50.636], [-1.36, 50.646], [-1.33, 50.652], [-1.3, 50.656], [-1.27, 50.654],
      [-1.24, 50.65], [-1.215, 50.641], [-1.2, 50.629], [-1.21, 50.615], [-1.235, 50.604], [-1.27, 50.597],
      [-1.31, 50.596], [-1.35, 50.601], [-1.385, 50.61],
    ],
  },
  {
    name: 'Grauer Stein',
    outline: [[-1.153, 50.699], [-1.147, 50.7], [-1.145, 50.696], [-1.151, 50.694], [-1.155, 50.696]],
  },
]

export type MarkKind = 'lighthouse' | 'church' | 'mast' | 'daymark' | 'harbour' | 'buoy-north' | 'buoy-south' | 'buoy-safe' | 'danger'

export interface ChartMark {
  id: string
  name: string
  kind: MarkKind
  pos: LatLon
  /** Kennung/Beschreibung, wie sie in der Karte steht */
  note?: string
}

export const MARKS: ChartMark[] = [
  { id: 'lt-moewe', name: 'Lt. Kap Möwe', kind: 'lighthouse', pos: { lat: 50.762, lon: -1.452 }, note: 'Fl(2) 10s 24m 15M' },
  { id: 'ch-ankerstedt', name: 'Kirche Ankerstedt', kind: 'church', pos: { lat: 50.8, lon: -1.3 } },
  { id: 'mast-nordhoehe', name: 'Funkmast Nordhöhe', kind: 'mast', pos: { lat: 50.802, lon: -1.15 }, note: 'Fl R 3s 120m' },
  { id: 'lt-kranich', name: 'Lt. Kranich West', kind: 'lighthouse', pos: { lat: 50.624, lon: -1.398 }, note: 'Iso WR 6s 18m 12M' },
  { id: 'dm-kranich', name: 'Tagesmarke Kranich Ost', kind: 'daymark', pos: { lat: 50.633, lon: -1.208 } },
  { id: 'hb-ankerstedt', name: 'Hafen Ankerstedt', kind: 'harbour', pos: { lat: 50.781, lon: -1.305 } },
  { id: 'hb-kranich', name: 'Inselhafen Kranich', kind: 'harbour', pos: { lat: 50.659, lon: -1.3 } },
  { id: 'by-riff', name: 'Riff Nord', kind: 'buoy-north', pos: { lat: 50.709, lon: -1.15 }, note: 'Q' },
  { id: 'by-moewe', name: 'Kap Möwe Süd', kind: 'buoy-south', pos: { lat: 50.742, lon: -1.455 }, note: 'Q(6)+LFl 15s' },
  { id: 'by-anst', name: 'Ansteuerung Ankerstedt', kind: 'buoy-safe', pos: { lat: 50.765, lon: -1.305 }, note: 'LFl 10s' },
  { id: 'dg-stein', name: 'Grauer Stein', kind: 'danger', pos: { lat: 50.697, lon: -1.15 }, note: 'trockenfallend 1,2 m' },
]

export const MARK_BY_ID: Record<string, ChartMark> = Object.fromEntries(MARKS.map((m) => [m.id, m]))

/** Gezeitenstrom-Tabellen (Tidal Diamonds), bezogen auf HW Ankerstedt. */
export interface TidalDiamond {
  id: 'A' | 'B' | 'C'
  pos: LatLon
  /** 13 Zeilen: HW−6 … HW … HW+6 */
  rows: { set: number; spring: number; neap: number }[]
}

const r = (set: number, spring: number, neap: number) => ({ set, spring, neap })

export const TIDAL_DIAMONDS: TidalDiamond[] = [
  {
    id: 'A',
    pos: { lat: 50.72, lon: -1.42 },
    rows: [r(265, 1.2, 0.6), r(270, 0.6, 0.3), r(80, 0.4, 0.2), r(85, 1.4, 0.7), r(90, 2.2, 1.1), r(92, 2.6, 1.3), r(95, 2.4, 1.2), r(95, 1.6, 0.8), r(100, 0.6, 0.3), r(270, 0.8, 0.4), r(268, 1.8, 0.9), r(265, 2.4, 1.2), r(262, 1.8, 0.9)],
  },
  {
    id: 'B',
    pos: { lat: 50.735, lon: -1.2 },
    rows: [r(255, 1.0, 0.5), r(250, 0.4, 0.2), r(70, 0.6, 0.3), r(75, 1.6, 0.8), r(78, 2.0, 1.0), r(80, 2.2, 1.1), r(82, 1.8, 0.9), r(85, 1.0, 0.5), r(240, 0.3, 0.2), r(255, 1.2, 0.6), r(258, 1.9, 1.0), r(256, 2.0, 1.0), r(254, 1.5, 0.8)],
  },
  {
    id: 'C',
    pos: { lat: 50.685, lon: -1.32 },
    rows: [r(275, 1.6, 0.8), r(280, 0.8, 0.4), r(100, 0.5, 0.3), r(100, 1.8, 0.9), r(102, 2.8, 1.4), r(104, 3.2, 1.6), r(105, 2.8, 1.4), r(106, 1.8, 0.9), r(110, 0.6, 0.3), r(280, 1.0, 0.5), r(282, 2.2, 1.1), r(280, 2.9, 1.4), r(278, 2.2, 1.1)],
  },
]

/** Standardhafen Ankerstedt: mittlere Tidenhübe */
export const STANDARD_PORT = { name: 'Ankerstedt', springRange: 4.0, neapRange: 2.0 }

export const hourLabel = (offset: number) => (offset === 0 ? 'HW' : `HW${offset > 0 ? '+' : '−'}${Math.abs(offset)}`)
