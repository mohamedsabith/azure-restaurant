'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';
import { ensureGsap } from '@/animations/gsap';
import { Picture } from '@/components/ui/Picture';
import type { ImageKey } from '@/content/images';
import { home } from '@/content/pages';

export const INTRO_DONE_EVENT = 'azure:intro-done';
/** Fired as the opening photograph settles into the hero, so the hero copy can rise with it. */
export const INTRO_EXIT_EVENT = 'azure:intro-exit';

/** Courses shown in the window, in order; the last is the hero's first photograph. */
const COURSES: { image: ImageKey; position?: string }[] = [
  { image: 'dishScallopsCaviar', position: '52% 60%' },
  { image: 'dishTruffleShaved', position: '58% 62%' },
  { image: 'dishLambShank', position: '50% 55%' },
];

function markSeen() {
  try {
    sessionStorage.setItem('azure:intro', 'seen');
  } catch {
    /* storage unavailable — intro will simply play again next visit */
  }
  document.documentElement.dataset.intro = 'seen';
  window.dispatchEvent(new Event(INTRO_DONE_EVENT));
}

function whenLoaded(img: HTMLImageElement | null): Promise<void> {
  if (!img || img.complete) return Promise.resolve();
  return new Promise((resolve) => {
    img.addEventListener('load', () => resolve(), { once: true });
    img.addEventListener('error', () => resolve(), { once: true });
  });
}

/** Where the hero photograph sits, ignoring any transform. */
function heroRect(): DOMRect {
  const media = document.querySelector<HTMLElement>('[data-hero-media]');
  return media ? media.getBoundingClientRect() : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
}

/**
 * Opening sequence (home page, first visit per session only).
 *
 * A small window opens in the dark and the courses arrive in it one after
 * another (scallops, truffle, lamb, then the fillet) behind the AZURE
 * wordmark, while a hairline and counter show real loading progress. Then the
 * name lifts away and the window opens out until the last photograph lands
 * exactly where the hero shows it, and the page fades up around it: no cut,
 * no curtain. About five seconds in all; it never waits longer than ~4.4s for loading, can be skipped, and is absent
 * with reduced motion (and for returning visitors in the same session).
 */
export function IntroSequence() {
  const root = useRef<HTMLDivElement>(null);
  const exitRef = useRef<() => void>(() => {});
  const [done, setDone] = useState(false);
  // Decided before first paint by /scripts/intro-gate.js (returning visitor or reduced motion).
  const seenAtLoad = useClientSnapshot(() => document.documentElement.dataset.intro === 'seen', false);
  const final = home.hero.slides[0] ?? { image: 'dishFilletCandle' as ImageKey, position: undefined };

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    if (document.documentElement.dataset.intro === 'seen') return;
    el.style.animation = 'none'; // JS is running: hand over from the CSS fallback to GSAP.
    const { gsap } = ensureGsap();
    let finished = false;

    const ctx = gsap.context(() => {
      const clip = el.querySelector<HTMLElement>('[data-intro-clip]');
      const frame = el.querySelector<HTMLElement>('[data-intro-frame]');
      const shift = el.querySelector<HTMLElement>('[data-intro-shift]');
      const shots = gsap.utils.toArray<HTMLElement>('[data-intro-shot]', el);
      const letters = el.querySelectorAll('[data-intro-letter]');
      const count = el.querySelector<HTMLElement>('[data-intro-count]');
      const bar = el.querySelector<HTMLElement>('[data-intro-bar]');
      if (!clip || !frame || !shift) return;

      // Geometry: the photographs are laid out exactly where the hero shows them; a
      // window centred in the viewport looks onto them, with the photographs shifted
      // so their centre sits in the window.
      const geometry = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const rect = heroRect();
        const width = Math.min(Math.max(208, vw * 0.22), 384);
        const height = Math.min(width * 1.25, vh * 0.56);
        const cx = vw / 2;
        const cy = vh / 2;
        Object.assign(frame.style, {
          left: `${rect.left}px`,
          top: `${rect.top}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
        });
        return {
          window: `inset(${cy - height / 2}px ${vw - cx - width / 2}px ${vh - cy - height / 2}px ${cx - width / 2}px)`,
          slit: `inset(${cy}px ${vw - cx - width / 2}px ${vh - cy}px ${cx - width / 2}px)`,
          dx: cx - (rect.left + rect.width / 2),
          dy: cy - (rect.top + rect.height / 2),
        };
      };
      const g = geometry();

      let windowClip = g.window;
      gsap.set(shift, { x: g.dx, y: g.dy, scale: 1.22 });
      gsap.set(shots.slice(1), { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(clip, { clipPath: g.slit });
      gsap.set(shots, { '--zoom': 1.18 });
      // y: 0 clears the stylesheet's pre-paint offset, which GSAP would otherwise read as pixels.
      gsap.set(letters, { y: 0, yPercent: 115 });
      gsap.set('[data-intro-fade]', { autoAlpha: 0, y: 10 });

      const intro = gsap.timeline();
      intro
        .to(
          '[data-intro-fade]',
          { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power2.out' },
          0.1,
        )
        .fromTo(clip, { clipPath: g.slit }, { clipPath: g.window, duration: 1.15, ease: 'expo.inOut' }, 0.15)
        .to(shift, { scale: 1.12, duration: 2.9, ease: 'power1.out' }, 0.15)
        .to(letters, { yPercent: 0, duration: 1.2, stagger: 0.07, ease: 'expo.out' }, 0.55);
      shots.forEach((shot, index) => {
        if (index === 0) return;
        const at = 0.85 + index * 0.42;
        intro
          .fromTo(
            shot,
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.75, ease: 'power3.inOut' },
            at,
          )
          .fromTo(shot, { '--zoom': 1.3 }, { '--zoom': 1.06, duration: 1.0, ease: 'expo.out' }, at);
      });

      // Real progress of what the first screen needs, never ahead of the sequence itself.
      const imgs = shots.map((shot) => shot.querySelector('img'));
      const tasks = [document.fonts?.ready ?? Promise.resolve(), ...imgs.map(whenLoaded)];
      let loaded = 0;
      tasks.forEach((task) => task.then(() => (loaded += 1)));
      const tick = () => {
        const p = Math.min(loaded / tasks.length, intro.progress());
        if (count) count.textContent = String(Math.round(p * 100)).padStart(3, '0');
        if (bar) bar.style.transform = `scaleX(${p})`;
      };
      gsap.ticker.add(tick);

      const exit = (fast = false) => {
        if (finished) return;
        finished = true;
        intro.progress(1);
        tick();
        gsap.ticker.remove(tick);
        const s = fast ? 0.55 : 1;
        const end = geometry(); // the hero may have moved since the start (resize, fonts, a scroll)
        gsap.set(shift, { x: end.dx, y: end.dy });
        gsap
          .timeline({
            onComplete: () => {
              markSeen();
              setDone(true);
            },
          })
          .to(letters, { yPercent: -115, duration: 0.7 * s, stagger: 0.04, ease: 'power3.in' }, 0)
          .to('[data-intro-fade]', { autoAlpha: 0, y: -8, duration: 0.5 * s, ease: 'power2.in' }, 0)
          .to('[data-intro-skip]', { autoAlpha: 0, duration: 0.3 * s }, 0)
          .fromTo(
            clip,
            { clipPath: windowClip },
            {
              clipPath: 'inset(0px 0px 0px 0px)',
              duration: 1.25 * s,
              ease: 'expo.inOut',
              immediateRender: false,
            },
            0.25 * s,
          )
          .to(shift, { x: 0, y: 0, scale: 1, duration: 1.25 * s, ease: 'expo.inOut' }, 0.25 * s)
          .to(shots, { '--zoom': 1, duration: 1.25 * s, ease: 'expo.inOut' }, 0.25 * s)
          .call(() => window.dispatchEvent(new Event(INTRO_EXIT_EVENT)), [], 0.9 * s)
          .to('[data-intro-ground]', { autoAlpha: 0, duration: 0.7 * s, ease: 'power2.inOut' }, 1.05 * s)
          .set(el, { autoAlpha: 0 });
      };
      exitRef.current = () => exit(true);

      const minimum = new Promise<void>((resolve) => intro.eventCallback('onComplete', () => resolve()));
      const ceiling = new Promise<void>((resolve) => window.setTimeout(resolve, 4400));
      Promise.race([Promise.all([...tasks, minimum]), ceiling]).then(() =>
        window.setTimeout(() => exit(), 120),
      );

      const onResize = () => {
        if (finished) return;
        const next = geometry();
        windowClip = next.window;
        if (intro.time() > 1.3) gsap.set(clip, { clipPath: next.window });
        gsap.set(shift, { x: next.dx, y: next.dy });
      };
      window.addEventListener('resize', onResize);
      return () => {
        window.removeEventListener('resize', onResize);
        gsap.ticker.remove(tick);
      };
    }, el);

    return () => ctx.revert();
  }, []);

  if (done || seenAtLoad) return null;

  return (
    <div ref={root} className="intro-overlay fixed inset-0 z-[100] overflow-hidden">
      <div data-intro-ground aria-hidden className="absolute inset-0 bg-forest" />

      {/* The window onto the courses. */}
      <div data-intro-clip aria-hidden className="absolute inset-0">
        <div data-intro-frame className="absolute">
          <div data-intro-shift className="absolute inset-0 feather-bottom lg:feather-left">
            {[...COURSES, { image: final.image, position: final.position }].map((course, index) => (
              <div
                key={course.image}
                data-intro-shot
                className="absolute inset-0 overflow-hidden"
                style={{ zIndex: index }}
              >
                <Picture
                  image={course.image}
                  position={course.position}
                  sizes={
                    index === COURSES.length
                      ? '(min-width: 1024px) 66vw, 100vw'
                      : '(min-width: 1024px) 40vw, 80vw'
                  }
                  quality={index === COURSES.length ? 78 : 60}
                  preload={index === 0}
                  ground="dark"
                  alt=""
                  className="absolute inset-0 origin-center [transform:scale(var(--zoom,1))]"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Name, label and progress, set over the window. */}
      <div className="on-dark pointer-events-none absolute inset-0 text-white">
        <p className="absolute inset-x-0 top-1/2 -translate-y-1/2 text-center font-display text-[clamp(3.6rem,13vw,12rem)] leading-none [font-weight:400] tracking-[0.12em] [text-shadow:0_2px_30px_rgba(0,0,0,0.35)]">
          <span className="sr-only">AZURE</span>
          <span
            aria-hidden
            className="inline-flex overflow-hidden pb-[0.06em]"
            style={{ marginRight: '-0.12em' }}
          >
            {'AZURE'.split('').map((letter, index) => (
              <span key={index} data-intro-letter className="inline-block">
                {letter}
              </span>
            ))}
          </span>
        </p>

        <div className="absolute inset-x-[var(--spacing-gutter)] bottom-8 flex items-end justify-between gap-6 md:bottom-10">
          <p data-intro-fade className="font-display text-[1.25rem] text-parchment italic">
            A coastal kitchen
          </p>
          <div data-intro-fade aria-hidden className="mb-2 hidden h-px flex-1 bg-white/15 sm:block">
            <div data-intro-bar className="h-full origin-left scale-x-0 bg-parchment" />
          </div>
          <p data-intro-fade aria-hidden className="eyebrow text-parchment tabular">
            <span data-intro-count>000</span>
          </p>
        </div>
      </div>

      <noscript>
        <style>
          {'.intro-overlay [data-intro-letter]{transform:none}.intro-overlay [data-intro-fade]{opacity:1}'}
        </style>
      </noscript>
      <button
        type="button"
        data-intro-skip
        onClick={() => exitRef.current()}
        className="absolute top-6 right-[var(--spacing-gutter)] min-h-11 px-2 eyebrow text-white/80 hover:text-white"
      >
        Skip intro
      </button>
    </div>
  );
}
