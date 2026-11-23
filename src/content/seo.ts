/** Per-route metadata shared by HTML <head>, Markdown renditions, llms.txt and the sitemap. */
export const routes = {
  home: {
    path: '/',
    markdownPath: '/index.md',
    title: 'AZURE — Contemporary coastal dining on the harbour',
    shortTitle: 'Home',
    description:
      'AZURE is a forty-six-seat contemporary restaurant on the harbour. Day-boat fish, produce from two partner farms, a seven-course tasting menu and à la carte. Dinner Tuesday to Saturday.',
    changeFrequency: 'monthly',
    priority: 1,
  },
  menu: {
    path: '/menu',
    markdownPath: '/menu.md',
    title: 'Menu — Tasting menu, à la carte & wine',
    shortTitle: 'Menu',
    description:
      'The current AZURE menu: seven-course tasting menu, starters, main courses, signature dishes, desserts and a short wine and zero-proof list, with dietary and allergen information.',
    changeFrequency: 'weekly',
    priority: 0.9,
  },
  story: {
    path: '/our-story',
    markdownPath: '/our-story.md',
    title: 'Our Story — Philosophy, chef & sourcing',
    shortTitle: 'Our Story',
    description:
      'How AZURE cooks and why: the philosophy, chef Noa Laurent, day-boat and farm sourcing, the open kitchen and a restored customs warehouse on the quay.',
    changeFrequency: 'yearly',
    priority: 0.7,
  },
  reservations: {
    path: '/reservations',
    markdownPath: '/reservations.md',
    title: 'Reservations & Visit — Book a table',
    shortTitle: 'Reservations',
    description:
      'Reserve a table at AZURE up to sixty days ahead. Opening hours, how to find us, accessibility and answers to common questions about allergies, children and private dining.',
    changeFrequency: 'monthly',
    priority: 0.9,
  },
} as const;

export type RouteKey = keyof typeof routes;
