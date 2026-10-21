import type { LightVessel } from '@/calculations'

/**
 * Inhalte zu den Kollisionsverhütungsregeln (COLREGs/KVR), eigenständig formuliert und vereinfacht.
 * Vor ernsthafter Nutzung mit dem amtlichen Regeltext abgleichen.
 * Notation der Signale: „." = kurzer Ton (ca. 1 s), „-" = langer Ton (4–6 s).
 */
export interface SoundSignal {
  id: string
  pattern: string
  rule: string
  title: string
  meaning: string
}

export const SOUND_SIGNALS: SoundSignal[] = [
  { id: 'stbd', pattern: '.', rule: 'Rule 34(a)', title: 'Ein kurzer Ton', meaning: 'Ich ändere meinen Kurs nach Steuerbord.' },
  { id: 'port', pattern: '..', rule: 'Rule 34(a)', title: 'Zwei kurze Töne', meaning: 'Ich ändere meinen Kurs nach Backbord.' },
  { id: 'astern', pattern: '...', rule: 'Rule 34(a)', title: 'Drei kurze Töne', meaning: 'Meine Maschine arbeitet rückwärts.' },
  { id: 'doubt', pattern: '.....', rule: 'Rule 34(d)', title: 'Mindestens fünf kurze Töne', meaning: 'Warnsignal: Ich verstehe deine Absicht nicht oder zweifle, dass du genug zur Kollisionsverhütung tust.' },
  { id: 'overtake-stbd', pattern: '--.', rule: 'Rule 34(c)', title: 'Zwei lange, ein kurzer Ton', meaning: 'Enges Fahrwasser: Ich will dich an deiner Steuerbordseite überholen.' },
  { id: 'overtake-port', pattern: '--..', rule: 'Rule 34(c)', title: 'Zwei lange, zwei kurze Töne', meaning: 'Enges Fahrwasser: Ich will dich an deiner Backbordseite überholen.' },
  { id: 'agree', pattern: '-.-.', rule: 'Rule 34(c)', title: 'Lang – kurz – lang – kurz', meaning: 'Zustimmung des Überholten zum Überholen.' },
  { id: 'bend', pattern: '-', rule: 'Rule 34(e)', title: 'Ein langer Ton', meaning: 'Annäherung an eine Biegung oder verdeckte Stelle im Fahrwasser.' },
]

export interface FogSignal {
  id: string
  pattern: string
  who: string
  interval: string
}

export const FOG_SIGNALS: FogSignal[] = [
  { id: 'power-way', pattern: '-', who: 'Maschinenfahrzeug in Fahrt durchs Wasser', interval: 'höchstens alle 2 Minuten' },
  { id: 'power-stopped', pattern: '--', who: 'Maschinenfahrzeug in Fahrt, aber gestoppt (keine Fahrt durchs Wasser)', interval: 'höchstens alle 2 Minuten' },
  { id: 'sail', pattern: '-..', who: 'Segelfahrzeug, Fischer, manövrierunfähig, manövrierbehindert, tiefgangbehindert, schleppend', interval: 'höchstens alle 2 Minuten' },
]

export const LIGHT_VESSEL_INFO: Record<LightVessel, { label: string; note: string }> = {
  power: { label: 'Maschinenfahrzeug in Fahrt (unter 50 m)', note: 'Topplicht, Seitenlichter, Hecklicht. Auch ein Segelboot unter Maschine zeigt diese Lichter.' },
  sail: { label: 'Segelfahrzeug in Fahrt', note: 'Seitenlichter und Hecklicht (kein Topplicht). Unter 20 m auch als Dreifarbenlaterne im Masttop erlaubt.' },
  anchor: { label: 'Fahrzeug vor Anker (unter 50 m)', note: 'Ein weißes Rundumlicht, wo es am besten gesehen werden kann (Rule 30(b)); ab 50 m zwei Ankerlichter.' },
  nuc: { label: 'Manövrierunfähig (NUC)', note: 'Zwei rote Rundumlichter übereinander; mit Fahrt zusätzlich Seiten- und Hecklicht.' },
  restricted: { label: 'Manövrierbehindert', note: 'Rot – weiß – rot (Rundumlichter); mit Fahrt durchs Wasser zusätzlich Topp-, Seiten- und Hecklicht (Rule 27(b)).' },
  trawling: { label: 'Schleppnetzfischer', note: 'Grün über weiß (Rundumlichter); mit Fahrt zusätzlich Seiten- und Hecklicht.' },
  aground: { label: 'Auf Grund gelaufen', note: 'Ankerlicht und zwei rote Rundumlichter übereinander.' },
}

/** Rangfolge der Ausweichpflicht nach Rule 18: Jeder weicht den weiter oben genannten aus. */
export const RULE18_ORDER = [
  'Manövrierunfähig (Not under command) und manövrierbehindert (Restricted in ability to manoeuvre) – gleichrangig',
  'Tiefgangbehindert (Constrained by draught) – andere Fahrzeuge dürfen es nicht behindern (Rule 18(d))',
  'Fischer mit Fanggerät (Fishing)',
  'Segelfahrzeug (Sailing vessel)',
  'Maschinenfahrzeug (Power-driven vessel)',
]
