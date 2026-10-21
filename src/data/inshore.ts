import type { Step } from './safety'
import type { LightSector } from '@/calculations/inshore'

/** Sektorenfeuer an einer fiktiven Hafeneinfahrt (Peilung zum Feuer): Grün links, Weiß in der Mitte, Rot rechts. */
export const ENTRANCE_SECTORS: LightSector[] = [
  { from: 80, to: 94, color: 'G' },
  { from: 94, to: 98, color: 'W' },
  { from: 98, to: 112, color: 'R' },
]

/** Internationale Hafensignale (IPTS) – nur die drei Grundsignale, vereinfacht. Drei Lichter senkrecht übereinander. */
export const PORT_SIGNALS = [
  { id: 'emergency', lights: ['R', 'R', 'R'] as const, flashing: true, meaning: 'Ernster Notfall: Alle Fahrzeuge stoppen oder nach Anweisung ausweichen.' },
  { id: 'stop', lights: ['R', 'R', 'R'] as const, flashing: false, meaning: 'Ein- und Auslaufen verboten – nicht weiterfahren.' },
  { id: 'go', lights: ['G', 'G', 'G'] as const, flashing: false, meaning: 'Fahrt frei, Einbahnverkehr.' },
]

/** Nebel zieht auf – sinnvolle Reihenfolge der ersten Maßnahmen (eigenständig formuliert, vereinfacht). */
export const FOG_STEPS: Step[] = [
  { id: 'fix', text: 'Ort bestimmen und mit Zeit ins Logbuch eintragen, solange noch Landmarken sichtbar sind' },
  { id: 'crew', text: 'Rettungswesten an, Crew an Deck, Beiboot und Rettungsmittel klar' },
  { id: 'lookout', text: 'Ausguck vorn und Horchwache einteilen, Maschine bereit' },
  { id: 'signals', text: 'Lichter einschalten, Schallsignale geben, Radarreflektor gesetzt, AIS an' },
  { id: 'speed', text: 'Fahrt so weit verringern, dass du innerhalb der Sichtweite stoppen kannst' },
  { id: 'route', text: 'Kurs in flacheres Wasser abseits der Schifffahrtswege, UKW Kanal 16 und Revierkanal mithören' },
]
