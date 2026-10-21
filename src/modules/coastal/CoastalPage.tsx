import { QUESTION_BANK } from '@/questions'
import type { CoastalTopicId } from '@/types/learning'
import { LessonCatalog, LessonDetail } from '@/modules/lessons/LessonViews'
import type { Lesson } from '@/modules/lessons/types'
import { LeadingLineWidget, PilotagePlanWidget } from './pilotageWidgets'
import { FogActionsWidget, FogEncounterWidget } from './fogWidgets'
import { MooringLinesWidget, MooringOrderWidget } from './mooringWidgets'
import { BowAngleWidget, EpErrorWidget, SoundingWidget } from './noGpsWidgets'
import { CapeRouteWidget, CapeTimingWidget, WindAgainstTideWidget } from './tidalRaceWidgets'
import { AnchorageChoiceWidget, AnchoringOrderWidget, AnchorScopeWidget } from './anchoringWidgets'
import { DismastingWidget, DriftWidget, LeakWidget } from './emergencyWidgets'
import { ApparentWindWidget, HeavyWeatherPrepWidget, WindForceWidget } from './heavyWeatherWidgets'
import { ClearingBearingWidget, MultiHourWidget, PassagePlanningWidget, RunningFixWidget, SecondaryPortWidget, TwelfthsWidget } from './widgets'

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
      'Die Genauigkeit hängt direkt von der Qualität des geschätzten Weges ab. Fehler bei Strom oder Leeway gehen voll in den Fix ein. Im Plot wird der Running Fix mit Uhrzeit eingetragen; viele Navigatoren vermerken zusätzlich „RF", damit klar ist, dass er auf einem geschätzten Weg beruht.',
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
      'Die Kartentiefe bezieht sich auf das Seekartennull (Chart Datum, auf britischen Karten etwa der niedrigste astronomische Gezeitenstand, LAT). Die tatsächliche Wassertiefe ist Kartentiefe plus aktuelle Höhe der Gezeit.',
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
  {
    id: 'secondary-ports',
    title: 'Sekundärhäfen',
    english: 'Secondary Ports',
    summary: 'Gezeiten eines kleineren Hafens aus Zeit- und Höhenunterschieden zum Standardhafen ableiten.',
    body: [
      'Der Almanach enthält tägliche Vorhersagen nur für Standardhäfen. Für die meisten anderen Häfen (Sekundärhäfen) gibt er Unterschiede an: Zeitunterschiede für HW und NW sowie Höhenunterschiede für Springs und Nipp. Man nimmt HW bzw. NW des Standardhafens am selben Tag und wendet die Unterschiede an.',
      'Die Höhenunterschiede hängen vom Tidenhub ab. Deshalb ermittelt man zuerst, wo die Standardhafen-Höhe zwischen dem Nipp- und dem Springwert liegt (Faktor 0 bis 1), und interpoliert damit den Höhenunterschied zwischen den Spalten für Nipp und Springs. Das Ergebnis addiert man zur Standardhafen-Höhe.',
      'Achte auf das Datum: Überschreitet die Zeit 24:00 Uhr oder unterschreitet sie 00:00 Uhr, wechselt der Tag – und es kann sein, dass in einem Sekundärhafen an diesem Kalendertag eine Tide mehr oder weniger auftritt. Die Zahlen dieser App sind fiktive Übungsdaten; im Ernstfall gelten nur die Werte des aktuellen Almanachs.',
    ],
    mnemonic: 'Standardhafen ablesen – Zeit addieren – Faktor bilden – Höhenunterschied interpolieren – addieren.',
    widgets: [{ title: 'Sekundärhafen berechnen', description: 'Rechenweg Schritt für Schritt.', Comp: SecondaryPortWidget }],
    links: [{ label: 'Zwölftelregel (Coastal)', href: '#/coastal/tidal-height' }],
  },
  {
    id: 'pilotage',
    title: 'Pilotage und Ansteuerung',
    english: 'Pilotage',
    summary: 'In Sichtweite von Land navigieren: Pilotage-Plan, Leitlinien, Gefahrenpeilungen und Tiefenlinien statt Plotten.',
    body: [
      'Bei der Ansteuerung eines Hafens oder einer engen Durchfahrt ist keine Zeit, Positionen in die Karte zu plotten. Man navigiert nach Sicht: Tonnen, Landmarken, Deckpeilungen, Gefahrenpeilungen und das Echolot. Grundlage ist ein vorab geschriebener Pilotage-Plan mit Teilstücken (Kurs, Distanz, Zeit) und für jeden Wendepunkt einem eindeutigen Merkmal – etwa „Tonne an Backbord querab" oder „auf die Deckpeilung 000° gehen".',
      'Eine Leitlinie aus zwei hintereinanderstehenden Zeichen (Richtfeuer oder Deckpeilung) zeigt sofort, ob man auf dem Kurs ist. Weicht man ab, wandert das vordere, nähere Zeichen zur Seite; man steuert ihm nach. Gefahrenpeilungen (NMT/NLT) und eine Tiefenlinie, die nicht unterschritten werden darf, begrenzen den sicheren Bereich seitlich.',
      'Zum Plan gehören auch Strom und Gezeitenhöhe zur geplanten Uhrzeit, Ausweich- und Abbruchkriterien („wenn die Tonne nach 20 Minuten nicht in Sicht ist, umkehren") und die Aufgabenverteilung an Bord: Wer steuert, wer liest den Plan vor, wer achtet auf Verkehr. Bei Nacht ersetzen Feuerkennungen die Formen und Farben der Zeichen. Alle Daten der Übungen sind fiktiv.',
    ],
    keyPoints: [
      'Pilotage-Plan: Teilstücke mit Kurs, Distanz, Zeit und je einem eindeutigen Wendemerkmal.',
      'Leitlinie: Zeichen in Deckung = auf Kurs; dem vorderen Zeichen folgen.',
      'Seitliche Grenzen: Gefahrenpeilungen und Tiefenlinien.',
      'Abbruchkriterien und Rollen an Bord vorher festlegen.',
    ],
    mnemonic: 'Planen am Kartentisch, fahren nach Sicht – dem vorderen Zeichen nach.',
    widgets: [
      { title: 'Pilotage-Plan für die Ansteuerung', description: 'Teilstücke auf der Seekarte mit Uhrzeiten.', Comp: PilotagePlanWidget },
      { title: 'Leitlinie: Zeichen in Deckung halten', Comp: LeadingLineWidget },
    ],
    links: [
      { label: 'Gefahrenpeilung', href: '#/coastal/clearing-bearing' },
      { label: 'Peilen (Day Skipper)', href: '#/themen/bearings' },
    ],
  },
  {
    id: 'no-gps',
    title: 'Navigation ohne GPS',
    english: 'Navigation without GPS',
    summary: 'Wenn die Elektronik ausfällt: Koppeln mit Fehlerkreis, Abstand aus zwei Bugwinkeln, Feuer in der Kimm und Tiefenlinien als Standlinien.',
    body: [
      'GPS fällt selten aus – aber wenn, dann oft zusammen mit der Bordelektrik. Wer regelmäßig Ort, Kurs, Fahrt und Logstand ins Logbuch schreibt, kann vom letzten sicheren Ort aus weiterkoppeln. Ein Koppelort ist allerdings unsicher: Als Richtwert wächst der Fehlerkreis mit rund 10 % der seither gelaufenen Strecke. Gefahren in diesem Kreis sind nicht sicher frei – also Abstand halten und den Ort bei jeder Gelegenheit neu bestimmen.',
      'Schon eine einzige Marke liefert einen Ort: Man peilt sie zweimal relativ zum Bug und misst die Zeit dazwischen. Verdoppelt sich der Bugwinkel, ist der Abstand bei der zweiten Peilung gleich der gelaufenen Strecke; bei 45° → 90° (Vierstrichpeilung) ist sie gleich dem Passierabstand querab. Voraussetzung: Kurs und Fahrt über Grund bleiben gleich. Nachts gibt ein Feuer, das gerade in der Kimm auftaucht oder verschwindet, mit seiner geografischen Sichtweite einen Abstandskreis – zusammen mit einer Peilung einen Ort.',
      'Auch der Meeresboden hilft: Eine ausgeprägte Tiefenlinie ist eine Standlinie, wenn die Lotung auf Kartennull reduziert wird (Echolot plus Gebertiefe, minus Höhe der Gezeit). Eine einzelne Lotung ergibt keinen Ort; eine Lotreihe entlang des Kurses, mit Zeit und Strecke notiert, kann ihn eingrenzen. Leitlinien und Deckpeilungen aus der Lektion Pilotage funktionieren ganz ohne Elektronik.',
    ],
    keyPoints: [
      'Logbuch regelmäßig führen – der letzte sichere Ort ist der Startpunkt fürs Koppeln.',
      'Fehlerkreis ≈ 10 % der Strecke seit dem letzten Fix; Gefahren darin meiden.',
      'Bugwinkel verdoppelt: Abstand = gelaufene Strecke; 45° → 90°: Passierabstand.',
      'Feuer in der Kimm + Peilung = Ort; Tiefenlinie + reduzierte Lotung = Standlinie.',
    ],
    mnemonic: 'Doppelter Winkel, gleiche Strecke – und immer ins Logbuch schreiben.',
    widgets: [
      { title: 'Abstand aus zwei Bugwinkeln', Comp: BowAngleWidget },
      { title: 'Fehlerkreis des Koppelorts', Comp: EpErrorWidget },
      { title: 'Lotung und Tiefenlinie', Comp: SoundingWidget },
    ],
    links: [
      { label: 'Peilen (Day Skipper)', href: '#/themen/bearings' },
      { label: 'Pilotage', href: '#/coastal/pilotage' },
      { label: 'Kartenkunde: Feuer und Sichtweite', href: '#/themen/chart-reading' },
    ],
  },
  {
    id: 'fog',
    title: 'Navigation bei Nebel',
    english: 'Restricted Visibility',
    summary: 'Was tun, wenn die Sicht wegbleibt: Position sichern, Fahrt anpassen, Signale geben, Verkehr meiden.',
    body: [
      'Nebel kann innerhalb von Minuten aufziehen, oft bei warmer Luft über kaltem Wasser (Advektionsnebel). Das Wichtigste zuerst: eine Position bestimmen, solange man noch weiß, wo man ist. Danach die Fahrt auf eine sichere Geschwindigkeit verringern (Rule 6 und 19), die Maschine manöverbereit halten, Nebelsignale geben und Lichter einschalten. Rettungswesten anlegen, Radarreflektor prüfen, Ausguck verstärken – mit Augen, Ohren, Radar und AIS.',
      'Die Gefahr ist die kurze Zeit nach dem Sichtkontakt: Bei 200 m Sicht und 18 kn Annäherung bleiben rund 20 Sekunden. Deshalb meidet man Schifffahrtswege und Verkehrstrennungsgebiete und sucht flacheres Wasser auf, in das große Schiffe nicht kommen. Eine Tiefenlinie, die man mit dem Echolot verfolgt, ist dort eine gute Leitlinie; notfalls ankert man und gibt das Ankersignal.',
      'In verminderter Sicht gelten die Ausweichregeln für Fahrzeuge in Sicht nicht. Nach Rule 19 handelt jeder, der ein Fahrzeug nur per Radar ortet, frühzeitig – bei einem Fahrzeug vorlicher als querab (außer einem, das man überholt) möglichst nicht nach Backbord, und nicht auf ein Fahrzeug zu, das querab oder achterlicher steht. Hört man ein Nebelsignal scheinbar vorlicher als querab, verringert man die Fahrt auf das Mindestmaß und fährt äußerst vorsichtig, bis die Gefahr vorüber ist. Die Rechenwerte der Übung sind vereinfachte Faustregeln.',
    ],
    keyPoints: [
      'Zuerst Position sichern, dann Fahrt reduzieren, Signale, Lichter, Ausguck, Westen.',
      'Sichere Geschwindigkeit: innerhalb der halben Sichtweite anhalten können (Faustregel).',
      'Schifffahrtswege meiden, flaches Wasser oder Tiefenlinie aufsuchen, ggf. ankern.',
      'Rule 19: früh handeln; bei Radarkontakt vorlicher als querab nicht nach Backbord ausweichen.',
    ],
    mnemonic: 'Position – Fahrt – Signale – Ausguck – Westen – Plan.',
    widgets: [
      { title: 'Wie viel Zeit bleibt?', description: 'Sichtweite, Fahrt und Annäherung einstellen.', Comp: FogEncounterWidget },
      { title: 'Nebel zieht auf: Reihenfolge der Maßnahmen', Comp: FogActionsWidget },
    ],
    links: [
      { label: 'Schall- und Nebelsignale', href: '#/themen/colregs' },
      { label: 'Radarplotting (Yachtmaster)', href: '#/yachtmaster/radar-plotting' },
    ],
  },
  {
    id: 'heavy-weather',
    title: 'Schwerwetter',
    english: 'Heavy Weather',
    summary: 'Scheinbarer Wind, Winddruck, rechtzeitiges Reffen und Vorbereitung von Boot und Crew auf Starkwind.',
    body: [
      'Starkwind kündigt sich meist an: Seewetterbericht, fallendes Barometer, Wolken und Seegang. Die wichtigste Entscheidung fällt vorher – auslaufen oder nicht, Ausweichhafen oder Seeraum. Auf See bereitet man Boot und Crew vor, solange es noch ruhig ist: Position bestimmen, reffen, Deck und unter Deck klarieren, Westen und Lifebelts anlegen, warm essen und Wachen einteilen.',
      'Die Belastung steigt schneller, als man denkt: Der Winddruck wächst mit dem Quadrat der Windgeschwindigkeit. Und an Bord zählt der scheinbare Wind – wahrer Wind plus Fahrtwind. Vor dem Wind fühlt sich ein Sturm harmlos an; wer dann anluven muss, hat plötzlich deutlich mehr Wind. Deshalb reffen erfahrene Skipper früh und nach dem scheinbaren Wind am Wind.',
      'Wind gegen Strom erzeugt steile, kurze Wellen – solche Phasen und Gebiete (Kaps, Barren, Engstellen) meidet man. Bei schwerem Wetter hält man Seeraum von Leeküsten, segelt einen Kurs, der die Wellen nicht genau von der Seite nimmt, und kann beiliegen, um der Crew eine Pause zu geben. Die Richtwerte der Übungen gelten für eine typische Fahrtenyacht und ersetzen nicht die Erfahrung mit dem eigenen Boot.',
    ],
    keyPoints: [
      'Früh entscheiden und früh vorbereiten – vor dem Starkwind.',
      'Scheinbarer Wind = wahrer Wind + Fahrtwind; am Wind stärker, raumschots schwächer.',
      'Winddruck ~ Windgeschwindigkeit²: doppelter Wind, vierfacher Druck.',
      'Wind gegen Strom und Leeküsten meiden; Seeraum halten, ggf. beiliegen.',
    ],
    mnemonic: 'Wenn du ans Reffen denkst, ist es Zeit zu reffen.',
    widgets: [
      { title: 'Scheinbarer Wind und Besegelung', description: 'Wahren Wind, Windwinkel und Fahrt einstellen.', Comp: ApparentWindWidget },
      { title: 'Winddruck wächst mit dem Quadrat', Comp: WindForceWidget },
      { title: 'Vorbereitung auf Starkwind', Comp: HeavyWeatherPrepWidget },
    ],
    links: [
      { label: 'Wetter (Day Skipper)', href: '#/themen/weather' },
      { label: 'Wetterrouting (Yachtmaster)', href: '#/yachtmaster/weather-routing' },
    ],
  },
  {
    id: 'mooring',
    title: 'Festmachen bei Gezeiten',
    english: 'Mooring in Tidal Waters',
    summary: 'Längsseits an der Pier im Tidenhafen: Leinen, die den Tidenhub mitmachen, Tiefe bei Niedrigwasser und der Weg an Land.',
    body: [
      'In einem Tidenhafen steigt und fällt das Boot mit dem Wasser, die Pier aber nicht. Bei 4 m Tidenhub liegt das Deck bei Niedrigwasser vier Meter tiefer als bei Hochwasser. Leinen, die bei Hochwasser straff belegt wurden, würden das Boot bei fallendem Wasser „aufhängen" – mit Schäden an Klampen, Rumpf oder Pier.',
      'Deshalb führt man die Leinen möglichst lang: Lange Springs und weit ausgebrachte Vor- und Achterleinen ändern ihre nötige Länge über den Tidenhub kaum, kurze Querleinen dagegen stark. Wo es Schwimmstege gibt, ist das Problem gelöst; an festen Piers kontrolliert man die Leinen bei jeder Tide, besonders nachts. Fender müssen in jeder Höhe das Boot schützen; ein Fenderbrett hilft an Pfählen.',
      'Vor dem Anlegen prüft man die Tiefe am Liegeplatz für das kommende Niedrigwasser – manche Häfen fallen trocken, und nicht jedes Boot kann auf dem Kiel stehen. Liegen mehrere Boote im Päckchen, liegt das größte innen; über fremde Boote geht man über das Vorschiff. Für den Weg an Land braucht man bei Niedrigwasser oft eine Leiter. Alle Werte der Übung sind fiktiv.',
    ],
    keyPoints: [
      'Leinen lang führen: Springs und weit ausgebrachte Leinen machen den Tidenhub mit.',
      'Kurze Querleinen müssen stark nachgestellt werden – oder vermieden werden.',
      'Tiefe am Liegeplatz für das nächste Niedrigwasser prüfen.',
      'Leinen und Fender bei jeder Tide kontrollieren; Päckchen: größtes Boot innen.',
    ],
    mnemonic: 'Lange Leinen schlafen ruhig – kurze Leinen wecken dich nachts.',
    widgets: [
      { title: 'Leinen an der Pier bei Tide', description: 'Zeit nach Hochwasser und Tidenhub einstellen.', Comp: MooringLinesWidget },
      { title: 'Anlegen im Tidenhafen: Reihenfolge', Comp: MooringOrderWidget },
    ],
    links: [
      { label: 'Gezeiten (Day Skipper)', href: '#/themen/tides' },
      { label: 'Gezeitenhöhe (Coastal)', href: '#/coastal/tidal-height' },
    ],
  },
  {
    id: 'tidal-races',
    title: 'Strom an Kaps und Engstellen',
    english: 'Tidal Races and Overfalls',
    summary: 'Wind gegen Strom, Races und Overfalls: warum Kaps gefährlich werden können und wie man sie zur richtigen Zeit und im richtigen Abstand rundet.',
    body: [
      'An Kaps und in Engstellen wird der Gezeitenstrom zusammengedrängt und beschleunigt. Läuft er über unebenen Grund, eine Untiefe oder eine Kante, entstehen Overfalls: kurze, steile, teils brechende Wellen – selbst bei wenig Wind. Ein Race ist ein Gebiet mit starkem Strom und solchem Kabbelwasser vor einem Kap. Seekarte und Revierführer markieren beides; Races reichen oft mehrere Seemeilen weit hinaus.',
      'Am gefährlichsten ist Wind gegen Strom. Seegang entsteht durch den Wind relativ zur Wasseroberfläche: Fließt das Wasser dem Wind entgegen, weht er über dem Wasser stärker, und der Gegenstrom staucht die Wellen zusätzlich – sie werden kürzer, steiler und brechen. Ein Kap, das bei Wind mit Strom harmlos ist, kann sechs Stunden später gefährlich sein.',
      'Deshalb wird die Ankunft am Kap auf das Stillwasser gelegt, am besten kurz bevor der Strom in die eigene Richtung kippt. Die Stromrate des Tages wird zwischen Spring- und Nippwerten interpoliert. Bei ungünstigen Bedingungen hilft ein großer Abstand außerhalb des Race; Inshore-Passagen dicht unter Land, wie sie Revierführer beschreiben, sind Schönwetter-Routen. Die Kap-Daten in dieser Lektion sind Übungsdaten.',
    ],
    keyPoints: [
      'Races und Overfalls: starker Strom über unebenem Grund an Kaps und Engstellen.',
      'Wind gegen Strom: Wind über dem Wasser = Wind + Strom, dazu steilere Wellen.',
      'Ankunft am Kap auf das Stillwasser legen – kurz vor dem Kippen in die eigene Richtung.',
      'Bei schlechten Bedingungen weit außen herum; Inshore-Passage nur bei ruhigem Wetter.',
    ],
    mnemonic: 'Kap bei Stillwasser, nie Wind gegen Strom.',
    widgets: [
      { title: 'Wind gegen Strom: Wind über dem Wasser', Comp: WindAgainstTideWidget },
      { title: 'Kap runden: den richtigen Zeitpunkt wählen', Comp: CapeTimingWidget },
      { title: 'Kap runden: der richtige Abstand', Comp: CapeRouteWidget },
    ],
    links: [
      { label: 'Gezeiten (Day Skipper)', href: '#/themen/tides' },
      { label: 'Törnplanung', href: '#/coastal/passage-planning' },
      { label: 'Schwerwetter', href: '#/coastal/heavy-weather' },
    ],
  },
  {
    id: 'anchoring',
    title: 'Ankern',
    english: 'Anchoring',
    summary: 'Ankerplatz wählen, genug Kette stecken, Schwojkreis und Tiefe bei Niedrigwasser prüfen, Ankerwache halten.',
    body: [
      'Ein guter Ankerplatz bietet Schutz vor dem Wind – nicht nur vor dem jetzigen, sondern vor dem, der für die Nacht vorhergesagt ist. Dazu kommen guter Haltegrund (Sand und Schlick halten gut, Fels, Kies und Seegras schlecht), genug Wasser bei Niedrigwasser und genug Platz zum Schwojen. Kabel, Fahrwasser und Muschelbänke in der Seekarte sind tabu.',
      'Gesteckt wird nach der größten Wassertiefe, also der Tiefe bei Hochwasser: Kartentiefe plus Höhe der Gezeit. Als Faustregel gilt bei Kette mindestens das Vierfache, bei Leine mit Kettenvorlauf das Sechsfache; bei viel Wind mehr. Bei Niedrigwasser liegt die Kette flacher, der Schwojkreis wird am größten. Gleichzeitig muss bei Niedrigwasser noch Wasser unter dem Kiel bleiben: Kartentiefe plus Höhe der Gezeit bei NW minus Tiefgang.',
      'Nach dem Eindampfen werden Ankerposition und Peilungen zu festen Landmarken notiert; ein GPS-Ankeralarm hilft, ersetzt aber nicht den Blick nach draußen. Am Tag zeigt ein Fahrzeug vor Anker einen schwarzen Ball im Vorschiff, nachts ein weißes Rundumlicht (KVR Regel 30). Bei Wind gegen Strom schwojen Boote an Kette und an Leine verschieden – Abstand halten.',
    ],
    keyPoints: [
      'Schutz vor dem vorhergesagten Wind, nicht nur vor dem jetzigen.',
      'Kette ≥ 4 × Tiefe bei HW, Leine ≥ 6 ×.',
      'Bei NW: Wasser unter dem Kiel prüfen und größten Schwojkreis einplanen.',
      'Ankerwache: Peilungen, Ankeralarm, Ankerball bzw. Ankerlicht.',
    ],
    mnemonic: 'Schutz, Grund, Tiefe, Raum – dann vier mal Tiefe Kette.',
    widgets: [
      { title: 'Kettenlänge, Schwojkreis und Tiefe bei Niedrigwasser', Comp: AnchorScopeWidget },
      { title: 'Ankerplatz für die Nacht wählen', Comp: AnchorageChoiceWidget },
      { title: 'Das Ankermanöver', Comp: AnchoringOrderWidget },
    ],
    links: [
      { label: 'Gezeitenhöhe (Coastal)', href: '#/coastal/tidal-height' },
      { label: 'Festmachen bei Gezeiten', href: '#/coastal/mooring' },
      { label: 'Kollisionsverhütung (Lichter und Signalkörper)', href: '#/themen/colregs' },
    ],
  },
  {
    id: 'emergencies',
    title: 'Notfälle unter Segeln',
    english: 'Emergencies under Way',
    summary: 'Motorausfall vor einer Leeküste, Wassereinbruch und Mastbruch: Zeit einschätzen, richtig priorisieren, Hilfe holen.',
    body: [
      'Viele Notfälle beginnen harmlos: Der Motor fällt aus, eine Leine gerät in die Schraube, ein Seeventil leckt. Gefährlich wird es, wenn die Zeit knapp wird. Die erste Frage lautet deshalb: Wie viel Zeit habe ich? Treibt das Boot ohne Antrieb auf eine Leeküste zu, entscheiden Windabdrift, Strom und Abstand. Bei wenig Zeit: Anker klar, ankern, sobald die Tiefe es zulässt, und rechtzeitig Hilfe rufen – PAN-PAN bei Dringlichkeit, MAYDAY bei unmittelbarer Gefahr.',
      'Bei Wassereinbruch gilt: Quelle finden und abdichten (Holzkeile an jedem Seeventil, Kissen, Lecksegel), dann pumpen. Schon ein Loch von wenigen Zentimetern unter der Wasserlinie lässt mehr Wasser herein, als eine Handpumpe schafft. Bei unbeherrschbarem Wassereinbruch Mayday absetzen und das Verlassen des Bootes vorbereiten – man steigt erst in die Rettungsinsel, wenn das Boot nicht mehr zu halten ist.',
      'Nach einem Mastbruch zuerst die Crew prüfen, dann das Rigg sichern, damit es den Rumpf nicht beschädigt, und erst den Motor starten, wenn keine Leine oder Want mehr im Wasser ist. Ruderbruch: mit Segeltrimm, Treibanker oder einem Notruder (Spinnakerbaum mit Bodenbrett) steuern. Alle Rechenwerte der Übungen sind vereinfachte Richtwerte.',
    ],
    keyPoints: [
      'Zuerst die Zeit einschätzen: Drift, Strom und Abstand zur Leeküste.',
      'Wenig Zeit: Anker klar, ankern, rechtzeitig PAN-PAN oder MAYDAY.',
      'Leck: erst abdichten, dann pumpen; Keile an allen Seeventilen.',
      'Mastbruch: Crew – Rigg sichern – Motor erst, wenn nichts mehr im Wasser hängt.',
    ],
    mnemonic: 'Zeit schätzen, Crew sichern, Hilfe rufen – lieber zu früh als zu spät.',
    widgets: [
      { title: 'Motorausfall: Wie lange bis zur Leeküste?', Comp: DriftWidget },
      { title: 'Wassereinbruch: Leck und Pumpen', Comp: LeakWidget },
      { title: 'Mastbruch: Sofortmaßnahmen', Comp: DismastingWidget },
    ],
    links: [
      { label: 'Sicherheit und Seefunk', href: '#/themen/safety' },
      { label: 'Schwerwetter', href: '#/coastal/heavy-weather' },
    ],
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
