import { useEffect, useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import type { Route } from '@/hooks/useHashRoute'
import { Button } from '@/components/ui/button'
import { Logo } from './Logo'
import { Sidebar } from './Sidebar'
import { ThemeToggle } from './ThemeToggle'

export function AppShell({ route, children }: { route: Route; children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <div className="min-h-dvh lg:pl-64 print:pl-0">
      {/* Desktop-Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block print:hidden">
        <Sidebar route={route} />
      </aside>

      {/* Mobile Kopfzeile */}
      <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur lg:hidden print:hidden">
        <Button variant="ghost" size="icon" onClick={() => setOpen(true)} aria-label="Menü öffnen" aria-expanded={open}>
          <Menu />
        </Button>
        <a href="#/" className="flex items-center gap-2 font-semibold">
          <Logo className="size-7" /> RYA Navigation Academy
        </a>
        <ThemeToggle className="ml-auto" />
      </header>

      {/* Mobile Drawer */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true" aria-label="Navigation">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-xl">
            <Sidebar route={route} onNavigate={() => setOpen(false)} />
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-2 text-white hover:bg-white/10"
              onClick={() => setOpen(false)}
              aria-label="Menü schließen"
            >
              <X />
            </Button>
          </div>
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8 print:max-w-none print:p-0">{children}</main>
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-xs text-muted-foreground sm:px-6 lg:px-8 print:max-w-none print:px-0 print:pt-4">
        Lernhilfe – kein Ersatz für zugelassene Navigationsmittel, amtliche Seekarten oder eine anerkannte Ausbildung. Kein offizielles
        Produkt der Royal Yachting Association.
      </footer>
    </div>
  )
}
