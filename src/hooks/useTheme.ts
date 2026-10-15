import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

export function useApplyTheme() {
  const theme = useSettingsStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
  }, [theme])
}
