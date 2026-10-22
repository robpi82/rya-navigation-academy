import type { ReactNode } from 'react'
import { ChevronRight, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Halbtransparente Fläche im Marine-Look */
export function Panel({ className, children }: { className?: string; children: ReactNode }) {
  return <section className={cn('relative overflow-hidden rounded-xl border bg-card shadow-lg shadow-black/20 backdrop-blur-sm', className)}>{children}</section>
}

export function PanelTitle({ icon: Icon, children, aside }: { icon?: LucideIcon; children: ReactNode; aside?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 font-display text-xl font-semibold text-white">
        {Icon && <Icon className="size-5 text-gold" aria-hidden />}
        {children}
      </h3>
      {aside}
    </div>
  )
}

export function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="font-display text-2xl font-semibold text-white">{children}</h2>
}

/** Foto als Hintergrund; ohne Foto ein Farbverlauf. Das Bild ist rein dekorativ. */
export function PhotoBackdrop({ src, fallback, className }: { src?: string; fallback: string; className?: string }) {
  return src ? (
    <img src={src} alt="" aria-hidden className={cn('absolute inset-0 size-full object-cover transition-transform duration-500 group-hover:scale-[1.03]', className)} />
  ) : (
    <div aria-hidden className={cn('absolute inset-0', fallback, className)} />
  )
}

export function ChevronBadge() {
  return (
    <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/35 text-white transition-transform group-hover:translate-x-0.5">
      <ChevronRight className="size-5" />
    </span>
  )
}

export function ProgressRing({ value, label }: { value: number; label: string }) {
  const r = 20
  const c = 2 * Math.PI * r
  return (
    <div role="img" aria-label={label} title={label} className="relative size-14 shrink-0">
      <svg viewBox="0 0 48 48" className="size-full -rotate-90">
        <circle cx="24" cy="24" r={r} fill="oklch(0.15 0.03 255 / 0.7)" stroke="rgb(255 255 255 / 0.15)" strokeWidth="4" />
        <circle cx="24" cy="24" r={r} fill="none" stroke="#38bdf8" strokeWidth="4" strokeLinecap="round" strokeDasharray={`${(c * value) / 100} ${c}`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-white tabular-nums">{value} %</span>
    </div>
  )
}

export interface CourseCardProps {
  title: string
  subtitle: string
  href: string
  progress: number
  progressNote: string
  lessonsDone: number
  lessonsTotal: number
  image?: string
  fallback: string
}

export function CourseCard({ title, subtitle, href, progress, progressNote, lessonsDone, lessonsTotal, image, fallback }: CourseCardProps) {
  const lessonShare = Math.round((lessonsDone / Math.max(1, lessonsTotal)) * 100)
  return (
    <a
      href={href}
      className="group relative flex min-h-60 flex-col justify-end overflow-hidden rounded-xl border border-white/15 shadow-lg shadow-black/30 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-h-64"
    >
      <PhotoBackdrop src={image} fallback={fallback} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-b from-transparent via-[oklch(0.16_0.035_255/0.55)] to-[oklch(0.15_0.035_255/0.96)]" />
      <div className="relative space-y-3 p-5">
        <div className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-2xl leading-tight font-semibold text-white">{title}</h3>
            <p className="text-sm text-white/75">{subtitle}</p>
          </div>
          <ProgressRing value={progress} label={`Kursfortschritt ${title}: ${progress} % (${progressNote})`} />
        </div>
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-1.5 overflow-hidden rounded-full bg-white/15" aria-hidden>
              <div className="h-full rounded-full bg-sky-400" style={{ width: `${lessonShare}%` }} />
            </div>
            <p className="text-xs text-white/80">
              {lessonsDone} von {lessonsTotal} Lektionen abgeschlossen
            </p>
          </div>
          <ChevronBadge />
        </div>
      </div>
    </a>
  )
}

export interface QuickLinkProps {
  href: string
  icon: LucideIcon
  iconClassName: string
  title: string
  text: string
  image?: string
  fallback: string
}

export function QuickLink({ href, icon: Icon, iconClassName, title, text, image, fallback }: QuickLinkProps) {
  return (
    <a
      href={href}
      className="group relative flex min-h-36 overflow-hidden rounded-xl border border-white/15 shadow-lg shadow-black/25 transition-transform hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
    >
      <PhotoBackdrop src={image} fallback={fallback} />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-[oklch(0.17_0.04_255/0.97)] via-[oklch(0.17_0.04_255/0.8)] to-[oklch(0.17_0.04_255/0.25)]" />
      <div className="relative flex w-full items-end justify-between gap-3 p-4">
        <div className="min-w-0">
          <span className={cn('mb-3 flex size-11 items-center justify-center rounded-full', iconClassName)} aria-hidden>
            <Icon className="size-5" />
          </span>
          <h3 className="font-display text-lg leading-tight font-semibold text-white">{title}</h3>
          <p className="mt-0.5 text-sm leading-snug text-white/75">{text}</p>
        </div>
        <ChevronBadge />
      </div>
    </a>
  )
}

export function StatCard({
  icon: Icon,
  iconClassName,
  value,
  unit,
  label,
  sub,
  trend,
}: {
  icon: LucideIcon
  iconClassName: string
  value: string
  unit?: string
  label: string
  sub: string
  trend?: { icon: LucideIcon; text: string; className: string }
}) {
  const TrendIcon = trend?.icon
  return (
    <Panel className="flex items-center gap-4 p-4">
      <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-full', iconClassName)} aria-hidden>
        <Icon className="size-6" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-3xl leading-none font-semibold text-white tabular-nums">
          {value}
          {unit && <span className="ml-1 text-lg font-normal text-white/80">{unit}</span>}
        </p>
        <p className="mt-1 text-sm text-white/80">{label}</p>
        <p className="text-xs text-muted-foreground">{sub}</p>
        {trend && TrendIcon && (
          <p className={cn('mt-1 flex items-center gap-1 text-xs', trend.className)}>
            <TrendIcon className="size-3.5" aria-hidden /> {trend.text}
          </p>
        )}
      </div>
    </Panel>
  )
}

export function EmptyChart({ text }: { text: string }) {
  return <div className="flex h-full items-center justify-center rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</div>
}
