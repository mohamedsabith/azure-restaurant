'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { ensureGsap, MOTION_OK } from './gsap';

/**
 * Declarative scroll motion for server-rendered content.
 *
 *   [data-reveal]          fade + rise when the element enters the viewport
 *   [data-reveal-stagger]  reveal direct children one after another
 *   [data-reveal-mask]     image unmasks upwards while the photo settles
 *                          ="window": opens from a thin slit at its centre (the intro's window)
 *                          ="down":   unmasks downwards (alternating shutters)
 *                          ="tide":   a gentle wave rises through the frame (the philosophy's tide)
 *                          ="iris":   opens as a circle from the centre, like a cloche lifted off a plate
 *   [data-reveal-delay]    seconds to wait before a reveal (staggers items that arrive together)
 *   [data-window-scrub]    a centred window that opens out to the full frame as you scroll
 *                          ="lights": the photograph also brightens, as a room does at dusk
 *   [data-drop]            a map pin drops gently into place
 *   [data-letters]         short display text rises letter by letter, like the opening name
 *   [data-count]           a figure counts up from zero when it arrives (keeps any prefix/suffix)
 *   [data-split-lines]     heading lines rise from behind a mask (SplitText)
 *   [data-rule]            hairline beside a label grows in from its origin
 *   [data-draw]            line drawing (an <svg>) draws its strokes in sequence
 *   [data-parallax="0.1"]  subtle scrubbed vertical drift (images only)
 *   [data-scroll-x="-8"]   scroll-linked horizontal drift for display type (%)
 *
 * Performance: one-shot reveals are driven by a single IntersectionObserver
 * (no per-element ScrollTrigger, no layout reads at hydration), and headings are
 * split into lines only when they approach the viewport. ScrollTrigger is used
 * only for the few genuinely scroll-linked effects (parallax, drifting type).
 *
 * Accessibility: reveals animate opacity only (never `visibility`), so content
 * not yet scrolled to stays in the accessibility tree. Initial states are applied
 * only under `prefers-reduced-motion: no-preference`; without JavaScript or with
 * reduced motion everything is simply visible. Everything reverts on unmount.
 */
/** Where a masked frame starts: a slit at its centre, above it, or below it. */
function maskStart(el: HTMLElement): string {
  const kind = el.dataset.revealMask;
  if (kind === 'window') return 'inset(48% 14% 48% 14%)';
  if (kind === 'iris') return 'circle(0% at 50% 55%)';
  if (kind === 'tide') return tidePolygon(108, 0);
  if (kind === 'down') return 'inset(0% 0% 100% 0%)';
  return 'inset(100% 0% 0% 0%)';
}

/** A wavy horizon at `level` (% from the top); everything below it shows. */
function tidePolygon(level: number, phase: number): string {
  const points: string[] = [];
  for (let x = 0; x <= 100; x += 4) {
    const y =
      level +
      3.2 * Math.sin((x / 100) * Math.PI * 3 + phase) +
      1.4 * Math.sin((x / 100) * Math.PI * 7 - phase * 1.6);
    points.push(`${x}% ${y.toFixed(2)}%`);
  }
  return `polygon(${points.join(', ')}, 100% 100%, 0% 100%)`;
}

/** Counts the number inside an element up from zero, keeping text around it ("< 12 h", "€145"). */
function countUp(el: HTMLElement, delay: number) {
  const { gsap } = ensureGsap();
  const text = el.textContent ?? '';
  const match = text.match(/\d+(?:[.,]\d+)?/);
  if (!match || match.index === undefined) return;
  const [before, after] = [text.slice(0, match.index), text.slice(match.index + match[0].length)];
  const target = Number(match[0].replace(',', '.'));
  const decimals = match[0].includes('.') || match[0].includes(',') ? 1 : 0;
  const state = { value: 0 };
  el.setAttribute('aria-label', text); // screen readers get the final figure, not the ticking one
  gsap.to(state, {
    value: target,
    duration: 1.6,
    delay,
    ease: 'power3.out',
    onUpdate: () => {
      el.textContent = before + state.value.toFixed(decimals) + after;
    },
    onComplete: () => {
      el.textContent = text;
    },
  });
}

export function MotionScope({ children, className }: { children: ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const { gsap, ScrollTrigger, SplitText } = ensureGsap();
    const mm = gsap.matchMedia();

    mm.add(MOTION_OK, () => {
      const all = (sel: string) => Array.from(root.querySelectorAll<HTMLElement>(sel));
      const splits: SplitText[] = [];

      const reveal = all('[data-reveal]');
      const staggers = all('[data-reveal-stagger]');
      const masks = all('[data-reveal-mask]');
      const headings = all('[data-split-lines]');
      const rules = all('[data-rule]');
      const drawings = all('[data-draw-scroll]');
      const letters = all('[data-letters]');
      const counts = all('[data-count]');
      const drops = all('[data-drop]');

      // Initial states: cheap style writes only (no measuring).
      if (reveal.length) gsap.set(reveal, { opacity: 0, y: 26 });
      staggers.forEach((group) => gsap.set(group.children, { opacity: 0, y: 22 }));
      masks.forEach((el) => gsap.set(el, { clipPath: maskStart(el) }));
      if (letters.length) gsap.set(letters, { opacity: 0 });
      if (drops.length) gsap.set(drops, { opacity: 0, y: -42 });
      if (headings.length) gsap.set(headings, { opacity: 0 });
      if (rules.length) gsap.set(rules, { scaleX: 0 });
      drawings.forEach((svg) =>
        svg.querySelectorAll<SVGGeometryElement>('path, circle').forEach((shape) => {
          const length = shape.getTotalLength();
          gsap.set(shape, { strokeDasharray: length, strokeDashoffset: length });
        }),
      );

      const play = (el: HTMLElement) => {
        const delay = Number(el.dataset.revealDelay) || 0;
        if (el.hasAttribute('data-count')) {
          countUp(el, delay);
        } else if (el.hasAttribute('data-drop')) {
          gsap.to(el, { opacity: 1, y: 0, duration: 1.1, delay: delay + 0.6, ease: 'back.out(2.2)' });
        } else if (el.dataset.revealMask === 'tide') {
          const tide = { level: 108, phase: 0 };
          gsap.to(tide, {
            level: -8,
            phase: 5,
            duration: 2.4,
            delay,
            ease: 'power2.inOut',
            onUpdate: () => {
              el.style.clipPath = tidePolygon(tide.level, tide.phase);
            },
            onComplete: () => gsap.set(el, { clearProps: 'clipPath' }),
          });
          const img = el.querySelector('img');
          const zoomTarget = img && img.hasAttribute('data-parallax') ? img.parentElement : img;
          if (zoomTarget) gsap.from(zoomTarget, { scale: 1.2, duration: 2.6, delay, ease: 'power2.out' });
        } else if (el.hasAttribute('data-letters')) {
          // Words stay whole (chars sit inside word wrappers), so lines never break mid-word.
          const split = SplitText.create(el, { type: 'words,chars', mask: 'chars', aria: 'auto' });
          splits.push(split);
          gsap.set(el, { opacity: 1 });
          gsap.from(split.chars, {
            yPercent: 115,
            duration: 1.25,
            delay,
            stagger: 0.035,
            ease: 'expo.out',
            onComplete: () => split.revert(),
          });
        } else if (el.hasAttribute('data-reveal')) {
          gsap.to(el, { opacity: 1, y: 0, duration: 1.1 });
        } else if (el.hasAttribute('data-reveal-stagger')) {
          gsap.to(el.children, { opacity: 1, y: 0, duration: 1, stagger: 0.08 });
        } else if (el.hasAttribute('data-reveal-mask')) {
          const img = el.querySelector('img');
          const windowed = el.dataset.revealMask === 'window' || el.dataset.revealMask === 'iris';
          // Explicit from/to strings: computed clip-paths collapse repeated values.
          gsap.fromTo(
            el,
            { clipPath: maskStart(el) },
            {
              clipPath: el.dataset.revealMask === 'iris' ? 'circle(75% at 50% 50%)' : 'inset(0% 0% 0% 0%)',
              duration: windowed ? 1.6 : 1.35,
              delay,
              ease: windowed ? 'expo.inOut' : 'power4.inOut',
              clearProps: 'clipPath',
            },
          );
          // A parallax image already carries its own transform: zoom its frame instead.
          const zoomTarget = img && img.hasAttribute('data-parallax') ? img.parentElement : img;
          if (zoomTarget)
            gsap.from(zoomTarget, {
              scale: windowed ? 1.28 : 1.12,
              duration: windowed ? 2.2 : 1.8,
              delay: delay + 0.1,
            });
        } else if (el.hasAttribute('data-rule')) {
          gsap.to(el, { scaleX: 1, duration: 1.2, delay: 0.25, ease: 'expo.inOut' });
        } else if (el.hasAttribute('data-draw-scroll')) {
          gsap.to(el.querySelectorAll('path, circle'), {
            strokeDashoffset: 0,
            duration: 2.2,
            stagger: 0.06,
            ease: 'power2.inOut',
          });
        } else if (el.hasAttribute('data-split-lines')) {
          const split = SplitText.create(el, { type: 'lines', mask: 'lines', aria: 'auto' });
          splits.push(split);
          gsap.set(el, { opacity: 1 });
          gsap.from(split.lines, {
            yPercent: 108,
            duration: 1.25,
            stagger: 0.09,
            onComplete: () => split.revert(), // restore natural text flow so resizes reflow normally
          });
        }
      };

      // Map each observed node to the elements it reveals. Masked frames are clipped to zero
      // height, and Chrome's IntersectionObserver applies a target's own clip-path, so a
      // clipped frame would never intersect: observe its (unclipped) parent instead.
      const targets = new Map<Element, HTMLElement[]>();
      const watch = (node: Element, el: HTMLElement) => targets.set(node, [...(targets.get(node) ?? []), el]);
      [...reveal, ...staggers, ...headings, ...rules, ...drawings, ...letters, ...counts, ...drops].forEach(
        (el) => watch(el, el),
      );
      masks.forEach((el) => watch(el.parentElement ?? el, el));

      const observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue;
            observer.unobserve(entry.target);
            targets.get(entry.target)?.forEach(play);
          }
        },
        { rootMargin: '0px 0px -8% 0px', threshold: 0.01 },
      );
      targets.forEach((_, node) => observer.observe(node));

      // Scroll-linked effects (few elements) keep ScrollTrigger.
      all('[data-parallax]').forEach((el) => {
        const amount = Number(el.dataset.parallax) || 0.08;
        gsap.fromTo(
          el,
          { yPercent: -amount * 50 },
          {
            yPercent: amount * 50,
            ease: 'none',
            scrollTrigger: {
              trigger: el.parentElement ?? el,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          },
        );
      });
      // The intro's window, driven by scroll: a centred window opens out to the full frame.
      all('[data-window-scrub]').forEach((el) => {
        const img = el.querySelector('img');
        const zoomTarget = img && img.hasAttribute('data-parallax') ? img.parentElement : img;
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: el.parentElement ?? el,
            start: 'top 92%',
            end: 'center 58%',
            scrub: 0.9,
          },
        });
        tl.fromTo(
          el,
          { clipPath: 'inset(16% 22% 16% 22%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut' },
          0,
        );
        if (zoomTarget) tl.fromTo(zoomTarget, { scale: 1.3 }, { scale: 1, ease: 'power2.out' }, 0);
        // "lights": the room brightens as the window opens, like an evening coming on.
        if (zoomTarget && el.dataset.windowScrub === 'lights')
          tl.fromTo(
            zoomTarget,
            { filter: 'brightness(0.35) saturate(0.7)' },
            { filter: 'brightness(1) saturate(1)', ease: 'power1.in' },
            0,
          );
      });
      all('[data-scroll-x]').forEach((el) => {
        gsap.to(el, {
          xPercent: Number(el.dataset.scrollX) || -6,
          ease: 'none',
          scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
        });
      });

      return () => {
        observer.disconnect();
        splits.forEach((s) => s.revert());
      };
    });

    // Fonts change line breaks and section heights; re-measure scroll-linked effects once they load.
    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());

    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
