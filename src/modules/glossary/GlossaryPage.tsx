import { useEffect } from 'react'
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Circle, Lightbulb, ShipWheel, TriangleAlert } from 'lucide-react'
import { GLOSSARY, TERM_BY_ID } from '@/data/glossary'
import type { TermId } from '@/types/learning'
import { useProgressStore } from '@/stores/progressStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { TermCheck } from './TermCheck'
import { TermIllustration } from './TermIllustration'

export function GlossaryPage({ termId }: { termId?: string }) {
  if (termId && termId in TERM_BY_ID) return <TermDetail id={termId as TermId} />
  return <GlossaryOverview />
}

function GlossaryOverview() {
  const learned = useProgressStore((s) => s.learnedTerms)
  const viewed = useProgressStore((s) => s.viewedTerms)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Nautisches Glossar"
        subtitle="Neun Kernbegriffe der Koppel- und Stromnavigation – jeweils mit Erklärung, Merksatz, Beispiel, Illustration und Verständnisfrage."
      />
      <Card>
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span>Als gelernt markiert</span>
              <span className="font-mono">
                {learned.length} / {GLOSSARY.length}
              </span>
            </div>
            <Progress value={(learned.length / GLOSSARY.length) * 100} />
          </div>
          <Button asChild variant="outline">
            <a href={`#/glossar/${GLOSSARY.find((t) => !learned.includes(t.id))?.id ?? GLOSSARY[0].id}`}>
              <BookOpen /> {learned.length === GLOSSARY.length ? 'Wiederholen' : 'Weiterlernen'}
            </a>
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GLOSSARY.map((t, i) => {
          const isLearned = learned.includes(t.id)
          return (
            <a
              key={t.id}
              href={`#/glossar/${t.id}`}
              className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-xs text-muted-foreground">Begriff {i + 1}</div>
                  <div className="font-mono text-2xl font-bold text-primary">{t.abbr}</div>
                </div>
                {isLearned ? (
                  <Badge variant="success">
                    <CheckCircle2 /> gelernt
                  </Badge>
                ) : viewed.includes(t.id) ? (
                  <Badge variant="secondary">angesehen</Badge>
                ) : (
                  <Badge variant="outline">neu</Badge>
                )}
              </div>
              <div className="mt-2 font-semibold">{t.english}</div>
              <div className="text-sm text-muted-foreground">{t.german}</div>
              <p className="mt-3 line-clamp-2 text-sm">{t.definition}</p>
              <div className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                Lernkarte öffnen <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </a>
          )
        })}
      </div>
    </div>
  )
}

function TermDetail({ id }: { id: TermId }) {
  const term = TERM_BY_ID[id]
  const idx = GLOSSARY.findIndex((t) => t.id === id)
  const prev = GLOSSARY[(idx - 1 + GLOSSARY.length) % GLOSSARY.length]
  const next = GLOSSARY[(idx + 1) % GLOSSARY.length]
  const { learnedTerms, termChecks, markViewed, toggleLearned, recordTermCheck } = useProgressStore()
  const isLearned = learnedTerms.includes(id)

  useEffect(() => markViewed(id), [id, markViewed])

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Button asChild variant="ghost" size="sm" className="-ml-2">
          <a href="#/glossar">
            <ArrowLeft /> Alle Begriffe
          </a>
        </Button>
        <span className="text-sm text-muted-foreground">
          Lernkarte {idx + 1} von {GLOSSARY.length}
        </span>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="font-mono text-4xl font-bold text-primary">{term.abbr}</div>
          <h1 className="mt-1 text-2xl font-bold">{term.english}</h1>
          <p className="text-lg text-muted-foreground">{term.german}</p>
        </div>
        <Button
          variant={isLearned ? 'secondary' : 'default'}
          onClick={() => toggleLearned(id)}
          aria-pressed={isLearned}
        >
          {isLearned ? <CheckCircle2 className="text-success" /> : <Circle />}
          {isLearned ? 'Gelernt' : 'Als gelernt markieren'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Definition</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-lg font-medium">{term.definition}</p>
              {term.details.map((p) => (
                <p key={p} className="leading-relaxed text-muted-foreground">
                  {p}
                </p>
              ))}
              <p className="text-sm">
                <span className="font-medium">Quelle an Bord:</span> <span className="text-muted-foreground">{term.source}</span>
              </p>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-primary/40 bg-accent/40">
              <CardHeader className="flex-row items-center gap-2">
                <Lightbulb className="size-5 text-warning" />
                <CardTitle>Merksatz</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium">{term.mnemonic}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex-row items-center gap-2">
                <ShipWheel className="size-5 text-vec-tide" />
                <CardTitle>Praxisbeispiel</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{term.example}</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex-row items-center gap-2">
              <TriangleAlert className="size-5 text-destructive" />
              <CardTitle>Typische Verwechslungen</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {term.confusions.map((c) => (
                  <li key={c.with} className="flex gap-3">
                    <Badge variant="destructive" className="mt-0.5 h-fit">
                      ≠ {c.with}
                    </Badge>
                    <span className="text-sm leading-relaxed">{c.explanation}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>Verständnisfrage</CardTitle>
              {termChecks[id] !== undefined && (
                <Badge variant={termChecks[id] ? 'success' : 'destructive'}>
                  zuletzt {termChecks[id] ? 'richtig' : 'falsch'}
                </Badge>
              )}
            </CardHeader>
            <CardContent>
              <TermCheck key={id} check={term.check} onAnswered={(c) => recordTermCheck(id, c)} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden p-3">
            <TermIllustration id={id} />
          </Card>
          <Button asChild variant="outline" className="w-full">
            <a href="#/simulator">Im Simulator ausprobieren</a>
          </Button>
        </div>
      </div>

      <nav className="flex justify-between gap-2 border-t pt-4" aria-label="Begriffe blättern">
        <Button asChild variant="ghost">
          <a href={`#/glossar/${prev.id}`}>
            <ArrowLeft /> {prev.abbr}
          </a>
        </Button>
        <div className="hidden items-center gap-1.5 sm:flex">
          {GLOSSARY.map((t) => (
            <a
              key={t.id}
              href={`#/glossar/${t.id}`}
              aria-label={t.english}
              className={cn(
                'size-2.5 rounded-full',
                t.id === id ? 'bg-primary' : learnedTerms.includes(t.id) ? 'bg-success/60' : 'bg-muted-foreground/30',
              )}
            />
          ))}
        </div>
        <Button asChild variant="ghost">
          <a href={`#/glossar/${next.id}`}>
            {next.abbr} <ArrowRight />
          </a>
        </Button>
      </nav>
    </div>
  )
}
