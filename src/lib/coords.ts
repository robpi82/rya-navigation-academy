/** Positionsangaben in Grad und Dezimalminuten, wie in der Seekarte üblich (z. B. 50°46,5′N 001°18,0′W). */

export function formatLat(lat: number, decimals = 1): string {
  const a = Math.abs(lat)
  let d = Math.floor(a)
  let m = Number(((a - d) * 60).toFixed(decimals))
  if (m >= 60) {
    d += 1
    m = 0
  }
  return `${d}°${m.toFixed(decimals).replace('.', ',').padStart(decimals ? 3 + decimals : 2, '0')}′${lat >= 0 ? 'N' : 'S'}`
}

export function formatLon(lon: number, decimals = 1): string {
  const a = Math.abs(lon)
  let d = Math.floor(a)
  let m = Number(((a - d) * 60).toFixed(decimals))
  if (m >= 60) {
    d += 1
    m = 0
  }
  return `${String(d).padStart(3, '0')}°${m.toFixed(decimals).replace('.', ',').padStart(decimals ? 3 + decimals : 2, '0')}′${lon >= 0 ? 'E' : 'W'}`
}

/** Grad und Minuten → Dezimalgrad (Süd- und Westwerte negativ) */
export const dm = (deg: number, min: number, hemi: 'N' | 'S' | 'E' | 'W'): number => (hemi === 'S' || hemi === 'W' ? -1 : 1) * (deg + min / 60)
