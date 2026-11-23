import { faq, home, reservationsPage, story, testimonials } from '@/content/pages';
import { allergenLabels, allergenPolicy, dietaryLabels, menuMeta, tastingMenu } from '@/content/menu';
import { formatHoursSummary, site } from '@/content/site';
import { routes, type RouteKey } from '@/content/seo';
import { groupedMenu } from '@/lib/menu';
import { formatPrice } from '@/lib/utils';
import { BOOKING_WINDOW_DAYS, PARTY_MAX } from '@/lib/reservations/availability';

/**
 * Markdown renditions of each page, generated from the same content modules as
 * the HTML. Served at /<page>.md and via `Accept: text/markdown` (see proxy.ts).
 */

const price = (n: number) => formatPrice(n, site.currency);

function frontMatter(key: RouteKey, siteUrl: string): string {
  const route = routes[key];
  return [
    '---',
    `title: ${JSON.stringify(route.title)}`,
    `description: ${JSON.stringify(route.description)}`,
    `canonical: ${siteUrl}${route.path}`,
    `updated: ${menuMeta.updated}`,
    '---',
    '',
  ].join('\n');
}

function demoNote(): string {
  return site.demo ? `> **Note:** ${site.demoNotice}\n\n` : '';
}

function contactBlock(siteUrl: string): string {
  const address = site.contact.address
    ? `${site.contact.address.street}, ${site.contact.address.postalCode} ${site.contact.address.locality}`
    : 'To be confirmed (not yet published)';
  return [
    '## Opening hours',
    '',
    ...formatHoursSummary().map((line) => `- ${line}`),
    '',
    '## Contact',
    '',
    `- Address: ${address}`,
    `- Phone: ${site.contact.phone ?? 'To be confirmed (not yet published)'}`,
    `- Email: ${site.contact.email}${site.contact.emailIsPlaceholder ? ' (placeholder domain)' : ''}`,
    `- Reservations: ${siteUrl}/reservations`,
    '',
  ].join('\n');
}

export function homeMarkdown(siteUrl: string): string {
  return [
    frontMatter('home', siteUrl),
    `# ${site.name} — ${site.tagline}`,
    '',
    demoNote() + site.description,
    '',
    `## ${home.philosophy.title}`,
    '',
    home.philosophy.text,
    '',
    `## ${home.signatures.title}`,
    '',
    ...groupedMenu('signatures').flatMap(({ items }) =>
      items.map((item) => `- **${item.name}** — ${item.description} ${price(item.price)}`),
    ),
    '',
    `## ${home.installation.title}`,
    '',
    home.installation.text,
    '',
    `## ${home.experience.title}`,
    '',
    home.experience.text,
    '',
    `## The chef: ${home.chef.title}`,
    '',
    `> ${home.chef.quote}`,
    '',
    '## Guest notes (sample testimonials — demonstration content)',
    '',
    ...testimonials.map((t) => `- “${t.quote}” — ${t.attribution}, ${t.context}`),
    '',
    contactBlock(siteUrl),
    '## Pages',
    '',
    `- [Menu](${siteUrl}/menu.md)`,
    `- [Our story](${siteUrl}/our-story.md)`,
    `- [Reservations & visit](${siteUrl}/reservations.md)`,
    '',
  ].join('\n');
}

export function menuMarkdown(siteUrl: string): string {
  const sections = groupedMenu('all').flatMap(({ category, items }) => [
    `## ${category.title}`,
    '',
    category.intro,
    '',
    ...items.map((item) => {
      const diets = item.dietary.map((d) => dietaryLabels[d].label).join(', ');
      const allergens = item.allergens.map((a) => allergenLabels[a]).join(', ');
      return [
        `### ${item.name} — ${price(item.price)}${item.priceNote ? ` ${item.priceNote}` : ''}`,
        '',
        item.description,
        '',
        `- Components: ${item.ingredients.join('; ')}`,
        diets ? `- Dietary: ${diets}` : '- Dietary: —',
        `- Allergens: ${allergens || 'none of the 14 major allergens by recipe'}`,
        item.pairing ? `- Pairing: ${item.pairing}` : '',
        '',
      ]
        .filter(Boolean)
        .join('\n');
    }),
    '',
  ]);

  return [
    frontMatter('menu', siteUrl),
    `# ${site.name} menu — ${menuMeta.season}`,
    '',
    demoNote() + menuMeta.intro,
    '',
    `Tasting menu ${price(tastingMenu.price)} per guest · wine pairing ${price(tastingMenu.winePairing)} · zero-proof pairing ${price(tastingMenu.zeroProofPairing)}. ${tastingMenu.duration}.`,
    '',
    menuMeta.serviceNote,
    '',
    ...sections,
    '## Dietary labels',
    '',
    ...Object.values(dietaryLabels).map((d) => `- **${d.short} — ${d.label}:** ${d.description}`),
    '',
    '## Allergens',
    '',
    ...allergenPolicy.map((p) => `- ${p}`),
    '',
    `Structured version: ${siteUrl}/menu.json`,
    '',
  ].join('\n');
}

export function storyMarkdown(siteUrl: string): string {
  return [
    frontMatter('story', siteUrl),
    `# Our story`,
    '',
    demoNote() + story.hero.intro,
    '',
    `## ${story.philosophy.title}`,
    '',
    story.philosophy.text,
    '',
    `## ${story.history.title}`,
    '',
    ...story.history.timeline.map((t) => `- **${t.year}** — ${t.text}`),
    '',
    `## ${story.approach.title}`,
    '',
    ...story.approach.rules.map((r) => `- **${r.title}.** ${r.text}`),
    '',
    `## The chef: ${story.chef.title}`,
    '',
    ...story.chef.paragraphs.flatMap((p) => [p, '']),
    `> ${story.chef.quote}`,
    '',
    `## ${story.sourcing.title}`,
    '',
    story.sourcing.text,
    '',
    ...story.sourcing.facts.map((f) => `- ${f.value} ${f.label}`),
    '',
    `## ${story.craft.title}`,
    '',
    story.craft.text,
    '',
    `## ${story.architecture.title}`,
    '',
    story.architecture.text,
    '',
    `## ${story.atmosphere.title}`,
    '',
    story.atmosphere.text,
    '',
  ].join('\n');
}

export function reservationsMarkdown(siteUrl: string): string {
  return [
    frontMatter('reservations', siteUrl),
    '# Reservations & visit',
    '',
    demoNote() + reservationsPage.hero.intro,
    '',
    '## How to book',
    '',
    `- Book online at ${siteUrl}/reservations — up to ${BOOKING_WINDOW_DAYS} days ahead, parties of 1–${PARTY_MAX}.`,
    `- For ${PARTY_MAX + 1} or more guests, write to ${site.contact.email} about the private room.`,
    '- Tell us about allergies and dietary requirements when booking.',
    '',
    contactBlock(siteUrl),
    '## Access & parking',
    '',
    `- ${reservationsPage.visit.accessibility}`,
    `- ${reservationsPage.visit.parking}`,
    '',
    '## Frequently asked questions',
    '',
    ...faq.flatMap((item) => [`### ${item.question}`, '', item.answer, '']),
  ].join('\n');
}

export const markdownByRoute: Record<RouteKey, (siteUrl: string) => string> = {
  home: homeMarkdown,
  menu: menuMarkdown,
  story: storyMarkdown,
  reservations: reservationsMarkdown,
};

export function markdownResponse(body: string): Response {
  return new Response(body, {
    headers: {
      'Content-Type': 'text/markdown; charset=utf-8',
      Vary: 'Accept',
      'X-Robots-Tag': 'noindex',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
