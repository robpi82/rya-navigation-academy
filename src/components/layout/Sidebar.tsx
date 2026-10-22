import type { Route } from '@/hooks/useHashRoute'
import { INFO_ITEM, MENU_GROUPS, ROADMAP_ITEM, SYLLABUS_ITEM, type MenuItem } from '@/navigation/menu'
import { cn } from '@/lib/utils'
import { CompassRose } from './Logo'
import { ThemeToggle } from './ThemeToggle'

function NavLink({ item, active, onNavigate }: { item: MenuItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <a
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300',
        active
          ? 'bg-gradient-to-r from-sky-400/20 to-sky-400/5 text-white shadow-inner before:absolute before:inset-y-1.5 before:left-0 before:w-[3px] before:rounded-full before:bg-sky-300'
          : 'text-sidebar-foreground/75 hover:bg-white/6 hover:text-white',
      )}
    >
      <Icon className={cn('size-[18px]', active && 'text-sky-300')} />
      <span className="flex-1">{item.label}</span>
      {item.hint && <span className="text-[11px] text-sidebar-foreground/70">{item.hint}</span>}
    </a>
  )
}

export function Sidebar({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-gradient-to-b from-[oklch(0.17_0.04_255)] to-sidebar text-sidebar-foreground">
      <CompassRose className="pointer-events-none absolute -bottom-24 -left-24 size-80 opacity-[0.07]" />
      <a href="#/" onClick={onNavigate} className="relative flex items-center gap-3 px-5 pt-6 pb-5 focus-visible:outline-2 focus-visible:outline-sky-300">
        <CompassRose className="size-14 shrink-0 drop-shadow-[0_0_8px_rgb(214_168_79/0.35)]" />
        <div className="font-display text-[15px] leading-[1.15] font-semibold tracking-[0.14em] text-white uppercase">
          RYA
          <br />
          Navigation
          <br />
          Academy
        </div>
      </a>
      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3" aria-label="Hauptnavigation">
        {MENU_GROUPS.map((g) => (
          <div key={g.title ?? 'start'} className={g.title ? 'pt-4' : undefined}>
            {g.title && <p className="px-3 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/70 uppercase">{g.title}</p>}
            {g.items.map((item) => (
              <NavLink key={item.href} item={item} active={route.name === item.route} onNavigate={onNavigate} />
            ))}
          </div>
        ))}
        <div className="space-y-1 pt-4">
        <NavLink item={SYLLABUS_ITEM} active={route.name === 'syllabus'} onNavigate={onNavigate} />
        <NavLink item={ROADMAP_ITEM} active={route.name === 'roadmap'} onNavigate={onNavigate} />
        </div>
        <div className="pt-4">
          <NavLink item={INFO_ITEM} active={route.name === 'about'} onNavigate={onNavigate} />
        </div>
      </nav>
      <div className="relative flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
        <p className="text-[11px] leading-snug text-sidebar-foreground/55">
          Unabhängiges Lernprojekt –<br />
          nicht von der RYA zertifiziert.
        </p>
        <ThemeToggle className="text-sidebar-foreground hover:bg-white/10 hover:text-white" />
      </div>
    </div>
  )
}
