import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { QUESTION_COUNT } from '@/data/counts'
import { QUESTION_BANK } from '@/questions'

const src = (p: string) => readFileSync(p, 'utf8')

describe('Ladeleistung', () => {
  it('die Kennzahl im Menü stimmt mit der Fragensammlung überein', () => {
    expect(QUESTION_COUNT).toBe(QUESTION_BANK.length)
  })
  it('Menü, Seitenleiste und App-Hülle laden die Fragensammlung nicht (Start-Chunk bleibt klein)', () => {
    for (const f of ['src/navigation/menu.ts', 'src/components/layout/Sidebar.tsx', 'src/components/layout/AppShell.tsx', 'src/App.tsx']) expect(src(f), f).not.toMatch(/from '@\/questions'/)
  })
  it('Diagramm-Chunk ohne React: React und clsx liegen im gemeinsamen Basis-Chunk', () => {
    const cfg = src('vite.config.ts')
    expect(cfg).toMatch(/return 'vendor'/)
    expect(cfg).toMatch(/react\|react-dom\|scheduler\|react-is\|clsx/)
  })
})

describe('Barrierefreiheit', () => {
  it('Fortschrittsbalken haben einen zugänglichen Namen', () => {
    expect(src('src/components/ui/progress.tsx')).toMatch(/aria-label="Fortschritt"/)
  })
  it('Sprunglink zum Inhalt und fokussierbarer Hauptbereich', () => {
    const shell = src('src/components/layout/AppShell.tsx')
    expect(shell).toMatch(/Zum Inhalt springen/)
    expect(shell).toMatch(/id="inhalt" tabIndex=\{-1\}/)
  })
  it('anklickbare Teile der Bootsskizze sind per Tastatur bedienbar', () => {
    const w = src('src/modules/daylessons/seamanshipWidgets.tsx')
    expect(w).toMatch(/tabIndex=\{0\}/)
    expect(w).toMatch(/e\.key === 'Enter' \|\| e\.key === ' '/)
  })
  it('Seitenleiste ohne zu blasse Hinweise (≥ 70 % Deckkraft)', () => {
    expect(src('src/components/layout/Sidebar.tsx')).not.toMatch(/text-sidebar-foreground\/50/)
  })
})
