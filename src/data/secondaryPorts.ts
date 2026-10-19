import type { SecondaryDifferences, StandardReferences } from '@/calculations/secondary'

/** Referenzhöhen des Standardhafens Ankerstedt (m über Kartennull). Fiktive Übungsdaten. */
export const STANDARD_REFERENCES: StandardReferences = {
  hw: { neaps: 4.0, springs: 5.0 },
  lw: { neaps: 2.0, springs: 1.0 },
}

export interface SecondaryPort {
  id: string
  name: string
  differences: SecondaryDifferences
}

/** Fiktive Sekundärhäfen mit Unterschieden zum Standardhafen (Zeit in Minuten). */
export const SECONDARY_PORTS: SecondaryPort[] = [
  { id: 'kranich', name: 'Inselhafen Kranich', differences: { hwTime: -25, lwTime: -40, hwHeight: { neaps: -0.4, springs: -0.6 }, lwHeight: { neaps: -0.1, springs: -0.2 } } },
  { id: 'nordbucht', name: 'Nordbucht', differences: { hwTime: 50, lwTime: 70, hwHeight: { neaps: 0.6, springs: 0.8 }, lwHeight: { neaps: 0.2, springs: 0.3 } } },
  { id: 'moewe', name: 'Möwenhafen', differences: { hwTime: -95, lwTime: -80, hwHeight: { neaps: -0.8, springs: -1.1 }, lwHeight: { neaps: -0.3, springs: -0.4 } } },
]
