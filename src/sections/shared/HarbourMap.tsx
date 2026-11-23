/**
 * A quiet, hand-drawn style map of a fictional harbour, used on the home page
 * (Find us) and on the Reservations page (Finding us). `idPrefix` keeps the SVG
 * pattern and gradient ids unique when more than one map is in the document.
 */
export function HarbourMap({ idPrefix = 'harbour' }: { idPrefix?: string }) {
  return (
    <svg
      viewBox="0 0 800 640"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 size-full"
      role="img"
      aria-label="Map of the harbour with AZURE marked on the quay"
    >
      <defs>
        <pattern
          id={`${idPrefix}-water-lines`}
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-8)"
        >
          <path d="M0 9 Q4.5 6 9 9 T18 9" fill="none" stroke="rgba(213,206,182,0.09)" strokeWidth="1" />
        </pattern>
        <radialGradient id={`${idPrefix}-map-glow`} cx="0.56" cy="0.52" r="0.6">
          <stop offset="0" stopColor="rgba(224,209,185,0.10)" />
          <stop offset="1" stopColor="rgba(224,209,185,0)" />
        </radialGradient>
      </defs>

      {/* Land and water. */}
      <rect width="800" height="640" fill="#232a1c" />
      <path
        d="M0 352 C90 330 150 372 236 360 S372 318 452 352 S560 440 640 430 S752 410 800 432 L800 640 L0 640 Z"
        fill="#161a12"
      />
      <path
        d="M0 352 C90 330 150 372 236 360 S372 318 452 352 S560 440 640 430 S752 410 800 432 L800 640 L0 640 Z"
        fill={`url(#${idPrefix}-water-lines)`}
      />
      <rect width="800" height="640" fill={`url(#${idPrefix}-map-glow)`} />

      <g data-draw-scroll fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* Coastline and the harbour wall. */}
        <path
          d="M0 352 C90 330 150 372 236 360 S372 318 452 352 S560 440 640 430 S752 410 800 432"
          stroke="#d5ceb6"
          strokeWidth="1.6"
        />
        <path d="M452 352 L470 470 L560 520" stroke="#d5ceb6" strokeWidth="5" opacity="0.55" />
        <path d="M236 360 L230 430" stroke="#d5ceb6" strokeWidth="5" opacity="0.4" />
        {/* Streets of the old town. */}
        <path
          d="M40 80 C200 110 330 70 520 120 S720 150 790 120"
          stroke="rgba(248,240,232,0.22)"
          strokeWidth="1.2"
        />
        <path
          d="M20 220 C180 240 320 210 470 250 S700 300 800 280"
          stroke="rgba(248,240,232,0.22)"
          strokeWidth="1.2"
        />
        <path d="M150 20 C160 140 140 230 170 345" stroke="rgba(248,240,232,0.18)" strokeWidth="1" />
        <path d="M330 30 C340 140 360 250 352 336" stroke="rgba(248,240,232,0.18)" strokeWidth="1" />
        <path d="M620 40 C600 160 630 300 610 420" stroke="rgba(248,240,232,0.18)" strokeWidth="1" />
      </g>
      {/* Walking route from the old town square to the door (dotted, so it is not drawn in). */}
      <g fill="none" stroke="#e0d1b9" strokeLinecap="round">
        <path
          d="M250 165 C300 190 330 230 380 262 S440 300 474 318"
          strokeWidth="1.8"
          strokeDasharray="0.5 7"
          className="map-route"
        />
        <circle cx="250" cy="165" r="6" strokeWidth="1.4" />
      </g>

      {/* Blocks of the old town. */}
      <g fill="rgba(248,240,232,0.045)">
        <rect x="60" y="110" width="70" height="88" rx="4" />
        <rect x="190" y="118" width="120" height="74" rx="4" />
        <rect x="372" y="132" width="96" height="92" rx="4" />
        <rect x="512" y="150" width="84" height="98" rx="4" />
        <rect x="660" y="160" width="110" height="96" rx="4" />
        <rect x="40" y="250" width="96" height="70" rx="4" />
        <rect x="200" y="262" width="118" height="60" rx="4" />
        <rect x="500" y="290" width="92" height="70" rx="4" />
      </g>

      {/* Labels. */}
      <g style={{ fontFamily: 'var(--font-display)' }} fill="rgba(248,240,232,0.55)">
        <text x="74" y="70" fontSize="15" letterSpacing="4">
          OLD TOWN
        </text>
        <text x="90" y="520" fontSize="24" fontStyle="italic" fill="rgba(213,206,182,0.5)">
          The harbour
        </text>
        <text x="610" y="560" fontSize="13" letterSpacing="3">
          HARBOUR WALL
        </text>
        <text x="206" y="150" fontSize="12" letterSpacing="2.5">
          SQUARE
        </text>
      </g>

      {/* Compass. */}
      <g transform="translate(728 64)" stroke="rgba(248,240,232,0.6)" fill="none">
        <circle r="20" strokeWidth="1" />
        <path d="M0 -14 L5 4 L0 0 L-5 4 Z" fill="rgba(248,240,232,0.75)" stroke="none" />
        <text
          y="-26"
          textAnchor="middle"
          fontSize="11"
          fill="rgba(248,240,232,0.75)"
          stroke="none"
          letterSpacing="2"
        >
          N
        </text>
      </g>

      {/* The restaurant. */}
      <g transform="translate(476 320)">
        <g data-drop>
          <circle r="30" className="map-pulse" fill="rgba(224,209,185,0.18)" />
          <circle r="9" fill="#e0d1b9" />
          <circle r="3.5" fill="#1d2218" />
          <g transform="translate(20 -58)">
            <rect width="124" height="40" fill="#f8f0e8" />
            <path d="M14 40 L4 56 L30 40 Z" fill="#f8f0e8" />
            <text
              x="16"
              y="26"
              fontSize="17"
              letterSpacing="4"
              fill="#121209"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              AZURE
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
}
