import { routes } from '@/content/seo';
import { formatHoursSummary, site } from '@/content/site';
import { markdownByRoute } from './markdown';

/**
 * llms.txt (https://llmstxt.org) — an emerging, non-binding convention:
 * an H1, a blockquote summary, then sections of annotated links.
 */
export function renderLlmsTxt(siteUrl: string): string {
  const pages = Object.values(routes);
  return [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    site.demo ? `Important: ${site.demoNotice}` : '',
    '',
    `Key facts: ${site.seats} seats · cuisine: ${site.cuisine.join(', ')} · chef: ${site.chef.name} · price range ${site.priceRange} · currency ${site.currency}.`,
    `Hours: ${formatHoursSummary().join('; ')}.`,
    `Address and phone: not yet published. Email: ${site.contact.email}.`,
    '',
    '## Pages',
    '',
    ...pages.map((p) => `- [${p.shortTitle}](${siteUrl}${p.markdownPath}): ${p.description}`),
    '',
    '## Data',
    '',
    `- [Menu (JSON)](${siteUrl}/menu.json): every dish with price, dietary labels and allergens`,
    `- [Full content](${siteUrl}/llms-full.txt): all pages concatenated as Markdown`,
    `- [Sitemap](${siteUrl}/sitemap.xml)`,
    '',
    '## Optional',
    '',
    `- [Booking](${siteUrl}/reservations): reservations are made by a person through the web form; there is no public booking API.`,
    '',
  ]
    .filter((line, index, all) => !(line === '' && all[index - 1] === ''))
    .join('\n');
}

export function renderLlmsFullTxt(siteUrl: string): string {
  return [
    renderLlmsTxt(siteUrl),
    ...Object.values(markdownByRoute).map((render) => `\n---\n\n${render(siteUrl)}`),
  ].join('\n');
}
