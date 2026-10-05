import { expect, test } from '@playwright/test';

test('creates a date consultation from the calendar and keeps selections across months', async ({
  page,
}) => {
  let consultations: Record<string, unknown>[] = [];
  let submitted: Record<string, unknown> | undefined;
  const team = {
    id: 'date-team',
    name: 'Equipo de fechas',
    timeZone: 'Europe/Madrid',
    expiresAt: '2027-01-01T00:00:00Z',
    participants: [{ id: 'date-person', name: 'Ana' }],
  };
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-date-team', 'date-person'),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.route('**/api/teams/current/consultations', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { open: consultations, resolved: [], rejected: [] } });
    }
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    const dates = submitted['options'] as string[];
    const consultation = {
      id: 'date-consultation-created',
      type: 'date',
      state: 'open',
      title: submitted['title'],
      createdAt: '2026-10-05T12:00:00+00:00',
      createdBy: team.participants[0],
      options: dates.map((date, position) => ({ id: `date-option-${position}`, date, position })),
    };
    consultations = [consultation];
    return route.fulfill({ status: 201, json: { consultation, expiresAt: team.expiresAt } });
  });

  await page.goto('/e/calendario#t=date-token');
  const calendar = page.locator('.calendar-panel');
  const composer = page.locator('.calendar-detail-composer');
  const createButton = page.getByRole('button', { name: 'Crear consulta de fechas' });
  await expect(createButton).toBeEnabled();
  await createButton.press('Enter');
  await expect(calendar.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(0);
  const submit = composer.getByRole('button', { name: 'Crear consulta', exact: true });
  await expect(submit).toBeDisabled();
  await page.locator('#date-consultation-title').fill('¿Qué días nos van bien?');
  await expect(submit).toBeDisabled();

  const today = page.locator('.calendar-day.today');
  const todayDate = await today.getAttribute('data-date');
  await today.press('Enter');
  await expect(today).toHaveAttribute('aria-pressed', 'true');
  const monthHeading = calendar.locator('.monthbar h3');
  const currentMonth = await monthHeading.textContent();
  await page.getByRole('button', { name: 'Mes siguiente' }).press('Enter');
  await expect(monthHeading).not.toHaveText(currentMonth!);
  const nextMonthDate = await calendar
    .locator('.calendar-day:not(:disabled)')
    .first()
    .getAttribute('data-date');
  await calendar.locator(`.calendar-day[data-date="${nextMonthDate}"]`).press('Enter');
  await expect(calendar.locator(`.calendar-day[data-date="${nextMonthDate}"]`)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await expect(
    composer
      .getByRole('list', { name: 'Fechas elegidas, en orden cronológico' })
      .getByRole('listitem'),
  ).toHaveCount(2);
  const selectedDates = await composer
    .locator('.date-selection-list li')
    .evaluateAll((items) => items.map((item) => item.getAttribute('data-date')));
  expect(selectedDates).toEqual([todayDate, nextMonthDate]);

  await expect(submit).toBeEnabled();
  await submit.click({ force: true });
  const confirmation = page.getByRole('dialog', { name: '¿Crear esta consulta?' });
  await expect(confirmation).toBeVisible();
  await confirmation.getByRole('button', { name: 'Confirmar creación' }).press('Enter');
  await expect(page).toHaveURL(/\/e\/consultas#t=date-token$/);
  await expect(page.getByRole('heading', { name: 'Abiertas' })).toBeVisible();
  await expect(page.locator('.consultation-card')).toContainText('Consulta de fechas');
  expect(submitted).toMatchObject({
    type: 'date',
    participantId: 'date-person',
    title: '¿Qué días nos van bien?',
    options: expect.arrayContaining([todayDate, nextMonthDate]),
  });
  expect(submitted?.['timeZone']).toEqual(expect.any(String));

  await page.reload();
  await expect(page.locator('.consultation-card')).toContainText('Consulta de fechas');

  const browser = page.context().browser();
  if (!browser) throw new Error('Expected Playwright to launch a browser.');
  const otherContext = await browser.newContext();
  await otherContext.addInitScript(() =>
    localStorage.setItem('synqo-participant-date-team', 'date-person'),
  );
  await otherContext.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await otherContext.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await otherContext.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: consultations, resolved: [], rejected: [] } }),
  );
  const otherPage = await otherContext.newPage();
  await otherPage.goto('/e/consultas#t=date-token');
  await expect(otherPage.locator('.consultation-card')).toContainText('Consulta de fechas');
  await otherContext.close();
});

test('shows the composer below the calendar on mobile and keeps a draft when cancellation is rejected', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-mobile-date-team', 'mobile-person'),
  );
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      json: {
        id: 'mobile-date-team',
        name: 'Equipo móvil',
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [{ id: 'mobile-person', name: 'Ana' }],
      },
    }),
  );
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.goto('/e/calendario#t=mobile-token');
  const createButton = page.getByRole('button', { name: 'Crear consulta de fechas' });
  await expect(createButton).toBeEnabled();
  await createButton.click({ force: true });
  const calendarPanel = page.locator('.calendar-panel');
  const composer = page.locator('.calendar-detail-composer');
  await expect(composer).toBeVisible();
  const calendarColumns = await page
    .locator('.calendar-layout')
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(calendarColumns).toBe(1);
  await composer.getByRole('button', { name: 'Cancelar', exact: true }).click({ force: true });
  await expect(composer).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click({ force: true });
  await page.locator('#date-consultation-title').fill('¿Qué día?');
  await page.locator('.calendar-day.today').click({ force: true });
  await page
    .locator('.calendar-detail-composer')
    .getByRole('button', { name: 'Cancelar', exact: true })
    .click({ force: true });
  const confirmation = page.getByRole('dialog', { name: '¿Abandonar la consulta?' });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole('button', { name: 'Seguir editando' })).toBeFocused();
  await confirmation.getByRole('button', { name: 'Seguir editando' }).click({ force: true });
  await expect(page.locator('#date-consultation-title')).toHaveValue('¿Qué día?');
  await expect(page.locator('.date-selection-list li')).toHaveCount(1);
  await page
    .locator('.calendar-detail-composer')
    .getByRole('button', { name: 'Cancelar', exact: true })
    .click({ force: true });
  await page
    .getByRole('dialog', { name: '¿Abandonar la consulta?' })
    .getByRole('button', { name: 'Abandonar edición' })
    .click({ force: true });
  await expect(page.locator('.calendar-detail-composer')).toHaveCount(0);
});

test('announces create errors and preserves the date-consultation draft', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-error-date-team', 'error-person'),
  );
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      json: {
        id: 'error-date-team',
        name: 'Equipo de error',
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [{ id: 'error-person', name: 'Ana' }],
      },
    }),
  );
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.route('**/api/teams/current/consultations', (route) =>
    route.request().method() === 'GET'
      ? route.fulfill({ json: { open: [], resolved: [], rejected: [] } })
      : route.fulfill({ status: 503, json: { detail: 'Servicio temporalmente no disponible.' } }),
  );

  await page.goto('/e/calendario#t=error-token');
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click({ force: true });
  await page.locator('#date-consultation-title').fill('¿Qué día nos conviene?');
  await page.locator('.calendar-day.today').click({ force: true });
  const submit = page.getByRole('button', { name: 'Crear consulta', exact: true });
  await expect(submit).toBeEnabled();
  await submit.press('Enter');
  await page
    .getByRole('dialog', { name: '¿Crear esta consulta?' })
    .getByRole('button', { name: 'Confirmar creación' })
    .click({ force: true });
  await expect(page.getByRole('alert')).toContainText('No se pudo crear la consulta');
  await expect(page.locator('#date-consultation-title')).toHaveValue('¿Qué día nos conviene?');
  await expect(page.locator('.date-selection-list li')).toHaveCount(1);
});

test('limits date selection to ten and makes room after removing a selected day', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-limit-team', 'limit-person'),
  );
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      json: {
        id: 'limit-team',
        name: 'Equipo con límite',
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [{ id: 'limit-person', name: 'Ana' }],
      },
    }),
  );
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );

  await page.goto('/e/calendario#t=limit-token');
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click({ force: true });
  const calendar = page.locator('.calendar-panel');
  const monthHeading = calendar.locator('.monthbar h3');
  const currentMonth = await monthHeading.textContent();
  await page.getByRole('button', { name: 'Mes siguiente' }).press('Enter');
  await expect(monthHeading).not.toHaveText(currentMonth!);
  const selectable = calendar.locator('.calendar-day:not(:disabled)');
  const dates = await selectable.evaluateAll((items) =>
    items.slice(0, 11).map((item) => item.getAttribute('data-date')),
  );
  for (const date of dates.slice(0, 10)) {
    await calendar.locator(`.calendar-day[data-date="${date}"]`).click({ force: true });
  }
  await expect(page.locator('.date-selection-list li')).toHaveCount(10);
  const eleventh = calendar.locator(`.calendar-day[data-date="${dates[10]}"]`);
  await expect(eleventh).toBeDisabled();
  await page.locator('.date-selection-list .remove-option').first().click({ force: true });
  await expect(eleventh).toBeEnabled();
  await eleventh.click({ force: true });
  await expect(page.locator('.date-selection-list li')).toHaveCount(10);
});
