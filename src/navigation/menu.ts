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
  Sailboat,
  Layers,
  LayoutDashboard,
  Map,
  Milestone,
  ListTree,
  Ship,
  type LucideIcon,
} from 'lucide-react'
import type { Route } from '@/hooks/useHashRoute'
import { COASTAL_LESSON_IDS, DAY_LESSON_IDS, YACHT_LESSON_COUNT } from '@/data/lessonIds'
import { QUESTION_COUNT } from '@/data/counts'

export interface MenuItem {
  label: string
  href: string
  icon: LucideIcon
  route: Route['name']
  hint?: string
}

export interface MenuGroup {
  /** Überschrift der Gruppe; ohne Überschrift stehen die Punkte ganz oben */
  title?: string
  items: MenuItem[]
}

export const MENU_GROUPS: MenuGroup[] = [
  {
    items: [
      { label: 'Dashboard', href: '#/', icon: LayoutDashboard, route: 'dashboard' },
      { label: 'Lernplan', href: '#/lernplan', icon: CalendarDays, route: 'plan', hint: 'bis zur Prüfung' },
    ],
  },
  {
    title: 'Lektionen',
    items: [
      { label: 'Day Skipper', href: '#/themen', icon: Sailboat, route: 'themen', hint: String(DAY_LESSON_IDS.length) },
      { label: 'Coastal Skipper', href: '#/coastal', icon: Anchor, route: 'coastal', hint: String(COASTAL_LESSON_IDS.length) },
      { label: 'Yachtmaster', href: '#/yachtmaster', icon: Ship, route: 'yachtmaster', hint: String(YACHT_LESSON_COUNT) },
    ],
  },
  {
    title: 'Üben',
    items: [
      { label: 'Glossar', href: '#/glossar', icon: BookOpen, route: 'glossary', hint: '9 Begriffe' },
      { label: 'Simulator', href: '#/simulator', icon: Compass, route: 'simulator', hint: 'Vektoren' },
      { label: 'Prüfungstrainer', href: '#/quiz', icon: GraduationCap, route: 'quiz', hint: `${QUESTION_COUNT} Fragen` },
      { label: 'Rechentraining', href: '#/rechnen', icon: Sigma, route: 'calc' },
      { label: 'Probeprüfung', href: '#/pruefung', icon: ClipboardCheck, route: 'exam', hint: 'mit Zeitlimit' },
      { label: 'Lernkarten', href: '#/lernkarten', icon: Layers, route: 'flashcards' },
      { label: 'Seekarte', href: '#/seekarte', icon: Map, route: 'chart', hint: 'Aufgaben' },
    ],
  },
  {
    title: 'Werkzeuge',
    items: [
      { label: 'Rechner', href: '#/rechner', icon: Calculator, route: 'calculators', hint: '8 Tools' },
      { label: 'Formelsammlung', href: '#/formeln', icon: FunctionSquare, route: 'formulas', hint: 'druckbar' },
    ],
  },
]

export const SYLLABUS_ITEM: MenuItem = { label: 'Syllabus-Abdeckung', href: '#/syllabus', icon: ListTree, route: 'syllabus' }

export const ROADMAP_ITEM: MenuItem = { label: 'Roadmap', href: '#/roadmap', icon: Milestone, route: 'roadmap' }

export const INFO_ITEM: MenuItem = { label: 'Über & Hinweise', href: '#/info', icon: Info, route: 'about' }
