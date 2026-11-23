import { ogContentType, ogSize, renderOgImage } from '@/lib/seo/og';

export const alt = 'AZURE — Book a table for an evening on the water.';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({ eyebrow: 'Reservations', title: 'Book a table for an evening on the water.' });
}
