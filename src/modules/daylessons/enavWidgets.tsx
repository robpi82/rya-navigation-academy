import { useMemo, useState } from 'react'
import { AlertTriangle, ArrowLeft, ArrowRight, CheckCircle2, Crosshair, Flag, MapPin } from 'lucide-react'
import {
  actualDepth,
  collisionRisk,
  cpa,
  formatBearing,
  formatDuration,
  formatNumber,
  fromPolar,
  rhumbDestination,
  rhumbLine,
  steerAdvice,
  trackInfo,
  underKeelClearance,
  vmg,
  waterDepth,
  type SounderReference,
} from '@/calculations'
import { formatLat, formatLon, SeaChart, type ChartOverlay } from '@/components/chart/SeaChart'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MARK_BY_ID } from '@/data/chartArea'
import { snapToMark } from '@/modules/chart/PlotTool'
import { NumberField, Toggle, fieldsValid, useNumberField } from '@/modules/calculators/fields'
import type { LatLon } from '@/types/navigation'

const f1 = (n: number) => formatNumber(n, 1)
const f2 = (n: number) => formatNumber(n, 2)

function Out({ label, value, highlight, sub }: { label: string; value: string; highlight?: boolean; sub?: string }) {
  return (
    <div className={cn('rounded-lg p-2.5', highlight ? 'bg-primary/10 ring-1 ring-primary/40' : 'bg-muted/60')}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={cn('font-mono font-semibold tabular-nums', highlight && 'text-primary')}>{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground">{sub}</div>}
    </div>
  )
}

/* ------------------------------------------------------------------ Plotter: Route, XTE, BTW, DTW, VMG */

type Pick = 'a' | 'b' | 'boat'

export function PlotterWidget() {
  const [a, setA] = useState<LatLon>(MARK_BY_ID['by-anst'].pos)
  const [b, setB] = useState<LatLon>(MARK_BY_ID['by-riff'].pos)
  const [boat, setBoat] = useState<LatLon>(() => {
    const leg = rhumbLine(MARK_BY_ID['by-anst'].pos, MARK_BY_ID['by-riff'].pos)
    return rhumbDestination(rhumbDestination(MARK_BY_ID['by-anst'].pos, leg.bearing!, leg.distance * 0.35), (leg.bearing! + 90) % 360, 0.8)
  })
  const [pick, setPick] = useState<Pick>('boat')
  const sog = useNumberField('5.5', { min: 0, max: 40 })
  const cog = useNumberField('120', { min: 0, max: 360, bearing: true })
  const valid = fieldsValid(sog, cog)
  const info = trackInfo(a, b, boat)
  const advice = steerAdvice(info.xte)
  const speedToWp = valid && info.btw !== null ? vmg(sog.value!, cog.value!, info.btw) : null
  const ttg = speedToWp !== null && speedToWp > 0.05 ? info.dtw / speedToWp : null

  const foot = info.trackBearing !== null ? rhumbDestination(a, info.trackBearing, info.alongTrack) : a
  const overlays: ChartOverlay[] = [
    { kind: 'line', id: 'route', from: a, to: b, color: 'var(--vec-ground)', chevrons: 2, label: 'Route' },
    { kind: 'point', id: 'a', pos: a, symbol: 'wp', label: 'WP 1', color: 'var(--foreground)' },
    { kind: 'point', id: 'b', pos: b, symbol: 'wp', label: 'WP 2', color: 'var(--foreground)' },
    { kind: 'line', id: 'xte', from: boat, to: foot, color: 'var(--destructive)', dashed: true, label: `XTE ${f2(Math.abs(info.xte))} NM` },
    { kind: 'point', id: 'boat', pos: boat, symbol: 'fix', label: 'Boot', color: 'var(--vec-water)' },
  ]
  const onClick = (raw: LatLon) => {
    if (pick === 'boat') setBoat(raw)
    else {
      const s = snapToMark(raw).pos
      if (pick === 'a') setA(s)
      else setB(s)
    }
  }
  const tools: { id: Pick; label: string; icon: typeof MapPin }[] = [
    { id: 'a', label: 'Start-Wegpunkt', icon: MapPin },
    { id: 'b', label: 'Ziel-Wegpunkt', icon: Flag },
    { id: 'boat', label: 'Bootsposition', icon: Crosshair },
  ]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        So rechnet ein Kartenplotter: Aus Position, Route und GPS-Werten entstehen <b>XTE</b> (seitlicher Abstand zur Routenlinie), <b>BTW</b> (Peilung zum Wegpunkt), <b>DTW</b> (Distanz zum Wegpunkt) und <b>VMG</b> (Fahrt in Richtung Wegpunkt).
      </p>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Punkt setzen">
        {tools.map((t) => (
          <Button key={t.id} size="sm" variant={pick === t.id ? 'default' : 'outline'} aria-pressed={pick === t.id} onClick={() => setPick(t.id)}>
            <t.icon /> {t.label}
          </Button>
        ))}
      </div>
      <SeaChart overlays={overlays} onMapClick={onClick} cursor="crosshair" className="h-[52vh]" />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Out label="XTE" value={`${f2(Math.abs(info.xte))} NM`} highlight sub={advice === 'on-track' ? 'auf der Linie' : info.xte > 0 ? 'rechts der Linie' : 'links der Linie'} />
            <Out label="BTW" value={formatBearing(info.btw)} sub="Peilung zum WP 2" />
            <Out label="DTW" value={`${f2(info.dtw)} NM`} sub="Distanz zum WP 2" />
            <Out label="VMG" value={speedToWp === null ? '–' : `${f1(speedToWp)} kn`} sub={ttg === null ? 'kein Fortschritt' : `Restzeit ${formatDuration(ttg)}`} />
          </div>
          <div className={cn('flex items-center gap-2 rounded-lg p-3 text-sm', advice === 'on-track' ? 'bg-success/10 text-success' : 'bg-warning/10')} role="status">
            {advice === 'on-track' ? <CheckCircle2 className="size-4" /> : advice === 'steer-left' ? <ArrowLeft className="size-4" /> : <ArrowRight className="size-4" />}
            {advice === 'on-track' ? 'Du bist praktisch auf der Linie.' : advice === 'steer-left' ? 'Zurück auf die Linie: nach links (Backbord) steuern.' : 'Zurück auf die Linie: nach rechts (Steuerbord) steuern.'}
          </div>
          <p className="font-mono text-xs text-muted-foreground">
            Boot: {formatLat(boat.lat, 2)} {formatLon(boat.lon, 2)}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <NumberField label="SOG" unit="kn" field={sog} />
          <NumberField label="COG" unit="°" field={cog} />
          <p className="col-span-2 text-xs text-muted-foreground">VMG = SOG · cos(COG − BTW). Fährst du genau auf den Wegpunkt zu, ist VMG = SOG; fährst du quer dazu, ist VMG = 0.</p>
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ AIS / Radar: CPA und TCPA */

const RISK_TEXT = {
  none: { text: 'Kein Risiko: Ziel passiert in sicherem Abstand oder entfernt sich.', tone: 'bg-success/10 text-success' },
  watch: { text: 'Beobachten: Der Abstand ist knapp, aber noch über der Alarmgrenze.', tone: 'bg-muted' },
  warning: { text: 'Warnung: Der Abstand unterschreitet die Alarmgrenze – aber es ist noch Zeit. Früh handeln.', tone: 'bg-warning/10' },
  danger: { text: 'Gefahr: Abstand zu gering und Zeit knapp. Jetzt früh und deutlich ausweichen (Rule 8).', tone: 'bg-destructive/10 text-destructive' },
} as const

export function CpaWidget() {
  const ownCourse = useNumberField('000', { min: 0, max: 360, bearing: true })
  const ownSpeed = useNumberField('6', { min: 0, max: 40 })
  const brg = useNumberField('040', { min: 0, max: 360, bearing: true })
  const dist = useNumberField('4', { min: 0.1, max: 20 })
  const tCourse = useNumberField('260', { min: 0, max: 360, bearing: true })
  const tSpeed = useNumberField('8', { min: 0, max: 40 })
  const cpaLimit = useNumberField('0.5', { min: 0.1, max: 3 })
  const tcpaLimit = useNumberField('12', { min: 1, max: 60 })
  const valid = fieldsValid(ownCourse, ownSpeed, brg, dist, tCourse, tSpeed, cpaLimit, tcpaLimit)

  const calc = useMemo(() => {
    if (!valid) return null
    const own = { pos: { x: 0, y: 0 }, course: ownCourse.value!, speed: ownSpeed.value! }
    const target = { pos: fromPolar(dist.value!, brg.value!), course: tCourse.value!, speed: tSpeed.value! }
    const r = cpa(own, target)
    return { own, target, r, risk: collisionRisk(r, cpaLimit.value!, tcpaLimit.value!) }
  }, [valid, ownCourse.value, ownSpeed.value, brg.value, dist.value, tCourse.value, tSpeed.value, cpaLimit.value, tcpaLimit.value])

  const W = 340
  const H = 300
  let svg = null
  if (calc) {
    const { own, target, r } = calc
    const extent = Math.max(dist.value!, 1) * 1.35
    const s = (Math.min(W, H) / 2 - 20) / extent
    const px = (p: { x: number; y: number }) => ({ x: W / 2 + p.x * s, y: H / 2 - p.y * s })
    const t = r.tcpaMinutes !== null ? r.tcpaMinutes / 60 : 0
    const vo = fromPolar(own.speed, own.course)
    const vt = fromPolar(target.speed, target.course)
    const ownAt = { x: vo.x * t, y: vo.y * t }
    const tgtAt = { x: target.pos.x + vt.x * t, y: target.pos.y + vt.y * t }
    const o = px(own.pos)
    const tp = px(target.pos)
    svg = (
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Lage von eigenem Schiff und Ziel">
        {[1, 2, 3].map((k) => (
          <circle key={k} cx={W / 2} cy={H / 2} r={(extent / 3) * k * s} fill="none" stroke="var(--chart-grid)" />
        ))}
        <line x1={o.x} y1={o.y} x2={px({ x: vo.x * 0.5, y: vo.y * 0.5 }).x} y2={px({ x: vo.x * 0.5, y: vo.y * 0.5 }).y} stroke="var(--vec-water)" strokeWidth={3} />
        <line x1={tp.x} y1={tp.y} x2={px({ x: target.pos.x + vt.x * 0.5, y: target.pos.y + vt.y * 0.5 }).x} y2={px({ x: target.pos.x + vt.x * 0.5, y: target.pos.y + vt.y * 0.5 }).y} stroke="var(--vec-ground)" strokeWidth={3} />
        <circle cx={o.x} cy={o.y} r={6} fill="var(--vec-water)" />
        <circle cx={tp.x} cy={tp.y} r={6} fill="var(--vec-ground)" />
        {r.closing && (
          <>
            <circle cx={px(ownAt).x} cy={px(ownAt).y} r={5} fill="none" stroke="var(--vec-water)" strokeWidth={2} />
            <circle cx={px(tgtAt).x} cy={px(tgtAt).y} r={5} fill="none" stroke="var(--vec-ground)" strokeWidth={2} />
            <line x1={px(ownAt).x} y1={px(ownAt).y} x2={px(tgtAt).x} y2={px(tgtAt).y} stroke="var(--destructive)" strokeWidth={2} strokeDasharray="3 3" />
          </>
        )}
        <text x={o.x + 9} y={o.y + 16} fontSize={11} fontWeight={700} fill="var(--vec-water)">Du</text>
        <text x={tp.x + 9} y={tp.y - 8} fontSize={11} fontWeight={700} fill="var(--vec-ground)">Ziel</text>
        <text x={10} y={H - 10} fontSize={10} fill="var(--muted-foreground)">Kreise: je {f1(extent / 3)} NM · Kreis = Position bei CPA</text>
      </svg>
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        AIS und Radar berechnen aus der Relativbewegung zweier Schiffe den <b>CPA</b> (kleinster Abstand) und die <b>TCPA</b> (Zeit bis dorthin). Bei konstantem Kurs und konstanter Fahrt ändert sich die Peilung nicht – das ist das Kennzeichen für Kollisionsgefahr (Rule 7).
      </p>
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <fieldset className="space-y-2 rounded-lg border p-3">
              <legend className="px-1 text-sm font-semibold text-[var(--vec-water)]">Eigenes Schiff</legend>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Kurs" unit="°" field={ownCourse} />
                <NumberField label="Fahrt" unit="kn" field={ownSpeed} />
              </div>
            </fieldset>
            <fieldset className="space-y-2 rounded-lg border p-3">
              <legend className="px-1 text-sm font-semibold text-[var(--vec-ground)]">Ziel (AIS/Radar)</legend>
              <div className="grid grid-cols-2 gap-2">
                <NumberField label="Peilung" hint="rechtweisend" unit="°" field={brg} />
                <NumberField label="Abstand" unit="NM" field={dist} />
                <NumberField label="Kurs" unit="°" field={tCourse} />
                <NumberField label="Fahrt" unit="kn" field={tSpeed} />
              </div>
            </fieldset>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:max-w-sm">
            <NumberField label="Alarm CPA" unit="NM" field={cpaLimit} />
            <NumberField label="Alarm TCPA" unit="min" field={tcpaLimit} />
          </div>
          {calc && (
            <>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                <Out label="CPA" value={`${f2(calc.r.cpa)} NM`} highlight />
                <Out label="TCPA" value={calc.r.tcpaMinutes === null ? '–' : `${f1(calc.r.tcpaMinutes)} min`} sub={calc.r.closing ? 'Annäherung' : 'entfernt sich / parallel'} />
                <Out label="Abstand jetzt" value={`${f2(calc.r.currentDistance)} NM`} />
              </div>
              <div className={cn('flex items-start gap-2 rounded-lg p-3 text-sm', RISK_TEXT[calc.risk].tone)} role="status">
                {calc.risk === 'none' ? <CheckCircle2 className="mt-0.5 size-4 shrink-0" /> : <AlertTriangle className="mt-0.5 size-4 shrink-0" />}
                {RISK_TEXT[calc.risk].text}
              </div>
            </>
          )}
        </div>
        {svg}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ Echolot */

export function EchoSounderWidget() {
  const [ref, setRef] = useState<SounderReference>('transducer')
  const shown = useNumberField('3.2', { min: 0, max: 200 })
  const transducer = useNumberField('0.4', { min: 0, max: 3 })
  const draught = useNumberField('1.7', { min: 0.1, max: 6 })
  const charted = useNumberField('2.4', { min: -5, max: 100, optional: true })
  const hot = useNumberField('1.5', { min: -1, max: 15, optional: true })
  const valid = fieldsValid(shown, transducer, draught, charted, hot)
  const depth = valid ? actualDepth(shown.value!, ref, transducer.value!, draught.value!) : 0
  const ukc = valid ? underKeelClearance(depth, draught.value!) : 0
  const expected = valid && charted.value !== null && hot.value !== null ? waterDepth(charted.value, hot.value) : null
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Das Echolot misst vom Geber aus. Je nach Einstellung zeigt die Anzeige die Tiefe <b>unter dem Geber</b>, <b>unter dem Kiel</b> oder <b>unter der Wasserlinie</b>. Wer den Bezug nicht kennt, verschätzt sich um Tiefgang oder Geberabstand!
      </p>
      <Toggle
        label="Bezug der Anzeige"
        value={ref}
        onChange={setRef}
        options={[
          { value: 'transducer', label: 'unter Geber' },
          { value: 'keel', label: 'unter Kiel' },
          { value: 'waterline', label: 'unter Wasserlinie' },
        ]}
      />
      <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <NumberField label="Angezeigte Tiefe" unit="m" field={shown} />
        <NumberField label="Geber unter Wasserlinie" unit="m" field={transducer} />
        <NumberField label="Tiefgang" unit="m" field={draught} />
        <NumberField label="Kartentiefe (Vergleich)" unit="m" field={charted} />
        <NumberField label="Höhe der Gezeit" unit="m" field={hot} />
      </div>
      {valid && (
        <div className="grid gap-2 sm:grid-cols-4">
          <Out label="Wassertiefe (ab Wasserlinie)" value={`${f2(depth)} m`} highlight />
          <Out label="Wasser unter dem Kiel" value={`${f2(ukc)} m`} sub={ukc < 0.5 ? 'sehr knapp!' : undefined} />
          {expected !== null && <Out label="Erwartet nach Karte + Gezeit" value={`${f2(expected)} m`} sub={Math.abs(expected - depth) > 0.5 ? `Abweichung ${f2(depth - expected)} m – prüfen!` : 'passt zur Karte'} />}
        </div>
      )}
      <p className="text-xs text-muted-foreground">Das Echolot ersetzt nicht den Blick in die Karte: Bei Abweichungen zur erwarteten Tiefe (Karte + Höhe der Gezeit) stimmt entweder die Einstellung, die Tidenrechnung oder die Position nicht.</p>
    </div>
  )
}
