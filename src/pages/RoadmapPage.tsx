import { CheckCircle2, Circle } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const PHASES = [
  {
    phase: 1,
    title: 'Funktionsfähiges MVP',
    done: true,
    items: [
      'Grundlayout mit Navigation, Dark/Light Mode, responsive',
      'Dashboard mit Lernfortschritt',
      'Glossar mit neun Begriffen und Illustrationen',
      'Interaktiver Navigationssimulator mit Animation',
      'Getestete Berechnungsfunktionen (inkl. Course to Steer)',
      '15 Quizfragen mit Lern- und Prüfungsmodus',
      'Lokale Speicherung (LocalStorage)',
    ],
  },
  {
    phase: 2,
    title: 'Erweiterung',
    done: true,
    items: [
      '50 Quizfragen mit Fragetypen Zuordnung, Fehlererkennung, Vektordiagramm und Kursberechnung',
      'Filter nach Thema, Aufgabentyp und Schwierigkeit',
      '21 Lernkarten mit Spaced Repetition (Nicht gewusst / Schwer / Gut / Sehr leicht)',
      'Erweiterte Lernstatistiken (Lernaktivität, Kartenstand, Fehlerquote nach Aufgabentyp)',
      'Navigationsrechner: DST, ETA, COG, SOG, Tidal Stream, Course to Steer, EP',
    ],
  },
  {
    phase: 3,
    title: 'Fortgeschrittene Navigation',
    done: true,
    items: [
      'Interaktive Seekarte (fiktives Revier, Mercator): Gitter, Breiten-/Längengrade, Breitenmaßstab, Kompassrose',
      'Werkzeuge: Start/Ziel, Kurslinie, Messen, Winkel, Positionen, Zoom und Verschieben (auch Touch)',
      '11 Kartenaufgaben: Kurs/Distanz, Kreuzpeilung, EP plotten, Strom am Tidal Diamond, Course to Steer',
      'Kursplanung mit Strom über mehrere Stunden (Tidal Diamonds A–C)',
      'Coastal Skipper: 5 Lektionen mit interaktiven Übungen und 12 Prüfungsfragen',
    ],
  },
  {
    phase: 4,
    title: 'Day-Skipper-Themen',
    done: true,
    items: [
      'Kompass, Variation und Deviation: Umrechnungskette, Deviationstabelle, Variation im aktuellen Jahr',
      'Gezeiten: Höhe der Gezeit, Wassertiefe, Zeitfenster, Spring-/Nipptide, Ankern bei Gezeiten',
      'Kartenkunde: Symbolverzeichnis, Feuerkennungen entschlüsseln (animiert), Tiefen im Kartenausschnitt',
      'Seezeichen (IALA A): zwölf Tonnenarten als Zeichnung mit blinkendem Licht, Erkennungs-Training',
      '57 neue Prüfungsfragen und 24 neue Lernkarten zu diesen Themen',
    ],
  },
]

const IDEAS = [
  'Weitere Day-Skipper-Themen: Kollisionsverhütung (COLREGs), Wetter, Sicherheit und Seefunk, elektronische Navigation',
  'Yachtmaster-Offshore-Inhalte (Astronavigation, Großkreis, Nachtfahrt)',
  'Sekundärhäfen und Gezeitenkurven aus dem Almanach',
  'Benutzerkonten und Synchronisation über eine Datenbank',
  'Offline-Betrieb über Service Worker (PWA)',
]

export function RoadmapPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Roadmap" subtitle="Welche Module bereits verfügbar sind und was als Nächstes folgt." />
      <div className="grid gap-4 md:grid-cols-2">
        {PHASES.map((p) => (
          <Card key={p.phase} className={p.done ? 'border-success/50' : undefined}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle>
                Phase {p.phase} – {p.title}
              </CardTitle>
              <Badge variant={p.done ? 'success' : 'secondary'}>{p.done ? 'verfügbar' : 'geplant'}</Badge>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                {p.items.map((i) => (
                  <li key={i} className="flex gap-2">
                    {p.done ? <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-success" /> : <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                    {i}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Mögliche Erweiterungen</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {IDEAS.map((i) => (
              <li key={i} className="flex gap-2">
                <Circle className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                {i}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
