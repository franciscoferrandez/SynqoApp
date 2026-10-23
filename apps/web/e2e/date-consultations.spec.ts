import { expect, test } from '@playwright/test';

const team = {
  id: 'date-team',
  name: 'Equipo de fechas',
  timeZone: 'Europe/Madrid',
  expiresAt: '2027-01-01T00:00:00Z',
  participants: [{ id: 'date-person', name: 'Ana' }],
};

async function installCalendar(page: import('@playwright/test').Page) {
  await page.addInitScript(
    ({ teamId, participantId }) => {
      localStorage.setItem(`synqo-participant-${teamId}`, participantId);
      localStorage.setItem(
        'synqo:calendar-view:v2',
        JSON.stringify({ extended: true, overlay: true, counts: true, rule: 'median' }),
      );
    },
    { teamId: team.id, participantId: team.participants[0].id },
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.route('**/api/teams/current/events/calendar**', (route) =>
    route.fulfill({ json: { events: [] } }),
  );
  await page.route(/\/api\/teams\/current\/events$/, (route) =>
    route.fulfill({ json: { unfinalized: [], future: [], past: [], rejected: [] } }),
  );
}

test('creates from the calendar in its visible month with an empty draft and saves directly', async ({
  page,
}) => {
  let consultations: Record<string, unknown>[] = [];
  let submitted: Record<string, unknown> | undefined;
  let writes = 0;
  await installCalendar(page);
  await page.route('**/api/teams/current/consultations', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { open: consultations, resolved: [], rejected: [] } });
    }
    writes += 1;
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
  const mainCalendar = page.locator('.calendar-panel');
  const createButton = page.getByRole('button', { name: 'Crear consulta de fechas' });
  await expect(createButton).toBeEnabled();

  // The entry point reuses the visible future month and ignores its open day detail.
  const today = mainCalendar.locator('.calendar-day.today');
  const todayValue = (await today.getAttribute('data-date'))!;
  const [year, month] = todayValue.split('-').map(Number);
  const futureMonthDate = new Date(Date.UTC(year, month, 1));
  const futureMonth = `${futureMonthDate.getUTCFullYear()}-${String(
    futureMonthDate.getUTCMonth() + 1,
  ).padStart(2, '0')}`;
  await mainCalendar.getByRole('button', { name: 'Mes siguiente' }).click();
  const openDay = mainCalendar.locator(`.calendar-day[data-date^="${futureMonth}"]`).first();
  await openDay.click();
  const openDayValue = (await openDay.getAttribute('data-date'))!;
  const [visibleYear, visibleMonthNumber] = openDayValue.split('-').map(Number);
  const expectedMonth = new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(visibleYear, visibleMonthNumber - 1, 1)));
  await createButton.press('Enter');
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  await expect(editor).toBeVisible();
  await expect(editor.locator('.date-month-toolbar h4')).toHaveText(expectedMonth);
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue('');
  await expect(editor.locator('[data-date][aria-pressed="true"]')).toHaveCount(0);
  await expect(editor.locator('.team-counts, .day-count, .availability-count')).toHaveCount(0);
  await expect(editor.getByRole('switch', { name: 'Crear evento provisional' })).not.toBeChecked();
  await expect(editor.getByRole('button', { name: 'Texto', exact: true })).toHaveCount(0);
  await expect(editor).not.toContainText(/\b\d+ votos?\b/i);
  await expect(editor.locator('.date-selection-list')).toHaveCount(0);

  const submit = editor.getByRole('button', { name: 'Crear consulta', exact: true });
  await submit.click();
  await expect(editor.getByRole('alert')).toContainText('Revisa el título');
  expect(writes).toBe(0);
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué días nos van bien?');
  const firstDate = editor.locator('.calendar-day:not(:disabled)').first();
  const firstDateValue = await firstDate.getAttribute('data-date');
  await firstDate.click();
  await expect(firstDate).toHaveAttribute('aria-pressed', 'true');
  await editor.getByRole('button', { name: 'Mes siguiente' }).press('Enter');
  const secondDate = editor.locator('.calendar-day:not(:disabled)').first();
  const secondDateValue = await secondDate.getAttribute('data-date');
  await secondDate.click();
  await expect(secondDate).toHaveAttribute('aria-pressed', 'true');
  await editor.getByRole('button', { name: 'Mes anterior' }).press('Enter');
  await expect(editor.locator(`.calendar-day[data-date="${firstDateValue}"]`)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await editor.getByRole('button', { name: 'Mes siguiente' }).press('Enter');
  await expect(editor.locator(`.calendar-day[data-date="${secondDateValue}"]`)).toHaveAttribute(
    'aria-pressed',
    'true',
  );

  await expect(submit).toBeEnabled();
  await submit.press('Enter');
  await expect(page.getByRole('dialog', { name: '¿Crear esta consulta?' })).toHaveCount(0);
  await expect(page).toHaveURL(/\/e\/consultas#t=date-token$/);
  await expect(page.getByRole('heading', { name: 'Abiertas' })).toBeVisible();
  await expect(page.locator('.consultation-card')).toContainText('¿Qué días nos van bien?');
  expect(writes).toBe(1);
  expect(submitted).toMatchObject({
    type: 'date',
    createEvent: false,
    participantId: 'date-person',
    title: '¿Qué días nos van bien?',
    options: expect.arrayContaining([firstDateValue, secondDateValue]),
    timeZone: expect.any(String),
  });
});

test('opens in a historical month with no selected dates and preserves the calendar on Escape', async ({
  page,
}) => {
  let writes = 0;
  await installCalendar(page);
  await page.route('**/api/teams/current/consultations', (route) => {
    if (route.request().method() === 'POST') writes += 1;
    return route.fulfill({ json: { open: [], resolved: [], rejected: [] } });
  });
  await page.goto('/e/calendario#t=history-token');
  const mainCalendar = page.locator('.calendar-panel');
  const todayValue = (await mainCalendar.locator('.calendar-day.today').getAttribute('data-date'))!;
  const [year, month] = todayValue.split('-').map(Number);
  const historical = new Date(Date.UTC(year, month - 3, 1));
  const historicalMonth = `${historical.getUTCFullYear()}-${String(
    historical.getUTCMonth() + 1,
  ).padStart(2, '0')}`;
  await mainCalendar.getByRole('button', { name: 'Mes anterior' }).click();
  await mainCalendar.getByRole('button', { name: 'Mes anterior' }).click();
  const visibleMainDay = mainCalendar.locator(`.calendar-day[data-date^="${historicalMonth}"]`);
  await expect(visibleMainDay.first()).toBeVisible();
  const preservedMonth = await mainCalendar.locator('.monthbar h3').textContent();
  const createButton = page.getByRole('button', { name: 'Crear consulta de fechas' });
  await createButton.click();
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  const [historicalYear, historicalMonthNumber] = historicalMonth.split('-').map(Number);
  const expectedMonth = new Intl.DateTimeFormat('es', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(historicalYear, historicalMonthNumber - 1, 1)));
  await expect(editor.locator('.date-month-toolbar h4')).toHaveText(expectedMonth);
  await expect(editor.locator('.calendar-day')).not.toHaveCount(0);
  await expect(editor.locator('.calendar-day:not(:disabled)')).toHaveCount(0);
  await expect(editor.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(editor).toHaveCount(0);
  await expect(createButton).toBeFocused();
  await expect(mainCalendar.locator('.monthbar h3')).toHaveText(preservedMonth!);
  expect(writes).toBe(0);
});

test('cancelling a changed draft asks before discarding and does not write', async ({ page }) => {
  let writes = 0;
  await installCalendar(page);
  await page.route('**/api/teams/current/consultations', (route) => {
    if (route.request().method() === 'POST') writes += 1;
    return route.fulfill({ json: { open: [], resolved: [], rejected: [] } });
  });

  await page.goto('/e/calendario#t=date-switch-token');
  const createButton = page.getByRole('button', { name: 'Crear consulta de fechas' });
  await createButton.click();
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  const createSwitch = editor.getByRole('switch', { name: 'Crear evento provisional' });
  await createSwitch.check();
  await editor.getByRole('button', { name: 'Cancelar' }).click();
  await expect(editor).toHaveCount(0);
  expect(writes).toBe(0);

  await createButton.click();
  const changedEditor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  await changedEditor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué día?');
  const changedDate = changedEditor.locator('.calendar-day:not(:disabled)').first();
  await changedDate.click();
  const changedSwitch = changedEditor.getByRole('switch', {
    name: 'Crear evento provisional',
  });
  await changedSwitch.check();
  await changedEditor.getByRole('button', { name: 'Cancelar' }).click();
  const discardDialog = page.getByRole('dialog', { name: '¿Descartar los cambios?' });
  await expect(discardDialog).toBeVisible();
  await discardDialog.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(changedSwitch).toBeChecked();
  await changedEditor.getByRole('button', { name: 'Cancelar' }).click();
  await page
    .getByRole('dialog', { name: '¿Descartar los cambios?' })
    .getByRole('button', { name: 'Abandonar edición' })
    .click();
  await expect(changedEditor).toHaveCount(0);
  await expect(createButton).toBeFocused();
  expect(writes).toBe(0);

  await createButton.click();
  const reopened = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  await expect(
    reopened.getByRole('switch', { name: 'Crear evento provisional' }),
  ).not.toBeChecked();
  await reopened.getByRole('button', { name: 'Cancelar' }).click();
  await expect(reopened).toHaveCount(0);
  expect(writes).toBe(0);
});

test('mobile date creation uses the shared dialog and retains its draft after cancellation is rejected', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await installCalendar(page);
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: [], resolved: [], rejected: [] } }),
  );
  await page.goto('/e/calendario#t=mobile-token');
  const createButton = page.getByRole('button', { name: 'Crear consulta de fechas' });
  await createButton.click();
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  await expect(editor).toBeVisible();
  const columns = await editor
    .locator('.calendar-days')
    .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
  expect(columns).toBe(7);
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué día?');
  const date = editor.locator('.calendar-day:not(:disabled)').first();
  await date.click();
  const dateValue = await date.getAttribute('data-date');
  await editor.getByRole('button', { name: 'Cancelar' }).click();
  const confirmation = page.getByRole('dialog', { name: '¿Descartar los cambios?' });
  await expect(confirmation.getByRole('button', { name: 'Seguir editando' })).toBeFocused();
  await confirmation.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue('¿Qué día?');
  await expect(editor.locator(`[data-date="${dateValue}"]`)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await editor.getByRole('button', { name: 'Cancelar' }).click();
  await page
    .getByRole('dialog', { name: '¿Descartar los cambios?' })
    .getByRole('button', { name: 'Abandonar edición' })
    .click();
  await expect(editor).toHaveCount(0);
  await expect(createButton).toBeFocused();
});

test('announces create errors and preserves the title and selected date for retry', async ({
  page,
}) => {
  let attempts = 0;
  await installCalendar(page);
  await page.route('**/api/teams/current/consultations', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { open: [], resolved: [], rejected: [] } });
    }
    attempts += 1;
    return attempts === 1
      ? route.fulfill({ status: 503, json: { detail: 'Servicio temporalmente no disponible.' } })
      : route.fulfill({
          status: 201,
          json: {
            consultation: {
              id: 'retry-created',
              type: 'date',
              title: '¿Qué día nos conviene?',
              state: 'open',
              options: [],
            },
            expiresAt: team.expiresAt,
          },
        });
  });

  await page.goto('/e/calendario#t=error-token');
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué día nos conviene?');
  const selected = editor.locator('.calendar-day:not(:disabled)').first();
  const selectedDate = await selected.getAttribute('data-date');
  await selected.click();
  const submit = editor.getByRole('button', { name: 'Crear consulta', exact: true });
  await submit.click();
  await expect(page.getByRole('alert')).toContainText('No se pudo guardar la consulta');
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(
    '¿Qué día nos conviene?',
  );
  await expect(editor.locator(`[data-date="${selectedDate}"]`)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await submit.click();
  expect(attempts).toBe(2);
});

test('limits selected dates to ten and allows a replacement after removing one', async ({
  page,
}) => {
  await installCalendar(page);
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: [], resolved: [], rejected: [] } }),
  );
  await page.goto('/e/calendario#t=limit-token');
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  await editor.getByRole('button', { name: 'Mes siguiente' }).click();
  const enabledDays = editor.locator('.calendar-day:not(:disabled)');
  const dates = await enabledDays.evaluateAll((items) =>
    items.slice(0, 11).map((item) => item.getAttribute('data-date')),
  );
  for (const date of dates.slice(0, 10)) {
    await editor.locator(`.calendar-day[data-date="${date}"]`).click();
  }
  await expect(editor.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(10);
  const eleventh = editor.locator(`.calendar-day[data-date="${dates[10]}"]`);
  await expect(eleventh).toBeDisabled();
  const first = editor.locator(`.calendar-day[data-date="${dates[0]}"]`);
  await first.click();
  await expect(eleventh).toBeEnabled();
  await eleventh.click();
  await expect(editor.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(10);
});
