'use client';

import { AnimatePresence, motion } from 'motion/react';
import Image from 'next/image';
import { useCallback, useEffect, useId, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { Picture } from '@/components/ui/Picture';
import { images, type ImageKey } from '@/content/images';
import { unsplashSrc } from '@/lib/images/loader';
import { cn } from '@/lib/utils';
import { motion as tokens } from '@/theme/tokens';

export interface GalleryItem {
  image: ImageKey;
  caption: string;
}

/** Per-index placement on the 12-column grid; mobile uses a simple 2-up rhythm. */
const layouts: Record<'atmosphere' | 'story', { cell: string; aspect: string }[]> = {
  // Row 1: wide + offset portrait. Row 2: three staggered frames. No dead cells at any breakpoint.
  atmosphere: [
    { cell: 'col-span-2 md:col-span-8 lg:col-span-7', aspect: '4 / 3' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-4 lg:col-start-9 lg:mt-28', aspect: '4 / 5' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-4 lg:col-start-2', aspect: '1 / 1' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-3 lg:col-start-6 lg:mt-20', aspect: '3 / 4' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-4 lg:col-start-9', aspect: '4 / 5' },
  ],
  story: [
    { cell: 'col-span-2 md:col-span-4 lg:col-span-5', aspect: '4 / 5' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-7 lg:mt-24', aspect: '16 / 10' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-3 lg:col-start-2', aspect: '3 / 4' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-4 lg:mt-16', aspect: '1 / 1' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-4', aspect: '4 / 5' },
    { cell: 'col-span-1 md:col-span-4 lg:col-span-8 lg:col-start-3', aspect: '21 / 9' },
  ],
};

export function Gallery({ items, variant }: { items: GalleryItem[]; variant: 'atmosphere' | 'story' }) {
  const [index, setIndex] = useState<number | null>(null);
  const [direction, setDirection] = useState(1);
  const titleId = useId();
  const open = index !== null;

  const go = useCallback(
    (step: number) => {
      setDirection(step);
      setIndex((current) => (current === null ? current : (current + step + items.length) % items.length));
    },
    [items.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, go]);

  const current = index !== null ? items[index] : undefined;

  return (
    <>
      <ul className="grid grid-cols-2 gap-3 md:grid-cols-8 md:gap-5 lg:grid-cols-12 lg:gap-6">
        {items.map((item, i) => {
          const layout = layouts[variant][i % layouts[variant].length]!;
          return (
            <li key={item.image} className={cn(layout.cell, 'lg:self-start')}>
              <button
                type="button"
                onClick={() => {
                  setDirection(1);
                  setIndex(i);
                }}
                className="group block w-full text-left"
                aria-label={`Open image ${i + 1} of ${items.length}: ${item.caption}`}
              >
                <span className="relative block overflow-hidden">
                  <Picture
                    image={item.image}
                    sizes="(min-width: 1024px) 45vw, (min-width: 768px) 50vw, 50vw"
                    aspect={layout.aspect}
                    reveal
                    imgClassName="transition-transform duration-[1200ms] ease-(--ease-out-expo) group-hover:scale-[1.035]"
                  />
                  <span
                    aria-hidden
                    className="absolute right-3 bottom-3 inline-flex size-10 items-center justify-center bg-white/90 text-moss opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
                  >
                    <Icon name="expand" className="size-4" />
                  </span>
                </span>
                <span className="mt-3 block text-caption text-ink/80">{item.caption}</span>
              </button>
            </li>
          );
        })}
      </ul>

      <Dialog
        open={open}
        onOpenChange={(next) => !next && setIndex(null)}
        labelledBy={titleId}
        variant="fullscreen"
        className="bg-white text-moss"
      >
        <div className="flex h-full min-h-dvh flex-col">
          <div className="container-site flex h-(--spacing-header) items-center justify-between">
            <p id={titleId} className="eyebrow text-bronze tabular" aria-live="polite">
              {index !== null ? `${index + 1} / ${items.length}` : ''}
              <span className="sr-only"> — {current?.caption}</span>
            </p>
            <button
              type="button"
              onClick={() => setIndex(null)}
              className="-mr-2 inline-flex size-12 items-center justify-center"
              aria-label="Close gallery"
            >
              <Icon name="close" className="size-6" />
            </button>
          </div>

          <div className="relative flex-1 overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              {current && (
                <motion.figure
                  key={current.image}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 60 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -60 }}
                  transition={{ duration: 0.6, ease: tokens.easeOutExpo }}
                  className="absolute inset-0 flex flex-col px-[var(--spacing-gutter)] pb-4"
                >
                  <div className="relative flex-1">
                    <Image
                      src={unsplashSrc(images[current.image].id)}
                      alt={images[current.image].alt}
                      fill
                      sizes="100vw"
                      className="object-contain"
                    />
                  </div>
                  <figcaption className="pt-4 text-center text-small text-ink/90">
                    {current.caption}
                  </figcaption>
                </motion.figure>
              )}
            </AnimatePresence>
          </div>

          <div className="container-site flex items-center justify-between gap-6 py-5">
            <button
              type="button"
              onClick={() => go(-1)}
              className="inline-flex min-h-12 items-center gap-3 px-2 text-small"
              aria-label="Previous image"
            >
              <Icon name="arrowLeft" /> <span className="hidden sm:inline">Previous</span>
            </button>
            <p className="hidden text-caption text-ink/80 md:block">Use ← → to browse · Esc to close</p>
            <button
              type="button"
              onClick={() => go(1)}
              className="inline-flex min-h-12 items-center gap-3 px-2 text-small"
              aria-label="Next image"
            >
              <span className="hidden sm:inline">Next</span> <Icon name="arrowRight" />
            </button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
