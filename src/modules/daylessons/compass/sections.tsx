import type { ComponentType, ReactNode } from 'react'
import type { Lesson } from '@/modules/lessons/types'

/** Ein Lernabschnitt von Lektion 1; die Abschnitts-IDs sind zugleich die Schlüssel im Abschnittsfortschritt. */
export interface CompassSection {
  id: string
  title: string
  /** Kurztitel für die Kapitel-Navigation */
  short: string
  english: string
  intro?: ReactNode
  /** kurze Erklärungsblöcke statt einer Textwand */
  blocks?: { title: string; text: ReactNode }[]
  /** Kernaussagen der Lektion, die zu diesem Abschnitt gehören */
  keyPoints?: string[]
  /** Merksatz der Lektion anzeigen */
  mnemonic?: boolean
  /** Abbildung zum Abschnitt (gezeichnet, kein Ersatz für einen Rechner) */
  Figure?: ComponentType
  widget?: { title: string; description?: string; Comp: ComponentType }
}

const T = ({ children }: { children: ReactNode }) => <span className="term">{children}</span>

/** Drei Nordrichtungen: rechtweisend, missweisend, Kompass (Winkel zur Verdeutlichung überzeichnet). */
function NorthDiagram() {
  const ox = 120
  const oy = 190
  const p = (a: number, r: number) => [ox + r * Math.sin((a * Math.PI) / 180), oy - r * Math.cos((a * Math.PI) / 180)] as const
  const arc = (a1: number, a2: number, r: number) => {
    const [x1, y1] = p(a1, r)
    const [x2, y2] = p(a2, r)
    return `M ${x1} ${y1} A ${r} ${r} 0 0 ${a2 > a1 ? 1 : 0} ${x2} ${y2}`
  }
  const lines = [
    { a: 0, label: 'True', sub: 'rechtweisend', color: 'var(--lesson-gold)' },
    { a: -22, label: 'Magnetic', sub: 'missweisend', color: 'var(--lesson-teal)' },
    { a: -10, label: 'Compass', sub: 'Kompass', color: 'var(--foreground)' },
  ]
  return (
    <figure className="flex flex-col justify-center gap-2 rounded-xl border bg-(--chart-sea) p-4">
      <svg viewBox="-20 0 220 205" className="mx-auto h-auto w-full max-w-[18rem]" role="img" aria-label="Rechtweisend Nord, missweisend Nord und Kompass-Nord mit Variation und Deviation dazwischen">
        <path d={arc(-22, 0, 95)} fill="none" stroke="var(--lesson-gold)" strokeWidth={2} />
        <path d={arc(-22, -10, 128)} fill="none" stroke="var(--lesson-teal)" strokeWidth={2} />
        {lines.map((l) => {
          const [x, y] = p(l.a, 160)
          const [lx, ly] = p(l.a, 172)
          return (
            <g key={l.label}>
              <line x1={ox} y1={oy} x2={x} y2={y} stroke={l.color} strokeWidth={l.a === 0 ? 3 : 2.25} strokeLinecap="round" />
              <text x={lx + (l.a < -15 ? -6 : l.a < 0 ? 0 : 4)} y={ly - 2} fontSize={11} fontWeight={600} textAnchor={l.a < -15 ? 'end' : l.a < 0 ? 'middle' : 'start'} fill={l.color}>
                {l.label}
              </text>
            </g>
          )
        })}
        <text {...xy(p(4, 96))} fontSize={10} textAnchor="start" fill="var(--lesson-gold)">
          Variation
        </text>
        <text {...xy(p(-27, 128))} fontSize={10} textAnchor="end" fill="var(--lesson-teal)">
          Deviation
        </text>
        <circle cx={ox} cy={oy} r={4} fill="var(--foreground)" />
      </svg>
      <figcaption className="text-center text-xs text-muted-foreground">Beispiel: Variation West, Deviation Ost – Winkel überzeichnet</figcaption>
    </figure>
  )
}
const xy = ([x, y]: readonly [number, number]) => ({ x, y })

/** Aufteilung der Lektion in sechs Lernabschnitte; Texte, Kernaussagen und Rechner stammen aus der Lektion selbst. */
export function compassSections(lesson: Lesson): CompassSection[] {
  const [kpVariation, kpDeviation, kpDirection, kpNormalize] = lesson.keyPoints ?? []
  const [converter, table, year] = lesson.widgets
  return [
    {
      id: 'grundlagen',
      title: 'Grundlagen: Compass, Magnetic und True',
      short: 'Grundlagen',
      english: 'Compass, Magnetic & True',
      intro: 'Drei Nordrichtungen, zwei Korrekturen – wer die Kette kennt, rechnet jeden Kurs sicher um.',
      blocks: [
        { title: 'True – rechtweisend', text: <>Karten und Peilungen beziehen sich auf <T>geografisch (rechtweisend) Nord</T>.</> },
        { title: 'Magnetic – missweisend', text: <>Der Kompass richtet sich aber nach dem <T>Magnetfeld der Erde</T> und zeigt nach magnetisch Nord.</> },
        { title: 'Compass – Kompass', text: <>Der Bordkompass zeigt nicht rechtweisend Nord: <T>Variation</T> (Missweisung der Erde) und <T>Deviation</T> (Ablenkung durch das Schiff) müssen angebracht werden.</> },
        {
          title: 'Die Umrechnungskette',
          text: (
            <>
              Die Umrechnung verläuft in der Kette <T>Compass → Deviation → Magnetic → Variation → True</T>. Ost wird dabei beim Weg „von C nach T" addiert, West subtrahiert; in der Gegenrichtung genau umgekehrt.
            </>
          ),
        },
      ],
      keyPoints: [kpDirection, kpNormalize].filter(Boolean),
      mnemonic: true,
      Figure: NorthDiagram,
    },
    {
      id: 'variation',
      title: 'Variation: Missweisung der Erde',
      short: 'Variation',
      english: 'Variation',
      blocks: [
        { title: 'Was ist Variation?', text: <>Der Winkel zwischen rechtweisend und magnetisch Nord ist die <T>Variation (Missweisung)</T>.</> },
        { title: 'Ortsabhängig', text: <>Sie <T>hängt vom Ort ab</T> und ändert sich langsam im Laufe der Jahre.</> },
        { title: 'Quelle: Kartenrose', text: <>Sie steht in der <T>Kompassrose der Karte</T> – mit Jahr und jährlicher Änderung (Abschnitt 6 rechnet sie auf ein Zieljahr um).</> },
      ],
      keyPoints: [kpVariation].filter(Boolean),
    },
    {
      id: 'deviation',
      title: 'Deviation: Ablenkung durch das Schiff',
      short: 'Deviation',
      english: 'Deviation',
      blocks: [
        { title: 'Ursache an Bord', text: <>Eisenteile, Motor, Elektronik und Lautsprecher an Bord lenken die Kompassnadel ab. Dieser Fehler heißt <T>Deviation</T>.</> },
        { title: 'Kursabhängig', text: <>Er <T>hängt vom Kurs des Bootes ab</T> und wird in einer <T>Deviationstabelle</T> festgehalten.</> },
        { title: 'Handpeilkompass', text: <>Ein Handpeilkompass, den man fern von Eisenteilen, Motor und Elektronik benutzt, hat in der Regel <T>keine nennenswerte Deviation</T> – hier genügt die Variation.</> },
      ],
      keyPoints: [kpDeviation].filter(Boolean),
    },
    { id: 'umrechnung', title: 'Interaktive Kursumrechnung', short: 'Kursumrechnung', english: 'Navigation Lab: Compass ↔ True', widget: converter },
    { id: 'tabelle', title: 'Deviationstabelle und Interpolation', short: 'Deviationstabelle', english: 'Deviation Card & Interpolation', widget: table },
    { id: 'jahr', title: 'Variation für ein bestimmtes Jahr berechnen', short: 'Variation im Jahr', english: 'Annual Change of Variation', widget: year },
  ]
}
