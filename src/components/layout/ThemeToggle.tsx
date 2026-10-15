import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useSettingsStore } from '@/stores/settingsStore'

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, toggleTheme } = useSettingsStore()
  const next = theme === 'dark' ? 'Light Mode' : 'Dark Mode'
  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={`Zu ${next} wechseln`} title={`Zu ${next} wechseln`} className={className}>
      {theme === 'dark' ? <Sun /> : <Moon />}
    </Button>
  )
}
