import { expect, test } from '@playwright/test';

/**
 * Netlify injects a promotional HTML comment into <head> on *.netlify.app. Without
 * the clean-up in /scripts/intro-gate.js that extra node makes React throw hydration
 * error #418 and re-render the whole page on the client.
 */
const NETLIFY_COMMENT =
  '\n<!-- This site is hosted on Netlify. Anyone can build and deploy a site\n' +
  '     like this one for free.\n     Netlify hosting facts for this site. -->';

for (const path of ['/', '/reservations']) {
  test(`hydrates cleanly when the host injects markup into <head> (${path})`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.route(path, async (route) => {
      const response = await route.fetch();
      const body = (await response.text()).replace(
        '<meta charSet="utf-8"/>',
        `<meta charSet="utf-8"/>${NETLIFY_COMMENT}<meta name="hosting-provider" content="Netlify"/>`,
      );
      await route.fulfill({ response, body });
    });

    await page.goto(path);
    await page.waitForLoadState('networkidle');

    expect(errors.filter((message) => message.includes('418'))).toEqual([]);
    const leftovers = await page.evaluate(
      () => [...document.head.childNodes].filter((node) => node.nodeType === Node.COMMENT_NODE).length,
    );
    expect(leftovers).toBe(0);
  });
}
