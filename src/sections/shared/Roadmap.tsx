'use client';

import { useLayoutEffect, useRef, type CSSProperties } from 'react';
import { ensureGsap } from '@/animations/gsap';
import { Picture } from '@/components/ui/Picture';
import { SectionIntro } from '@/components/ui/SectionIntro';
import type { Milestone } from '@/content/pages';

interface RoadmapProps {
  eyebrow: string;
  title: string;
  intro: string;
  milestones: Milestone[];
  id: string;
}

const WIDE = '(min-width: 1024px)';
const WIDE_MOTION = '(min-width: 1024px) and (prefers-reduced-motion: no-preference)';
const COMPACT_MOTION = '(max-width: 1023.98px) and (prefers-reduced-motion: no-preference)';

/* ——— Terrain: faint contour lines, like a survey map, generated once (deterministic). ——— */
function contourPaths(): string[] {
  const hills = [
    { x: 260, y: 180, r: 150 },
    { x: 980, y: 520, r: 190 },
    { x: 1720, y: 220, r: 170 },
    { x: 2460, y: 560, r: 210 },
    { x: 3150, y: 260, r: 160 },
  ];
  const paths: string[] = [];
  hills.forEach((hill, h) => {
    for (let ring = 1; ring <= 6; ring += 1) {
      const radius = (hill.r * ring) / 6;
      const points: string[] = [];
      for (let k = 0; k <= 48; k += 1) {
        const a = (k / 48) * Math.PI * 2;
        const wobble =
          1 + 0.13 * Math.sin(a * 3 + h * 1.7 + ring * 0.4) + 0.07 * Math.sin(a * 5 + h * 2.3 - ring * 0.3);
        const x = hill.x + Math.cos(a) * radius * 1.35 * wobble;
        const y = hill.y + Math.sin(a) * radius * 0.8 * wobble;
        points.push(`${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`);
      }
      paths.push(points.join(' ') + 'Z');
    }
  });
  return paths;
}
const CONTOURS = contourPaths();

/** A smooth curve through points (Catmull-Rom converted to cubic Béziers). */
function smoothPath(points: { x: number; y: number }[]): string {
  const at = (i: number) => points[Math.min(Math.max(i, 0), points.length - 1)]!;
  if (points.length < 2) return '';
  let d = `M${at(0).x} ${at(0).y}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const [p0, p1, p2, p3] = [at(i - 1), at(i), at(i + 1), at(i + 2)];
    const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
    const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
    d += ` C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}

/**
 * "Our story" as a journey on a map.
 *
 * Desktop: the section holds still while the milestones travel past. A winding
 * route draws itself across faint contour lines, a lantern-like marker travels
 * along it, and as the marker reaches each stop its pin lights up and that year
 * opens: the photograph widens from a thin slit, the year rises letter by letter
 * and the story follows. The terrain drifts at a slower pace and a compass turns
 * with the journey. Phones: the route runs down the page with the same marker.
 * Reduced motion / no JavaScript: every stop is visible (the row scrolls sideways
 * on desktop) and the route is drawn in full.
 */
export function Roadmap({ eyebrow, title, intro, milestones, id }: RoadmapProps) {
  const root = useRef<HTMLElement>(null);

  useLayoutEffect(() => {
    const el = root.current;
    if (!el) return;
    const { gsap, ScrollTrigger, SplitText } = ensureGsap();
    const mm = gsap.matchMedia();
    const q = (sel: string) => el.querySelector<HTMLElement>(sel);
    const qa = (sel: string) => gsap.utils.toArray<HTMLElement>(sel, el);

    // The route through every pin, measured from the laid-out cards.
    const buildRoute = () => {
      const track = q('[data-roadmap-track]');
      const svg = el.querySelector<SVGSVGElement>('[data-route-svg]');
      const route = el.querySelector<SVGPathElement>('[data-route]');
      const ghost = el.querySelector<SVGPathElement>('[data-route-ghost]');
      if (!track || !svg || !route || !ghost) return null;
      const box = track.getBoundingClientRect();
      const pins = qa('[data-pin]').map((pin) => {
        const r = pin.getBoundingClientRect();
        return { x: r.left - box.left + r.width / 2, y: r.top - box.top + r.height / 2 };
      });
      if (!pins.length) return null;
      const first = pins[0]!;
      const last = pins[pins.length - 1]!;
      const points = [{ x: first.x - 150, y: first.y + 50 }, ...pins, { x: last.x + 240, y: last.y - 36 }];
      svg.setAttribute('width', String(track.scrollWidth));
      svg.setAttribute('height', String(box.height));
      const d = smoothPath(points);
      route.setAttribute('d', d);
      ghost.setAttribute('d', d);
      const length = route.getTotalLength();
      // Where along the route each pin sits (0–1), found by bisection on x.
      const stops = pins.map((pin) => {
        let lo = 0;
        let hi = length;
        for (let k = 0; k < 24; k += 1) {
          const mid = (lo + hi) / 2;
          if (route.getPointAtLength(mid).x < pin.x) lo = mid;
          else hi = mid;
        }
        return lo / length;
      });
      return { route, length, stops };
    };

    mm.add(WIDE, () => {
      const built = buildRoute();
      if (built) {
        built.route.style.strokeDasharray = String(built.length);
        built.route.style.strokeDashoffset = '0';
      }
    });

    mm.add(WIDE_MOTION, () => {
      const stage = q('[data-roadmap-stage]');
      const scroller = q('[data-roadmap-scroller]');
      const track = q('[data-roadmap-track]');
      const terrain = el.querySelector<SVGSVGElement>('[data-terrain]');
      const compass = el.querySelector<SVGGElement>('[data-compass]');
      const marker = el.querySelector<SVGGElement>('[data-marker]');
      if (!stage || !scroller || !track || !marker) return;
      gsap.set(scroller, { overflow: 'hidden' });
      scroller.removeAttribute('tabindex'); // pinned: the page's own scrolling moves the row

      let built = buildRoute();
      const cards = qa('[data-stop]');
      const pins = qa('[data-pin]');
      const splits: SplitText[] = [];
      const opened = cards.map(() => false);

      // Every stop waits, closed, until the traveller arrives.
      cards.forEach((card) => {
        gsap.set(card.querySelector('[data-stop-photo]'), { clipPath: 'inset(48% 14% 48% 14%)' });
        gsap.set(card.querySelector('[data-stop-photo] img'), { scale: 1.3 });
        gsap.set(card.querySelectorAll('[data-stop-copy]'), { opacity: 0, y: 18 });
        gsap.set(card.querySelector('[data-stop-year]'), { opacity: 0 });
      });

      const open = (i: number) => {
        if (opened[i]) return;
        opened[i] = true;
        const card = cards[i];
        if (!card) return;
        const year = card.querySelector<HTMLElement>('[data-stop-year]');
        if (year) {
          const split = SplitText.create(year, { type: 'chars', mask: 'chars', aria: 'auto' });
          splits.push(split);
          gsap.set(year, { opacity: 1 });
          gsap.from(split.chars, { yPercent: 115, duration: 1.1, stagger: 0.05, ease: 'expo.out' });
        }
        gsap.fromTo(
          card.querySelector('[data-stop-photo]'),
          { clipPath: 'inset(48% 14% 48% 14%)' },
          { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut', delay: 0.1 },
        );
        gsap.to(card.querySelector('[data-stop-photo] img'), {
          scale: 1,
          duration: 2.2,
          ease: 'expo.out',
          delay: 0.1,
        });
        gsap.to(card.querySelectorAll('[data-stop-copy]'), {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1,
          delay: 0.45,
          ease: 'power3.out',
        });
      };

      const distance = () => Math.max(0, track.scrollWidth - scroller.clientWidth);
      const journey = { p: 0 };
      const render = () => {
        if (!built) return;
        const { route, length, stops } = built;
        const at = Math.max(0.5, journey.p * length);
        route.style.strokeDashoffset = String(length - at);
        const point = route.getPointAtLength(at);
        const ahead = route.getPointAtLength(Math.min(length, at + 6));
        const angle = (Math.atan2(ahead.y - point.y, ahead.x - point.x) * 180) / Math.PI;
        marker.setAttribute(
          'transform',
          `translate(${point.x.toFixed(1)} ${point.y.toFixed(1)}) rotate(${angle.toFixed(1)})`,
        );
        stops.forEach((stop, i) => {
          const reached = journey.p >= stop - 0.004;
          pins[i]?.classList.toggle('is-reached', reached);
          if (reached) open(i);
        });
        const travelled = Number(gsap.getProperty(track, 'x')) || 0;
        if (terrain) gsap.set(terrain, { x: travelled * 0.35 });
        if (compass) gsap.set(compass, { rotation: journey.p * 300, svgOrigin: '0 0' });
      };

      const travel = gsap.timeline({
        defaults: { ease: 'none' },
        onUpdate: render,
        scrollTrigger: {
          trigger: stage,
          start: 'top top',
          end: () => `+=${distance() + window.innerHeight * 0.5}`,
          pin: true,
          scrub: 0.9,
          invalidateOnRefresh: true,
          onRefresh: () => {
            const x = gsap.getProperty(track, 'x');
            gsap.set(track, { x: 0 });
            built = buildRoute();
            gsap.set(track, { x });
            render();
          },
        },
      });
      // The traveller sets out a moment before the row starts to move, and arrives as it stops.
      travel.to(journey, { p: 0.05, duration: 0.14 }, 0);
      travel.to(track, { x: () => -distance(), duration: 1 }, 0.1);
      travel.to(journey, { p: 1, duration: 0.96 }, 0.14);
      render();

      return () => {
        gsap.set(scroller, { clearProps: 'overflow' });
        scroller.setAttribute('tabindex', '0');
        splits.forEach((s) => s.revert());
      };
    });

    mm.add(COMPACT_MOTION, () => {
      const line = q('[data-roadmap-vline]');
      const marker = q('[data-vmarker]');
      const list = q('[data-roadmap-track]');
      if (!line || !list) return;
      const follow = () => ({ trigger: list, start: 'top 65%', end: 'bottom 65%', scrub: 0.6 });
      gsap.fromTo(line, { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: follow() });
      if (marker) gsap.fromTo(marker, { top: '0%' }, { top: '100%', ease: 'none', scrollTrigger: follow() });

      const pins = qa('[data-pin]');
      qa('[data-stop]').forEach((card, i) => {
        const photo = card.querySelector('[data-stop-photo]');
        const copy = card.querySelectorAll('[data-stop-copy], [data-stop-year]');
        gsap.set(photo, { clipPath: 'inset(48% 14% 48% 14%)' });
        gsap.set(copy, { opacity: 0, y: 16 });
        ScrollTrigger.create({
          trigger: card,
          start: 'top 65%',
          onEnter: () => {
            pins[i]?.classList.add('is-reached');
            gsap.fromTo(
              photo,
              { clipPath: 'inset(48% 14% 48% 14%)' },
              { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' },
            );
            gsap.to(copy, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08, ease: 'power3.out' });
          },
          onLeaveBack: () => pins[i]?.classList.remove('is-reached'),
        });
      });
    });

    let cancelled = false;
    document.fonts?.ready.then(() => !cancelled && ScrollTrigger.refresh());
    return () => {
      cancelled = true;
      mm.revert();
    };
  }, []);

  return (
    <section ref={root} aria-labelledby={id} className="on-dark relative bg-forest text-white">
      <div
        data-roadmap-stage
        className="relative flex flex-col justify-center overflow-hidden py-[clamp(4.5rem,8vw,7rem)] lg:h-svh lg:min-h-[46rem] lg:py-0"
      >
        {/* Terrain. */}
        <svg
          data-terrain
          aria-hidden
          viewBox="0 0 3400 760"
          preserveAspectRatio="xMinYMid slice"
          className="pointer-events-none absolute inset-y-0 left-0 hidden h-full w-[260%] text-white lg:block"
        >
          <g fill="none" stroke="currentColor" strokeOpacity="0.07" strokeWidth="1">
            {CONTOURS.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </svg>

        <div className="relative container-site grid-editorial items-end gap-y-6">
          <SectionIntro
            tone="light"
            eyebrow={eyebrow}
            title={title}
            id={id}
            className="col-span-4 md:col-span-6 lg:col-span-6"
          />
          <div className="col-span-4 flex items-end gap-8 md:col-span-6 lg:col-span-5 lg:col-start-8">
            <p data-reveal className="max-w-md font-display text-[1.2rem] leading-[1.5] text-white/85">
              {intro}
            </p>
            <Compass />
          </div>
        </div>

        <div
          data-roadmap-scroller
          // Without motion the row scrolls sideways: keyboard users can focus it and use the arrow keys.
          tabIndex={0}
          role="region"
          aria-label={`${title}: milestones`}
          className="relative mt-[clamp(1rem,2.5vh,2rem)] [scrollbar-width:thin] overflow-x-auto focus-visible:outline-offset-[-2px] lg:snap-x lg:snap-mandatory"
        >
          <div className="container-site lg:max-w-none lg:px-0">
            <ol
              data-roadmap-track
              className="relative grid gap-14 pl-12 lg:flex lg:w-max lg:gap-0 lg:pr-[32vw] lg:pl-[calc(var(--spacing-gutter)+9rem)]"
            >
              {/* The route (desktop): a faint dotted trail ahead, the travelled part drawn in sand. */}
              <svg
                data-route-svg
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 hidden overflow-visible lg:block"
              >
                <path
                  data-route-ghost
                  fill="none"
                  stroke="rgba(213,206,182,0.32)"
                  strokeWidth="1.6"
                  strokeDasharray="0.5 9"
                  strokeLinecap="round"
                />
                <path data-route fill="none" stroke="#e0d1b9" strokeWidth="2" strokeLinecap="round" />
                <g data-marker className="roadmap-marker">
                  <circle r="24" fill="rgba(224,209,185,0.1)" />
                  <circle r="12" fill="rgba(224,209,185,0.22)" />
                  <circle r="5.5" fill="#f8f0e8" />
                </g>
              </svg>

              {/* The route (phones): a line down the page with the traveller on it. */}
              <span aria-hidden className="absolute top-3 bottom-0 left-[0.55rem] w-px bg-white/15 lg:hidden">
                <span data-roadmap-vline className="block h-full w-full origin-top bg-parchment" />
                <span
                  data-vmarker
                  className="absolute top-0 left-1/2 block size-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cream shadow-[0_0_0_6px_rgba(224,209,185,0.2),0_0_0_13px_rgba(224,209,185,0.08)]"
                />
              </span>

              {milestones.map((milestone, index) => (
                <li
                  key={milestone.year}
                  data-stop
                  className="relative lg:w-[clamp(19rem,25vw,24rem)] lg:shrink-0 lg:snap-start lg:pr-[clamp(2.5rem,4vw,4.5rem)]"
                >
                  {/* The stop's pin on the route; on desktop its height alternates so the route winds. */}
                  <div
                    aria-hidden
                    className="absolute top-2 -left-12 lg:relative lg:top-0 lg:left-0 lg:h-[clamp(5rem,11vh,7.5rem)]"
                  >
                    <span
                      data-pin
                      className="roadmap-pin block size-[1.15rem] rounded-full border-[1.5px] border-parchment bg-forest lg:absolute lg:top-[var(--pin-y)] lg:left-0"
                      style={{ '--pin-y': index % 2 ? '62%' : '10%' } as CSSProperties}
                    />
                  </div>
                  <p
                    data-stop-year
                    className="font-display text-[clamp(3rem,5vw,4.75rem)] leading-none [font-weight:400] text-white tabular"
                  >
                    {milestone.year}
                  </p>
                  <div data-stop-photo className="mt-4 overflow-hidden">
                    <Picture
                      image={milestone.image}
                      position={milestone.position}
                      sizes="(min-width: 1024px) 22vw, 88vw"
                      aspect="16 / 11"
                      ground="dark"
                    />
                  </div>
                  <h3 data-stop-copy className="mt-5 font-display text-[1.55rem] leading-tight text-white">
                    <span className="sr-only">{milestone.year}: </span>
                    {milestone.title}
                  </h3>
                  <p
                    data-stop-copy
                    className="mt-2.5 max-w-[24rem] font-display text-[1.08rem] leading-[1.5] text-white/80"
                  >
                    {milestone.text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A small compass that turns as the journey advances. */
function Compass() {
  return (
    <svg aria-hidden viewBox="-40 -40 80 80" className="mb-1 hidden size-16 shrink-0 text-parchment lg:block">
      <circle r="34" fill="none" stroke="currentColor" strokeOpacity="0.35" />
      <circle r="27" fill="none" stroke="currentColor" strokeOpacity="0.2" strokeDasharray="1 4" />
      <g data-compass>
        <path d="M0 -24 L5 0 L0 24 L-5 0 Z" fill="currentColor" fillOpacity="0.25" />
        <path d="M0 -24 L5 0 L-5 0 Z" fill="#f8f0e8" />
      </g>
      <text y="-29" textAnchor="middle" fontSize="8" fill="currentColor" letterSpacing="1">
        N
      </text>
    </svg>
  );
}
