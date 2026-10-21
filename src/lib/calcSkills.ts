import type { NumericQuestion, Question, QuestionStat } from '@/types/learning'

/**
 * Rechentraining: fasst die Rechenaufgaben nach Rechenart zusammen (über die Prüfangabe `verify`),
 * verknüpft jede Rechenart mit Formelsammlung und Lektion und wählt Aufgaben bevorzugt nach Schwächen aus.
 */
export interface CalcSkill {
  id: string
  label: string
  /** verify.kind bzw. „kind:quantity“ */
  match: string[]
  formulaId: string
  href: string
}

export const CALC_SKILLS: CalcSkill[] = [
  { id: 'vectors', label: 'Stromdreieck und Kurs gegen Strom', match: ['sim', 'cts', 'passage'], formulaId: 'ground-track', href: '#/simulator' },
  { id: 'dst', label: 'Weg, Zeit, Fahrt', match: ['dst'], formulaId: 'dst-distance', href: '#/rechner' },
  { id: 'compass', label: 'Kompass und Peilungen', match: ['compass', 'bearing'], formulaId: 'c-to-t', href: '#/themen/compass' },
  { id: 'tides', label: 'Gezeitenhöhe und Tiefe', match: ['tide', 'twelfths', 'secondary'], formulaId: 'twelfths', href: '#/themen/tides' },
  { id: 'anchoring', label: 'Ankern und Festmachen', match: ['anchoring', 'mooring', 'tide:chain'], formulaId: 'chain', href: '#/coastal/anchoring' },
  { id: 'nogps', label: 'Navigation ohne GPS', match: ['nogps'], formulaId: 'bow-angle', href: '#/coastal/no-gps' },
  { id: 'chart', label: 'Seekarte und Sichtweite', match: ['chart'], formulaId: 'light', href: '#/themen/chart-reading' },
  { id: 'wind', label: 'Wind und Wetter', match: ['weather', 'wind', 'races:windOverWater', 'wxchart'], formulaId: 'apparent', href: '#/themen/weather' },
  { id: 'streams', label: 'Strom an Kaps und Stromrate', match: ['races'], formulaId: 'rate', href: '#/coastal/tidal-races' },
  { id: 'collision', label: 'Begegnung, CPA und Nebel', match: ['enav:cpa', 'enav:tcpa', 'fog', 'radar'], formulaId: 'meet', href: '#/coastal/fog' },
  { id: 'enav', label: 'VMG, Echolot und Leitlinien', match: ['enav', 'pilotage'], formulaId: 'vmg', href: '#/themen/electronics' },
  { id: 'safety', label: 'Vorbereitung und Notfälle', match: ['prep', 'emergency'], formulaId: 'fuel', href: '#/themen/preparation' },
  { id: 'offshore', label: 'Großkreis, Routing und Nachtfahrt', match: ['greatcircle', 'routing', 'night'], formulaId: 'gc', href: '#/yachtmaster/great-circle' },
  { id: 'astro', label: 'Astronavigation', match: ['astro'], formulaId: 'noon-lat', href: '#/yachtmaster/celestial' },
]

export const SKILL_BY_ID: Record<string, CalcSkill> = Object.fromEntries(CALC_SKILLS.map((s) => [s.id, s]))

/** Rechenart einer Aufgabe; genauere Angaben („kind:quantity“) haben Vorrang vor der Art allein. */
export function skillOf(q: Question): CalcSkill | null {
  if (q.type !== 'numeric' || !q.verify) return null
  const v = q.verify as { kind: string; quantity?: string }
  const exact = `${v.kind}:${v.quantity ?? ''}`
  return CALC_SKILLS.find((s) => s.match.includes(exact)) ?? CALC_SKILLS.find((s) => s.match.includes(v.kind)) ?? null
}

export const isCalcQuestion = (q: Question): q is NumericQuestion => q.type === 'numeric'

export interface SkillStat {
  skill: CalcSkill
  available: number
  answered: number
  correct: number
  /** Trefferquote 0–1, null ohne Antworten */
  accuracy: number | null
}

/** Trefferquote je Rechenart aus den gespeicherten Antworten. */
export function skillStats(questions: Question[], stats: Record<string, QuestionStat>): SkillStat[] {
  return CALC_SKILLS.map((skill) => {
    const qs = questions.filter((q) => skillOf(q)?.id === skill.id)
    let correct = 0
    let wrong = 0
    for (const q of qs) {
      const s = stats[q.id]
      if (!s) continue
      correct += s.correct
      wrong += s.wrong
    }
    const answered = correct + wrong
    return { skill, available: qs.length, answered, correct, accuracy: answered ? correct / answered : null }
  }).filter((s) => s.available > 0)
}

/** Priorität einer Aufgabe: zuletzt falsch (0) vor nie beantwortet (1) vor schwacher Quote (2) vor sicher (3). */
export function priority(q: Question, stats: Record<string, QuestionStat>): number {
  const s = stats[q.id]
  if (!s) return 1
  if (!s.lastCorrect) return 0
  return s.correct / (s.correct + s.wrong) < 0.7 ? 2 : 3
}

/** Zieht `count` Aufgaben; mit `weakFirst` zuerst nach Priorität, innerhalb gleicher Priorität zufällig. */
export function pickCalcQuestions(pool: Question[], stats: Record<string, QuestionStat>, count: number, weakFirst: boolean, random = Math.random): Question[] {
  const keyed = pool.map((q) => ({ q, p: weakFirst ? priority(q, stats) : 0, r: random() }))
  keyed.sort((a, b) => a.p - b.p || a.r - b.r)
  return keyed.slice(0, count).map((k) => k.q)
}
