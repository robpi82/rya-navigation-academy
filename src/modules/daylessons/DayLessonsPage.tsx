import { DAY_TOPIC_IDS } from '@/data/topics'
import { QUESTION_BANK } from '@/questions'
import { LessonCatalog, LessonDetail } from '@/modules/lessons/LessonViews'
import { BuoyGalleryWidget, BuoyTrainerWidget, LateralDirectionWidget } from './buoyWidgets'
import { LightDecoderWidget, LightRangeWidget, SoundingsWidget, SymbolBrowserWidget } from './chartWidgets'
import { CompassConverterWidget, DeviationTableWidget, VariationYearWidget } from './compassWidgets'
import { BEARING_LESSON } from './bearingLesson'
import { PREPARATION_LESSON } from './preparationLesson'
import { SEAMANSHIP_LESSON } from './seamanshipLesson'
import { ENVIRONMENT_LESSON } from './environmentLesson'
import { INSHORE_LESSON } from './inshoreLesson'
import { SAFETY_LESSONS } from './safetyLessons'
import type { DayLesson } from './types'
import { DAY_LESSON_CARD_IMAGES } from './cardImages'
import { AnchorTideWidget, SpringNeapWidget, TideHeightWidget } from './tideWidgets'


const CORE_LESSONS: DayLesson[] = [
  {
    id: 'compass',
    title: 'Kompass, Variation und Deviation',
    english: 'Compass, Variation & Deviation',
    summary: 'Der Bordkompass zeigt nicht rechtweisend Nord: Missweisung der Erde (Variation) und Ablenkung durch das Schiff (Deviation) müssen angebracht werden.',
    body: [
      'Karten und Peilungen beziehen sich auf geografisch (rechtweisend) Nord. Der Kompass richtet sich aber nach dem Magnetfeld der Erde. Der Winkel zwischen rechtweisend und magnetisch Nord ist die Variation (Missweisung). Sie hängt vom Ort ab, ändert sich langsam im Laufe der Jahre und steht in der Kompassrose der Karte.',
      'Zusätzlich lenken Eisenteile, Motor, Elektronik und Lautsprecher an Bord die Kompassnadel ab. Dieser Fehler heißt Deviation. Er hängt vom Kurs des Bootes ab und wird in einer Deviationstabelle festgehalten. Ein Handpeilkompass, den man fern von Eisenteilen, Motor und Elektronik benutzt, hat in der Regel keine nennenswerte Deviation – hier genügt die Variation.',
      'Die Umrechnung verläuft in der Kette Compass → Deviation → Magnetic → Variation → True. Ost wird dabei beim Weg „von C nach T" addiert, West subtrahiert; in der Gegenrichtung genau umgekehrt.',
    ],
    keyPoints: [
      'Variation: Missweisung der Erde, ortsabhängig, steht in der Kartenrose (mit Jahr und jährlicher Änderung).',
      'Deviation: Ablenkung durch das Schiff, kursabhängig, aus der Deviationstabelle.',
      'Kompass → rechtweisend: Ost addieren, West subtrahieren. Rechtweisend → Kompass: umgekehrt.',
      'Ergebnisse über 360° bzw. unter 0° auf 000°–359° normieren.',
    ],
    mnemonic: '„Cadbury\'s Dairy Milk Very Tasty" = Compass – Deviation – Magnetic – Variation – True. Nach rechts: Ost-Plus. Nach links: Ost-Minus.',
    widgets: [
      { title: 'Kompass ↔ rechtweisend umrechnen', description: 'Die Kette wird Schritt für Schritt angezeigt.', Comp: CompassConverterWidget },
      { title: 'Deviationstabelle lesen', description: 'Zwischen den Tabellenwerten wird interpoliert.', Comp: DeviationTableWidget },
      { title: 'Variation für das aktuelle Jahr', description: 'Die Kartenrose nennt Variation, Jahr und jährliche Änderung.', Comp: VariationYearWidget },
    ],
    links: [{ label: 'Kompass-Aufgaben üben', href: '#/quiz' }],
  },
  {
    id: 'tides',
    title: 'Gezeiten und Gezeitenhöhen',
    english: 'Tides & Heights of Tide',
    summary: 'Hoch- und Niedrigwasser, Spring- und Nipptide, Höhe der Gezeit und die Frage: Wie viel Wasser habe ich unter dem Kiel?',
    body: [
      'Die Gezeiten entstehen vor allem durch die Anziehung von Mond und Sonne. Hochwasser (HW) und Niedrigwasser (NW) wechseln etwa alle sechs Stunden. Der Unterschied ist der Tidenhub. Bei Neu- und Vollmond summieren sich die Kräfte von Sonne und Mond: Springtide mit großem Tidenhub, meist mit ein bis zwei Tagen Verzögerung. Bei Halbmond wirken sie im rechten Winkel: Nipptide mit kleinem Tidenhub.',
      'Alle Tiefen der Seekarte beziehen sich auf das Kartennull (Chart Datum, meist der niedrigste astronomische Gezeitenstand). Die Höhe der Gezeit sagt, wie viel Wasser zusätzlich darüber steht. Wassertiefe = Kartentiefe + Höhe der Gezeit; bei trockenfallenden Stellen (unterstrichene Zahl) gilt: Wassertiefe = Höhe der Gezeit − Trockenhöhe.',
      'Aus den Gezeitentafeln (Zeiten und Höhen von HW und NW des Standardhafens) berechnet man die Höhe zu jeder Uhrzeit mit der Gezeitenkurve. In dieser App dient ein Kosinusmodell als Näherung. Wichtig: Gezeitenstrom (horizontale Wasserbewegung) und Gezeitenhöhe (vertikaler Wasserstand) sind verschiedene Dinge und laufen zeitlich nicht gleich.',
    ],
    keyPoints: [
      'Tidenhub = HW − NW. Springtide: größter Hub, Nipptide: kleinster Hub.',
      'Wassertiefe = Kartentiefe + Höhe der Gezeit.',
      'Wasser unter dem Kiel = Wassertiefe − Tiefgang (plus Sicherheitsreserve!).',
      'Beim Ankern zählt die Tiefe bei Hochwasser (mehr Kette) – und der Platz beim Niedrigwasser (nicht trockenfallen).',
    ],
    mnemonic: 'Karte + Tide = Tiefe. Und: Immer prüfen, ob du bei NW noch schwimmst.',
    widgets: [
      { title: 'Höhe der Gezeit, Tiefe und Zeitfenster', description: 'Wann kannst du die Untiefe passieren?', Comp: TideHeightWidget },
      { title: 'Mond und Gezeiten', description: 'Spring- und Nipptide im Mondzyklus.', Comp: SpringNeapWidget },
      { title: 'Ankern bei Gezeiten', description: 'Kettenlänge und Schwojkreis.', Comp: AnchorTideWidget },
    ],
    links: [
      { label: 'Gezeitenaufgaben üben', href: '#/quiz' },
      { label: 'Zwölftelregel (Coastal)', href: '#/coastal/tidal-height' },
    ],
  },
  {
    id: 'chart-reading',
    title: 'Seekarte lesen: Symbole, Tiefen, Feuer',
    english: 'Chart Reading',
    summary: 'Kartennull, Lotungen, trockenfallende Höhen, Abkürzungen und die Kennung von Leuchtfeuern richtig lesen.',
    body: [
      'Die Seekarte ist das wichtigste Navigationsmittel. Tiefen sind in Metern und Dezimetern angegeben (eine kleine tiefgestellte Ziffer sind die Dezimeter). Unterstrichene Zahlen sind Trockenhöhen. Farben zeigen Wassertiefen an – flaches Wasser ist häufig blau getönt, trockenfallende Flächen sind grün oder grau.',
      'Höhen von Landmarken und Feuern beziehen sich auf britischen Karten meist auf das mittlere Springhochwasser (MHWS), lichte Höhen von Brücken und Leitungen auf neueren Karten auf den höchsten astronomischen Gezeitenstand (HAT) – der Kartentitel nennt den Bezug. Tiefen beziehen sich auf das Kartennull. Abstände misst man immer am seitlichen Breitenmaßstab: 1 Bogenminute Breite = 1 Seemeile. Der untere Längenmaßstab ist wegen der Mercatorprojektion nicht dafür geeignet.',
      'Leuchtfeuer sind mit Kennung, Farbe, Periode, Höhe und Tragweite beschrieben, z. B. „Fl(2) WR 10s 24m 15M". Wie weit man ein Feuer tatsächlich sieht, hängt außerdem von der Augenhöhe und der Sicht ab. Karten müssen mit Berichtigungen (Nachrichten für Seefahrer) aktuell gehalten werden.',
    ],
    keyPoints: [
      'Tiefen: Kartennull. Höhen: MHWS. Unterstrichene Zahl = trockenfallend.',
      'Distanz am Breitenmaßstab (1′ = 1 NM) abgreifen – nie am Längenmaßstab.',
      'PA, ED, PD (Position approximate / Existence doubtful / Position doubtful): Abstand halten.',
      'Karten berichtigen; ein Kartenausschnitt in Papierform sollte jederzeit verfügbar sein.',
    ],
    mnemonic: 'Breitenmaßstab = Seemeilenlineal: Eine Minute Breite ist eine Seemeile.',
    widgets: [
      { title: 'Symbole und Abkürzungen', description: 'Verzeichnis zum Durchsuchen.', Comp: SymbolBrowserWidget },
      { title: 'Feuerkennung entschlüsseln', description: 'Gib eine Kennung ein – die App erklärt sie und lässt das Feuer blinken.', Comp: LightDecoderWidget },
      { title: 'Tiefen im Kartenausschnitt', description: 'Welche Stelle ist bei welcher Gezeitenhöhe befahrbar?', Comp: SoundingsWidget },
      { title: 'Sichtweite von Feuern', Comp: LightRangeWidget },
    ],
    links: [{ label: 'Seekarte üben', href: '#/seekarte' }],
  },
  {
    id: 'buoyage',
    title: 'Seezeichen und Betonnung (IALA A)',
    english: 'Buoyage',
    summary: 'Lateral-, Kardinal-, Einzelgefahren-, Mitte-Fahrwasser- und Spezialtonnen erkennen und richtig passieren.',
    body: [
      'Seezeichen werden nach international abgestimmten Regeln gekennzeichnet. In Europa gilt das System A: Beim Einlaufen („in Richtung der Betonnung") ist rot an Backbord (links) und grün an Steuerbord (rechts). In Nord- und Südamerika, Japan und Korea gilt System B mit umgekehrten Farben.',
      'Kardinalzeichen (Nord, Ost, Süd, West) zeigen, in welcher Himmelsrichtung vom Zeichen das sichere Wasser liegt. Sie sind schwarz-gelb, die Spitzen der zwei schwarzen Kegel verraten die Himmelsrichtung. Die Blitzzahl der weißen Lichter entspricht dem Ziffernblatt: 3 = Ost, 6 = Süd (plus Langblitz), 9 = West, Nord blitzt ununterbrochen.',
      'Einzelgefahrenzeichen (schwarz mit rotem Band) stehen auf einer Gefahr, Mitte-Fahrwasser-Zeichen (rot-weiß) markieren befahrbares Wasser, gelbe Spezialzeichen besondere Bereiche. Die Zeichen sind eigenständig erklärt – bei ernsthafter Nutzung bitte mit offiziellen IALA- und Seehandbuch-Angaben abgleichen.',
    ],
    keyPoints: [
      'Einlaufen (System A): rot links (Backbord), grün rechts (Steuerbord).',
      'Kardinal: Kegelspitzen nach oben = Nord, nach unten = Süd, Basis an Basis = Ost, Spitze an Spitze = West.',
      'Blitze wie ein Ziffernblatt: 3 Ost, 6 Süd (+ Langblitz), 9 West, Nord dauernd.',
      'Gefahrenzeichen großzügig umfahren, bei Zweifel Karte und Echolot nutzen.',
    ],
    mnemonic: 'Schwarz zeigt in Richtung der Kegel-Spitzen: Spitzen nach oben = Nord, nach unten = Süd.',
    widgets: [
      { title: 'Tonnen-Galerie', description: 'Aussehen, Toppzeichen, Kennung und Passieren – mit animiertem Licht.', Comp: BuoyGalleryWidget },
      { title: 'Erkennungs-Training', description: 'Welche Tonne siehst du?', Comp: BuoyTrainerWidget },
      { title: 'Einlaufen und Auslaufen, System A und B', Comp: LateralDirectionWidget },
    ],
    links: [{ label: 'Seezeichen-Aufgaben üben', href: '#/quiz' }],
  },
]

export const DAY_LESSONS: DayLesson[] = [...CORE_LESSONS, ...SAFETY_LESSONS, BEARING_LESSON, PREPARATION_LESSON, SEAMANSHIP_LESSON, ENVIRONMENT_LESSON, INSHORE_LESSON]

export function DayLessonsPage({ lessonId }: { lessonId?: string }) {
  const lesson = DAY_LESSONS.find((l) => l.id === lessonId)
  return lesson ? (
    <LessonDetail lesson={lesson} lessons={DAY_LESSONS} basePath="#/themen" backLabel="Alle Themen" />
  ) : (
    <LessonCatalog
      title="Day Skipper"
      subtitle="Die Grundlagen für Tagestörns in bekannten Gewässern: Kompass, Gezeiten, Karte und Betonnung, Kollisionsverhütung, Wetter, Sicherheit, Seemannschaft, Umwelt und Pilotage – jede Lektion mit interaktiven Übungen. Dazu die neun Grundbegriffe im Glossar."
      lessons={DAY_LESSONS}
      basePath="#/themen"
      cardImages={DAY_LESSON_CARD_IMAGES}
      quizLabel={`${QUESTION_BANK.filter((q) => DAY_TOPIC_IDS.includes(q.topic as never)).length} Fragen zu diesen Themen`}
    />
  )
}
