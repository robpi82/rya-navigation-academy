import { lazy, Suspense } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { useHashRoute } from '@/hooks/useHashRoute'
import { useStudyTimer } from '@/hooks/useStudyTimer'
import { useApplyTheme } from '@/hooks/useTheme'

// Seiten werden erst beim ersten Aufruf geladen (kleineres Start-Bundle)
const DashboardPage = lazy(() => import('@/modules/dashboard/DashboardPage').then((m) => ({ default: m.DashboardPage })))
const GlossaryPage = lazy(() => import('@/modules/glossary/GlossaryPage').then((m) => ({ default: m.GlossaryPage })))
const SimulatorPage = lazy(() => import('@/modules/simulator/SimulatorPage').then((m) => ({ default: m.SimulatorPage })))
const QuizPage = lazy(() => import('@/modules/quiz/QuizPage').then((m) => ({ default: m.QuizPage })))
const FlashcardsPage = lazy(() => import('@/modules/flashcards/FlashcardsPage').then((m) => ({ default: m.FlashcardsPage })))
const CalculatorsPage = lazy(() => import('@/modules/calculators/CalculatorsPage').then((m) => ({ default: m.CalculatorsPage })))
const ChartPage = lazy(() => import('@/modules/chart/ChartPage').then((m) => ({ default: m.ChartPage })))
const DayLessonsPage = lazy(() => import('@/modules/daylessons/DayLessonsPage').then((m) => ({ default: m.DayLessonsPage })))
const CoastalPage = lazy(() => import('@/modules/coastal/CoastalPage').then((m) => ({ default: m.CoastalPage })))
const RoadmapPage = lazy(() => import('@/pages/RoadmapPage').then((m) => ({ default: m.RoadmapPage })))
const AboutPage = lazy(() => import('@/pages/AboutPage').then((m) => ({ default: m.AboutPage })))

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
    case 'flashcards':
      page = <FlashcardsPage />
      break
    case 'calculators':
      page = <CalculatorsPage />
      break
    case 'chart':
      page = <ChartPage />
      break
    case 'themen':
      page = <DayLessonsPage lessonId={route.lessonId} />
      break
    case 'coastal':
      page = <CoastalPage lessonId={route.lessonId} />
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

  return (
    <AppShell route={route}>
      <Suspense fallback={<div className="py-20 text-center text-sm text-muted-foreground">Lädt …</div>}>{page}</Suspense>
    </AppShell>
  )
}
