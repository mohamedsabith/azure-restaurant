import AxeBuilder from '@axe-core/playwright';
import { expect, PAGES, test } from './fixtures';

/** Brief's device coverage: small mobile → ultra-wide / TV. */
const VIEWPORTS = [
  { name: 'small-mobile', width: 320, height: 640 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'modern-phone', width: 430, height: 932 },
  { name: 'large-mobile', width: 600, height: 960 },
  { name: 'tablet-portrait', width: 768, height: 1024 },
  { name: 'tablet-landscape', width: 1024, height: 768 },
  { name: 'laptop', width: 1280, height: 800 },
  { name: 'desktop', width: 1600, height: 1000 },
  { name: 'full-hd', width: 1920, height: 1080 },
  { name: 'qhd', width: 2560, height: 1440 },
  { name: 'tv-4k', width: 3840, height: 2160 },
];

test.describe('responsive layout', () => {
  test.skip(({ isMobile }) => isMobile, 'viewport sweep runs once');
  test.use({ reducedMotion: 'reduce' });

  for (const vp of VIEWPORTS) {
    test(`no overflow and header fits at ${vp.name} (${vp.width}px)`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      for (const path of [...PAGES, '/missing-page']) {
        await page.goto(path);
        const result = await page.evaluate(() => {
          const vw = document.documentElement.clientWidth;
          const headerOverflow = [...document.querySelectorAll('header *')]
            .map((el) => el.getBoundingClientRect())
            .filter((r) => r.width > 0 && (r.right > vw + 1 || r.left < -1)).length;
          return { scroll: document.documentElement.scrollWidth - vw, headerOverflow };
        });
        expect(result.scroll, `${path} horizontal overflow`).toBeLessThanOrEqual(0);
        expect(result.headerOverflow, `${path} header items outside viewport`).toBe(0);
      }
    });
  }

  test('text measure stays readable on a 4K screen', async ({ page }) => {
    await page.setViewportSize({ width: 3840, height: 2160 });
    await page.goto('/our-story');
    // Reading copy only (labels such as eyebrows are single short lines).
    const widest = await page.evaluate(() =>
      Math.max(
        ...[...document.querySelectorAll('main p')]
          .filter((p) => (p.textContent ?? '').length > 120)
          .map((p) => p.getBoundingClientRect().width),
      ),
    );
    expect(widest).toBeLessThan(1100);
  });
});

test.describe('accessibility (axe, WCAG 2.2 AA)', () => {
  test.use({ reducedMotion: 'reduce' });

  for (const path of [...PAGES, '/missing-page']) {
    test(`${path} has no WCAG A/AA violations`, async ({ page }) => {
      await page.goto(path);
      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();
      const summary = results.violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.length} × ${v.help}`);
      expect(summary).toEqual([]);
    });
  }

  test('dialogs pass axe while open', async ({ page }) => {
    await page.goto('/menu');
    await page.getByRole('button', { name: 'Rock oysters', exact: true }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    const results = await new AxeBuilder({ page })
      .include('[role="dialog"]')
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    expect(results.violations.map((v) => v.id)).toEqual([]);
  });
});
