'use client';

import { useEffect, useRef, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { home } from '@/content/pages';
import { useClientSnapshot } from '@/hooks/useClientSnapshot';

const FILM = '/video/azure-film.mp4';
const POSTER = '/video/azure-film-poster.jpg';

/**
 * The house film: a silent, looping film of the kitchen and the dining room.
 * Inside MotionScope its frame opens out from a centred window to the full
 * width as the section scrolls in. It downloads only when the section comes
 * near, plays only while visible, can be paused (WCAG 2.2.2), and stays on its
 * poster with reduced motion. "Watch the film" opens it full screen with controls.
 */
export function FilmSection() {
  const { film } = home;
  const frame = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [paused, setPaused] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useClientSnapshot(
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    false,
  );

  // Load the film when the section approaches; play it only while it is on screen.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    const approach = new IntersectionObserver(([entry]) => entry?.isIntersecting && setNear(true), {
      rootMargin: '800px 0px',
    });
    const visible = new IntersectionObserver(
      ([entry]) => {
        const v = video.current;
        if (!v) return;
        if (entry?.isIntersecting && !paused && !reduced && !open) void v.play().catch(() => {});
        else v.pause();
      },
      { threshold: 0.2 },
    );
    approach.observe(el);
    visible.observe(el);
    return () => {
      approach.disconnect();
      visible.disconnect();
    };
  }, [near, paused, reduced, open]);

  const toggle = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) {
      setPaused(false);
      void v.play().catch(() => {});
    } else {
      setPaused(true);
      v.pause();
    }
  };

  return (
    <section aria-labelledby="film-title" className="on-dark relative bg-forest text-white">
      <div ref={frame} className="relative h-[min(86svh,56rem)] min-h-[26rem] overflow-hidden">
        <div data-window-scrub className="absolute inset-0">
          <video
            ref={video}
            className="absolute inset-0 size-full object-cover"
            src={near ? FILM : undefined}
            poster={POSTER}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            tabIndex={-1}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-[linear-gradient(to_top,rgba(18,18,9,0.78),rgba(18,18,9,0.1)_55%,rgba(18,18,9,0.35))]"
          />
        </div>

        <div className="relative container-site flex h-full flex-col justify-end pb-[clamp(2.5rem,6vw,4.5rem)]">
          <p data-reveal className="flex items-center gap-5 eyebrow text-parchment">
            {film.eyebrow}
            <span aria-hidden data-rule className="rule w-16 origin-left" />
          </p>
          <h2
            id="film-title"
            data-letters
            className="mt-5 max-w-[14ch] font-display text-[clamp(2.75rem,1.6rem+4vw,5.5rem)] leading-[1] [font-weight:400] text-white"
          >
            {film.title}
          </h2>
          <div data-reveal className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-4">
            <button
              type="button"
              onClick={() => setOpen(true)}
              className="group inline-flex min-h-12 items-center gap-4 eyebrow text-white"
            >
              <span className="grid size-14 place-items-center rounded-full border border-white/60 transition-[background-color,border-color,transform] duration-500 ease-(--ease-out-expo) group-hover:scale-110 group-hover:border-sand group-hover:bg-sand group-hover:text-night">
                <Icon name="play" className="size-4 translate-x-px" />
              </span>
              Watch the film
            </button>
            <p className="max-w-sm font-display text-[1.125rem] leading-snug text-white/85">{film.caption}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={toggle}
          aria-pressed={paused}
          aria-label={paused ? 'Play the background film' : 'Pause the background film'}
          className="absolute right-[var(--spacing-gutter)] bottom-[clamp(2.5rem,6vw,4.5rem)] grid size-11 place-items-center rounded-full border border-white/40 text-white transition-colors hover:border-white"
        >
          <Icon name={paused || reduced ? 'play' : 'pause'} className="size-3.5" />
        </button>
      </div>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        labelledBy="film-dialog-title"
        variant="fullscreen"
        className="bg-night"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-[var(--spacing-gutter)] py-5 text-white">
            <h2 id="film-dialog-title" className="eyebrow text-parchment">
              {film.title}
            </h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex min-h-11 items-center gap-3 eyebrow text-white"
            >
              Close
              <Icon name="close" className="size-4" />
            </button>
          </div>
          <div className="grid flex-1 place-items-center px-[var(--spacing-gutter)] pb-8">
            <video
              className="bg-black max-h-full w-full max-w-[110rem]"
              src={FILM}
              poster={POSTER}
              controls
              autoPlay
              muted
              loop
              playsInline
            />
            <p className="mt-4 max-w-2xl text-center text-caption text-white/70">{film.description}</p>
          </div>
        </div>
      </Dialog>
    </section>
  );
}
