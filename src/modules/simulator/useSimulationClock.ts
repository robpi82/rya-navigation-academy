import { useCallback, useEffect, useRef, useState } from 'react'

/** Simulationsminuten pro Echtzeit-Sekunde bei Geschwindigkeit 1× */
export const BASE_MIN_PER_SEC = 10

/**
 * Animationsuhr für den Simulator. `elapsed` in Simulationsminuten (0 … duration).
 */
export function useSimulationClock(duration: number) {
  const [elapsed, setElapsedState] = useState(duration)
  const elapsedRef = useRef(duration)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)

  const setElapsed = useCallback((v: number) => {
    elapsedRef.current = v
    setElapsedState(v)
  }, [])

  // Dauer geändert → Zeit begrenzen
  useEffect(() => {
    if (elapsedRef.current > duration) setElapsed(duration)
    if (duration === 0) setPlaying(false)
  }, [duration, setElapsed])

  useEffect(() => {
    if (!playing) return
    let frame = 0
    let last: number | null = null
    const tick = (now: number) => {
      if (last !== null) {
        const next = elapsedRef.current + ((now - last) / 1000) * BASE_MIN_PER_SEC * speed
        if (next >= duration) {
          setElapsed(duration)
          setPlaying(false)
          return
        }
        setElapsed(next)
      }
      last = now
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [playing, speed, duration, setElapsed])

  const toggle = useCallback(() => {
    if (duration <= 0) return
    if (!playing && elapsedRef.current >= duration) setElapsed(0)
    setPlaying(!playing)
  }, [duration, playing, setElapsed])

  const reset = useCallback(() => {
    setPlaying(false)
    setElapsed(0)
  }, [setElapsed])

  const seek = useCallback(
    (m: number) => {
      setPlaying(false)
      setElapsed(Math.max(0, Math.min(duration, m)))
    },
    [duration, setElapsed],
  )

  return { elapsed, playing, speed, setSpeed, toggle, reset, seek }
}
