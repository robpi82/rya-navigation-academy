import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settingsStore'

export function useApplyTheme() {
  const theme = useSettingsStore((s) => s.theme)
  useEffect(() => {
    const root = document.documentElement
    root.classList.toggle('dark', theme === 'dark')
    root.style.colorScheme = theme
    // Gedruckt wird immer hell – dunkle Flächen kosten Toner und helle Schrift verschwindet auf Papier
    const before = () => root.classList.remove('dark')
    const after = () => root.classList.toggle('dark', theme === 'dark')
    window.addEventListener('beforeprint', before)
    window.addEventListener('afterprint', after)
    return () => {
      window.removeEventListener('beforeprint', before)
      window.removeEventListener('afterprint', after)
    }
  }, [theme])
}
