'use client';

import { useEffect } from 'react';
import { Button, TextLink } from '@/components/ui/Button';

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('[app] route error', error.digest ?? error.message);
  }, [error]);

  return (
    <section className="on-dark flex min-h-[80svh] items-center bg-forest pt-(--spacing-header) text-white">
      <div className="container-site py-24">
        <p className="mb-6 eyebrow text-parchment">Something went wrong</p>
        <h1 className="max-w-3xl font-display text-[clamp(2.75rem,1.6rem+3.6vw,4.75rem)] leading-[1.04] text-white">
          We couldn’t load this page.
        </h1>
        <p className="mt-7 max-w-(--container-measure) font-display text-[1.3rem] text-white/90">
          Please try again. If the problem continues, the menu and reservations pages are still available.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-8">
          <Button variant="sand" onClick={reset}>
            Try again
          </Button>
          <TextLink href="/" tone="light">
            Return home
          </TextLink>
        </div>
      </div>
    </section>
  );
}
