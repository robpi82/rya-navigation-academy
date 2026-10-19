/**
 * Sekundärhäfen: Zeiten und Höhen werden aus dem Standardhafen abgeleitet (Verfahren des Gezeitenalmanachs, vereinfacht).
 * Zeitunterschiede in Minuten, Höhenunterschiede in Metern. Die Höhenunterschiede für Spring- und Nipptide werden
 * nach der Lage der Standardhafen-Höhe zwischen den Referenzwerten interpoliert.
 */
export interface Reference {
  neaps: number
  springs: number
}

/** Lage von `value` zwischen Nipp- (0) und Springwert (1), begrenzt auf 0…1. */
export function interpolationFactor(value: number, ref: Reference): number {
  const span = ref.springs - ref.neaps
  if (span === 0) return 0
  return Math.min(1, Math.max(0, (value - ref.neaps) / span))
}

/** Höhenunterschied zum Standardhafen für eine konkrete Standardhafen-Höhe. */
export function interpolatedDifference(stdHeight: number, stdRef: Reference, diff: Reference): number {
  const f = interpolationFactor(stdHeight, stdRef)
  return diff.neaps + f * (diff.springs - diff.neaps)
}

export interface StandardTide {
  /** Zeiten in Minuten seit Mitternacht */
  hwTime: number
  hwHeight: number
  lwTime: number
  lwHeight: number
}

export interface StandardReferences {
  hw: Reference
  lw: Reference
}

export interface SecondaryDifferences {
  hwTime: number
  lwTime: number
  hwHeight: Reference
  lwHeight: Reference
}

export interface SecondaryTide {
  hwTime: number
  hwHeight: number
  lwTime: number
  lwHeight: number
  range: number
}

export function secondaryTide(std: StandardTide, refs: StandardReferences, diff: SecondaryDifferences): SecondaryTide {
  const hwHeight = std.hwHeight + interpolatedDifference(std.hwHeight, refs.hw, diff.hwHeight)
  const lwHeight = std.lwHeight + interpolatedDifference(std.lwHeight, refs.lw, diff.lwHeight)
  return { hwTime: std.hwTime + diff.hwTime, hwHeight, lwTime: std.lwTime + diff.lwTime, lwHeight, range: hwHeight - lwHeight }
}
