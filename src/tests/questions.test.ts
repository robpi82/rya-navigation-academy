import { describe, expect, it } from 'vitest'
import { QUESTION_BANK } from '@/questions'
import { GLOSSARY, TERM_IDS } from '@/data/glossary'
import { COASTAL_TOPIC_IDS, DAY_TOPIC_IDS, YACHT_TOPIC_IDS } from '@/data/topics'
import {
  actualDepth,
  anchorChainLength,
  beaufortFromKnots,
  compassToTrue,
  cpa,
  lowPressureDirection,
  msToKnots,
  knotsToMs,
  vmg,
  windShift,
  underKeelClearance as _ukc,
  courseToSteer,
  deviationAt,
  distanceFrom,
  geographicRange,
  heightByTwelfths,
  heightCosine,
  passableWindow,
  planPassage,
  rhumbLine,
  secondaryTide,
  greatCircle,
  tackingDistance,
  plotTarget,
  transitOffset,
  closingSpeed,
  apparentWind,
  lineAdjustment,
  driftToCoast,
  anchorRode,
  windOverWater,
  vhfRange,
  stormCentreBearing,
  legMinutes,
  minDistanceForDischarge,
  holdingTankDays,
  distanceAwayM,
  datumDriftNm,
  expandingSquareLength,
  sectorSearchLength,
  searchMinutes,
  rescueHours,
  etmalSpeed,
  passageDays,
  passageWater,
  clockChangeHours,
  etmalNeeded,
  daysPerClockHour,
  parseAtlasLabel,
  atlasRateForDay,
  atlasPage,
  pagesForPassage,
  tideOverTime,
  magnitude,
  geostrophicWind,
  surfaceWindSpeed,
  surfaceWindFrom,
  gradientWind,
  frontArrivalHours,
  distanceOffFromBowAngles,
  abeamDistance,
  epErrorRadius,
  reduceSounding,
  fuelNeeded,
  thirdsRange,
  waterNeeded,
  daylightMargin,
  sogAlongStream,
  interpolateTidalRate,
  swingRadius,
  clearanceAtLw,
  minChartedDepth,
  leakRate,
  minutesUntil,
  climb,
  windForceRatio,
  secondsToMeet,
  daylightDepartureWindow,
  watchLoad,
  watchSchedule,
  noonLatitude,
  localHourAngle,
  computeAltitudeAzimuth,
  sunGHA,
  noonTimeUT,
  dip,
  compareRoutes,
  reciprocal,
  cutAngle,
  compassErrorFromTransit,
  deviationFromError,
  simulate,
  speedFrom,
  tidalRange,
  timeFrom,
  trueToCompass,
  underKeelClearance,
  variationForYear,
  waterDepth,
} from '@/calculations'
import { SECONDARY_PORTS, STANDARD_REFERENCES } from '@/data/secondaryPorts'
import { isAnswerCorrect, parseNumberInput, shuffle } from '@/lib/quiz'
import type { QuestionVerify } from '@/types/learning'

function compute(v: QuestionVerify): number | null {
  switch (v.kind) {
    case 'sim': {
      const r = simulate(v)
      return r[v.quantity]
    }
    case 'cts': {
      const r = courseToSteer(v)
      if (!r.feasible) return null
      if (v.quantity === 'cts') return r.courseToSteer
      if (v.quantity === 'sog') return r.sog
      return r.timeHours === null ? null : r.timeHours * 60
    }
    case 'twelfths': {
      const h = heightByTwelfths(v.lw, v.hw, v.hoursAfterLw)
      return v.quantity === 'height' ? h : h + (v.chartedDepth ?? 0)
    }
    case 'passage': {
      const r = planPassage(v)
      if (!r.feasible) return null
      return v.quantity === 'cts' ? r.courseToSteer : r.hours * 60
    }
    case 'bearing': {
      switch (v.quantity) {
        case 'reciprocal':
          return reciprocal(v.bearing!)
        case 'cutAngle':
          return cutAngle(v.bearing!, v.bearing2!)
        case 'errorWest':
          return -compassErrorFromTransit(v.trueBearing!, v.observed!)
        case 'errorEast':
          return compassErrorFromTransit(v.trueBearing!, v.observed!)
        case 'deviationWest':
          return -deviationFromError(compassErrorFromTransit(v.trueBearing!, v.observed!), v.variation!)
        case 'deviationEast':
          return deviationFromError(compassErrorFromTransit(v.trueBearing!, v.observed!), v.variation!)
      }
      return null
    }
    case 'compass': {
      switch (v.quantity) {
        case 'true':
          return compassToTrue(v.compass!, v.deviation ?? 0, v.variation ?? 0).true
        case 'compass':
          return trueToCompass(v.trueCourse!, v.variation ?? 0, v.deviation ?? 0).compass
        case 'magnetic':
          return trueToCompass(v.trueCourse!, v.variation ?? 0, 0).magnetic
        case 'variationWest':
          return -variationForYear(v.chartVariation!, v.chartYear!, v.annualChange!, v.year!)
        case 'deviationEast':
          return deviationAt(v.table!, v.compassHeading!)
      }
      return null
    }
    case 'tide': {
      switch (v.quantity) {
        case 'range':
          return tidalRange(v.hw!, v.lw!)
        case 'depth':
          return waterDepth(v.chartedDepth!, v.heightOfTide!)
        case 'height':
          return heightCosine(v.hw!, v.lw!, v.hoursAfterHw!)
        case 'ukc':
          return underKeelClearance(waterDepth(v.chartedDepth!, v.heightOfTide!), v.draught!)
        case 'windowMinutes': {
          const w = passableWindow(v.hw!, v.lw!, v.draught! + (v.margin ?? 0) - v.chartedDepth!)
          return w.kind === 'window' ? w.halfWidthHours * 60 : null
        }
        case 'chain':
          return anchorChainLength(waterDepth(v.chartedDepth!, v.heightOfTide!), v.bowHeight!, v.ratio!)
      }
      return null
    }
    case 'weather': {
      switch (v.quantity) {
        case 'beaufort':
          return beaufortFromKnots(v.value!)
        case 'msToKn':
          return msToKnots(v.value!)
        case 'knToMs':
          return knotsToMs(v.value!)
        case 'lowDirection':
          return lowPressureDirection(v.windFrom!)
        case 'shiftDegrees':
          return windShift(v.from!, v.to!).degrees
      }
      return null
    }
    case 'enav': {
      if (v.quantity === 'vmg') return vmg(v.sog!, v.cog!, v.btw!)
      if (v.quantity === 'ukc') return _ukc(actualDepth(v.displayed!, v.reference!, v.transducerDepth!, v.draught!), v.draught!)
      const t = v.target!
      const r = cpa(
        { pos: { x: 0, y: 0 }, course: v.own!.course, speed: v.own!.speed },
        { pos: { x: t.distance * Math.sin((t.bearing * Math.PI) / 180), y: t.distance * Math.cos((t.bearing * Math.PI) / 180) }, course: t.course, speed: t.speed },
      )
      return v.quantity === 'cpa' ? r.cpa : r.tcpaMinutes
    }
    case 'chart':
      return v.quantity === 'geoRange' ? geographicRange(v.lightHeight!, v.eyeHeight!) : rhumbLine(v.from!, v.to!).distance
    case 'astro':
      if (v.quantity === 'noonLatitude') return noonLatitude(v.observedAltitude!, v.declination!, v.sunBearing!)
      if (v.quantity === 'dip') return dip(v.eyeHeight!)
      if (v.quantity === 'lha') return localHourAngle(v.gha!, v.longitude!)
      if (v.quantity === 'hc') return computeAltitudeAzimuth(v.position!, v.gha!, v.declination!).hc
      if (v.quantity === 'intercept') return (v.observedAltitude! - v.computedAltitude!) * 60
      if (v.quantity === 'sunGha') return sunGHA(v.ut!, v.equationOfTime ?? 0)
      return noonTimeUT(v.longitude!, v.equationOfTime ?? 0) * 60
    case 'emergency':
      if (v.quantity === 'leakLpm') return leakRate(v.diameterCm!, v.depthM!)
      if (v.quantity === 'minutesUntil') return minutesUntil(v.volumeL!, v.inflowLpm!, v.pumpingLpm!)
      return driftToCoast(v.windFrom!, v.windKn!, v.currentSet ?? 0, v.currentKn ?? 0, v.coastBearing!, v.distanceNm!).hours
    case 'oceanwx':
      if (v.quantity === 'vhfRange') return vhfRange(v.antennaA!, v.antennaB!)
      return v.quantity === 'centreNear' ? stormCentreBearing(v.windFrom!, v.hemisphere!).near : stormCentreBearing(v.windFrom!, v.hemisphere!).far
    case 'inshore':
      return legMinutes(v.distanceNm, v.speedKn)
    case 'env':
      if (v.quantity === 'minDistance') return minDistanceForDischarge(v.item!, v.specialArea!)
      return holdingTankDays(v.tankLitres!, v.crew!, v.litresPerPersonDay!)
    case 'sar':
      if (v.quantity === 'distanceAwayM') return distanceAwayM(v.speedKn!, v.seconds!)
      if (v.quantity === 'datumDriftNm') return datumDriftNm(v.currentKn!, v.minutes!)
      if (v.quantity === 'squareLength') return expandingSquareLength(v.spacingNm!, v.legs!)
      if (v.quantity === 'squareMinutes') return searchMinutes(expandingSquareLength(v.spacingNm!, v.legs!), v.speedKn!)
      if (v.quantity === 'sectorLength') return sectorSearchLength(v.radiusNm!)
      return rescueHours(v.distanceNm!, v.speedKn!)
    case 'ocean':
      if (v.quantity === 'speed') return etmalSpeed(v.etmalNm!)
      if (v.quantity === 'days') return passageDays(v.distanceNm!, v.etmalNm!)
      if (v.quantity === 'water') return passageWater(v.crew!, v.days!, v.litresPerPersonDay, v.reserve)
      if (v.quantity === 'clockBack') return -clockChangeHours(v.fromLon!, v.toLon!)
      if (v.quantity === 'etmalNeeded') return etmalNeeded(v.distanceNm!, v.days!)
      return daysPerClockHour(v.etmalNm!, v.latDeg!)
    case 'atlas':
      if (v.quantity === 'rate') return atlasRateForDay(parseAtlasLabel(v.label!)!, v.range!, v.neapRange!, v.springRange!)
      if (v.quantity === 'page') return atlasPage(v.minutesFromHw!)
      if (v.quantity === 'passagePage') return pagesForPassage(v.minutesFromHw!, v.hourIndex! + 1)[v.hourIndex!]
      return magnitude(tideOverTime(v.tides!, v.hours!))
    case 'wxchart': {
      if (v.quantity === 'frontHours') return frontArrivalHours(v.distanceNm!, v.speedKn!)
      if (v.quantity === 'surfaceDir') return surfaceWindFrom(v.bearingFromCentre!, v.system!)
      const vg = geostrophicWind(v.intervalHpa!, v.spacingNm!, v.latDeg!)
      if (v.quantity === 'geostrophic') return vg
      if (v.quantity === 'gradient') return gradientWind(vg, v.radiusNm!, v.latDeg!, v.system!)
      return surfaceWindSpeed(vg)
    }
    case 'nogps':
      if (v.quantity === 'distanceOff') return distanceOffFromBowAngles(v.firstAngle!, v.secondAngle!, v.runNm!)
      if (v.quantity === 'abeam') return abeamDistance(v.firstAngle!, v.secondAngle!, v.runNm!)
      if (v.quantity === 'epRadius') return epErrorRadius(v.runNm!, v.fraction)
      if (v.quantity === 'reduced') return reduceSounding(v.displayedDepth!, v.transducerDepth!, v.heightOfTide!)
      return geographicRange(v.lightHeight!, v.eyeHeight!)
    case 'prep':
      if (v.quantity === 'fuel') return fuelNeeded(v.distanceNm!, v.sogKn!, v.litresPerHour!, v.reserve)
      if (v.quantity === 'thirds') return thirdsRange(v.tankLitres!, v.litresPerHour!, v.sogKn!)
      if (v.quantity === 'water') return waterNeeded(v.crew!, v.days!, v.litresPerPersonDay)
      return daylightMargin(v.departHour!, v.distanceNm!, v.sogKn!, v.sunsetHour!)
    case 'races':
      if (v.quantity === 'windOverWater') return windOverWater(v.windFrom!, v.windKn!, v.streamSet!, v.streamKn!).speed
      if (v.quantity === 'rate') return interpolateTidalRate({ springRate: v.springRate!, neapRate: v.neapRate!, range: v.range!, springRange: v.springRange!, neapRange: v.neapRange! })!.rate
      if (v.quantity === 'sog') return sogAlongStream(v.stwKn!, v.streamKn!)
      return v.distanceNm! / v.stwKn! - v.slackHour!
    case 'anchoring':
      if (v.quantity === 'rode') return anchorRode(v.chartedDepth!, v.hwHeight!, v.scope)
      if (v.quantity === 'swing') return swingRadius(anchorRode(v.chartedDepth!, v.hwHeight!, v.scope), v.chartedDepth! + v.lwHeight!, v.boatLength!)
      if (v.quantity === 'clearance') return clearanceAtLw(v.chartedDepth!, v.lwHeight!, v.draught!)
      return minChartedDepth(v.draught!, v.margin!, v.lwHeight!)
    case 'mooring':
      return v.quantity === 'climb' ? climb(v.bollardHeight, v.fromTide, v.freeboard) : lineAdjustment(v.horizontal!, v.bollardHeight, v.freeboard, v.fromTide, v.toTide!)
    case 'wind': {
      if (v.quantity === 'forceRatio') return windForceRatio(v.from!, v.to!)
      const a = apparentWind(v.trueSpeed!, v.trueAngle!, v.boatSpeed!)
      return v.quantity === 'apparentSpeed' ? a.speed : a.angle
    }
    case 'fog': {
      const c = closingSpeed(v.ownKn, v.otherKn, v.angle ?? 180)
      return v.quantity === 'closing' ? c : secondsToMeet(v.visibilityNm!, c)
    }
    case 'pilotage':
      return Math.abs(transitOffset(v.observed, v.transitBearing, v.distanceToFront)) * 1852
    case 'radar': {
      const p = plotTarget(v.first, v.second, v.minutes, v.ownCourse, v.ownSpeed)
      if (v.quantity === 'targetSpeed') return p.targetSpeed
      if (v.quantity === 'targetCourse') return p.targetCourse
      if (v.quantity === 'relativeSpeed') return p.relativeSpeed
      return p.cpa
    }
    case 'night': {
      if (v.quantity === 'visibleStretch') return 2 * Math.sqrt(v.range! ** 2 - v.offset! ** 2)
      if (v.quantity === 'earliestDeparture') return daylightDepartureWindow(v.distance!, v.speed!, v.sunrise!, v.sunset!, v.margin ?? 1, 1)!.earliest
      return watchLoad(watchSchedule(v.from!, v.to!, v.watchHours!, v.teams!), v.teams!)[0].onWatch
    }
    case 'routing':
      return tackingDistance(v.distance, v.angleOffWind)
    case 'greatcircle': {
      const g = greatCircle(v.from, v.to)!
      if (v.quantity === 'saving') return compareRoutes(v.from, v.to)!.saving
      return v.quantity === 'distance' ? g.distance : v.quantity === 'initialBearing' ? g.initialBearing : g.finalBearing
    }
    case 'secondary': {
      const port = SECONDARY_PORTS.find((p) => p.id === v.port)!
      const r = secondaryTide({ hwTime: v.stdHwTime, hwHeight: v.stdHwHeight, lwTime: v.stdLwTime, lwHeight: v.stdLwHeight }, STANDARD_REFERENCES, port.differences)
      return v.quantity === 'hwHeight' ? r.hwHeight : v.quantity === 'lwHeight' ? r.lwHeight : v.quantity === 'range' ? r.range : ((r.hwTime % 1440) + 1440) % 1440
    }
    case 'dst': {
      if (v.quantity === 'distance') return distanceFrom(v.speed!, v.minutes! / 60)
      if (v.quantity === 'speed') return speedFrom(v.distance!, v.minutes! / 60)
      const h = timeFrom(v.distance!, v.speed!)
      return h === null ? null : h * 60
    }
  }
}

describe('Fragenkatalog', () => {
  it('enthält mindestens 50 Day-Skipper-Fragen und Coastal-Skipper-Fragen mit eindeutigen IDs', () => {
    expect(QUESTION_BANK.filter((q) => q.level === 'day-skipper').length).toBeGreaterThanOrEqual(50)
    expect(QUESTION_BANK.filter((q) => q.level === 'coastal-skipper').length).toBeGreaterThanOrEqual(10)
    expect(new Set(QUESTION_BANK.map((q) => q.id)).size).toBe(QUESTION_BANK.length)
  })

  it('deckt alle neun Begriffe und alle Fragetypen ab', () => {
    for (const t of TERM_IDS) expect(QUESTION_BANK.some((q) => q.topic === t), t).toBe(true)
    for (const c of ['concept', 'calculation', 'course', 'diagram', 'error', 'matching'])
      expect(QUESTION_BANK.some((q) => q.category === c), c).toBe(true)
  })

  it('jede Frage hat Musterlösung, Erklärung, gültiges Thema und Schwierigkeitsgrad', () => {
    for (const q of QUESTION_BANK) {
      expect(q.prompt.length, q.id).toBeGreaterThan(10)
      expect(q.solution.length, q.id).toBeGreaterThan(0)
      expect(q.steps.length, q.id).toBeGreaterThan(0)
      expect([...TERM_IDS, ...COASTAL_TOPIC_IDS, ...DAY_TOPIC_IDS, ...YACHT_TOPIC_IDS], q.id).toContain(q.topic)
      expect([1, 2, 3], q.id).toContain(q.difficulty)
      if (q.type === 'mc') {
        expect(q.correctIndex, q.id).toBeGreaterThanOrEqual(0)
        expect(q.correctIndex, q.id).toBeLessThan(q.options.length)
        expect(new Set(q.options).size, q.id).toBe(q.options.length)
      }
      if (q.type === 'match') {
        expect(q.pairs.length, q.id).toBeGreaterThanOrEqual(3)
        expect(new Set(q.pairs.map((p) => p.right)).size, q.id).toBe(q.pairs.length)
        expect(new Set(q.pairs.map((p) => p.left)).size, q.id).toBe(q.pairs.length)
      }
    }
  })

  it('numerische Musterlösungen stimmen mit den Berechnungsfunktionen überein', () => {
    let checked = 0
    for (const q of QUESTION_BANK) {
      if (q.type !== 'numeric' || !q.verify) continue
      const computed = compute(q.verify)
      expect(computed, q.id).not.toBeNull()
      expect(isAnswerCorrect(q, computed!), `${q.id}: berechnet ${computed}, Musterlösung ${q.answer}`).toBe(true)
      checked++
    }
    expect(checked).toBeGreaterThanOrEqual(50)
  })

  it('alle Berechnungsaufgaben sind maschinell überprüft', () => {
    for (const q of QUESTION_BANK) if (q.type === 'numeric') expect(q.verify, q.id).toBeDefined()
  })

  it('Glossar-Verständnisfragen sind gültig', () => {
    expect(GLOSSARY).toHaveLength(9)
    for (const t of GLOSSARY) {
      expect(t.check.correctIndex).toBeLessThan(t.check.options.length)
      expect(t.confusions.length).toBeGreaterThan(0)
    }
  })
})

describe('Antwortprüfung', () => {
  it('liest deutsche und englische Dezimalzahlen', () => {
    expect(parseNumberInput('5,39')).toBeCloseTo(5.39)
    expect(parseNumberInput('021.8°')).toBeCloseTo(21.8)
    expect(parseNumberInput('4,5 kn')).toBeCloseTo(4.5)
    expect(parseNumberInput('abc')).toBeNull()
    expect(parseNumberInput('')).toBeNull()
  })

  it('Richtungstoleranz gilt über 000° hinweg', () => {
    const q = QUESTION_BANK.find((x) => x.id === 'ds-006')!
    expect(isAnswerCorrect(q, 3)).toBe(true)
    expect(isAnswerCorrect(q, 363)).toBe(true)
    expect(isAnswerCorrect(q, 355)).toBe(false)
  })

  it('Zuordnung ist nur bei vollständig richtiger Zuordnung korrekt', () => {
    const q = QUESTION_BANK.find((x) => x.type === 'match')!
    const n = q.type === 'match' ? q.pairs.length : 0
    const right = Array.from({ length: n }, (_, i) => i)
    expect(isAnswerCorrect(q, right)).toBe(true)
    expect(isAnswerCorrect(q, [...right].reverse())).toBe(false)
    expect(isAnswerCorrect(q, right.slice(1))).toBe(false)
    expect(isAnswerCorrect(q, 0)).toBe(false)
  })

  it('shuffle behält alle Elemente', () => {
    const s = shuffle([1, 2, 3, 4, 5])
    expect([...s].sort()).toEqual([1, 2, 3, 4, 5])
  })
})
