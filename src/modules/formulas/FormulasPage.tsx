import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PrintButton } from '@/components/PrintButton'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FORMULA_GROUPS, formatResult } from '@/data/formulas'
import { dayKey } from '@/lib/stats'
import { Toggle } from '@/modules/calculators/fields'
import type { CourseLevel } from '@/types/learning'

type Filter = 'all' | CourseLevel

const LEVEL_ORDER: CourseLevel[] = ['day-skipper', 'coastal-skipper', 'yachtmaster-offshore']

export function FormulasPage() {
  const [filter, setFilter] = useState<Filter>('all')
  // Höhere Stufen schließen die Formeln der niedrigeren ein
  const groups = filter === 'all' ? FORMULA_GROUPS : FORMULA_GROUPS.filter((g) => LEVEL_ORDER.indexOf(g.level) <= LEVEL_ORDER.indexOf(filter))
  const count = groups.reduce((n, g) => n + g.items.length, 0)
  return (
    <div className="space-y-6">
      <PageHeader
        title="Formelsammlung"
        subtitle="Alle Rechenwege der App auf einen Blick, jeweils mit Beispiel. Die Ergebnisse rechnet die App mit denselben Funktionen wie in den Lektionen."
        actions={<PrintButton />}
      />
      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <Toggle
          value={filter}
          onChange={setFilter}
          label="Ausbildungsstufe"
          options={[
            { value: 'all', label: 'Alle' },
            { value: 'day-skipper', label: 'Day Skipper' },
            { value: 'coastal-skipper', label: 'bis Coastal' },
            { value: 'yachtmaster-offshore', label: 'bis Yachtmaster' },
          ]}
        />
        <span className="text-sm text-muted-foreground">{count} Formeln</span>
      </div>
      <p className="hidden text-xs text-muted-foreground print:block">
        RYA Navigation Academy · Stand {dayKey().split('-').reverse().join('.')} · {count} Formeln
      </p>
      {groups.map((g) => (
        <Card key={g.id} className="print:break-inside-auto print:shadow-none">
          <CardHeader>
            <CardTitle>{g.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="hidden gap-4 border-b pb-2 text-xs font-semibold tracking-wide text-muted-foreground uppercase sm:grid sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,16rem)] print:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,12rem)]">
              <span>Größe</span>
              <span>Formel</span>
              <span>Beispiel</span>
            </div>
            <dl className="divide-y">
              {g.items.map((f) => (
                <div key={f.id} className="grid gap-1 py-3 break-inside-avoid print:py-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)_minmax(0,16rem)] print:grid-cols-[8.5rem_minmax(0,1fr)_minmax(0,12rem)] sm:gap-4">
                  <dt className="font-medium break-words hyphens-auto">
                    <a href={f.href} className="hover:underline print:no-underline">
                      {f.title}
                    </a>
                  </dt>
                  <dd className="font-mono text-sm print:text-xs">{f.formula}</dd>
                  <dd className="text-sm text-muted-foreground print:text-xs">
                    {f.example} → <span className="font-semibold text-foreground">{formatResult(f)}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      ))}
      <p className="text-xs text-muted-foreground">Vereinfachte Lernformeln – maßgeblich sind amtliche Unterlagen, Almanach und die Ausbildung.</p>
    </div>
  )
}
