import type { CourseLevel, Difficulty, Question, TopicId } from '@/types/learning'
import { isAnswerCorrect, shuffle } from './quiz'

/**
 * Probeprüfung: feste Fragenzahl, feste Zeit, Bestehensgrenze. Die Gewichtung der Themengruppen und die
 * Bestehensgrenze sind eigene, vereinfachte Annahmen – keine Vorgaben der RYA.
 */
export const PASS_PERCENT = 70

export interface ExamPreset {
  id: 'kurz' | 'standard' | 'lang' | 'coastal' | 'yacht'
  label: string
  questions: number
  minutes: number
  description: string
  /** Kursniveau des Fragenpools */
  level?: CourseLevel
}

export const EXAM_PRESETS: ExamPreset[] = [
  { id: 'kurz', label: 'Kurztest', questions: 20, minutes: 30, description: 'Ein schneller Check zwischendurch.' },
  { id: 'standard', label: 'Standard', questions: 40, minutes: 60, description: 'Realistischer Umfang für eine Probeprüfung.' },
  { id: 'lang', label: 'Intensiv', questions: 60, minutes: 90, description: 'Breite Abdeckung aller Themen.' },
  { id: 'coastal', label: 'Coastal-Test', questions: 20, minutes: 40, description: 'Gezeiten, Versegelungspeilung, Gefahrenpeilung und Törnplanung.', level: 'coastal-skipper' },
  { id: 'yacht', label: 'Yachtmaster-Vorgriff', questions: 12, minutes: 25, description: 'Großkreis und Nachtnavigation – über den Day-Skipper-Stoff hinaus.', level: 'yachtmaster-offshore' },
]

export type ExamGroupId = 'basics' | 'compass' | 'tides' | 'rules' | 'coastal' | 'yacht'

export const EXAM_GROUPS: Record<ExamGroupId, { label: string; weight: number }> = {
  basics: { label: 'Grundbegriffe & Strom', weight: 0.25 },
  compass: { label: 'Kompass & Peilen', weight: 0.15 },
  tides: { label: 'Gezeiten, Karte & Seezeichen', weight: 0.25 },
  rules: { label: 'KVR, Wetter, Sicherheit & E-Navigation', weight: 0.35 },
  coastal: { label: 'Coastal Skipper', weight: 0 },
  yacht: { label: 'Yachtmaster-Vorgriff', weight: 0 },
}

const GROUP_BY_TOPIC: Record<string, ExamGroupId> = {
  compass: 'compass',
  bearings: 'compass',
  tides: 'tides',
  'chart-reading': 'tides',
  buoyage: 'tides',
  colregs: 'rules',
  weather: 'rules',
  safety: 'rules',
  electronics: 'rules',
  'tidal-height': 'coastal',
  'running-fix': 'coastal',
  'clearing-bearing': 'coastal',
  'passage-planning': 'coastal',
  'multi-hour-tide': 'coastal',
  'secondary-ports': 'coastal',
  'great-circle': 'yacht',
  'night-navigation': 'yacht',
  'weather-routing': 'yacht',
  celestial: 'yacht',
  'sight-reduction': 'yacht',
  'night-passage': 'yacht',
}

/** Themengruppe einer Frage; alles andere sind die neun Grundbegriffe. */
export const groupOf = (topic: TopicId): ExamGroupId => GROUP_BY_TOPIC[topic] ?? 'basics'

/** Kleiner deterministischer Zufallsgenerator (mulberry32). */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export const hashString = (s: string): number => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

/** Verteilt `count` Fragen nach Gewicht auf die Gruppen (größte Reste), begrenzt durch die verfügbare Anzahl. */
export function groupQuotas(count: number, available: Record<ExamGroupId, number>): Record<ExamGroupId, number> {
  const ids = (Object.keys(EXAM_GROUPS) as ExamGroupId[]).filter((g) => EXAM_GROUPS[g].weight > 0)
  const quota = { basics: 0, compass: 0, tides: 0, rules: 0, coastal: 0, yacht: 0 } as Record<ExamGroupId, number>
  const raw = ids.map((g) => ({ g, exact: EXAM_GROUPS[g].weight * count }))
  for (const r of raw) quota[r.g] = Math.min(Math.floor(r.exact), available[r.g])
  let left = count - ids.reduce((n, g) => n + quota[g], 0)
  const byRemainder = [...raw].sort((a, b) => b.exact - Math.floor(b.exact) - (a.exact - Math.floor(a.exact)))
  // Reste verteilen, danach ggf. weiter reihum, solange noch Fragen verfügbar sind
  while (left > 0) {
    let placed = false
    for (const r of byRemainder) {
      if (left > 0 && quota[r.g] < available[r.g]) {
        quota[r.g]++
        left--
        placed = true
      }
    }
    if (!placed) break
  }
  return quota
}

const DIFFICULTY_CYCLE: Difficulty[] = [2, 1, 2, 3, 1, 2, 3, 2]

function pickMixed(pool: Question[], n: number, random: () => number): Question[] {
  const buckets: Record<Difficulty, Question[]> = { 1: [], 2: [], 3: [] }
  for (const q of shuffle(pool, random)) buckets[q.difficulty].push(q)
  const out: Question[] = []
  for (let i = 0; out.length < n; i++) {
    const want = DIFFICULTY_CYCLE[i % DIFFICULTY_CYCLE.length]
    const order: Difficulty[] = [want, ...([1, 2, 3] as Difficulty[]).filter((d) => d !== want)]
    const d = order.find((x) => buckets[x].length > 0)
    if (!d) break
    out.push(buckets[d].shift()!)
  }
  return out
}

/** Stellt eine Prüfung zusammen: nur Day-Skipper-Fragen, nach Gruppen gewichtet, gemischt in Schwierigkeit und Reihenfolge. */
export function buildExam(count: number, bank: Question[], random: () => number = Math.random, level: CourseLevel = 'day-skipper'): Question[] {
  if (level !== 'day-skipper') return shuffle(pickMixed(bank.filter((q) => q.level === level), count, random), random)
  const pool = bank.filter((q) => q.level === 'day-skipper')
  const byGroup = { basics: [], compass: [], tides: [], rules: [], coastal: [], yacht: [] } as Record<ExamGroupId, Question[]>
  for (const q of pool) byGroup[groupOf(q.topic)].push(q)
  const available = Object.fromEntries((Object.keys(byGroup) as ExamGroupId[]).map((g) => [g, byGroup[g].length])) as Record<ExamGroupId, number>
  const quota = groupQuotas(count, available)
  const picked = (Object.keys(quota) as ExamGroupId[]).flatMap((g) => pickMixed(byGroup[g], quota[g], random))
  return shuffle(picked, random)
}

export type ExamAnswer = number | (number | null)[] | null

/** Vollständige Antworten für die Auswertung; unbeantwortete oder unvollständige Zuordnungen zählen als falsch. */
export function normalizeAnswer(q: Question, a: ExamAnswer): number | number[] | null {
  if (a === null || a === undefined) return null
  if (Array.isArray(a)) return q.type === 'match' && a.length === q.pairs.length && a.every((x) => x !== null) ? (a as number[]) : null
  return Number.isFinite(a) ? a : null
}

export interface ExamGrade {
  correct: number
  total: number
  answered: number
  percent: number
  passed: boolean
  byGroup: { group: ExamGroupId; correct: number; total: number }[]
  byDifficulty: { difficulty: Difficulty; correct: number; total: number }[]
  perQuestion: boolean[]
}

export function gradeExam(questions: Question[], answers: ExamAnswer[]): ExamGrade {
  const perQuestion = questions.map((q, i) => {
    const given = normalizeAnswer(q, answers[i] ?? null)
    return given !== null && isAnswerCorrect(q, given)
  })
  const correct = perQuestion.filter(Boolean).length
  const percent = questions.length ? (correct / questions.length) * 100 : 0
  const groups = new Map<ExamGroupId, { correct: number; total: number }>()
  const diffs = new Map<Difficulty, { correct: number; total: number }>()
  questions.forEach((q, i) => {
    const g = groups.get(groupOf(q.topic)) ?? { correct: 0, total: 0 }
    g.total++
    if (perQuestion[i]) g.correct++
    groups.set(groupOf(q.topic), g)
    const d = diffs.get(q.difficulty) ?? { correct: 0, total: 0 }
    d.total++
    if (perQuestion[i]) d.correct++
    diffs.set(q.difficulty, d)
  })
  return {
    correct,
    total: questions.length,
    answered: answers.filter((a, i) => normalizeAnswer(questions[i], a ?? null) !== null).length,
    percent,
    passed: questions.length > 0 && percent >= PASS_PERCENT,
    byGroup: [...groups].map(([group, v]) => ({ group, ...v })),
    byDifficulty: ([1, 2, 3] as Difficulty[]).filter((d) => diffs.has(d)).map((difficulty) => ({ difficulty, ...diffs.get(difficulty)! })),
    perQuestion,
  }
}

/** Verbleibende Sekunden (nie negativ). */
export const remainingSeconds = (startedAt: number, limitSec: number, now: number): number => Math.max(0, Math.ceil(limitSec - (now - startedAt) / 1000))
