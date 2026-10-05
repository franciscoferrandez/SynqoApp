import { expect, test } from '@playwright/test';

for (const scenario of [
  {
    status: 410,
    route: '/caducado',
    title: 'Este equipo ha caducado',
    detail: 'Ya no se puede acceder a este equipo ni recuperar su contenido.',
    symbol: '⌛',
  },
  {
    status: 404,
    route: '/no-encontrado',
    title: 'No encontramos este equipo',
    detail:
      'No encontramos ningún equipo para este enlace. Comprueba que lo hayas abierto completo.',
    symbol: '?',
  },
] as const) {
  test(`shows the approved ${scenario.status} link state for API responses and direct routes`, async ({
    browser,
  }) => {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.route('**/api/teams/current', (route) =>
      route.fulfill({
        status: scenario.status,
        contentType: 'application/problem+json',
        body: JSON.stringify({ status: scenario.status }),
      }),
    );
    await page.goto('/e#t=invalid-example');
    await expect(page.getByRole('heading', { name: scenario.title })).toBeVisible();
    await expect(page.locator('.link-message-card')).toContainText(scenario.detail);
    await expect(page.locator('.link-message-symbol')).toHaveText(scenario.symbol);
    await expect(page.getByRole('navigation', { name: 'Secciones del equipo' })).toHaveCount(0);
    await expect(page.locator('.team-header')).toHaveCount(0);
    const layout = await page.locator('.link-message-card').evaluate((card) => {
      const bounds = card.getBoundingClientRect();
      return {
        centerX: bounds.x + bounds.width / 2,
        viewportX: innerWidth / 2,
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
    expect(Math.abs(layout.centerX - layout.viewportX)).toBeLessThan(2);
    expect(layout.overflow).toBe(false);
    await page.locator('#theme').selectOption('dark');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.goto(scenario.route);
    await expect(page.getByRole('heading', { name: scenario.title })).toBeVisible();
    await expect(page.locator('.link-message-card')).toContainText(scenario.detail);
    await page.setViewportSize({ width: 1280, height: 800 });
    const desktopCenter = await page.locator('.link-message-card').evaluate((card) => {
      const bounds = card.getBoundingClientRect();
      return { card: bounds.x + bounds.width / 2, viewport: innerWidth / 2 };
    });
    expect(Math.abs(desktopCenter.card - desktopCenter.viewport)).toBeLessThan(2);
    await context.close();
  });
}
