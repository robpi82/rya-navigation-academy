import { useState } from 'react'
import { arrivalHour, formatBearing, formatNumber, sogAlongStream, streamAtHour, windOverWater, type WindTideRelation } from '@/calculations'
import { beaufortFromKnots } from '@/calculations/weather'
import { Slider } from '@/components/ui/slider'
import { CAPE_ROUTES, CAPE_SCENARIO, CAPE_STREAM_SPRINGS } from '@/data/tidalRaces'
import { cn } from '@/lib/utils'

const f1 = (n: number) => formatNumber(n, 1)
const hourLabel = (h: number) => (Math.abs(h) < 0.05 ? 'HW' : `HW${h > 0 ? '+' : '−'}${f1(Math.abs(h))}`)

function Slide({ label, value, min, max, step, v, on }: { label: string; value: string; min: number; max: number; step: number; v: number; on: (n: number) => void }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-mono">{value}</span>
      </div>
      <Slider value={[v]} min={min} max={max} step={step} onValueChange={([n]) => on(n)} aria-label={label} />
    </div>
  )
}

const RELATION: Record<WindTideRelation, string> = { against: 'Wind gegen Strom', with: 'Wind mit Strom', across: 'Wind quer zum Strom' }

/* ------------------------------------------------------------------ Wind gegen Strom */

export function WindAgainstTideWidget() {
  const [windFrom, setWindFrom] = useState(270)
  const [wind, setWind] = useState(18)
  const [set, setSet] = useState(270)
  const [rate, setRate] = useState(3)
  const r = windOverWater(windFrom, wind, set, rate)
  const bftAir = beaufortFromKnots(wind)
  const bftWater = beaufortFromKnots(r.speed)
  const tone = r.relation === 'against' && rate >= 1.5 && wind >= 12 ? 'bad' : r.relation === 'with' ? 'ok' : 'mid'
  // Skizze: Wind- und Strompfeil von der Mitte aus
  const C = 90
  const k = 2.6
  const windTo = { x: Math.sin(((windFrom + 180) * Math.PI) / 180) * wind * k, y: -Math.cos(((windFrom + 180) * Math.PI) / 180) * wind * k }
  const streamTo = { x: Math.sin((set * Math.PI) / 180) * rate * 14, y: -Math.cos((set * Math.PI) / 180) * rate * 14 }
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Seegang entsteht durch den Wind relativ zur Wasseroberfläche. Läuft der Strom gegen den Wind, weht der Wind über dem Wasser stärker – und der Strom staucht die Wellen zusätzlich: Sie werden kürzer, steiler und brechen. Läuft der Strom mit dem Wind, glättet sich die See.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slide label="Wind aus" value={formatBearing(windFrom, 0)} min={0} max={355} step={5} v={windFrom} on={setWindFrom} />
          <Slide label="Windstärke" value={`${wind} kn`} min={0} max={40} step={1} v={wind} on={setWind} />
          <Slide label="Strom setzt nach" value={formatBearing(set, 0)} min={0} max={355} step={5} v={set} on={setSet} />
          <Slide label="Stromrate" value={`${f1(rate)} kn`} min={0} max={5} step={0.5} v={rate} on={setRate} />
        </div>
        <div className="grid grid-cols-3 gap-2 text-sm">
          <div className="rounded-lg border bg-muted/50 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Wind über Grund</div>
            <div className="font-mono font-semibold">
              {wind} kn · {bftAir} Bft
            </div>
          </div>
          <div className="rounded-lg border bg-muted/50 px-3 py-2">
            <div className="text-[11px] text-muted-foreground">Wind über dem Wasser</div>
            <div className="font-mono font-semibold">
              {f1(r.speed)} kn · {bftWater} Bft
            </div>
          </div>
          <div className={cn('rounded-lg border px-3 py-2', tone === 'bad' ? 'border-destructive bg-destructive/10' : tone === 'ok' ? 'border-success bg-success/10' : 'bg-muted/50')}>
            <div className="text-[11px] text-muted-foreground">Lage</div>
            <div className="font-semibold">{RELATION[r.relation]}</div>
          </div>
        </div>
        <p className={cn('rounded-lg border p-3 text-sm', tone === 'bad' ? 'border-destructive/40 bg-destructive/5' : tone === 'ok' ? 'border-success/40 bg-success/5' : 'border-border')}>
          {tone === 'bad'
            ? 'Wind gegen Strom: Die See wird deutlich steiler, als die Windstärke vermuten lässt. Engstellen und Kaps zu dieser Zeit meiden oder auf das Stillwasser warten.'
            : r.relation === 'with'
              ? 'Wind mit Strom: Die See ist flacher und länger als bei gleichem Wind ohne Strom.'
              : 'Wenig Strom oder Wind quer zum Strom: Der Seegang entspricht etwa dem Wind – an Kaps trotzdem mit Kabbelwasser rechnen.'}
        </p>
        <p className="text-xs text-muted-foreground">Wind über dem Wasser = Windvektor − Stromvektor. Die Versteilung der Wellen durch den Gegenstrom kommt noch hinzu und ist hier nicht berechnet.</p>
      </div>
      <svg viewBox="0 0 180 180" className="h-auto w-full max-w-[220px] justify-self-center rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label={`Wind aus ${Math.round(windFrom)}°, Strom nach ${Math.round(set)}°`}>
        <defs>
          <marker id="wotWind" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0f172a" />
          </marker>
          <marker id="wotStream" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#0284c7" />
          </marker>
        </defs>
        <text x={C} y={12} fontSize={9} textAnchor="middle" fill="currentColor">N</text>
        {wind > 0 && <line x1={C - windTo.x / 2} y1={C - windTo.y / 2} x2={C + windTo.x / 2} y2={C + windTo.y / 2} stroke="#0f172a" strokeWidth={2.5} markerEnd="url(#wotWind)" />}
        {rate > 0 && <line x1={C} y1={C + 18} x2={C + streamTo.x} y2={C + 18 + streamTo.y} stroke="#0284c7" strokeWidth={3} strokeDasharray="6 3" markerEnd="url(#wotStream)" />}
        <text x={6} y={170} fontSize={9} fill="#0f172a">Wind</text>
        <text x={40} y={170} fontSize={9} fill="#0284c7">Strom</text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Kap umrunden: Zeitpunkt */

export function CapeTimingWidget() {
  const s = CAPE_SCENARIO
  const [depart, setDepart] = useState(-4)
  const arrive = arrivalHour(depart, s.distanceNm, s.stwKn)
  const stream = streamAtHour(CAPE_STREAM_SPRINGS, arrive)
  const sog = sogAlongStream(s.stwKn, stream)
  const wow = windOverWater(s.windFrom, s.windKn, 270, Math.max(0, stream))
  const outside = arrive > 6
  const verdict = outside
    ? { tone: 'mid', text: 'Ankunft nach HW+6 – außerhalb der Tabelle. Früher ablegen.' }
    : Math.abs(stream) <= 1
      ? { tone: 'ok', text: 'Stillwasser-Fenster: wenig Strom, kaum Race. Die beste Zeit, um das Kap zu runden – möglichst kurz bevor der Strom westlaufend wird.' }
      : stream > 1
        ? { tone: 'bad', text: `Strom ${f1(stream)} kn mit dir, aber gegen den Westwind: Im Race steht steile, brechende See (Wind über dem Wasser ${Math.round(wow.speed)} kn). Schnell, aber gefährlich.` }
        : { tone: 'mid', text: `Gegenstrom ${f1(-stream)} kn: ruhigere See, aber nur ${f1(sog)} kn über Grund – du kämpfst dich um das Kap.` }
  const W = 520
  const H = 180
  const x = (h: number) => 34 + ((h + 6) / 12) * (W - 68)
  const y0 = 92
  const ky = 18
  const axisLabel = (h: number) => (h === 0 ? 'HW' : `HW${h > 0 ? '+' : '−'}${Math.abs(h)}`)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Du willst nach Westen um das fiktive Kap Sturmvogel, Wind West 5 ({s.windKn} kn), Springzeit. Bis zum Kap sind es {s.distanceNm} NM bei {s.stwKn} kn Fahrt durchs Wasser. Wann legst du ab? Positive Werte: westlaufender Strom (mit dir, aber gegen den Wind).
      </p>
      <Slide label="Ablegen" value={hourLabel(depart)} min={-6} max={4} step={0.5} v={depart} on={setDepart} />
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-2xl rounded-lg border bg-card" role="img" aria-label={`Strom am Kap über die Tide, Ankunft ${hourLabel(arrive)}`}>
        <line x1={x(-6) - 14} y1={y0} x2={x(6) + 14} y2={y0} stroke="var(--border)" />
        <rect x={x(-6) - 14} y={y0 - ky} width={x(6) - x(-6) + 28} height={2 * ky} fill="var(--success)" opacity={0.12} />
        <text x={x(-6) - 14} y={y0 - ky - 3} fontSize={10} fill="currentColor" opacity={0.7}>±1 kn</text>
        {CAPE_STREAM_SPRINGS.map((v, i) => {
          const h = i - 6
          return <rect key={h} x={x(h) - 10} y={v >= 0 ? y0 - v * ky : y0} width={20} height={Math.abs(v) * ky} fill={v >= 0 ? '#e11d48' : '#0284c7'} opacity={0.75} rx={2} />
        })}
        {[-6, -3, 0, 3, 6].map((h) => (
          <text key={h} x={x(h)} y={H - 6} fontSize={11} textAnchor="middle" fill="currentColor">
            {axisLabel(h)}
          </text>
        ))}
        {!outside && <line x1={x(arrive)} y1={20} x2={x(arrive)} y2={H - 22} stroke="#0f172a" strokeWidth={2} strokeDasharray="4 3" />}
        {!outside && (
          <text x={Math.min(Math.max(x(arrive), 60), W - 60)} y={14} fontSize={11} textAnchor="middle" fill="currentColor">
            Ankunft {hourLabel(arrive)}
          </text>
        )}
        <text x={W - 8} y={36} fontSize={10} textAnchor="end" fill="#e11d48">▲ westlaufend</text>
        <text x={8} y={36} fontSize={10} fill="#0284c7">▼ ostlaufend</text>
      </svg>
      <div className="grid grid-cols-3 gap-2 text-sm">
        <div className="rounded-lg border bg-muted/50 px-3 py-2">
          <div className="text-[11px] text-muted-foreground">Ankunft am Kap</div>
          <div className="font-mono font-semibold">{hourLabel(arrive)}</div>
        </div>
        <div className="rounded-lg border bg-muted/50 px-3 py-2">
          <div className="text-[11px] text-muted-foreground">Strom am Kap</div>
          <div className="font-mono font-semibold">{outside ? '–' : `${f1(Math.abs(stream))} kn ${stream > 0.05 ? 'W' : stream < -0.05 ? 'O' : ''}`}</div>
        </div>
        <div className="rounded-lg border bg-muted/50 px-3 py-2">
          <div className="text-[11px] text-muted-foreground">Fahrt über Grund</div>
          <div className="font-mono font-semibold">{outside ? '–' : `${f1(sog)} kn`}</div>
        </div>
      </div>
      <p role="status" className={cn('rounded-lg border p-3 text-sm', verdict.tone === 'ok' ? 'border-success/40 bg-success/5' : verdict.tone === 'bad' ? 'border-destructive/40 bg-destructive/5' : 'border-amber-500/40 bg-amber-500/5')}>
        {verdict.text}
      </p>
      <p className="text-xs text-muted-foreground">Übungsdaten. In der Praxis: Gezeitenstromatlas bzw. Stromangaben der Seekarte und Revierführer, Rate zwischen Spring und Nipp interpolieren.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ Kap umrunden: Abstand */

export function CapeRouteWidget() {
  const [picked, setPicked] = useState<string | null>(null)
  const choice = CAPE_ROUTES.find((o) => o.id === picked)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Springzeit, West 5, das Race reicht laut Revierführer bis etwa 3 NM vor das Kap. Welchen Weg wählst du?</p>
      <div className="grid gap-3 sm:grid-cols-3">
        {CAPE_ROUTES.map((o) => (
          <button
            key={o.id}
            type="button"
            onClick={() => setPicked(o.id)}
            aria-pressed={picked === o.id}
            className={cn('rounded-lg border p-3 text-left text-sm transition-colors hover:bg-muted', picked === o.id && (o.correct ? 'border-success bg-success/10' : 'border-destructive bg-destructive/10'))}
          >
            <div className="font-semibold">{o.name}</div>
            <div className="text-muted-foreground">{o.detail}</div>
          </button>
        ))}
      </div>
      {choice && <p className={cn('rounded-lg border p-3 text-sm', choice.correct ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>{choice.feedback}</p>}
    </div>
  )
}
