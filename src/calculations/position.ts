import type { LatLon, Vector2 } from '@/types/navigation'
import { degToRad } from './angles'

/**
 * Versetzt eine Position um einen Vektor in NM (x = Ost, y = Nord) – Mittelbreitenverfahren,
 * für die kurzen Distanzen der Küstennavigation ausreichend genau.
 * 1' Breite = 1 NM; 1' Länge = cos(φ) NM.
 */
export function offsetPosition(start: LatLon, offsetNm: Vector2): LatLon {
  const dLat = offsetNm.y / 60
  const midLat = start.lat + dLat / 2
  const dLon = offsetNm.x / (60 * Math.cos(degToRad(midLat)))
  return { lat: start.lat + dLat, lon: start.lon + dLon }
}

/** Formatiert eine Breite/Länge als Grad und Dezimalminuten, z. B. 50°45,20'N */
export function formatLatLon(pos: LatLon): string {
  const fmt = (v: number, pos: string, neg: string, degDigits: number) => {
    const abs = Math.abs(v)
    let d = Math.floor(abs)
    let m = Math.round((abs - d) * 60 * 100) / 100
    if (m >= 60) {
      d += 1
      m -= 60
    }
    return `${d.toString().padStart(degDigits, '0')}°${m.toFixed(2).replace('.', ',').padStart(5, '0')}'${v >= 0 ? pos : neg}`
  }
  return `${fmt(pos.lat, 'N', 'S', 2)} ${fmt(pos.lon, 'E', 'W', 3)}`
}
