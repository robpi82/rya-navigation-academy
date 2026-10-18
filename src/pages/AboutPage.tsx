import { ShieldAlert } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function AboutPage() {
  return (
    <div className="max-w-3xl space-y-6">
      <PageHeader title="Über & Hinweise" />
      <Card className="border-warning/50">
        <CardHeader className="flex-row items-center gap-2">
          <ShieldAlert className="size-5 text-warning" />
          <CardTitle>Wichtiger Hinweis</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p>
            Die <b>RYA Navigation Academy</b> ist ein unabhängiges Lernprojekt. Sie ist <b>nicht</b> von der Royal Yachting
            Association (RYA) entwickelt, zertifiziert oder unterstützt. „RYA" bezeichnet hier nur den Lehrplan, an dem sich die
            Inhalte orientieren.
          </p>
          <p>
            Die Anwendung ist eine Lernhilfe und <b>kein Ersatz</b> für zugelassene Navigationsmittel, amtliche Seekarten,
            Gezeitentafeln oder eine anerkannte Ausbildung. Alle Übungsfragen sind eigenständig erstellt.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Konventionen in dieser App</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>Richtungen in Grad rechtweisend (°T), im Uhrzeigersinn von geografisch Nord, dreistellig (z. B. 021,8°).</li>
            <li>Die Stromrichtung (Set) ist die Richtung, <i>in die</i> der Strom setzt – nicht woher er kommt.</li>
            <li>Leeway: positiv = Abdrift nach Steuerbord, negativ = nach Backbord. Water Track = Heading + Leeway.</li>
            <li>Koordinaten: x nach Osten, y nach Norden; x = v·sin θ, y = v·cos θ; COG = atan2(x, y).</li>
            <li>Bei SOG = 0 ist der COG nicht definiert und wird nicht angezeigt.</li>
            <li>RYA-Pfeilkonvention: Water Track &gt;, Ground Track &gt;&gt;, Tidal Stream &gt;&gt;&gt;.</li>
            <li>Kartensymbole: Fix ⊙ (Kreis mit Punkt), EP △ (Dreieck mit Punkt), DR / (Querstrich), Wegpunkt □.</li>
            <li>
              Seekarte: fiktives Übungsrevier „Nordbucht“ in Mercatorprojektion (Kugelmodell). Kurse entlang der Loxodrome, Distanzen am
              Breitenmaßstab (1′ = 1 NM). Keine reale Seekarte – nicht zur Navigation.
            </li>
            <li>Gezeitenstrom: Rate zwischen Spring- und Nipptide linear über den Tidenhub interpoliert; mehrstündige Ströme werden vektoriell addiert.</li>
          </ul>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Datenspeicherung</CardTitle>
        </CardHeader>
        <CardContent className="text-sm leading-relaxed text-muted-foreground">
          Lernfortschritt, Quizergebnisse und Einstellungen werden ausschließlich lokal im LocalStorage deines Browsers gespeichert.
          Es werden keine Daten übertragen. Du kannst den Fortschritt im Dashboard zurücksetzen.
        </CardContent>
      </Card>
    </div>
  )
}
