import { QUESTION_BANK } from '@/questions'
import type { CoastalTopicId } from '@/types/learning'
import { LessonCatalog, LessonDetail } from '@/modules/lessons/LessonViews'
import type { Lesson } from '@/modules/lessons/types'
import { ClearingBearingWidget, MultiHourWidget, PassagePlanningWidget, RunningFixWidget, TwelfthsWidget } from './widgets'

export type CoastalLesson = Lesson & { id: CoastalTopicId }

export const LESSONS: CoastalLesson[] = [
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
    widgets: [{ title: 'Passage mit wechselndem Strom berechnen', Comp: MultiHourWidget }],
    links: [{ label: 'In der Seekarte üben', href: '#/seekarte' }],
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
    widgets: [{ title: 'Running Fix konstruieren', Comp: RunningFixWidget }],
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
    widgets: [{ title: 'Peilung prüfen', Comp: ClearingBearingWidget }],
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
    widgets: [{ title: 'Wann ist die Barre passierbar?', Comp: TwelfthsWidget }],
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
    widgets: [{ title: 'Checkliste für die Planung', Comp: PassagePlanningWidget }],
  },
]

export function CoastalPage({ lessonId }: { lessonId?: string }) {
  const lesson = LESSONS.find((l) => l.id === lessonId)
  return lesson ? (
    <LessonDetail lesson={lesson} lessons={LESSONS} basePath="#/coastal" backLabel="Alle Lektionen" />
  ) : (
    <LessonCatalog
      title="Coastal Skipper"
      subtitle="Aufbauende Lerninhalte zur Küstennavigation – jede Lektion mit interaktiver Übung. Ergänzend: Coastal-Aufgaben im Prüfungstrainer und in der Seekarte."
      lessons={LESSONS}
      basePath="#/coastal"
      quizLabel={`${QUESTION_BANK.filter((q) => q.level === 'coastal-skipper').length} Coastal-Fragen üben`}
    />
  )
}
