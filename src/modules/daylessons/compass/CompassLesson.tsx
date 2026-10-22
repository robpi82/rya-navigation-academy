import { useEffect, useMemo, useState } from 'react'
import { ArrowDown, ArrowLeft, ArrowRight, Check, CheckCircle2, Circle, FlaskConical, GraduationCap, Lightbulb } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Lesson } from '@/modules/lessons/types'
import { useLessonSectionStore, useLessonSections } from '@/stores/lessonSectionStore'
import { useProgressStore } from '@/stores/progressStore'
import { compassSections, type CompassSection } from './sections'
import './compassLesson.css'

const anchor = (id: string) => `abschnitt-${id}`

function scrollToSection(id: string) {
  const el = document.getElementById(anchor(id))
  if (!el) return
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
  // Fokus für Tastatur und Screenreader auf die Abschnittsüberschrift, ohne erneut zu springen
  el.querySelector<HTMLElement>('h2')?.focus({ preventScroll: true })
}

/** Abschnitt, der gerade im oberen Drittel des Fensters steht. */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState(ids[0])
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive((visible[0].target as HTMLElement).dataset.section!)
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )
    ids.forEach((id) => {
      const el = document.getElementById(anchor(id))
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [ids])
  return active
}

function SectionProgress({ done, total, className }: { done: number; total: number; className?: string }) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-3 text-sm">
        <span className="text-muted-foreground">Lernabschnitte verstanden</span>
        <span className="font-mono font-semibold text-primary">
          {done} / {total}
        </span>
      </div>
      <div className="flex gap-1" role="progressbar" aria-label="Lernabschnitte verstanden" aria-valuemin={0} aria-valuemax={total} aria-valuenow={done}>
        {Array.from({ length: total }, (_, i) => (
          <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i < done ? 'bg-primary' : 'bg-muted')} />
        ))}
      </div>
    </div>
  )
}

function CompleteButton({ done, onToggle, className }: { done: boolean; onToggle: () => void; className?: string }) {
  return (
    <Button variant={done ? 'secondary' : 'default'} onClick={onToggle} aria-pressed={done} className={className}>
      {done ? <CheckCircle2 className="text-success" /> : <Circle />} {done ? 'Abgeschlossen' : 'Als abgeschlossen markieren'}
    </Button>
  )
}

function ChapterNav({ sections, understood, active }: { sections: CompassSection[]; understood: string[]; active: string }) {
  return (
    <ol className="space-y-1">
      {sections.map((s, i) => {
        const ok = understood.includes(s.id)
        const isActive = active === s.id
        return (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => scrollToSection(s.id)}
              aria-current={isActive ? 'location' : undefined}
              className={cn(
                'flex w-full items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-left text-sm transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
                isActive ? 'border-primary bg-(--lesson-teal-soft) text-foreground' : 'border-transparent text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              <span
                className={cn(
                  'grid size-6 shrink-0 place-items-center rounded-full border font-mono text-xs',
                  ok ? 'border-primary bg-primary text-primary-foreground' : isActive ? 'border-primary text-primary' : 'border-border',
                )}
                aria-hidden
              >
                {ok ? <Check className="size-3.5" /> : i + 1}
              </span>
              <span className="leading-snug">
                {s.short}
                <span className="sr-only">{ok ? ' (verstanden)' : ' (offen)'}</span>
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}

function ChapterChips({ sections, understood, active }: { sections: CompassSection[]; understood: string[]; active: string }) {
  return (
    <nav aria-label="Kapitel dieser Lektion" className="chip-scroll -mx-1 flex gap-2 overflow-x-auto px-1 py-0.5">
      {sections.map((s, i) => {
        const ok = understood.includes(s.id)
        const isActive = active === s.id
        return (
          <button
            key={s.id}
            type="button"
            onClick={() => scrollToSection(s.id)}
            aria-current={isActive ? 'location' : undefined}
            className={cn(
              'inline-flex min-h-9 shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm whitespace-nowrap transition-colors focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
              isActive ? 'border-primary bg-(--lesson-teal-soft) text-foreground' : 'bg-card/70 text-muted-foreground hover:text-foreground',
            )}
          >
            {ok ? <Check className="size-3.5 text-primary" aria-hidden /> : <span className="font-mono text-xs" aria-hidden>{i + 1}</span>}
            {s.short}
            {ok && <span className="sr-only"> (verstanden)</span>}
          </button>
        )
      })}
    </nav>
  )
}

function SectionCard({ section, index, total, lesson, understood, onToggle, next }: { section: CompassSection; index: number; total: number; lesson: Lesson; understood: boolean; onToggle: () => void; next?: CompassSection }) {
  const headingId = `${anchor(section.id)}-titel`
  const { Figure, widget } = section
  return (
    <section id={anchor(section.id)} data-section={section.id} aria-labelledby={headingId} className="rounded-2xl border bg-card/80 shadow-sm backdrop-blur-sm">
      <header className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:p-7">
        <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-(--lesson-gold-soft) font-mono text-lg font-semibold text-(--lesson-gold)" aria-hidden>
          {String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Abschnitt {index + 1} von {total}
            {widget && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-(--lesson-teal-soft) px-2 py-0.5 text-[11px] text-primary normal-case">
                <FlaskConical className="size-3" aria-hidden /> interaktiv
              </span>
            )}
          </div>
          <h2 id={headingId} tabIndex={-1} className="mt-1 text-xl font-semibold tracking-tight text-balance outline-none sm:text-2xl">
            {section.title}
          </h2>
          <p className="mt-0.5 text-sm text-muted-foreground italic">{section.english}</p>
        </div>
        {understood && (
          <span className="inline-flex items-center gap-1 self-start rounded-full bg-success/15 px-2.5 py-1 text-xs font-medium text-success">
            <CheckCircle2 className="size-3.5" aria-hidden /> verstanden
          </span>
        )}
      </header>

      <div className="space-y-6 p-5 sm:p-7">
        {section.intro && <p className="max-w-3xl text-lg leading-relaxed">{section.intro}</p>}
        {section.blocks && (
          <div className={cn('grid gap-4', section.blocks.length === 4 ? 'md:grid-cols-2' : 'md:grid-cols-3')}>
            {section.blocks.map((b) => (
              <div key={b.title} className="rounded-xl border bg-background/40 p-4 sm:p-5">
                <h3 className="mb-1.5 text-sm font-semibold text-(--lesson-gold)">{b.title}</h3>
                <p className="leading-relaxed text-muted-foreground">{b.text}</p>
              </div>
            ))}
          </div>
        )}

        {(Figure || section.keyPoints?.length || section.mnemonic) && (
          <div className={cn('grid gap-4', Figure ? 'lg:grid-cols-2' : section.mnemonic && 'md:grid-cols-2')}>
            {Figure && <Figure />}
            <div className={cn('grid content-start gap-4', !Figure && 'contents')}>
              {section.keyPoints && section.keyPoints.length > 0 && (
                <div className="rounded-xl border border-primary/30 bg-(--lesson-teal-soft) p-4 sm:p-5">
                  <h3 className="mb-2 text-sm font-semibold tracking-wide text-primary uppercase">Merke</h3>
                  <ul className="space-y-2">
                    {section.keyPoints.map((k) => (
                      <li key={k} className="flex gap-2 leading-relaxed">
                        <Check className="mt-1 size-4 shrink-0 text-primary" aria-hidden /> <span>{k}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {section.mnemonic && (
                <div className="rounded-xl border border-(--lesson-gold)/50 bg-(--lesson-gold-soft) p-4 sm:p-5">
                  <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold tracking-wide text-(--lesson-gold) uppercase">
                    <Lightbulb className="size-4" aria-hidden /> Merksatz
                  </h3>
                  <p className="text-lg leading-relaxed font-medium">{lesson.mnemonic}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {widget && (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">{widget.title}</h3>
              {widget.description && <p className="text-sm text-muted-foreground">{widget.description}</p>}
            </div>
            <widget.Comp />
          </div>
        )}
      </div>

      <footer className="flex flex-col gap-2 border-t p-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <Button variant={understood ? 'secondary' : 'outline'} onClick={onToggle} aria-pressed={understood} className={cn(!understood && 'border-primary/60 text-primary hover:bg-(--lesson-teal-soft) hover:text-primary')}>
          {understood ? <CheckCircle2 className="text-success" /> : <Circle />} {understood ? 'Verstanden' : 'Abschnitt als verstanden markieren'}
        </Button>
        {next && (
          <Button variant="ghost" onClick={() => scrollToSection(next.id)} className="justify-start text-muted-foreground sm:justify-center">
            Weiter: {next.short} <ArrowDown />
          </Button>
        )}
      </footer>
    </section>
  )
}

/** Lektion 1 „Kompass, Variation und Deviation“ im Lernabschnitts-Layout (Design-Prototyp, nur für diese Lektion). */
export function CompassLesson({ lesson, lessons, basePath, backLabel }: { lesson: Lesson; lessons: Lesson[]; basePath: string; backLabel: string }) {
  const { completedLessons, toggleLesson } = useProgressStore()
  const understood = useLessonSections(lesson.id)
  const toggleSection = useLessonSectionStore((s) => s.toggleSection)
  const sections = useMemo(() => compassSections(lesson), [lesson])
  const ids = useMemo(() => sections.map((s) => s.id), [sections])
  const active = useActiveSection(ids)
  const idx = lessons.indexOf(lesson)
  const next = lessons[(idx + 1) % lessons.length]
  const done = completedLessons.includes(lesson.id)
  const doneSections = ids.filter((id) => understood.includes(id)).length
  const allUnderstood = doneSections === ids.length

  return (
    <div className="nav-lesson -mx-4 -my-6 px-4 py-6 sm:-mx-6 sm:px-6 lg:-mx-8 lg:-my-8 lg:px-8 lg:py-8">
      <div className="space-y-6 sm:space-y-8">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <a href={basePath}>
            <ArrowLeft /> {backLabel}
          </a>
        </Button>

        <header className="relative overflow-hidden rounded-3xl border bg-card/70 p-6 shadow-sm sm:p-8 lg:p-10">
          <svg viewBox="0 0 200 200" className="pointer-events-none absolute -top-10 -right-10 hidden size-72 text-(--lesson-gold) opacity-[0.12] md:block" aria-hidden>
            <circle cx="100" cy="100" r="92" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <circle cx="100" cy="100" r="70" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" />
            <path d="M100 8 L112 100 L100 192 L88 100 Z" fill="currentColor" />
            <path d="M8 100 L100 88 L192 100 L100 112 Z" fill="currentColor" opacity="0.6" />
          </svg>
          <div className="relative max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.2em] text-(--lesson-gold) uppercase">
              Day Skipper · Lektion {idx + 1} von {lessons.length}
            </p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">{lesson.title}</h1>
            <p className="mt-2 text-lg text-primary sm:text-xl">{lesson.english}</p>
            <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">{lesson.summary}</p>
          </div>
          <div className="relative mt-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <SectionProgress done={doneSections} total={ids.length} className="w-full max-w-sm" />
            <CompleteButton done={done} onToggle={() => toggleLesson(lesson.id)} />
          </div>
        </header>

        <div className="sticky top-14 z-10 -mx-4 border-b bg-background/85 px-4 py-2.5 backdrop-blur sm:-mx-6 sm:px-6 lg:top-0 lg:-mx-8 lg:px-8 xl:hidden">
          <ChapterChips sections={sections} understood={understood} active={active} />
        </div>

        <div className="xl:grid xl:grid-cols-[15rem_minmax(0,1fr)] xl:gap-8">
          <aside className="hidden xl:block" aria-label="Kapitel dieser Lektion">
            <div className="sticky top-6 space-y-5 rounded-2xl border bg-card/70 p-4">
              <p className="px-1 text-xs font-semibold tracking-[0.2em] text-(--lesson-gold) uppercase">Kapitel</p>
              <ChapterNav sections={sections} understood={understood} active={active} />
              <SectionProgress done={doneSections} total={ids.length} className="px-1" />
            </div>
          </aside>

          <div className="min-w-0 space-y-6 sm:space-y-8">
            {sections.map((s, i) => (
              <SectionCard
                key={s.id}
                section={s}
                index={i}
                total={sections.length}
                lesson={lesson}
                understood={understood.includes(s.id)}
                onToggle={() => toggleSection(lesson.id, s.id)}
                next={sections[i + 1]}
              />
            ))}

            <div className="rounded-2xl border bg-card/80 p-5 sm:p-7">
              <h2 className="text-lg font-semibold">{allUnderstood ? 'Alle Lernabschnitte verstanden' : 'Lektion abschließen'}</h2>
              <p className="mt-1 text-muted-foreground">
                {done
                  ? 'Diese Lektion ist als abgeschlossen markiert.'
                  : allUnderstood
                    ? 'Du hast alle sechs Abschnitte als verstanden markiert – markiere jetzt die ganze Lektion als abgeschlossen.'
                    : `Noch ${ids.length - doneSections} von ${ids.length} Abschnitten offen. Du kannst die Lektion trotzdem jederzeit als abgeschlossen markieren.`}
              </p>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                <CompleteButton done={done} onToggle={() => toggleLesson(lesson.id)} />
                {lesson.links?.map((l) => (
                  <Button key={l.href} asChild variant="outline">
                    <a href={l.href}>
                      <GraduationCap /> {l.label}
                    </a>
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-end border-t pt-4">
              <Button asChild variant="ghost" className="h-auto min-h-9 max-w-full py-2 text-left whitespace-normal">
                <a href={`${basePath}/${next.id}`}>
                  Nächste Lektion: {next.title} <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
