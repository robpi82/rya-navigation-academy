import { useEffect, useState } from 'react'
import type { LightSegment } from '@/calculations'

/** Liefert true/false, ob das Feuer gerade leuchtet – animiert anhand des Zeitverlaufs einer Periode. */
export function useLightPhase(timeline: LightSegment[] | null, running = true): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => {
    if (!timeline || timeline.length === 0 || !running) {
      setOn(false)
      return
    }
    const total = timeline.reduce((s, x) => s + x.duration, 0)
    const start = performance.now()
    let frame = 0
    let last: boolean | null = null
    const tick = (now: number) => {
      let t = ((now - start) / 1000) % total
      let state = false
      for (const seg of timeline) {
        if (t < seg.duration) {
          state = seg.on
          break
        }
        t -= seg.duration
      }
      if (state !== last) {
        last = state
        setOn(state)
      }
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [timeline, running])
  return on
}
