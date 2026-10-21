import type { Route } from '@/hooks/useHashRoute'
import { COASTAL_MENU, INFO_ITEM, MAIN_MENU, ROADMAP_ITEM, SYLLABUS_ITEM, YACHT_MENU, type MenuItem } from '@/navigation/menu'
import { cn } from '@/lib/utils'
import { Logo } from './Logo'
import { ThemeToggle } from './ThemeToggle'

function NavLink({ item, active, onNavigate }: { item: MenuItem; active: boolean; onNavigate?: () => void }) {
  const Icon = item.icon
  return (
    <a
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
        active ? 'bg-white/12 text-white shadow-inner' : 'text-sidebar-foreground/75 hover:bg-white/6 hover:text-white',
      )}
    >
      <Icon className={cn('size-[18px]', active && 'text-teal-300')} />
      <span className="flex-1">{item.label}</span>
      {item.hint && <span className="text-[11px] text-sidebar-foreground/70">{item.hint}</span>}
    </a>
  )
}

export function Sidebar({ route, onNavigate }: { route: Route; onNavigate?: () => void }) {
  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <Logo className="size-9" />
        <div className="leading-tight">
          <div className="font-semibold text-white">RYA Navigation</div>
          <div className="text-xs text-teal-300">Academy · Lernprojekt</div>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-3" aria-label="Hauptnavigation">
        <p className="px-3 pt-2 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/70 uppercase">Day Skipper</p>
        {MAIN_MENU.map((item) => (
          <NavLink key={item.href} item={item} active={route.name === item.route} onNavigate={onNavigate} />
        ))}
        <p className="px-3 pt-5 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/70 uppercase">Coastal Skipper</p>
        {COASTAL_MENU.map((item) => (
          <NavLink key={item.href} item={item} active={route.name === item.route} onNavigate={onNavigate} />
        ))}
        <p className="px-3 pt-5 pb-1 text-[11px] font-semibold tracking-wider text-sidebar-foreground/70 uppercase">Yachtmaster</p>
        {YACHT_MENU.map((item) => (
          <NavLink key={item.href} item={item} active={route.name === item.route} onNavigate={onNavigate} />
        ))}
        <NavLink item={SYLLABUS_ITEM} active={route.name === 'syllabus'} onNavigate={onNavigate} />
        <NavLink item={ROADMAP_ITEM} active={route.name === 'roadmap'} onNavigate={onNavigate} />
        <div className="pt-4">
          <NavLink item={INFO_ITEM} active={route.name === 'about'} onNavigate={onNavigate} />
        </div>
      </nav>
      <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
        <p className="text-[11px] leading-snug text-sidebar-foreground/55">
          Unabhängiges Lernprojekt –<br />
          nicht von der RYA zertifiziert.
        </p>
        <ThemeToggle className="text-sidebar-foreground hover:bg-white/10 hover:text-white" />
      </div>
    </div>
  )
}
