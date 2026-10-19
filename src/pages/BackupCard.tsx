import { useRef, useState } from 'react'
import { Download, Upload, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { applyBackup, buildBackup, parseBackup, summarizeBackup, type Backup } from '@/lib/backup'

/** Lernstand als Datei sichern und wiederherstellen; Hinweis zum Offline-Betrieb. */
export function BackupCard() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<Backup | null>(null)
  const [error, setError] = useState<string | null>(null)

  const download = () => {
    const backup = buildBackup(localStorage)
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `rya-academy-sicherung-${backup.createdAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const choose = async (file: File | undefined) => {
    setError(null)
    setPending(null)
    if (!file) return
    const result = parseBackup(await file.text())
    if (result.ok) setPending(result.backup)
    else setError(result.error)
    if (fileRef.current) fileRef.current.value = ''
  }

  const restore = () => {
    if (!pending) return
    applyBackup(localStorage, pending)
    window.location.reload()
  }
  const summary = pending ? summarizeBackup(pending) : null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lernstand sichern und offline nutzen</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm leading-relaxed">
        <p>
          Dein Lernstand liegt nur in diesem Browser (LocalStorage). Mit der Sicherung kannst du ihn als Datei speichern und auf einem
          anderen Gerät oder nach dem Löschen der Browserdaten wiederherstellen.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={download}>
            <Download /> Sicherung herunterladen
          </Button>
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            <Upload /> Sicherung einspielen
          </Button>
          <input ref={fileRef} type="file" accept="application/json,.json" className="sr-only" aria-label="Sicherungsdatei auswählen" onChange={(e) => choose(e.target.files?.[0])} />
        </div>
        {error && (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        )}
        {pending && summary && (
          <div className="space-y-2 rounded-lg border border-warning/50 p-3">
            <p>
              Sicherung vom {pending.createdAt ? new Date(pending.createdAt).toLocaleString('de-DE') : 'unbekanntem Datum'}: {summary.questions} bearbeitete Fragen, {summary.attempts} Prüfungsversuche, {summary.cards} Lernkarten.
              <b> Der aktuelle Lernstand in diesem Browser wird ersetzt.</b>
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={restore}>
                Jetzt wiederherstellen
              </Button>
              <Button size="sm" variant="outline" onClick={() => setPending(null)}>
                Abbrechen
              </Button>
            </div>
          </div>
        )}
        <p className="flex items-start gap-2 text-muted-foreground">
          <WifiOff className="mt-0.5 size-4 shrink-0" aria-hidden />
          Nach dem ersten Laden funktioniert die App auch ohne Internet, z. B. an Bord; die Seiten werden dazu im Browser zwischengespeichert. Auf dem Handy lässt sie sich über „Zum Startbildschirm hinzufügen" installieren.
        </p>
      </CardContent>
    </Card>
  )
}
