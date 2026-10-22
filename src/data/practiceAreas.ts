import type { LatLon } from '@/types/navigation'

/**
 * Reale Übungsgebiete (WGS84). Mittelpunkt, Zoomstufe und Grenzen bestimmen nur den Kartenausschnitt –
 * Karteninhalte kommen von den Kartenanbietern (siehe config/mapProviders.ts).
 */
export interface PracticeArea {
  id: string
  name: string
  country: string
  center: LatLon
  /** Zoomstufe der Webkarte (Web-Mercator-Kachelschema) */
  zoom: number
  bounds: { south: number; west: number; north: number; east: number }
  description: string
}

export const PRACTICE_AREAS: PracticeArea[] = [
  {
    id: 'solent',
    name: 'Solent / Isle of Wight',
    country: 'England',
    center: { lat: 50.68, lon: -1.35 },
    zoom: 10,
    bounds: { south: 50.5, west: -1.8, north: 50.9, east: -0.95 },
    description: 'Klassisches RYA-Ausbildungsrevier mit starken Gezeitenströmen, viel Verkehr und dichtem Tonnensystem.',
  },
  {
    id: 'plymouth',
    name: 'Plymouth und Umgebung',
    country: 'England',
    center: { lat: 50.33, lon: -4.16 },
    zoom: 12,
    bounds: { south: 50.22, west: -4.4, north: 50.42, east: -3.95 },
    description: 'Plymouth Sound mit Wellenbrecher, Flussmündungen von Tamar und Plym, Marinehafen.',
  },
  {
    id: 'portsmouth',
    name: 'Portsmouth Harbour',
    country: 'England',
    center: { lat: 50.79, lon: -1.11 },
    zoom: 13,
    bounds: { south: 50.72, west: -1.18, north: 50.85, east: -1.04 },
    description: 'Enge Hafeneinfahrt mit Fähr- und Marineverkehr, Small Boat Channel, Ansteuerung über Spithead.',
  },
  {
    id: 'vigo',
    name: 'Baiona und Ría de Vigo',
    country: 'Spanien',
    center: { lat: 42.19, lon: -8.8 },
    zoom: 11,
    bounds: { south: 42.05, west: -9.0, north: 42.32, east: -8.6 },
    description: 'Atlantik-Ría mit den Islas Cíes, Ansteuerung von Baiona und Vigo.',
  },
  {
    id: 'kiel',
    name: 'Kieler Förde',
    country: 'Deutschland',
    center: { lat: 54.41, lon: 10.2 },
    zoom: 11,
    bounds: { south: 54.3, west: 10.08, north: 54.52, east: 10.32 },
    description: 'Gezeitenarmes Ostseerevier mit Fahrwasser zum Nord-Ostsee-Kanal, Sperrgebieten und dichtem Verkehr.',
  },
]

export const AREA_BY_ID: Record<string, PracticeArea> = Object.fromEntries(PRACTICE_AREAS.map((a) => [a.id, a]))
