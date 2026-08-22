import { expect, test } from '@playwright/test';

test('map home renders bubbles and sidebar', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('group', { name: 'Map of AI research organizations' })).toBeVisible();
  await expect(page.locator('svg g[tabindex="0"]').first()).toBeVisible(); // at least one bubble
  await expect(page.getByText('Top 10 · Global')).toBeVisible();
});

test('leaderboard renders and search filters', async ({ page }) => {
  // domcontentloaded, not the default 'load': the leaderboard renders ~900 rows,
  // each with an <img> pointing at an external homepage/logo URL, so waiting for
  // every one of those to settle before navigation resolves is unreliable.
  await page.goto('/leaderboard', { waitUntil: 'domcontentloaded' });
  const rows = page.locator('tbody tr');
  await expect(rows.first()).toBeVisible();
  const before = await rows.count();
  await page.getByPlaceholder('Search organizations…').fill('university');
  const after = await rows.count();
  expect(after).toBeLessThanOrEqual(before);
  expect(after).toBeGreaterThan(0);
});

test('org profile shows tier and history', async ({ page }) => {
  // The /uk region (~95 rows) instead of the global board (~900 rows): the
  // global board's row count means its auto-prefetching links saturate the
  // connection pool and can starve the click's own navigation fetch.
  await page.goto('/leaderboard/uk', { waitUntil: 'domcontentloaded' });
  // Client-side route change (same document, no new 'load' event ever fires).
  await Promise.all([
    page.waitForURL(/\/org\//, { waitUntil: 'commit' }),
    page.locator('tbody tr td a').first().click(),
  ]);
  await expect(page.getByText(/LP$/).first()).toBeVisible();
  await expect(page.getByText('Top recent AI papers')).toBeVisible();
});

test('navbar search finds an org by partial name', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('textbox', { name: 'Search organizations' }).fill('stan');
  await expect(page.getByText('Stanford', { exact: false }).first()).toBeVisible();
});
