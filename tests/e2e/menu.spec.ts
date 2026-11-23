import { expect, test } from './fixtures';

test.describe('menu', () => {
  test('ships the full menu in the HTML for crawlers and no-JS visitors', async ({ request }) => {
    const html = await (await request.get('/menu')).text();
    for (const dish of ['Rock oysters', 'Day-boat hake', 'Blood orange sorbet', 'Azure martini']) {
      expect(html).toContain(dish);
    }
    expect(html).toContain('"@type":"Menu"');
  });

  test('filters by category with a shareable URL', async ({ page }) => {
    await page.goto('/menu');
    const sections = page.getByRole('group', { name: 'Menu sections' });
    await sections.getByRole('button', { name: 'Desserts' }).click();
    await expect(sections.getByRole('button', { name: 'Desserts' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page).toHaveURL(/\?category=desserts$/);
    await expect(page.getByRole('heading', { level: 2, name: 'Desserts & cheese' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'To begin' })).toHaveCount(0);

    await page.reload();
    await expect(page.getByRole('heading', { level: 2, name: 'To begin' })).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 2, name: 'Desserts & cheese' })).toBeVisible();
  });

  test('dietary filters require every selected diet and offer a reset when empty', async ({ page }) => {
    await page.goto('/menu');
    const diets = page.getByRole('group', { name: 'Dietary filters' });
    await diets.getByRole('button', { name: /Vegan/ }).click();
    await expect(page.getByText('Roasted squash')).toBeVisible();
    await expect(page.getByText('Day-boat hake')).toHaveCount(0);
    await expect(page.locator('[aria-live="polite"]').filter({ hasText: /Showing \d+ items/ })).toHaveCount(
      1,
    );

    await page
      .getByRole('group', { name: 'Menu sections' })
      .getByRole('button', { name: 'Starters' })
      .click();
    await expect(page.getByText('Nothing matches every filter.')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(page.getByRole('button', { name: 'Rock oysters', exact: true })).toBeVisible();
  });

  test('dish details open in an accessible dialog and return focus', async ({ page }) => {
    await page.goto('/menu');
    const trigger = page.getByRole('button', { name: 'Day-boat hake', exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();
    const dialog = page.getByRole('dialog', { name: 'Day-boat hake' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Fish, Crustaceans, Milk, Soya');
    await expect(dialog).toContainText('Pairing');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('dietary marks explain themselves in a tooltip on keyboard focus', async ({ page, isMobile }) => {
    test.skip(isMobile, 'keyboard test');
    await page.goto('/menu?category=starters');
    const mark = page.locator('span[tabindex="0"]').filter({ hasText: 'Gluten-free' }).first();
    await mark.focus();
    const tooltip = page.getByRole('tooltip');
    await expect(tooltip).toContainText('Made without gluten-containing ingredients');
    await page.keyboard.press('Escape');
    await expect(tooltip).toBeHidden();
  });
});
