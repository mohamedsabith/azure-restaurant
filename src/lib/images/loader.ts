import type { ImageLoaderProps } from 'next/image';

const UNSPLASH = 'https://images.unsplash.com/';

/**
 * Global next/image loader.
 * - Unsplash photos are resized by Unsplash's imgix CDN (`auto=format` negotiates AVIF/WebP).
 * - Local files in /public are already exported at display size and served as-is.
 */
export default function imageLoader({ src, width, quality }: ImageLoaderProps): string {
  if (src.startsWith(UNSPLASH)) {
    const url = new URL(src);
    url.searchParams.set('auto', 'format');
    url.searchParams.set('fit', 'max');
    url.searchParams.set('w', String(width));
    url.searchParams.set('q', String(quality ?? 70));
    return url.toString();
  }
  return `${src}?w=${width}`;
}

export function unsplashSrc(id: string): string {
  return `${UNSPLASH}${id}`;
}
