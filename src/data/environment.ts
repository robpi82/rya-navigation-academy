/** Begegnungen mit Tieren und Lebensräumen – sinnvolles Verhalten (eigenständig formuliert, vereinfacht). */
export interface WildlifeCase {
  id: string
  situation: string
  options: { text: string; right: boolean; why: string }[]
}

export const WILDLIFE_CASES: WildlifeCase[] = [
  {
    id: 'whales',
    situation: 'Voraus taucht eine Gruppe Wale auf.',
    options: [
      { text: 'Fahrt reduzieren, Abstand halten, nicht direkt anfahren', right: true, why: 'Langsam und parallel bleiben, die Tiere bestimmen die Nähe. Nie zwischen Mutter und Kalb fahren.' },
      { text: 'Mit voller Fahrt vorbei, damit die Störung kurz bleibt', right: false, why: 'Schnelle Fahrt erhöht die Gefahr einer Kollision und stört stärker.' },
      { text: 'Langsam direkt auf sie zuhalten, um sie besser zu sehen', right: false, why: 'Direktes Anfahren treibt die Tiere weg und kann sie verletzen.' },
    ],
  },
  {
    id: 'dolphins',
    situation: 'Delfine kommen von selbst und spielen in der Bugwelle.',
    options: [
      { text: 'Kurs und Fahrt beibehalten, keine plötzlichen Manöver', right: true, why: 'Die Tiere sind freiwillig da. Ruhig weiterfahren, nicht hinterherjagen, wenn sie abdrehen.' },
      { text: 'Stark beschleunigen, damit sie länger mitschwimmen', right: false, why: 'Hohe Fahrt und Kursänderungen gefährden die Tiere an Bug und Schraube.' },
      { text: 'Maschine auskuppeln und Fische zufüttern', right: false, why: 'Füttern verändert das Verhalten der Tiere und ist vielerorts verboten.' },
    ],
  },
  {
    id: 'seals',
    situation: 'Robben liegen auf einer trockenfallenden Sandbank.',
    options: [
      { text: 'Abstand halten, langsam und leise vorbeifahren', right: true, why: 'Aufgeschreckte Tiere flüchten ins Wasser und lassen Jungtiere zurück. In Nationalparks Schutzzonen beachten.' },
      { text: 'Nahe heranfahren, damit die Crew fotografieren kann', right: false, why: 'Die Störung ist für die Tiere Stress – Fernglas statt Annäherung.' },
      { text: 'Anlanden, um zu sehen, ob ein Tier verletzt ist', right: false, why: 'Nicht anlanden. Verletzte Tiere der zuständigen Stelle melden.' },
    ],
  },
  {
    id: 'seagrass',
    situation: 'Der schönste Ankerplatz der Bucht liegt über einer Seegraswiese.',
    options: [
      { text: 'Auf Sand daneben ankern oder eine Boje nutzen', right: true, why: 'Anker und Kette reißen Seegras aus; die Wiesen sind Kinderstube vieler Fische und oft geschützt.' },
      { text: 'Im Seegras ankern, dort hält der Anker besonders gut', right: false, why: 'Im Gegenteil: Seegras ist schlechter Haltegrund und wird zerstört.' },
      { text: 'Im Seegras ankern, aber nur mit wenig Kette', right: false, why: 'Zu wenig Kette lässt den Anker slippen – und schadet dem Seegras trotzdem.' },
    ],
  },
  {
    id: 'birds',
    situation: 'An einer Steilküste brüten im Frühsommer viele Seevögel.',
    options: [
      { text: 'Weiten Abstand halten und keine Signale geben', right: true, why: 'Aufgeschreckte Vögel verlassen Nester, Eier und Junge kühlen aus oder werden geraubt.' },
      { text: 'Mit dem Horn testen, wie viele Vögel auffliegen', right: false, why: 'Lärm vertreibt die Vögel von ihren Nestern.' },
      { text: 'Dicht unter der Küste ankern, um sie zu beobachten', right: false, why: 'Nähe und Lärm stören die Brut; dafür gibt es Ferngläser.' },
    ],
  },
]
