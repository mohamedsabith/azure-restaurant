import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/** Small spaced capitals with a hairline rule that grows in when it scrolls into view. */
export function Eyebrow({
  children,
  tone = 'dark',
  align = 'start',
  className,
}: {
  children: ReactNode;
  tone?: 'dark' | 'light';
  align?: 'start' | 'center';
  className?: string;
}) {
  return (
    <p
      data-reveal
      className={cn(
        'flex items-center gap-5 eyebrow',
        align === 'center' && 'justify-center',
        tone === 'light' ? 'text-parchment' : 'text-ink',
        className,
      )}
    >
      {align === 'center' && <span aria-hidden data-rule className="rule origin-right" />}
      <span>{children}</span>
      <span aria-hidden data-rule className="rule" />
    </p>
  );
}

interface SectionIntroProps {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  as?: 'h1' | 'h2';
  tone?: 'dark' | 'light';
  align?: 'start' | 'center';
  className?: string;
  titleClassName?: string;
  id?: string;
}

/** Eyebrow + serif heading + optional lead, as used at the top of each section. */
export function SectionIntro({
  eyebrow,
  title,
  children,
  as: Heading = 'h2',
  tone = 'dark',
  align = 'start',
  className,
  titleClassName,
  id,
}: SectionIntroProps) {
  const onDark = tone === 'light';
  return (
    <div className={cn(align === 'center' && 'mx-auto text-center', className)}>
      <Eyebrow tone={tone} align={align}>
        {eyebrow}
      </Eyebrow>
      <Heading
        id={id}
        data-split-lines
        className={cn(
          'mt-6 font-display text-[clamp(2.5rem,1.6rem+2.6vw,3.6rem)] leading-[1.04] [font-weight:400]',
          onDark ? 'text-white' : 'text-forest',
          titleClassName,
        )}
      >
        {title}
      </Heading>
      {children && (
        <div
          data-reveal
          className={cn(
            'mt-6 max-w-[30rem] font-display text-[1.25rem] leading-[1.5]',
            align === 'center' && 'mx-auto',
            onDark ? 'text-white/88' : 'text-ink',
          )}
        >
          {children}
        </div>
      )}
    </div>
  );
}
