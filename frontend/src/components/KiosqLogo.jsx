export default function KiosqLogo({ className = "h-11 w-auto", iconOnly = false, light = false }) {
  if (iconOnly) {
    return (
      <svg
        viewBox="0 0 96 96"
        className={className}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Kiosq Logo"
      >
        {/* Kiosq Chat-Bubble Outer Frame */}
        <rect x="4" y="4" width="88" height="82" rx="24" fill={light ? "#FFFFFF" : "#0A0A0A"} />
        <polygon points="18,74 18,92 36,74" fill={light ? "#FFFFFF" : "#0A0A0A"} />

        {/* Inner Canvas */}
        <rect x="10" y="10" width="76" height="66" rx="18" fill={light ? "#0A0A0A" : "#FDFBF7"} />

        {/* Market Awning Canopy */}
        <path
          d="M18 28 C28 22 68 22 78 28 L80 46 C74 49 70 47 65 45 C60 43 56 43 49 45 C42 47 38 49 33 46 C28 44 24 46 16 46 Z"
          fill={light ? "#FFFFFF" : "#0A0A0A"}
        />

        {/* Awning Stripes */}
        <path d="M25 26 L27 45" stroke={light ? "#0A0A0A" : "#FDFBF7"} strokeWidth="3" strokeLinecap="round" />
        <path d="M41 24 L42 44" stroke={light ? "#0A0A0A" : "#FDFBF7"} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M55 24 L55 44" stroke={light ? "#0A0A0A" : "#FDFBF7"} strokeWidth="3.5" strokeLinecap="round" />
        <path d="M71 26 L70 45" stroke={light ? "#0A0A0A" : "#FDFBF7"} strokeWidth="3" strokeLinecap="round" />

        {/* Kiosk Posts */}
        <line x1="24" y1="46" x2="24" y2="60" stroke={light ? "#FFFFFF" : "#0A0A0A"} strokeWidth="3.5" strokeLinecap="round" />
        <line x1="72" y1="46" x2="72" y2="60" stroke={light ? "#FFFFFF" : "#0A0A0A"} strokeWidth="3.5" strokeLinecap="round" />

        {/* Kiosk Counter Shelf */}
        <rect x="18" y="59" width="60" height="5.5" rx="2.75" fill={light ? "#FFFFFF" : "#0A0A0A"} />

        {/* Escrow Safe Trade Green Badge */}
        <circle cx="48" cy="53" r="7.5" fill="#16A34A" />
        <path d="M44.5 53 L47 55.5 L51.5 50.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 375 96"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Kiosq - Chat Commerce"
    >
      {/* LOGO EMBLEM (Left) */}
      <g transform="translate(4, 4)">
        {/* Outer Chat-Bubble Frame */}
        <rect x="2" y="2" width="82" height="78" rx="22" fill={light ? "#FFFFFF" : "#0A0A0A"} />
        <polygon points="14,68 14,88 30,68" fill={light ? "#FFFFFF" : "#0A0A0A"} />

        {/* Inner Clean Store Canvas */}
        <rect x="7" y="7" width="72" height="65" rx="17" fill={light ? "#0A0A0A" : "#FDFBF7"} />

        {/* Kiosk Awning / Shop Canopy */}
        <path
          d="M15 25 C24 20 63 20 72 25 L74 41 C69 44 65 42 60 40 C55 38 51 38 44 40 C37 42 33 44 28 41 C23 39 19 41 13 41 Z"
          fill={light ? "#FFFFFF" : "#0A0A0A"}
        />

        {/* Awning Stripes */}
        <path d="M22 23 L23 40" stroke={light ? "#0A0A0A" : "#FDFBF7"} strokeWidth="2.8" strokeLinecap="round" />
        <path d="M37 21 L38 39" stroke={light ? "#0A0A0A" : "#FDFBF7"} strokeWidth="3" strokeLinecap="round" />
        <path d="M51 21 L51 39" stroke={light ? "#0A0A0A" : "#FDFBF7"} strokeWidth="3" strokeLinecap="round" />
        <path d="M65 23 L64 40" stroke={light ? "#0A0A0A" : "#FDFBF7"} strokeWidth="2.8" strokeLinecap="round" />

        {/* Kiosk Counter Posts */}
        <line x1="21" y1="41" x2="21" y2="54" stroke={light ? "#FFFFFF" : "#0A0A0A"} strokeWidth="3" strokeLinecap="round" />
        <line x1="66" y1="41" x2="66" y2="54" stroke={light ? "#FFFFFF" : "#0A0A0A"} strokeWidth="3" strokeLinecap="round" />

        {/* Kiosk Counter Shelf */}
        <rect x="16" y="53" width="56" height="4.5" rx="2.25" fill={light ? "#FFFFFF" : "#0A0A0A"} />

        {/* Escrow Green Badge */}
        <circle cx="43.5" cy="47" r="6.5" fill="#16A34A" />
        <path d="M40.5 47 L42.5 49 L46.5 45" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {/* WORDMARK: Kiosq & Tagline */}
      <g transform="translate(106, 59)">
        {/* Brand Title: Kiosq */}
        <text
          x="0"
          y="0"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="56"
          fill={light ? "#FFFFFF" : "#0A0A0A"}
          letterSpacing="-2"
        >
          Kiosq
        </text>

        {/* Emerald square accent on the 'q' */}
        <rect x="150" y="-45" width="10" height="10" rx="3" fill="#16A34A" />

        {/* Tagline Pill: CHAT • COMMERCE */}
        <g transform="translate(2, 14)">
          <rect x="0" y="-12" width="170" height="20" rx="10" fill={light ? "#FFFFFF" : "#0A0A0A"} />
          <text
            x="14"
            y="2"
            fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
            fontWeight="800"
            fontSize="10"
            fill={light ? "#0A0A0A" : "#FFFFFF"}
            letterSpacing="2.2"
          >
            CHAT • COMMERCE
          </text>
          {/* Escrow indicator dot */}
          <circle cx="152" cy="-2" r="3" fill="#16A34A" />
        </g>
      </g>
    </svg>
  );
}
