import { useCallback, useEffect, useMemo, useState } from 'react'
import { CalendarClock, CheckCircle2, Layers, Lightbulb, Play, RotateCcw, Sparkles } from 'lucide-react'
import { FLASHCARDS, FLASHCARD_BY_ID, type Flashcard } from '@/data/flashcards'
import {
  buildSession,
  formatInterval,
  GRADE_LABELS,
  isDue,
  isMastered,
  newCardState,
  review,
  type Grade,
} from '@/lib/spacedRepetition'
import { useFlashcardStore } from '@/stores/flashcardStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

type Deck = 'alle' | Flashcard['deck']
const DECK_LABEL: Record<Deck, string> = { alle: 'Alle Karten', grundbegriffe: 'Grundbegriffe (9)', erweitert: 'Erweitert' }

export function FlashcardsPage() {
  const [session, setSession] = useState<string[] | null>(null)
  if (session) return <StudySession key={session.join()} initialQueue={session} onExit={() => setSession(null)} />
  return <Overview onStart={setSession} />
}

/* ------------------------------------------------------------------ Übersicht */

function Overview({ onStart }: { onStart: (ids: string[]) => void }) {
  const { cards, newPerSession, setNewPerSession } = useFlashcardStore()
  const [deck, setDeck] = useState<Deck>('alle')
  const now = new Date()
  const deckCards = FLASHCARDS.filter((c) => deck === 'alle' || c.deck === deck)
  const ids = deckCards.map((c) => c.id)
  const dueCount = ids.filter((id) => cards[id] && isDue(cards[id], now)).length
  const newCount = ids.filter((id) => !cards[id]).length
  const mastered = ids.filter((id) => isMastered(cards[id])).length
  const session = buildSession(ids, cards, newPerSession, now)
  const nextDue = ids
    .map((id) => cards[id])
    .filter((s) => s && !isDue(s, now))
    .map((s) => new Date(s!.due))
    .sort((a, b) => a.getTime() - b.getTime())[0]

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lernkarten"
        subtitle="Vorderseite: englischer Fachbegriff. Rückseite: Bedeutung, Definition, Merksatz und Beispiel. Deine Bewertung bestimmt, wann die Karte wiederkommt."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Tile icon={CalendarClock} label="Jetzt fällig" value={dueCount} />
        <Tile icon={Sparkles} label="Neu" value={newCount} />
        <Tile icon={CheckCircle2} label="Gefestigt (≥ 7 Tage)" value={mastered} />
        <Tile icon={Layers} label="Karten im Deck" value={deckCards.length} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sitzung starten</CardTitle>
          <CardDescription>Zuerst fällige Wiederholungen, dann neue Karten</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Deck">
            {(Object.keys(DECK_LABEL) as Deck[]).map((d) => (
              <Button key={d} size="sm" variant={deck === d ? 'default' : 'outline'} onClick={() => setDeck(d)} aria-pressed={deck === d}>
                {DECK_LABEL[d]}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Neue Karten pro Sitzung">
            <span className="text-sm text-muted-foreground">Neue Karten pro Sitzung:</span>
            {[0, 5, 10, 25].map((n) => (
              <Button key={n} size="sm" variant={newPerSession === n ? 'secondary' : 'ghost'} onClick={() => setNewPerSession(n)} aria-pressed={newPerSession === n}>
                {n === 25 ? 'alle' : n}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3 border-t pt-4">
            <Button size="lg" disabled={session.length === 0} onClick={() => onStart(session)}>
              <Play /> {session.length} {session.length === 1 ? 'Karte' : 'Karten'} lernen
            </Button>
            {session.length === 0 && (
              <span className="text-sm text-muted-foreground">
                Alles erledigt!{' '}
                {nextDue && `Nächste Wiederholung: ${nextDue.toLocaleString('de-DE', { dateStyle: 'medium', timeStyle: 'short' })}`}
              </span>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alle Karten</CardTitle>
          <CardDescription>Status und nächster Termin je Karte</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {deckCards.map((c) => {
              const s = cards[c.id]
              const due = s && isDue(s, now)
              return (
                <li key={c.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="truncate font-medium">
                      {c.abbr && <span className="mr-2 font-mono text-primary">{c.abbr}</span>}
                      {c.english}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">{c.german}</div>
                  </div>
                  <div className="shrink-0 text-right">
                    {!s ? (
                      <Badge variant="outline">neu</Badge>
                    ) : due ? (
                      <Badge variant="destructive">fällig</Badge>
                    ) : (
                      <Badge variant={isMastered(s) ? 'success' : 'secondary'}>in {formatInterval(Math.max(1, Math.ceil((new Date(s.due).getTime() - now.getTime()) / 86_400_000)))}</Badge>
                    )}
                    {s && <div className="mt-0.5 text-[11px] text-muted-foreground">Leichtigkeit {s.ease.toFixed(2).replace('.', ',')}</div>}
                  </div>
                </li>
              )
            })}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>So funktioniert die Wiederholung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            Die App verwendet eine vereinfachte Form des SM-2-Algorithmus. Jede Karte hat einen Leichtigkeitsfaktor (Start 2,5) und ein
            Intervall in Tagen:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li><b>Nicht gewusst:</b> Karte kommt in dieser Sitzung erneut, Intervall zurück auf 0, Leichtigkeit − 0,20.</li>
            <li><b>Schwer:</b> Intervall × 1,2 (mindestens 1 Tag), Leichtigkeit − 0,15.</li>
            <li><b>Gut:</b> 1 Tag → 3 Tage → danach Intervall × Leichtigkeit.</li>
            <li><b>Sehr leicht:</b> 4 Tage bzw. Intervall × Leichtigkeit × 1,3, Leichtigkeit + 0,15.</li>
          </ul>
          <p>Schwierige Begriffe erhalten so kürzere Abstände und werden häufiger wiederholt. Ab 7 Tagen Intervall gilt eine Karte als gefestigt.</p>
        </CardContent>
      </Card>
    </div>
  )
}

function Tile({ icon: Icon, label, value }: { icon: typeof Layers; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 pt-5">
        <div className="rounded-lg bg-accent p-2 text-accent-foreground">
          <Icon className="size-5" />
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-2xl font-bold tabular-nums">{value}</div>
        </div>
      </CardContent>
    </Card>
  )
}

/* ------------------------------------------------------------------ Sitzung */

const GRADE_STYLE: Record<Grade, string> = {
  0: 'border-destructive/50 text-destructive hover:bg-destructive/10',
  1: 'border-warning/60 text-warning hover:bg-warning/10',
  2: 'border-primary/50 text-primary hover:bg-primary/10',
  3: 'border-success/50 text-success hover:bg-success/10',
}

function StudySession({ initialQueue, onExit }: { initialQueue: string[]; onExit: () => void }) {
  const { cards, rate } = useFlashcardStore()
  const [queue, setQueue] = useState(initialQueue)
  const [flipped, setFlipped] = useState(false)
  const [done, setDone] = useState<Record<Grade, number>>({ 0: 0, 1: 0, 2: 0, 3: 0 })
  const card = queue[0] ? FLASHCARD_BY_ID[queue[0]] : undefined
  const reviewed = done[0] + done[1] + done[2] + done[3]

  const previews = useMemo(() => {
    if (!card) return null
    const s = cards[card.id] ?? newCardState()
    return ([0, 1, 2, 3] as Grade[]).map((g) => review(s, g).interval)
  }, [card, cards])

  const grade = useCallback(
    (g: Grade) => {
      if (!card || !flipped) return
      rate(card.id, g)
      setDone((d) => ({ ...d, [g]: d[g] + 1 }))
      // „Nicht gewusst": Karte kommt am Ende der Sitzung noch einmal
      setQueue((q) => (g === 0 ? [...q.slice(1), q[0]] : q.slice(1)))
      setFlipped(false)
    },
    [card, flipped, rate],
  )

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).tagName === 'INPUT') return
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault()
        setFlipped(true)
      } else if (['1', '2', '3', '4'].includes(e.key)) grade((Number(e.key) - 1) as Grade)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [grade])

  if (!card)
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <PageHeader title="Sitzung abgeschlossen" subtitle={`${reviewed} Bewertungen in dieser Sitzung`} />
        <Card>
          <CardContent className="grid grid-cols-2 gap-3 pt-5 sm:grid-cols-4">
            {([0, 1, 2, 3] as Grade[]).map((g) => (
              <div key={g} className="rounded-lg bg-muted/60 p-3 text-center">
                <div className="text-2xl font-bold">{done[g]}</div>
                <div className="text-xs text-muted-foreground">{GRADE_LABELS[g]}</div>
              </div>
            ))}
          </CardContent>
        </Card>
        <Button onClick={onExit}>Zur Übersicht</Button>
      </div>
    )

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          {queue.length} {queue.length === 1 ? 'Karte' : 'Karten'} übrig · {reviewed} bewertet
        </span>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Beenden
        </Button>
      </div>
      <Progress value={(reviewed / (reviewed + queue.length)) * 100} />

      <div
        {...(!flipped && { role: 'button', tabIndex: 0, 'aria-label': 'Karte umdrehen', onClick: () => setFlipped(true) })}
        className={cn(
          'w-full rounded-2xl border bg-card p-6 text-left shadow-md transition-shadow sm:p-8',
          !flipped && 'min-h-72 cursor-pointer hover:shadow-lg focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none',
        )}
      >
        <div className="flex items-center justify-between">
          <Badge variant="outline">{card.deck === 'grundbegriffe' ? 'Grundbegriff' : 'Erweitert'}</Badge>
          {!cards[card.id] && <Badge variant="accent">neu</Badge>}
        </div>
        <div className="mt-6 text-center">
          {card.abbr && <div className="font-mono text-4xl font-bold text-primary">{card.abbr}</div>}
          <div className="mt-1 text-2xl font-semibold">{card.english}</div>
        </div>
        {!flipped ? (
          <p className="mt-10 text-center text-sm text-muted-foreground">Antippen oder Leertaste zum Umdrehen</p>
        ) : (
          <div className="mt-6 space-y-4 border-t pt-5">
            <p className="text-center text-lg font-medium">{card.german}</p>
            <p className="leading-relaxed">{card.definition}</p>
            <div className="flex gap-2 rounded-lg bg-accent/50 p-3 text-sm">
              <Lightbulb className="mt-0.5 size-4 shrink-0 text-warning" />
              <span className="font-medium">{card.mnemonic}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Beispiel: </span>
              {card.example}
            </p>
            {card.termId && (
              <a href={`#/glossar/${card.termId}`} className="inline-block text-sm text-primary underline-offset-4 hover:underline">
                Ausführlich im Glossar →
              </a>
            )}
          </div>
        )}
      </div>

      {flipped ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Wie gut wusstest du es?">
          {([0, 1, 2, 3] as Grade[]).map((g) => (
            <Button key={g} variant="outline" className={cn('h-auto flex-col gap-0.5 py-2.5', GRADE_STYLE[g])} onClick={() => grade(g)}>
              <span className="font-semibold">{GRADE_LABELS[g]}</span>
              <span className="text-[11px] font-normal opacity-80">
                {previews && formatInterval(previews[g])} · Taste {g + 1}
              </span>
            </Button>
          ))}
        </div>
      ) : (
        <Button className="w-full" size="lg" onClick={() => setFlipped(true)}>
          <RotateCcw /> Umdrehen
        </Button>
      )}
    </div>
  )
}
