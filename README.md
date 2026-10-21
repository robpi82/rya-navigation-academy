# RYA Navigation Academy

Interaktive Lernplattform für Navigationstheorie nach dem Lehrplan der RYA (Day Skipper, später Coastal Skipper / Yachtmaster Offshore).

> **Hinweis:** Unabhängiges Lernprojekt – nicht von der Royal Yachting Association entwickelt, zertifiziert oder unterstützt.
> Lernhilfe, kein Ersatz für zugelassene Navigationsmittel oder amtliche Seekarten.

## Start

```bash
npm install
npm run dev        # Entwicklungsserver → http://localhost:5173
npm test           # Vitest: Navigationsmathematik, Fragenkatalog, Spaced Repetition, Statistik
npm run build      # Typecheck + Produktionsbuild nach dist/
npm run preview    # Produktionsbuild lokal ansehen
```

## Technologie

React 19 + TypeScript · Vite 6 · Tailwind CSS 4 · shadcn/ui-Komponenten (Radix) · Lucide Icons · SVG ·
Recharts · Zustand (mit `persist` → LocalStorage) · Vitest. Web-App-Manifest vorhanden (PWA-Basis).

## Architektur

```
src/
├── calculations/      Reine Navigationsmathematik – keine React-Abhängigkeiten
│   ├── angles.ts        Normierung 0–360°, Winkeldifferenz, Formatierung (021,8°)
│   ├── vectors.ts       x = v·sin θ (Ost), y = v·cos θ (Nord), Richtung = atan2(x, y)
│   ├── triangle.ts      Geschwindigkeitsdreieck, Simulation, Course to Steer
│   ├── dst.ts           Distance–Speed–Time, ETA, Einheiten
│   ├── tides.ts         Interpolation der Stromrate (Spring/Nipp)
│   ├── position.ts      Positionsversatz (Mittelbreite), Lat/Lon-Formatierung
│   ├── chart.ts         Mercatorprojektion, Loxodrome (Kurs/Distanz/Zielpunkt), Punkt-in-Polygon
│   ├── passage.ts       Course to Steer über mehrere Stromstunden
│   ├── coastal.ts       Zwölftelregel, Running Fix, Gefahrenpeilung
│   ├── compass.ts       Variation, Deviation, Deviationstabelle
│   ├── lights.ts        Feuerkennungen lesen und beschreiben
│   ├── colregs.ts       Begegnungssituationen, Lichtsektoren
│   ├── weather.ts       Beaufort, Buys-Ballot, Drucktendenz
│   └── enav.ts          XTE, VMG, CPA/TCPA, Echolot
├── types/             Gemeinsame TypeScript-Typen (Navigation, Lerninhalte)
├── data/glossary.ts   Die neun Begriffe mit allen Lerninhalten
├── data/flashcards.ts 21 Lernkarten
├── data/chartArea.ts  Fiktives Übungsrevier (Küsten, Seezeichen, Tidal Diamonds)
├── questions/         Fragenkatalog (erweiterbar je Ausbildungsstufe)
├── stores/            Zustand-Stores (Fortschritt, Einstellungen, Simulator) – persistiert
├── hooks/             Hash-Router, Lernzeit-Timer, Theme
├── lib/               Quiz-Auswertung, Statistik/Streak, Spaced Repetition (spacedRepetition.ts)
├── navigation/        Menüstruktur der App
├── components/
│   ├── ui/            shadcn/ui-Komponenten (Button, Card, Slider, Tabs, …)
│   ├── layout/        AppShell, Sidebar, ThemeToggle
│   ├── chart/         SeaChart: interaktive Seekarte (Zoom, Pan, Overlays)
│   └── nautical/      SVG-Bausteine: Vektorpfeile (RYA-Pfeilkonvention), Boot, Nordpfeil, Winkelbogen
├── modules/           Fachmodule: dashboard, glossary, simulator, quiz, flashcards, calculators, chart, coastal,
│                      daylessons (Themen), lessons (gemeinsames Lektionsgerüst)
├── pages/             Roadmap, Über & Hinweise
└── tests/             Vitest-Tests
```

Die Mathematik ist strikt von der UI getrennt. Die Persistenz ist in Stores gekapselt, sodass LocalStorage später
durch eine Datenbank/Benutzerkonten ersetzt werden kann (Store-Schnittstellen bleiben gleich).

### Konventionen

- Richtungen rechtweisend, im Uhrzeigersinn ab Nord; Strom-**Set** = Richtung, *in die* der Strom setzt.
- Leeway: `+` = Abdrift nach Steuerbord, `−` = nach Backbord; **Water Track = Heading + Leeway**.
- Grund = Wasser + Strom (Vektoraddition); SOG = Betrag, COG = atan2(x, y) normiert auf [0, 360).
- **SOG = 0 → COG = `null`** (wird nicht angezeigt).
- Course to Steer: Querkomponente des Stroms muss durch STW·sin(α) ausgeglichen werden; |Querstrom| > STW
  oder keine Fahrt über Grund entlang des Sollkurses → ausdrücklich „nicht erreichbar".

## Status

### Phase 1 – fertig ✅
- Layout: linke Navigationsleiste, mobiles Menü, Dark/Light Mode, responsive
- Dashboard: gelernte Begriffe, richtige Antworten, Fehlerquote nach Thema, Prüfungsergebnisse,
  Wiederholungsbedarf, Lernzeit, Lernstreak, Fortschritt nach Ausbildungsstufe, Zurücksetzen
- Glossar: 9 Lernkarten (EN/DE, Definition, Merksatz, Praxisbeispiel, SVG-Illustration,
  Verwechslungen, Verständnisfrage, „gelernt"-Markierung)
- Navigationssimulator: alle 6 Eingaben (Regler + Tastatur mit Validierung), Szenario-Presets,
  maßstabsgetreuer Track-Plot mit Gitter/Maßstab, Heading/Water Track/Strom/Ground Track/Leeway-Winkel,
  EP- und Fix-Symbole, Play/Pause, Zeitraffer, Zeitregler, Kompassrose, Ergebnisse und Rechenweg
- Berechnungsfunktionen inkl. Course to Steer und Positionsversatz, durch Tests abgesichert
- Prüfungstrainer: 15 Fragen (Multiple Choice + Berechnung), Lernmodus mit sofortigem Feedback,
  Prüfungsmodus, Zeitmessung, Ergebnisübersicht, Wiederholung falscher Fragen, Speicherung
- LocalStorage-Persistenz

Getestete Fälle: Referenzbeispiel (021,8° / 5,39 kn), keine Strömung, Strom voraus, Strom achteraus,
Querströmung, starke Gegenströmung, Windabdrift, Kurswechsel über 000°, Stillstand über Grund,
nicht erreichbarer Course to Steer – sowie automatische Prüfung aller numerischen Musterlösungen gegen die Rechenfunktionen.

### Phase 2 – fertig ✅
- **Prüfungstrainer:** 50 Aufgaben (Begriffsverständnis, Zahlenberechnung, Kursberechnung, Vektordiagramm,
  Fehlererkennung, Begriff-Zuordnung), Filter nach Thema, Aufgabentyp und Schwierigkeit. Alle 32 Rechenaufgaben
  werden in den Tests gegen die Rechenfunktionen nachgerechnet.
- **Lernkarten:** 21 Karten (9 Grundbegriffe + 12 erweiterte Begriffe wie DR, Set, Drift, CTS, Variation, Deviation),
  Spaced Repetition (vereinfachtes SM-2) mit den Bewertungen Nicht gewusst / Schwer / Gut / Sehr leicht,
  Intervall-Vorschau, Tastatursteuerung (Leertaste, 1–4).
- **Lernstatistiken:** Lernaktivität der letzten 14 Tage, Kartenstand, Fehlerquote nach Thema oder Aufgabentyp.
- **Navigationsrechner:** Distance–Speed–Time, ETA (auch über Mitternacht), COG, SOG (Stromdreieck oder zwei Fixes),
  Tidal Stream (Interpolation Spring/Nipp), Course to Steer (mit ausdrücklicher Meldung „Kurs nicht haltbar“),
  Estimated Position (Lat/Lon, Mittelbreitenverfahren). Jeweils mit Eingabeprüfung und Rechenweg.

### Phase 3 – fertig ✅
- **Interaktive Seekarte:** fiktives, geografisch konsistentes Übungsrevier „Nordbucht“ (Mercatorprojektion) mit Küsten,
  Insel, Leuchtfeuern, Kardinaltonnen, Häfen, Gefahrenstelle und drei Tidal Diamonds. Breiten-/Längengitter mit
  Beschriftung, Breitenmaßstab (1′ = 1 NM), Maßstabsleiste, Kompassrose, Zoom (Buttons, Mausrad, Pinch) und Verschieben.
- **Werkzeuge:** Start/Ziel mit Kurslinie, Messen (Kurs + Distanz), Winkelmessung, Positionen markieren; Klicks rasten an
  Seezeichen ein. Warnung, wenn die Kurslinie über Land führt.
- **Kursplanung:** Course to Steer mit Strom aus den Tidal Diamonds über mehrere Stunden (Vektorsumme), Darstellung
  des Stromdreiecks in der Karte, Stromtabelle mit interpolierter Rate.
- **11 Kartenaufgaben:** Kurs/Distanz messen, Strom ablesen und interpolieren, Kreuzpeilung plotten, EP plotten
  (auch mit Leeway), Course to Steer (auch mehrstündig mit kenterndem Strom). Plotaufgaben werden per Klick in die Karte
  gelöst und mit Toleranzradius geprüft; Lösungen samt Hilfslinien einblendbar.
- **Coastal Skipper:** 5 Lektionen (mehrstündiger CTS, Versegelungspeilung, Gefahrenpeilung, Zwölftelregel, Törnplanung)
  mit interaktiven Übungen und 12 Prüfungsfragen; Ausbildungsstufen-Filter im Prüfungstrainer.
- Code-Splitting der Seiten für schnelleren Start.

Tests (93): u. a. Mercator/Loxodrome (Hin- und Rückrechnung), mehrstündiger CTS (Probe: Wasserweg + Ströme = Ziel),
Zwölftelregel, Running Fix, NMT/NLT über 000°, Konsistenz des Reviers (Landmarken an Land, Tonnen im Wasser,
Kurslinien der Aufgaben nicht über Land) und alle Kartenaufgaben-Lösungen.

### Phase 4 – fertig ✅ (Day-Skipper-Themen)
- **Themen-Lektionen** (`#/themen`): Kompass/Variation/Deviation, Gezeiten, Kartenkunde, Seezeichen – jeweils mit Lehrtext,
  Merksatz und interaktiven Übungen. Gemeinsames Lektionsgerüst (`modules/lessons`), das auch die Coastal-Lektionen nutzen.
- **Kompass:** Umrechnungskette C → D → M → V → T in beiden Richtungen mit Ost/West, Deviationstabelle mit Interpolation,
  Variation für das aktuelle Jahr.
- **Gezeiten:** Höhe der Gezeit nach Kosinusmodell (Vergleich mit Zwölftelregel), Wassertiefe, Wasser unter dem Kiel,
  Zeitfenster um HW, Mondphasen und Spring/Nipp, Ankerkette und Schwojkreis.
- **Kartenkunde:** durchsuchbares Verzeichnis mit 37 Symbolen/Abkürzungen, Feuerkennungs-Parser mit Erklärung und
  animiertem Licht (`calculations/lights.ts`), Lotungen und Trockenhöhen bei wählbarer Gezeit, Sichtweite von Feuern.
- **Seezeichen (IALA A):** zwölf Tonnenarten als SVG-Zeichnung (`components/nautical/BuoyIcon.tsx`) mit blinkendem Licht,
  Erkennungs-Training, Einlaufen/Auslaufen in System A und B.
- **Inhalte:** 57 neue Prüfungsfragen (Kompass, Gezeiten, Kartenkunde, Seezeichen; insgesamt 119), 24 neue Lernkarten (Deck „Themen“,
  insgesamt 45), Themen- und Stufenfilter im Prüfungstrainer.

Tests (122): u. a. Kompasskorrektur in beiden Richtungen und über 000°, Deviationstabelle (zyklisch), Kosinus-Gezeitenmodell
inkl. Zeitfenster-Probe, Feuerparser mit Zeitverläufen (Blitzzahl je Kardinaltonne), Konsistenz der Seezeichen-Daten und
Nachrechnung aller 45+ Rechenaufgaben.

Hinweis: Alle Inhalte sind eigenständig formuliert. Fachaussagen zu IALA-Betonnung und Kartensymbolen bitte vor ernsthafter
Nutzung mit offiziellen Quellen abgleichen.

### Phase 5 – fertig ✅ (Verkehr, Wetter, Sicherheit, Elektronik)
Vier weitere Themen-Lektionen unter `#/themen` (insgesamt acht):
- **Kollisionsverhütung (COLREGs/KVR):** Begegnungs-Trainer mit der geometrischen Beurteilung zweier Fahrzeuge
  (Überholen, entgegengesetzte und kreuzende Kurse, Maschine/Segler, Segler untereinander mit Bug und Luv/Lee),
  Lichter bei Nacht (Sektoren aus beliebiger Richtung, seitenverkehrte Seitenlichter), Schall- und Nebelsignale mit Trainer
  (`calculations/colregs.ts`).
- **Wetter:** Beaufort-Skala mit Umrechnung (kn, m/s, km/h), Buys-Ballot-Regel und Winddrehung (veering/backing),
  Drucktendenz und Sichtweite im Begriffssystem des Seewetterberichts (`calculations/weather.ts`).
- **Sicherheit und Seefunk:** Mayday-Notruf und Mann-über-Bord als Reihenfolge-Aufgaben, MAYDAY/PAN-PAN/SÉCURITÉ-Trainer,
  Seenotzeichen erkennen (`data/safety.ts`).
- **Elektronische Navigation:** Plotter-Simulation auf der Seekarte (XTE, BTW, DTW, VMG, Steuerempfehlung), CPA/TCPA-Simulator mit
  Risikobewertung, Echolot-Bezug (Geber/Kiel/Wasserlinie) (`calculations/enav.ts`).
- **Inhalte:** 58 neue Prüfungsfragen (insgesamt 177), 26 neue Lernkarten (insgesamt 71), neue Themenfilter im Prüfungstrainer.

Tests (151): u. a. Begegnungssituationen und Lichtsektoren, Beaufort-Grenzen, Buys-Ballot, Cross-Track-Error mit Vorzeichen,
CPA/TCPA (Gegenkurs, kreuzend, parallel, auseinanderlaufend) und Nachrechnung aller 57 Rechenaufgaben.

Hinweis: Regelinhalte (COLREGs, Seefunk, Wetterbegriffe) sind eigenständig formuliert und vereinfacht. Vor ernsthafter Nutzung
mit amtlichen Quellen (Regeltext, Funkhandbuch, Seehandbuch) abgleichen; für den Betrieb eines Seefunkgeräts ist ein Funkzeugnis nötig.

### Phase 6 – fertig ✅ (Peilen, Probeprüfung)
- **Lektion „Peilen"** (`#/themen/bearings`, `calculations/bearings.ts`): Peilung/Gegenpeilung und Schnittwinkel, Kreuzpeilung
  mit Fehlerdreieck auf der Seekarte (Peilfehler einzeln und gemeinsam einstellbar), Kompassfehler und Deviation aus Deckpeilung.
- **Probeprüfung** (`#/pruefung`, `lib/exam.ts`, `stores/examStore.ts`): Kurztest 20/30 min, Standard 40/60 min, Intensiv 60/90 min;
  Fragen nach Themengruppen gewichtet gezogen, Bestehensgrenze 70 % (eigene Annahme), Markieren, freies Springen, automatische Abgabe
  bei Zeitablauf, Stand überlebt Neuladen. Auswertung nach Themengruppe/Schwierigkeit mit Lösungen; Ergebnisse erscheinen im Dashboard-Verlauf.
- **Inhalte:** 16 neue Fragen (insgesamt 193), 6 neue Lernkarten (insgesamt 77), neun Day-Skipper-Lektionen.

Tests (175): u. a. Schnittpunkte und Fehlerdreieck, Kompassfehler, Gruppenquoten, Reproduzierbarkeit des Prüfungsaufbaus,
Bestehensgrenze (7/10 besteht, 6/10 nicht), unbeantwortete Fragen und Restzeit.

### Phase 7 – fertig ✅ (Coastal-Fragenpool, Coastal-Test)
- 23 neue Coastal-Skipper-Fragen (insgesamt 35, 216 im gesamten Katalog) zu allen fünf Coastal-Themen; alle Rechenaufgaben mit
  `verify` werden in den Tests nachgerechnet.
- Probeprüfung um den **Coastal-Test** erweitert (20 Fragen, 40 min, nur Coastal-Pool; `buildExam(..., level)` in `lib/exam.ts`).
- Tests (177): u. a. Reproduzierbarkeit und Pool-Abdeckung des Coastal-Tests.

### Phase 8 – fertig ✅ (Offline-Betrieb, Datensicherung)
- **PWA/Offline:** `public/sw.js` (Netzwerk zuerst für Seiten, Cache zuerst für gehashte Assets, nur im Produktionsbuild registriert),
  Manifest mit relativer Startadresse. Nach dem ersten Besuch läuft die App ohne Internet.
- **Datensicherung:** `lib/backup.ts` und Karte auf „Über & Hinweise": Lernstand (Fortschritt, Lernkarten, Einstellungen, Probeprüfung)
  als JSON herunterladen und wieder einspielen. Die Datei wird streng geprüft (Format, Version, nur bekannte Schlüssel, gültiges JSON);
  fremde LocalStorage-Einträge bleiben unberührt.
- Tests (181): Rundreise, Ablehnung ungültiger Dateien, Zusammenfassung.

### Phase 9 – fertig ✅ (Fragenpool, Icons)
- 31 neue Day-Skipper-Fragen (insgesamt 256 im Katalog), darunter 20 Rechenaufgaben zu Water Track, SOG/COG, Distanzen, Kompassumrechnung,
  Gezeiten, Beaufort und VMG – alle werden in den Tests nachgerechnet. Jeder der neun Grundbegriffe hat mindestens fünf Fragen.
- PNG-Icons für Manifest und iOS (`public/icon-*.png`, `apple-touch-icon.png`), damit die Installation überall ein Symbol zeigt.

### Phase 10 – fertig ✅ (Sekundärhäfen)
- Coastal-Lektion „Sekundärhäfen" (`#/coastal/secondary-ports`): Zeitunterschiede und nach Springs/Nipp interpolierte Höhenunterschiede
  (`calculations/secondary.ts`, Übungsdaten in `data/secondaryPorts.ts`), Rechner mit angezeigtem Rechenweg.
- 9 neue Coastal-Fragen (insgesamt 44; alle Rechenaufgaben nachgerechnet), 3 Lernkarten, Tests: 186.
- Hinweis: Die Hafendaten sind fiktive Übungswerte; im Ernstfall gelten nur die Angaben des aktuellen Almanachs.

### Phase 11 – fertig ✅ (Fragenpool, Layout-Korrektur)
- 26 neue Day-Skipper-Fragen (insgesamt 282 im Katalog, davon 238 Day Skipper) zu Kompass, Gezeiten, Kartenkunde, Seezeichen und Wetter; 15 Rechenaufgaben
  werden in den Tests nachgerechnet. Neuer Pool-Test (187 Tests) für die Themengruppen der Probeprüfung.
- Der Link „Nächste Lektion" bricht jetzt um, statt am Rand abgeschnitten zu werden.

### Phase 12 – fertig ✅ (Großkreis-Rechner)
- Achter Rechner unter `#/rechner`: Großkreis gegen Loxodrome (`calculations/greatcircle.ts`). Zeigt Distanz, Anfangs- und Endkurs,
  Scheitelpunkt, Ersparnis und Wegpunkte; Längenunterschied über die Datumsgrenze nimmt den kürzeren Weg. Kugelmodell.
- 10 neue Tests (197 insgesamt). Es gibt bewusst noch keine Prüfungsfragen dazu, da das Kursniveau „Yachtmaster" im Trainer fehlt.

### Phase 13 – fertig ✅ (Yachtmaster-Vorgriff)
- Prüfungstrainer um die Stufe **Yachtmaster (Vorgriff)** erweitert (`YachtTopicId`, `data/topics.ts`): Großkreisnavigation und Nachtnavigation.
- 17 neue Fragen (insgesamt 299 im Katalog); neues Prüfungsformat „Yachtmaster-Vorgriff" (12 Fragen, 25 min) neben Day-Skipper- und Coastal-Tests.
- Tests: 200, u. a. Nachrechnung der Großkreis-Aufgaben und Trennung der Fragenpools nach Stufe.
- Es gibt noch keine eigenen Lektionen für diese Themen – die Großkreis-Rechnung steht im Rechner (`#/rechner`).

### Phase 14 – fertig ✅ (Yachtmaster-Lektionen)
- Eigener Menüpunkt **Yachtmaster** (`#/yachtmaster`) mit den Lektionen Großkreisnavigation und Nachtnavigation
  (`modules/yachtmaster/`). Interaktiv: Großkreis und Loxodrome auf einer Mercatorkarte des Nordatlantiks mit einstellbaren
  Teilstücken (`greatCircleLegs`), Feuer-Trainer für die Sichtweite von Feuern.
- 3 neue Lernkarten (insgesamt 83), Tests: 205.

### Phase 15 – fertig ✅ (Fragenpool KVR, Wetter, Sicherheit, E-Navigation)
- 31 neue Day-Skipper-Fragen (insgesamt 330 im Katalog, davon 269 Day Skipper), darunter 12 nachgerechnete Rechenaufgaben
  (CPA/TCPA, Echolot-Bezug, VMG, Beaufort, m/s ↔ kn). Pool-Test: Jedes der vier Themen hat mindestens 20 Fragen; Tests: 206.
- Regelinhalte (KVR, Seefunk, Wetterbegriffe) sind eigenständig formuliert und vereinfacht – bitte mit den amtlichen Texten abgleichen.

### Phase 16 – fertig ✅ (Inhaltsprüfung)
Gegengelesen wurden alle Fragen zu KVR und Sicherheit sowie `data/colregs.ts`, `calculations/colregs.ts` (Begegnungen, Lichter),
`data/buoyage.ts`, `data/safety.ts`, `data/weather.ts` und der Lektionstext zur Kollisionsverhütung. Korrekturen:

| Stelle | Vorher | Jetzt |
| --- | --- | --- |
| Rangfolge Rule 18 | NUC über RAM, Tiefgangbehinderte als Ausweichrang | NUC und RAM gleichrangig; Tiefgangbehinderte nicht behindern (Rule 18(d)) |
| Lichter manövrierbehindert mit Fahrt | ohne Topplicht („vereinfacht") | mit Topplicht, Seiten- und Hecklicht (Rule 27(b)(iii)); 2 neue Tests |
| Ankerlicht unter 50 m | „im Vorschiff" | wo es am besten gesehen werden kann (Rule 30(b)) |
| Verkehrstrennungsgebiet | „rechtwinklig queren, Berufsschifffahrt nicht behindern" | Steuerkurs rechtwinklig (Rule 10(c)); Segler/unter 20 m behindern Maschinenfahrzeuge im Einbahnweg nicht (Rule 10(j)) |
| Lektion KVR | „gelten auf allen Gewässern"; Rule 13 „geht allen anderen vor" | Geltungsbereich nach Rule 1, örtliche Vorschriften gehen vor; Rule 13 vor den übrigen Ausweichregeln |
| Nebel-/Manöversignale | knappe Erklärungen | mit Verweisen auf Rule 34/35 |
| Mann über Bord | nur Unterkühlung | zuerst Kälteschock, dann Unterkühlung |

Seezeichen (IALA A), Seefunk-Abläufe und Wetterbegriffe des Seewetterberichts waren stimmig und blieben unverändert. Tests: 208.
Die Prüfung ersetzt keinen Abgleich mit den amtlichen Texten (COLREGs/KVR, Funkhandbuch, Seewetterdienst).

### Phase 17 – fertig ✅ (Inhaltsprüfung Kompass, Gezeiten, Karte, Peilen)
Gegengelesen wurden die 78 Fragen zu Kompass, Gezeiten, Kartenkunde und Peilen sowie die zugehörigen Lektionstexte, Lernkarten,
das Glossar, `data/chartSymbols.ts` und die Feuerkennungen (`calculations/lights.ts`). Alle Rechenaufgaben waren bereits durch Tests
abgesichert; korrigiert wurden Erklärtexte:

| Stelle | Vorher | Jetzt |
| --- | --- | --- |
| Höhenbezug (Lektion Kartenkunde, Lernkarte und Symbol MHWS) | Landmarken, **Brücken** und Feuer auf MHWS | Landmarken und Feuer auf MHWS; lichte Höhen von Brücken/Leitungen auf neueren britischen Karten auf HAT – Kartentitel beachten |
| Trockenhöhe (Frage, Symbol) | „fällt bei Niedrigwasser trocken" | liegt über dem Kartennull und kann bei niedrigem Wasserstand trockenfallen |
| Springtide (Lektion, Frage, Lernkarte) | „bei Neu- und Vollmond" | meist ein bis zwei Tage danach |
| Glossar „Fix" | Deckpeilung als Beispiel für einen Fix | eine einzelne Peilung oder Deckpeilung liefert nur eine Standlinie |
| Lektion Kompass | „Handpeilkompass fern vom Boot" | fern von Eisenteilen, Motor und Elektronik benutzt |
| Lektion Gezeitenhöhe (Coastal) | Kartennull „ungefähr niedrigstes Niedrigwasser" | etwa der niedrigste astronomische Gezeitenstand (LAT) |

Unverändert und stimmig: Umrechnungskette C–D–M–V–T, Feuerkennungen (Q 50–79/min, VQ 80–159/min, LFl ≥ 2 s), Abkürzungen,
Peilregeln (Schnittwinkel, Reihenfolge, Deckpeilung).

### Phase 18 – fertig ✅ (Inhaltsprüfung, Abschluss)
Gegengelesen wurden die übrigen 206 Fragen (Grundbegriffe, Seezeichen, Wetter, E-Navigation, Coastal, Sekundärhäfen, Yachtmaster),
die Lektionstexte zu Wetter, Sicherheit, E-Navigation und Coastal sowie die Beschreibungen in `data/buoyage.ts`. Zusammen mit den
Phasen 16 und 17 ist damit jede der 330 Fragen einmal inhaltlich geprüft.

| Stelle | Vorher | Jetzt |
| --- | --- | --- |
| Lektion Wetter, Stichpunkt Fronten | „Warmfront: Wind dreht links" | vor der Warmfront links und auffrischend, beim Durchgang rechts |
| Zuordnung Wetterbegriffe | veering/backing „(Nordhalbkugel)" | auf beiden Halbkugeln gleich definiert |
| Frage Winddrehung | „rechts herum (mit der Sonne)" | „rechts herum (im Uhrzeigersinn)" |
| Frage GPS-Satelliten | „drei für Länge/Breite, der vierte korrigiert die Uhr" | vier Unbekannte (drei Raumkoordinaten + Uhrfehler); mit bekannter Höhe genügen drei für 2D |
| Abzweigungstonnen | „oberes Band = Farbe der Fahrwasserseite" | Grundfarbe und Toppzeichen gehören zur Seite des Hauptfahrwassers (beide Tonnen) |
| Frage Sektorenfeuer | weißer Sektor = sicheres Fahrwasser | meist das sichere Fahrwasser – Bedeutung und Grenzen aus der Karte |
| Lektion Sicherheit | „Hauptgefahr ist die Unterkühlung" | zuerst Kälteschock, dann Unterkühlung |
| Lektion Running Fix | „wird mit dem Zusatz RF gekennzeichnet" | Uhrzeit; häufig zusätzlich „RF" vermerkt |

Ohne Befund: Stromdreieck und Kurskonventionen, Kardinal- und Lateralzeichen, Seewetterbegriffe, CPA/TCPA, Zwölftelregel,
Sekundärhäfen, Großkreis und Sichtweite von Feuern. Tests: 208.

### Phase 19 – fertig ✅ (Prüfungsreife im Dashboard)
- Karte **Prüfungsreife** im Dashboard (`lib/examInsights.ts`, `modules/dashboard/ExamInsightsCard.tsx`):
  - Einschätzung aus den letzten drei Day-Skipper-Probeprüfungen mit mindestens 20 Fragen: *noch nicht reif* (Schnitt unter 70 %),
    *auf gutem Weg* (Schnitt ab 70 %), *prüfungsreif* (drei bestanden, Schnitt ab 80 %) – eine eigene Heuristik, keine offizielle Aussage.
  - Trefferquote je Themengruppe über alle Probeprüfungen, mit Markierung der Bestehensgrenze.
  - Die drei schwächsten Themen nach den jeweils letzten zehn Antworten (ab vier Antworten, Fehlerquote über 25 %) mit Links zur
    Lektion und zum gezielten Üben.
- Neue Route `#/quiz/thema/<Thema>`: Prüfungstrainer mit vorgewählter Stufe und vorgewähltem Thema.
- Diagramm „Prüfungsergebnisse" zeigt die Bestehensgrenze. Tests: 216.

### Phase 20 – fertig ✅ (Wetterrouting)
- Dritte Yachtmaster-Lektion **Wetterrouting** (`#/yachtmaster/weather-routing`, `calculations/routing.ts`, `modules/yachtmaster/routingWidgets.tsx`):
  - Polardiagramm einer fiktiven 10-m-Yacht (bilinear interpoliert), No-go-Bereich unter 40°, beste Winkel nach größter VMG.
  - Schlagplanung: direkt, kreuzend oder halsend – mit Steuerkursen, Schlaglängen, gesegelter Strecke und Zeitbedarf.
  - Abfahrtszeit nach einer stündlichen Windvorhersage (Winddreher durch ein Tief): Fahrtdauer je Abfahrtsstunde.
- 6 neue Yachtmaster-Fragen (Kreuzstrecke nachgerechnet), 2 Lernkarten, Tests: 229.
- Vereinfachungen: kein Strom, keine Abdrift, Wendezeiten vernachlässigt, Wind innerhalb einer Stunde konstant.

### Phase 21 – fertig ✅ (Astronavigation: Mittagsbreite)
- Vierte Yachtmaster-Lektion **Astronavigation** (`#/yachtmaster/celestial`, `calculations/astro.ts`, `modules/yachtmaster/astroWidgets.tsx`):
  - Beschickung der Sextantenhöhe (Indexberichtigung, Kimmtiefe −1,76′·√h, Refraktion nach Bennett, Sonnenhalbmesser 16′).
  - Mittagsbreite: Breite = Deklination ± (90° − Ho), mit Skizze des Meridians; Kulmination (UT) = 12:00 − Länge/15 − Zeitgleichung.
- 7 neue Yachtmaster-Fragen (5 nachgerechnet), 2 Lernkarten. Der Trainer akzeptiert jetzt auch typografisches Minus und „′". Tests: 240.
- Näherungsformeln statt Almanach-Tafeln; die Bestimmung der Länge (Höhenstandlinie) ist nicht enthalten.

### Mögliche Erweiterungen
Weitere Yachtmaster-Offshore-Inhalte (Astronavigation, Nachtfahrt), Gezeitenkurven aus dem Almanach, Benutzerkonten mit Datenbank-Synchronisation.

