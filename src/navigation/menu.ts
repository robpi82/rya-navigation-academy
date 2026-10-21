import {
  Anchor,
  BookOpen,
  Calculator,
  CalendarDays,
  ClipboardCheck,
  Compass,
  Sigma,
  FunctionSquare,
  GraduationCap,
  Info,
  Library,
  Layers,
  LayoutDashboard,
  Map,
  Milestone,
  Ship,
  type LucideIcon,
} from 'lucide-react'
import type { Route } from '@/hooks/useHashRoute'
import { COASTAL_LESSON_IDS, DAY_LESSON_IDS } from '@/data/lessonIds'
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
  { label: 'Lernplan', href: '#/lernplan', icon: CalendarDays, route: 'plan', hint: 'bis zur Prüfung' },
  { label: 'Glossar', href: '#/glossar', icon: BookOpen, route: 'glossary', hint: '9 Begriffe' },
  { label: 'Simulator', href: '#/simulator', icon: Compass, route: 'simulator', hint: 'Vektoren' },
  { label: 'Themen', href: '#/themen', icon: Library, route: 'themen', hint: `${DAY_LESSON_IDS.length} Lektionen` },
  { label: 'Prüfungstrainer', href: '#/quiz', icon: GraduationCap, route: 'quiz', hint: `${QUESTION_BANK.length} Fragen` },
  { label: 'Rechentraining', href: '#/rechnen', icon: Sigma, route: 'calc' },
  { label: 'Probeprüfung', href: '#/pruefung', icon: ClipboardCheck, route: 'exam', hint: 'mit Zeitlimit' },
  { label: 'Lernkarten', href: '#/lernkarten', icon: Layers, route: 'flashcards' },
  { label: 'Rechner', href: '#/rechner', icon: Calculator, route: 'calculators', hint: '8 Tools' },
  { label: 'Formelsammlung', href: '#/formeln', icon: FunctionSquare, route: 'formulas', hint: 'druckbar' },
  { label: 'Seekarte', href: '#/seekarte', icon: Map, route: 'chart', hint: 'Aufgaben' },
]

export const COASTAL_MENU: MenuItem[] = [{ label: 'Coastal Skipper', href: '#/coastal', icon: Anchor, route: 'coastal', hint: `${COASTAL_LESSON_IDS.length} Lektionen` }]

export const YACHT_MENU: MenuItem[] = [{ label: 'Yachtmaster', href: '#/yachtmaster', icon: Ship, route: 'yachtmaster', hint: 'Vorgriff' }]

export const ROADMAP_ITEM: MenuItem = { label: 'Roadmap', href: '#/roadmap', icon: Milestone, route: 'roadmap' }

export const INFO_ITEM: MenuItem = { label: 'Über & Hinweise', href: '#/info', icon: Info, route: 'about' }
