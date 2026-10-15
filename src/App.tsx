import { AppShell } from '@/components/layout/AppShell'
import { useHashRoute } from '@/hooks/useHashRoute'
import { useStudyTimer } from '@/hooks/useStudyTimer'
import { useApplyTheme } from '@/hooks/useTheme'
import { DashboardPage } from '@/modules/dashboard/DashboardPage'
import { GlossaryPage } from '@/modules/glossary/GlossaryPage'
import { QuizPage } from '@/modules/quiz/QuizPage'
import { SimulatorPage } from '@/modules/simulator/SimulatorPage'
import { AboutPage } from '@/pages/AboutPage'
import { RoadmapPage } from '@/pages/RoadmapPage'

export default function App() {
  const route = useHashRoute()
  useApplyTheme()
  useStudyTimer()

  let page
  switch (route.name) {
    case 'glossary':
      page = <GlossaryPage termId={route.termId} />
      break
    case 'simulator':
      page = <SimulatorPage />
      break
    case 'quiz':
      page = <QuizPage key={route.preset ?? 'default'} preset={route.preset} />
      break
    case 'roadmap':
      page = <RoadmapPage />
      break
    case 'about':
      page = <AboutPage />
      break
    default:
      page = <DashboardPage />
  }

  return <AppShell route={route}>{page}</AppShell>
}
