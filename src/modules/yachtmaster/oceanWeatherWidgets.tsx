import { useState } from 'react'
import { formatBearing, formatNumber, stormCentreBearing, stormPosition, vhfRange, type Hemisphere, type WindShift } from '@/calculations'
import { Slider } from '@/components/ui/slider'
import { COMMS_SYSTEMS, GMDSS_AREAS, windBelt, type Season } from '@/data/oceanWeather'
import { cn } from '@/lib/utils'
import { Toggle } from '@/modules/calculators/fields'

const f0 = (n: number) => formatNumber(n, 0)

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

const latLabel = (l: number) => (l === 0 ? '0°' : `${Math.abs(l)}° ${l > 0 ? 'N' : 'S'}`)

/* ------------------------------------------------------------------ Windgürtel */

export function GlobalWindsWidget() {
  const [lat, setLat] = useState(18)
  const [season, setSeason] = useState<Season>('jan')
  const belt = windBelt(lat, season)
  const H = 240
  const y = (l: number) => H / 2 - (l / 70) * (H / 2 - 10)
  // Gürtelgrenzen für die Skizze aus derselben Funktion abtasten
  const bands: { from: number; to: number; id: string; name: string }[] = []
  for (let l = 70; l >= -70; l--) {
    const b = windBelt(l, season)
    const last = bands[bands.length - 1]
    if (last && last.id === b.id) last.to = l
    else bands.push({ from: l, to: l, id: b.id, name: b.name })
  }
  const FILL: Record<string, string> = { itcz: '#fde68a', 'ne-trades': '#bbf7d0', 'se-trades': '#bbf7d0', 'n-high': '#fef3c7', 's-high': '#fef3c7', 'n-westerlies': '#bfdbfe', 's-westerlies': '#bfdbfe', polar: '#e2e8f0' }
  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_200px]">
      <div className="min-w-0 space-y-4">
        <p className="text-sm text-muted-foreground">
          Über den Ozeanen ordnen sich die Winde in Gürteln: Passate zu beiden Seiten des Äquators, dazwischen die Mallungen, um 30° die windarmen subtropischen Hochs, weiter polwärts die Westwindzonen. Im Nordsommer wandert alles einige Grad nach Norden. Stark vereinfachtes Modell für den Atlantik.
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Slide label="Breite" value={latLabel(lat)} min={-65} max={65} step={1} v={lat} on={setLat} />
          <div className="space-y-1">
            <span className="text-sm font-medium">Jahreszeit</span>
            <div>
              <Toggle value={season} onChange={setSeason} label="Jahreszeit" options={[{ value: 'jan', label: 'Januar' }, { value: 'jul', label: 'Juli' }]} />
            </div>
          </div>
        </div>
        <div role="status" className="rounded-lg border bg-muted/50 p-3 text-sm">
          <p className="font-semibold">{belt.name}</p>
          <p>Wind: {belt.wind}</p>
          <p className="text-muted-foreground">{belt.note}</p>
        </div>
      </div>
      <svg viewBox={`0 0 200 ${H}`} className="h-auto w-full max-w-[220px] justify-self-center rounded-lg border" role="img" aria-label={`Windgürtel im ${season === 'jan' ? 'Januar' : 'Juli'}, markiert ${latLabel(lat)}`}>
        {bands.map((b) => (
          <g key={`${b.id}${b.from}`}>
            <rect x={0} y={y(b.from + 0.5)} width={200} height={Math.max(1, y(b.to - 0.5) - y(b.from + 0.5))} fill={FILL[b.id]} />
          </g>
        ))}
        <line x1={0} y1={y(0)} x2={200} y2={y(0)} stroke="#0f172a" strokeDasharray="3 3" />
        <text x={4} y={y(0) - 3} fontSize={8} fill="#0f172a">Äquator</text>
        <line x1={0} y1={y(lat)} x2={200} y2={y(lat)} stroke="#e11d48" strokeWidth={2} />
        <circle cx={100} cy={y(lat)} r={4} fill="#e11d48" />
      </svg>
    </div>
  )
}

/* ------------------------------------------------------------------ Tropischer Wirbelsturm */

const POSITION_TEXT = {
  dangerous: { title: 'Gefährlicher Halbkreis', act: (s: string) => `Wind an ${s} vorn nehmen und mit möglichst viel Fahrt vom Zentrum weg; der Sturm würde dich sonst auf seine Zugbahn treiben.` },
  navigable: { title: 'Fahrbarer Halbkreis', act: (s: string) => `Wind an ${s} achtern nehmen und ablaufen – weg vom Zentrum.` },
  track: { title: 'Etwa auf der Zugbahn vor dem Zentrum', act: (s: string) => `Wind an ${s} achtern nehmen und in den fahrbaren Halbkreis laufen.` },
}

export function TropicalStormWidget() {
  const [hemisphere, setHemisphere] = useState<Hemisphere>('N')
  const [shift, setShift] = useState<WindShift>('veer')
  const [windFrom, setWindFrom] = useState(90)
  const pos = stormPosition(shift, hemisphere)
  const c = stormCentreBearing(windFrom, hemisphere)
  const side = hemisphere === 'N' ? 'Steuerbord' : 'Backbord'
  const t = POSITION_TEXT[pos]
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Bei fallendem Druck in der Hurrikansaison zeigt die Winddrehung, wo du zum Sturm liegst. Auf der Nordhalbkugel ist der rechte Halbkreis (in Zugrichtung) gefährlich: Dort addieren sich Wind und Zuggeschwindigkeit, und der Wind treibt dich vor den Sturm. Das Wichtigste bleibt, gar nicht erst in seine Nähe zu kommen.
      </p>
      <div className="flex flex-wrap gap-3">
        <Toggle value={hemisphere} onChange={setHemisphere} label="Halbkugel" options={[{ value: 'N', label: 'Nordhalbkugel' }, { value: 'S', label: 'Südhalbkugel' }]} />
        <Toggle value={shift} onChange={setShift} label="Winddrehung" options={[{ value: 'veer', label: 'rechtsdrehend' }, { value: 'back', label: 'rückdrehend' }, { value: 'steady', label: 'gleichbleibend' }]} />
      </div>
      <Slide label="Wind kommt aus" value={formatBearing(windFrom, 0)} min={0} max={355} step={5} v={windFrom} on={setWindFrom} />
      <div className="grid gap-2 sm:grid-cols-2">
        <div role="status" className={cn('rounded-lg border p-3 text-sm', pos === 'dangerous' ? 'border-destructive/40 bg-destructive/5' : pos === 'track' ? 'border-amber-500/40 bg-amber-500/5' : 'border-success/40 bg-success/5')}>
          <p className="font-semibold">{t.title}</p>
          <p>{t.act(side)}</p>
        </div>
        <div className="rounded-lg border bg-muted/50 p-3 text-sm">
          <p className="font-semibold">Zentrum etwa in</p>
          <p className="font-mono">
            {formatBearing(c.near, 0)} (nah) bis {formatBearing(c.far, 0)} (weiter weg)
          </p>
          <p className="text-xs text-muted-foreground">Gesicht zum Wind: Das Zentrum liegt {hemisphere === 'N' ? 'rechts' : 'links'}, 90° bis 135°.</p>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Einstufung nach mittlerem Wind: tropischer Sturm 34–63 kn, Hurrikan (Taifun, Zyklon) ab 64 kn. Vereinfachte Lernregeln – auf See gelten aktuelle Warnungen und die Empfehlungen der Wetterdienste.</p>
    </div>
  )
}

/* ------------------------------------------------------------------ Funk und Wetterdaten */

export function OffshoreCommsWidget() {
  const [own, setOwn] = useState(15)
  const [coast, setCoast] = useState(100)
  const [offshore, setOffshore] = useState(60)
  const range = vhfRange(own, coast)
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        UKW reicht nur bis zum Funkhorizont, rund 2,2 × (√H + √h) Seemeilen. Weiter draußen braucht man Grenzwelle, Kurzwelle oder Satellit; Wetter- und Warnmeldungen kommen per NAVTEX in Küstennähe und per Satellit oder Kurzwelle auf Hochsee.
      </p>
      <div className="grid gap-4 sm:grid-cols-3">
        <Slide label="Eigene Antenne" value={`${own} m`} min={2} max={30} step={1} v={own} on={setOwn} />
        <Slide label="Küstenfunkstelle" value={`${coast} m`} min={10} max={300} step={10} v={coast} on={setCoast} />
        <Slide label="Abstand zur Küste" value={`${offshore} NM`} min={5} max={600} step={5} v={offshore} on={setOffshore} />
      </div>
      <p className="text-sm">
        UKW-Reichweite zur Küstenfunkstelle: <span className="font-mono font-semibold">{f0(range)} NM</span>
      </p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {COMMS_SYSTEMS.map((s) => {
          const reach = s.id === 'vhf' ? range : s.rangeNm
          const ok = reach === null || offshore <= reach
          return (
            <li key={s.id} className={cn('rounded-lg border p-2.5 text-sm', ok ? 'border-success/40 bg-success/5' : 'border-destructive/40 bg-destructive/5')}>
              <p className="font-medium">
                {ok ? '✓' : '✗'} {s.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {s.what} · {reach === null ? 'weltweit bzw. über Satellit' : `bis etwa ${f0(reach)} NM`}
              </p>
            </li>
          )
        })}
      </ul>
      <div className="text-sm">
        <p className="font-semibold">GMDSS-Seegebiete</p>
        <ul className="mt-1 space-y-0.5 text-muted-foreground">
          {GMDSS_AREAS.map((a) => (
            <li key={a.id}>
              <span className="font-mono font-semibold text-foreground">{a.id}</span> – {a.text}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
