import { useState } from 'react'
import { correctSunAltitude, dm, formatNumber, noonLatitude, noonTimeUT, toDegMin } from '@/calculations'
import { formatClockTime } from '@/calculations/dst'
import { cn } from '@/lib/utils'
import { NumberField, Toggle, fieldsValid, useNumberField } from '@/modules/calculators/fields'

const f1 = (n: number) => formatNumber(n, 1)
const signedMin = (m: number) => `${m >= 0 ? '+' : '−'}${f1(Math.abs(m))}′`
const degMin = (v: number, pos = '', neg = '') => {
  const d = toDegMin(v)
  const suffix = d.sign < 0 ? neg : pos
  return `${d.sign < 0 && !neg ? '−' : ''}${d.deg}°${f1(d.min).padStart(4, '0')}′${suffix ? ' ' + suffix : ''}`
}

function Step({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-3 border-b py-1 text-sm', highlight && 'font-semibold text-primary')}>
      <span className={cn(!highlight && 'text-muted-foreground')}>{label}</span>
      <span className="font-mono tabular-nums">{value}</span>
    </div>
  )
}

/* ------------------------------------------------------------------ Beschickung */

export function SextantWidget() {
  const hsDeg = useNumberField('45', { min: 5, max: 89, integer: true })
  const hsMin = useNumberField('20.0', { min: 0, max: 59.9 })
  const eye = useNumberField('2.5', { min: 0, max: 30 })
  const ie = useNumberField('0', { min: -10, max: 10 })
  const [limb, setLimb] = useState<'lower' | 'upper'>('lower')
  const valid = fieldsValid(hsDeg, hsMin, eye, ie)
  const c = valid ? correctSunAltitude(hsDeg.value! + hsMin.value! / 60, eye.value!, ie.value!, limb === 'upper') : null
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Der Sextant misst den Winkel zwischen Kimm und Sonnenrand (Sextantenhöhe Hs). Bis zur beobachteten Höhe Ho werden Indexfehler, Kimmtiefe (Augenhöhe), Refraktion und Sonnenhalbmesser angebracht. In der Praxis stehen diese Werte im Almanach – hier werden sie mit Näherungsformeln berechnet.
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        <NumberField label="Hs Grad" unit="°" field={hsDeg} />
        <NumberField label="Hs Minuten" unit="′" field={hsMin} />
        <NumberField label="Augenhöhe" unit="m" field={eye} />
        <NumberField label="Indexberichtigung" hint="+ off the arc, − on the arc" unit="′" field={ie} />
      </div>
      <Toggle value={limb} onChange={setLimb} label="Gemessener Sonnenrand" options={[{ value: 'lower', label: 'Unterrand' }, { value: 'upper', label: 'Oberrand' }]} />
      {c ? (
        <div className="max-w-md">
          <Step label="Sextantenhöhe Hs" value={degMin(c.sextant)} />
          <Step label="Indexberichtigung" value={signedMin(c.indexError)} />
          <Step label="Kimmtiefe −1,76′·√Augenhöhe" value={signedMin(c.dip)} />
          <Step label="Scheinbare Höhe Ha" value={degMin(c.apparent)} />
          <Step label="Refraktion" value={signedMin(c.refraction)} />
          <Step label={`Halbmesser (${limb === 'lower' ? 'Unterrand +' : 'Oberrand −'})`} value={signedMin(c.semiDiameter)} />
          <Step label="Beobachtete Höhe Ho" value={degMin(c.observed)} highlight />
        </div>
      ) : (
        <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Bitte gültige Werte eingeben.</p>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ Mittagsbreite */

export function NoonLatitudeWidget() {
  const hoDeg = useNumberField('52', { min: 1, max: 89, integer: true })
  const hoMin = useNumberField('14.0', { min: 0, max: 59.9 })
  const decDeg = useNumberField('12', { min: 0, max: 23, integer: true })
  const decMin = useNumberField('30.0', { min: 0, max: 59.9 })
  const [decName, setDecName] = useState<'N' | 'S'>('N')
  const [bearing, setBearing] = useState<'S' | 'N'>('S')
  const valid = fieldsValid(hoDeg, hoMin, decDeg, decMin)
  const ho = valid ? hoDeg.value! + hoMin.value! / 60 : 45
  const dec = valid ? (decName === 'N' ? 1 : -1) * dm(decDeg.value!, decMin.value!) : 0
  const lat = noonLatitude(ho, dec, bearing)
  const z = 90 - ho
  const latValid = valid && Math.abs(lat) <= 90

  // Skizze: Meridian des Beobachters, Horizont waagerecht, Zenit oben
  const R = 90
  const cx = 120
  const cy = 110
  const p = (angleFromSouthHorizon: number) => ({ x: cx + R * Math.cos((angleFromSouthHorizon * Math.PI) / 180), y: cy - R * Math.sin((angleFromSouthHorizon * Math.PI) / 180) })
  const sun = p(bearing === 'S' ? ho : 180 - ho)
  const equator = p(90 - lat) // Äquator steht (90° − Breite) über dem Südhorizont
  return (
    <div className="grid gap-4 md:grid-cols-[1fr_260px]">
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Zur Kulmination steht die Sonne genau im Süden (oder Norden) und erreicht ihre größte Höhe. Aus der beobachteten Höhe Ho und der Deklination aus dem Almanach folgt die Breite ohne weitere Tafeln: Zenitdistanz z = 90° − Ho.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <NumberField label="Ho Grad" unit="°" field={hoDeg} />
          <NumberField label="Ho Minuten" unit="′" field={hoMin} />
          <NumberField label="Deklination Grad" unit="°" field={decDeg} />
          <NumberField label="Deklination Minuten" unit="′" field={decMin} />
        </div>
        <div className="flex flex-wrap gap-3">
          <Toggle value={decName} onChange={setDecName} label="Deklination" options={[{ value: 'N', label: 'Deklination N' }, { value: 'S', label: 'Deklination S' }]} />
          <Toggle value={bearing} onChange={setBearing} label="Sonne steht im" options={[{ value: 'S', label: 'Sonne im Süden' }, { value: 'N', label: 'Sonne im Norden' }]} />
        </div>
        {latValid ? (
          <div className="max-w-md">
            <Step label="Zenitdistanz z = 90° − Ho" value={degMin(z)} />
            <Step label="Deklination" value={degMin(dec, 'N', 'S')} />
            <Step label={bearing === 'S' ? 'Breite = Deklination + z' : 'Breite = Deklination − z'} value={degMin(lat, 'N', 'S')} highlight />
          </div>
        ) : (
          <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Bitte gültige Werte eingeben.</p>
        )}
      </div>
      <svg viewBox="0 0 240 140" className="h-auto w-full rounded-lg border bg-[var(--chart-sea)]" role="img" aria-label="Skizze des Meridians: Horizont, Zenit, Sonne und Äquator">
        <line x1={cx - R - 10} y1={cy} x2={cx + R + 10} y2={cy} stroke="currentColor" />
        <path d={`M ${cx + R} ${cy} A ${R} ${R} 0 0 0 ${cx - R} ${cy}`} fill="none" stroke="currentColor" strokeOpacity={0.3} />
        <text x={cx + R - 4} y={cy + 12} fontSize={9} fill="currentColor">S</text>
        <text x={cx - R} y={cy + 12} fontSize={9} fill="currentColor">N</text>
        <line x1={cx} y1={cy} x2={cx} y2={cy - R} stroke="currentColor" strokeDasharray="3 2" strokeOpacity={0.6} />
        <text x={cx + 3} y={cy - R + 8} fontSize={8} fill="currentColor">Zenit</text>
        {latValid && <line x1={cx} y1={cy} x2={equator.x} y2={equator.y} stroke="#2dd4bf" strokeDasharray="4 2" />}
        {latValid && <text x={equator.x + (equator.x >= cx ? 3 : -30)} y={equator.y - 3} fontSize={8} fill="#0d9488">Äquator</text>}
        <line x1={cx} y1={cy} x2={sun.x} y2={sun.y} stroke="#f97316" strokeWidth={1.5} />
        <circle cx={sun.x} cy={sun.y} r={6} fill="#facc15" stroke="#f97316" />
        <text x={cx - 20} y={cy - 6} fontSize={8} fill="currentColor">Beobachter</text>
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Zeit der Kulmination */

export function NoonTimeWidget() {
  const lon = useNumberField('-4.5', { min: -180, max: 180 })
  const eot = useNumberField('3', { min: -17, max: 17 })
  const valid = fieldsValid(lon, eot)
  const t = valid ? noonTimeUT(lon.value!, eot.value!) : 12
  const c = formatClockTime(t * 60)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Wann muss man die Mittagshöhe messen? Die Sonne kulminiert in Greenwich um 12:00 Uhr wahrer Sonnenzeit; je 15° Länge nach Westen eine Stunde später. Die Zeitgleichung (Almanach, bis etwa ±16 min) verschiebt den Zeitpunkt. Man beginnt einige Minuten vorher zu messen und nimmt die größte Höhe.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        <NumberField label="Länge (Ost +, West −)" unit="°" field={lon} />
        <NumberField label="Zeitgleichung (wahre − mittlere Zeit)" unit="min" field={eot} />
      </div>
      {valid && (
        <div className="max-w-md">
          <Step label="Ausgangszeit Greenwich" value="12:00" />
          <Step label="Längenkorrektur (4 min je Grad, West später)" value={`${-lon.value! >= 0 ? '+' : '−'}${f1(Math.abs(lon.value! * 4))} min`} />
          <Step label="Zeitgleichung abziehen" value={`${-eot.value! >= 0 ? '+' : '−'}${f1(Math.abs(eot.value!))} min`} />
          <Step label="Kulmination (UT)" value={`${c.time}${c.dayOffset ? ` (${c.dayOffset > 0 ? '+' : '−'}1 Tag)` : ''}`} highlight />
        </div>
      )}
    </div>
  )
}
