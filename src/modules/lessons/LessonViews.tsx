import { ArrowLeft, ArrowRight, CheckCircle2, Circle, GraduationCap, Lightbulb } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { useProgressStore } from '@/stores/progressStore'
import type { Lesson } from './types'

interface CatalogProps {
  title: string
  subtitle: string
  lessons: Lesson[]
  basePath: string
  quizLabel: string
  /** Optionale Bildkarten je Lektions-ID; die Bilder enthalten Nummer, Titel und Pfeil bereits selbst. */
  cardImages?: Partial<Record<string, string>>
  /** Pixelmaß der Bildkarten; bestimmt das einheitliche Seitenverhältnis. */
  cardImageSize?: { width: number; height: number }
}

export function LessonCatalog({ title, subtitle, lessons, basePath, quizLabel, cardImages, cardImageSize = { width: 363, height: 257 } }: CatalogProps) {
  const completed = useProgressStore((s) => s.completedLessons)
  const done = lessons.filter((l) => completed.includes(l.id)).length
  const next = lessons.find((l) => !completed.includes(l.id)) ?? lessons[0]
  return (
    <div className="space-y-6">
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span>Lektionen abgeschlossen</span>
              <span className="font-mono">
                {done} / {lessons.length}
              </span>
            </div>
            <Progress value={(done / lessons.length) * 100} />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={`${basePath}/${next.id}`}>{done === lessons.length ? 'Wiederholen' : 'Weiterlernen'}</a>
            </Button>
            <Button asChild variant="outline">
              <a href="#/quiz">
                <GraduationCap /> {quizLabel}
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {lessons.map((l, i) => {
          const image = cardImages?.[l.id]
          return image ? (
            <a
              key={l.id}
              href={`${basePath}/${l.id}`}
              className="group relative block overflow-hidden rounded-xl border bg-[#05121e] shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:outline-none"
            >
              <img
                src={image}
                alt={`Lektion ${i + 1}: ${l.title} (${l.english}) – Lektion öffnen`}
                width={cardImageSize.width}
                height={cardImageSize.height}
                style={{ aspectRatio: `${cardImageSize.width} / ${cardImageSize.height}` }}
                loading={i < 6 ? 'eager' : 'lazy'}
                decoding="async"
                className="w-full object-contain transition-[filter] group-hover:brightness-110"
              />
              {completed.includes(l.id) && (
                <Badge variant="success" className="absolute top-2.5 right-2.5 shadow-md">
                  <CheckCircle2 /> erledigt
                </Badge>
              )}
            </a>
          ) : (
            <a key={l.id} href={`${basePath}/${l.id}`} className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs text-muted-foreground">Lektion {i + 1}</span>
                {completed.includes(l.id) ? (
                  <Badge variant="success">
                    <CheckCircle2 /> erledigt
                  </Badge>
                ) : (
                  <Badge variant="outline">offen</Badge>
                )}
              </div>
              <div className="mt-2 font-semibold">{l.title}</div>
              <div className="text-sm text-muted-foreground">{l.english}</div>
              <p className="mt-3 text-sm">{l.summary}</p>
              <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                Lektion öffnen <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

export function LessonDetail({ lesson, lessons, basePath, backLabel }: { lesson: Lesson; lessons: Lesson[]; basePath: string; backLabel: string }) {
  const { completedLessons, toggleLesson } = useProgressStore()
  const idx = lessons.indexOf(lesson)
  const next = lessons[(idx + 1) % lessons.length]
  const done = completedLessons.includes(lesson.id)
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <a href={basePath}>
          <ArrowLeft /> {backLabel}
        </a>
      </Button>
      <PageHeader
        title={lesson.title}
        subtitle={lesson.english}
        actions={
          <Button variant={done ? 'secondary' : 'default'} onClick={() => toggleLesson(lesson.id)} aria-pressed={done}>
            {done ? <CheckCircle2 className="text-success" /> : <Circle />} {done ? 'Abgeschlossen' : 'Als abgeschlossen markieren'}
          </Button>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card>
          <CardContent className="space-y-3 pt-5 leading-relaxed">
            <p className="text-lg font-medium">{lesson.summary}</p>
            {lesson.body.map((p) => (
              <p key={p} className="text-muted-foreground">
                {p}
              </p>
            ))}
            {lesson.keyPoints && (
              <ul className="list-disc space-y-1 pl-5 text-sm">
                {lesson.keyPoints.map((k) => (
                  <li key={k}>{k}</li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
        <div className="space-y-4">
          <Card className="border-primary/40 bg-accent/40">
            <CardHeader className="flex-row items-center gap-2">
              <Lightbulb className="size-5 text-warning" />
              <CardTitle>Merksatz</CardTitle>
            </CardHeader>
            <CardContent className="font-medium">{lesson.mnemonic}</CardContent>
          </Card>
          {lesson.links?.map((l) => (
            <Button key={l.href} asChild variant="outline" className="w-full">
              <a href={l.href}>{l.label}</a>
            </Button>
          ))}
        </div>
      </div>
      {lesson.widgets.map((w) => (
        <Card key={w.title}>
          <CardHeader>
            <CardTitle>{w.title}</CardTitle>
            {w.description && <CardDescription>{w.description}</CardDescription>}
          </CardHeader>
          <CardContent>
            <w.Comp />
          </CardContent>
        </Card>
      ))}
      <div className="flex justify-end border-t pt-4">
        <Button asChild variant="ghost" className="h-auto min-h-9 max-w-full whitespace-normal py-2 text-left">
          <a href={`${basePath}/${next.id}`}>
            Nächste Lektion: {next.title} <ArrowRight />
          </a>
        </Button>
      </div>
    </div>
  )
}
