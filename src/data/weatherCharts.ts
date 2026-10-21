import type { Step } from './safety'

/** Durchzug eines typischen Tiefs mit Warm- und Kaltfront (Nordhalbkugel, vereinfacht, eigenständig formuliert). */
export const DEPRESSION_STEPS: Step[] = [
  { id: 'cirrus', text: 'Hohe Federwolken (Cirrus) ziehen auf, der Druck beginnt zu fallen' },
  { id: 'thicken', text: 'Die Bewölkung wird dichter und tiefer, Halo um Sonne oder Mond, der Wind frischt auf und dreht links' },
  { id: 'warmfront', text: 'Warmfront: anhaltender Regen, der Druck fällt weiter, danach dreht der Wind nach rechts' },
  { id: 'warmsector', text: 'Warmsektor: Druck etwa gleichbleibend, Niesel, diesig, schlechte Sicht' },
  { id: 'coldfront', text: 'Kaltfront: kräftige Schauer und Böen, der Wind dreht deutlich rechts, der Druck steigt' },
  { id: 'behind', text: 'Rückseite: gute Sicht, Schauerwolken, böiger Wind, Druck steigt weiter' },
]
