/** Kartensymbole und Abkürzungen (britische Admiralty-Konvention, vereinfacht und eigenständig beschrieben). */
export type SymbolCategory = 'depth' | 'seabed' | 'danger' | 'lights' | 'land' | 'misc'

export const SYMBOL_CATEGORY_LABEL: Record<SymbolCategory, string> = {
  depth: 'Tiefen & Höhen',
  seabed: 'Meeresboden',
  danger: 'Gefahren',
  lights: 'Feuer & Kennungen',
  land: 'Land & Landmarken',
  misc: 'Sonstiges',
}

export interface ChartSymbol {
  id: string
  abbr: string
  category: SymbolCategory
  english: string
  german: string
  note?: string
}

export const CHART_SYMBOLS: ChartSymbol[] = [
  // Tiefen & Höhen
  { id: 'sounding', abbr: '5₂', category: 'depth', english: 'Sounding', german: 'Lotung (Tiefe 5,2 m)', note: 'Meter und Dezimeter; Bezug: Kartennull. Zahl in tiefgestellter Ziffer = Dezimeter.' },
  { id: 'drying', abbr: '1̲₂', category: 'depth', english: 'Drying height', german: 'Trockenfallende Höhe (1,2 m)', note: 'Unterstrichene Zahl: Höhe über dem Kartennull – die Fläche fällt bei niedrigem Wasserstand trocken. Wassertiefe = Höhe der Gezeit − Trockenhöhe.' },
  { id: 'chart-datum', abbr: 'CD', category: 'depth', english: 'Chart Datum', german: 'Kartennull', note: 'Bezugsfläche der Tiefen, meist niedrigster astronomischer Gezeitenstand (LAT).' },
  { id: 'mhws', abbr: 'MHWS', category: 'depth', english: 'Mean High Water Springs', german: 'Mittleres Springhochwasser', note: 'Bezug der Höhen von Landmarken und Feuern; lichte Höhen von Brücken und Leitungen auf neueren britischen Karten über HAT – Kartentitel beachten.' },
  { id: 'contour', abbr: '5 m', category: 'depth', english: 'Depth contour', german: 'Tiefenlinie', note: 'Linie gleicher Tiefe; hilft, sich an der Küste zu orientieren.' },
  // Meeresboden
  { id: 'sand', abbr: 'S', category: 'seabed', english: 'Sand', german: 'Sand' },
  { id: 'mud', abbr: 'M', category: 'seabed', english: 'Mud', german: 'Schlick' },
  { id: 'shells', abbr: 'Sh', category: 'seabed', english: 'Shells', german: 'Muscheln' },
  { id: 'stones', abbr: 'St', category: 'seabed', english: 'Stones', german: 'Steine' },
  { id: 'gravel', abbr: 'G', category: 'seabed', english: 'Gravel', german: 'Kies' },
  { id: 'rock-bed', abbr: 'R', category: 'seabed', english: 'Rock (seabed)', german: 'Fels (Meeresboden)', note: 'Schlechter Ankergrund. Gute Haltekraft: Schlick, Sand, Ton.' },
  // Gefahren
  { id: 'rock', abbr: 'Rk', category: 'danger', english: 'Rock', german: 'Felsen' },
  { id: 'wreck', abbr: 'Wk', category: 'danger', english: 'Wreck', german: 'Wrack' },
  { id: 'obstruction', abbr: 'Obstn', category: 'danger', english: 'Obstruction', german: 'Hindernis' },
  { id: 'overfalls', abbr: 'Ovfls', category: 'danger', english: 'Overfalls / tide rips', german: 'Stromkabbelung', note: 'Steile, brechende Wellen, wo starker Strom über Untiefen fließt.' },
  { id: 'cable', abbr: 'Cable', category: 'danger', english: 'Submarine cable', german: 'Seekabel', note: 'Nicht ankern.' },
  // Feuer & Kennungen
  { id: 'fl', abbr: 'Fl', category: 'lights', english: 'Flashing', german: 'Blinkfeuer' },
  { id: 'oc', abbr: 'Oc', category: 'lights', english: 'Occulting', german: 'Unterbrochenes Feuer' },
  { id: 'iso', abbr: 'Iso', category: 'lights', english: 'Isophase', german: 'Gleichtaktfeuer' },
  { id: 'q', abbr: 'Q', category: 'lights', english: 'Quick flashing', german: 'Funkelfeuer' },
  { id: 'vq', abbr: 'VQ', category: 'lights', english: 'Very quick flashing', german: 'Schnelles Funkelfeuer' },
  { id: 'lfl', abbr: 'LFl', category: 'lights', english: 'Long flash', german: 'Langblitz' },
  { id: 'mo', abbr: 'Mo', category: 'lights', english: 'Morse code light', german: 'Morsefeuer' },
  { id: 'ldg', abbr: 'Ldg', category: 'lights', english: 'Leading light / line', german: 'Richtfeuer / Leitlinie' },
  { id: 'dir', abbr: 'Dir', category: 'lights', english: 'Directional light', german: 'Leitfeuer', note: 'Zeigt in einem engen Sektor den sicheren Weg.' },
  { id: 'colours', abbr: 'W R G Y Bu', category: 'lights', english: 'Light colours', german: 'weiß, rot, grün, gelb, blau' },
  // Land & Landmarken
  { id: 'lt', abbr: 'Lt', category: 'land', english: 'Light', german: 'Leuchtfeuer' },
  { id: 'tr', abbr: 'Tr', category: 'land', english: 'Tower', german: 'Turm' },
  { id: 'ch', abbr: 'Ch', category: 'land', english: 'Church', german: 'Kirche' },
  { id: 'chy', abbr: 'Chy', category: 'land', english: 'Chimney', german: 'Schornstein' },
  { id: 'mast', abbr: 'Mast', category: 'land', english: 'Mast', german: 'Mast' },
  { id: 'bn', abbr: 'Bn', category: 'land', english: 'Beacon', german: 'Bake' },
  // Sonstiges
  { id: 'anch', abbr: 'Anch', category: 'misc', english: 'Anchorage', german: 'Ankerplatz' },
  { id: 'pa', abbr: 'PA', category: 'misc', english: 'Position approximate', german: 'Lage ungefähr', note: 'Position des Objekts ist nicht genau bekannt – mehr Abstand halten.' },
  { id: 'ed', abbr: 'ED', category: 'misc', english: 'Existence doubtful', german: 'Existenz zweifelhaft' },
  { id: 'pd', abbr: 'PD', category: 'misc', english: 'Position doubtful', german: 'Lage zweifelhaft' },
  { id: 'vis', abbr: 'Vis', category: 'misc', english: 'Visible', german: 'sichtbar' },
]
