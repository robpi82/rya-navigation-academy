import {
  addVectors,
  direction,
  fromPolar,
  anchorChainLength,
  apparentWind,
  closingSpeed,
  compassToTrue,
  dip,
  distanceOffFromBowAngles,
  epErrorRadius,
  reduceSounding,
  fuelNeeded,
  geostrophicWind,
  surfaceWindSpeed,
  thirdsRange,
  distanceFrom,
  driftToCoast,
  geographicRange,
  greatCircle,
  heightByTwelfths,
  interpolateTidalRate,
  knotsToMs,
  leakRate,
  lineAdjustment,
  localHourAngle,
  minChartedDepth,
  noonLatitude,
  noonTimeUT,
  secondsToMeet,
  stoppingDistance,
  swingRadius,
  tackingDistance,
  tidalRange,
  timeFrom,
  trueToCompass,
  underKeelClearance,
  vmg,
  waterDepth,
  waterTrackFromHeading,
  windForceRatio,
  windOverWater,
} from '@/calculations'
import type { CourseLevel } from '@/types/learning'

/**
 * Formelsammlung: jede Formel mit einem Rechenbeispiel. Das Ergebnis wird live mit denselben Funktionen berechnet wie in
 * Lektionen und Rechnern; `expected` hält den Wert fest, ein Test prüft beide gegeneinander.
 */
export interface Formula {
  id: string
  title: string
  formula: string
  /** Beispiel ohne Ergebnis – das Ergebnis wird angehängt */
  example: string
  compute: () => number
  expected: number
  digits: number
  unit: string
  href: string
}

export interface FormulaGroup {
  id: string
  title: string
  level: CourseLevel
  items: Formula[]
}

export const FORMULA_GROUPS: FormulaGroup[] = [
  {
    id: 'basics',
    title: 'Weg, Zeit, Geschwindigkeit und Kurse',
    level: 'day-skipper',
    items: [
      { id: 'dst-distance', title: 'Distanz', formula: 'Distanz = Fahrt × Zeit', example: '6 kn × 2,5 h', compute: () => distanceFrom(6, 2.5), expected: 15, digits: 1, unit: ' NM', href: '#/rechner' },
      { id: 'dst-time', title: 'Fahrzeit', formula: 'Zeit = Distanz / Fahrt', example: '15 NM / 6 kn', compute: () => timeFrom(15, 6)!, expected: 2.5, digits: 1, unit: ' h', href: '#/rechner' },
      { id: 'kn-ms', title: 'Knoten in m/s', formula: 'm/s = kn × 1852 / 3600 (≈ kn / 2)', example: '20 kn', compute: () => knotsToMs(20), expected: 10.29, digits: 1, unit: ' m/s', href: '#/themen/weather' },
      { id: 'c-to-t', title: 'Kompass → rechtweisend', formula: 'rwK = MgK + Abl. + Missw. (Ost +, West −)', example: 'Kompass 100°, Ablenkung 3° E, Missweisung 5° W', compute: () => compassToTrue(100, 3, -5).true, expected: 98, digits: 0, unit: '°', href: '#/themen/compass' },
      { id: 't-to-c', title: 'Rechtweisend → Kompass', formula: 'MgK = rwK − Missw. − Abl. (Ost +, West −)', example: 'rechtweisend 098°, Missweisung 5° W, Ablenkung 3° E', compute: () => trueToCompass(98, -5, 3).compass, expected: 100, digits: 0, unit: '°', href: '#/themen/compass' },
      { id: 'fuel', title: 'Diesel für die Strecke', formula: 'Diesel = Distanz / Fahrt × Verbrauch × 1,2 (20 % Reserve)', example: '24 NM, 6 kn, 3 l/h', compute: () => fuelNeeded(24, 6, 3), expected: 14.4, digits: 1, unit: ' l', href: '#/themen/preparation' },
      { id: 'thirds', title: 'Drittelregel', formula: 'max. hinaus = Tank / 3 / Verbrauch × Fahrt', example: '60 l Tank, 4 l/h, 6 kn', compute: () => thirdsRange(60, 4, 6), expected: 30, digits: 0, unit: ' NM', href: '#/themen/preparation' },
      { id: 'ground-track', title: 'Kurs über Grund (Stromdreieck)', formula: 'Über Grund = Fahrt durchs Wasser (Water Track) + Strom, als Vektoren addiert', example: 'Water Track 000° mit 5 kn, Strom 090° mit 2 kn', compute: () => direction(addVectors(fromPolar(5, 0), fromPolar(2, 90)))!, expected: 21.8, digits: 0, unit: '° COG', href: '#/simulator' },
      { id: 'leeway', title: 'Water Track', formula: 'Water Track = Heading ± Leeway (Abdrift nach Lee)', example: 'Heading 090°, 5° Abdrift nach Steuerbord', compute: () => waterTrackFromHeading(90, 5), expected: 95, digits: 0, unit: '°', href: '#/glossar/leeway' },
    ],
  },
  {
    id: 'tides',
    title: 'Gezeiten und Tiefe',
    level: 'day-skipper',
    items: [
      { id: 'range', title: 'Tidenhub', formula: 'Tidenhub = Höhe HW − Höhe NW', example: 'HW 5,2 m, NW 1,0 m', compute: () => tidalRange(5.2, 1), expected: 4.2, digits: 1, unit: ' m', href: '#/themen/tides' },
      { id: 'twelfths', title: 'Zwölftelregel', formula: 'Anstieg je Stunde: 1, 2, 3, 3, 2, 1 Zwölftel des Tidenhubs', example: 'NW 1,0 m, HW 5,8 m, 3 h nach NW (1 + 2 + 3 = 6/12)', compute: () => heightByTwelfths(1, 5.8, 3), expected: 3.4, digits: 1, unit: ' m', href: '#/coastal/tidal-height' },
      { id: 'rate', title: 'Stromrate zwischen Spring und Nipp', formula: 'Rate = Nipp + (Spring − Nipp) × (Hub − Nipp-Hub) / (Spring-Hub − Nipp-Hub)', example: 'Spring 4,0 kn, Nipp 2,0 kn, Hübe 5,0 / 2,0 m, heute 3,5 m', compute: () => interpolateTidalRate({ springRate: 4, neapRate: 2, range: 3.5, springRange: 5, neapRange: 2 })!.rate, expected: 3, digits: 1, unit: ' kn', href: '#/rechner' },
      { id: 'depth', title: 'Wassertiefe', formula: 'Tiefe = Kartentiefe + Höhe der Gezeit', example: 'Kartentiefe 2,0 m, Höhe der Gezeit 3,4 m', compute: () => waterDepth(2, 3.4), expected: 5.4, digits: 1, unit: ' m', href: '#/themen/tides' },
      { id: 'ukc', title: 'Wasser unter dem Kiel', formula: 'UKC = Tiefe − Tiefgang', example: 'Tiefe 5,4 m, Tiefgang 1,8 m', compute: () => underKeelClearance(5.4, 1.8), expected: 3.6, digits: 1, unit: ' m', href: '#/themen/tides' },
      { id: 'chain', title: 'Kettenlänge', formula: 'Kette = 4 × (Tiefe bei HW + Bughöhe), Leine 6 ×', example: 'Tiefe bei HW 8 m, Bughöhe 1 m', compute: () => anchorChainLength(8, 1, 4), expected: 36, digits: 0, unit: ' m', href: '#/coastal/anchoring' },
      { id: 'light', title: 'Geografische Sichtweite eines Feuers', formula: 'Sichtweite (NM) = 2,08 × (√Feuerhöhe + √Augeshöhe), Höhen in m', example: 'Feuer 25 m, Auge 2,5 m', compute: () => geographicRange(25, 2.5), expected: 13.69, digits: 1, unit: ' NM', href: '#/themen/chart-reading' },
    ],
  },
  {
    id: 'coastal',
    title: 'Coastal Skipper',
    level: 'coastal-skipper',
    items: [
      { id: 'bow-angle', title: 'Abstand aus zwei Bugwinkeln', formula: 'd₂ = Strecke · sin α₁ / sin(α₂ − α₁); Verdoppelung: d₂ = Strecke', example: '30° → 60° nach 2 NM', compute: () => distanceOffFromBowAngles(30, 60, 2)!, expected: 2, digits: 1, unit: ' NM', href: '#/coastal/no-gps' },
      { id: 'ep-error', title: 'Fehlerkreis des Koppelorts', formula: 'Radius ≈ 10 % der Strecke seit dem letzten sicheren Ort', example: '30 NM gekoppelt', compute: () => epErrorRadius(30), expected: 3, digits: 1, unit: ' NM', href: '#/coastal/no-gps' },
      { id: 'reduce-sounding', title: 'Lotung auf Kartennull', formula: 'Kartentiefe = Echolot + Gebertiefe − Höhe der Gezeit', example: 'Echolot 12,4 m, Geber 0,4 m, Gezeit 3,0 m', compute: () => reduceSounding(12.4, 0.4, 3), expected: 9.8, digits: 1, unit: ' m', href: '#/coastal/no-gps' },
      { id: 'min-depth', title: 'Mindest-Kartentiefe zum Ankern', formula: 'Kartentiefe ≥ Tiefgang + Sicherheit − Höhe der Gezeit bei NW', example: 'Tiefgang 1,9 m, Sicherheit 0,5 m, NW-Höhe 0,4 m', compute: () => minChartedDepth(1.9, 0.5, 0.4), expected: 2, digits: 1, unit: ' m', href: '#/coastal/anchoring' },
      { id: 'swing', title: 'Schwojkreis', formula: 'Radius = √(Kette² − Tiefe bei NW²) + Bootslänge', example: '32 m Kette, 4 m Tiefe, 10 m Boot', compute: () => swingRadius(32, 4, 10), expected: 41.75, digits: 0, unit: ' m', href: '#/coastal/anchoring' },
      { id: 'mooring', title: 'Leinen im Tidenhafen', formula: 'Leine = √(horizontal² + Höhenunterschied²)', example: 'Querleine 3 m horizontal, Wasser fällt 4 m', compute: () => lineAdjustment(3, 6, 1, 5, 1), expected: 2, digits: 1, unit: ' m länger', href: '#/coastal/mooring' },
      { id: 'closing', title: 'Annäherungs\u00ADgeschwindigkeit', formula: 'Gegenkurs: eigene Fahrt + Fahrt des anderen', example: '5 kn und 10 kn auf Gegenkurs', compute: () => closingSpeed(5, 10), expected: 15, digits: 0, unit: ' kn', href: '#/coastal/fog' },
      { id: 'meet', title: 'Zeit bis zur Begegnung im Nebel', formula: 'Zeit (s) = Sichtweite / Annäherung × 3600', example: '0,25 NM Sicht, 10 kn Annäherung', compute: () => secondsToMeet(0.25, 10), expected: 90, digits: 0, unit: ' s', href: '#/coastal/fog' },
      { id: 'stopping', title: 'Anhalteweg', formula: 'Weg = v × Reaktionszeit + v² / (2 × Verzögerung)', example: '5 kn, 30 s Reaktion, 0,3 m/s²', compute: () => stoppingDistance(5), expected: 88.2, digits: 0, unit: ' m', href: '#/coastal/fog' },
      { id: 'apparent', title: 'Scheinbarer Wind', formula: 'AWS = √(TWS² + Fahrt² + 2 · TWS · Fahrt · cos TWA)', example: '20 kn wahrer Wind von achtern, 7 kn Fahrt', compute: () => apparentWind(20, 180, 7).speed, expected: 13, digits: 0, unit: ' kn', href: '#/coastal/heavy-weather' },
      { id: 'pressure', title: 'Winddruck', formula: 'Druck ~ Wind² → Verhältnis = (neu / alt)²', example: 'von 15 auf 30 kn', compute: () => windForceRatio(15, 30), expected: 4, digits: 0, unit: ' × Druck', href: '#/coastal/heavy-weather' },
      { id: 'wind-water', title: 'Wind über dem Wasser', formula: 'Wind gegen Strom: Wind + Strom; mit dem Strom: Wind − Strom', example: '20 kn Wind gegen 3 kn Strom', compute: () => windOverWater(270, 20, 270, 3).speed, expected: 23, digits: 0, unit: ' kn', href: '#/coastal/tidal-races' },
      { id: 'drift', title: 'Drift auf die Leeküste', formula: 'Zeit = Abstand / (Windabdrift ≈ 4 % des Windes + Strom auf die Küste)', example: '25 kn auflandig, 3 NM, kein Strom', compute: () => driftToCoast(270, 25, 0, 0, 90, 3).hours!, expected: 3, digits: 1, unit: ' h', href: '#/coastal/emergencies' },
      { id: 'leak', title: 'Wassereinbruch', formula: 'Q = 0,6 × Fläche × √(2 g × Tiefe)', example: '2-cm-Loch, 0,5 m unter der Wasserlinie', compute: () => leakRate(2, 0.5), expected: 35.4, digits: 0, unit: ' l/min', href: '#/coastal/emergencies' },
    ],
  },
  {
    id: 'yacht',
    title: 'Yachtmaster',
    level: 'yachtmaster-offshore',
    items: [
      { id: 'gc', title: 'Großkreisdistanz', formula: 'cos d = sin φ1 sin φ2 + cos φ1 cos φ2 cos Δλ; 1′ Bogen = 1 NM', example: 'auf dem Äquator von 0° nach 60° E', compute: () => greatCircle({ lat: 0, lon: 0 }, { lat: 0, lon: 60 })!.distance, expected: 3600, digits: 0, unit: ' NM', href: '#/yachtmaster/great-circle' },
      { id: 'geostrophic', title: 'Wind aus dem Isobarenabstand', formula: 'V = Δp / (ρ · f · Δn), f = 2 Ω sin φ; Bodenwind über See ≈ ¾ V', example: '4 hPa auf 100 NM, 50° N, Bodenwind', compute: () => surfaceWindSpeed(geostrophicWind(4, 100, 50)), expected: 23, digits: 0, unit: ' kn', href: '#/yachtmaster/weather-charts' },
      { id: 'tacking', title: 'Kreuzen gegen den Wind', formula: 'gesegelt = Distanz / cos(Winkel zum Wind)', example: '10 NM genau gegen den Wind, 45° am Wind', compute: () => tackingDistance(10, 45), expected: 14.14, digits: 1, unit: ' NM', href: '#/yachtmaster/weather-routing' },
      { id: 'vmg', title: 'VMG', formula: 'VMG = SOG × cos(Kurs zum Ziel − COG)', example: 'SOG 6 kn, 30° neben dem Kurs zum Ziel', compute: () => vmg(6, 30, 0), expected: 5.2, digits: 1, unit: ' kn', href: '#/themen/electronics' },
      { id: 'dip', title: 'Kimmtiefe', formula: 'Dip (′) = −1,76 × √Augeshöhe (m)', example: 'Augeshöhe 4 m', compute: () => dip(4), expected: -3.52, digits: 1, unit: '′', href: '#/yachtmaster/celestial' },
      { id: 'noon-lat', title: 'Mittagsbreite', formula: 'Sonne im Süden: Breite = Deklination + (90° − Ho)', example: 'Ho 50°, Deklination 10° N', compute: () => noonLatitude(50, 10, 'S'), expected: 50, digits: 0, unit: '° N', href: '#/yachtmaster/celestial' },
      { id: 'noon-time', title: 'Zeit der Kulmination', formula: 'UT = 12 h − Länge / 15 (Ost +) − Zeitgleichung', example: 'Länge 30° W, Zeitgleichung 0', compute: () => noonTimeUT(-30), expected: 14, digits: 0, unit: ' h UT', href: '#/yachtmaster/celestial' },
      { id: 'lha', title: 'Ortsstundenwinkel', formula: 'LHA = GHA + Länge (Ost +, West −)', example: 'GHA 40°, Länge 15° W', compute: () => localHourAngle(40, -15), expected: 25, digits: 0, unit: '°', href: '#/yachtmaster/sight-reduction' },
    ],
  },
]

/** Formatiert ein Ergebnis mit deutschem Dezimalkomma. */
export const formatResult = (f: Formula): string => `${f.compute().toFixed(f.digits).replace('.', ',').replace('-', '−')}${f.unit}`
