/**
 * Zentrale Konfiguration der Kartenanbieter. Die Anwendung kennt nur diese Datensätze – Tile-URLs, Quellenangaben
 * und Zoomgrenzen stehen ausschließlich hier. Für eine Veröffentlichung lassen sich alle Werte über Umgebungsvariablen
 * beim Build ersetzen (z. B. kommerzieller Kachelanbieter oder eigener Tile-Server), ohne Code zu ändern:
 *
 *   VITE_BASEMAP_URL, VITE_BASEMAP_ATTRIBUTION, VITE_BASEMAP_MAX_ZOOM
 *   VITE_SEAMARK_URL, VITE_SEAMARK_ATTRIBUTION
 *   VITE_BATHYMETRY_URL, VITE_BATHYMETRY_ATTRIBUTION, VITE_BATHYMETRY_WMS_LAYERS (gesetzt → WMS statt XYZ)
 */

export interface TileProvider {
  id: 'basemap' | 'seamarks' | 'bathymetry'
  name: string
  kind: 'xyz' | 'wms'
  /** XYZ-Vorlage mit {z}/{x}/{y} bzw. WMS-Basis-URL */
  url: string
  /** Quellenangabe (HTML), erscheint dauerhaft in der Karte */
  attribution: string
  maxZoom: number
  /** höchste Zoomstufe, für die der Server Kacheln liefert (darüber wird vergrößert) */
  maxNativeZoom: number
  minZoom: number
  wmsLayers?: string
  /** Hinweis zu Nutzungsbedingungen */
  usage: string
  /** true, wenn der Dienst laut seinen Bedingungen für eine kommerzielle App mit vielen Nutzern geeignet ist */
  productionReady: boolean
}

export interface MapProviderConfig {
  basemap: TileProvider
  seamarks: TileProvider
  /** null: keine rechtmäßig nutzbare Tiefendatenquelle konfiguriert */
  bathymetry: TileProvider | null
}

export const OSM_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>-Mitwirkende'
export const OPENSEAMAP_ATTRIBUTION = 'Seezeichen &copy; <a href="https://www.openseamap.org" target="_blank" rel="noopener">OpenSeaMap</a>-Mitwirkende'

export const DEFAULT_PROVIDERS: MapProviderConfig = {
  basemap: {
    id: 'basemap',
    name: 'OpenStreetMap',
    kind: 'xyz',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: OSM_ATTRIBUTION,
    minZoom: 3,
    maxZoom: 18,
    maxNativeZoom: 19,
    usage:
      'Öffentlicher Tile-Server der OSM Foundation: nur für geringe Last, gültiger Referer bzw. User-Agent nötig, kein Massen- oder Offline-Download. Für eine App mit vielen Nutzern nicht vorgesehen (tile usage policy).',
    productionReady: false,
  },
  seamarks: {
    id: 'seamarks',
    name: 'OpenSeaMap-Seezeichen',
    kind: 'xyz',
    url: 'https://t1.openseamap.org/seamark/{z}/{x}/{y}.png',
    attribution: OPENSEAMAP_ATTRIBUTION,
    minZoom: 3,
    maxZoom: 18,
    maxNativeZoom: 18,
    usage: 'Freiwillig betriebener Dienst ohne Verfügbarkeitszusage; vor kommerzieller Nutzung mit OpenSeaMap abstimmen oder Seezeichen-Kacheln selbst rendern (Daten: OSM, ODbL).',
    productionReady: false,
  },
  bathymetry: null,
}

type Env = Record<string, string | boolean | undefined>

const str = (env: Env, key: string): string | undefined => {
  const v = env[key]
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

/** Liest Überschreibungen aus den Build-Umgebungsvariablen. Ohne Angaben gelten die öffentlichen Dienste. */
export function resolveMapProviders(env: Env): MapProviderConfig {
  const basemapUrl = str(env, 'VITE_BASEMAP_URL')
  const seamarkUrl = str(env, 'VITE_SEAMARK_URL')
  const bathyUrl = str(env, 'VITE_BATHYMETRY_URL')
  const basemapMax = Number(str(env, 'VITE_BASEMAP_MAX_ZOOM'))
  const custom = (p: TileProvider, url: string | undefined, attribution: string | undefined): TileProvider =>
    url ? { ...p, url, attribution: attribution ?? p.attribution, usage: 'Eigener bzw. vertraglich vereinbarter Kachelanbieter (Build-Konfiguration).', productionReady: true } : p

  const basemap = custom(DEFAULT_PROVIDERS.basemap, basemapUrl, str(env, 'VITE_BASEMAP_ATTRIBUTION'))
  if (basemapUrl && Number.isFinite(basemapMax) && basemapMax > 0) basemap.maxNativeZoom = basemapMax

  const wmsLayers = str(env, 'VITE_BATHYMETRY_WMS_LAYERS')
  const bathymetry: TileProvider | null = bathyUrl
    ? {
        id: 'bathymetry',
        name: 'Tiefendaten',
        kind: wmsLayers ? 'wms' : 'xyz',
        url: bathyUrl,
        wmsLayers,
        attribution: str(env, 'VITE_BATHYMETRY_ATTRIBUTION') ?? 'Tiefendaten: siehe Anbieter',
        minZoom: 3,
        maxZoom: 18,
        maxNativeZoom: 18,
        usage: 'Über die Build-Konfiguration eingebundene Tiefendatenquelle.',
        productionReady: true,
      }
    : null

  return { basemap, seamarks: custom(DEFAULT_PROVIDERS.seamarks, seamarkUrl, str(env, 'VITE_SEAMARK_ATTRIBUTION')), bathymetry }
}

export const MAP_PROVIDERS: MapProviderConfig = resolveMapProviders(import.meta.env as Env)

/** Dauerhafter Hinweis in jeder Kartenansicht */
export const NAV_DISCLAIMER = 'Nur für Ausbildungszwecke – nicht zur realen Navigation geeignet.'
