import { test as base, expect, type Page } from '@playwright/test';

/**
 * Shared fixture.
 * - Unsplash photos are stubbed with a tiny SVG so tests never depend on a third-party CDN.
 * - The opening sequence is skipped unless a test opts in with `intro: true`.
 */
export const test = base.extend<{ intro: boolean }>({
  intro: [false, { option: true }],
  page: async ({ page, intro }, use) => {
    await page.route(/images\.unsplash\.com/, (route) =>
      route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="12"><rect width="16" height="12" fill="#5d6f8c"/></svg>',
      }),
    );
    if (!intro) await page.addInitScript(() => sessionStorage.setItem('azure:intro', 'seen'));
    await use(page);
  },
});

export { expect };

export const PAGES = ['/', '/menu', '/our-story', '/reservations'] as const;

/** First Tuesday–Thursday after `from` days ahead, as YYYY-MM-DD (always an open dinner day). */
export function nextMidweekDate(minDaysAhead = 3): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + minDaysAhead);
  while (![2, 3, 4].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

export async function settle(page: Page) {
  await page.waitForLoadState('networkidle');
}
