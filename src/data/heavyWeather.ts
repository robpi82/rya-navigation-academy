import type { Step } from './safety'

/** Vorbereitung auf Schwerwetter – sinnvolle Reihenfolge (eigenständig formuliert, vereinfacht). */
export const HEAVY_WEATHER_STEPS: Step[] = [
  { id: 'forecast', text: 'Vorhersage auswerten: Zeitpunkt, Stärke, Richtung; Ausweichhafen oder Seeraum wählen' },
  { id: 'fix', text: 'Position bestimmen und Plan festlegen, solange es noch ruhig ist' },
  { id: 'reef', text: 'Früh reffen – „wenn du daran denkst, ist es Zeit"' },
  { id: 'deck', text: 'Deck und unter Deck klarieren: Luken dicht, lose Teile sichern, Strecktaue spannen' },
  { id: 'crew', text: 'Crew einweisen: Westen und Lifebelts anlegen, warm essen, Wachen einteilen, Seekrankheit vorbeugen' },
  { id: 'tactics', text: 'Taktik wählen: Seeraum halten, Kurs zu den Wellen anpassen, ggf. beiliegen' },
]
