import { MotionScope } from '@/animations/MotionScope';
import { Roadmap } from '@/sections/shared/Roadmap';
import { Gallery } from '@/components/gallery/Gallery';
import { JsonLd } from '@/components/seo/JsonLd';
import { Picture } from '@/components/ui/Picture';
import { SectionIntro } from '@/components/ui/SectionIntro';
import { story } from '@/content/pages';
import { env } from '@/lib/env/server';
import { breadcrumbJsonLd } from '@/lib/seo/jsonld';
import { pageMetadata } from '@/lib/seo/metadata';
import { PageHero } from '@/sections/shared/PageHero';
import { TableAwaits } from '@/sections/shared/TableAwaits';

export const metadata = pageMetadata('story');

export default function StoryPage() {
  const s = story;
  return (
    <MotionScope>
      <PageHero
        eyebrow={s.hero.eyebrow}
        title={s.hero.title}
        accent={s.hero.accent}
        intro={s.hero.intro}
        image={s.hero.image}
        position={s.hero.position}
      />

      {/* 01 Philosophy — a typographic statement, no imagery */}
      <section aria-labelledby="philosophy-title" className="bg-cream section-y">
        <div className="container-site grid-editorial gap-y-10">
          <p data-reveal className="col-span-4 eyebrow text-bronze md:col-span-2">
            {s.philosophy.eyebrow}
          </p>
          <div className="col-span-4 md:col-span-6 lg:col-span-9 lg:col-start-4">
            <h2
              id="philosophy-title"
              data-split-lines
              className="font-display text-[clamp(2.75rem,1.6rem+3.4vw,4.75rem)] leading-[1.02]"
            >
              {s.philosophy.title}
            </h2>
            <p data-reveal className="mt-10 max-w-3xl font-display text-h3 text-ink">
              {s.philosophy.text}
            </p>
          </div>
        </div>
      </section>

      {/* 02 History — the roadmap */}
      <Roadmap
        id="history-title"
        eyebrow={s.history.eyebrow}
        title={s.history.title}
        intro={s.history.intro}
        milestones={s.history.timeline}
      />

      {/* 03 Culinary approach */}
      <section aria-labelledby="approach-title" className="on-dark bg-forest section-y text-white">
        <div className="container-site grid-editorial items-start gap-y-14">
          <div className="col-span-4 md:col-span-6 lg:sticky lg:top-32 lg:col-span-5">
            <SectionIntro
              tone="light"
              eyebrow={s.approach.eyebrow}
              title={s.approach.title}
              id="approach-title"
            />
            <Picture
              image={s.approach.image}
              sizes="(min-width: 1024px) 38vw, 90vw"
              aspect="4 / 5"
              reveal
              ground="dark"
              className="mt-12 hidden lg:block"
            />
          </div>
          <ol className="col-span-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            {s.approach.rules.map((rule, index) => (
              <li
                key={rule.title}
                data-reveal
                className="border-t border-white/15 py-10 first:border-t-0 first:pt-0 lg:py-14"
              >
                <span className="font-display text-h2 text-parchment tabular">0{index + 1}</span>
                <h3 className="mt-4 text-h3">{rule.title}</h3>
                <p className="mt-4 max-w-(--container-prose) font-display text-[1.2rem] leading-[1.5] text-white/85">
                  {rule.text}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 04 Chef profile */}
      <section aria-labelledby="story-chef-title" className="bg-cream section-y">
        <div className="container-site grid-editorial items-end gap-y-12">
          <div className="col-span-4 md:col-span-5 lg:col-span-6">
            <Picture
              image={s.chef.image}
              sizes="(min-width: 1024px) 48vw, 70vw"
              aspect="4 / 5"
              reveal
              position="50% 35%"
            />
          </div>
          <div className="col-span-4 md:col-span-7 md:col-start-2 lg:col-span-5 lg:col-start-8">
            <SectionIntro eyebrow={s.chef.eyebrow} title={s.chef.title} id="story-chef-title" />
            <div data-reveal className="mt-8 space-y-5 font-display text-[1.2rem] leading-[1.55] text-ink">
              {s.chef.paragraphs.map((p) => (
                <p key={p.slice(0, 24)}>{p}</p>
              ))}
            </div>
            <blockquote
              data-reveal
              className="mt-10 border-l border-bronze pl-6 font-display text-h3 text-forest italic"
            >
              “{s.chef.quote}”
            </blockquote>
          </div>
        </div>
      </section>

      {/* 05 Sourcing */}
      <section aria-labelledby="sourcing-title" className="on-dark bg-forest section-y text-white">
        <div className="container-site grid-editorial gap-y-14">
          <div className="col-span-4 md:col-span-8 lg:col-span-5">
            <SectionIntro
              tone="light"
              eyebrow={s.sourcing.eyebrow}
              title={s.sourcing.title}
              id="sourcing-title"
            >
              <p>{s.sourcing.text}</p>
            </SectionIntro>
            <dl data-reveal-stagger className="mt-14 grid grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {s.sourcing.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="sr-only">{fact.label}</dt>
                  <dd>
                    <span className="block font-display text-h2 text-white tabular">{fact.value}</span>
                    <span className="mt-2 block text-caption text-white/80">{fact.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="col-span-4 grid grid-cols-5 gap-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
            <Picture
              image={s.sourcing.images.primary}
              sizes="(min-width: 1024px) 30vw, 60vw"
              aspect="3 / 4"
              reveal
              ground="dark"
              className="col-span-3"
            />
            <Picture
              image={s.sourcing.images.secondary}
              sizes="(min-width: 1024px) 20vw, 40vw"
              aspect="3 / 4"
              reveal
              ground="dark"
              className="col-span-2 mt-24"
            />
          </div>
        </div>
      </section>

      {/* 06 Craft */}
      <section aria-labelledby="craft-title" className="bg-cream section-y">
        <div className="container-site grid-editorial items-center gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:col-span-7">
            <Picture
              image={s.craft.images.primary}
              sizes="(min-width: 1024px) 56vw, 100vw"
              aspect="16 / 11"
              reveal
            />
          </div>
          <div className="col-span-4 md:col-span-6 lg:col-span-4 lg:col-start-9">
            <SectionIntro eyebrow={s.craft.eyebrow} title={s.craft.title} id="craft-title">
              <p>{s.craft.text}</p>
            </SectionIntro>
            <Picture
              image={s.craft.images.secondary}
              sizes="(min-width: 1024px) 26vw, 60vw"
              aspect="4 / 5"
              reveal
              className="mt-12 w-3/4"
            />
          </div>
        </div>
      </section>

      {/* 07 Architecture — photography plus the interactive glass installation */}
      <section aria-labelledby="architecture-title" className="on-dark bg-forest section-y text-white">
        <div className="container-site">
          <div className="grid-editorial gap-y-12">
            <div className="col-span-4 md:col-span-8 lg:col-span-5">
              <SectionIntro
                tone="light"
                eyebrow={s.architecture.eyebrow}
                title={s.architecture.title}
                id="architecture-title"
              >
                <p>{s.architecture.text}</p>
              </SectionIntro>
            </div>
            <div className="col-span-4 grid grid-cols-2 gap-4 md:col-span-8 lg:col-span-6 lg:col-start-7">
              <Picture
                image={s.architecture.images.primary}
                sizes="(min-width: 1024px) 28vw, 50vw"
                aspect="3 / 4"
                reveal
                ground="dark"
              />
              <Picture
                image={s.architecture.images.secondary}
                sizes="(min-width: 1024px) 28vw, 50vw"
                aspect="3 / 4"
                reveal
                ground="dark"
                className="mt-16"
              />
            </div>
          </div>
        </div>
      </section>

      {/* 08 Dining atmosphere */}
      <section aria-labelledby="evening-title" className="bg-cream section-y">
        <div className="container-site grid-editorial items-center gap-y-12">
          <div className="col-span-4 md:col-span-8 lg:order-2 lg:col-span-7 lg:col-start-6">
            <Picture
              image={s.atmosphere.image}
              sizes="(min-width: 1024px) 56vw, 100vw"
              aspect="16 / 11"
              reveal
            />
          </div>
          <div className="col-span-4 md:col-span-6 lg:order-1 lg:col-span-4">
            <SectionIntro eyebrow={s.atmosphere.eyebrow} title={s.atmosphere.title} id="evening-title">
              <p>{s.atmosphere.text}</p>
            </SectionIntro>
          </div>
        </div>
      </section>

      {/* 09 Gallery */}
      <section aria-labelledby="gallery-title" className="bg-cream pb-[var(--spacing-section)]">
        <div className="container-site">
          <SectionIntro
            eyebrow={s.gallery.eyebrow}
            title={s.gallery.title}
            id="gallery-title"
            className="mb-16"
          />
          <Gallery items={s.gallery.items} variant="story" />
        </div>
      </section>

      {/* 10 Reservation CTA */}
      <TableAwaits />

      <JsonLd data={breadcrumbJsonLd(env.siteUrl, 'story')} />
    </MotionScope>
  );
}
