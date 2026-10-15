export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden>
      <rect width="64" height="64" rx="14" fill="#0b1d33" />
      <circle cx="32" cy="32" r="20" fill="none" stroke="#2dd4bf" strokeWidth="3" />
      <path d="M32 10 L38 32 L32 54 L26 32 Z" fill="#f97316" />
      <path d="M32 10 L38 32 L26 32 Z" fill="#fff" />
    </svg>
  )
}
