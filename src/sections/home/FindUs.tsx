import { ButtonLink, TextLink } from '@/components/ui/Button';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { home } from '@/content/pages';
import { formatHoursSummary, site } from '@/content/site';

/**
 * Where to find the restaurant: an illustrated map of the harbour beside the
 * address, hours and directions. The map is drawn, not embedded (no third-party
 * tracking, works offline, matches the palette); its coastline, streets and the
 * walking route draw themselves on arrival and the marker breathes slowly.
 * The address itself is a placeholder until the business supplies one.
 */
export function FindUs() {
  const { visit } = home;
  return (
    <section aria-labelledby="visit-title" className="on-dark bg-forest text-white">
      <div className="grid lg:grid-cols-[1.25fr_1fr]">
        <figure className="relative min-h-[24rem] overflow-hidden border-white/10 lg:min-h-[40rem] lg:border-r">
          <HarbourMap />
          <figcaption className="sr-only">
            Illustrated map: AZURE sits on the quay at the end of the harbour wall, a five-minute walk from
            the old town square.
          </figcaption>
        </figure>

        <div className="flex flex-col justify-center px-[var(--spacing-gutter)] py-[clamp(4rem,8vw,7rem)] lg:px-[clamp(2.5rem,5vw,5.5rem)]">
          <SectionIntro tone="light" eyebrow={visit.eyebrow} title={visit.title} id="visit-title">
            <p>{visit.text}</p>
          </SectionIntro>

          <dl data-reveal-stagger className="mt-10 grid gap-x-10 gap-y-7 sm:grid-cols-2">
            <div>
              <dt className="eyebrow text-parchment">Address</dt>
              <dd className="mt-3 font-display text-[1.2rem] leading-snug">
                The old customs house, on the quay
                <span className="mt-1 block text-caption text-white/70">Full address to be confirmed</span>
              </dd>
            </div>
            <div>
              <dt className="eyebrow text-parchment">Hours</dt>
              <dd className="mt-3 space-y-1 text-[0.95rem] leading-relaxed text-white/85">
                {formatHoursSummary().map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </dd>
            </div>
            {visit.directions.map((d) => (
              <div key={d.label}>
                <dt className="eyebrow text-parchment">{d.label}</dt>
                <dd className="mt-3 font-display text-[1.125rem] leading-snug text-white/85">{d.text}</dd>
              </div>
            ))}
          </dl>

          <div data-reveal className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-5">
            <ButtonLink href="/reservations" variant="sand" arrow>
              Reserve a table
            </ButtonLink>
            <TextLink href="/reservations#visit" tone="light">
              Getting here
            </TextLink>
          </div>
          <p className="mt-6 text-caption text-white/60">
            {site.contact.email}
            {site.contact.emailIsPlaceholder && ' (placeholder address)'}
          </p>
        </div>
      </div>
    </section>
  );
}

/** A quiet, hand-drawn style map of a fictional harbour. */
function HarbourMap() {
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
          id="water-lines"
          width="18"
          height="18"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(-8)"
        >
          <path d="M0 9 Q4.5 6 9 9 T18 9" fill="none" stroke="rgba(213,206,182,0.09)" strokeWidth="1" />
        </pattern>
        <radialGradient id="map-glow" cx="0.56" cy="0.52" r="0.6">
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
        fill="url(#water-lines)"
      />
      <rect width="800" height="640" fill="url(#map-glow)" />

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
