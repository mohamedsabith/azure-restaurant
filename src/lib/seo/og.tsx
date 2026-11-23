import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { colors } from '@/theme/tokens';

export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

const fontDir = join(process.cwd(), 'src/assets/og-fonts');

/** Branded social card rendered at build time (Satori) with the site's own typefaces. */
export async function renderOgImage({ eyebrow, title }: { eyebrow: string; title: string }) {
  const [display, displayItalic, sans] = await Promise.all([
    readFile(join(fontDir, 'cormorant-garamond-latin-500-normal.woff')),
    readFile(join(fontDir, 'cormorant-garamond-latin-500-italic.woff')),
    readFile(join(fontDir, 'manrope-latin-600-normal.woff')),
  ]);

  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        background: colors.moss,
        color: colors.white,
        padding: '72px 84px',
        fontFamily: 'Cormorant',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
        <svg width="54" height="54" viewBox="0 0 48 48" fill="none" stroke={colors.white} strokeWidth="1.6">
          <path d="M11 41 L24 7 L37 41" />
          <path d="M3 29.5 H45" stroke={colors.sage} />
        </svg>
        <div style={{ fontSize: 34, letterSpacing: '0.42em' }}>AZURE</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div
          style={{
            fontFamily: 'Manrope',
            fontSize: 20,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: colors.sage,
            marginBottom: 26,
          }}
        >
          {eyebrow}
        </div>
        <div style={{ fontSize: 84, lineHeight: 1.02, maxWidth: 940, fontStyle: 'italic' }}>{title}</div>
      </div>
      <div style={{ display: 'flex', height: 1, background: colors.sage, opacity: 0.5 }} />
    </div>,
    {
      ...ogSize,
      fonts: [
        { name: 'Cormorant', data: display, weight: 500, style: 'normal' },
        { name: 'Cormorant', data: displayItalic, weight: 500, style: 'italic' },
        { name: 'Manrope', data: sans, weight: 600, style: 'normal' },
      ],
    },
  );
}
