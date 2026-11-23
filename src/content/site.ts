/**
 * Single source of truth for brand and business details.
 *
 * AZURE is a fictional restaurant. Anything a real business must supply
 * (address, phone, social accounts) is marked as a placeholder and is
 * rendered as "to be confirmed" — never as invented real-world data.
 */

export const site = {
  name: 'AZURE',
  legalName: 'AZURE Dining Room (demonstration)',
  tagline: 'Contemporary coastal dining',
  description:
    'AZURE is a forty-six-seat contemporary dining room on the harbour, cooking the day’s catch and the season’s produce with precision and restraint. Tasting menu and à la carte, Tuesday to Saturday.',
  /** Shown wherever content could be mistaken for a real business. */
  demo: true,
  demoNotice:
    'AZURE is a fictional restaurant created as a design and engineering demonstration. Bookings made here are not real reservations.',
  locale: 'en',
  currency: 'EUR',
  timeZone: 'Europe/Lisbon',
  cuisine: ['Contemporary', 'Seafood', 'Seasonal'],
  priceRange: '€€€€',
  seats: 46,
  chef: {
    name: 'Noa Laurent',
    role: 'Chef & co-founder',
  },
  contact: {
    email: 'reservations@azure.example',
    emailIsPlaceholder: true,
    phone: null as string | null,
    address: null as null | { street: string; locality: string; postalCode: string; country: string },
    directionsUrl: null as string | null,
  },
  social: [
    { label: 'Instagram', href: null as string | null },
    { label: 'Journal', href: null as string | null },
  ],
} as const;

export type Weekday = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export interface ServicePeriod {
  label: 'Lunch' | 'Dinner';
  opens: string;
  closes: string;
}

/** Opening hours (demonstration schedule). Also drives availability and JSON-LD. */
export const openingHours: { day: Weekday; periods: ServicePeriod[] }[] = [
  { day: 'Monday', periods: [] },
  { day: 'Tuesday', periods: [{ label: 'Dinner', opens: '17:30', closes: '23:00' }] },
  { day: 'Wednesday', periods: [{ label: 'Dinner', opens: '17:30', closes: '23:00' }] },
  { day: 'Thursday', periods: [{ label: 'Dinner', opens: '17:30', closes: '23:00' }] },
  {
    day: 'Friday',
    periods: [
      { label: 'Lunch', opens: '12:00', closes: '15:00' },
      { label: 'Dinner', opens: '17:30', closes: '23:30' },
    ],
  },
  {
    day: 'Saturday',
    periods: [
      { label: 'Lunch', opens: '12:00', closes: '15:00' },
      { label: 'Dinner', opens: '17:30', closes: '23:30' },
    ],
  },
  { day: 'Sunday', periods: [] },
];

export const navigation = [
  { href: '/', label: 'Home' },
  { href: '/our-story', label: 'Our Story' },
  { href: '/menu', label: 'Menu' },
  { href: '/reservations#private-dining', label: 'Private Dining' },
  { href: '/#gallery', label: 'Gallery' },
  { href: '/reservations#visit', label: 'Contact' },
] as const;

export const primaryCta = { href: '/reservations', label: 'Reserve a table' } as const;

export function formatHoursSummary(): string[] {
  return [
    'Tuesday – Thursday · Dinner 17:30 – 23:00',
    'Friday – Saturday · Lunch 12:00 – 15:00, Dinner 17:30 – 23:30',
    'Sunday – Monday · Closed',
  ];
}
