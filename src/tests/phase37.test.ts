import { describe, expect, it } from 'vitest'
import { FORMULA_GROUPS, formatResult } from '@/data/formulas'
import { parseHash } from '@/hooks/useHashRoute'

const all = FORMULA_GROUPS.flatMap((g) => g.items)

describe('Formelsammlung', () => {
  it('jedes Beispiel rechnet mit den App-Funktionen den festgehaltenen Wert', () => {
    for (const f of all) expect(f.compute(), f.id).toBeCloseTo(f.expected, 1)
  })
  it('eindeutige IDs, Links auf vorhandene Bereiche', () => {
    expect(new Set(all.map((f) => f.id)).size).toBe(all.length)
    for (const f of all) expect(parseHash(f.href).name, f.id).not.toBe('dashboard')
  })
  it('deutsches Zahlenformat', () => {
    expect(formatResult(all.find((f) => f.id === 'dst-time')!)).toBe('2,5 h')
    expect(formatResult(all.find((f) => f.id === 'dip')!)).toBe('−3,5′')
  })
  it('alle drei Stufen sind vertreten', () => {
    expect(new Set(FORMULA_GROUPS.map((g) => g.level)).size).toBe(3)
  })
})

describe('Route', () => {
  it('#/formeln führt zur Formelsammlung', () => {
    expect(parseHash('#/formeln').name).toBe('formulas')
  })
})
