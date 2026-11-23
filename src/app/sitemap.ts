import type { MetadataRoute } from 'next';
import { menuMeta } from '@/content/menu';
import { routes } from '@/content/seo';
import { env } from '@/lib/env/server';

export default function sitemap(): MetadataRoute.Sitemap {
  if (!env.indexable) return [];
  return Object.values(routes).map((route) => ({
    url: `${env.siteUrl}${route.path === '/' ? '' : route.path}`,
    lastModified: new Date(`${menuMeta.updated}T00:00:00Z`),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
