import { ogContentType, ogSize, renderOgImage } from '@/lib/seo/og';

export const alt = 'AZURE — Coastal cooking, composed with restraint.';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: 'Contemporary coastal dining',
    title: 'Coastal cooking, composed with restraint.',
  });
}
