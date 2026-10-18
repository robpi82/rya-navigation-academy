import type { ComponentType } from 'react'
import { ArrowLeft, ArrowRight, CheckCircle2, Circle, GraduationCap, Lightbulb, Map } from 'lucide-react'
import { QUESTION_BANK } from '@/questions'
import { useProgressStore } from '@/stores/progressStore'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import type { CoastalTopicId } from '@/types/learning'
import { ClearingBearingWidget, MultiHourWidget, PassagePlanningWidget, RunningFixWidget, TwelfthsWidget } from './widgets'

export interface Lesson {
  id: CoastalTopicId
  title: string
  english: string
  summary: string
  body: string[]
  mnemonic: string
  widgetTitle: string
  Widget: ComponentType
  chartLink?: boolean
}

export const LESSONS: Lesson[] = [
  {
    id: 'multi-hour-tide',
    title: 'Course to Steer über mehrere Stromstunden',
    english: 'Multi-hour Course to Steer',
    summary: 'Bei längeren Überfahrten werden die Stromvektoren aller Stunden addiert und ein einziger Kurs gesteuert.',
    body: [
      'Auf Coastal-Skipper-Niveau dauern Überfahrten oft mehrere Stunden, während der Gezeitenstrom seine Richtung und Stärke stündlich ändert – bis hin zum Kentern.',
      'Statt jede Stunde neu gegen den Strom vorzuhalten, schätzt man zuerst die Fahrtzeit (Distanz / STW), addiert dann die Stromvektoren dieser Stunden hintereinander und trägt vom Ende der Stromkette die Strecke STW × Fahrtzeit bis zum Ground Track ab. Die Richtung dieser Linie ist der Water Track; um Leeway korrigiert ergibt sich ein einheitlicher Course to Steer.',
      'Vorteil: Gegenläufige Ströme heben sich teilweise auf – der Weg durchs Wasser wird kürzer. Das Boot weicht unterwegs vom Ground Track ab und kommt am Ende wieder darauf zurück. Prüfe deshalb, dass die seitliche Abweichung keine Gefahren berührt.',
    ],
    mnemonic: 'Erst Zeit schätzen, dann alle Ströme addieren, dann einmal Kurs bestimmen.',
    widgetTitle: 'Passage mit wechselndem Strom berechnen',
    Widget: MultiHourWidget,
    chartLink: true,
  },
  {
    id: 'running-fix',
    title: 'Versegelungspeilung',
    english: 'Running Fix',
    summary: 'Ein Fix mit nur einem Objekt: zwei zeitversetzte Peilungen, die erste Standlinie wird um den Weg über Grund verschoben.',
    body: [
      'Ist nur ein einziges identifizierbares Objekt in Sicht (z. B. ein Leuchtturm), peilt man es zweimal im Abstand von etwa 20–60 Minuten. Die Peilung sollte sich dabei um mindestens 30° geändert haben.',
      'Die erste Standlinie wird parallel um den Weg verschoben, den das Boot zwischen den Peilungen über Grund zurückgelegt hat – also Water Track und Logdistanz plus Strom. Der Schnitt mit der zweiten Standlinie ist der Running Fix.',
      'Die Genauigkeit hängt direkt von der Qualität des geschätzten Weges ab. Fehler bei Strom oder Leeway gehen voll in den Fix ein. Im Plot wird der Running Fix wie ein Fix mit Uhrzeit, aber mit dem Zusatz „RF" gekennzeichnet.',
    ],
    mnemonic: 'Peilen – versegeln – Standlinie mitnehmen – erneut peilen – schneiden.',
    widgetTitle: 'Running Fix konstruieren',
    Widget: RunningFixWidget,
  },
  {
    id: 'clearing-bearing',
    title: 'Gefahrenpeilung',
    english: 'Clearing Bearing',
    summary: 'Eine vorab in der Karte festgelegte Grenzpeilung, die eine Gefahr sicher freihält.',
    body: [
      'Bei der Planung zieht man von einem gut erkennbaren Objekt eine Linie, die knapp an der Gefahr vorbeiführt. Solange die Peilung zum Objekt auf der sicheren Seite dieser Linie bleibt, ist man frei von der Gefahr – ganz ohne Positionsbestimmung.',
      'Angegeben wird sie als „NMT" (not more than) oder „NLT" (not less than) mit der rechtweisenden Peilung. Für den Handpeilkompass muss sie in eine missweisende Peilung umgerechnet werden.',
      'Gefahrenpeilungen eignen sich besonders bei der Ansteuerung (Pilotage), wenn keine Zeit für Plotarbeit bleibt.',
    ],
    mnemonic: 'NMT: Zahl darf nicht größer werden. NLT: Zahl darf nicht kleiner werden.',
    widgetTitle: 'Peilung prüfen',
    Widget: ClearingBearingWidget,
  },
  {
    id: 'tidal-height',
    title: 'Gezeitenhöhe und Zwölftelregel',
    english: 'Tidal Height & Rule of Twelfths',
    summary: 'Wassertiefe = Kartentiefe + Höhe der Gezeit. Die Zwölftelregel schätzt die Höhe zwischen NW und HW.',
    body: [
      'Die Kartentiefe bezieht sich auf das Seekartennull (Chart Datum, meist ungefähr das niedrigste Niedrigwasser). Die tatsächliche Wassertiefe ist Kartentiefe plus aktuelle Höhe der Gezeit.',
      'Die Zwölftelregel verteilt den Tidenhub auf sechs Stunden im Verhältnis 1-2-3-3-2-1. In der dritten und vierten Stunde steigt (oder fällt) das Wasser am schnellsten.',
      'Die Regel ist eine Näherung für gleichmäßige Gezeitenkurven. Für Häfen mit ungewöhnlichen Kurven verwendet man die Gezeitenkurve des Standardhafens aus dem Almanach.',
    ],
    mnemonic: '1-2-3-3-2-1: In der Mitte der Tide passiert am meisten.',
    widgetTitle: 'Wann ist die Barre passierbar?',
    Widget: TwelfthsWidget,
  },
  {
    id: 'passage-planning',
    title: 'Törnplanung',
    english: 'Passage Planning',
    summary: 'Systematische Vorbereitung: Wetter, Gezeiten, Gefahren, Navigationshilfen, Ausweichhäfen, Crew.',
    body: [
      'Ein Coastal Skipper plant jede Überfahrt vorab schriftlich: Abfahrtszeit nach Strom und Tiefe, Kurse und Distanzen zwischen Wegpunkten, Gefahrenpeilungen, Ausweichhäfen und ein Plan für die Ansteuerung bei Nacht oder schlechter Sicht.',
      'Gute Planung nutzt den Gezeitenstrom: Eine Abfahrt eine Stunde später kann bei 2 kn Strom mehrere Stunden Fahrtzeit sparen. Wind gegen Strom erzeugt steile, gefährliche Seen – solche Phasen werden gemieden.',
      'Der Plan ist die Grundlage für Entscheidungen unterwegs. Weicht die Lage ab (Wetter, Crew, Technik), wird anhand des Plans neu entschieden.',
    ],
    mnemonic: 'Plane den Törn – und fahre den Plan, solange er passt.',
    widgetTitle: 'Checkliste für die Planung',
    Widget: PassagePlanningWidget,
  },
]

export function CoastalPage({ lessonId }: { lessonId?: string }) {
  const lesson = LESSONS.find((l) => l.id === lessonId)
  return lesson ? <LessonView lesson={lesson} /> : <Overview />
}

function Overview() {
  const completed = useProgressStore((s) => s.completedLessons)
  const coastalQuestions = QUESTION_BANK.filter((q) => q.level === 'coastal-skipper').length
  const done = LESSONS.filter((l) => completed.includes(l.id)).length
  return (
    <div className="space-y-6">
      <PageHeader
        title="Coastal Skipper"
        subtitle="Aufbauende Lerninhalte zur Küstennavigation – jede Lektion mit interaktiver Übung. Ergänzend: Coastal-Aufgaben im Prüfungstrainer und in der Seekarte."
      />
      <Card>
        <CardContent className="flex flex-col gap-3 pt-5 sm:flex-row sm:items-center">
          <div className="flex-1">
            <div className="mb-1 flex justify-between text-sm">
              <span>Lektionen abgeschlossen</span>
              <span className="font-mono">
                {done} / {LESSONS.length}
              </span>
            </div>
            <Progress value={(done / LESSONS.length) * 100} />
          </div>
          <Button asChild variant="outline">
            <a href="#/quiz">
              <GraduationCap /> {coastalQuestions} Coastal-Fragen üben
            </a>
          </Button>
        </CardContent>
      </Card>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {LESSONS.map((l, i) => (
          <a key={l.id} href={`#/coastal/${l.id}`} className="group rounded-xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md">
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
        ))}
      </div>
    </div>
  )
}

function LessonView({ lesson }: { lesson: Lesson }) {
  const { completedLessons, toggleLesson } = useProgressStore()
  const idx = LESSONS.indexOf(lesson)
  const next = LESSONS[(idx + 1) % LESSONS.length]
  const done = completedLessons.includes(lesson.id)
  return (
    <div className="space-y-6">
      <Button asChild variant="ghost" size="sm" className="-ml-2">
        <a href="#/coastal">
          <ArrowLeft /> Alle Lektionen
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
          {lesson.chartLink && (
            <Button asChild variant="outline" className="w-full">
              <a href="#/seekarte">
                <Map /> In der Seekarte üben
              </a>
            </Button>
          )}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{lesson.widgetTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          <lesson.Widget />
        </CardContent>
      </Card>
      <div className="flex justify-end border-t pt-4">
        <Button asChild variant="ghost">
          <a href={`#/coastal/${next.id}`}>
            Nächste Lektion: {next.title} <ArrowRight />
          </a>
        </Button>
      </div>
    </div>
  )
}
