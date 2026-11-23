import type { ReactNode } from 'react';
import { Picture } from '@/components/ui/Picture';
import type { ImageKey } from '@/content/images';

interface PageHeroProps {
  eyebrow: string;
  title: string | readonly string[];
  /** Optional final word(s), set in italic after the last title line. */
  accent?: string;
  intro: string;
  image: ImageKey;
  position?: string;
  aside?: ReactNode;
  id?: string;
}

/**
 * Inner-page hero in the home page's language: a deep-navy band, the title and
 * lead on the left, and a photograph that dissolves into the navy from the right
 * (a feathered edge, never an overlay on text).
 */
export function PageHero({
  eyebrow,
  title,
  accent,
  intro,
  image,
  position,
  aside,
  id = 'page-title',
}: PageHeroProps) {
  const lines = typeof title === 'string' ? [title] : title;
  return (
    <section aria-labelledby={id} className="on-dark relative isolate overflow-hidden bg-forest text-white">
      <div className="hero-window relative h-[20rem] overflow-hidden feather-bottom sm:h-[26rem] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[42%] lg:h-auto lg:feather-left">
        <Picture
          image={image}
          sizes="(min-width: 1024px) 58vw, 100vw"
          preload
          quality={76}
          position={position}
          ground="dark"
          className="absolute inset-0 animate-[hero-settle-deep_2.4s_var(--ease-out-expo)_both]"
        />
      </div>
      <div className="relative container-site grid lg:min-h-[38rem] lg:grid-cols-12">
        <div className="flex flex-col justify-center pt-2 pb-16 lg:col-span-6 lg:pt-[9rem] lg:pb-20">
          <p data-reveal className="flex items-center gap-5 eyebrow text-parchment">
            {eyebrow}
            <span aria-hidden data-rule className="rule w-16" />
          </p>
          <h1
            id={id}
            data-split-lines
            className="mt-6 font-display text-[clamp(3rem,1.6rem+4.4vw,5.25rem)] leading-[1.02] [font-weight:400] text-white"
          >
            {lines.map((line, index) => (
              <span key={line} className="block">
                {line}
                {accent && index === lines.length - 1 && (
                  <>
                    {' '}
                    <em className="italic">{accent}</em>
                  </>
                )}
              </span>
            ))}
          </h1>
          <p
            data-reveal
            className="mt-6 max-w-[28rem] font-display text-[1.3rem] leading-[1.45] text-white/90"
          >
            {intro}
          </p>
          {aside && (
            <div data-reveal className="mt-9">
              {aside}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
