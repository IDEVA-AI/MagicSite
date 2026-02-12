export function ProjectsIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
      <rect x="28" y="6" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
      <rect x="6" y="28" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />
      <rect x="28" y="28" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="2.5" />

      {/* Inner details */}
      <rect x="9" y="9" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <rect x="31" y="9" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <rect x="9" y="31" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />
      <rect x="31" y="31" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="1.5" opacity="0.4" />

      {/* Center dots */}
      <circle cx="13" cy="13" r="2" fill="currentColor" />
      <circle cx="35" cy="13" r="2" fill="currentColor" />
      <circle cx="13" cy="35" r="2" fill="currentColor" />
      <circle cx="35" cy="35" r="2" fill="currentColor" />

      {/* Connecting lines */}
      <path d="M20 13 L28 13" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.3" />
      <path d="M13 20 L13 28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.3" />
      <path d="M35 20 L35 28" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.3" />
      <path d="M20 35 L28 35" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" opacity="0.3" />
    </svg>
  )
}

export function CompletedIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1.5" opacity="0.3" />
      <circle cx="24" cy="24" r="10" stroke="currentColor" strokeWidth="1" opacity="0.2" />

      {/* Checkmark with shadow */}
      <path
        d="M14 24L20 30L34 16"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.2"
        transform="translate(1, 1)"
      />
      <path
        d="M14 24L20 30L34 16"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Decorative dots */}
      <circle cx="24" cy="6" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="24" cy="42" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="6" cy="24" r="1.5" fill="currentColor" opacity="0.5" />
      <circle cx="42" cy="24" r="1.5" fill="currentColor" opacity="0.5" />
    </svg>
  )
}

export function TimeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="18" stroke="currentColor" strokeWidth="2.5" />
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="1" opacity="0.2" />

      {/* Hour markers */}
      <path d="M24 8 L24 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M24 37 L24 40" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 24 L11 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M37 24 L40 24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Diagonal markers */}
      <path d="M14 14 L16 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M34 14 L32 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M14 34 L16 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />
      <path d="M34 34 L32 32" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {/* Clock hands with shadow */}
      <path
        d="M24 24 L24 14"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        opacity="0.2"
        transform="translate(0.5, 0.5)"
      />
      <path
        d="M24 24 L30 30"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        opacity="0.2"
        transform="translate(0.5, 0.5)"
      />

      <path d="M24 24 L24 14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M24 24 L30 30" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />

      {/* Center dot */}
      <circle cx="24" cy="24" r="3" fill="currentColor" />
      <circle cx="24" cy="24" r="1.5" fill="currentColor" opacity="0.3" />
    </svg>
  )
}

export function EconomyIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Grid background */}
      <path d="M6 12 L42 12" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <path d="M6 20 L42 20" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <path d="M6 28 L42 28" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />
      <path d="M6 36 L42 36" stroke="currentColor" strokeWidth="0.5" opacity="0.2" />

      {/* Shadow line */}
      <path
        d="M6 36 L14 28 L22 32 L30 20 L42 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.15"
        transform="translate(1, 1)"
      />

      {/* Main line */}
      <path
        d="M6 36 L14 28 L22 32 L30 20 L42 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Dotted trend line */}
      <path
        d="M6 36 L14 28 L22 32 L30 20 L42 12"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.3"
        strokeDasharray="3 3"
      />

      {/* Data points */}
      <circle cx="6" cy="36" r="2.5" fill="currentColor" />
      <circle cx="14" cy="28" r="2.5" fill="currentColor" />
      <circle cx="22" cy="32" r="2.5" fill="currentColor" />
      <circle cx="30" cy="20" r="2.5" fill="currentColor" />
      <circle cx="42" cy="12" r="2.5" fill="currentColor" />

      {/* Inner circles */}
      <circle cx="6" cy="36" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="14" cy="28" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="22" cy="32" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="30" cy="20" r="1" fill="currentColor" opacity="0.3" />
      <circle cx="42" cy="12" r="1" fill="currentColor" opacity="0.3" />

      {/* Arrow */}
      <path
        d="M36 12 L42 12 L42 18"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
