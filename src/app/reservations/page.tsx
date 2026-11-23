import { MotionScope } from '@/animations/MotionScope';
import { ReservationForm } from '@/components/forms/ReservationForm';
import { JsonLd } from '@/components/seo/JsonLd';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { faq, reservationsPage } from '@/content/pages';
import { openingHours, site } from '@/content/site';
import { env } from '@/lib/env/server';
import { breadcrumbJsonLd, faqJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { PageHero } from '@/sections/shared/PageHero';

export const metadata = pageMetadata('reservations');

export default function ReservationsPage() {
  const { hero, visit } = reservationsPage;
  const privateDining = {
    text: 'The private room seats nine to sixteen guests with its own menu. Write to us with your date and party size and we will reply with options.',
  };
  const mapUrl = env.raw.NEXT_PUBLIC_MAP_EMBED_URL;

  return (
    <MotionScope>
      <PageHero
        eyebrow={hero.eyebrow}
        title={hero.title}
        accent={hero.accent}
        intro={hero.intro}
        image={hero.image}
      />

      <section aria-label="Reservation request" className="bg-cream py-[clamp(3.5rem,7vw,6.5rem)]">
        <div className="container-site">
          <ReservationForm />
        </div>
      </section>

      <section
        id="private-dining"
        aria-labelledby="private-dining-title"
        className="on-dark grid scroll-mt-24 bg-forest text-white md:grid-cols-2"
      >
        <div className="relative min-h-[20rem] overflow-hidden md:min-h-[30rem]">
          <div data-reveal-mask className="absolute inset-0">
            <Picture
              image="heroDiningRoom"
              position="82% 50%"
              sizes="(min-width: 768px) 50vw, 100vw"
              parallax={0.1}
              ground="dark"
              className="absolute inset-0"
            />
          </div>
        </div>
        <div className="flex flex-col justify-center px-[var(--spacing-gutter)] py-[clamp(3.5rem,7vw,6rem)] md:px-[clamp(2.5rem,5vw,5rem)]">
          <SectionIntro
            tone="light"
            eyebrow="Private dining"
            title="A Room of Your Own"
            id="private-dining-title"
          >
            <p>{privateDining.text}</p>
          </SectionIntro>
          <p data-reveal className="mt-8 font-display text-[1.15rem] text-white/85">
            Write to {site.contact.email} with your date and party size.
          </p>
        </div>
      </section>

      <section id="visit" aria-labelledby="visit-title" className="scroll-mt-24 bg-cream section-y">
        <div className="container-site grid-editorial gap-y-14">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <p data-reveal className="mb-6 flex items-center gap-4 eyebrow text-bronze">
              <span aria-hidden className="h-px w-10 bg-bronze/60" />
              {visit.eyebrow}
            </p>
            <h2
              id="visit-title"
              data-split-lines
              className="font-display text-[clamp(2.5rem,1.6rem+2.6vw,3.6rem)] leading-[1.04]"
            >
              {visit.title}
            </h2>

            <dl data-reveal className="mt-12 grid gap-8 sm:grid-cols-2">
              <div>
                <dt className="mb-3 eyebrow text-bronze">Address</dt>
                <dd className="text-ink">
                  {site.contact.address ? (
                    <address className="not-italic">
                      {site.contact.address.street}
                      <br />
                      {site.contact.address.postalCode} {site.contact.address.locality}
                    </address>
                  ) : (
                    <>
                      To be confirmed
                      <span className="mt-1 block text-caption text-ink/80">
                        Published with the opening announcement.
                      </span>
                    </>
                  )}
                </dd>
              </div>
              <div>
                <dt className="mb-3 eyebrow text-bronze">Phone</dt>
                <dd className="text-ink">{site.contact.phone ?? 'To be confirmed'}</dd>
              </div>
              <div>
                <dt className="mb-3 eyebrow text-bronze">Email</dt>
                <dd className="break-all text-ink">{site.contact.email}</dd>
              </div>
              <div>
                <dt className="mb-3 eyebrow text-bronze">Directions</dt>
                <dd className="text-ink">
                  {site.contact.directionsUrl ? (
                    <a
                      href={site.contact.directionsUrl}
                      className="link-draw"
                      rel="noopener noreferrer"
                      target="_blank"
                    >
                      Open in maps
                    </a>
                  ) : (
                    'Available once the address is published'
                  )}
                </dd>
              </div>
            </dl>

            <div data-reveal className="mt-12 border-t border-bronze/15 pt-8">
              <h3 className="mb-5 eyebrow text-bronze">Opening hours</h3>
              <table className="w-full text-small">
                <caption className="sr-only">Opening hours by day</caption>
                <tbody>
                  {openingHours.map(({ day, periods }) => (
                    <tr key={day} className="border-b border-moss/10 last:border-b-0">
                      <th scope="row" className="py-2.5 pr-6 text-left font-medium text-moss">
                        {day}
                      </th>
                      <td className="py-2.5 text-right text-ink/90 tabular">
                        {periods.length
                          ? periods.map((p) => `${p.label} ${p.opens}–${p.closes}`).join(' · ')
                          : 'Closed'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="col-span-4 space-y-10 md:col-span-8 lg:col-span-6 lg:col-start-7">
            <div data-reveal className="relative aspect-[4/3] overflow-hidden border border-moss/10 bg-white">
              {mapUrl ? (
                <iframe
                  src={mapUrl}
                  title="Map showing the location of AZURE"
                  className="absolute inset-0 h-full w-full"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="absolute inset-0 flex flex-col justify-between p-8">
                  {/* Architectural hairline grid — a placeholder, not an invented map. */}
                  <div
                    aria-hidden
                    className="absolute inset-0 [background-image:linear-gradient(rgb(140_169_214/0.16)_1px,transparent_1px),linear-gradient(90deg,rgb(140_169_214/0.16)_1px,transparent_1px)] [background-size:48px_48px] opacity-50"
                  />
                  <p className="relative eyebrow text-bronze">Location</p>
                  <div className="relative">
                    <Icon name="info" className="mb-4 size-6 text-bronze" />
                    <p className="font-display text-h3 text-forest">
                      The map appears here once the address is public.
                    </p>
                    <p className="mt-3 max-w-sm text-small text-ink/85">
                      Set <code className="text-bronze">NEXT_PUBLIC_MAP_EMBED_URL</code> to enable an embedded
                      map.
                    </p>
                  </div>
                </div>
              )}
            </div>
            <div data-reveal className="grid gap-8 sm:grid-cols-2">
              <div>
                <h3 className="mb-3 eyebrow text-bronze">Parking & transport</h3>
                <p className="text-small text-ink">{visit.parking}</p>
              </div>
              <div>
                <h3 className="mb-3 eyebrow text-bronze">Accessibility</h3>
                <p className="text-small text-ink">{visit.accessibility}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="faq-title" className="bg-sand section-y">
        <div className="container-site grid-editorial gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-4">
            <p data-reveal className="mb-6 flex items-center gap-4 eyebrow text-bronze">
              <span aria-hidden className="h-px w-10 bg-bronze/50" />
              Questions
            </p>
            <h2 id="faq-title" data-split-lines className="text-h2">
              Before you visit.
            </h2>
          </div>
          {/* Native <details>: works without JavaScript and keeps answers in the HTML for crawlers. */}
          <div className="col-span-4 border-t border-moss/15 md:col-span-8 lg:col-span-7 lg:col-start-6">
            {faq.map((item) => (
              <details key={item.id} id={item.id} className="group border-b border-moss/15">
                <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-6 py-5 text-left font-display text-h4 text-moss marker:hidden [&::-webkit-details-marker]:hidden">
                  {item.question}
                  <span aria-hidden className="relative size-5 shrink-0 text-bronze">
                    <Icon
                      name="plus"
                      className="absolute inset-0 transition-transform duration-300 group-open:rotate-45"
                    />
                  </span>
                </summary>
                <p className="max-w-2xl pb-6 text-ink/90">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <JsonLd data={faqJsonLd()} />
      <JsonLd data={breadcrumbJsonLd(env.siteUrl, 'reservations')} />
    </MotionScope>
  );
}
