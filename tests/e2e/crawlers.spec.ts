import { expect, test } from './fixtures';

test.describe('discoverability for search engines and AI agents', () => {
  test('robots.txt states an explicit policy per crawler group', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.headers()['content-type']).toContain('text/plain');
    const body = await response.text();
    for (const agent of [
      'Googlebot',
      'Bingbot',
      'OAI-SearchBot',
      'ChatGPT-User',
      'GPTBot',
      'ClaudeBot',
      'Claude-User',
      'Claude-SearchBot',
      'PerplexityBot',
      'Google-Extended',
      'CCBot',
    ]) {
      expect(body).toContain(`User-agent: ${agent}`);
    }
    expect(body).toContain('Disallow: /api/');
    expect(body).toMatch(/Sitemap: https?:\/\/.+\/sitemap\.xml/);
  });

  test('sitemap lists the four canonical pages only', async ({ request }) => {
    const xml = await (await request.get('/sitemap.xml')).text();
    expect(xml.match(/<loc>/g)).toHaveLength(4);
    for (const path of ['/menu', '/our-story', '/reservations']) expect(xml).toContain(`${path}</loc>`);
    expect(xml).not.toContain('/api/');
  });

  test('llms.txt, llms-full.txt and menu.json are served', async ({ request }) => {
    const llms = await (await request.get('/llms.txt')).text();
    expect(llms).toMatch(/^# AZURE\n\n> /);
    expect(llms).toContain('/menu.md');
    const full = await request.get('/llms-full.txt');
    expect((await full.text()).length).toBeGreaterThan(llms.length * 3);
    const menu = await (await request.get('/menu.json')).json();
    expect(menu.currency).toBe('EUR');
    expect(menu.categories.length).toBe(6);
  });

  test('agents asking for Markdown get Markdown; browsers get HTML', async ({ request }) => {
    const md = await request.get('/menu', { headers: { Accept: 'text/markdown' } });
    expect(md.headers()['content-type']).toContain('text/markdown');
    expect(await md.text()).toContain('# AZURE menu');

    const html = await request.get('/menu', {
      headers: { Accept: 'text/html,application/xhtml+xml,*/*;q=0.8' },
    });
    expect(html.headers()['content-type']).toContain('text/html');
    expect(html.headers().link).toContain('</menu.md>; rel="alternate"; type="text/markdown"');

    const direct = await request.get('/our-story.md');
    expect(await direct.text()).toContain('## Clarity over complexity.');
  });

  test('pages carry JSON-LD and Open Graph images that resolve', async ({ page, request }) => {
    await page.goto('/reservations');
    const types = await page
      .locator('script[type="application/ld+json"]')
      .evaluateAll((nodes) => nodes.map((n) => JSON.parse(n.textContent ?? '{}')['@type']));
    expect(types).toEqual(expect.arrayContaining(['Restaurant', 'WebSite', 'FAQPage', 'BreadcrumbList']));
    const og = await page.locator('meta[property="og:image"]').getAttribute('content');
    const image = await request.get(new URL(og!).pathname);
    expect(image.headers()['content-type']).toBe('image/png');
  });
});

test.describe('security', () => {
  test('sends hardened headers', async ({ request }) => {
    const headers = (await request.get('/')).headers();
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
    expect(headers['content-security-policy']).toContain("object-src 'none'");
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['x-powered-by']).toBeUndefined();
  });

  test('the page runs under its CSP without violations', async ({ page }) => {
    const violations: string[] = [];
    page.on(
      'console',
      (msg) => msg.text().includes('Content Security Policy') && violations.push(msg.text()),
    );
    await page.goto('/reservations');
    await page.getByRole('button', { name: /Choose a date/ }).click(); // proves hydration
    await expect(page.getByRole('dialog', { name: 'Choose a date' })).toBeVisible();
    expect(violations).toEqual([]);
  });

  test('web-vitals endpoint rejects cross-origin and malformed posts', async ({ request, baseURL }) => {
    const noOrigin = await request.post('/api/vitals', { data: { name: 'LCP' } });
    expect(noOrigin.status()).toBe(403);
    const malformed = await request.post('/api/vitals', {
      headers: { Origin: baseURL!, 'Content-Type': 'application/json' },
      data: { name: 'NOPE', value: -1 },
    });
    expect(malformed.status()).toBe(400);
    const ok = await request.post('/api/vitals', {
      headers: { Origin: baseURL!, 'Content-Type': 'application/json' },
      data: { name: 'LCP', value: 1234, rating: 'good', id: 'v1-abc', path: '/' },
    });
    expect(ok.status()).toBe(204);
  });
});
