import {
  Anchor,
  BookOpen,
  Calculator,
  Compass,
  GraduationCap,
  Info,
  Layers,
  LayoutDashboard,
  Map,
  type LucideIcon,
} from 'lucide-react'
import type { Route } from '@/hooks/useHashRoute'

export interface MenuItem {
  label: string
  href: string
  icon: LucideIcon
  route: Route['name']
  hint?: string
}

export const MAIN_MENU: MenuItem[] = [
  { label: 'Dashboard', href: '#/', icon: LayoutDashboard, route: 'dashboard' },
  { label: 'Glossar', href: '#/glossar', icon: BookOpen, route: 'glossary', hint: '9 Begriffe' },
  { label: 'Simulator', href: '#/simulator', icon: Compass, route: 'simulator', hint: 'Vektoren' },
  { label: 'Prüfungstrainer', href: '#/quiz', icon: GraduationCap, route: 'quiz', hint: '50 Fragen' },
  { label: 'Lernkarten', href: '#/lernkarten', icon: Layers, route: 'flashcards' },
  { label: 'Rechner', href: '#/rechner', icon: Calculator, route: 'calculators', hint: '7 Tools' },
]

/** Module späterer Phasen – führen zur Roadmap-Seite mit Beschreibung. */
export const UPCOMING_MENU: { label: string; icon: LucideIcon; phase: number }[] = [
  { label: 'Seekarte', icon: Map, phase: 3 },
  { label: 'Coastal Skipper', icon: Anchor, phase: 3 },
]

export const INFO_ITEM: MenuItem = { label: 'Über & Hinweise', href: '#/info', icon: Info, route: 'about' }
