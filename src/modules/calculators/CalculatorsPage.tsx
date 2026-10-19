import { useState, type ComponentType } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  CogCalculator,
  CtsCalculator,
  DstCalculator,
  EpCalculator,
  EtaCalculator,
  SogCalculator,
  TidalStreamCalculator,
} from './calculators'
import { GreatCircleCalculator } from './GreatCircleCalculator'

const CALCS: { id: string; short: string; title: string; desc: string; Comp: ComponentType }[] = [
  { id: 'dst', short: 'DST', title: 'Distance, Speed, Time', desc: 'Distanz, Geschwindigkeit oder Zeit aus den beiden anderen Größen.', Comp: DstCalculator },
  { id: 'eta', short: 'ETA', title: 'Estimated Time of Arrival', desc: 'Ankunftszeit aus Abfahrt, Distanz und Fahrt über Grund.', Comp: EtaCalculator },
  { id: 'cog', short: 'COG', title: 'Course Over Ground', desc: 'Kurs über Grund aus Heading, Leeway und Strom (Vektoraddition).', Comp: CogCalculator },
  { id: 'sog', short: 'SOG', title: 'Speed Over Ground', desc: 'Fahrt über Grund aus dem Stromdreieck oder aus zwei Fixes.', Comp: SogCalculator },
  { id: 'tide', short: 'Strom', title: 'Tidal Stream Vector', desc: 'Stromrate zwischen Spring und Nipp interpolieren, Drift und Vektor.', Comp: TidalStreamCalculator },
  { id: 'cts', short: 'CTS', title: 'Course to Steer', desc: 'Zu steuernder Kurs, damit Strom und Leeway dich auf dem Sollkurs halten.', Comp: CtsCalculator },
  { id: 'ep', short: 'EP', title: 'Estimated Position', desc: 'Geschätzter Ort aus Fix, Heading, Log, Leeway und Strom.', Comp: EpCalculator },
  { id: 'gc', short: 'Großkreis', title: 'Großkreis und Loxodrome', desc: 'Kürzester Weg auf langen Strecken: Distanz, Anfangskurs, Wegpunkte und Ersparnis gegenüber konstantem Kurs.', Comp: GreatCircleCalculator },
]

const STORAGE_KEY = 'rya-nav-academy:calculator-tab'

export function CalculatorsPage() {
  const [active, setActive] = useState<string>(() => {
    try {
      const v = localStorage.getItem(STORAGE_KEY)
      return CALCS.some((c) => c.id === v) ? v! : 'dst'
    } catch {
      return 'dst'
    }
  })
  const calc = CALCS.find((c) => c.id === active)!
  const select = (id: string) => {
    setActive(id)
    try {
      localStorage.setItem(STORAGE_KEY, id)
    } catch {
      /* Speicher nicht verfügbar – Auswahl gilt nur für diese Sitzung */
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Navigationsrechner" subtitle={`${CALCS.length} Rechner in nautischen Einheiten (NM, kn, °, h/min) – jeweils mit Eingabeprüfung und Rechenweg.`} />
      <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        <div className="inline-flex gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Rechner">
          {CALCS.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={active === c.id}
              onClick={() => select(c.id)}
              className={cn(
                'rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                active === c.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
              )}
            >
              {c.short}
            </button>
          ))}
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{calc.title}</CardTitle>
          <CardDescription>{calc.desc}</CardDescription>
        </CardHeader>
        <CardContent>
          <calc.Comp key={calc.id} />
        </CardContent>
      </Card>
    </div>
  )
}
