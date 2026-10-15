/** Kartesischer Vektor: x = Ost, y = Nord (Einheit je nach Kontext: kn oder NM). */
export interface Vector2 {
  x: number
  y: number
}

/** Eingabewerte des Navigationssimulators. Alle Winkel nautisch (° rechtweisend, im Uhrzeigersinn ab Nord). */
export interface SimulationInput {
  /** Heading (HDG) – Steuerkurs, 0–359° */
  heading: number
  /** Speed Through the Water (STW) in kn */
  stw: number
  /** Richtung, in die der Strom setzt (Set), 0–359° */
  tideDirection: number
  /** Stromrate (Rate/Drift) in kn */
  tideRate: number
  /**
   * Leeway (Windabdrift) in Grad.
   * Positiv = Versatz nach Steuerbord (Wind von Backbord), negativ = nach Backbord.
   * Water Track = Heading + Leeway.
   */
  leeway: number
  /** Simulationsdauer in Minuten */
  durationMin: number
}

export interface VelocityTriangle {
  /** Water Track (Kurs durchs Wasser) in ° */
  waterTrack: number
  /** Geschwindigkeitsvektor durchs Wasser (kn) */
  waterVelocity: Vector2
  /** Stromvektor (kn) */
  tideVelocity: Vector2
  /** Geschwindigkeitsvektor über Grund (kn) */
  groundVelocity: Vector2
  /** Speed Over Ground in kn */
  sog: number
  /** Course Over Ground in ° – null, wenn SOG ≈ 0 (Richtung nicht definiert) */
  cog: number | null
}

export interface SimulationResult extends VelocityTriangle {
  durationHours: number
  /** Endpunkt nur mit Fahrt durchs Wasser (Water-Track-Endpunkt) in NM relativ zum Start */
  waterTrackEnd: Vector2
  /** Endpunkt über Grund (Estimated Position) in NM relativ zum Start */
  groundTrackEnd: Vector2
  /** Endpunkt des Heading-Strahls (gleiche Länge wie Water Track) in NM */
  headingEnd: Vector2
  distanceThroughWater: number
  distanceOverGround: number
  /** Stromversatz (Drift) über die Dauer in NM */
  tideDrift: number
}

export type CourseToSteerResult =
  | {
      feasible: true
      /** Zu steuernder Kurs (Heading) in ° */
      courseToSteer: number
      /** Water Track, der gefahren werden muss (CTS + Leeway) in ° */
      waterTrack: number
      /** Erzielte Fahrt über Grund entlang des gewünschten Kurses in kn */
      sog: number
      /** Benötigte Zeit in Stunden (falls Distanz gegeben) */
      timeHours: number | null
    }
  | {
      feasible: false
      reason: 'no-speed' | 'cross-tide-too-strong' | 'no-progress'
      message: string
    }

export interface LatLon {
  /** Breite in Dezimalgrad, Nord positiv */
  lat: number
  /** Länge in Dezimalgrad, Ost positiv */
  lon: number
}
