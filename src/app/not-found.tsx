import type { Metadata } from 'next';
import { ButtonLink, TextLink } from '@/components/ui/Button';
import { Botanical } from '@/components/ui/Botanical';
import { Monogram } from '@/components/ui/Logo';

// Overrides the layout's `index, follow` so every robots tag on a 404 agrees on noindex.
export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <section className="on-dark relative isolate flex min-h-[92svh] items-center overflow-hidden bg-forest pt-(--spacing-header) text-white">
      <Botanical
        animated={false}
        className="absolute -right-10 -bottom-24 -z-10 h-[30rem] w-[23rem] text-white/10"
      />
      <div className="container-site grid-editorial items-end gap-y-12 py-24">
        <div className="col-span-4 md:col-span-6 lg:col-span-7">
          <p className="mb-7 flex items-center gap-5 eyebrow text-parchment">
            Error 404
            <span aria-hidden className="rule w-16" />
          </p>
          <h1 className="font-display text-[clamp(3rem,1.6rem+4.4vw,5.25rem)] leading-[1.02] text-white">
            This Table Isn’t on <em className="italic">Our Floor Plan.</em>
          </h1>
          <p className="mt-7 max-w-(--container-measure) font-display text-[1.3rem] leading-[1.45] text-white/90">
            The page you were looking for has moved or never existed. The menu, our story and reservations are
            all one step away.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-5">
            <ButtonLink href="/" variant="sand" arrow>
              Return home
            </ButtonLink>
            <TextLink href="/menu" tone="light">
              View the menu
            </TextLink>
            <TextLink href="/reservations" tone="light">
              Reservations
            </TextLink>
          </div>
        </div>
        <div
          aria-hidden
          className="col-span-4 hidden justify-end text-white/12 md:col-span-2 md:flex lg:col-span-4"
        >
          <Monogram className="size-40 lg:size-64" />
        </div>
      </div>
    </section>
  );
}
