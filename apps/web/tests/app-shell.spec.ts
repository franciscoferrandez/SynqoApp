import { expect, test } from '@playwright/test';

test('carga el app shell', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Synqo se está preparando' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Synqo' })).toBeVisible();
});
