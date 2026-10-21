import type { Step } from './safety'

/** Mastbruch – sinnvolle Reihenfolge der Sofortmaßnahmen (eigenständig formuliert, vereinfacht). */
export const DISMASTING_STEPS: Step[] = [
  { id: 'crew', text: 'Crew prüfen: Ist jemand verletzt oder über Bord? Westen an, alle ins Cockpit' },
  { id: 'propeller', text: 'Maschine NICHT starten, solange Leinen und Wanten im Wasser hängen (Schraube!)' },
  { id: 'rig', text: 'Rigg sichern: Mast und Spieren daran hindern, den Rumpf zu beschädigen – notfalls Wanten kappen' },
  { id: 'call', text: 'Lage melden: PAN-PAN (bei unmittelbarer Gefahr MAYDAY) mit Position' },
  { id: 'clear', text: 'Wasser rund um Schraube und Ruder frei, dann Maschine vorsichtig starten' },
  { id: 'jury', text: 'Notrigg setzen oder Hafen unter Motor anlaufen; Seeraum zu Leeküsten halten' },
]
