import { describe, expect, it } from 'vitest'
import { BACKUP_FORMAT, applyBackup, buildBackup, parseBackup, summarizeBackup } from '@/lib/backup'

class MemoryStorage {
  private m = new Map<string, string>()
  get length() { return this.m.size }
  key(i: number) { return [...this.m.keys()][i] ?? null }
  getItem(k: string) { return this.m.get(k) ?? null }
  setItem(k: string, v: string) { this.m.set(k, v) }
  removeItem(k: string) { this.m.delete(k) }
}

const filled = () => {
  const s = new MemoryStorage()
  s.setItem('rya-nav-academy:progress', JSON.stringify({ state: { questionStats: { a: {}, b: {} }, attempts: [{}] }, version: 1 }))
  s.setItem('rya-nav-academy:flashcards', JSON.stringify({ state: { cards: { x: {} } }, version: 1 }))
  s.setItem('rya-exam', JSON.stringify({ state: { session: null }, version: 1 }))
  s.setItem('fremd', '"nicht anfassen"')
  return s
}

describe('Sicherung', () => {
  it('sichert nur App-Schlüssel', () => {
    const b = buildBackup(filled(), new Date('2026-01-02T03:04:05Z'))
    expect(Object.keys(b.data).sort()).toEqual(['rya-exam', 'rya-nav-academy:flashcards', 'rya-nav-academy:progress'])
    expect(b.createdAt).toBe('2026-01-02T03:04:05.000Z')
  })
  it('Rundreise: sichern, löschen, wiederherstellen', () => {
    const src = filled()
    const parsed = parseBackup(JSON.stringify(buildBackup(src)))
    expect(parsed.ok).toBe(true)
    const dst = new MemoryStorage()
    dst.setItem('rya-nav-academy:settings', '{"alt":1}')
    dst.setItem('fremd', '"bleibt"')
    if (parsed.ok) applyBackup(dst, parsed.backup)
    expect(dst.getItem('rya-nav-academy:progress')).toBe(src.getItem('rya-nav-academy:progress'))
    expect(dst.getItem('rya-nav-academy:settings')).toBeNull()
    expect(dst.getItem('fremd')).toBe('"bleibt"')
  })
  it('lehnt ungültige Dateien ab', () => {
    expect(parseBackup('kein json').ok).toBe(false)
    expect(parseBackup('42').ok).toBe(false)
    expect(parseBackup(JSON.stringify({ format: 'anderes', version: 1, data: {} })).ok).toBe(false)
    expect(parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 2, data: { 'rya-exam': '{}' } })).ok).toBe(false)
    expect(parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 1, data: {} })).ok).toBe(false)
    expect(parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 1, data: { evil: '{}' } })).ok).toBe(false)
    expect(parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 1, data: { 'rya-exam': '{kaputt' } })).ok).toBe(false)
    expect(parseBackup(JSON.stringify({ format: BACKUP_FORMAT, version: 1, data: { 'rya-exam': 5 } })).ok).toBe(false)
  })
  it('fasst Inhalte zusammen', () => {
    const r = parseBackup(JSON.stringify(buildBackup(filled())))
    if (!r.ok) throw new Error()
    expect(summarizeBackup(r.backup)).toEqual({ questions: 2, attempts: 1, cards: 1 })
  })
})
