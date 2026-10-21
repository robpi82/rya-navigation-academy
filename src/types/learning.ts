export type TermId =
  | 'hdg'
  | 'stw'
  | 'water-track'
  | 'cog'
  | 'sog'
  | 'ground-track'
  | 'leeway'
  | 'fix'
  | 'ep'

/** Coastal-Skipper-Themen, die über die neun Grundbegriffe hinausgehen */
export type CoastalTopicId = 'tidal-height' | 'running-fix' | 'clearing-bearing' | 'passage-planning' | 'multi-hour-tide' | 'secondary-ports' | 'pilotage' | 'fog' | 'heavy-weather' | 'mooring' | 'emergencies' | 'anchoring' | 'tidal-races' | 'no-gps'

/** Day-Skipper-Themen (Lektionen über die neun Grundbegriffe hinaus) */
export type DayTopicId = 'compass' | 'tides' | 'chart-reading' | 'buoyage' | 'colregs' | 'weather' | 'safety' | 'electronics' | 'bearings' | 'preparation' | 'seamanship'

export type BuoyId =
  | 'port'
  | 'starboard'
  | 'pref-stbd'
  | 'pref-port'
  | 'north'
  | 'east'
  | 'south'
  | 'west'
  | 'isolated'
  | 'safe'
  | 'special'
  | 'new-danger'

/** Yachtmaster-Offshore-Themen (Vorgriff) */
export type YachtTopicId = 'offshore-emergency' | 'ocean-passage' | 'tidal-atlas' | 'weather-charts' | 'great-circle' | 'night-navigation' | 'weather-routing' | 'celestial' | 'sight-reduction' | 'night-passage' | 'radar-plotting'

export type TopicId = TermId | CoastalTopicId | DayTopicId | YachtTopicId

export type CourseLevel = 'day-skipper' | 'coastal-skipper' | 'yachtmaster-offshore'

export type IllustrationKind = TermId

export interface ChoiceCheck {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
}

export interface GlossaryTerm {
  id: TermId
  abbr: string
  english: string
  german: string
  /** Kurzdefinition (ein Satz) */
  definition: string
  /** Ausführliche Erklärung in Absätzen */
  details: string[]
  mnemonic: string
  example: string
  confusions: { with: string; explanation: string }[]
  check: ChoiceCheck
  /** Typische Anzeige / Quelle an Bord */
  source: string
}

export type Difficulty = 1 | 2 | 3

interface QuestionBase {
  id: string
  topic: TopicId
  difficulty: Difficulty
  level: CourseLevel
  prompt: string
  /** Kurze Musterlösung */
  solution: string
  /** Nachvollziehbarer Rechen-/Denkweg */
  steps: string[]
  category: QuestionCategory
}

type LatLonLike = { lat: number; lon: number }

/** Thematische Aufgabenart (für Filter und Statistik) */
export type QuestionCategory = 'concept' | 'calculation' | 'course' | 'diagram' | 'error' | 'matching'

export const CATEGORY_LABEL: Record<QuestionCategory, string> = {
  concept: 'Begriffsverständnis',
  calculation: 'Zahlenberechnung',
  course: 'Kursberechnung',
  diagram: 'Diagramm / Abbildung',
  error: 'Fehlererkennung',
  matching: 'Begriff-Zuordnung',
}

/** Vektordiagramm zu einer Aufgabe: Vektoren werden neutral mit Buchstaben beschriftet. */
export interface QuestionDiagram {
  heading: number
  stw: number
  tideDirection: number
  tideRate: number
  leeway: number
  /** Buchstaben-Beschriftung je Vektor; nicht genannte Vektoren werden nicht gezeichnet */
  labels: Partial<Record<'heading' | 'water' | 'tide' | 'ground', string>>
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'mc'
  options: string[]
  correctIndex: number
  diagram?: QuestionDiagram
  /** Abbildung einer Tonne zur Aufgabe */
  buoy?: BuoyId
}

export type QuestionVerify =
  | {
      kind: 'sim'
      heading: number
      stw: number
      tideDirection: number
      tideRate: number
      leeway: number
      durationMin: number
      quantity: 'cog' | 'sog' | 'waterTrack' | 'distanceOverGround' | 'tideDrift' | 'distanceThroughWater'
    }
  | {
      kind: 'cts'
      desiredTrack: number
      stw: number
      tideDirection: number
      tideRate: number
      leeway: number
      distance?: number
      quantity: 'cts' | 'sog' | 'timeMinutes'
    }
  | {
      kind: 'twelfths'
      lw: number
      hw: number
      hoursAfterLw: number
      /** Kartentiefe – falls gesetzt, wird die Wassertiefe (Kartentiefe + Höhe) geprüft */
      chartedDepth?: number
      quantity: 'height' | 'depth'
    }
  | {
      kind: 'passage'
      desiredTrack: number
      distance: number
      stw: number
      tides: { set: number; rate: number }[]
      quantity: 'cts' | 'timeMinutes'
    }
  | {
      kind: 'compass'
      quantity: 'true' | 'compass' | 'magnetic' | 'variationWest' | 'deviationEast'
      compass?: number
      trueCourse?: number
      deviation?: number
      variation?: number
      chartVariation?: number
      chartYear?: number
      annualChange?: number
      year?: number
      table?: { heading: number; deviation: number }[]
      compassHeading?: number
    }
  | {
      kind: 'tide'
      quantity: 'range' | 'depth' | 'height' | 'ukc' | 'windowMinutes' | 'chain'
      hw?: number
      lw?: number
      hoursAfterHw?: number
      chartedDepth?: number
      heightOfTide?: number
      draught?: number
      margin?: number
      bowHeight?: number
      ratio?: number
    }
  | {
      kind: 'chart'
      quantity: 'distance' | 'geoRange'
      from?: LatLonLike
      to?: LatLonLike
      lightHeight?: number
      eyeHeight?: number
    }
  | {
      kind: 'weather'
      quantity: 'beaufort' | 'msToKn' | 'knToMs' | 'lowDirection' | 'shiftDegrees'
      value?: number
      windFrom?: number
      from?: number
      to?: number
    }
  | {
      kind: 'enav'
      quantity: 'vmg' | 'cpa' | 'tcpa' | 'ukc'
      sog?: number
      cog?: number
      btw?: number
      own?: { course: number; speed: number }
      target?: { bearing: number; distance: number; course: number; speed: number }
      displayed?: number
      reference?: 'transducer' | 'keel' | 'waterline'
      transducerDepth?: number
      draught?: number
    }
  | {
      kind: 'bearing'
      quantity: 'reciprocal' | 'cutAngle' | 'errorWest' | 'errorEast' | 'deviationWest' | 'deviationEast'
      bearing?: number
      bearing2?: number
      trueBearing?: number
      observed?: number
      /** Variation in ° (Ost positiv) */
      variation?: number
    }
  | {
      kind: 'secondary'
      quantity: 'hwHeight' | 'lwHeight' | 'hwTimeMin' | 'range'
      stdHwTime: number
      stdHwHeight: number
      stdLwTime: number
      stdLwHeight: number
      port: 'kranich' | 'nordbucht' | 'moewe'
    }
  | {
      kind: 'greatcircle'
      quantity: 'distance' | 'initialBearing' | 'finalBearing' | 'saving'
      from: LatLonLike
      to: LatLonLike
    }
  | {
      kind: 'astro'
      quantity: 'noonLatitude' | 'dip' | 'noonTimeMin' | 'lha' | 'hc' | 'intercept' | 'sunGha'
      position?: LatLonLike
      gha?: number
      computedAltitude?: number
      ut?: number
      observedAltitude?: number
      declination?: number
      sunBearing?: 'S' | 'N'
      eyeHeight?: number
      longitude?: number
      equationOfTime?: number
    }
  | {
      kind: 'emergency'
      quantity: 'driftHours' | 'leakLpm' | 'minutesUntil'
      windFrom?: number
      windKn?: number
      currentSet?: number
      currentKn?: number
      coastBearing?: number
      distanceNm?: number
      diameterCm?: number
      depthM?: number
      volumeL?: number
      inflowLpm?: number
      pumpingLpm?: number
    }
  | {
      kind: 'sar'
      quantity: 'distanceAwayM' | 'datumDriftNm' | 'squareLength' | 'squareMinutes' | 'sectorLength' | 'rescueHours'
      speedKn?: number
      seconds?: number
      currentKn?: number
      minutes?: number
      spacingNm?: number
      legs?: number
      radiusNm?: number
      distanceNm?: number
    }
  | {
      kind: 'ocean'
      quantity: 'speed' | 'days' | 'water' | 'clockBack' | 'etmalNeeded' | 'daysPerHour'
      etmalNm?: number
      distanceNm?: number
      days?: number
      crew?: number
      litresPerPersonDay?: number
      reserve?: number
      fromLon?: number
      toLon?: number
      latDeg?: number
    }
  | {
      kind: 'atlas'
      quantity: 'rate' | 'page' | 'passagePage' | 'drift'
      label?: string
      range?: number
      neapRange?: number
      springRange?: number
      minutesFromHw?: number
      hourIndex?: number
      tides?: { set: number; rate: number }[]
      hours?: number
    }
  | {
      kind: 'wxchart'
      quantity: 'geostrophic' | 'surface' | 'surfaceDir' | 'frontHours' | 'gradient'
      intervalHpa?: number
      spacingNm?: number
      latDeg?: number
      bearingFromCentre?: number
      system?: 'low' | 'high'
      radiusNm?: number
      distanceNm?: number
      speedKn?: number
    }
  | {
      kind: 'nogps'
      quantity: 'distanceOff' | 'abeam' | 'epRadius' | 'reduced' | 'dipping'
      firstAngle?: number
      secondAngle?: number
      runNm?: number
      fraction?: number
      displayedDepth?: number
      transducerDepth?: number
      heightOfTide?: number
      lightHeight?: number
      eyeHeight?: number
    }
  | {
      kind: 'prep'
      quantity: 'fuel' | 'thirds' | 'water' | 'margin'
      distanceNm?: number
      sogKn?: number
      litresPerHour?: number
      reserve?: number
      tankLitres?: number
      crew?: number
      days?: number
      litresPerPersonDay?: number
      departHour?: number
      sunsetHour?: number
    }
  | {
      kind: 'races'
      quantity: 'windOverWater' | 'rate' | 'sog' | 'departBeforeHw'
      windFrom?: number
      windKn?: number
      streamSet?: number
      streamKn?: number
      springRate?: number
      neapRate?: number
      range?: number
      springRange?: number
      neapRange?: number
      stwKn?: number
      distanceNm?: number
      slackHour?: number
    }
  | {
      kind: 'anchoring'
      quantity: 'rode' | 'swing' | 'clearance' | 'minDepth'
      chartedDepth?: number
      hwHeight?: number
      lwHeight?: number
      scope?: number
      boatLength?: number
      draught?: number
      margin?: number
    }
  | {
      kind: 'mooring'
      quantity: 'adjustment' | 'climb'
      horizontal?: number
      bollardHeight: number
      freeboard: number
      fromTide: number
      toTide?: number
    }
  | {
      kind: 'wind'
      quantity: 'apparentSpeed' | 'apparentAngle' | 'forceRatio'
      trueSpeed?: number
      trueAngle?: number
      boatSpeed?: number
      from?: number
      to?: number
    }
  | {
      kind: 'fog'
      quantity: 'secondsToMeet' | 'closing'
      visibilityNm?: number
      ownKn: number
      otherKn: number
      angle?: number
    }
  | {
      kind: 'pilotage'
      quantity: 'transitOffsetM'
      observed: number
      transitBearing: number
      distanceToFront: number
    }
  | {
      kind: 'radar'
      quantity: 'targetSpeed' | 'targetCourse' | 'cpa' | 'relativeSpeed'
      first: { bearing: number; range: number }
      second: { bearing: number; range: number }
      minutes: number
      ownCourse: number
      ownSpeed: number
    }
  | {
      kind: 'night'
      quantity: 'visibleStretch' | 'earliestDeparture' | 'onWatch'
      range?: number
      offset?: number
      distance?: number
      speed?: number
      sunrise?: number
      sunset?: number
      margin?: number
      from?: number
      to?: number
      watchHours?: number
      teams?: number
    }
  | {
      kind: 'routing'
      quantity: 'tackDistance'
      distance: number
      angleOffWind: number
    }
  | {
      kind: 'dst'
      distance?: number
      speed?: number
      minutes?: number
      quantity: 'distance' | 'speed' | 'timeMinutes'
    }

export interface NumericQuestion extends QuestionBase {
  type: 'numeric'
  answer: number
  tolerance: number
  unit: '°' | '′' | 'h' | 's' | '×' | 'l/min' | 'l' | 'Tage' | 'kn' | 'NM' | 'min' | 'm' | 'Bft' | 'm/s'
  /** true für Richtungsangaben – Toleranz wird dann über 000° hinweg geprüft */
  isBearing?: boolean
  /**
   * Optionales Szenario, mit dem die Musterlösung in den automatisierten Tests
   * gegen die Berechnungsfunktionen geprüft wird.
   */
  verify?: QuestionVerify
}

export interface MatchQuestion extends QuestionBase {
  type: 'match'
  /** Paare in korrekter Zuordnung; die rechte Seite wird in der UI gemischt */
  pairs: { left: string; right: string }[]
}

export type Question = MultipleChoiceQuestion | NumericQuestion | MatchQuestion

export type QuizMode = 'learn' | 'exam'

export interface QuizAnswerRecord {
  questionId: string
  topic: TopicId
  correct: boolean
  /** gegebene Antwort: Index (MC), Zahl (Berechnung) oder Zuordnung je linkem Element (Index der rechten Seite) */
  given: number | number[] | null
}

export interface QuizAttempt {
  id: string
  date: string
  mode: QuizMode
  durationSec: number
  answers: QuizAnswerRecord[]
  /** nur bei Probeprüfungen */
  exam?: { presetId: string; limitSec: number; percent: number; passed: boolean }
}

export interface QuestionStat {
  correct: number
  wrong: number
  lastCorrect: boolean
  lastAnswered: string
}
