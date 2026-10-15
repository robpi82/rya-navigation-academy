import { useState } from 'react'
import { Ban } from 'lucide-react'
import {
  computeEta,
  computeVelocityTriangle,
  courseToSteer,
  direction,
  formatBearing,
  formatDuration,
  formatLatLon,
  formatNumber,
  fromPolar,
  interpolateTidalRate,
  magnitude,
  offsetPosition,
  parseClock,
  scaleVector,
  speedFrom,
  timeFrom,
} from '@/calculations'
import { fieldsValid, NumberField, ResultPanel, ResultValue, Toggle, useNumberField } from './fields'

const n1 = (v: number) => formatNumber(v, 1)
const n2 = (v: number) => formatNumber(v, 2)
const n3 = (v: number) => formatNumber(v, 3)
const BEARING = { min: 0, max: 360, bearing: true }
const SPEED = { min: 0, max: 40 }
const RATE = { min: 0, max: 10 }
const LEEWAY = { min: -30, max: 30 }

const grid = 'grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 [&>*]:flex [&>*]:h-full [&>*]:flex-col [&>*]:justify-end'

/* ---------------------------------------------------------------- 1. Distance, Speed, Time */

export function DstCalculator() {
  const [unknown, setUnknown] = useState<'distance' | 'speed' | 'time'>('time')
  const dist = useNumberField('12', { min: 0, max: 10000 })
  const speed = useNumberField('5', { min: 0, max: 40 })
  const hours = useNumberField('2', { min: 0, max: 999, integer: true })
  const minutes = useNumberField('30', { min: 0, max: 59, integer: true })

  const needs = { distance: [speed, hours, minutes], speed: [dist, hours, minutes], time: [dist, speed] }[unknown]
  const valid = fieldsValid(...needs)
  const t = (hours.value ?? 0) + (minutes.value ?? 0) / 60

  let result: { label: string; value: string } | null = null
  let steps: string[] = []
  let warning: string | null = null
  if (valid) {
    if (unknown === 'distance') {
      const d = speed.value! * t
      result = { label: 'Distanz', value: `${n2(d)} NM` }
      steps = [`Zeit = ${hours.value} h + ${minutes.value} min / 60 = ${n3(t)} h`, `Distanz = Geschwindigkeit × Zeit = ${n1(speed.value!)} kn × ${n3(t)} h = ${n2(d)} NM`]
    } else if (unknown === 'speed') {
      const s = speedFrom(dist.value!, t)
      if (s === null) warning = 'Die Zeit muss größer als 0 sein.'
      else {
        result = { label: 'Geschwindigkeit', value: `${n2(s)} kn` }
        steps = [`Zeit = ${n3(t)} h`, `Geschwindigkeit = Distanz / Zeit = ${n2(dist.value!)} NM / ${n3(t)} h = ${n2(s)} kn`]
      }
    } else {
      const h = timeFrom(dist.value!, speed.value!)
      if (h === null) warning = 'Bei 0 kn wird das Ziel nie erreicht.'
      else {
        result = { label: 'Zeit', value: formatDuration(h) }
        steps = [`Zeit = Distanz / Geschwindigkeit = ${n2(dist.value!)} NM / ${n1(speed.value!)} kn = ${n3(h)} h`, `${n3(h)} h = ${Math.floor(h)} h + ${n1((h % 1) * 60)} min ≈ ${formatDuration(h)}`]
      }
    }
  }

  return (
    <div className="space-y-5">
      <Toggle
        label="Gesuchte Größe"
        value={unknown}
        onChange={setUnknown}
        options={[
          { value: 'time', label: 'Zeit gesucht' },
          { value: 'distance', label: 'Distanz gesucht' },
          { value: 'speed', label: 'Geschwindigkeit gesucht' },
        ]}
      />
      <div className={grid}>
        {unknown !== 'distance' && <NumberField label="Distanz" unit="NM" field={dist} />}
        {unknown !== 'speed' && <NumberField label="Geschwindigkeit" unit="kn" field={speed} />}
        {unknown !== 'time' && (
          <div className="grid grid-cols-2 gap-2">
            <NumberField label="Stunden" unit="h" field={hours} />
            <NumberField label="Minuten" unit="min" field={minutes} />
          </div>
        )}
      </div>
      {warning ? <Warning text={warning} /> : (
        <ResultPanel valid={valid && !!result} steps={steps}>
          {result && <ResultValue label={result.label} value={result.value} highlight />}
        </ResultPanel>
      )}
      <p className="text-xs text-muted-foreground">Merkhilfe: 60 D = S × T (Distanz in NM, Speed in kn, Time in Minuten).</p>
    </div>
  )
}

/* ---------------------------------------------------------------- 2. ETA */

export function EtaCalculator() {
  const [dep, setDep] = useState('09:30')
  const dist = useNumberField('18', { min: 0, max: 10000 })
  const sog = useNumberField('4.5', SPEED)
  const depMin = parseClock(dep)
  const valid = depMin !== null && fieldsValid(dist, sog)
  const eta = valid ? computeEta(depMin!, dist.value!, sog.value!) : null

  return (
    <div className="space-y-5">
      <div className={grid}>
        <div className="space-y-1">
          <label htmlFor="eta-dep" className="block text-sm font-medium">
            Abfahrtszeit
            <span className="block text-xs font-normal text-muted-foreground">Format HH:MM</span>
          </label>
          <input
            id="eta-dep"
            value={dep}
            onChange={(e) => setDep(e.target.value)}
            className="h-10 w-full rounded-md border bg-background px-3 font-mono focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-none"
            aria-invalid={depMin === null}
          />
          {depMin === null && <p className="text-xs text-destructive">Bitte Uhrzeit wie 09:30 eingeben</p>}
        </div>
        <NumberField label="Distanz über Grund" unit="NM" field={dist} />
        <NumberField label="Speed Over Ground" hint="SOG – nicht STW!" unit="kn" field={sog} />
      </div>
      {valid && eta === null ? (
        <Warning text="Bei SOG 0 kn gibt es keine Ankunftszeit." />
      ) : (
        <ResultPanel
          valid={valid}
          steps={
            eta
              ? [
                  `Fahrtdauer = ${n2(dist.value!)} NM / ${n2(sog.value!)} kn = ${n3(eta.hours)} h ≈ ${formatDuration(eta.hours)}`,
                  `ETA = ${dep} + ${formatDuration(eta.hours)} = ${eta.time}${eta.dayOffset ? ` (+${eta.dayOffset} Tag)` : ''}`,
                  'Für die ETA zählt die Fahrt über Grund – Strom ändert die SOG unterwegs, plane mit dem Mittelwert.',
                ]
              : []
          }
        >
          {eta && (
            <>
              <ResultValue label="ETA" value={eta.time} highlight sub={eta.dayOffset ? `+${eta.dayOffset} Tag` : 'am selben Tag'} />
              <ResultValue label="Fahrtdauer" value={formatDuration(eta.hours)} />
            </>
          )}
        </ResultPanel>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- 3./4. COG & SOG (Vektor) */

function useTriangleFields() {
  return {
    hdg: useNumberField('0', BEARING),
    stw: useNumberField('5', SPEED),
    leeway: useNumberField('0', LEEWAY),
    set: useNumberField('90', BEARING),
    rate: useNumberField('2', RATE),
  }
}

function TriangleInputs({ f }: { f: ReturnType<typeof useTriangleFields> }) {
  return (
    <div className={grid}>
      <NumberField label="Heading" hint="Steuerkurs, °T" unit="°" field={f.hdg} />
      <NumberField label="STW" hint="Fahrt durchs Wasser" unit="kn" field={f.stw} />
      <NumberField label="Leeway" hint="+ Steuerbord / − Backbord" unit="°" field={f.leeway} />
      <NumberField label="Strom: Set" hint="wohin der Strom setzt" unit="°" field={f.set} />
      <NumberField label="Strom: Rate" unit="kn" field={f.rate} />
    </div>
  )
}

function triangleSteps(f: ReturnType<typeof useTriangleFields>) {
  const tri = computeVelocityTriangle({ heading: f.hdg.value!, stw: f.stw.value!, leeway: f.leeway.value!, tideDirection: f.set.value!, tideRate: f.rate.value! })
  const steps = [
    `Water Track = HDG + Leeway = ${f.hdg.value}° ${f.leeway.value! >= 0 ? '+' : '−'} ${Math.abs(f.leeway.value!)}° = ${formatBearing(tri.waterTrack)}`,
    `Wasser: x = ${n1(f.stw.value!)} · sin ${n1(tri.waterTrack)}° = ${n3(tri.waterVelocity.x)}, y = ${n1(f.stw.value!)} · cos ${n1(tri.waterTrack)}° = ${n3(tri.waterVelocity.y)}`,
    `Strom: x = ${n1(f.rate.value!)} · sin ${f.set.value}° = ${n3(tri.tideVelocity.x)}, y = ${n1(f.rate.value!)} · cos ${f.set.value}° = ${n3(tri.tideVelocity.y)}`,
    `Über Grund: x = ${n3(tri.groundVelocity.x)}, y = ${n3(tri.groundVelocity.y)}`,
  ]
  return { tri, steps }
}

export function CogCalculator() {
  const f = useTriangleFields()
  const valid = fieldsValid(...Object.values(f))
  const r = valid ? triangleSteps(f) : null
  return (
    <div className="space-y-5">
      <TriangleInputs f={f} />
      <ResultPanel
        valid={valid}
        steps={r ? [...r.steps, r.tri.cog === null ? 'SOG = 0 → der Vektor hat keine Richtung, COG ist nicht definiert.' : `COG = atan2(x, y) = ${formatBearing(r.tri.cog)}`] : []}
      >
        {r && (
          <>
            <ResultValue label="COG" value={formatBearing(r.tri.cog)} highlight sub={r.tri.cog === null ? 'nicht definiert (SOG = 0)' : undefined} />
            <ResultValue label="Water Track" value={formatBearing(r.tri.waterTrack)} />
            <ResultValue label="SOG" value={`${n2(r.tri.sog)} kn`} />
          </>
        )}
      </ResultPanel>
    </div>
  )
}

export function SogCalculator() {
  const [mode, setMode] = useState<'vector' | 'track'>('vector')
  const f = useTriangleFields()
  const dist = useNumberField('7.5', { min: 0, max: 10000 })
  const mins = useNumberField('75', { min: 0, max: 100000 })
  const validV = fieldsValid(...Object.values(f))
  const validT = fieldsValid(dist, mins)
  const r = mode === 'vector' && validV ? triangleSteps(f) : null
  const sogT = mode === 'track' && validT ? speedFrom(dist.value!, mins.value! / 60) : null

  return (
    <div className="space-y-5">
      <Toggle
        label="Methode"
        value={mode}
        onChange={setMode}
        options={[
          { value: 'vector', label: 'Aus Stromdreieck' },
          { value: 'track', label: 'Aus zwei Fixes' },
        ]}
      />
      {mode === 'vector' ? (
        <>
          <TriangleInputs f={f} />
          <ResultPanel valid={validV} steps={r ? [...r.steps, `SOG = √(x² + y²) = ${n3(r.tri.sog)} kn`] : []}>
            {r && (
              <>
                <ResultValue label="SOG" value={`${n2(r.tri.sog)} kn`} highlight />
                <ResultValue label="Differenz zu STW" value={`${r.tri.sog - f.stw.value! >= 0 ? '+' : ''}${n2(r.tri.sog - f.stw.value!)} kn`} />
                <ResultValue label="COG" value={formatBearing(r.tri.cog)} />
              </>
            )}
          </ResultPanel>
        </>
      ) : (
        <>
          <div className={grid}>
            <NumberField label="Distanz zwischen zwei Fixes" unit="NM" field={dist} />
            <NumberField label="Zeit zwischen den Fixes" unit="min" field={mins} />
          </div>
          {validT && sogT === null ? (
            <Warning text="Die Zeit muss größer als 0 sein." />
          ) : (
            <ResultPanel valid={validT} steps={sogT !== null ? [`Zeit = ${mins.value} min / 60 = ${n3(mins.value! / 60)} h`, `SOG = ${n2(dist.value!)} NM / ${n3(mins.value! / 60)} h = ${n2(sogT)} kn`] : []}>
              {sogT !== null && <ResultValue label="Mittlere SOG" value={`${n2(sogT)} kn`} highlight />}
            </ResultPanel>
          )}
        </>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- 5. Tidal Stream Vector */

export function TidalStreamCalculator() {
  const set = useNumberField('45', BEARING)
  const spring = useNumberField('2.8', RATE)
  const neap = useNumberField('1.4', RATE)
  const range = useNumberField('3.9', { min: 0, max: 20 })
  const springRange = useNumberField('5.3', { min: 0, max: 20 })
  const neapRange = useNumberField('2.5', { min: 0, max: 20 })
  const mins = useNumberField('60', { min: 0, max: 600 })
  const valid = fieldsValid(set, spring, neap, range, springRange, neapRange, mins)
  const r = valid ? interpolateTidalRate({ springRate: spring.value!, neapRate: neap.value!, range: range.value!, springRange: springRange.value!, neapRange: neapRange.value! }) : null
  const drift = r ? r.rate * (mins.value! / 60) : 0
  const vec = r ? fromPolar(drift, set.value!) : null

  return (
    <div className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Stromatlas bzw. Tidal Diamond liefern Set sowie die Rate für Spring- und Nipptide. Die Rate des Tages wird über den Tidenhub
        linear interpoliert.
      </p>
      <div className={grid}>
        <NumberField label="Set" hint="Richtung aus Atlas/Diamond" unit="°" field={set} />
        <NumberField label="Rate Springtide" unit="kn" field={spring} />
        <NumberField label="Rate Nipptide" unit="kn" field={neap} />
        <NumberField label="Tidenhub heute" unit="m" field={range} />
        <NumberField label="Mittlerer Springtidenhub" unit="m" field={springRange} />
        <NumberField label="Mittlerer Nipptidenhub" unit="m" field={neapRange} />
        <NumberField label="Zeitraum" unit="min" field={mins} />
      </div>
      {valid && r === null ? (
        <Warning text="Der Springtidenhub muss größer als der Nipptidenhub sein." />
      ) : (
        <ResultPanel
          valid={valid}
          steps={
            r
              ? [
                  `Anteil = (Hub heute − Nipp-Hub) / (Spring-Hub − Nipp-Hub) = (${n1(range.value!)} − ${n1(neapRange.value!)}) / (${n1(springRange.value!)} − ${n1(neapRange.value!)}) = ${n2(r.factor)}`,
                  `Rate = Nipp + (Spring − Nipp) × Anteil = ${n1(neap.value!)} + (${n1(spring.value!)} − ${n1(neap.value!)}) × ${n2(r.factor)} = ${n2(r.rate)} kn`,
                  `Drift = Rate × Zeit = ${n2(r.rate)} kn × ${n3(mins.value! / 60)} h = ${n2(drift)} NM`,
                  `Vektor: x = ${n2(drift)} · sin ${set.value}° = ${n3(vec!.x)} NM (Ost), y = ${n2(drift)} · cos ${set.value}° = ${n3(vec!.y)} NM (Nord)`,
                ]
              : []
          }
        >
          {r && (
            <>
              <ResultValue label="Rate heute" value={`${n2(r.rate)} kn`} highlight />
              <ResultValue label="Drift" value={`${n2(drift)} NM`} sub={`in ${mins.value} min`} />
              <ResultValue label="Set" value={formatBearing(set.value!, 0)} />
            </>
          )}
        </ResultPanel>
      )}
      {r?.extrapolated && <Warning tone="warn" text="Der Tidenhub liegt außerhalb des Bereichs Nipp–Spring. Das Ergebnis ist extrapoliert und unsicherer." />}
    </div>
  )
}

/* ---------------------------------------------------------------- 6. Course to Steer */

export function CtsCalculator() {
  const track = useNumberField('0', BEARING)
  const dist = useNumberField('10', { min: 0, max: 10000, optional: true })
  const stw = useNumberField('5', SPEED)
  const set = useNumberField('90', BEARING)
  const rate = useNumberField('2', RATE)
  const leeway = useNumberField('0', LEEWAY)
  const valid = fieldsValid(track, dist, stw, set, rate, leeway)
  const r = valid
    ? courseToSteer({ desiredTrack: track.value!, stw: stw.value!, tideDirection: set.value!, tideRate: rate.value!, leeway: leeway.value!, distance: dist.value ?? undefined })
    : null

  let steps: string[] = []
  if (r && valid) {
    const along = fromPolar(1, track.value!)
    const stb = fromPolar(1, track.value! + 90)
    const tide = fromPolar(rate.value!, set.value!)
    const ta = tide.x * along.x + tide.y * along.y
    const tc = tide.x * stb.x + tide.y * stb.y
    steps = [
      `Strom zerlegen: entlang ${formatBearing(track.value!, 0)} = ${n2(ta)} kn, quer (+ = nach Steuerbord) = ${n2(tc)} kn`,
      `Ausgleich der Querkomponente: sin α = −(${n2(tc)}) / ${n1(stw.value!)} = ${n3(-tc / stw.value!)}`,
    ]
    if (r.feasible) {
      const alpha = r.waterTrack - track.value!
      const a = ((alpha + 540) % 360) - 180
      steps.push(
        `α = ${n1(a)}° → Water Track = ${formatBearing(track.value!, 0)} ${a >= 0 ? '+' : '−'} ${n1(Math.abs(a))}° = ${formatBearing(r.waterTrack)}`,
        `Leeway vorhalten: CTS = Water Track − Leeway = ${formatBearing(r.waterTrack)} ${leeway.value! >= 0 ? '−' : '+'} ${Math.abs(leeway.value!)}° = ${formatBearing(r.courseToSteer)}`,
        `SOG = STW · cos α + Stromanteil = ${n1(stw.value!)} · cos ${n1(a)}° + ${n2(ta)} = ${n2(r.sog)} kn`,
      )
      if (r.timeHours !== null) steps.push(`Zeit = ${n2(dist.value!)} NM / ${n2(r.sog)} kn = ${formatDuration(r.timeHours)}`)
    }
  }

  return (
    <div className="space-y-5">
      <div className={grid}>
        <NumberField label="Gewünschter Ground Track" hint="Kurs über Grund zum Ziel" unit="°" field={track} />
        <NumberField label="Distanz zum Ziel" unit="NM" field={dist} />
        <NumberField label="STW" unit="kn" field={stw} />
        <NumberField label="Strom: Set" unit="°" field={set} />
        <NumberField label="Strom: Rate" unit="kn" field={rate} />
        <NumberField label="Leeway" hint="+ Abdrift nach Steuerbord" unit="°" field={leeway} />
      </div>
      {r && !r.feasible ? (
        <div className="space-y-3">
          <div className="flex gap-3 rounded-lg border-2 border-destructive bg-destructive/10 p-4 text-destructive" role="alert">
            <Ban className="mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-semibold">Kurs nicht haltbar</p>
              <p className="text-sm">{r.message}</p>
            </div>
          </div>
          <ol className="list-decimal space-y-1 rounded-lg bg-muted/50 p-4 pl-9 text-sm">
            {steps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      ) : (
        <ResultPanel valid={valid} steps={steps}>
          {r?.feasible && (
            <>
              <ResultValue label="Course to Steer" value={formatBearing(r.courseToSteer)} highlight />
              <ResultValue label="Water Track" value={formatBearing(r.waterTrack)} />
              <ResultValue label="SOG auf Sollkurs" value={`${n2(r.sog)} kn`} />
              {r.timeHours !== null && <ResultValue label="Fahrtdauer" value={formatDuration(r.timeHours)} />}
            </>
          )}
        </ResultPanel>
      )}
      <p className="text-xs text-muted-foreground">
        Berechnet für konstanten Strom. Ändert sich der Strom stündlich, werden in der Praxis die Stromvektoren der einzelnen Stunden
        addiert (Phase 3: Tidal-Stream-Übungen).
      </p>
    </div>
  )
}

/* ---------------------------------------------------------------- 7. Estimated Position */

function useLatLonFields(deg: string, min: string, maxDeg: number) {
  return { deg: useNumberField(deg, { min: 0, max: maxDeg, integer: true }), min: useNumberField(min, { min: 0, max: 59.999 }) }
}

export function EpCalculator() {
  const lat = useLatLonFields('50', '45.0', 89)
  const lon = useLatLonFields('1', '20.0', 179)
  const [ns, setNs] = useState<'N' | 'S'>('N')
  const [ew, setEw] = useState<'E' | 'W'>('W')
  const hdg = useNumberField('225', BEARING)
  const leeway = useNumberField('-5', LEEWAY)
  const stw = useNumberField('5.5', SPEED)
  const mins = useNumberField('60', { min: 0, max: 1440 })
  const set = useNumberField('90', BEARING)
  const rate = useNumberField('1.6', RATE)
  const valid = fieldsValid(lat.deg, lat.min, lon.deg, lon.min, hdg, leeway, stw, mins, set, rate)

  let content = null
  if (valid) {
    const start = {
      lat: (lat.deg.value! + lat.min.value! / 60) * (ns === 'N' ? 1 : -1),
      lon: (lon.deg.value! + lon.min.value! / 60) * (ew === 'E' ? 1 : -1),
    }
    const t = mins.value! / 60
    const tri = computeVelocityTriangle({ heading: hdg.value!, stw: stw.value!, leeway: leeway.value!, tideDirection: set.value!, tideRate: rate.value! })
    const wVec = scaleVector(tri.waterVelocity, t)
    const tVec = scaleVector(tri.tideVelocity, t)
    const gVec = scaleVector(tri.groundVelocity, t)
    const dr = offsetPosition(start, scaleVector(fromPolar(stw.value!, hdg.value!), t))
    const ep = offsetPosition(start, gVec)
    const gtDir = direction(gVec)
    content = (
      <ResultPanel
        valid
        steps={[
          `Water Track = ${hdg.value}° ${leeway.value! >= 0 ? '+' : '−'} ${Math.abs(leeway.value!)}° = ${formatBearing(tri.waterTrack)}; Logdistanz = ${n1(stw.value!)} kn × ${n3(t)} h = ${n2(stw.value! * t)} NM`,
          `Wasserweg: Ost ${n3(wVec.x)} NM, Nord ${n3(wVec.y)} NM`,
          `Stromversatz: ${n2(rate.value! * t)} NM nach ${formatBearing(set.value!, 0)} → Ost ${n3(tVec.x)} NM, Nord ${n3(tVec.y)} NM`,
          `Summe: Ost ${n3(gVec.x)} NM, Nord ${n3(gVec.y)} NM → ${n2(magnitude(gVec))} NM auf ${formatBearing(gtDir)}`,
          `Breite: ${n3(gVec.y)} NM = ${n3(gVec.y)}′; Länge: ${n3(gVec.x)} NM / cos(Mittelbreite) = ${n3((ep.lon - start.lon) * 60)}′`,
        ]}
      >
        <ResultValue label="EP" value={formatLatLon(ep)} highlight />
        <ResultValue label="Ground Track" value={formatBearing(gtDir)} sub={`${n2(magnitude(gVec))} NM über Grund`} />
        <ResultValue label="DR (ohne Strom & Leeway)" value={formatLatLon(dr)} />
      </ResultPanel>
    )
  }

  return (
    <div className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-semibold">Startposition (letzter Fix)</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex items-end gap-2">
            <NumberField label="Breite °" field={lat.deg} className="w-20" />
            <NumberField label="Minuten" unit="′" field={lat.min} className="flex-1" />
            <Toggle label="Nord/Süd" value={ns} onChange={setNs} options={[{ value: 'N', label: 'N' }, { value: 'S', label: 'S' }]} />
          </div>
          <div className="flex items-end gap-2">
            <NumberField label="Länge °" field={lon.deg} className="w-20" />
            <NumberField label="Minuten" unit="′" field={lon.min} className="flex-1" />
            <Toggle label="Ost/West" value={ew} onChange={setEw} options={[{ value: 'E', label: 'E' }, { value: 'W', label: 'W' }]} />
          </div>
        </div>
      </fieldset>
      <div className={grid}>
        <NumberField label="Heading" unit="°" field={hdg} />
        <NumberField label="Leeway" hint="+ Steuerbord / − Backbord" unit="°" field={leeway} />
        <NumberField label="STW (Log)" unit="kn" field={stw} />
        <NumberField label="Zeit seit Fix" unit="min" field={mins} />
        <NumberField label="Strom: Set" unit="°" field={set} />
        <NumberField label="Strom: Rate" unit="kn" field={rate} />
      </div>
      {content ?? <ResultPanel valid={false} />}
      <p className="text-xs text-muted-foreground">Mittelbreitenverfahren – für Küstendistanzen ausreichend genau. Keine Navigationsgrundlage.</p>
    </div>
  )
}

function Warning({ text, tone = 'error' }: { text: string; tone?: 'error' | 'warn' }) {
  return (
    <div className={tone === 'error' ? 'rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive' : 'rounded-lg border border-warning/50 bg-warning/10 p-3 text-sm'} role="alert">
      {text}
    </div>
  )
}
