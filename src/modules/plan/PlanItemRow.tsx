import { BookOpen, CheckCircle2, Circle, ClipboardCheck, GraduationCap, Library, type LucideIcon } from 'lucide-react'
import type { PlanItem, PlanItemKind } from '@/lib/studyPlan'
import { cn } from '@/lib/utils'

const KIND_ICON: Record<PlanItemKind, LucideIcon> = { terms: BookOpen, lesson: Library, review: GraduationCap, exam: ClipboardCheck }

export function PlanItemRow({ item, done }: { item: PlanItem; done: boolean }) {
  const Icon = KIND_ICON[item.kind]
  return (
    <li>
      <a href={item.href} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-muted">
        {done ? <CheckCircle2 className="size-4 shrink-0 text-success" aria-label="erledigt" /> : <Circle className="size-4 shrink-0 text-muted-foreground" aria-label="offen" />}
        <Icon className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        <span className={cn('min-w-0 flex-1', done && 'text-muted-foreground line-through')}>{item.title}</span>
      </a>
    </li>
  )
}
