import { dietaryLabels } from '@/content/menu';
import { cn } from '@/lib/utils';
import type { DietaryTag } from '@/types/content';

/**
 * Compact dietary marks. The abbreviation is visible; the full label is always
 * available to assistive tech (and as a native title for pointer users), so
 * nothing depends on hover.
 */
export function DietaryTags({
  tags,
  className,
  tone = 'dark',
}: {
  tags: DietaryTag[];
  className?: string;
  tone?: 'dark' | 'light';
}) {
  if (tags.length === 0) return null;
  return (
    <ul className={cn('flex flex-wrap gap-1.5', className)} aria-label="Dietary information">
      {tags.map((tag) => (
        <li
          key={tag}
          title={dietaryLabels[tag].label}
          className={cn(
            'inline-flex h-6 min-w-6 items-center justify-center border px-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] tabular',
            tone === 'dark' ? 'border-bronze/35 text-bronze' : 'border-sage/50 text-sage',
          )}
        >
          <span aria-hidden>{dietaryLabels[tag].short}</span>
          <span className="sr-only">{dietaryLabels[tag].label}</span>
        </li>
      ))}
    </ul>
  );
}
