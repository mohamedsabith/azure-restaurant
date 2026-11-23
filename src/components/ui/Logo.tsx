import { cn } from '@/lib/utils';

/**
 * AZURE monogram: an "A" drawn in two strokes, crossed by a horizon line that
 * runs past the letter — the waterline the room is built around.
 * Paths carry `data-draw` so the intro can animate them with stroke-dashoffset.
 */
export function Monogram({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="square"
      className={cn('shrink-0', className)}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path data-draw d="M11 41 L24 7" />
      <path data-draw d="M24 7 L37 41" />
      <path data-draw d="M3 29.5 H45" />
      <path data-draw d="M17.4 35.5 H30.6" strokeOpacity={0.55} />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn('font-display [font-weight:400] tracking-[0.22em]', className)}
      style={{ marginRight: '-0.22em' }}
    >
      AZURE
    </span>
  );
}

export function Logo({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-3', className)}>
      <Monogram className="size-8" />
      {!compact && <Wordmark className="text-[1.75rem] leading-none" />}
    </span>
  );
}
