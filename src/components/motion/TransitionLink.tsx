'use client';

import type { Route } from 'next';
import Link from 'next/link';
import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from 'react';
import { usePageTransition } from './TransitionProvider';

type Props = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  href: string;
  children: ReactNode;
  prefetch?: boolean;
};

/**
 * next/link (prefetching, accessibility, middle-click) that plays the page
 * curtain on plain left-clicks. Anything unusual falls through to the browser.
 */
export function TransitionLink({ href, onClick, children, prefetch, ...rest }: Props) {
  const { navigate } = usePageTransition();

  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      rest.target === '_blank' ||
      !href.startsWith('/')
    ) {
      return;
    }
    event.preventDefault();
    navigate(href);
  }

  return (
    <Link href={href as Route} prefetch={prefetch} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
