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
  topic: TermId
  difficulty: Difficulty
  level: CourseLevel
  prompt: string
  /** Kurze Musterlösung */
  solution: string
  /** Nachvollziehbarer Rechen-/Denkweg */
  steps: string[]
}

export interface MultipleChoiceQuestion extends QuestionBase {
  type: 'mc'
  options: string[]
  correctIndex: number
}

export type NumericQuantity = 'cog' | 'sog' | 'waterTrack' | 'distanceOverGround' | 'timeMinutes' | 'distance'

export interface NumericQuestion extends QuestionBase {
  type: 'numeric'
  answer: number
  tolerance: number
  unit: '°' | 'kn' | 'NM' | 'min'
  /** true für Richtungsangaben – Toleranz wird dann über 000° hinweg geprüft */
  isBearing?: boolean
  /**
   * Optionales Szenario, mit dem die Musterlösung in den automatisierten Tests
   * gegen die Berechnungsfunktionen geprüft wird.
   */
  verify?: {
    heading: number
    stw: number
    tideDirection: number
    tideRate: number
    leeway: number
    durationMin: number
    quantity: Exclude<NumericQuantity, 'timeMinutes' | 'distance'>
  }
}

export type Question = MultipleChoiceQuestion | NumericQuestion

export type QuizMode = 'learn' | 'exam'

export interface QuizAnswerRecord {
  questionId: string
  topic: TermId
  correct: boolean
  /** gegebene Antwort (Index oder Zahl) */
  given: number | null
}

export interface QuizAttempt {
  id: string
  date: string
  mode: QuizMode
  durationSec: number
  answers: QuizAnswerRecord[]
}

export interface QuestionStat {
  correct: number
  wrong: number
  lastCorrect: boolean
  lastAnswered: string
}
