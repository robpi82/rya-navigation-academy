import type { DayLesson } from './types'
import { BriefingWidget, DepartureChecklistWidget, FuelDaylightWidget } from './preparationWidgets'

/** Phase 38: Törnvorbereitung und Seemannschaft. Inhalte eigenständig formuliert und vereinfacht. */
export const PREPARATION_LESSON: DayLesson = {
  id: 'preparation',
  title: 'Törnvorbereitung',
  english: 'Passage Preparation & Seamanship',
  summary: 'Vor dem Ablegen: Wetter und Gezeiten für die ganze Fahrt, Törnplan an Land, Maschine und Sicherheit prüfen, Crew einweisen, Diesel und Tageslicht rechnen.',
  body: [
    'Ein guter Törn beginnt an Land. Der Skipper holt die Vorhersage für die ganze Törndauer – nicht nur für den Moment des Ablegens – und prüft Gezeiten und Strom für Abfahrt, Strecke und Ziel. Tidentore wie Schwellen, Barren oder Brücken legen oft fest, wann man losfahren kann. Ausweichhäfen gehören in jeden Plan, falls Wetter, Boot oder Crew nicht mitspielen.',
    'Der Törnplan bleibt bei einer verlässlichen Person an Land: Route, geplante Ankunft, Crew und Boot. Kommt man nicht an, kann sie die Küstenwache alarmieren; in Großbritannien geht das freiwillig auch über die App RYA SafeTrx. Vor dem Ablegen werden Maschine (Öl, Kühlwasser, Keilriemen, Kraftstoff), Bilge, Lichter und Funk geprüft – und nach dem Start, ob Kühlwasser aus dem Auspuff kommt.',
    'Das Sicherheitsbriefing gilt für alle an Bord, auch für erfahrene Crew: Rettungswesten und Lifebelts, Mensch über Bord, Feuer, Gas, Seeventile, Funknotruf, Rettungsinsel und Erste Hilfe. Gerechnet wird mit Reserve: Diesel für die ganze Strecke unter Maschine plus rund 20 %, Ankunft mindestens eine Stunde vor Sonnenuntergang, Trinkwasser für alle Tage. Die Werte der Übungen sind Richtwerte.',
  ],
  keyPoints: [
    'Vorhersage für die ganze Törndauer, Gezeiten und Tidentore, Ausweichhäfen.',
    'Törnplan bei einer Person an Land (UK: auch RYA SafeTrx).',
    'Maschine, Bilge, Lichter und Funk prüfen; nach dem Start Kühlwasser am Auspuff.',
    'Sicherheitsbriefing für alle; Diesel + 20 %, Ankunft mit Tageslicht-Reserve.',
  ],
  mnemonic: 'Erst planen, dann prüfen, dann einweisen – und immer mit Reserve.',
  widgets: [
    { title: 'Checkliste vor dem Ablegen', description: 'Abhaken, was erledigt ist.', Comp: DepartureChecklistWidget },
    { title: 'Diesel und Tageslicht', description: 'Reicht der Tank, bist du vor Dunkelheit da?', Comp: FuelDaylightWidget },
    { title: 'Sicherheitsbriefing', description: 'Was muss jede Person an Bord wissen?', Comp: BriefingWidget },
  ],
  links: [
    { label: 'Sicherheit & Seefunk', href: '#/themen/safety' },
    { label: 'Wetter', href: '#/themen/weather' },
    { label: 'Törnplanung (Coastal)', href: '#/coastal/passage-planning' },
  ],
}
