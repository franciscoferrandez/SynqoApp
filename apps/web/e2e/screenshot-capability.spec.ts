import { expect, test } from '@playwright/test';

test('Chromium can capture a simple page as PNG', async ({ page }) => {
  test.setTimeout(75_000);

  await page.setContent('<!doctype html><html><body><h1>Screenshot check</h1></body></html>');

  const screenshot = await page.screenshot({
    animations: 'disabled',
    caret: 'hide',
    timeout: 60_000,
  });

  expect(Array.from(screenshot.subarray(0, 8))).toEqual([137, 80, 78, 71, 13, 10, 26, 10]);
  expect(screenshot.length).toBeGreaterThan(8);
});
