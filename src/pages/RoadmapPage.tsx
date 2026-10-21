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
  {
    phase: 16,
    title: 'Inhaltsprüfung KVR, Sicherheit, Seezeichen, Wetter',
    done: true,
    items: [
      'Alle KVR- und Sicherheitsfragen, Lichter-, Schall- und Nebelsignal-Daten, Seezeichen und Wetterbegriffe gegen die Regeltexte gegengelesen',
      'Korrigiert: Rangfolge nach Rule 18 (NUC und RAM gleichrangig, Tiefgangbehinderte „nicht behindern"), Topplicht des manövrierbehinderten Fahrzeugs mit Fahrt, Ankerlicht-Position, Queren von Verkehrstrennungsgebieten (Steuerkurs, Rule 10(c)/(j)), Geltungsbereich (Rule 1), Reichweite von Rule 13',
      'Präzisiert: Nebelsignale mit Rule-Verweisen, Kälteschock bei Mann über Bord, Lichterfrage mit Kollisionskurs',
    ],
  },
  {
    phase: 17,
    title: 'Inhaltsprüfung Kompass, Gezeiten, Karte, Peilen',
    done: true,
    items: [
      'Fragen, Lektionstexte, Lernkarten, Glossar, Kartensymbole und Feuerkennungen zu Kompass, Gezeiten, Kartenkunde und Peilen gegengelesen',
      'Korrigiert: Höhenbezug von Brücken (HAT statt MHWS auf neueren Karten), Trockenhöhe („kann trockenfallen"), Springtide mit ein bis zwei Tagen Verzögerung, Fix-Definition (eine Deckpeilung allein ist kein Fix), Handpeilkompass-Formulierung, Kartennull (LAT)',
    ],
  },
  {
    phase: 18,
    title: 'Inhaltsprüfung Grundbegriffe, Seezeichen, Wetter, E-Navigation, Coastal, Yachtmaster',
    done: true,
    items: [
      'Restliche 206 Fragen sowie Lektionstexte zu Wetter, Sicherheit, E-Navigation, Coastal und Seezeichen-Daten gegengelesen – damit ist der gesamte Katalog einmal geprüft',
      'Korrigiert: Winddrehung an der Warmfront (vorher links, beim Durchgang rechts), veering/backing auf beiden Halbkugeln gleich, GPS-Satellitenzahl begründet, Abzweigungstonnen beschrieben, weißer Sektor „meist" sicher, Kälteschock in der Sicherheitslektion, Running-Fix-Kennzeichnung',
    ],
  },
  {
    phase: 19,
    title: 'Prüfungsreife im Dashboard',
    done: true,
    items: [
      'Neue Dashboard-Karte „Prüfungsreife": Einschätzung aus den letzten drei Day-Skipper-Probeprüfungen (noch nicht reif / auf gutem Weg / prüfungsreif)',
      'Trefferquote je Themengruppe mit Markierung der Bestehensgrenze und die drei schwächsten Themen nach den jüngsten Antworten',
      'Direkte Links zur passenden Lektion und zum gezielten Üben (#/quiz/thema/<Thema> wählt Stufe und Thema vor); Bestehensgrenze im Ergebnis-Diagramm',
    ],
  },
  {
    phase: 20,
    title: 'Yachtmaster-Lektion Wetterrouting',
    done: true,
    items: [
      'Polardiagramm einer fiktiven 10-m-Yacht mit No-go-Bereich und besten Am-Wind- und Vorwind-Winkeln (größte VMG)',
      '„Kreuzen oder direkt?": Schlagplanung zu einem Ziel bei beliebigem Wind, mit Kursen, Strecken und Zeitbedarf',
      'Abfahrtszeit nach stündlicher Windvorhersage: Fahrtdauer je Abfahrt, Empfehlung mit Sicherheitshinweisen',
      'Neue Berechnungen in calculations/routing.ts, 6 Fragen, 2 Lernkarten, 13 neue Tests',
    ],
  },
  {
    phase: 21,
    title: 'Yachtmaster-Lektion Astronavigation (Mittagsbreite)',
    done: true,
    items: [
      'Sextantenhöhe beschicken: Indexberichtigung, Kimmtiefe, Refraktion und Sonnenhalbmesser Schritt für Schritt bis Ho',
      'Mittagsbreite aus Ho und Deklination (Sonne im Süden oder Norden) mit Skizze des Meridians; Zeit der Kulmination aus Länge und Zeitgleichung',
      'Neue Berechnungen in calculations/astro.ts, 7 Fragen, 2 Lernkarten, Eingabe von „−" und „′" im Trainer, 11 neue Tests',
    ],
  },
  {
    phase: 22,
    title: 'Yachtmaster-Lektion Höhenstandlinie',
    done: true,
    items: [
      'Intercept-Verfahren nach Marcq St. Hilaire: LHA, berechnete Höhe Hc, Azimut Zn und Intercept (toward/away) mit Skizze',
      'Fix aus zwei Sternen mit einstellbaren Messfehlern, Schnittwinkel und Nachrechnen mit dem Fix als neuer AP',
      'Neue Berechnungen in calculations/sight.ts, 7 Fragen, 1 Lernkarte, 11 neue Tests',
    ],
  },
  {
    phase: 23,
    title: 'Yachtmaster-Lektion Törnplanung über Nacht',
    done: true,
    items: [
      'Wachplan mit Zeitleiste: Crewgröße, zwei oder drei Wachen, Wachdauer – Stunden an Deck, längste Ruhe und Sicherheitshinweise',
      'Ankunft bei Tageslicht: früheste und späteste Abfahrt aus Distanz, Fahrt, Sonnenauf- und -untergang mit Puffer',
      'Feuerplan: wann welches Leuchtfeuer entlang der Route in Sicht kommt (mit Kennung, Passierabstand, Tag/Nacht)',
      'Neue Berechnungen in calculations/nightPassage.ts, 6 Fragen, 2 Lernkarten, Eingabe „h"/„Uhr" im Trainer, 10 neue Tests',
    ],
  },
  {
    phase: 24,
    title: 'Yachtmaster-Lektion Radarplotting',
    done: true,
    items: [
      'Nordstabilisiertes Radarbild mit Plotdreieck O–W–A (vergrößert), Relativbewegung, CPA/TCPA und Aspekt (Rot/Grün)',
      'Wahrer Kurs und Fahrt des Ziels aus zwei Beobachtungen; drei Beispiele (Kreuzer, Überholer, stillliegendes Ziel)',
      'Ausweichmanöver testen: neuer CPA nach Kursänderung, Hinweis auf Rule 19 bei Backbord-Manövern',
      'Neue Berechnungen in calculations/radarPlot.ts, 6 Fragen, 2 Lernkarten, 7 neue Tests',
    ],
  },
  {
    phase: 25,
    title: 'Yachtmaster-Probeprüfung und Prüfungsreife je Stufe',
    done: true,
    items: [
      'Neue Yachtmaster-Probeprüfung: 30 Fragen in 60 Minuten, gleichmäßig über alle sieben Yachtmaster-Themen',
      'Coastal- und Yachtmaster-Prüfungen ziehen ihre Fragen jetzt gleichmäßig je Thema (vorher rein zufällig)',
      'Dashboard „Prüfungsreife" mit Auswahl Day Skipper / Coastal / Yachtmaster',
    ],
  },
  {
    phase: 26,
    title: 'Running Fix aus Sonnenstandlinien',
    done: true,
    items: [
      'Lektion Höhenstandlinie um „Sonne – Versegelung – Sonne" erweitert: erste Standlinie versetzen, mit der zweiten schneiden',
      'Übung mit Beobachtungszeiten, Kurs, Fahrt und unbekanntem Strom; Vergleich Fix, Koppelort und wahre Position, Warnung bei zu kleiner Azimutänderung',
      'Neue Berechnung sunRunSun in calculations/sight.ts, 3 Fragen, 1 Lernkarte, 2 neue Tests',
    ],
  },
  {
    phase: 27,
    title: 'Coastal-Lektion Pilotage und Ansteuerung',
    done: true,
    items: [
      'Siebte Coastal-Lektion: Pilotage-Plan auf der Seekarte (Kurs, Distanz, Zeit, Uhrzeit und Merkmal je Teilstück) und Leitlinien-Trainer („dem vorderen Zeichen folgen")',
      'Seekarte kann mit einem Ausschnitt starten (focus); Test, dass der Plan nicht über Land führt',
      'Neue Berechnungen in calculations/pilotage.ts, 8 Coastal-Fragen, 2 Lernkarten, 6 neue Tests',
    ],
  },
  {
    phase: 28,
    title: 'Coastal-Lektion Navigation bei Nebel',
    done: true,
    items: [
      'Achte Coastal-Lektion: Maßnahmen bei Nebel, Rule 6/19, Schifffahrtswege meiden, Tiefenlinie, Ankern',
      'Übung „Wie viel Zeit bleibt?": Annäherung, Sekunden ab Sichtkontakt, Anhalteweg und sichere Fahrt nach der Halbe-Sicht-Faustregel',
      'Reihenfolge-Übung „Nebel zieht auf"; neue Berechnungen in calculations/fog.ts, 7 Fragen, 1 Lernkarte, Eingabe „s"/„sek" im Trainer',
    ],
  },
  {
    phase: 29,
    title: 'Coastal-Lektion Schwerwetter',
    done: true,
    items: [
      'Neunte Coastal-Lektion: scheinbarer Wind mit Vektordreieck und Reff-Richtwert, Winddruck wächst mit dem Quadrat, Vorbereitung auf Starkwind (Reihenfolge)',
      'Neue Berechnungen in calculations/heavyWeather.ts, 8 Fragen, 2 Lernkarten, Einheit „×" für Faktoren, 8 neue Tests',
    ],
  },
  {
    phase: 30,
    title: 'Coastal-Lektion Festmachen bei Gezeiten',
    done: true,
    items: [
      'Zehnte Coastal-Lektion: Leinen an der Pier über den Tidenhub (Seitenansicht, Leinenlängen bei HW/NW, Nachstellen), Kletterhöhe zur Pier, Päckchen',
      'Reihenfolge-Übung „Anlegen im Tidenhafen"; neue Berechnungen in calculations/mooring.ts, 7 Fragen, 1 Lernkarte, 4 neue Tests',
    ],
  },
  {
    phase: 31,
    title: 'Coastal-Lektion Notfälle unter Segeln',
    done: true,
    items: [
      'Elfte Coastal-Lektion: Motorausfall vor der Leeküste (Drift aus Wind und Strom, Zeit bis zur Küste, Handlungsempfehlung), Wassereinbruch (Leckmenge gegen Pumpleistung), Mastbruch (Reihenfolge)',
      'Neue Berechnungen in calculations/emergency.ts, 7 Fragen, 2 Lernkarten, Einheit „l/min", 7 neue Tests',
    ],
  },
  {
    phase: 32,
    title: 'Inhaltsprüfung Phasen 20–31 und Coastal-Probeprüfung',
    done: true,
    items: [
      'Alle 72 Fragen der Phasen 20–31 (Wetterrouting, Astronavigation, Nachtfahrt, Radar, Pilotage, Nebel, Schwerwetter, Festmachen, Notfälle) gegen Regeltexte und Formeln gegengelesen – ohne inhaltlichen Fehler',
      'Präzisiert: Rule 19(d) in den Lektionen Nebel und Radarplotting vollständig (auch: nicht auf ein Fahrzeug querab oder achterlicher zu ändern)',
      'Neue Coastal-Probeprüfung: 40 Fragen in 75 Minuten, jedes der elf Coastal-Themen mindestens dreimal',
    ],
  },
]

const IDEAS = [
  'Inhalte von einer Skipperin oder einem Ausbilder fachlich gegenlesen lassen',
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
