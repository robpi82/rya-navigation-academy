import {
  Anchor,
  BookOpen,
  Calculator,
  Compass,
  GraduationCap,
  Info,
  Library,
  Layers,
  LayoutDashboard,
  Map,
  Milestone,
  type LucideIcon,
} from 'lucide-react'
import type { Route } from '@/hooks/useHashRoute'
import { QUESTION_BANK } from '@/questions'

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
  { label: 'Themen', href: '#/themen', icon: Library, route: 'themen', hint: '4 Lektionen' },
  { label: 'Prüfungstrainer', href: '#/quiz', icon: GraduationCap, route: 'quiz', hint: `${QUESTION_BANK.length} Fragen` },
  { label: 'Lernkarten', href: '#/lernkarten', icon: Layers, route: 'flashcards' },
  { label: 'Rechner', href: '#/rechner', icon: Calculator, route: 'calculators', hint: '7 Tools' },
  { label: 'Seekarte', href: '#/seekarte', icon: Map, route: 'chart', hint: 'Aufgaben' },
]

export const COASTAL_MENU: MenuItem[] = [{ label: 'Coastal Skipper', href: '#/coastal', icon: Anchor, route: 'coastal', hint: '5 Lektionen' }]

export const ROADMAP_ITEM: MenuItem = { label: 'Roadmap', href: '#/roadmap', icon: Milestone, route: 'roadmap' }

export const INFO_ITEM: MenuItem = { label: 'Über & Hinweise', href: '#/info', icon: Info, route: 'about' }
