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
  {
    phase: 5,
    title: 'Verkehr, Wetter, Sicherheit, Elektronik',
    done: true,
    items: [
      'Kollisionsverhütung: Begegnungs-Trainer (wer weicht aus?), Lichter bei Nacht, Schall- und Nebelsignale',
      'Wetter: Beaufort-Skala, Buys-Ballot-Regel, Winddrehung, Begriffe im Seewetterbericht',
      'Sicherheit und Seefunk: Mayday-Notruf und Mann-über-Bord in der richtigen Reihenfolge, MAYDAY/PAN-PAN/SÉCURITÉ, Seenotzeichen',
      'Elektronische Navigation: Plotter (XTE, BTW, DTW, VMG) auf der Seekarte, CPA/TCPA-Simulator, Echolot-Bezug',
      '58 neue Prüfungsfragen (insgesamt 177) und 26 neue Lernkarten (insgesamt 71)',
    ],
  },
  {
    phase: 6,
    title: 'Peilen und Probeprüfung',
    done: true,
    items: [
      'Lektion Peilen: Peilung/Gegenpeilung, Kreuzpeilung mit Fehlerdreieck auf der Seekarte, Kompassfehler aus Deckpeilung',
      'Probeprüfung unter `#/pruefung`: 20/40/60 Fragen mit Zeitlimit, gewichtet nach Themengruppen, Bestehensgrenze 70 %',
      'Fragen markieren, frei springen, Stand bleibt nach Neuladen erhalten, automatische Abgabe bei Zeitablauf',
      'Auswertung nach Themengruppe und Schwierigkeit mit allen Lösungen; 16 neue Fragen, 6 neue Lernkarten',
    ],
  },
  {
    phase: 7,
    title: 'Coastal-Fragenpool und Coastal-Test',
    done: true,
    items: [
      '23 neue Coastal-Fragen (insgesamt 35): Zwölftelregel, Wassertiefe, Barrenfenster, Ankerkette, Mehrstundenkurs, Versegelungs- und Gefahrenpeilung, Törnplanung',
      'Alle Rechenaufgaben werden automatisch nachgerechnet',
      'Neue Probeprüfung „Coastal-Test" (20 Fragen, 40 min) neben den Day-Skipper-Varianten',
    ],
  },
  {
    phase: 8,
    title: 'Offline-Betrieb und Datensicherung',
    done: true,
    items: [
      'Service Worker: Nach dem ersten Laden läuft die App ohne Internet (z. B. an Bord), installierbar auf dem Startbildschirm',
      'Lernstand als Datei sichern und wiederherstellen (Über & Hinweise) – streng geprüfte Sicherungsdatei',
      'Wiederherstellung ersetzt nur App-Daten und verlangt vorher eine Bestätigung',
    ],
  },
  {
    phase: 9,
    title: 'Mehr Day-Skipper-Fragen und Installations-Icons',
    done: true,
    items: [
      '31 neue Day-Skipper-Fragen, vor allem zu den bisher schwach abgedeckten Grundbegriffen (Heading, Water Track, Fahrt, Fix, EP)',
      'Alle 20 neuen Rechenaufgaben werden automatisch nachgerechnet; jeder Grundbegriff hat jetzt mindestens fünf Fragen',
      'PNG-Icons (192, 512, maskable, Apple) für die Installation auf dem Startbildschirm',
    ],
  },
  {
    phase: 10,
    title: 'Sekundärhäfen',
    done: true,
    items: [
      'Neue Coastal-Lektion (sechste): Gezeiten eines Sekundärhafens aus Zeit- und Höhenunterschieden zum Standardhafen',
      'Rechner mit Rechenweg: Interpolationsfaktor Springs/Nipp, Höhenunterschied, Datumswechsel (calculations/secondary.ts)',
      '9 neue Coastal-Fragen (Rechenaufgaben nachgerechnet) und 3 Lernkarten',
    ],
  },
  {
    phase: 11,
    title: 'Fragenpool Kompass, Gezeiten, Karte, Seezeichen',
    done: true,
    items: [
      '26 neue Day-Skipper-Fragen zu Kompass, Gezeiten, Kartenkunde, Seezeichen und Wetter; 15 Rechenaufgaben automatisch nachgerechnet',
      'Test stellt sicher, dass jede Themengruppe für den Intensiv-Test ausreichend Fragen hat',
      '„Nächste Lektion"-Link wird auf dem Handy bei langen Titeln nicht mehr abgeschnitten',
    ],
  },
  {
    phase: 12,
    title: 'Großkreis-Rechner (Yachtmaster-Vorgriff)',
    done: true,
    items: [
      'Neuer achter Rechner: Großkreis und Loxodrome im Vergleich – Distanz, Anfangs- und Endkurs, Scheitelpunkt, Ersparnis, sechs Wegpunkte',
      'Berechnung in calculations/greatcircle.ts, 10 neue Tests (Meridian, Äquator, Symmetrie, Datumsgrenze, bekannte Strecke)',
    ],
  },
  {
    phase: 13,
    title: 'Yachtmaster-Vorgriff im Trainer',
    done: true,
    items: [
      'Neue Stufe „Yachtmaster (Vorgriff)" im Prüfungstrainer mit den Themen Großkreisnavigation und Nachtnavigation',
      '17 neue Fragen (11 Großkreis, 6 Nachtnavigation); alle Rechenaufgaben automatisch nachgerechnet, auch gegen die Großkreis-Berechnung',
      'Fünfte Probeprüfung „Yachtmaster-Vorgriff" (12 Fragen, 25 min); Day-Skipper-Prüfungen bleiben davon unberührt',
    ],
  },
  {
    phase: 14,
    title: 'Yachtmaster-Lektionen',
    done: true,
    items: [
      'Neuer Bereich „Yachtmaster" (`#/yachtmaster`) mit zwei Lektionen: Großkreisnavigation und Nachtnavigation',
      'Großkreis auf der Nordatlantik-Karte: Loxodrome gegen Großkreis, einstellbare Teilstücke mit Kurs und Distanz je Etappe',
      'Feuer-Trainer: Feuerhöhe, Augenhöhe und Nenntragweite – wann taucht das Feuer auf?',
      'Neue Berechnung `greatCircleLegs`, 3 Lernkarten, 5 neue Tests (205 insgesamt)',
    ],
  },
  {
    phase: 15,
    title: 'Fragenpool KVR, Wetter, Sicherheit, E-Navigation',
    done: true,
    items: [
      '31 neue Day-Skipper-Fragen zu Kollisionsverhütung, Wetter, Sicherheit/Seefunk und elektronischer Navigation',
      '12 Rechenaufgaben (CPA, TCPA, Echolot, VMG, Beaufort, Windeinheiten) automatisch nachgerechnet',
      'Jedes dieser vier Themen hat jetzt mindestens 20 Fragen (Pool-Test)',
    ],
  },
]

const IDEAS = [
  'Weitere Yachtmaster-Lektionen (Astronavigation, Wetterrouting, Törnplanung über Nacht)',
  'Sekundärhäfen und Gezeitenkurven aus dem Almanach',
  'Benutzerkonten und Synchronisation über eine Datenbank',
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
