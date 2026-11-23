'use client';

import { motion } from 'motion/react';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { buttonClasses } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { formatHoursSummary, navigation, primaryCta, site } from '@/content/site';
import { motion as tokens } from '@/theme/tokens';

const list = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.12 } } };
const row = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: tokens.easeOutExpo } },
};

export function MobileMenu({
  open,
  onOpenChange,
  pathname,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
}) {
  const close = () => onOpenChange(false);
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      labelledBy="mobile-menu-title"
      variant="fullscreen"
      className="on-dark bg-forest text-white"
    >
      <div id="mobile-menu" className="flex min-h-full flex-col">
        <div className="container-site flex h-(--spacing-header) items-center justify-between">
          <Logo className="text-white" />
          <h2 id="mobile-menu-title" className="sr-only">
            Site menu
          </h2>
          <button
            type="button"
            onClick={close}
            className="-mr-2 inline-flex size-12 items-center justify-center"
            aria-label="Close menu"
          >
            <Icon name="close" className="size-6" />
          </button>
        </div>

        <nav aria-label="Mobile" className="container-site flex flex-1 flex-col justify-center py-10">
          <motion.ul variants={list} initial="hidden" animate="show" className="space-y-1">
            {navigation.map((item, index) => {
              const active = !item.href.includes('#') && pathname === item.href;
              return (
                <motion.li key={item.href} variants={row} className="border-b border-white/10">
                  <TransitionLink
                    href={item.href}
                    onClick={close}
                    aria-current={active ? 'page' : undefined}
                    className="group flex items-baseline justify-between gap-6 py-4"
                  >
                    <span className="font-display text-[clamp(2.25rem,8vw,3.5rem)] leading-none text-white">
                      {item.label}
                    </span>
                    <span className="text-caption text-parchment tabular">0{index + 1}</span>
                  </TransitionLink>
                </motion.li>
              );
            })}
          </motion.ul>

          <motion.div variants={row} initial="hidden" animate="show" className="mt-10">
            <TransitionLink
              href={primaryCta.href}
              onClick={close}
              className={buttonClasses('light', 'w-full sm:w-auto')}
            >
              Reserve a table
            </TransitionLink>
          </motion.div>
        </nav>

        <div className="container-site grid gap-6 border-t border-white/10 py-8 text-small text-white/85 sm:grid-cols-2">
          <div>
            <p className="mb-3 eyebrow text-parchment">Hours</p>
            <ul className="space-y-1">
              {formatHoursSummary().map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-3 eyebrow text-parchment">Contact</p>
            <p>{site.contact.email}</p>
            <p>Address to be confirmed</p>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
