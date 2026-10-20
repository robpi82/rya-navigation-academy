import { QUESTION_BANK } from '@/questions'
import { LessonCatalog, LessonDetail } from '@/modules/lessons/LessonViews'
import type { Lesson } from '@/modules/lessons/types'
import { GreatCircleMapWidget, LightHorizonWidget } from './widgets'

export const YACHT_LESSONS: Lesson[] = [
  {
    id: 'great-circle',
    title: 'Großkreisnavigation',
    english: 'Great Circle Sailing',
    summary: 'Der kürzeste Weg über weite Strecken ist eine Kurve – und wird in Teilstücken mit je einem Kurs gesegelt.',
    body: [
      'Die Erde ist (näherungsweise) eine Kugel, und der kürzeste Weg zwischen zwei Punkten ist der Bogen des Großkreises durch beide. Auf der Mercatorkarte erscheint er als Kurve, die sich zum Pol hin wölbt; die gerade Linie in der Karte ist dagegen die Loxodrome mit konstantem Kurs.',
      'Auf Strecken entlang eines Meridians oder des Äquators sind beide gleich. Je weiter der Längenunterschied und je höher die Breite, desto mehr spart der Großkreis. Dafür ändert sich der Kurs ständig: Du segelst deshalb Teilstücke zwischen Wegpunkten, die du aus dem Großkreis ableitest, und steuerst auf jedem Stück einen konstanten Kurs.',
      'In der Praxis begrenzt man den Großkreis, wenn er zu hohe Breiten erreicht (Eis, Wetter, Strom) – dann entsteht eine zusammengesetzte Route. Wetter, Wind und Strom entscheiden am Ende oft über den besten Weg; der Großkreis ist der Maßstab, nicht das Gesetz.',
    ],
    keyPoints: [
      'Großkreis = kürzester Weg; Loxodrome = konstanter Kurs (Gerade auf der Mercatorkarte).',
      'Meridiane und Äquator sind Großkreise – dort gibt es keine Ersparnis.',
      'Der Kurs ändert sich entlang des Großkreises; deshalb Wegpunkte mit je einem Kurs.',
      'Mehr Teilstücke = Gesamtweg näher am Großkreis; Scheitelpunkt prüfen (höchste Breite).',
    ],
    mnemonic: 'Gerade im Plot ist nicht kürzer – der Bogen zum Pol gewinnt.',
    widgets: [{ title: 'Großkreis und Loxodrome im Nordatlantik', description: 'Teilstücke einstellen und Mehrweg beobachten.', Comp: GreatCircleMapWidget }],
    links: [
      { label: 'Großkreis-Rechner', href: '#/rechner' },
      { label: 'Fragen üben', href: '#/quiz' },
    ],
  },
  {
    id: 'night-navigation',
    title: 'Nachtnavigation',
    english: 'Night Navigation',
    summary: 'Feuer erkennen, Sichtweiten einschätzen und die Augen an die Dunkelheit anpassen.',
    body: [
      'Nachts führen Feuer durch die Küstennavigation. Die Karte nennt Kennung, Feuerhöhe und Nenntragweite. Die Nenntragweite hängt von Lichtstärke und Sicht ab; die geografische Sichtweite von Feuer- und Augenhöhe, weil die Erdkrümmung das Licht verdeckt. Es gilt immer der kleinere der beiden Werte.',
      'Beim Anlaufen siehst du ein Feuer zuerst als Schein am Horizont, bevor es als Punkt auftaucht. Eine höhere Augenhöhe (etwa vom Mastbereich oder von der Plicht) bringt es früher in Sicht. Mit dem Handpeilkompass kannst du es sofort anpeilen und mit einer zweiten Peilung einen Fix gewinnen.',
      'Sektorenfeuer wechseln die Farbe je nach Peilbereich – der Wechsel ist eine exakte Standlinie. Für Karte und Instrumente an Bord verwendest du rotes Licht; die Dunkeladaption der Augen dauert gut 20 Minuten und geht mit einem hellen Licht schnell verloren.',
    ],
    keyPoints: [
      'Sichtweite = Minimum aus Nenntragweite und geografischer Sichtweite.',
      'Geografische Sichtweite ≈ 2,08 · (√Feuerhöhe + √Augenhöhe) in NM, Höhen in m.',
      'Rotes Licht schont die Dunkeladaption.',
      'Sektorwechsel = exakte Standlinie; Kennung immer zuerst sicher identifizieren.',
    ],
    mnemonic: 'Der kleinere Wert gewinnt: Kimm oder Lichtstärke.',
    widgets: [{ title: 'Wann taucht das Feuer auf?', description: 'Feuer-, Augenhöhe und Nenntragweite verändern.', Comp: LightHorizonWidget }],
    links: [{ label: 'Feuerkennung entschlüsseln', href: '#/themen/chart-reading' }],
  },
]

export function YachtmasterPage({ lessonId }: { lessonId?: string }) {
  const lesson = YACHT_LESSONS.find((l) => l.id === lessonId)
  return lesson ? (
    <LessonDetail lesson={lesson} lessons={YACHT_LESSONS} basePath="#/yachtmaster" backLabel="Alle Lektionen" />
  ) : (
    <LessonCatalog
      title="Yachtmaster (Vorgriff)"
      subtitle="Erste Themen über den Coastal-Stoff hinaus: Großkreisnavigation und Nachtnavigation – jeweils mit interaktiver Übung."
      lessons={YACHT_LESSONS}
      basePath="#/yachtmaster"
      quizLabel={`${QUESTION_BANK.filter((q) => q.level === 'yachtmaster-offshore').length} Yachtmaster-Fragen üben`}
    />
  )
}
