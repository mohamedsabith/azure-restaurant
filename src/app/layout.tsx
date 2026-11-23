import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { WebVitalsReporter } from '@/components/analytics/WebVitalsReporter';
import { SiteFooter } from '@/components/footer/SiteFooter';
import { SmoothScroll } from '@/animations/SmoothScroll';
import { TransitionProvider } from '@/components/motion/TransitionProvider';
import { SiteHeader } from '@/components/navigation/SiteHeader';
import { JsonLd } from '@/components/seo/JsonLd';
import { routes } from '@/content/seo';
import { site } from '@/content/site';
import { env } from '@/lib/env/server';
import { restaurantJsonLd, websiteJsonLd } from '@/lib/seo/jsonld';
import { cormorant, manrope } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(env.siteUrl),
  title: { default: routes.home.title, template: `%s · ${site.name}` },
  description: site.description,
  applicationName: site.name,
  category: 'restaurant',
  referrer: 'strict-origin-when-cross-origin',
  formatDetection: { telephone: false, email: false, address: false },
  robots: env.indexable
    ? {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
      }
    : { index: false, follow: false },
  openGraph: { type: 'website', siteName: site.name, locale: 'en_GB' },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1D2218',
  colorScheme: 'light',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // suppressHydrationWarning: /scripts/intro-gate.js sets `data-intro="seen"` on <html>
    // before React hydrates (returning visitors / reduced motion). That one attribute is
    // expected to differ from the server HTML; this only silences <html>'s own attributes.
    <html lang="en-GB" className={`${cormorant.variable} ${manrope.variable}`} suppressHydrationWarning>
      <head>
        {/* Tiny same-origin script that must run before first paint (decides whether
            the opening sequence shows). Same-origin, so it satisfies script-src 'self'. */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script src="/scripts/intro-gate.js" />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only-focusable top-3 left-3 z-[100] bg-moss px-5 py-3 text-small font-semibold text-white"
        >
          Skip to content
        </a>
        <TransitionProvider>
          <SmoothScroll />
          <SiteHeader />
          <main id="main-content" tabIndex={-1} className="outline-none">
            {children}
          </main>
          <SiteFooter />
        </TransitionProvider>
        <JsonLd data={restaurantJsonLd(env.siteUrl)} />
        <JsonLd data={websiteJsonLd(env.siteUrl)} />
        <WebVitalsReporter />
      </body>
    </html>
  );
}
