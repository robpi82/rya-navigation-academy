import type { DayLesson } from './types'
import { HoldingTankWidget, OverboardWidget, WildlifeWidget } from './environmentWidgets'

/** Phase 49: Meeresumwelt und Umweltschutz. Inhalte eigenständig formuliert und vereinfacht, Regeln sinngemäß ohne Gewähr. */
export const ENVIRONMENT_LESSON: DayLesson = {
  id: 'environment',
  title: 'Meeresumwelt und Umweltschutz',
  english: 'The Marine Environment',
  summary: 'Was ins Meer darf (fast nichts), wie man Tiere und Lebensräume schont und was beim Fäkalientank, bei Öl und beim Antifouling zu beachten ist.',
  body: [
    'Das internationale Übereinkommen MARPOL regelt, was Schiffe ins Meer geben dürfen – und es gilt auch für Yachten. Nach Anlage V darf Kunststoff nie über Bord, ebenso wenig Glas, Dosen, Papier oder ölige Abfälle. Erlaubt sind nur Lebensmittelreste in Fahrt: außerhalb von Sondergebieten zerkleinert ab 3 NM vom nächsten Land, unzerkleinert ab 12 NM. Nord- und Ostsee, das Mittelmeer und weitere Gebiete sind Sondergebiete mit strengeren Regeln. Yachten ab 12 m Länge müssen die Müllregeln an Bord aushängen. Die einfachste Regel: Was an Land entsorgt werden kann, kommt mit an Land.',
    'Für Toilettenabwässer gelten auf kleinen Yachten meist nationale Vorschriften; viele Länder verlangen Fäkalientanks, und in Häfen, Ankerbuchten und küstennah wird nicht abgepumpt. Öl oder Diesel in der Bilge nimmt man mit Ölbindetüchern auf und entsorgt sie an Land – nie mit Spülmittel verteilen oder abpumpen. Ein Ölfilm auf dem Wasser wird der Küstenwache gemeldet. Beim Antifouling nur zugelassene Farben verwenden (zinnorganische Anstriche wie TBT sind verboten), Schleifstaub auffangen und das Unterwasserschiff vor einem Revierwechsel reinigen, damit keine fremden Arten eingeschleppt werden.',
    'Tiere und Lebensräume brauchen Abstand. Walen und Delfinen nähert man sich nicht direkt, fährt langsam und lässt die Tiere entscheiden, wie nah sie kommen. Robben auf Sandbänken und Brutkolonien an Steilküsten werden weiträumig umfahren. Seegraswiesen sind Kinderstube vieler Arten und oft geschützt – geankert wird auf Sand daneben. Schutzgebiete und Befahrensregeln stehen in Seekarte, Revierführer und örtlichen Bekanntmachungen. Alle Regeln hier sind vereinfacht; maßgeblich sind die jeweils geltenden Vorschriften.',
  ],
  keyPoints: [
    'Kunststoff, Glas, Dosen, Papier, Öl: nie über Bord.',
    'Lebensmittelreste nur in Fahrt: außerhalb von Sondergebieten zerkleinert ab 3 NM, sonst ab 12 NM; in Sondergebieten strenger.',
    'Fäkalientank nutzen, küstennah nicht abpumpen; Öl mit Bindetüchern aufnehmen.',
    'Tieren nie direkt nähern, Seegras und Brutplätze meiden, Schutzgebiete beachten.',
  ],
  mnemonic: 'Was an Bord kommt, geht auch wieder an Land.',
  widgets: [
    { title: 'Darf das über Bord?', description: 'Abfall, Abstand und Seegebiet.', Comp: OverboardWidget },
    { title: 'Tiere und Lebensräume', description: 'Fünf Begegnungen, was tust du?', Comp: WildlifeWidget },
    { title: 'Wie lange reicht der Fäkalientank?', Comp: HoldingTankWidget },
  ],
  links: [
    { label: 'Ankern (Seegras meiden)', href: '#/coastal/anchoring' },
    { label: 'Törnvorbereitung', href: '#/themen/preparation' },
    { label: 'Sicherheit & Seefunk', href: '#/themen/safety' },
  ],
}
