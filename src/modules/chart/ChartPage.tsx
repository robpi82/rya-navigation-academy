import { useState } from 'react'
import { PageHeader } from '@/components/layout/PageHeader'
import { Toggle } from '@/modules/calculators/fields'
import { ExercisesPanel } from './ExercisesPanel'
import { PlotTool } from './PlotTool'
import { RealExercisesPanel, RealPlotTool } from './RealChartPanel'

type Mode = 'real' | 'fictional'

export function ChartPage() {
  const [mode, setMode] = useState<Mode>('real')
  const [tab, setTab] = useState<'plot' | 'exercises'>('exercises')
  return (
    <div className="space-y-5">
      <PageHeader
        title="Seekarte"
        subtitle={
          mode === 'real'
            ? 'Echte Kartendaten von OpenStreetMap und OpenSeaMap: Positionen finden, Kurse und Distanzen messen, Kurslinien zeichnen.'
            : 'Fiktives, aber geografisch konsistentes Übungsrevier in Mercatorprojektion: Kurse messen, Positionen plotten, Strom berücksichtigen.'
        }
        actions={
          <div className="flex flex-wrap gap-2">
            <Toggle
              label="Karte"
              value={mode}
              onChange={setMode}
              options={[
                { value: 'real', label: 'Reale Karte' },
                { value: 'fictional', label: 'Übungsrevier (fiktiv)' },
              ]}
            />
            <Toggle
              label="Bereich"
              value={tab}
              onChange={setTab}
              options={[
                { value: 'exercises', label: 'Kartenaufgaben' },
                { value: 'plot', label: mode === 'real' ? 'Freies Messen' : 'Freies Plotten' },
              ]}
            />
          </div>
        }
      />
      {mode === 'real' ? (
        tab === 'plot' ? <RealPlotTool /> : <RealExercisesPanel onShowFictional={() => setMode('fictional')} />
      ) : tab === 'plot' ? (
        <PlotTool />
      ) : (
        <ExercisesPanel />
      )}
    </div>
  )
}
