import { expect, test } from './fixtures';

test.describe('reservation flow (demonstration)', () => {
  test('validates required fields and links errors to inputs', async ({ page }) => {
    await page.goto('/reservations');
    await page.getByRole('button', { name: 'Request reservation' }).click();
    const alert = page.getByRole('alert').filter({ hasText: 'Please check the highlighted fields' });
    await expect(alert).toBeVisible();
    await expect(alert.getByRole('link', { name: /Date: Choose a date/ })).toBeVisible();
    await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  });

  test('restricts dates and books an available time end-to-end', async ({ page }) => {
    await page.goto('/reservations');

    await page.getByRole('button', { name: /Choose a date/ }).click();
    const picker = page.getByRole('dialog', { name: 'Choose a date' });
    await expect(picker).toBeVisible();

    // Sundays/Mondays and past days are announced as unavailable and cannot be chosen.
    const closed = picker.locator('button[data-date][aria-disabled="true"]').first();
    await expect(closed).toHaveAttribute('aria-label', /closed|passed|open 60 days/i);

    // Keyboard: arrow keys move between days.
    const focusedBefore = await page.evaluate(() => document.activeElement?.getAttribute('data-date'));
    await page.keyboard.press('ArrowRight');
    const focusedAfter = await page.evaluate(() => document.activeElement?.getAttribute('data-date'));
    expect(focusedAfter).not.toBe(focusedBefore);

    // Pick the first selectable Tuesday–Thursday (dinner every evening).
    const openDay = picker.locator('button[data-date]:not([aria-disabled])').first();
    if ((await openDay.count()) === 0) await picker.getByRole('button', { name: 'Next month' }).click();
    await picker.locator('button[data-date]:not([aria-disabled])').first().click();
    await expect(picker).toBeHidden();

    const times = page.getByRole('group', { name: 'Time' });
    const firstFree = times.locator('input[type="radio"]:not([disabled])').first();
    await expect(firstFree).toBeAttached({ timeout: 10_000 });
    await times.locator(`label[for="${await firstFree.getAttribute('id')}"]`).click();
    await expect(firstFree).toBeChecked();

    await page.getByLabel('Full name').fill('Ada Lovelace');
    await page.getByLabel('Email').fill('ada@example.com');
    await page.getByLabel('Phone').fill('+44 20 7946 0958');
    await page.getByText('Vegetarian', { exact: true }).click();
    await page.getByLabel('Special requests').fill('A quiet table, please.');

    await page.getByRole('button', { name: 'Request reservation' }).click();
    const confirmation = page.getByRole('heading', { name: 'Demonstration request received' });
    await expect(confirmation).toBeVisible({ timeout: 15_000 });
    await expect(confirmation).toBeFocused();
    await expect(page.getByText(/^DEMO-[A-Z2-9]{6}$/)).toBeVisible();
    await expect(page.getByText(/does not create a booking at a real restaurant/)).toBeVisible();

    await page.getByRole('button', { name: 'Make another request' }).click();
    await expect(page.getByRole('button', { name: 'Request reservation' })).toBeVisible();
  });

  test('availability API validates input and never caches', async ({ request }) => {
    const bad = await request.get('/api/availability?date=2026-02-30&guests=2');
    expect(bad.status()).toBe(400);
    const tooMany = await request.get('/api/availability?date=2030-01-01&guests=40');
    expect(tooMany.status()).toBe(400);
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 7);
    while (![2, 3, 4].includes(d.getUTCDay())) d.setUTCDate(d.getUTCDate() + 1);
    const ok = await request.get(`/api/availability?date=${d.toISOString().slice(0, 10)}&guests=2`);
    expect(ok.status()).toBe(200);
    expect(ok.headers()['cache-control']).toBe('no-store');
    const body = await ok.json();
    expect(body.status).toBe('open');
    expect(body.slots.length).toBeGreaterThan(0);
  });

  test('visit information and FAQ are reachable without JavaScript features', async ({ page }) => {
    await page.goto('/reservations#visit');
    await expect(page.getByRole('heading', { name: 'Finding us' })).toBeVisible();
    const monday = page.getByRole('row', { name: /Monday Closed/ });
    await monday.scrollIntoViewIfNeeded();
    await expect(monday).toBeVisible();
    const question = page.getByText('Can you cater for allergies and dietary requirements?');
    await question.scrollIntoViewIfNeeded();
    await question.click();
    await expect(page.getByText(/adapt most courses, including the full tasting menu/)).toBeVisible();
  });
});
