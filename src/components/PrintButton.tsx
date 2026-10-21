import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Öffnet den Druckdialog des Browsers – dort lässt sich auch „Als PDF speichern“ wählen. */
export function PrintButton({ label = 'Drucken / PDF' }: { label?: string }) {
  return (
    <Button variant="outline" className="print:hidden" onClick={() => window.print()}>
      <Printer className="size-4" /> {label}
    </Button>
  )
}
