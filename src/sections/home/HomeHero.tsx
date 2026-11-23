'use client';

import { motion } from 'motion/react';
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react';
import { ensureGsap, MOTION_OK } from '@/animations/gsap';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';
import { ButtonLink, TextLink } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { images } from '@/content/images';
import { home } from '@/content/pages';
import { cn } from '@/lib/utils';
import { INTRO_DONE_EVENT, INTRO_EXIT_EVENT } from './IntroSequence';

const SLIDE_MS = 6500;

const subscribeIntro = (onChange: () => void) => {
  window.addEventListener(INTRO_DONE_EVENT, onChange);
  return () => window.removeEventListener(INTRO_DONE_EVENT, onChange);
};
const introOver = () => document.documentElement.dataset.intro === 'seen';

/**
 * Dark, photograph-led hero. Three photographs crossfade with a slow zoom on the
 * right, dissolving into the navy ground on their left edge so the headline never
 * sits on an image. The slideshow can be paused (WCAG 2.2.2), stops while the tab
 * is hidden or the pointer rests on it, and does not run with reduced motion.
 * The entrance plays as the opening sequence's curtains lift.
 */
export function HomeHero() {
  const root = useRef<HTMLElement>(null);
  const { hero } = home;
  const reduced = useClientSnapshot(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    false,
  );
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  // The slideshow waits for the opening sequence, which ends on the first photograph.
  const ready = useSyncExternalStore(subscribeIntro, introOver, () => false);
  const running = ready && !reduced && !paused && !hovering && !tabHidden;

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => setActive((i) => (i + 1) % hero.slides.length), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [active, running, hero.slides.length]);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap } = ensureGsap();
    const mm = gsap.matchMedia();
    mm.add(
      MOTION_OK,
      () => {
        const lines = el.querySelectorAll('[data-hero-line]');
        const items = el.querySelectorAll('[data-hero-item]');
        const media = el.querySelector('[data-hero-media]');
        const rule = el.querySelector('[data-hero-rule]');
        gsap.set(lines, { yPercent: 112 });
        gsap.set(items, { opacity: 0, y: 22 });
        gsap.set(rule, { scaleX: 0 });

        const introPending =
          document.documentElement.dataset.intro !== 'seen' && document.querySelector('.intro-overlay');
        // After the opening sequence the photograph is already in place (the intro lands
        // it there), so only the copy animates; otherwise the photograph unveils too.
        if (!introPending) gsap.set(media, { clipPath: 'inset(0% 0% 0% 100%)', scale: 1.08 });

        const play = (delay = 0, withMedia = true) => {
          const tl = gsap.timeline({ delay });
          if (withMedia) {
            tl.to(media, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.8, ease: 'power4.inOut' }, 0).to(
              media,
              { scale: 1, duration: 2.6, ease: 'expo.out' },
              0.2,
            );
          }
          return tl
            .to(lines, { yPercent: 0, duration: 1.35, stagger: 0.12, ease: 'expo.out' }, withMedia ? 0.35 : 0)
            .to(rule, { scaleX: 1, duration: 1.2, ease: 'expo.inOut' }, withMedia ? 0.5 : 0.15)
            .to(items, { opacity: 1, y: 0, duration: 1.1, stagger: 0.09 }, withMedia ? 0.6 : 0.25);
        };

        if (introPending) {
          const onExit = () => play(0, false);
          window.addEventListener(INTRO_EXIT_EVENT, onExit, { once: true });
          return () => window.removeEventListener(INTRO_EXIT_EVENT, onExit);
        }
        play(0.1);
      },
      el,
    );
    return () => mm.revert();
  }, []);

  return (
    <section
      ref={root}
      aria-labelledby="hero-title"
      className="on-dark relative isolate overflow-hidden bg-forest text-white"
      onPointerEnter={() => setHovering(true)}
      onPointerLeave={() => setHovering(false)}
    >
      <div
        data-hero-media
        className="relative h-[26rem] feather-bottom sm:h-[32rem] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[38%] lg:h-auto lg:feather-left"
      >
        {hero.slides.map((slide, index) => {
          const isActive = index === active;
          return (
            <motion.div
              key={slide.image}
              data-hero-image={index === 0 ? '' : undefined}
              aria-hidden={!isActive}
              className="absolute inset-0 will-change-[opacity,transform]"
              initial={false}
              animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 1.08 }}
              transition={{
                opacity: { duration: 1.6, ease: [0.45, 0, 0.2, 1] },
                scale: { duration: isActive ? 8 : 1.6, ease: 'linear' },
              }}
            >
              <Picture
                image={slide.image}
                position={slide.position}
                sizes="(min-width: 1024px) 66vw, 100vw"
                preload={index === 0}
                quality={78}
                ground="dark"
                className="absolute inset-0"
              />
            </motion.div>
          );
        })}
      </div>

      <div className="relative container-site grid min-h-0 lg:min-h-[max(44rem,94svh)] lg:grid-cols-12">
        <div className="flex flex-col justify-center pt-4 pb-16 lg:col-span-7 lg:max-w-[46rem] lg:pt-[9.5rem] lg:pb-20">
          <p data-hero-item className="flex items-center gap-5 eyebrow text-parchment">
            {hero.eyebrow}
            <span aria-hidden data-hero-rule className="rule w-16 origin-left" />
          </p>
          <h1
            id="hero-title"
            className="mt-7 font-display text-[clamp(2.75rem,1.4rem+3.4vw,4.75rem)] leading-[1.02] [font-weight:400] tracking-[-0.01em] text-white"
          >
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-hero-line className="block">
                {hero.title.first}
              </span>
            </span>
            <span className="block overflow-hidden pb-[0.08em]">
              <span data-hero-line className="block">
                {hero.title.second} <em className="italic">{hero.title.accent}</em>
              </span>
            </span>
          </h1>
          <p
            data-hero-item
            className="mt-7 max-w-[27rem] font-display text-[1.375rem] leading-[1.4] text-white/90"
          >
            {hero.statement}
          </p>
          <div data-hero-item className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <ButtonLink href="/menu" variant="sand" arrow>
              Explore our menu
            </ButtonLink>
            <TextLink href="/reservations" tone="light">
              Reserve a table
            </TextLink>
          </div>

          <div data-hero-item className="mt-14 flex items-center gap-6">
            <div role="group" aria-label="Hero photographs" className="flex items-center gap-5">
              {hero.slides.map((slide, index) => {
                const isActive = index === active;
                return (
                  <button
                    key={slide.image}
                    type="button"
                    onClick={() => setActive(index)}
                    aria-pressed={isActive}
                    className={cn(
                      'flex min-h-11 items-center gap-3 text-[0.75rem] font-medium tracking-[0.14em] tabular transition-colors duration-300',
                      isActive ? 'text-white' : 'text-white/60 hover:text-white',
                    )}
                  >
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className="sr-only">
                      {' '}
                      of {String(hero.slides.length).padStart(2, '0')}: {images[slide.image].alt}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        'relative block h-px overflow-hidden bg-white/30 transition-[width] duration-700 ease-(--ease-out-expo)',
                        isActive ? 'w-16' : 'w-5',
                      )}
                    >
                      {isActive && (
                        <motion.span
                          key={`${active}-${running}`}
                          className="absolute inset-0 origin-left bg-white"
                          initial={{ scaleX: running ? 0 : 1 }}
                          animate={{ scaleX: 1 }}
                          transition={{ duration: running ? SLIDE_MS / 1000 : 0, ease: 'linear' }}
                        />
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
            {!reduced && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-pressed={paused}
                className="inline-flex size-11 items-center justify-center rounded-full border border-white/30 text-white/85 transition-colors duration-300 hover:border-white hover:text-white"
              >
                <Icon
                  name={paused ? 'play' : 'pause'}
                  className="size-3.5"
                  label={paused ? 'Play slideshow' : 'Pause slideshow'}
                />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
