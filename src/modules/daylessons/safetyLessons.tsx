import { EncounterWidget, LightsWidget, SoundSignalsWidget } from './colregsWidgets'
import { CpaWidget, EchoSounderWidget, PlotterWidget } from './enavWidgets'
import { CallTypeWidget, DistressSignalsWidget, MaydayOrderWidget, MobOrderWidget } from './safetyWidgets'
import type { DayLesson } from './types'
import { BeaufortWidget, BuysBallotWidget, ForecastTermsWidget } from './weatherWidgets'

/** Phase 5: Verkehr, Wetter, Sicherheit und Elektronik. Inhalte eigenständig formuliert und vereinfacht. */
export const SAFETY_LESSONS: DayLesson[] = [
  {
    id: 'colregs',
    title: 'Kollisionsverhütung (COLREGs)',
    english: 'Collision Regulations',
    summary: 'Wer weicht aus? Die wichtigsten Ausweichregeln, Lichter und Schallsignale der KVR/COLREGs.',
    body: [
      'Die Kollisionsverhütungsregeln (International Regulations for Preventing Collisions at Sea, COLREGs; in Deutschland KVR) gelten für alle Fahrzeuge auf der Hohen See und den damit verbundenen, von Seeschiffen befahrbaren Gewässern (Rule 1); örtliche Sondervorschriften – in Deutschland etwa die Seeschifffahrtsstraßen-Ordnung – gehen vor. Grundpflichten: ständiger Ausguck (Rule 5), sichere Geschwindigkeit (Rule 6), Kollisionsgefahr erkennen (Rule 7) – etwa wenn sich die Kompasspeilung zu einem sich nähernden Fahrzeug nicht merklich ändert – und frühzeitig, deutlich und seemännisch ausweichen (Rule 8).',
      'Ausweichregeln bei Sicht: Wer überholt, weicht aus (Rule 13) – diese Regel geht den übrigen Ausweichregeln bei Sicht vor. Entgegenkommende Maschinenfahrzeuge weichen beide nach Steuerbord aus (Rule 14). Kreuzen sich Maschinenfahrzeuge, weicht aus, wer das andere an Steuerbord hat (Rule 15). Segler untereinander: Backbordbug weicht Steuerbordbug, bei gleichem Bug das Luvboot dem Leeboot (Rule 12). Ein Maschinenfahrzeug weicht einem Segler aus (Rule 18). Der Kurshalter behält Kurs und Fahrt (Rule 17), darf aber handeln, wenn der Ausweichpflichtige nicht reagiert.',
      'Nachts erkennt man Fahrzeuge an ihren Lichtern, bei Nebel an Schallsignalen. Auch eine Segelyacht unter Maschine gilt als Maschinenfahrzeug. In engen Fahrwassern (Rule 9) und Verkehrstrennungsgebieten (Rule 10) gelten Sonderregeln: auf der rechten Seite des Fahrwassers bleiben, Verkehrstrennungsgebiete mit einem Steuerkurs möglichst rechtwinklig queren; Segler und Fahrzeuge unter 20 m dürfen Maschinenfahrzeuge im Einbahnweg nicht behindern. Die Inhalte sind eigenständig vereinfacht – den amtlichen Regeltext kennen.',
    ],
    keyPoints: [
      'Immer: Ausguck, sichere Fahrt, früh und deutlich ausweichen.',
      'Der Überholende weicht aus (Rule 13) – vor den übrigen Ausweichregeln.',
      'Maschine gegen Maschine: entgegen = beide nach Steuerbord; kreuzen = „rechts vor links".',
      'Segler: Backbordbug weicht Steuerbordbug; gleicher Bug: Luv weicht Lee. Maschine weicht Segler.',
      'Segeln mit laufender Maschine: Du bist ein Maschinenfahrzeug.',
    ],
    mnemonic: '„Rechts vor links": Wer den anderen an Steuerbord sieht, muss ausweichen. Wer überholt, weicht immer aus.',
    widgets: [
      { title: 'Begegnungs-Trainer', description: 'Wer weicht aus? Verändere Peilung, Kurs und Fahrzeugart.', Comp: EncounterWidget },
      { title: 'Lichter bei Nacht', description: 'Welche Lichter siehst du aus welcher Richtung?', Comp: LightsWidget },
      { title: 'Schallsignale', description: 'Manöver- und Nebelsignale mit Trainer.', Comp: SoundSignalsWidget },
    ],
    links: [{ label: 'KVR-Aufgaben üben', href: '#/quiz' }],
  },
  {
    id: 'weather',
    title: 'Wetter und Seewetterbericht',
    english: 'Weather & Forecasts',
    summary: 'Windstärken, Druckgebilde und Seewetterbericht lesen – und rechtzeitig entscheiden, ob und wann man ausläuft.',
    body: [
      'Wind wird auf See in Beaufort (Bft) angegeben, im Seewetterbericht als mittlere Windstärke; Böen können deutlich stärker sein, oft rund 40 % über dem Mittelwind. Mit Stärke 6 erreichen viele Yachten die Grenze der Komfortzone, ab Stärke 8 spricht man von Sturm („Gale").',
      'Tiefdruckgebiete bringen Wind, Wolken und Regen; auf der Nordhalbkugel weht der Wind gegen den Uhrzeigersinn um ein Tief, im Uhrzeigersinn um ein Hoch. Fallender Luftdruck – besonders schnell fallender – kündigt eine Wetterverschlechterung an. Die Buys-Ballot-Regel zeigt, wo das Tief liegt.',
      'Fronten bringen Winddrehungen: Vor einer Warmfront fällt der Druck, der Wind dreht nach links (backing) und nimmt zu, es beginnt zu regnen. Beim Durchzug einer Kaltfront dreht der Wind schlagartig nach rechts (veering) bei Schauern und Böen; danach steigt der Druck und die Sicht wird besser. Seewetterberichte (Funk, Navtex, Internet) benutzen feste Begriffe für Zeit, Sicht und Drucktendenz. Das Wetter vor dem Auslaufen und regelmäßig unterwegs beobachten und einen Ausweichhafen kennen.',
    ],
    keyPoints: [
      'Windstärken: 4 ≈ 11–16 kn, 6 ≈ 22–27 kn, 8 ≈ 34–40 kn.',
      'Druck fällt schnell (mehr als 3,6 hPa in 3 Stunden): Achtung, Wetter verschlechtert sich.',
      'Buys-Ballot: Rücken zum Wind – auf der Nordhalbkugel liegt das Tief links.',
      'Vor einer Warmfront dreht der Wind links (backing) und frischt auf, beim Durchgang dreht er rechts. Kaltfront: schlagartig rechts (veering), Böen.',
    ],
    mnemonic: 'Rücken zum Wind – Tief links. Druck fällt schnell – früh reffen und den Hafen im Blick behalten.',
    widgets: [
      { title: 'Beaufort-Skala', description: 'Knoten, m/s, km/h, Seegang und Wirkung.', Comp: BeaufortWidget },
      { title: 'Buys-Ballot und Winddrehung', Comp: BuysBallotWidget },
      { title: 'Begriffe im Seewetterbericht', description: 'Drucktendenz und Sichtweite berechnen, Begriffe nachschlagen.', Comp: ForecastTermsWidget },
    ],
    links: [{ label: 'Wetteraufgaben üben', href: '#/quiz' }],
  },
  {
    id: 'safety',
    title: 'Sicherheit und Seefunk',
    english: 'Safety & Radio',
    summary: 'Notruf, Seenotzeichen, Mann über Bord, Ausrüstung: sicher handeln, wenn es ernst wird.',
    body: [
      'Sicherheit beginnt mit Vorbereitung: Jeder an Bord kennt Rettungswesten, Lifebelts und Strecktaue, Seeventile, Feuerlöscher, Rettungsinsel, Notfunk und Signalmittel. Rettungswesten sollten bei rauem Wetter, in der Dunkelheit, allein an Deck und von Nichtschwimmern und Kindern getragen werden; Lifebelts werden eingepickt, bevor man das Cockpit verlässt.',
      'UKW-Seefunk: Kanal 16 (156,8 MHz) ist Anruf- und Notkanal, Kanal 70 dient dem Digitalen Selektivruf (DSC). Es gibt drei Meldungsarten: MAYDAY (schwere, unmittelbare Gefahr), PAN-PAN (Dringlichkeit) und SÉCURITÉ (wichtige Sicherheits- und Wetterwarnung). Für den Betrieb eines Seefunkgeräts ist ein Funkzeugnis erforderlich (z. B. SRC); hier geht es nur um das Grundverständnis.',
      'Mann über Bord (MOB): Die Person nicht aus den Augen verlieren, Rettungsmittel werfen, MOB-Position speichern, Notruf absetzen, zurückfahren. In den ersten Minuten droht der Kälteschock, danach die Unterkühlung – auch Geborgene brauchen Betreuung. Feuer an Bord: Gas absperren, Feuerlöscher auf die Flammenbasis richten, bei Fettbrand die Löschdecke nutzen. Flüssiggas ist schwerer als Luft und sammelt sich in der Bilge – nach Gebrauch am Behälter absperren.',
    ],
    keyPoints: [
      'Kanal 16: Anruf- und Notkanal. MAYDAY = Seenot, PAN-PAN = Dringlichkeit, SÉCURITÉ = Sicherheit.',
      'Notruf: Wer bin ich – wo – was ist passiert – welche Hilfe – wie viele Personen.',
      'MOB: rufen, zeigen, werfen, MOB-Taste, Notruf, zurückfahren.',
      'Seenotzeichen: rote Fallschirmraketen, rote Handfackeln, orangefarbener Rauch – Haltbarkeitsdatum der Pyrotechnik beachten.',
    ],
    mnemonic: 'Wer – wo – was – welche Hilfe – wie viele? So bleibt der Notruf vollständig, auch unter Stress.',
    widgets: [
      { title: 'Mayday-Notruf in der richtigen Reihenfolge', Comp: MaydayOrderWidget },
      { title: 'Mann über Bord: Sofortmaßnahmen', Comp: MobOrderWidget },
      { title: 'Welcher Funkspruch passt?', description: 'MAYDAY, PAN-PAN oder SÉCURITÉ?', Comp: CallTypeWidget },
      { title: 'Seenotzeichen erkennen', Comp: DistressSignalsWidget },
    ],
    links: [{ label: 'Sicherheits-Aufgaben üben', href: '#/quiz' }],
  },
  {
    id: 'electronics',
    title: 'Elektronische Navigation',
    english: 'Electronic Navigation',
    summary: 'GPS, Kartenplotter, AIS, Radar und Echolot sinnvoll nutzen – und ihre Grenzen kennen.',
    body: [
      'GPS bestimmt die Position aus den Laufzeiten von Satellitensignalen – für eine genaue dreidimensionale Position braucht man mindestens vier Satelliten – und liefert zusätzlich COG, SOG und die Uhrzeit. Die Genauigkeit liegt meist bei wenigen Metern, kann aber durch Satellitengeometrie, Abschattung oder Störungen schlechter werden. Gerät und Karte müssen dasselbe geodätische Bezugssystem (Datum, meist WGS 84) benutzen.',
      'Der Kartenplotter zeigt Position und Route auf einer elektronischen Karte und rechnet XTE, BTW, DTW, VMG und ETA. Elektronische Karten müssen aktuell sein. Strom, Gerät oder GPS können jederzeit ausfallen – deshalb Papierkarte und Koppelnavigation mitführen und die Position regelmäßig mit Peilungen oder Seezeichen überprüfen.',
      'AIS (Automatic Identification System) sendet und empfängt Name, MMSI, Position, Kurs und Fahrt von Schiffen; der Plotter berechnet daraus CPA und TCPA. Nicht jedes Fahrzeug sendet AIS (kleine Yachten oft nicht), daher ersetzt es den Ausguck nicht. Radar sieht auch Objekte ohne AIS, hat aber Grenzen: Regen- und Seegangsechos, Abschattung und schlechte Echos kleiner Boote. Das Echolot misst die Tiefe ab dem Geber – entscheidend ist, auf welchen Bezug (Geber, Kiel, Wasserlinie) es eingestellt ist.',
    ],
    keyPoints: [
      'Elektronik ist ein Hilfsmittel: Ausguck, Papierkarte und Koppelnavigation bleiben Pflicht.',
      'XTE = seitlicher Abstand zur Routenlinie; BTW/DTW = Peilung/Distanz zum Wegpunkt; VMG = Fahrt in Richtung Ziel.',
      'CPA = kleinster Abstand, TCPA = Zeit bis dorthin. Kleiner CPA bei kleiner TCPA heißt: früh handeln.',
      'Echolot: Bezug der Anzeige kennen (Geber, Kiel oder Wasserlinie).',
    ],
    mnemonic: 'Elektronik zeigt – der Skipper entscheidet. Habe immer einen zweiten Weg zur Position.',
    widgets: [
      { title: 'Kartenplotter: Route, XTE, BTW, DTW, VMG', description: 'Setze Wegpunkte und Bootsposition in der Seekarte.', Comp: PlotterWidget },
      { title: 'AIS/Radar: CPA und TCPA', description: 'Wie dicht kommt das Ziel – und wann?', Comp: CpaWidget },
      { title: 'Echolot', description: 'Tiefe unter Geber, Kiel oder Wasserlinie.', Comp: EchoSounderWidget },
    ],
    links: [{ label: 'Seekarte öffnen', href: '#/seekarte' }],
  },
]
