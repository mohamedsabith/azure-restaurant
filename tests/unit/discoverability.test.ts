import { describe, expect, it } from 'vitest';
import { menuItems } from '@/content/menu';
import { site } from '@/content/site';
import { crawlerPolicy } from '@/lib/ai/crawlers';
import { renderLlmsFullTxt, renderLlmsTxt } from '@/lib/ai/llms';
import { menuMarkdown, reservationsMarkdown } from '@/lib/ai/markdown';
import { prefersMarkdown } from '@/lib/ai/negotiation';
import { renderRobotsTxt } from '@/lib/ai/robots';
import { faqJsonLd, menuDocument, menuJsonLd, restaurantJsonLd } from '@/lib/seo/jsonld';
import { serializeJsonLd } from '@/lib/utils';

const siteUrl = 'https://azure.example';

describe('robots.txt', () => {
  const robots = renderRobotsTxt({ siteUrl, indexable: true });

  it('lists every crawler group explicitly and keeps /api/ private', () => {
    for (const group of crawlerPolicy) {
      for (const agent of group.agents) expect(robots).toContain(`User-agent: ${agent.token}`);
    }
    const groups = robots.split('\n\n').filter((g) => g.includes('User-agent'));
    for (const group of groups) {
      expect(group).toContain('Disallow: /api/');
    }
  });

  it('separates search, AI answers, user fetchers and training as distinct decisions', () => {
    expect(new Set(crawlerPolicy.map((g) => g.purpose))).toEqual(
      new Set(['search', 'ai-search', 'ai-user', 'ai-training']),
    );
    expect(robots).toContain('Content-Signal: search=yes, ai-input=yes, ai-train=yes');
    expect(robots).toContain(`Sitemap: ${siteUrl}/sitemap.xml`);
  });

  it('blocks everything on non-indexable deployments', () => {
    const preview = renderRobotsTxt({ siteUrl, indexable: false });
    expect(preview).toContain('User-agent: *\nDisallow: /');
    expect(preview).not.toContain('GPTBot');
  });
});

describe('Markdown negotiation', () => {
  it.each([
    ['text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', false],
    ['*/*', false],
    ['text/markdown', true],
    ['text/markdown, text/html;q=0.5', true],
    ['text/html, text/markdown;q=0.9', false],
    ['text/markdown;q=0', false],
    [null, false],
  ])('%s → %s', (accept, expected) => {
    expect(prefersMarkdown(accept)).toBe(expected);
  });
});

describe('llms.txt and Markdown renditions', () => {
  it('follows the llms.txt shape and states the demonstration status', () => {
    const llms = renderLlmsTxt(siteUrl);
    expect(llms.startsWith(`# ${site.name}\n\n> `)).toBe(true);
    expect(llms).toContain('## Pages');
    expect(llms).toContain(`${siteUrl}/menu.md`);
    expect(llms).toContain(site.demoNotice);
  });

  it('includes every dish with price and allergens in the menu rendition', () => {
    const md = menuMarkdown(siteUrl);
    for (const item of menuItems) expect(md).toContain(`### ${item.name}`);
    expect(md).toContain('Allergens:');
    expect(renderLlmsFullTxt(siteUrl).length).toBeGreaterThan(md.length);
  });

  it('never invents an address or phone number', () => {
    const md = reservationsMarkdown(siteUrl);
    expect(md).toContain('Address: To be confirmed');
    expect(md).toContain('Phone: To be confirmed');
  });
});

describe('structured data', () => {
  it('describes the restaurant without fabricated contact details', () => {
    const data = restaurantJsonLd(siteUrl);
    expect(data['@type']).toBe('Restaurant');
    expect(data).not.toHaveProperty('address');
    expect(data).not.toHaveProperty('telephone');
    expect(data).not.toHaveProperty('aggregateRating');
    expect(data.openingHoursSpecification.length).toBeGreaterThan(0);
  });

  it('builds a Menu with priced items and an FAQPage', () => {
    const menu = menuJsonLd(siteUrl);
    const items = menu.hasMenuSection.flatMap((s) => s.hasMenuItem);
    expect(items).toHaveLength(menuItems.length);
    expect(items.every((i) => i.offers.priceCurrency === 'EUR')).toBe(true);
    expect(faqJsonLd().mainEntity.length).toBeGreaterThan(5);
    expect(menuDocument(siteUrl).categories.flatMap((c) => c.items)).toHaveLength(menuItems.length);
  });

  it('escapes markup so JSON-LD cannot break out of its script element', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>alert(1)</script>' });
  });
});
