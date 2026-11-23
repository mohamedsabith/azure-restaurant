import { ogContentType, ogSize, renderOgImage } from '@/lib/seo/og';

export const alt = 'AZURE — Tasting menu, à la carte and a short wine list.';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({ eyebrow: 'The menu', title: 'Tasting menu, à la carte and a short wine list.' });
}
