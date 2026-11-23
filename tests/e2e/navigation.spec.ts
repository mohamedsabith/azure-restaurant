import { expect, PAGES, test } from './fixtures';

test.describe('routing & navigation', () => {
  for (const path of PAGES) {
    test(`${path} renders server-side with one h1 and page metadata`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/AZURE/);
      const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonical).toMatch(new RegExp(`${path === '/' ? '/?$' : path}$`));
      await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{60,}/);
      await expect(page.locator('meta[property="og:image"]')).toHaveCount(1);
    });
  }

  test('primary navigation moves between pages and marks the active page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop navigation');
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Primary' });
    await expect(nav.getByRole('link', { name: 'Home' })).toHaveAttribute('aria-current', 'page');

    await nav.getByRole('link', { name: 'Menu' }).click();
    await expect(page).toHaveURL(/\/menu$/);
    await expect(page.getByRole('heading', { level: 1, name: 'Written Each Morning.' })).toBeVisible();
    await expect(nav.getByRole('link', { name: 'Menu' })).toHaveAttribute('aria-current', 'page');

    await nav.getByRole('link', { name: 'Our Story' }).click();
    await expect(page).toHaveURL(/\/our-story$/);

    await page.getByRole('banner').getByRole('link', { name: 'Reserve a table' }).click();
    await expect(page).toHaveURL(/\/reservations$/);
    await expect(page.locator('#main-content')).toBeFocused();

    await nav.getByRole('link', { name: 'Contact' }).click();
    await expect(page).toHaveURL(/\/reservations#visit$/);
    await expect(page.locator('#visit')).toBeInViewport();
  });

  test('skip link moves focus to the main content', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard test');
    await page.goto('/menu');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Skip to content' });
    await expect(skip).toBeFocused();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });

  test('unknown URLs return a designed 404 with a real 404 status', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { name: /isn’t on our floor plan/i })).toBeVisible();
    const robots = await page
      .locator('meta[name="robots"]')
      .evaluateAll((m) => m.map((x) => x.getAttribute('content')));
    expect(robots.length).toBeGreaterThan(0);
    expect(robots.every((c) => c?.includes('noindex'))).toBe(true);
    await page.getByRole('link', { name: 'Return home' }).click();
    await expect(page).toHaveURL(/\/$/);
  });

  test('legacy URLs permanently redirect', async ({ request }) => {
    for (const { from, to } of [
      { from: '/about', to: '/our-story' },
      { from: '/book', to: '/reservations' },
      { from: '/contact', to: '/reservations#visit' },
    ]) {
      const response = await request.get(from, { maxRedirects: 0 });
      expect(response.status(), from).toBe(308);
      expect(response.headers().location, from).toBe(to);
    }
  });
});

test.describe('mobile navigation', () => {
  test('menu dialog traps focus, closes on Escape and navigates', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.goto('/');
    const toggle = page.getByRole('button', { name: 'Open menu' });
    await toggle.click();
    const dialog = page.getByRole('dialog', { name: 'Site menu' });
    await expect(dialog).toBeVisible();
    // While the modal is open the rest of the page is hidden from assistive tech, so query by attribute.
    await expect(page.locator('button[aria-controls="mobile-menu"]')).toHaveAttribute(
      'aria-expanded',
      'true',
    );
    await expect(page.getByRole('button', { name: 'Open menu' })).toHaveCount(0);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(toggle).toBeFocused();

    await toggle.click();
    await dialog.getByRole('link', { name: 'Our Story' }).click();
    await expect(page).toHaveURL(/\/our-story$/);
    await expect(page.getByRole('dialog', { name: 'Site menu' })).toBeHidden();
  });

  test('touch targets in the header are at least 44px', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'mobile only');
    await page.goto('/menu');
    const box = await page.getByRole('button', { name: 'Open menu' }).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
  });
});
