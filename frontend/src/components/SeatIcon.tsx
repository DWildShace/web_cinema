export function SeatIcon({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 22" fill="currentColor" className={className} aria-hidden>
      {/* back rest */}
      <rect x="2" y="0" width="16" height="10" rx="2" />
      {/* seat */}
      <rect x="1" y="11" width="18" height="6" rx="2" />
      {/* legs */}
      <rect x="3" y="17" width="3" height="5" rx="1" />
      <rect x="14" y="17" width="3" height="5" rx="1" />
    </svg>
  )
}
