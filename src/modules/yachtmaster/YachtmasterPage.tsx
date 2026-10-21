import { QUESTION_BANK } from '@/questions'
import { LessonCatalog, LessonDetail } from '@/modules/lessons/LessonViews'
import type { Lesson } from '@/modules/lessons/types'
import { GreatCircleMapWidget, LightHorizonWidget } from './widgets'
import { DepartureWidget, PolarWidget, TackingWidget } from './routingWidgets'
import { NoonLatitudeWidget, NoonTimeWidget, SextantWidget } from './astroWidgets'
import { InterceptWidget, SightFixWidget, SunRunSunWidget } from './sightWidgets'
import { DaylightArrivalWidget, RouteLightsWidget, WatchPlanWidget } from './nightWidgets'
import { RadarPlotWidget } from './radarWidgets'
import { AbandonShipOrderWidget, MobDriftWidget, RescueTimeWidget, SearchPatternWidget } from './sarWidgets'
import { EtmalProvisionWidget, SeasonRouteWidget, TimeZoneWidget } from './oceanWidgets'
import { AtlasBrowserWidget, AtlasPageQuizWidget, AtlasPassageWidget } from './atlasWidgets'
import { DepressionOrderWidget, IsobarWindWidget, WindAroundSystemWidget } from './weatherChartWidgets'

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
  {
    id: 'tidal-atlas',
    title: 'Gezeitenstromatlas',
    english: 'Tidal Stream Atlas',
    summary: 'Den Stromatlas richtig lesen: Stundenseite wählen, Atlasangaben auf den Tag umrechnen und daraus einen Kurs für eine Überfahrt über mehrere Stunden planen.',
    body: [
      'Ein Gezeitenstromatlas zeigt den Strom eines Seegebiets auf dreizehn Seiten: eine für jede Stunde von sechs Stunden vor bis sechs Stunden nach Hochwasser des Bezugshafens. Pfeile geben die Setzrichtung an, Zahlenpaare wie „08,15“ die Rate in Zehntelknoten – zuerst bei Nippzeit (0,8 kn), dann bei Springzeit (1,5 kn). Gegenüber den Stromangaben einzelner Gezeitenrauten in der Karte zeigt der Atlas das ganze Gebiet auf einen Blick.',
      'Die Seite richtet sich nach der Zeit relativ zum Hochwasser des Bezugshafens: Jede Seite gilt von 30 Minuten vor bis 30 Minuten nach ihrer Stunde. Für eine Überfahrt nimmt man für jede Fahrtstunde die Seite, die der Mitte dieser Stunde am nächsten liegt. Die Rate des Tages wird linear über den Tidenhub zwischen Nipp und Spring berechnet; ist der Hub größer als der Spring-Hub, wird darüber hinaus extrapoliert.',
      'Für einen Schlag über mehrere Stunden addiert man die Stromvektoren aller Stunden und steuert einen gemeinsamen Kurs. Der Strom versetzt das Boot zwischendurch von der Kurslinie, gleicht sich aber teilweise wieder aus – das spart Weg und Zeit gegenüber stündlichem Gegenhalten. Liegt eine Gefahr nahe der Kurslinie, muss man die Zwischenorte prüfen. Der Atlas in dieser Lektion ist ein Übungsatlas.',
    ],
    keyPoints: [
      '„08,15“ = Nipp 0,8 kn, Spring 1,5 kn; Richtung aus dem Pfeil.',
      'Seite = nächste volle Stunde relativ zu HW des Bezugshafens (±30 min).',
      'Für jede Fahrtstunde die Seite zur Mitte der Stunde; Rate über den Tidenhub umrechnen.',
      'Über mehrere Stunden: Stromvektoren addieren, ein CTS – Gefahren nahe der Kurslinie prüfen.',
    ],
    mnemonic: 'Erst die Seite, dann die Rate, dann ein Kurs für alle Stunden.',
    widgets: [
      { title: 'Atlas blättern', Comp: AtlasBrowserWidget },
      { title: 'Welche Seite gilt?', Comp: AtlasPageQuizWidget },
      { title: 'Überfahrt mit dem Atlas planen', Comp: AtlasPassageWidget },
    ],
    links: [
      { label: 'Kurs über mehrere Stromstunden (Coastal)', href: '#/coastal/multi-hour-tide' },
      { label: 'Strom an Kaps und Engstellen', href: '#/coastal/tidal-races' },
      { label: 'Gezeiten (Day Skipper)', href: '#/themen/tides' },
    ],
  },
  {
    id: 'weather-charts',
    title: 'Wetterkarten lesen',
    english: 'Reading Weather Charts',
    summary: 'Bodendruckkarten verstehen: Windstärke aus dem Isobarenabstand, Richtung um Tief und Hoch, Fronten und der Ablauf eines Tiefdurchzugs.',
    body: [
      'Eine Bodendruckkarte zeigt Linien gleichen Luftdrucks (Isobaren, meist alle 4 hPa), Hoch- und Tiefdruckgebiete und Fronten: Warmfronten mit Halbkreisen, Kaltfronten mit Dreiecken, Okklusionen mit beidem. Für den Segler ist die wichtigste Information der Wind. Je enger die Isobaren, desto stärker der Wind; bei gleichem Abstand weht es in niedrigen Breiten stärker als in hohen, weil die Coriolisbeschleunigung zum Äquator hin abnimmt. Der Wert, der sich aus Abstand und Breite ergibt, heißt geostrophischer Wind.',
      'Auf der Nordhalbkugel weht der Wind gegen den Uhrzeigersinn um ein Tief und im Uhrzeigersinn um ein Hoch – mit dem Rücken zum Wind liegt das Tief links. Über See bremst die Reibung den Bodenwind auf etwa drei Viertel und dreht ihn um rund 15° zum Tief hin. Gekrümmte Isobaren verändern das Bild: Um ein Tief ist der Wind schwächer als nach dem Abstand zu erwarten, um ein Hoch etwas stärker. Böen und Schauerböen an Fronten liegen deutlich über diesen Mittelwerten.',
      'Ein Tief kündigt sich mit hohen Federwolken und fallendem Druck an. Vor der Warmfront dreht der Wind links und frischt auf, an der Front regnet es anhaltend und der Wind dreht rechts. Im Warmsektor ist es diesig, an der Kaltfront folgen Schauerböen, ein kräftiger Rechtsdreher und steigender Druck. Vorhersagekarten für 24 bis 72 Stunden zeigen, wie sich das Muster verschiebt; Barometer und Himmel an Bord zeigen, ob die Vorhersage eintrifft. GRIB-Daten sind praktisch, glätten aber Fronten und Böen.',
    ],
    keyPoints: [
      'Enge Isobaren = viel Wind; gleicher Abstand weiter südlich = mehr Wind.',
      'Nordhalbkugel: um das Tief gegen den Uhrzeigersinn, Tief links mit dem Wind im Rücken.',
      'Über See: Bodenwind ≈ ¾ des geostrophischen, ≈ 15° zum Tief hin; um ein Tief schwächer, um ein Hoch stärker.',
      'Tiefdurchzug: Cirrus → Warmfront (Regen, Rechtsdreher) → Warmsektor → Kaltfront (Böen, Rechtsdreher, Druck steigt).',
    ],
    mnemonic: 'Rücken zum Wind, das Tief zur Linken – und je enger die Linien, desto mehr Wind.',
    widgets: [
      { title: 'Wind aus dem Isobarenabstand', Comp: IsobarWindWidget },
      { title: 'Windrichtung um Tief und Hoch', Comp: WindAroundSystemWidget },
      { title: 'Ein Tief zieht durch', Comp: DepressionOrderWidget },
    ],
    links: [
      { label: 'Wetter (Day Skipper)', href: '#/themen/weather' },
      { label: 'Wetterrouting', href: '#/yachtmaster/weather-routing' },
      { label: 'Schwerwetter', href: '#/coastal/heavy-weather' },
    ],
  },
  {
    id: 'weather-routing',
    title: 'Wetterrouting',
    english: 'Weather Routing',
    summary: 'Mit Polardiagramm und Windvorhersage den schnellsten Weg und die beste Abfahrtszeit finden.',
    body: [
      'Auf längeren Überfahrten bestimmt der Wind, wie schnell man vorankommt. Das Polardiagramm zeigt die Bootsgeschwindigkeit für jeden Windwinkel und jede Windstärke. Gegen den Wind kann eine Yacht nicht direkt segeln: Unterhalb von etwa 40° liegt der No-go-Bereich. Entscheidend ist dann die VMG – die Geschwindigkeit, mit der man sich dem Ziel in Luv nähert. Sie ist bei einem bestimmten Am-Wind-Winkel (hier etwa 45°) am größten.',
      'Liegt das Ziel genau in Luv, kreuzt man auf diesem Winkel. Die gesegelte Strecke wächst dabei auf Distanz / cos(Kreuzwinkel): bei 45° rund 41 % mehr. Vor dem Wind ist es ähnlich: Platt vor dem Wind ist eine Yacht oft langsamer als mit etwas Raumwind, deshalb kann Halsen auf einem tieferen Raumschotskurs schneller sein.',
      'Mit einer stündlichen Windvorhersage lässt sich die beste Abfahrtszeit abschätzen: Wer einen angekündigten Winddreher abwartet, segelt vielleicht Halbwind statt zu kreuzen. Die schnellste Variante ist aber nicht automatisch die beste – Starkwind bei der Ankunft, Seegang, Strom, Tageslicht und die Crew gehören in die Entscheidung. Alle Polardaten hier sind fiktiv und vereinfacht (ohne Strom und Abdrift).',
    ],
    keyPoints: [
      'Polardiagramm: Bootsgeschwindigkeit über Windwinkel und Windstärke.',
      'Gegen den Wind zählt die VMG, nicht die Fahrt – optimaler Am-Wind-Winkel statt Hoch-am-Wind.',
      'Kreuzen genau gegen den Wind: gesegelte Strecke = Distanz / cos(Kreuzwinkel).',
      'Abfahrtszeit nach Vorhersage planen – und auf Starkwind, Seegang und Tageslicht achten.',
    ],
    mnemonic: 'Nicht die schnellste Fahrt gewinnt, sondern die beste VMG – und manchmal das Warten auf den Dreher.',
    widgets: [
      { title: 'Polardiagramm und beste Winkel', Comp: PolarWidget },
      { title: 'Kreuzen oder direkt?', description: 'Ziel 20 NM nördlich – verändere den Wind.', Comp: TackingWidget },
      { title: 'Abfahrtszeit nach Vorhersage', description: 'Welche Abfahrt bringt die kürzeste Überfahrt?', Comp: DepartureWidget },
    ],
    links: [{ label: 'Wetter (Day Skipper)', href: '#/themen/weather' }],
  },
  {
    id: 'ocean-passage',
    title: 'Ozeanpassage',
    english: 'Ocean Passage Planning',
    summary: 'Hochseeplanung: die richtige Jahreszeit und Route, Etmal und Reisedauer, Vorräte mit Reserve und die Bordzeit über die Längengrade.',
    body: [
      'Auf einer Ozeanpassage entscheidet die Jahreszeit mehr als jede Kurswahl. Im Nordatlantik dauert die Hurrikansaison offiziell vom 1. Juni bis 30. November. Wer von Europa in die Karibik will, quert die Biskaya im Sommer, wartet auf den Kanaren und startet ab Ende November auf der Passatroute – „nach Süden, bis die Butter schmilzt, dann rechts abbiegen“, also erst in den beständigen Nordostpassat. Zurück nach Europa geht es meist im Mai oder Juni nordwärts in die Westwinde, über Bermuda oder die Azoren.',
      'Pilot Charts zeigen für jeden Monat langjährige Mittelwerte von Wind, Strom, Sturmhäufigkeit, Nebel und Eisgrenzen. Sie sagen, was typisch ist – die tatsächliche Wetterentwicklung kommt unterwegs aus Wetterberichten, GRIB-Daten und der eigenen Beobachtung. Die Tagesleistung misst man im Etmal, der Strecke von Mittag zu Mittag; daraus folgen mittlere Fahrt, Reisedauer und Ankunft.',
      'Vorräte und Wasser plant man für die geschätzte Reisedauer plus Reserve (hier 30 %), denn Flauten, Bruch oder Umwege verlängern jede Überfahrt. Wasser wird auf mehrere Tanks und Kanister verteilt. Auf einer Ost-West-Passage verschiebt sich die Sonnenzeit um eine Stunde je 15° Länge; die Bordzeit wird schrittweise umgestellt, während Funk- und Wetterzeiten in UTC bleiben. Alle Werte der Übungen sind Richtwerte.',
    ],
    keyPoints: [
      'Jahreszeit zuerst: Hurrikansaison Nordatlantik Juni–November.',
      'Europa → Karibik: Biskaya im Sommer, Passatroute ab Ende November; zurück im Mai/Juni über Bermuda oder Azoren.',
      'Etmal / 24 = mittlere Fahrt; Distanz / Etmal = Reisedauer; Vorräte mit Reserve.',
      'Bordzeit: je 15° Länge eine Stunde, nach Westen zurückstellen.',
    ],
    mnemonic: 'Nach Süden, bis die Butter schmilzt – dann rechts abbiegen.',
    widgets: [
      { title: 'Route und Jahreszeit', Comp: SeasonRouteWidget },
      { title: 'Etmal, Ankunft und Wasser', Comp: EtmalProvisionWidget },
      { title: 'Bordzeit über die Längengrade', Comp: TimeZoneWidget },
    ],
    links: [
      { label: 'Wetterrouting', href: '#/yachtmaster/weather-routing' },
      { label: 'Großkreisnavigation', href: '#/yachtmaster/great-circle' },
      { label: 'Törnvorbereitung (Day Skipper)', href: '#/themen/preparation' },
    ],
  },
  {
    id: 'celestial',
    title: 'Astronavigation: die Mittagsbreite',
    english: 'Celestial Navigation: Noon Sight',
    summary: 'Ohne Elektronik die Breite bestimmen: Sonnenhöhe zur Kulmination messen, beschicken und mit der Deklination rechnen.',
    body: [
      'Fällt die Elektronik aus, bleibt auf hoher See die Astronavigation. Der einfachste Einstieg ist die Mittagsbreite: Zur Kulmination steht die Sonne genau im Meridian – im Süden oder Norden – und erreicht ihre größte Höhe. Man misst diese Höhe mit dem Sextanten zwischen Kimm und Sonnenrand.',
      'Die abgelesene Sextantenhöhe wird beschickt: Indexfehler des Sextanten, Kimmtiefe wegen der Augenhöhe, Refraktion (Lichtbrechung in der Atmosphäre) und der Sonnenhalbmesser, weil man den Rand und nicht die Mitte misst. Das Ergebnis ist die beobachtete Höhe Ho. Im Almanach stehen diese Korrekturen in Tafeln; hier werden Näherungsformeln benutzt.',
      'Mit der Zenitdistanz z = 90° − Ho und der Deklination der Sonne (Almanach) folgt die Breite: Steht die Sonne im Süden, ist Breite = Deklination + z; steht sie im Norden, Breite = Deklination − z (Nord positiv). Den Zeitpunkt der Kulmination schätzt man aus der Länge und der Zeitgleichung, beginnt aber einige Minuten vorher mit dem Messen. Die Länge erfordert weitere Verfahren (Höhenstandlinie) – sie sind nicht Teil dieser Lektion.',
    ],
    keyPoints: [
      'Beschickung: Hs → Indexberichtigung → Kimmtiefe → Ha → Refraktion → Halbmesser → Ho.',
      'Zenitdistanz z = 90° − Ho.',
      'Sonne im Süden: Breite = Deklination + z. Sonne im Norden: Breite = Deklination − z.',
      'Kulmination (UT) ≈ 12:00 − Länge/15 − Zeitgleichung; je 15° West eine Stunde später.',
    ],
    mnemonic: 'Hoch steht sie nur einmal am Tag: messen, beschicken, 90 minus, Deklination dazu.',
    widgets: [
      { title: 'Sextantenhöhe beschicken', Comp: SextantWidget },
      { title: 'Mittagsbreite berechnen', description: 'Mit Skizze des Meridians.', Comp: NoonLatitudeWidget },
      { title: 'Wann kulminiert die Sonne?', Comp: NoonTimeWidget },
    ],
    links: [{ label: 'Großkreisnavigation', href: '#/yachtmaster/great-circle' }],
  },
  {
    id: 'sight-reduction',
    title: 'Astronavigation: die Höhenstandlinie',
    english: 'Position Lines from Sights (Intercept Method)',
    summary: 'Aus jeder Gestirnshöhe zu jeder Zeit eine Standlinie gewinnen – und aus zwei Standlinien einen Fix.',
    body: [
      'Die Mittagsbreite liefert nur einmal am Tag eine Breite. Mit dem Verfahren nach Marcq St. Hilaire gewinnt man aus jeder Höhenmessung eine Standlinie: Alle Orte, an denen ein Gestirn gleichzeitig in derselben Höhe steht, liegen auf einem Kreis um seinen Bildpunkt. Nahe der eigenen Position ist dieser Kreis praktisch eine Gerade – die Höhenstandlinie.',
      'Man nimmt eine gegisste Position (AP) an und berechnet mit Greenwicher Stundenwinkel (GHA) und Deklination aus dem Almanach die Höhe Hc und das Azimut Zn, die man dort hätte. Der Unterschied zur gemessenen Höhe Ho ist der Intercept: (Ho − Hc) in Bogenminuten entspricht Seemeilen. Ist Ho größer, steht man näher am Bildpunkt (toward), sonst weiter weg (away). Vom AP trägt man den Intercept auf dem Azimut ab und zeichnet die Standlinie senkrecht dazu.',
      'Zwei oder drei Sterne in der Dämmerung ergeben einen Fix; Sonne vormittags und mittags ergeben mit Versegelung einen Running Fix. Je größer der Schnittwinkel, desto besser. Liegt die AP weit entfernt, rechnet man mit dem Ergebnis als neuer AP nach. Hier werden GHA und Deklination vereinfacht vorgegeben; echte Beobachtungen brauchen den Nautischen Almanach und eine genaue Uhrzeit (1 s Zeitfehler ≈ 0,25′ Länge).',
    ],
    keyPoints: [
      'LHA = GHA + Länge (Ost +, West −).',
      'Hc und Zn aus Breite, Deklination und LHA (sphärisches Dreieck).',
      'Intercept = (Ho − Hc) · 60 NM: toward, wenn Ho > Hc, sonst away.',
      'Standlinie senkrecht zum Azimut; zwei Standlinien = Fix, bei ferner AP nachrechnen.',
      'Nur Sonne: erste Standlinie um den gesegelten Weg versetzen und mit der zweiten schneiden (Running Fix) – Azimutänderung mindestens 30°.',
    ],
    mnemonic: 'Ho More Toward: Ist die gemessene Höhe größer, geht es zum Gestirn hin.',
    widgets: [
      { title: 'Intercept berechnen', description: 'Von der AP zur Höhenstandlinie.', Comp: InterceptWidget },
      { title: 'Fix aus zwei Sternen', description: 'Messfehler einstellen und den Fix beobachten.', Comp: SightFixWidget },
      { title: 'Sonne – Versegelung – Sonne', description: 'Running Fix aus zwei Sonnenstandlinien, mit unbekanntem Strom.', Comp: SunRunSunWidget },
    ],
    links: [{ label: 'Mittagsbreite', href: '#/yachtmaster/celestial' }],
  },
  {
    id: 'night-passage',
    title: 'Törnplanung über Nacht',
    english: 'Night Passage Planning',
    summary: 'Wachplan, Abfahrt für eine Ankunft bei Tageslicht und ein Feuerplan für die Nacht.',
    body: [
      'Eine Nachtfahrt beginnt mit der Planung bei Tageslicht. Zuerst die Zeiten: Wann geht die Sonne unter und auf, wie lange dauert die Überfahrt, und wann muss man ablegen, um den Zielhafen – besonders einen unbekannten – bei Tageslicht anzulaufen? Gezeitenfenster, Stromkentern und eine Reserve für langsamere Fahrt gehören dazu.',
      'Dann der Wachplan: Die Crew wird in Wachen eingeteilt, die sich in festen Abständen ablösen (meist 2–4 Stunden). Zwei Wachen sind bei kleiner Crew üblich, drei Wachen geben mehr Schlaf. Der Skipper legt fest, wann er geweckt wird (Verkehr, Winddreher, Unsicherheit), und jede Übergabe umfasst Kurs, Position, Verkehr, Wetter und Segelstellung. Nachts gilt: Lifebelt einpicken, bevor man das Cockpit verlässt; vorbereitete Mahlzeiten und warme Kleidung beugen Müdigkeit vor.',
      'Schließlich der Feuerplan: Welche Leuchtfeuer kommen wann in Sicht, mit welcher Kennung, und in welcher Peilung? Ein Feuer, das zur erwarteten Zeit nicht auftaucht, ist ein Warnsignal. Gefahren, Verkehrstrennungsgebiete und Fischereigebiete werden markiert, Ausweichhäfen für die Nacht festgelegt. Alle Daten der Übungen sind fiktiv.',
    ],
    keyPoints: [
      'Zeitplan rückwärts von der Ankunft bei Tageslicht planen – mit Reserve.',
      'Wachplan: 2–4 h je Wache; drei Wachen = mehr Ruhe; klare Weckregeln für den Skipper.',
      'Feuerplan: Sichtabschnitt ± √(Reichweite² − Querabstand²) um den Querab-Punkt; Kennung vorab notieren.',
      'Nachts: Lifebelt, Rotlicht, warme Kleidung, vorbereitetes Essen, Übergabe ins Logbuch.',
    ],
    mnemonic: 'Bei Tag planen, in der Nacht nur noch ausführen.',
    widgets: [
      { title: 'Wachplan', description: 'Crew, Wachsystem und Wachdauer einstellen.', Comp: WatchPlanWidget },
      { title: 'Ankunft bei Tageslicht', Comp: DaylightArrivalWidget },
      { title: 'Feuerplan für die Nacht', description: 'Wann kommt welches Feuer in Sicht?', Comp: RouteLightsWidget },
    ],
    links: [
      { label: 'Nachtnavigation', href: '#/yachtmaster/night-navigation' },
      { label: 'Törnplanung (Coastal)', href: '#/coastal/passage-planning' },
    ],
  },
  {
    id: 'radar-plotting',
    title: 'Radarplotting',
    english: 'Radar Plotting',
    summary: 'Aus zwei Radarbeobachtungen Kurs, Fahrt und CPA eines Ziels bestimmen – und ein Ausweichmanöver prüfen.',
    body: [
      'Auf einem nordstabilisierten Radar steht das eigene Schiff in der Mitte. Ein Ziel bewegt sich auf dem Schirm nicht mit seinem wahren Kurs, sondern relativ zu uns. Beobachtet man es zweimal im Abstand von zum Beispiel sechs Minuten (Punkte O und A), zeigt die Verlängerung von O nach A, wie nahe es kommt: den kleinsten Abstand (CPA) und die Zeit bis dahin (TCPA). Bleibt die Peilung konstant und der Abstand nimmt ab, besteht Kollisionsgefahr.',
      'Den wahren Kurs und die wahre Fahrt des Ziels erhält man mit dem Plotdreieck: Von O trägt man den eigenen Weg in dieser Zeit rückwärts ab (Punkt W). W→O ist der eigene Weg, W→A der wahre Weg des Ziels, O→A die Relativbewegung. Daraus folgt auch der Aspekt – unter welchem Winkel das Ziel uns sieht – und damit, welche Lichter wir nachts sehen würden.',
      'Mit dem Plot lässt sich ein Ausweichmanöver vorab prüfen: Ändert man Kurs oder Fahrt, ändert sich die Relativbewegung und damit der CPA. Ausweichmanöver müssen früh und deutlich sein (Rule 8), damit sie auch auf dem Radar des anderen erkennbar sind. Bei verminderter Sicht gilt Rule 19: Bei einem Fahrzeug vorlicher als querab (außer einem, das man überholt) nach Möglichkeit nicht nach Backbord ausweichen, und nicht auf ein Fahrzeug zu, das querab oder achterlicher steht. Die Daten der Übung sind fiktiv; ARPA/AIS-Werte immer mit eigener Beobachtung plausibilisieren.',
    ],
    keyPoints: [
      'Zwei Beobachtungen O und A (z. B. 6 min) → Relativbewegung; verlängert → CPA und TCPA.',
      'Plotdreieck: W→O eigener Weg, W→A wahrer Weg des Ziels, O→A Relativbewegung.',
      'Konstante Peilung bei abnehmendem Abstand = Kollisionsgefahr.',
      'Manöver früh und groß; bei verminderter Sicht nicht nach Backbord für Ziele vorlicher als querab.',
    ],
    mnemonic: 'O → A zeigt, wohin es relativ geht; W → A zeigt, wohin es wirklich fährt.',
    widgets: [{ title: 'Radarplot mit Plotdreieck', description: 'Beispiele wählen oder eigene Beobachtungen eingeben, dann ein Ausweichmanöver testen.', Comp: RadarPlotWidget }],
    links: [
      { label: 'CPA/TCPA (E-Navigation)', href: '#/themen/electronics' },
      { label: 'Kollisionsverhütung', href: '#/themen/colregs' },
    ],
  },
  {
    id: 'offshore-emergency',
    title: 'Notfälle auf Hochsee',
    english: 'Offshore Emergencies',
    summary: 'Weit draußen ist Hilfe Stunden entfernt: Mensch über Bord bei Nacht, Suchmuster, EPIRB und SART, Überleben im kalten Wasser und Verlassen des Schiffes.',
    body: [
      'Fällt nachts jemand über Bord, zählt jede Sekunde: rufen, Rettungsmittel werfen, einen Ausguck bestimmen, der nur zeigt, MOB-Taste drücken. Unter Segeln wendet man sofort (Quick-Stop) und bleibt nah bei der Person; unter Maschine bringt der Williamson-Turn ein Fahrzeug auf das eigene Kielwasser zurück. Im kalten Wasser hilft die Regel 1-10-1: eine Minute Kälteschock, etwa zehn Minuten sinnvolle Bewegung, rund eine Stunde bis zur Bewusstlosigkeit durch Unterkühlung – Rettungsweste und Lifeline sind die beste Versicherung.',
      'Ist die Person nicht mehr zu sehen, sucht man systematisch um einen Bezugspunkt (Datum). Dieser wandert mit dem Strom: Die MOB-Taste speichert einen Ort über Grund, die Person treibt mit dem Wasser – genau wie das Boot. Das wachsende Quadrat deckt eine Fläche gleichmäßig ab, die Sektorsuche führt immer wieder über das Datum, wenn der Ort recht genau bekannt ist.',
      'Auf Hochsee kommt Hilfe meist erst nach Stunden, oft von einem umgeleiteten Handelsschiff. Eine EPIRB (406 MHz) meldet den Notfall über Satellit, ein Radar-SART erscheint auf dem Radar des Suchschiffs als Linie aus 12 Punkten, ein AIS-SART als AIS-Ziel. Die Rettungsinsel ist das letzte Mittel: Man steigt erst um, wenn das Schiff nicht mehr zu halten ist – mit Notfalltasche, Wasser, SART und Handfunkgerät. Alle Zahlen der Übungen sind vereinfachte Richtwerte.',
    ],
    keyPoints: [
      'MOB: rufen, werfen, zeigen, MOB-Taste – unter Segeln Quick-Stop, unter Maschine ggf. Williamson-Turn.',
      '1-10-1: Kälteschock, zehn Minuten Bewegung, eine Stunde bis zur Unterkühlung.',
      'Suche um das mitwandernde Datum: wachsendes Quadrat oder Sektorsuche (9 R).',
      'EPIRB über Satellit, SART für die letzte Annäherung; Insel erst, wenn das Schiff sinkt.',
    ],
    mnemonic: 'Erst ins Boot zurück, dann ins Wasser schauen – und die Insel nur, wenn es nach oben geht.',
    widgets: [
      { title: 'Mensch über Bord: Sekunden und Strom', Comp: MobDriftWidget },
      { title: 'Suchmuster', Comp: SearchPatternWidget },
      { title: 'Hilfe ist weit weg', Comp: RescueTimeWidget },
      { title: 'Verlassen des Schiffes', Comp: AbandonShipOrderWidget },
    ],
    links: [
      { label: 'Sicherheit & Seefunk (Day Skipper)', href: '#/themen/safety' },
      { label: 'Notfälle unter Segeln (Coastal)', href: '#/coastal/emergencies' },
      { label: 'Radarplotting', href: '#/yachtmaster/radar-plotting' },
    ],
  },
]

export function YachtmasterPage({ lessonId }: { lessonId?: string }) {
  const lesson = YACHT_LESSONS.find((l) => l.id === lessonId)
  return lesson ? (
    <LessonDetail lesson={lesson} lessons={YACHT_LESSONS} basePath="#/yachtmaster" backLabel="Alle Lektionen" />
  ) : (
    <LessonCatalog
      title="Yachtmaster (Vorgriff)"
      subtitle="Erste Themen über den Coastal-Stoff hinaus: Großkreisnavigation, Nachtnavigation, Wetterrouting, Törnplanung über Nacht, Radarplotting und Astronavigation (Mittagsbreite, Höhenstandlinie) – jeweils mit interaktiver Übung."
      lessons={YACHT_LESSONS}
      basePath="#/yachtmaster"
      quizLabel={`${QUESTION_BANK.filter((q) => q.level === 'yachtmaster-offshore').length} Yachtmaster-Fragen üben`}
    />
  )
}
