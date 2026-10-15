import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { SimulationInput } from '@/types/navigation'

export const SIM_DEFAULTS: SimulationInput = {
  heading: 0,
  stw: 5,
  tideDirection: 90,
  tideRate: 2,
  leeway: 0,
  durationMin: 60,
}

interface SimulatorState {
  input: SimulationInput
  setValue: <K extends keyof SimulationInput>(key: K, value: SimulationInput[K]) => void
  setInput: (input: SimulationInput) => void
  reset: () => void
}

export const useSimulatorStore = create<SimulatorState>()(
  persist(
    (set) => ({
      input: SIM_DEFAULTS,
      setValue: (key, value) => set((s) => ({ input: { ...s.input, [key]: value } })),
      setInput: (input) => set({ input }),
      reset: () => set({ input: SIM_DEFAULTS }),
    }),
    { name: 'rya-nav-academy:simulator', storage: createJSONStorage(() => localStorage) },
  ),
)
