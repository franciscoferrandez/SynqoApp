import { expect, test } from '@playwright/test';

for (const viewport of [
  { width: 390, height: 844 },
  { width: 1280, height: 800 },
]) {
  test(`demo links stay still while phrases rotate at ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.route('**/api/configuration', (route) =>
      route.fulfill({
        json: {
          teamCreationEmailMode: 'hidden',
          teamCreationMaxTeams: 2,
          teamCreationWindowMinutes: 60,
          demo: {
            nextResetAt: '2030-01-01T12:00:00Z',
            teams: [
              { name: 'La mesa del jueves', kind: 'social', accessUrl: '/e#t=friends' },
              { name: 'La banda del patio', kind: 'music', accessUrl: '/e#t=band' },
            ],
          },
        },
      }),
    );
    await page.goto('/');
    const links = page.locator('.create-demo-links');
    await expect(links.getByRole('link')).toHaveCount(2);
    await expect(links.locator('svg')).toHaveCount(2);
    await expect(page.locator('#creation-limit-info')).toHaveCount(0);
    await expect(page.getByText(/reinicio|restauración automática/)).toHaveCount(0);
    const topBefore = (await links.boundingBox())?.y;
    await expect(page.locator('.landing-prompts-text')).toContainText(
      '¿Qué canción añadimos al repertorio?',
      { timeout: 5000 },
    );
    const topAfter = (await links.boundingBox())?.y;
    expect(topAfter).toBe(topBefore);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
      viewport.width,
    );
  });
}

test('theme button cycles through the three modes and remembers the choice', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  const theme = page.getByRole('button', { name: /^Tema / });
  await expect(theme).toHaveAttribute('aria-label', /automático \(oscuro\)/);
  await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
  await theme.click();
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await page.reload();
  await expect(theme).toHaveAttribute('aria-label', /Tema oscuro/);
  await theme.click();
  await expect(theme).toHaveAttribute('aria-label', /automático \(oscuro\)/);
  await page.emulateMedia({ colorScheme: 'light' });
  await expect(theme).toHaveAttribute('aria-label', /automático \(claro\)/);
});

test('confirmation shows the remaining creations returned by the API', async ({ page }) => {
  await page.route('**/api/configuration', (route) =>
    route.fulfill({
      json: {
        teamCreationEmailMode: 'hidden',
        teamCreationMaxTeams: 2,
        teamCreationWindowMinutes: 60,
      },
    }),
  );
  await page.route('**/api/teams', (route) =>
    route.fulfill({
      status: 201,
      json: {
        id: '00000000-0000-4000-8000-000000000001',
        name: 'Equipo de prueba',
        timeZone: 'Europe/Madrid',
        expiresAt: '2030-01-01T00:00:00Z',
        firstParticipant: { id: '00000000-0000-4000-8000-000000000002', name: 'Ana' },
        accessUrl: 'http://localhost:4200/e#t=example',
        creationAllowance: { maxTeams: 2, windowMinutes: 60, remaining: 1 },
      },
    }),
  );
  await page.goto('/');
  await expect(page.locator('#creation-limit-info')).toHaveCount(0);
  await page.locator('#team-name').fill('Equipo de prueba');
  await page.locator('#participant-name').fill('Ana');
  await page.getByRole('button', { name: 'Crear equipo' }).click();
  await expect(page.locator('#confirmation-title')).toHaveText('Equipo de prueba');
  await expect(page.locator('#creation-limit-info')).toContainText('2 equipos cada 60 minutos');
  await expect(page.locator('#creation-limit-info')).toContainText(
    'te queda 1 creación disponible',
  );
});
