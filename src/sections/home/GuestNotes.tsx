'use client';

import { AnimatePresence, motion } from 'motion/react';
import { useState, type KeyboardEvent } from 'react';
import { Botanical } from '@/components/ui/Botanical';
import { Icon } from '@/components/ui/Icon';
import { Eyebrow } from '@/components/ui/SectionIntro';
import { home, testimonials } from '@/content/pages';
import { motion as tokens } from '@/theme/tokens';

/**
 * Guest notes, one at a time in large type. Each note arrives word by word from
 * behind a mask (the opening's rising letters, at reading pace); arrows, the
 * keyboard (← →) and the numbered markers move between notes. Nothing advances
 * on its own, so there is nothing to pause.
 */
export function GuestNotes() {
  const { notes } = home;
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const note = testimonials[index] ?? testimonials[0];
  const count = testimonials.length;

  const go = (next: number) => {
    setDirection(next > index || (index === count - 1 && next === 0) ? 1 : -1);
    setIndex((next + count) % count);
  };
  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') go(index + 1);
    if (event.key === 'ArrowLeft') go(index - 1);
  };

  if (!note) return null;
  const words = note.quote.split(' ');

  return (
    <section
      aria-labelledby="notes-title"
      aria-roledescription="carousel"
      className="relative overflow-hidden bg-linen section-y"
    >
      <Botanical className="absolute -bottom-16 -left-10 h-[24rem] w-72 text-moss/25 max-md:hidden" />
      <Botanical
        animated={false}
        className="absolute -top-10 -right-12 h-[20rem] w-60 -scale-x-100 text-moss/20 max-md:hidden"
      />
      <div className="relative container-site">
        <div className="mx-auto max-w-[62rem] text-center">
          <Eyebrow tone="dark" align="center">
            {notes.eyebrow}
          </Eyebrow>
          <h2
            id="notes-title"
            data-split-lines
            className="mt-6 font-display text-[clamp(2.5rem,1.6rem+2.6vw,3.6rem)] leading-[1.04] text-forest"
          >
            {notes.title}
          </h2>

          <div
            // Keyboard: arrows move between notes while focus is inside the carousel.
            onKeyDown={onKey}
            className="relative mt-[clamp(2rem,4vw,3.5rem)]"
          >
            <span aria-hidden className="block font-display text-[6rem] leading-[0.5] text-bronze/50">
              “
            </span>
            <div
              aria-live="polite"
              aria-atomic="true"
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${count}`}
              className="grid min-h-[13rem] place-items-center sm:min-h-[11rem]"
            >
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.figure
                  key={note.id}
                  className="[grid-area:1/1]"
                  exit={{ opacity: 0, transition: { duration: 0.3 } }}
                >
                  <blockquote className="font-display text-[clamp(1.6rem,1.1rem+1.6vw,2.5rem)] leading-[1.3] text-night italic">
                    <p>
                      {words.map((word, i) => (
                        <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-top">
                          <motion.span
                            className="inline-block"
                            initial={{ y: '110%' }}
                            animate={{ y: '0%' }}
                            transition={{ duration: 0.9, ease: tokens.easeOutExpo, delay: 0.1 + i * 0.022 }}
                          >
                            {word}
                            {i < words.length - 1 ? ' ' : ''}
                          </motion.span>
                        </span>
                      ))}
                    </p>
                  </blockquote>
                  <motion.figcaption
                    className="mt-7 eyebrow text-taupe"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.45 }}
                  >
                    {note.attribution} — {note.context}
                  </motion.figcaption>
                </motion.figure>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => go(index - 1)}
                aria-label="Previous note"
                className="grid size-12 place-items-center rounded-full border border-forest/25 text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white"
              >
                <Icon name="arrowLeft" className="size-4" />
              </button>
              <ol className="flex items-center gap-3" aria-label="Choose a note">
                {testimonials.map((t, i) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => go(i)}
                      aria-label={`Note ${i + 1}: ${t.context}`}
                      aria-current={i === index ? 'true' : undefined}
                      className="group grid h-11 w-8 place-items-center"
                    >
                      <span
                        className={
                          i === index
                            ? 'block h-px w-8 bg-forest transition-all duration-500'
                            : 'block h-px w-4 bg-forest/30 transition-all duration-500 group-hover:w-6 group-hover:bg-forest/60'
                        }
                      />
                    </button>
                  </li>
                ))}
              </ol>
              <button
                type="button"
                onClick={() => go(index + 1)}
                aria-label="Next note"
                className="grid size-12 place-items-center rounded-full border border-forest/25 text-forest transition-colors hover:border-forest hover:bg-forest hover:text-white"
              >
                <Icon name="arrowRight" className="size-4" />
              </button>
            </div>
            <p className="mt-6 text-caption text-taupe">{notes.disclaimer}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
