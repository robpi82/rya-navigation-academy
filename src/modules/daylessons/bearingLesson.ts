import { BearingBasicsWidget, CrossBearingWidget, TransitWidget } from './bearingWidgets'
import type { DayLesson } from './types'

export const BEARING_LESSON: DayLesson = {
  id: 'bearings',
  title: 'Peilen: Kreuzpeilung und Deckpeilung',
  english: 'Bearings, Cross Bearings & Transits',
  summary: 'Mit dem Handpeilkompass Landmarken anpeilen, Standlinien schneiden, das Fehlerdreieck beurteilen und den Kompassfehler aus einer Deckpeilung bestimmen.',
  body: [
    'Eine Peilung ist die Richtung vom Boot zu einem Objekt. In der Karte trägt man sie rechtweisend ab, also muss die Kompasspeilung zuerst um Variation (und bei einem Bordkompass um die Deviation) korrigiert werden. Das Boot liegt dann auf einer Standlinie, die vom Objekt aus in Richtung der Gegenpeilung (Peilung ± 180°) verläuft.',
    'Zwei Standlinien schneiden sich in der Position (Fix). Mit drei Objekten entsteht bei kleinen Fehlern ein Fehlerdreieck („cocked hat"). Je kleiner es ist, desto besser die Peilungen. Die Objekte sollten etwa 60–90° auseinander liegen; ein Schnittwinkel unter 30° ist ungenau. Peile zuerst die Objekte voraus oder achteraus und zuletzt das querab liegende, weil sich seine Peilung am schnellsten ändert – und notiere die Uhrzeit.',
    'Ein gleich großer Fehler bei allen Peilungen (etwa eine falsche Deviation) verschiebt die Position, ohne das Dreieck zu vergrößern. Eine Deckpeilung (zwei Objekte in einer Linie) ist darum besonders wertvoll: Die Richtung ist aus der Karte exakt bekannt, und der Vergleich mit dem Kompass liefert den Kompassfehler. Bei Gefahren nimmt man als Position die Ecke des Dreiecks, die der Gefahr am nächsten liegt.',
  ],
  keyPoints: [
    'Peilung = Richtung vom Boot zum Objekt. Standlinie = Gegenpeilung, vom Objekt aus abgetragen.',
    'Schnittwinkel 60–90° ideal, unter 30° unbrauchbar.',
    'Großes Fehlerdreieck: Peilungen verwerfen oder wiederholen. Bei Gefahr die ungünstigste Ecke annehmen.',
    'Kompassfehler aus Deckpeilung = wahre Peilung − Kompasspeilung (Ost positiv); Deviation = Gesamtfehler − Variation.',
  ],
  mnemonic: 'Boot → Objekt peilen, vom Objekt zurück abtragen. Und: Wahr minus Kompass = Fehler (Ost +).',
  widgets: [
    { title: 'Peilung, Gegenpeilung und Schnittwinkel', Comp: BearingBasicsWidget },
    { title: 'Kreuzpeilung mit Fehlerdreieck', description: 'Verändere Peilfehler und beobachte, wie die Position wandert.', Comp: CrossBearingWidget },
    { title: 'Kompassfehler aus einer Deckpeilung', Comp: TransitWidget },
  ],
  links: [
    { label: 'Peilaufgaben üben', href: '#/quiz' },
    { label: 'Versegelungspeilung (Coastal)', href: '#/coastal/running-fix' },
  ],
}
