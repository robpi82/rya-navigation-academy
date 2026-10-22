const ROSE_POINTS = [0, 90, 180, 270]
const ROSE_MINOR = [45, 135, 225, 315]

/** Kompassrose für Seitenleiste und Dashboard (goldene Haupt-, helle Nebenstriche). */
export function CompassRose({ className }: { className?: string }) {
  return (
    <svg viewBox="-50 -50 100 100" className={className} aria-hidden>
      <circle r="31" fill="none" stroke="#d6a84f" strokeWidth="1.2" opacity="0.8" />
      <circle r="27" fill="none" stroke="#d6a84f" strokeWidth="0.5" opacity="0.5" />
      {Array.from({ length: 32 }, (_, i) => (
        <line key={i} y1={-31} y2={i % 4 === 0 ? -27 : -29} stroke="#d6a84f" strokeWidth="0.6" transform={`rotate(${i * 11.25})`} opacity="0.7" />
      ))}
      {ROSE_MINOR.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -26 L4 -4 L0 0 Z" fill="#e8d3a2" />
          <path d="M0 -26 L-4 -4 L0 0 Z" fill="#a17a35" />
        </g>
      ))}
      {ROSE_POINTS.map((a) => (
        <g key={a} transform={`rotate(${a})`}>
          <path d="M0 -46 L6 -6 L0 0 Z" fill="#f3dfae" />
          <path d="M0 -46 L-6 -6 L0 0 Z" fill="#c8963e" />
        </g>
      ))}
      <circle r="3" fill="#0b1d33" stroke="#f3dfae" strokeWidth="1.2" />
    </svg>
  )
}
