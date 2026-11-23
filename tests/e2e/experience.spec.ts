import { expect, test } from './fixtures';

test.describe('opening sequence', () => {
  test.use({ intro: true });

  test('plays once per session, can be skipped, and does not replay on navigation', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'one viewport is enough');
    await page.goto('/');
    const overlay = page.locator('.intro-overlay');
    await expect(overlay).toBeVisible();
    await page.getByRole('button', { name: 'Skip intro' }).click();
    await expect(overlay).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/menu');
    await page.goto('/');
    await expect(page.locator('.intro-overlay')).toBeHidden();
  });

  test('finishes on its own within a few seconds', async ({ page, isMobile }) => {
    test.skip(isMobile, 'one viewport is enough');
    await page.goto('/');
    await expect(page.locator('.intro-overlay')).toBeHidden({ timeout: 8000 });
  });
});

test.describe('scroll reveals (motion enabled)', () => {
  test('photographs unmask once scrolled into view on every page', async ({ page }) => {
    // Pages whose below-the-fold photographs use the mask reveal. Page heroes are
    // deliberately never masked so the first photograph paints immediately.
    for (const path of ['/', '/our-story']) {
      await page.goto(path);
      const frames = page.locator('[data-reveal-mask]:visible');
      const count = await frames.count();
      expect(count, path).toBeGreaterThan(0);
      for (let i = 0; i < Math.min(count, 4); i += 1) {
        const frame = frames.nth(i);
        await frame.scrollIntoViewIfNeeded();
        await expect
          .poll(() => frame.evaluate((el) => getComputedStyle(el).clipPath), {
            message: `${path} frame ${i}`,
          })
          .not.toContain('inset(100%');
      }
    }
  });
});

test.describe('reduced motion', () => {
  test.use({ intro: true, reducedMotion: 'reduce' });

  test('skips the intro and keeps all content visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.intro-overlay')).toBeHidden();
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await page.getByRole('heading', { name: 'A Taste of the Season' }).scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'A Taste of the Season' })).toBeVisible();
    // The 3D scene is replaced by its rendered still.
    await expect(page.locator('[data-installation-tier="static"]')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
  });
});

test.describe('gallery lightbox', () => {
  test('opens from the gallery, browses with arrow keys and closes with Escape', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'keyboard test');
    await page.goto('/our-story');
    const first = page.getByRole('button', { name: /Open image 1 of 6/ });
    await first.scrollIntoViewIfNeeded();
    await first.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText('1 / 6')).toBeVisible();
    await page.keyboard.press('ArrowRight');
    await expect(dialog.getByText('2 / 6')).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('ArrowLeft');
    await expect(dialog.getByText('6 / 6')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(first).toBeFocused();
  });
});

test.describe('three.js installation', () => {
  // CI and this suite's runners rasterise WebGL in software (no GPU): give the scene time.
  test.describe.configure({ timeout: 90_000 });
  test('loads the live scene near the viewport on capable devices', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop GPU path');
    await page.goto('/?three=on');
    const stage = page.locator('[data-installation-state]').first();
    await expect(stage).toHaveAttribute('data-installation-state', 'poster');
    await expect(page.locator('canvas')).toHaveCount(0); // not loaded until needed
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-installation-state', 'live', { timeout: 60_000 });
    await expect(stage.locator('canvas')).toHaveCount(1);
    await expect(stage).toHaveAttribute('aria-label', /glass of white wine/);
  });

  test('falls back to the still image when the WebGL context is lost', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop GPU path');
    await page.goto('/?three=on');
    const stage = page.locator('[data-installation-state]').first();
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-installation-state', 'live', { timeout: 60_000 });
    await page.evaluate(() => {
      const gl = document.querySelector('canvas')?.getContext('webgl2');
      gl?.getExtension('WEBGL_lose_context')?.loseContext();
    });
    await expect(stage).toHaveAttribute('data-installation-state', 'fallback');
    await expect(stage.locator('canvas')).toHaveCount(0);
    await expect(stage.locator('img')).toBeVisible();
  });

  test('uses the still image when WebGL is unavailable', async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (
        this: HTMLCanvasElement,
        type: string,
        ...args: unknown[]
      ) {
        if (type.startsWith('webgl')) return null;
        return (original as (...a: unknown[]) => RenderingContext | null).call(this, type, ...args);
      } as typeof original;
    });
    await page.goto('/');
    const stage = page.locator('[data-installation-tier="static"]').first();
    await stage.scrollIntoViewIfNeeded();
    await expect(stage.locator('img')).toBeVisible();
    await expect(page.locator('canvas')).toHaveCount(0);
  });

  test('releases the WebGL canvas when leaving the page', async ({ page, isMobile }) => {
    test.skip(isMobile, 'desktop GPU path');
    await page.goto('/?three=on');
    const stage = page.locator('[data-installation-state]').first();
    await stage.scrollIntoViewIfNeeded();
    await expect(stage).toHaveAttribute('data-installation-state', 'live', { timeout: 60_000 });
    // The header tucks away while scrolling down (by design); scroll up to reveal it.
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Menu' }).click();
    // Generous timeout: CI runners render WebGL in software, which slows the main thread.
    await expect(page).toHaveURL(/\/menu$/, { timeout: 20_000 });
    await expect(page.locator('canvas')).toHaveCount(0);
  });
});
