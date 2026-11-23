import type { Metadata } from 'next';
import { routes, type RouteKey } from '@/content/seo';
import { site } from '@/content/site';

/** Page-level metadata. `metadataBase` (root layout) resolves relative URLs. */
export function pageMetadata(key: RouteKey): Metadata {
  const route = routes[key];
  return {
    title: key === 'home' ? { absolute: route.title } : route.title,
    description: route.description,
    alternates: {
      canonical: route.path,
      types: { 'text/markdown': route.markdownPath },
    },
    openGraph: {
      type: 'website',
      siteName: site.name,
      title: route.title,
      description: route.description,
      url: route.path,
      locale: 'en_GB',
    },
    twitter: {
      card: 'summary_large_image',
      title: route.title,
      description: route.description,
    },
  };
}
