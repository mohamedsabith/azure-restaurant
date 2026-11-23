import type { NextConfig } from 'next';
import { resolveEnv } from './src/lib/env/schema';
import { buildSecurityHeaders } from './src/lib/security/headers';

// Fail the build early if the environment is invalid.
const env = resolveEnv(process.env);
const isDev = process.env.NODE_ENV === 'development';

const pageAlternates: Record<string, string> = {
  '/': '/index.md',
  '/menu': '/menu.md',
  '/our-story': '/our-story.md',
  '/reservations': '/reservations.md',
};

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  typedRoutes: true,
  images: {
    // Unsplash photography is resized by Unsplash's own image CDN, so no
    // optimisation runs on the host (keeps free-tier image quotas untouched).
    loader: 'custom',
    loaderFile: './src/lib/images/loader.ts',
    deviceSizes: [480, 640, 768, 1024, 1280, 1600, 1920, 2560],
    imageSizes: [96, 160, 256, 384],
  },
  experimental: {
    sri: { algorithm: 'sha256' },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: buildSecurityHeaders({
          isDev,
          httpsOrigin: env.siteUrl.startsWith('https://'),
          indexable: env.indexable,
          mapOrigin: env.mapOrigin,
        }),
      },
      // Advertise the Markdown rendition of each page to agents (RFC 8288 Link header).
      ...Object.entries(pageAlternates).map(([source, markdown]) => ({
        source,
        headers: [{ key: 'Link', value: `<${markdown}>; rel="alternate"; type="text/markdown"` }],
      })),
    ];
  },
  async redirects() {
    return [
      { source: '/about', destination: '/our-story', permanent: true },
      { source: '/story', destination: '/our-story', permanent: true },
      { source: '/book', destination: '/reservations', permanent: true },
      { source: '/booking', destination: '/reservations', permanent: true },
      { source: '/contact', destination: '/reservations#visit', permanent: true },
      { source: '/visit', destination: '/reservations#visit', permanent: true },
      { source: '/index.html', destination: '/', permanent: true },
    ];
  },
};

export default nextConfig;
