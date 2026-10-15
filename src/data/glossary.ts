import type { GlossaryTerm, TermId } from '@/types/learning'

export const GLOSSARY: GlossaryTerm[] = [
  {
    id: 'hdg',
    abbr: 'HDG',
    english: 'Heading',
    german: 'Steuerkurs / Vorausrichtung',
    definition:
      'Die Richtung, in die der Bug des Schiffes zeigt – gemessen in Grad im Uhrzeigersinn von Nord.',
    details: [
      'Das Heading beschreibt ausschließlich die Ausrichtung des Bootes, nicht seine tatsächliche Bewegung. Es ist der Kurs, den der Rudergänger am Kompass anliegen hat.',
      'Je nach Bezugsrichtung spricht man von Compass Heading (°C, Kompasskurs), Magnetic Heading (°M, missweisend) oder True Heading (°T, rechtweisend). Zwischen ihnen liegen Deviation (Ablenkung durch das Schiff) und Variation (Missweisung).',
      'Wind (Leeway) und Strom (Tidal Stream) sorgen dafür, dass sich das Boot fast nie genau in Richtung seines Headings bewegt.',
    ],
    mnemonic: 'Heading = wohin der Bug zeigt – nicht wohin das Boot fährt.',
    example:
      'Du steuerst 090° nach Kompass. Der Bug zeigt nach Osten – das ist dein Heading. Setzt der Strom nach Süden, bewegt sich das Boot trotzdem südlich von Ost über Grund.',
    confusions: [
      {
        with: 'COG',
        explanation:
          'COG ist die tatsächliche Bewegungsrichtung über Grund. Nur ohne Strom und ohne Leeway sind Heading und COG gleich.',
      },
      {
        with: 'Water Track',
        explanation: 'Der Water Track ist das Heading korrigiert um die Windabdrift (Leeway).',
      },
    ],
    check: {
      question: 'Was gibt das Heading an?',
      options: [
        'Die Richtung, in die sich das Boot über Grund bewegt',
        'Die Richtung, in die der Bug zeigt',
        'Die Richtung, in die der Strom setzt',
        'Die Peilung zum Ziel',
      ],
      correctIndex: 1,
      explanation: 'Heading ist die Ausrichtung des Bugs. Die Bewegung über Grund heißt COG.',
    },
    source: 'Steuerkompass, Fluxgate-/elektronischer Kompass, Autopilot',
  },
  {
    id: 'stw',
    abbr: 'STW',
    english: 'Speed Through the Water',
    german: 'Fahrt durchs Wasser',
    definition: 'Die Geschwindigkeit des Schiffes relativ zum umgebenden Wasser, gemessen in Knoten (kn).',
    details: [
      'Die STW wird vom Log (z. B. Impeller/Paddelrad oder Ultraschall-Log) gemessen. Das Log „spürt" nur das Wasser, das am Rumpf vorbeiströmt – eine Strömung, die das gesamte Wasser samt Boot bewegt, kann es nicht erkennen.',
      'Die STW ist daher die Basis für Koppelnavigation (Dead Reckoning): Logdistanz = STW × Zeit entlang des Water Track.',
      'Bewachsene oder falsch kalibrierte Logs zeigen oft zu wenig an – ein Grund, warum Logwerte regelmäßig mit GPS-Werten bei Stillwasser verglichen werden.',
    ],
    mnemonic: 'STW ist die Geschwindigkeit relativ zum Wasser, SOG relativ zum Meeresboden.',
    example:
      'Ein Schiff bewegt sich mit 5 kn durchs Wasser. Eine Strömung von 2 kn setzt genau in Fahrtrichtung. Die Geschwindigkeit über Grund beträgt 7 kn – die STW bleibt 5 kn.',
    confusions: [
      {
        with: 'SOG',
        explanation:
          'SOG (vom GPS) enthält den Einfluss des Stroms. STW (vom Log) enthält ihn nicht.',
      },
    ],
    check: {
      question: 'Das Log zeigt 6 kn, Strom 1,5 kn genau von vorn. Was zeigt das Log?',
      options: ['4,5 kn', '6 kn', '7,5 kn', '0 kn'],
      correctIndex: 1,
      explanation:
        'Das Log misst die Fahrt durchs Wasser und bleibt bei 6 kn. Über Grund wären es 4,5 kn (SOG).',
    },
    source: 'Log (Impeller, Paddelrad, Ultraschall)',
  },
  {
    id: 'water-track',
    abbr: 'WT',
    english: 'Water Track',
    german: 'Kurs durchs Wasser',
    definition:
      'Die Richtung (und Strecke), in der sich das Boot durch das Wasser bewegt: Heading plus Windabdrift (Leeway).',
    details: [
      'Durch den Wind wird ein Segelboot seitlich versetzt. Der Water Track weicht deshalb um den Leeway-Winkel vom Heading ab – immer in Lee, also vom Wind weg.',
      'Der Strom ist im Water Track noch nicht enthalten. Er beschreibt die Bewegung relativ zur Wassermasse, als würde das Wasser stillstehen.',
      'In der Seekarte wird der Water Track nach RYA-Konvention mit einem Pfeil (>) gekennzeichnet. Seine Länge entspricht der Logdistanz.',
    ],
    mnemonic: 'Water Track = Heading + Leeway. Strom kommt erst danach dazu.',
    example:
      'Heading 090°, der Wind kommt von Norden und versetzt das Boot um 5° nach Süden (Steuerbord). Der Water Track ist 095°.',
    confusions: [
      {
        with: 'Ground Track',
        explanation:
          'Der Ground Track enthält zusätzlich den Strom. Der Water Track nur Heading und Leeway.',
      },
      {
        with: 'Heading',
        explanation: 'Ohne Leeway sind Heading und Water Track identisch, sonst nicht.',
      },
    ],
    check: {
      question: 'Heading 350°, Leeway 15° nach Steuerbord. Wie lautet der Water Track?',
      options: ['335°', '350°', '005°', '365°'],
      correctIndex: 2,
      explanation: '350° + 15° = 365° → normiert auf 0–360° ergibt das 005°.',
    },
    source: 'Berechnet aus Heading und geschätzter Leeway',
  },
  {
    id: 'cog',
    abbr: 'COG',
    english: 'Course Over Ground',
    german: 'Kurs über Grund',
    definition:
      'Die tatsächliche Bewegungsrichtung des Bootes relativ zum Meeresboden, gemessen im Uhrzeigersinn von Nord.',
    details: [
      'COG ergibt sich aus der Vektoraddition von Fahrt durchs Wasser (entlang des Water Track) und Strom. Berechnet wird er als Richtung des resultierenden Vektors: COG = atan2(x, y).',
      'Das GPS zeigt den COG als Momentanwert an. Bei sehr geringer Fahrt über Grund springt dieser Wert stark – liegt das Boot still über Grund, ist der COG nicht definiert.',
      'Der COG sagt nichts darüber, wohin der Bug zeigt. Bei starkem Querstrom kann ein Boot „schräg" über Grund laufen.',
    ],
    mnemonic: 'COG = wohin das Boot sich wirklich über den Meeresboden bewegt.',
    example:
      'Heading 000°, STW 5 kn, Strom setzt 090° mit 2 kn. Über Grund bewegt sich das Boot mit COG ≈ 021,8°.',
    confusions: [
      {
        with: 'Heading',
        explanation: 'Heading = Bugrichtung. COG = Bewegungsrichtung über Grund.',
      },
      {
        with: 'Ground Track',
        explanation:
          'COG ist meist der Momentanwert (GPS). Der Ground Track ist die geplante oder gefahrene Linie in der Karte über einen Zeitraum.',
      },
    ],
    check: {
      question: 'Welche Größe zeigt das GPS als Bewegungsrichtung an?',
      options: ['Heading', 'Water Track', 'COG', 'Leeway'],
      correctIndex: 2,
      explanation: 'Das GPS kennt nur Positionsänderungen über Grund – es zeigt COG und SOG.',
    },
    source: 'GNSS/GPS, Kartenplotter',
  },
  {
    id: 'sog',
    abbr: 'SOG',
    english: 'Speed Over Ground',
    german: 'Fahrt über Grund',
    definition: 'Die Geschwindigkeit des Bootes relativ zum Meeresboden in Knoten.',
    details: [
      'SOG ist der Betrag des Vektors über Grund: SOG = √(x² + y²), wobei x und y die Ost- und Nordkomponenten der Summe aus Fahrt durchs Wasser und Strom sind.',
      'Mitlaufender Strom erhöht die SOG, Gegenstrom verringert sie. Ist der Gegenstrom stärker als die STW, bewegt sich das Boot rückwärts über Grund.',
      'Für Zeit- und ETA-Berechnungen zu einem Ziel an Land oder einer Tonne ist die SOG entscheidend, nicht die STW.',
    ],
    mnemonic: 'Für die Ankunftszeit zählt die SOG – der Meeresboden bewegt sich nicht.',
    example: 'STW 6 kn gegen 2 kn Strom von vorn: SOG = 4 kn. 12 NM bis zur Hafeneinfahrt dauern also 3 Stunden.',
    confusions: [
      {
        with: 'STW',
        explanation: 'STW vom Log (relativ zum Wasser), SOG vom GPS (relativ zum Grund).',
      },
    ],
    check: {
      question: 'STW 5 kn, Strom 2 kn genau von achtern (mitlaufend). SOG?',
      options: ['3 kn', '5 kn', '7 kn', '10 kn'],
      correctIndex: 2,
      explanation: 'Mitlaufender Strom addiert sich: 5 + 2 = 7 kn über Grund.',
    },
    source: 'GNSS/GPS, Kartenplotter',
  },
  {
    id: 'ground-track',
    abbr: 'GT',
    english: 'Ground Track',
    german: 'Kurslinie über Grund / Track over Ground',
    definition:
      'Die Linie, die das Boot über den Meeresboden zurücklegt oder zurücklegen soll – Richtung und Strecke über Grund.',
    details: [
      'In der Seekarte wird der Ground Track nach RYA-Konvention mit zwei Pfeilen (>>) gezeichnet. Er ist die dritte Seite des Stromdreiecks: Water Track + Tidal Stream = Ground Track.',
      'Bei der Kursplanung legt man zuerst den gewünschten Ground Track vom Start zum Ziel fest und ermittelt dann den Course to Steer, der diesen Track unter Strom ermöglicht.',
      'Die Richtung des Ground Track entspricht dem (mittleren) COG, seine Länge der Distanz über Grund.',
    ],
    mnemonic: 'Ground Track = Spur auf dem Meeresboden: Wasserweg plus Strom (zwei Pfeile).',
    example:
      'Von der Tonne A zur Hafeneinfahrt B sind es 8 NM auf 045°. Dieser Strich in der Karte ist der gewünschte Ground Track.',
    confusions: [
      {
        with: 'Water Track',
        explanation: 'Water Track (ein Pfeil) ohne Strom, Ground Track (zwei Pfeile) mit Strom.',
      },
      {
        with: 'COG',
        explanation: 'COG ist eine Richtung (oft momentan), der Ground Track eine Linie mit Länge.',
      },
    ],
    check: {
      question: 'Wie wird der Ground Track im RYA-Stromdreieck gekennzeichnet?',
      options: ['Ein Pfeil', 'Zwei Pfeile', 'Drei Pfeile', 'Gestrichelte Linie ohne Pfeil'],
      correctIndex: 1,
      explanation: 'Konvention: Water Track >, Ground Track >>, Tidal Stream >>>.',
    },
    source: 'Seekarte (geplant), Kartenplotter (Trackaufzeichnung)',
  },
  {
    id: 'leeway',
    abbr: 'LWY',
    english: 'Leeway',
    german: 'Windabdrift / Abtrift',
    definition:
      'Der Winkel zwischen Heading und Water Track, der entsteht, weil der Wind das Boot seitlich nach Lee versetzt.',
    details: [
      'Leeway hängt von Windstärke, Kurs zum Wind, Rumpfform und Kiel ab. Am Wind bei viel Wind ist sie am größten, auf raumem Kurs oder vor dem Wind nahezu null. Typische Werte liegen bei 0–10°.',
      'Abschätzen lässt sie sich über den Winkel zwischen Kielwasser und Mittschiffslinie (Blick achteraus).',
      'Bei der Koppelnavigation wird Leeway vom Wind weg (nach Lee) angebracht, beim Course to Steer gegen den Wind vorgehalten.',
      'Leeway ist kein Stromeffekt: Strom bewegt die ganze Wassermasse, Leeway bewegt das Boot durch das Wasser.',
    ],
    mnemonic: 'Leeway kommt vom Wind und schiebt nach Lee – Strom kommt vom Wasser.',
    example:
      'Heading 270°, Wind aus Nord. Das Boot driftet nach Süden (Backbord) ab, Leeway 6°. Water Track = 264°.',
    confusions: [
      {
        with: 'Tidal Set (Stromrichtung)',
        explanation:
          'Set ist die Richtung, in die der Strom setzt (Wasserbewegung). Leeway ist ein Winkel durch den Wind.',
      },
    ],
    check: {
      question: 'Wodurch entsteht Leeway?',
      options: [
        'Durch Gezeitenstrom',
        'Durch Wind, der das Boot seitlich versetzt',
        'Durch Deviation des Kompasses',
        'Durch Wellen von vorn',
      ],
      correctIndex: 1,
      explanation: 'Leeway ist die windbedingte seitliche Abdrift des Bootes durch das Wasser.',
    },
    source: 'Schätzung über den Kielwasserwinkel',
  },
  {
    id: 'fix',
    abbr: 'FIX',
    english: 'Position Fix',
    german: 'Standortbestimmung / beobachteter Ort',
    definition:
      'Eine Position, die durch Beobachtung bekannter Referenzen ermittelt wurde – z. B. GPS, Kreuzpeilung, Deckpeilung oder Radar.',
    details: [
      'Ein Fix beruht auf Messungen zu externen Bezugspunkten, nicht auf Annahmen über Fahrt und Strom. Er ist daher zuverlässiger als eine Estimated Position.',
      'Klassische Methode: Drei-Linien-Kreuzpeilung auf gut identifizierbare Objekte. Die drei Standlinien bilden selten einen Punkt, sondern ein kleines Fehlerdreieck („cocked hat"). Man nimmt den für die Gefahr ungünstigsten Punkt an.',
      'In der Karte: Kreis mit Punkt (⊙) und Uhrzeit. Ein neuer Fix ist der Startpunkt für die nächste Koppelnavigation.',
    ],
    mnemonic: 'Fix = beobachtet (gemessen). EP = geschätzt (berechnet).',
    example:
      'Um 14:20 peilst du einen Leuchtturm 040°, eine Kirchturmspitze 115° und ein Kap 190°. Der Schnittpunkt der drei Peillinien ist dein Fix.',
    confusions: [
      {
        with: 'EP',
        explanation: 'Die EP wird aus Kurs, Fahrt, Zeit, Leeway und Strom berechnet – nicht beobachtet.',
      },
    ],
    check: {
      question: 'Welches Kartensymbol kennzeichnet nach RYA einen Fix?',
      options: ['Dreieck mit Punkt', 'Kreis mit Punkt', 'Kurzer Querstrich', 'Quadrat'],
      correctIndex: 1,
      explanation: 'Fix: Kreis mit Punkt. EP: Dreieck mit Punkt. DR: kurzer Querstrich.',
    },
    source: 'GPS, Kreuzpeilung, Radar, Deckpeilung, Tiefenlinie',
  },
  {
    id: 'ep',
    abbr: 'EP',
    english: 'Estimated Position',
    german: 'Geschätzter / gekoppelter Ort mit Strom',
    definition:
      'Die bestmögliche berechnete Position ohne Beobachtung: Startpunkt + Water Track (Logdistanz) + Strom über die Fahrzeit.',
    details: [
      'Ausgehend vom letzten Fix wird der Water Track mit der Logdistanz eingezeichnet. Am Ende dieses Weges trägt man den Stromvektor für dieselbe Zeit an. Dessen Spitze ist die EP.',
      'Die reine Koppelposition ohne Strom heißt Dead Reckoning (DR) Position. Die EP ist genauer, weil sie Leeway und Strom berücksichtigt.',
      'In der Karte: Dreieck mit Punkt und Uhrzeit. Eine EP ist nur so gut wie die Annahmen über Strom, Leeway und Steuergenauigkeit – sie sollte so bald wie möglich durch einen Fix bestätigt werden.',
    ],
    mnemonic: 'EP = DR + Strom: erst durchs Wasser, dann mit dem Wasser.',
    example:
      'Fix 10:00. Heading 000°, Log 5 NM in einer Stunde, Strom 090° 2 kn. EP 11:00 liegt 5 NM nördlich und 2 NM östlich des Fixes – Ground Track ≈ 022°, 5,4 NM.',
    confusions: [
      {
        with: 'Position Fix',
        explanation: 'Der Fix wird beobachtet, die EP berechnet.',
      },
      {
        with: 'DR-Position',
        explanation: 'DR (Dead Reckoning) berücksichtigt keinen Strom, die EP schon.',
      },
    ],
    check: {
      question: 'Was unterscheidet die EP von der DR-Position?',
      options: [
        'Die EP berücksichtigt zusätzlich den Strom',
        'Die EP wird mit GPS bestimmt',
        'Die DR-Position ist genauer',
        'Es gibt keinen Unterschied',
      ],
      correctIndex: 0,
      explanation: 'EP = DR-Position + Stromversatz (und Leeway). Ein GPS-Ort wäre ein Fix.',
    },
    source: 'Seekarte: Koppelnavigation mit Logdistanz und Stromangaben',
  },
]

export const TERM_BY_ID: Record<TermId, GlossaryTerm> = Object.fromEntries(
  GLOSSARY.map((t) => [t.id, t]),
) as Record<TermId, GlossaryTerm>

export const TERM_IDS: TermId[] = GLOSSARY.map((t) => t.id)
