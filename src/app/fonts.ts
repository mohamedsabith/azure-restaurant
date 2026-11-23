import localFont from 'next/font/local';

/** Self-hosted (SIL Open Font License) — no request to Google Fonts at build or runtime. */
export const cormorant = localFont({
  variable: '--font-cormorant',
  display: 'swap',
  preload: true,
  fallback: ['Iowan Old Style', 'Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
  src: [
    { path: '../fonts/cormorant-garamond-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/cormorant-garamond-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/cormorant-garamond-latin-500-normal.woff2', weight: '500', style: 'normal' },
    { path: '../fonts/cormorant-garamond-latin-500-italic.woff2', weight: '500', style: 'italic' },
    { path: '../fonts/cormorant-garamond-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
});

export const manrope = localFont({
  variable: '--font-manrope',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'Segoe UI', 'sans-serif'],
  adjustFontFallback: 'Arial',
  src: [{ path: '../fonts/manrope-latin-wght-normal.woff2', weight: '200 800', style: 'normal' }],
});
