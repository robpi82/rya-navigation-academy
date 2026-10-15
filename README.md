# RYA Navigation Academy

Interaktive Lernplattform für Navigationstheorie nach dem Lehrplan der RYA (Day Skipper, später Coastal Skipper / Yachtmaster Offshore).

> **Hinweis:** Unabhängiges Lernprojekt – nicht von der Royal Yachting Association entwickelt, zertifiziert oder unterstützt.
> Lernhilfe, kein Ersatz für zugelassene Navigationsmittel oder amtliche Seekarten.

## Start

```bash
npm install
npm run dev        # Entwicklungsserver → http://localhost:5173
npm test           # Vitest: Navigationsmathematik, Fragenkatalog, Statistik
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
│   ├── dst.ts           Distance–Speed–Time, Einheiten
│   └── position.ts      Positionsversatz (Mittelbreite), Lat/Lon-Formatierung
├── types/             Gemeinsame TypeScript-Typen (Navigation, Lerninhalte)
├── data/glossary.ts   Die neun Begriffe mit allen Lerninhalten
├── questions/         Fragenkatalog (erweiterbar je Ausbildungsstufe)
├── stores/            Zustand-Stores (Fortschritt, Einstellungen, Simulator) – persistiert
├── hooks/             Hash-Router, Lernzeit-Timer, Theme
├── lib/               Quiz-Auswertung, Statistik/Streak, Hilfsfunktionen
├── navigation/        Menüstruktur der App
├── components/
│   ├── ui/            shadcn/ui-Komponenten (Button, Card, Slider, Tabs, …)
│   ├── layout/        AppShell, Sidebar, ThemeToggle
│   └── nautical/      SVG-Bausteine: Vektorpfeile (RYA-Pfeilkonvention), Boot, Nordpfeil, Winkelbogen
├── modules/           Fachmodule: dashboard, glossary, simulator, quiz
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

### Phase 2 – geplant
50 Fragen + weitere Fragetypen (Zuordnung, Vektordiagramm, Fehlererkennung), Lernkarten mit Spaced Repetition,
erweiterte Statistiken, Navigationsrechner (DST, ETA, COG, SOG, Tidal Stream, Course to Steer, EP –
die Rechenfunktionen für CTS und EP existieren bereits).

### Phase 3 – geplant
Interaktive Seekarte (Gitter, Breiten/Längen, Maßstab, Messwerkzeuge, Zoom/Pan), Course-to-Steer- und
EP-Aufgaben, Tidal-Stream-Übungen, Coastal-Skipper-Inhalte, Service Worker für Offline-Betrieb.
