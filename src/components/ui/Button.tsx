import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { cn } from '@/lib/utils';
import { Icon } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'light' | 'outline-light' | 'quiet' | 'sand' | 'dark';

const base =
  'group/btn relative inline-flex min-h-12 items-center justify-center gap-3 px-6 text-[0.71875rem] whitespace-nowrap font-semibold uppercase tracking-[0.24em] transition-[background-color,color,border-color,transform] duration-400 ease-(--ease-out-quart) select-none active:scale-[0.985] disabled:pointer-events-none disabled:opacity-45 aria-disabled:pointer-events-none aria-disabled:opacity-45';

const variants: Record<ButtonVariant, string> = {
  primary: 'bg-bronze text-white hover:bg-forest',
  secondary: 'border border-forest/30 text-forest hover:border-forest hover:bg-forest hover:text-white',
  light: 'bg-white text-forest hover:bg-sand',
  'outline-light':
    'on-dark border border-white/70 text-white hover:border-white hover:bg-white hover:text-forest',
  quiet: 'px-0 text-bronze',
  sand: 'bg-sand text-forest hover:bg-white',
  dark: 'bg-forest text-white hover:bg-bronze',
};

export function buttonClasses(variant: ButtonVariant = 'primary', className?: string) {
  return cn(base, variants[variant], className);
}

function Arrow() {
  return (
    <Icon
      name="arrowRight"
      className="size-4 transition-transform duration-300 ease-(--ease-out-quart) group-hover/btn:translate-x-1"
    />
  );
}

interface CommonProps {
  variant?: ButtonVariant;
  arrow?: boolean;
  className?: string;
  children: ReactNode;
}

export function ButtonLink({
  href,
  variant = 'primary',
  arrow = false,
  className,
  children,
  ...rest
}: CommonProps & { href: string; 'aria-label'?: string; prefetch?: boolean; onClick?: () => void }) {
  return (
    <TransitionLink href={href} className={buttonClasses(variant, className)} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </TransitionLink>
  );
}

export function Button({
  variant = 'primary',
  arrow = false,
  className,
  children,
  type = 'button',
  ...rest
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={buttonClasses(variant, className)} {...rest}>
      <span>{children}</span>
      {arrow && <Arrow />}
    </button>
  );
}

/** Editorial link: a permanent hairline underline and an arrow that nudges forward on hover. */
export function TextLink({
  href,
  children,
  className,
  tone = 'dark',
}: {
  href: string;
  children: ReactNode;
  className?: string;
  tone?: 'dark' | 'light';
}) {
  return (
    <TransitionLink
      href={href}
      className={cn(
        'arrow-link eyebrow transition-colors duration-300',
        tone === 'dark' ? 'text-forest hover:text-bronze' : 'on-dark text-white hover:text-parchment',
        className,
      )}
    >
      <span>{children}</span>
      <Icon name="arrowRight" className="size-4" />
    </TransitionLink>
  );
}
