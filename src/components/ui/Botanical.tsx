import { cn } from '@/lib/utils';

const leaf = 'M0 0 C10 -9 30 -9 44 0 C30 9 10 9 0 0 Z';
const leafSmall = 'M0 0 C8 -7 22 -7 32 0 C22 7 8 7 0 0 Z';

const leaves: { x: number; y: number; r: number; small?: boolean }[] = [
  { x: 186, y: 255, r: -140 },
  { x: 174, y: 230, r: -35 },
  { x: 162, y: 206, r: -152 },
  { x: 148, y: 180, r: -28 },
  { x: 136, y: 156, r: -156 },
  { x: 108, y: 102, r: -162, small: true },
  { x: 92, y: 78, r: -48, small: true },
  { x: 74, y: 52, r: -166, small: true },
  { x: 60, y: 34, r: -62, small: true },
  { x: 180, y: 166, r: -14, small: true },
  { x: 84, y: 116, r: 176, small: true },
];

/**
 * Hand-drawn sprig of sea fennel in hairline strokes. With `animated`, MotionScope
 * draws every stroke in sequence when it scrolls into view.
 */
export function Botanical({ className, animated = true }: { className?: string; animated?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 230 300"
      data-draw-scroll={animated ? '' : undefined}
      className={cn('pointer-events-none', className)}
      fill="none"
      stroke="currentColor"
      strokeWidth={0.9}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M205 298 C178 240 158 185 128 132 C106 94 84 60 52 22" />
      <path d="M156 186 C176 168 196 158 222 156" />
      <path d="M120 120 C98 112 82 114 64 124" />
      {leaves.map(({ x, y, r, small }) => (
        <g key={`${x}-${y}`} transform={`translate(${x} ${y}) rotate(${r})`}>
          <path d={small ? leafSmall : leaf} />
          <path d={small ? 'M0 0 L28 0' : 'M0 0 L40 0'} />
        </g>
      ))}
      <circle cx="223" cy="156" r="3.5" />
      <circle cx="62" cy="125" r="3.5" />
      <circle cx="51" cy="21" r="3.5" />
      <circle cx="214" cy="146" r="2.6" />
    </svg>
  );
}
