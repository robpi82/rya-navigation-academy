import type { Step } from './safety'

/** Maßnahmen, wenn Nebel aufzieht – in sinnvoller Reihenfolge (eigenständig formuliert, vereinfacht). */
export const FOG_STEPS: Step[] = [
  { id: 'fix', text: 'Sofort eine Position bestimmen und eintragen (letzter sicherer Fix)' },
  { id: 'speed', text: 'Fahrt auf sichere Geschwindigkeit verringern, Maschine manöverbereit halten (Rule 19)' },
  { id: 'signals', text: 'Nebelsignal geben und Navigationslichter einschalten' },
  { id: 'lookout', text: 'Ausguck verstärken: Sicht und Gehör, Radar und AIS beobachten' },
  { id: 'safety', text: 'Rettungswesten anlegen, Rettungsinsel und Notsignale griffbereit, Radarreflektor prüfen' },
  { id: 'plan', text: 'Plan anpassen: Schifffahrtswege meiden, flaches Wasser oder eine Tiefenlinie aufsuchen, ggf. ankern' },
]
