import { ogContentType, ogSize, renderOgImage } from '@/lib/seo/og';

export const alt = 'AZURE — A warehouse on the quay, a kitchen that follows the tide.';
export const size = ogSize;
export const contentType = ogContentType;

export default function Image() {
  return renderOgImage({
    eyebrow: 'Our story',
    title: 'A warehouse on the quay, a kitchen that follows the tide.',
  });
}
