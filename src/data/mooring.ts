import type { Step } from './safety'

/** Anlegen in einem Tidenhafen – sinnvolle Reihenfolge (eigenständig formuliert, vereinfacht). */
export const MOORING_STEPS: Step[] = [
  { id: 'check', text: 'Tiefe am Liegeplatz für das kommende Niedrigwasser prüfen (Kartentiefe + NW-Höhe − Tiefgang)' },
  { id: 'prepare', text: 'Fender auf passender Höhe und Leinen klar machen, Crew einteilen' },
  { id: 'approach', text: 'Gegen Wind oder Strom anfahren, langsam an die Pier' },
  { id: 'lines', text: 'Zuerst die Leine fest, die das Boot hält (meist Vor- oder Achterspring), dann Vor- und Achterleine' },
  { id: 'length', text: 'Leinen so lang wie möglich ausbringen, Springs lang führen – sie müssen den Tidenhub mitmachen' },
  { id: 'watch', text: 'Leinen und Fender bei steigendem und fallendem Wasser kontrollieren und nachstellen' },
]
