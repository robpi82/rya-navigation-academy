import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type Theme = 'dark' | 'light'

interface SettingsState {
  theme: Theme
  toggleTheme: () => void
}

const prefersLight = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: prefersLight() ? 'light' : 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
    }),
    { name: 'rya-nav-academy:settings', storage: createJSONStorage(() => localStorage) },
  ),
)
