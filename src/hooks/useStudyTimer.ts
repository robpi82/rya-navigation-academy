import { useEffect } from 'react'
import { useProgressStore } from '@/stores/progressStore'

const TICK_SECONDS = 15

/** Zählt Lernzeit, solange der Tab sichtbar ist (in 15-s-Schritten). */
export function useStudyTimer() {
  const addStudyTime = useProgressStore((s) => s.addStudyTime)
  useEffect(() => {
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') addStudyTime(TICK_SECONDS)
    }, TICK_SECONDS * 1000)
    return () => window.clearInterval(id)
  }, [addStudyTime])
}
