/** Begriffe aus Seewetterberichten (britische Konvention), eigenständig erklärt. */
export interface ForecastTerm {
  id: string
  group: 'time' | 'wind' | 'pressure' | 'visibility' | 'sea' | 'systems'
  term: string
  meaning: string
}

export const FORECAST_GROUP_LABEL = {
  time: 'Zeitangaben',
  wind: 'Wind',
  pressure: 'Luftdruck',
  visibility: 'Sicht',
  sea: 'Seegang',
  systems: 'Wettersysteme',
} as const

export const FORECAST_TERMS: ForecastTerm[] = [
  { id: 'imminent', group: 'time', term: 'Imminent', meaning: 'Eintritt innerhalb von 6 Stunden nach Ausgabe des Berichts.' },
  { id: 'soon', group: 'time', term: 'Soon', meaning: 'Eintritt in 6 bis 12 Stunden.' },
  { id: 'later', group: 'time', term: 'Later', meaning: 'Eintritt in mehr als 12 Stunden.' },
  { id: 'gale', group: 'wind', term: 'Gale warning / Gales', meaning: 'Mittlerer Wind von mindestens Stärke 8 (34–40 kn) wird erwartet.' },
  { id: 'severe', group: 'wind', term: 'Severe gale / Storm / Violent storm', meaning: 'Windstärke 9 / 10 / 11 – Sturm in zunehmender Stärke.' },
  { id: 'squall', group: 'wind', term: 'Squall', meaning: 'Plötzliche, kurze Böe mit starker Windzunahme, oft bei Schauern und Kaltfronten.' },
  { id: 'veering', group: 'wind', term: 'Veering', meaning: 'Wind dreht rechts herum (im Uhrzeigersinn), z. B. von Süd über West nach Nord.' },
  { id: 'backing', group: 'wind', term: 'Backing', meaning: 'Wind dreht links herum (gegen den Uhrzeigersinn), z. B. von West über Süd nach Ost.' },
  { id: 'steady', group: 'pressure', term: 'Steady', meaning: 'Luftdruckänderung unter 0,1 hPa in 3 Stunden.' },
  { id: 'slowly', group: 'pressure', term: 'Rising / falling slowly', meaning: '0,1 bis 1,5 hPa in 3 Stunden.' },
  { id: 'plain', group: 'pressure', term: 'Rising / falling', meaning: '1,6 bis 3,5 hPa in 3 Stunden.' },
  { id: 'quickly', group: 'pressure', term: 'Rising / falling quickly', meaning: '3,6 bis 6,0 hPa in 3 Stunden.' },
  { id: 'rapidly', group: 'pressure', term: 'Rising / falling very rapidly', meaning: 'Mehr als 6,0 hPa in 3 Stunden – schnell fallender Druck kündigt oft einen Sturm an.' },
  { id: 'good', group: 'visibility', term: 'Good', meaning: 'Sicht über 5 Seemeilen.' },
  { id: 'moderate', group: 'visibility', term: 'Moderate', meaning: 'Sicht 2 bis 5 Seemeilen.' },
  { id: 'poor', group: 'visibility', term: 'Poor', meaning: 'Sicht 1000 Meter bis 2 Seemeilen.' },
  { id: 'fog', group: 'visibility', term: 'Fog', meaning: 'Sicht unter 1000 Meter.' },
  { id: 'smooth', group: 'sea', term: 'Smooth', meaning: 'Wellenhöhe 0,1 bis 0,5 m.' },
  { id: 'slight', group: 'sea', term: 'Slight', meaning: 'Wellenhöhe 0,5 bis 1,25 m.' },
  { id: 'moderate-sea', group: 'sea', term: 'Moderate (Seegang)', meaning: 'Wellenhöhe 1,25 bis 2,5 m.' },
  { id: 'rough', group: 'sea', term: 'Rough', meaning: 'Wellenhöhe 2,5 bis 4 m.' },
  { id: 'very-rough', group: 'sea', term: 'Very rough', meaning: 'Wellenhöhe 4 bis 6 m.' },
  { id: 'high', group: 'sea', term: 'High / very high', meaning: 'Wellenhöhe 6 bis 9 m / 9 bis 14 m.' },
  { id: 'warm-front', group: 'systems', term: 'Warmfront', meaning: 'Warme Luft gleitet auf kältere auf: Wolken verdichten sich, anhaltender Regen, Druck fällt; nach dem Durchgang dreht der Wind rechts und wird wärmer.' },
  { id: 'cold-front', group: 'systems', term: 'Kaltfront', meaning: 'Kalte Luft schiebt sich unter warme: schmales Band mit Schauern und Böen, Wind dreht schlagartig rechts, Druck steigt, Sicht wird besser, es wird kälter.' },
  { id: 'trough', group: 'systems', term: 'Trough (Tiefdruckrinne)', meaning: 'Langgestreckte Zone tieferen Drucks, oft mit Schauern und Winddrehung.' },
  { id: 'ridge', group: 'systems', term: 'Ridge (Hochdruckkeil)', meaning: 'Langgestreckte Zone höheren Drucks; meist ruhiges Wetter.' },
]
