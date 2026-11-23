import { ButtonLink, TextLink } from '@/components/ui/Button';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { home } from '@/content/pages';
import { formatHoursSummary, site } from '@/content/site';
import { HarbourMap } from '@/sections/shared/HarbourMap';

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
