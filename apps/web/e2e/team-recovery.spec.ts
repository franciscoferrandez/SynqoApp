import { expect, test } from '@playwright/test';

const team = {
  id: 'recovery-team',
  name: 'Equipo recuperación',
  timeZone: 'Europe/Madrid',
  expiresAt: '2026-12-31T15:30:00Z',
  participants: [
    { id: 'ana', name: 'Ana' },
    { id: 'bea', name: 'Bea' },
  ],
};

test.beforeEach(async ({ page }) => {
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
});

for (const participants of [team.participants, []]) {
  test(`invalid local identity cannot expose content (${participants.length} participants)`, async ({
    page,
  }) => {
    await page.addInitScript(() =>
      localStorage.setItem('synqo-participant-recovery-team', 'removed'),
    );
    await page.route('**/api/teams/current', (route) =>
      route.fulfill({ json: { ...team, participants } }),
    );
    await page.goto('/e#t=test');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.locator('.team-header')).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Disponibilidad del equipo' })).toHaveCount(0);
    expect(
      await page.evaluate(() => localStorage.getItem('synqo-participant-recovery-team')),
    ).toBeNull();
    await expect(
      participants.length
        ? page.getByRole('button', { name: 'Ana', exact: true })
        : page.locator('#new-name'),
    ).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('#team-name')).toBeVisible();
  });
}

test('selecting and changing identity is local and expiry uses the browser zone', async ({
  browser,
}) => {
  const context = await browser.newContext({ timezoneId: 'Asia/Tokyo' });
  const page = await context.newPage();
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  const mutations: string[] = [];
  page.on('request', (request) => {
    if (request.method() !== 'GET') mutations.push(request.url());
  });
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.goto('/e#t=test');
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-identity-trigger]')).toContainText('Ana');
  await expect(page.locator('[data-identity-trigger]')).toBeFocused();
  await expect(page.locator('.team-meta')).toContainText('1 de enero de 2027');
  await page.keyboard.press('Enter');
  await page.getByRole('button', { name: 'Bea', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('[data-identity-trigger]')).toContainText('Bea');
  await expect(page.locator('[data-identity-trigger]')).toBeFocused();
  await page.reload();
  await expect(page.locator('[data-identity-trigger]')).toContainText('Bea');
  expect(mutations).toEqual([]);
  await context.close();
});

for (const status of [401, 404, 410]) {
  const title =
    status === 401
      ? 'Se requiere el enlace de acceso'
      : status === 404
        ? 'No encontramos este equipo'
        : 'Este equipo ha caducado';
  for (const operation of ['load', 'add']) {
    test(`${status} during ${operation} clears team content`, async ({ page }) => {
      await page.addInitScript(() =>
        localStorage.setItem('synqo-participant-recovery-team', 'ana'),
      );
      await page.route('**/api/teams/current', (route) =>
        route.fulfill(operation === 'load' ? { status, json: { status } } : { json: team }),
      );
      await page.route('**/api/teams/current/participants', (route) =>
        route.fulfill({ status, json: { status } }),
      );
      await page.goto('/e#t=test');
      if (operation === 'add') {
        await page.locator('[data-identity-trigger]').press('Enter');
        await page.locator('#new-name').fill('Clara');
        await page.locator('#new-name').press('Enter');
      }
      await expect(page.getByRole('heading', { name: title })).toBeVisible();
      await expect(page.getByRole('heading', { name: title })).toBeFocused();
      await expect(page.locator('.team-header')).toHaveCount(0);
      await expect(page.getByRole('dialog')).toHaveCount(0);
    });
  }
}

for (const failure of ['network', '500']) {
  test(`${failure} on load allows retry without an access error`, async ({ page }) => {
    let calls = 0;
    await page.route('**/api/teams/current', (route) => {
      if (++calls > 1) return route.fulfill({ json: team });
      return failure === 'network'
        ? route.abort('failed')
        : route.fulfill({ status: 500, json: { status: 500 } });
    });
    await page.goto('/e#t=test');
    await expect(page.getByRole('heading', { name: 'No se pudo cargar el equipo' })).toBeVisible();
    await page.getByRole('button', { name: 'Reintentar' }).press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
  });
}

test('creation violations keep values, associate fields and focus the first error', async ({
  page,
}) => {
  await page.route('**/api/teams', (route) =>
    route.fulfill({
      status: 422,
      json: {
        violations: [
          { propertyPath: 'name', message: 'El nombre del equipo no es válido.' },
          { propertyPath: 'firstParticipantName', message: 'El participante no es válido.' },
        ],
      },
    }),
  );
  await page.goto('/');
  await page.locator('#team-name').fill('Equipo');
  await page.locator('#participant-name').fill('Ana');
  await page.locator('#participant-name').press('Enter');
  await expect(page.getByRole('alert')).toContainText('Revisa los nombres');
  await expect(page.locator('#team-name')).toBeFocused();
  await expect(page.locator('#team-name')).toHaveValue('Equipo');
  await expect(page.locator('#participant-name')).toHaveValue('Ana');
  await expect(page.locator('#team-name')).toHaveAttribute('aria-describedby', 'team-name-error');
  await expect(page.locator('#participant-name')).toHaveAttribute('aria-invalid', 'true');
});

test('participant violations and temporary errors preserve the form for retry', async ({
  page,
}) => {
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  let calls = 0;
  await page.route('**/api/teams/current/participants', (route) => {
    calls++;
    return route.fulfill(
      calls === 1
        ? {
            status: 422,
            json: { violations: [{ propertyPath: 'name', message: 'Nombre no válido.' }] },
          }
        : calls === 2
          ? { status: 500, json: { status: 500 } }
          : {
              status: 201,
              json: { participant: { id: 'clara', name: 'Clara' }, expiresAt: team.expiresAt },
            },
    );
  });
  await page.goto('/e#t=test');
  await page.locator('#new-name').fill('Clara');
  await page.locator('#new-name').press('Enter');
  await expect(page.getByRole('alert')).toHaveText('Nombre no válido.');
  await expect(page.locator('#new-name')).toBeFocused();
  await expect(page.locator('#new-name')).toHaveAttribute('aria-describedby', 'identity-error');
  await page.locator('#new-name').press('Enter');
  await expect(page.getByRole('alert')).toContainText('Inténtalo otra vez');
  await expect(page.locator('#new-name')).toHaveValue('Clara');
  await page.locator('#new-name').press('Enter');
  await expect(page.locator('[data-identity-trigger]')).toContainText('Clara');
});

test('native share receives the full link on confirmation and in the team', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'share', {
      value: async (data: ShareData) => {
        (window as unknown as { shared: ShareData }).shared = data;
      },
    });
  });
  const accessUrl = 'http://localhost:4200/e#t=share-test';
  await page.route('**/api/teams', (route) =>
    route.fulfill({
      status: 201,
      json: { ...team, firstParticipant: team.participants[0], accessUrl },
    }),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.addInitScript(() => localStorage.setItem('synqo-participant-recovery-team', 'ana'));
  await page.goto('/');
  await page.locator('#team-name').fill('Equipo');
  await page.locator('#participant-name').fill('Ana');
  await page.locator('#participant-name').press('Enter');
  await page.getByRole('button', { name: 'Compartir', exact: true }).press('Enter');
  expect(await page.evaluate(() => (window as unknown as { shared: ShareData }).shared.url)).toBe(
    accessUrl,
  );
  await page.getByRole('link', { name: /Ver el calendario/ }).press('Enter');
  await page.getByRole('button', { name: 'Compartir enlace', exact: true }).press('Enter');
  expect(await page.evaluate(() => (window as unknown as { shared: ShareData }).shared.url)).toBe(
    accessUrl,
  );
});

test('expiry falls back to the team zone when the browser does not report one', async ({
  page,
}) => {
  await page.addInitScript(() => {
    const resolvedOptions = Intl.DateTimeFormat.prototype.resolvedOptions;
    Intl.DateTimeFormat.prototype.resolvedOptions = function () {
      return { ...resolvedOptions.call(this), timeZone: '' };
    };
    localStorage.setItem('synqo-participant-recovery-team', 'ana');
  });
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.goto('/e#t=test');
  await expect(page.locator('.team-meta')).toContainText('31 de diciembre de 2026');
});
