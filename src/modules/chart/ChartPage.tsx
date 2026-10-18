import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toggle } from '@/modules/calculators/fields'
import { ExercisesPanel } from './ExercisesPanel'
import { PlotTool } from './PlotTool'

export function ChartPage() {
  const [tab, setTab] = useState<'plot' | 'exercises'>('exercises')
  return (
    <div className="space-y-5">
      <PageHeader
        title="Seekarte"
        subtitle="Fiktives, aber geografisch konsistentes Übungsrevier in Mercatorprojektion: Kurse messen, Positionen plotten, Strom berücksichtigen."
        actions={
          <Toggle
            label="Bereich"
            value={tab}
            onChange={setTab}
            options={[
              { value: 'exercises', label: 'Kartenaufgaben' },
              { value: 'plot', label: 'Freies Plotten' },
            ]}
          />
        }
      />
      {tab === 'plot' ? <PlotTool /> : <ExercisesPanel />}
    </div>
  )
}
