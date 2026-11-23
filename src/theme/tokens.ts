/** JavaScript mirror of the CSS design tokens in src/app/globals.css. */
export const colors = {
  forest: '#1D2218',
  cream: '#F8F0E8',
  linen: '#F3EBE1',
  sand: '#E0D1B9',
  parchment: '#D5CEB6',
  bronze: '#5F5446',
  taupe: '#5B5144',
  moss: '#2B3324',
  sage: '#9AA088',
  ink: '#2D2A1F',
  night: '#121209',
  white: '#FFFFFF',
} as const;

export const breakpoints = {
  xs: 375,
  sm: 431,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1600,
  '3xl': 1920,
} as const;

export const motion = {
  /** GSAP equivalents of the CSS easing tokens. */
  easeOut: 'expo.out',
  easeInOut: 'power4.inOut',
  /** Framer Motion cubic-bezier equivalents. */
  easeOutExpo: [0.16, 1, 0.3, 1] as const,
  easeInOutQuart: [0.76, 0, 0.24, 1] as const,
  duration: { fast: 0.18, base: 0.32, slow: 0.7 },
} as const;
