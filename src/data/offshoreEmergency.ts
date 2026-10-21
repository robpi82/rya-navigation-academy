import type { Step } from './safety'

/** Verlassen des Schiffes – sinnvolle Reihenfolge (eigenständig formuliert, vereinfacht). */
export const ABANDON_STEPS: Step[] = [
  { id: 'mayday', text: 'MAYDAY über DSC und Sprechfunk absetzen, EPIRB auslösen' },
  { id: 'dress', text: 'Alle warm anziehen, Rettungswesten an und eingepickt' },
  { id: 'raft', text: 'Rettungsinsel mit belegter Reißleine zu Wasser lassen und auslösen' },
  { id: 'grabbag', text: 'Notfalltasche, Trinkwasser, SART und Handfunkgerät in die Insel' },
  { id: 'board', text: 'Erst einsteigen, wenn das Schiff nicht mehr zu halten ist – möglichst trocken' },
  { id: 'clear', text: 'Leine kappen, Treibanker setzen, SART einschalten, Wachen einteilen' },
]
