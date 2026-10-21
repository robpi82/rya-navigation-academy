import { CheckCircle2, CircleDashed, CircleSlash } from 'lucide-react'
import { PageHeader } from '@/components/layout/PageHeader'
import { PrintButton } from '@/components/PrintButton'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { STATUS_LABEL, SYLLABUS, type CoverageStatus } from '@/data/syllabus'
import { QUESTION_BANK } from '@/questions'
import { cn } from '@/lib/utils'

const ICON: Record<CoverageStatus, { Icon: typeof CheckCircle2; cls: string; variant: 'success' | 'default' | 'destructive' }> = {
  covered: { Icon: CheckCircle2, cls: 'text-success', variant: 'success' },
  partial: { Icon: CircleDashed, cls: 'text-amber-500', variant: 'default' },
  none: { Icon: CircleSlash, cls: 'text-destructive', variant: 'destructive' },
}

const questionCount = (topics: string[]) => QUESTION_BANK.filter((q) => topics.includes(q.topic)).length

export function SyllabusPage() {
  const all = SYLLABUS.flatMap((l) => l.areas)
  const count = (s: CoverageStatus) => all.filter((a) => a.status === s).length
  return (
    <div className="space-y-6">
      <PageHeader
        title="Syllabus-Abdeckung"
        subtitle="Welche Themenbereiche der RYA-Theoriekurse deckt die App ab – und wo sind Lücken? Eigenständig und sinngemäß zusammengestellt, als Orientierung ohne Gewähr; maßgeblich ist der aktuelle RYA-Syllabus."
        actions={<PrintButton />}
      />
      <div className="grid grid-cols-3 gap-3 sm:max-w-xl">
        {(['covered', 'partial', 'none'] as const).map((s) => {
          const { Icon, cls } = ICON[s]
          return (
            <Card key={s}>
              <CardContent className="flex items-center gap-2 pt-5">
                <Icon className={cn('size-5 shrink-0', cls)} />
                <div>
                  <div className="text-xl font-bold tabular-nums">{count(s)}</div>
                  <div className="text-xs text-muted-foreground">{STATUS_LABEL[s]}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
      {SYLLABUS.map((lv) => (
        <Card key={lv.level} className="print:break-inside-auto print:shadow-none">
          <CardHeader>
            <CardTitle>{lv.title}</CardTitle>
            <CardDescription>
              {lv.level === 'yachtmaster-offshore'
                ? 'Beim RYA ein eigener Kurs nach dem Yachtmaster Offshore. In der App liegen diese Themen unter „Yachtmaster“.'
                : lv.level === 'coastal-skipper'
                  ? 'Beim RYA ein gemeinsamer Theoriekurs. In der App verteilt auf Coastal Skipper und die ersten Yachtmaster-Lektionen.'
                  : 'Grundlagenkurs für Tagesfahrten in bekannten Gewässern.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="divide-y">
              {lv.areas.map((a) => {
                const { Icon, cls, variant } = ICON[a.status]
                const n = questionCount(a.topics)
                return (
                  <li key={a.id} className="grid gap-2 py-3 break-inside-avoid sm:grid-cols-[minmax(0,1fr)_auto]">
                    <div className="flex min-w-0 items-start gap-2">
                      <Icon className={cn('mt-0.5 size-5 shrink-0', cls)} aria-hidden />
                      <div className="min-w-0 space-y-1">
                        <p className="font-medium">{a.title}</p>
                        {a.note && <p className="text-sm text-muted-foreground">{a.note}</p>}
                        {a.links.length > 0 && (
                          <p className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                            {a.links.map((l) => (
                              <a key={l.href + l.label} href={l.href} className="text-primary hover:underline print:text-foreground print:no-underline">
                                {l.label}
                              </a>
                            ))}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 pl-7 sm:pl-0">
                      {n > 0 && <span className="text-xs text-muted-foreground tabular-nums">{n} Fragen</span>}
                      <Badge variant={variant}>{STATUS_LABEL[a.status]}</Badge>
                    </div>
                  </li>
                )
              })}
            </ul>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
