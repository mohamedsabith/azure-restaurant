import { NextResponse, type NextRequest } from 'next/server';
import { prefersMarkdown } from '@/lib/ai/negotiation';

/**
 * Content negotiation for AI agents: a request for a page that prefers
 * `text/markdown` is rewritten to that page's Markdown rendition.
 *
 * Everything else (redirects, security headers, preview noindex) is static
 * configuration in next.config.ts, so this proxy only runs on the four page
 * paths and does no work for normal browser requests.
 */
const markdownFor: Record<string, string> = {
  '/': '/index.md',
  '/menu': '/menu.md',
  '/our-story': '/our-story.md',
  '/reservations': '/reservations.md',
};

export function proxy(request: NextRequest) {
  const target = markdownFor[request.nextUrl.pathname];
  if (target && prefersMarkdown(request.headers.get('accept'))) {
    return NextResponse.rewrite(new URL(target, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/menu', '/our-story', '/reservations'],
};
