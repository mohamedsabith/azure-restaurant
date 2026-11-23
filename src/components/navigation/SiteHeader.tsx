'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { TransitionLink } from '@/components/motion/TransitionLink';
import { buttonClasses } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { Logo } from '@/components/ui/Logo';
import { navigation, primaryCta } from '@/content/site';
import { cn } from '@/lib/utils';
import { MobileMenu } from './MobileMenu';

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const lastY = useRef(0);
  const [menuPath, setMenuPath] = useState(pathname);
  if (menuPath !== pathname) {
    // Route changed: close the mobile menu (state adjusted during render, no effect).
    setMenuPath(pathname);
    setMenuOpen(false);
  }
  // The menu page has a sticky filter bar directly under the header: keep the header in place there.
  const autoHide = pathname !== '/menu';

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const y = window.scrollY;
        setScrolled(y > 24);
        if (autoHide && y > 560 && y > lastY.current + 6) setHidden(true);
        else if (y < lastY.current - 6 || y < 560) setHidden(false);
        lastY.current = y;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
    };
  }, [autoHide]);

  const isActive = (href: string) => !href.includes('#') && pathname === href;
  const onReservations = pathname === primaryCta.href;

  return (
    <header
      onFocusCapture={() => setHidden(false)}
      className={cn(
        // Every page opens on a dark band, so the header is always light-on-dark:
        // transparent over the hero, a solid deep-navy bar once the page scrolls.
        'on-dark fixed inset-x-0 top-0 z-50 text-white transition-[transform,background-color,box-shadow] duration-500 ease-(--ease-out-expo)',
        hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0',
        scrolled
          ? 'bg-forest/95 shadow-[0_1px_0_rgb(255_255_255/0.08)] backdrop-blur-md supports-[backdrop-filter]:bg-forest/85'
          : 'bg-transparent',
      )}
    >
      <div
        className={cn(
          'container-site flex items-center justify-between gap-6 transition-[height] duration-500 ease-(--ease-out-expo)',
          scrolled ? 'h-(--spacing-header)' : 'h-[6.5rem]',
        )}
      >
        <TransitionLink
          href="/"
          aria-label="AZURE — home"
          className="header-enter relative z-10 -m-2 p-2 text-white"
          style={{ '--i': 0 } as CSSProperties}
        >
          <Logo />
        </TransitionLink>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7 xl:gap-10">
            {navigation.map((item, index) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="header-enter" style={{ '--i': index + 1 } as CSSProperties}>
                  <TransitionLink
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative inline-flex min-h-11 items-center eyebrow text-[0.6875rem] transition-colors duration-300',
                      'after:absolute after:inset-x-0 after:bottom-2.5 after:h-px after:origin-left after:scale-x-0 after:bg-current after:transition-transform after:duration-500 after:ease-(--ease-out-expo) hover:after:scale-x-100',
                      active ? 'text-white after:scale-x-100' : 'text-white/85 hover:text-white',
                    )}
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div
          className="header-enter flex items-center gap-2 sm:gap-3"
          style={{ '--i': navigation.length + 1 } as CSSProperties}
        >
          {/* Wrapper owns the responsive display so it never fights the button's own `inline-flex`. */}
          <span className="hidden sm:block">
            <TransitionLink
              href={primaryCta.href}
              aria-current={onReservations ? 'page' : undefined}
              className={buttonClasses('outline-light', 'min-h-11 px-5 text-[0.6875rem]')}
            >
              {primaryCta.label}
            </TransitionLink>
          </span>
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            aria-haspopup="dialog"
            className="-mr-2 inline-flex size-12 items-center justify-center lg:hidden"
          >
            <Icon name="menu" className="size-6" label="Open menu" />
          </button>
        </div>
      </div>
      <MobileMenu open={menuOpen} onOpenChange={setMenuOpen} pathname={pathname} />
    </header>
  );
}
