/** Sicherung und Wiederherstellung des Lernstands (alle LocalStorage-Einträge der App). */
export const BACKUP_PREFIXES = ['rya-nav-academy:', 'rya-exam']
export const BACKUP_FORMAT = 'rya-navigation-academy-backup'

export interface Backup {
  format: typeof BACKUP_FORMAT
  version: 1
  createdAt: string
  /** Rohwerte (JSON-Strings) je LocalStorage-Schlüssel */
  data: Record<string, string>
}

type StorageLike = Pick<Storage, 'length' | 'key' | 'getItem'>

const isAppKey = (k: string) => BACKUP_PREFIXES.some((p) => k.startsWith(p))

export function buildBackup(storage: StorageLike, now: Date = new Date()): Backup {
  const data: Record<string, string> = {}
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i)
    const v = k ? storage.getItem(k) : null
    if (k && v !== null && isAppKey(k)) data[k] = v
  }
  return { format: BACKUP_FORMAT, version: 1, createdAt: now.toISOString(), data }
}

export type ParseResult = { ok: true; backup: Backup } | { ok: false; error: string }

/** Prüft eine Sicherungsdatei streng: Format, Version, nur bekannte Schlüssel, Werte müssen gültiges JSON sein. */
export function parseBackup(text: string): ParseResult {
  let raw: unknown
  try {
    raw = JSON.parse(text)
  } catch {
    return { ok: false, error: 'Die Datei ist kein gültiges JSON.' }
  }
  if (typeof raw !== 'object' || raw === null) return { ok: false, error: 'Unbekanntes Dateiformat.' }
  const b = raw as Partial<Backup>
  if (b.format !== BACKUP_FORMAT) return { ok: false, error: 'Das ist keine Sicherung der RYA Navigation Academy.' }
  if (b.version !== 1) return { ok: false, error: 'Diese Sicherungsversion wird nicht unterstützt.' }
  if (typeof b.data !== 'object' || b.data === null || Array.isArray(b.data)) return { ok: false, error: 'Die Sicherung enthält keine Daten.' }
  const entries = Object.entries(b.data)
  if (entries.length === 0) return { ok: false, error: 'Die Sicherung ist leer.' }
  for (const [k, v] of entries) {
    if (!isAppKey(k)) return { ok: false, error: `Unerwarteter Eintrag „${k}“.` }
    if (typeof v !== 'string') return { ok: false, error: `Eintrag „${k}“ ist ungültig.` }
    try {
      JSON.parse(v)
    } catch {
      return { ok: false, error: `Eintrag „${k}“ ist beschädigt.` }
    }
  }
  return { ok: true, backup: { format: BACKUP_FORMAT, version: 1, createdAt: String(b.createdAt ?? ''), data: b.data as Record<string, string> } }
}

/** Ersetzt den gespeicherten Lernstand durch die Sicherung (nur App-Schlüssel werden angefasst). */
export function applyBackup(storage: Pick<Storage, 'length' | 'key' | 'getItem' | 'setItem' | 'removeItem'>, backup: Backup): void {
  const existing: string[] = []
  for (let i = 0; i < storage.length; i++) {
    const k = storage.key(i)
    if (k && isAppKey(k)) existing.push(k)
  }
  for (const k of existing) storage.removeItem(k)
  for (const [k, v] of Object.entries(backup.data)) storage.setItem(k, v)
}

/** Kurzfassung für die Bestätigung vor dem Import. */
export function summarizeBackup(b: Backup): { questions: number; attempts: number; cards: number } {
  const read = (key: string) => {
    try {
      return (JSON.parse(b.data[key] ?? 'null') as { state?: Record<string, unknown> } | null)?.state ?? {}
    } catch {
      return {}
    }
  }
  const progress = read('rya-nav-academy:progress')
  const cards = read('rya-nav-academy:flashcards')
  return {
    questions: Object.keys((progress.questionStats as object) ?? {}).length,
    attempts: Array.isArray(progress.attempts) ? progress.attempts.length : 0,
    cards: Object.keys((cards.cards as object) ?? {}).length,
  }
}
