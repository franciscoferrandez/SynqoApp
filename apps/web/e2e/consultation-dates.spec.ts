import { expect, test } from '@playwright/test';

const participant = { id: 'dates-person', name: 'Ana' };
const team = {
  id: 'dates-team',
  name: 'Equipo de fechas',
  timeZone: 'Europe/Madrid',
  expiresAt: '2027-01-01T00:00:00Z',
  participants: [participant],
};

function civilDate(offset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(date);
}

function civilDateInNextMonth(): string {
  const date = new Date();
  date.setDate(1);
  date.setMonth(date.getMonth() + 1);
  date.setDate(15);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(date);
}

function day(offset: number, state: 'available' | 'maybe' | 'unavailable' | null = null) {
  return {
    date: civilDate(offset),
    state,
    summaryStates: { worst: state, median: state, mostFrequent: state },
    counts: { available: state === 'available' ? 1 : 0, maybe: 0, unavailable: 0 },
    marks: state
      ? [{ participantId: participant.id, participantName: participant.name, state }]
      : [],
  };
}

const emptyGroups = { open: [], resolved: [], rejected: [] };

function formattedDate(date: string): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'full',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

async function installCreateFixture(
  page: import('@playwright/test').Page,
  options: {
    events?: boolean;
    failAvailabilityOnce?: boolean;
    failEventsOnce?: boolean;
    preferencesValue?: string;
  } = {},
) {
  let availabilityFailures = options.failAvailabilityOnce ? 1 : 0;
  let eventFailures = options.failEventsOnce ? 1 : 0;
  const availabilityRequests: string[] = [];
  const eventRequests: string[] = [];
  const preferenceValue =
    options.preferencesValue ??
    JSON.stringify({ extended: true, overlay: true, counts: true, rule: 'median' });
  await page.addInitScript(
    ({ teamId, participantId, preferenceValue }) => {
      localStorage.setItem(`synqo-participant-${teamId}`, participantId);
      localStorage.setItem('synqo:calendar-view:v2', preferenceValue);
    },
    { teamId: team.id, participantId: participant.id, preferenceValue },
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: emptyGroups }),
  );
  await page.route('**/api/teams/current/availability**', async (route) => {
    const url = new URL(route.request().url());
    availabilityRequests.push(`${url.searchParams.get('from')}/${url.searchParams.get('to')}`);
    if (availabilityFailures > 0 && availabilityRequests.length > 1) {
      availabilityFailures -= 1;
      return route.fulfill({ status: 503, json: { detail: 'Temporalmente no disponible' } });
    }
    return route.fulfill({
      json: { days: [day(0, 'available'), day(1, 'maybe'), day(2, 'unavailable')] },
    });
  });
  await page.route('**/api/teams/current/events/calendar**', async (route) => {
    const url = new URL(route.request().url());
    eventRequests.push(`${url.searchParams.get('from')}/${url.searchParams.get('to')}`);
    if (eventFailures > 0 && eventRequests.length > 1) {
      eventFailures -= 1;
      return route.fulfill({ status: 503, json: { detail: 'Temporalmente no disponible' } });
    }
    return route.fulfill({
      json: {
        events: options.events
          ? [
              {
                id: 'date-event',
                date: civilDate(0),
                title: 'Evento del equipo',
                status: 'provisional',
              },
            ]
          : [],
      },
    });
  });
  return { availabilityRequests, eventRequests };
}

async function openDateCreator(page: import('@playwright/test').Page) {
  await page.goto('/e/calendario#t=dates-token');
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
  return page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
}

test('crea fechas desde Calendario usando selección persistente, preferencias y evento provisional', async ({
  page,
}) => {
  let submitted: Record<string, unknown> | undefined;
  let writes = 0;
  let groups = emptyGroups;
  await installCreateFixture(page, { events: true });
  await page.route('**/api/teams/current/consultations', async (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: groups });
    writes += 1;
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    const consultation = {
      id: 'created-dates',
      type: 'date',
      state: 'open',
      title: submitted.title,
      createdAt: new Date().toISOString(),
      createdBy: participant,
      options: (submitted.options as string[]).map((date, position) => ({
        id: `date-${position}`,
        date,
        position,
      })),
    };
    groups = { open: [consultation], resolved: [], rejected: [] };
    return route.fulfill({
      status: 201,
      json: { consultation, expiresAt: team.expiresAt },
    });
  });

  const dialog = await openDateCreator(page);
  const save = dialog.getByRole('button', { name: 'Crear consulta', exact: true });
  const title = dialog.getByRole('textbox', { name: 'Título breve' });
  await title.fill('¿Cuándo quedamos?');
  await expect(dialog.locator(`[data-date="${civilDate(-1)}"]`)).toBeDisabled();
  const today = dialog.locator(`[data-date="${civilDate(0)}"]`);
  await expect(today).toBeEnabled();
  await expect(today).toHaveAttribute('aria-label', /tiene evento/i);
  await today.click();
  await expect(today).toHaveAttribute('aria-pressed', 'true');
  await expect(today.locator('svg.date-event-bell')).toHaveCount(1);
  await expect(today.locator('svg')).toHaveCount(1);
  await expect(dialog).not.toContainText(/\b\d+ votos?\b/i);
  await expect(dialog).not.toContainText(/Disponible · \d+/);
  await expect(dialog.getByRole('switch', { name: 'Crear evento provisional' })).not.toBeChecked();
  await dialog.getByRole('switch', { name: 'Crear evento provisional' }).check();
  expect(writes).toBe(0);

  const monthTitle = await dialog.locator('.date-month-toolbar h4').textContent();
  await dialog.getByRole('button', { name: 'Mes siguiente' }).click();
  const secondDate = civilDateInNextMonth();
  const anotherDate = dialog.locator(`[data-date="${secondDate}"]`);
  await anotherDate.click();
  await expect(anotherDate).toHaveAttribute('aria-pressed', 'true');
  await dialog.getByRole('button', { name: 'Mes anterior' }).click();
  await expect(dialog.locator('.date-month-toolbar h4')).toHaveText(monthTitle!);
  await expect(today).toHaveAttribute('aria-pressed', 'true');
  await expect(save).toBeEnabled();
  await save.click();

  expect(writes).toBe(1);
  expect(submitted).toMatchObject({
    participantId: participant.id,
    type: 'date',
    title: '¿Cuándo quedamos?',
    createEvent: true,
    options: expect.arrayContaining([civilDate(0), secondDate]),
    timeZone: expect.any(String),
  });
  await expect
    .poll(() => page.evaluate(() => localStorage.getItem('synqo:calendar-view:v2')))
    .toBe(JSON.stringify({ extended: true, overlay: true, counts: true, rule: 'median' }));
  await expect(page.getByRole('heading', { name: 'Abiertas' })).toBeVisible();
});

test('edita fechas y confirma una retirada si llegan votos mientras se guarda', async ({
  page,
}) => {
  const past = civilDate(-3);
  const retained = civilDate(2);
  const added = civilDate(4);
  const original = {
    id: 'date-edit',
    type: 'date',
    title: 'Fecha original',
    state: 'open',
    createdAt: '2026-10-20T12:00:00+00:00',
    createdBy: participant,
    lastModifiedBy: null,
    lastModifiedAt: null,
    options: [
      {
        id: 'past-option',
        date: past,
        position: 0,
        count: 0,
        voters: [],
      },
      { id: 'retained-option', date: retained, position: 1, count: 1, voters: [participant] },
    ],
  };
  const groups = { open: [original], resolved: [], rejected: [] };
  let patchBody: Record<string, unknown> | undefined;
  let patchCalls = 0;
  await page.addInitScript(
    ({ teamId, participantId }) => {
      localStorage.setItem(`synqo-participant-${teamId}`, participantId);
      localStorage.setItem(
        'synqo:calendar-view:v2',
        JSON.stringify({ extended: true, overlay: true, counts: true, rule: 'median' }),
      );
    },
    { teamId: team.id, participantId: participant.id },
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({
      json: { days: [day(-3, 'unavailable'), day(2, 'available'), day(4, 'maybe')] },
    }),
  );
  await page.route('**/api/teams/current/events/calendar**', (route) =>
    route.fulfill({ json: { events: [] } }),
  );
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: groups }),
  );
  await page.route('**/api/teams/current/consultations/date-edit', async (route) => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: original });
    patchCalls += 1;
    patchBody = route.request().postDataJSON() as Record<string, unknown>;
    const patch = patchBody as {
      title: string;
      optionChanges: { add: { id: string; date: string }[]; remove: string[] };
      confirmedRemovalOptionIds: string[];
    };
    if (patch.confirmedRemovalOptionIds.length === 0) {
      return route.fulfill({
        status: 409,
        json: {
          type: 'urn:synqo:problem:consultation-removal-confirmation-required',
          optionsWithVotes: [{ id: 'past-option', date: past, count: 2 }],
        },
      });
    }
    return route.fulfill({
      json: {
        consultation: {
          ...original,
          title: patch.title,
          lastModifiedBy: participant,
          lastModifiedAt: '2026-10-21T11:00:00+00:00',
          options: [
            { id: 'retained-option', date: retained, position: 0, count: 1, voters: [participant] },
            { id: patch.optionChanges.add[0].id, date: added, position: 1, count: 0, voters: [] },
          ],
        },
        expiresAt: team.expiresAt,
      },
    });
  });
  await page.goto('/e/consultas/date-edit#t=dates-token');
  await page.getByRole('button', { name: 'Acciones de la consulta' }).click();
  await page.getByRole('button', { name: 'Editar consulta', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue('Fecha original');
  await expect(editor.locator(`[data-date="${past}"]`)).toHaveAttribute('aria-pressed', 'true');
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('Fecha actualizada');
  await editor.locator(`[data-date="${past}"]`).click();
  await editor.locator(`[data-date="${added}"]`).click();
  await editor.locator(`[data-date="${past}"]`).click();
  await expect(editor.locator(`[data-date="${past}"]`)).toHaveAttribute('aria-pressed', 'true');
  await editor.locator(`[data-date="${past}"]`).click();
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Eliminar fechas y sus votos' });
  await expect(confirmation).toContainText(formattedDate(past));
  await expect(confirmation).toContainText('todos sus votos');
  await confirmation.getByRole('button', { name: 'Eliminar fechas y guardar' }).click();
  await expect(page.getByRole('heading', { name: 'Fecha actualizada' })).toBeVisible();
  await expect(page.getByText('Última edición: Ana')).toBeVisible();
  expect(patchCalls).toBe(2);
  expect(patchBody).toMatchObject({
    participantId: participant.id,
    title: 'Fecha actualizada',
    optionChanges: { remove: ['past-option'], update: [] },
    confirmedRemovalOptionIds: ['past-option'],
  });
  const changes = patchBody?.optionChanges as { add: { id: string; date: string }[] };
  expect(changes.add).toHaveLength(1);
  expect(changes.add[0]).toMatchObject({ date: added });
  expect(changes.add[0].id).toMatch(/^[0-9a-f-]{36}$/i);
});

test('cancelar y Escape conservan el borrador hasta confirmar descarte', async ({ page }) => {
  await installCreateFixture(page);
  const editor = await openDateCreator(page);
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('Borrador');
  await page.keyboard.press('Escape');
  const discard = page.getByRole('dialog', { name: '¿Descartar los cambios?' });
  await expect(discard.getByRole('button', { name: 'Seguir editando' })).toBeFocused();
  await discard.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue('Borrador');
  await editor.getByRole('button', { name: 'Cancelar' }).click();
  await page
    .getByRole('dialog', { name: '¿Descartar los cambios?' })
    .getByRole('button', { name: 'Abandonar edición' })
    .click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Crear consulta de fechas' })).toBeFocused();
});

test('mantiene el borrador y ofrece reintentar cuando fallan disponibilidad o eventos', async ({
  page,
}) => {
  const requests = await installCreateFixture(page, {
    failAvailabilityOnce: true,
    failEventsOnce: true,
  });
  const editor = await openDateCreator(page);
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('Consulta conservada');
  await expect(editor.getByRole('alert')).toBeVisible();
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(
    'Consulta conservada',
  );
  const retry = editor.getByRole('button', { name: 'Reintentar calendario' });
  const availabilityReadsBeforeRetry = requests.availabilityRequests.length;
  const eventReadsBeforeRetry = requests.eventRequests.length;
  await retry.click();
  await expect
    .poll(() => requests.availabilityRequests.length)
    .toBeGreaterThan(availabilityReadsBeforeRetry);
  await expect.poll(() => requests.eventRequests.length).toBeGreaterThan(eventReadsBeforeRetry);
  await expect(editor.getByRole('alert')).toHaveCount(0);
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(
    'Consulta conservada',
  );
});

test('recupera preferencias de calendario inválidas con los valores predeterminados', async ({
  page,
}) => {
  await installCreateFixture(page, { preferencesValue: '{invalid json' });
  const editor = await openDateCreator(page);
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Mes siguiente' })).toBeEnabled();
  expect(await page.evaluate(() => localStorage.getItem('synqo:calendar-view:v2'))).toBe(
    JSON.stringify({ extended: false, overlay: false, counts: false, rule: 'worst' }),
  );
});

test('abre el calendario con valores predeterminados si el almacenamiento local no está disponible', async ({
  page,
}) => {
  await installCreateFixture(page);
  await page.goto('/e/calendario#t=dates-token');
  await page.evaluate(() => {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new DOMException('Storage disabled', 'SecurityError');
      },
    });
  });
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Mes siguiente' })).toBeEnabled();
});

test('presenta el formulario usable en tamaños y temas acordados', async ({ page }) => {
  await installCreateFixture(page);
  const editor = await openDateCreator(page);
  const keyboardDay = editor.locator(`[data-date="${civilDate(0)}"]`);
  await keyboardDay.focus();
  await page.keyboard.press('Space');
  await expect(keyboardDay).toHaveAttribute('aria-pressed', 'true');
  await expect(keyboardDay).toBeFocused();
  for (const width of [390, 768, 769, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page
        .locator('html')
        .evaluate((element, value) => element.setAttribute('data-theme', value), theme);
      await expect(editor.getByRole('textbox', { name: 'Título breve' })).toBeVisible();
      const dimensions = await editor.evaluate((element) => ({
        right: element.getBoundingClientRect().right,
        left: element.getBoundingClientRect().left,
        width: document.documentElement.clientWidth,
      }));
      expect(dimensions.left).toBeGreaterThanOrEqual(0);
      expect(dimensions.right).toBeLessThanOrEqual(dimensions.width);
      const statusOverflow = await editor
        .locator('.calendar-day .status')
        .evaluateAll((items) =>
          items
            .filter((item) => item.scrollWidth > item.clientWidth)
            .map((item) => item.textContent?.trim()),
        );
      expect(statusOverflow).toEqual([]);
    }
  }
});

test('edita fechas por teclado sin desbordar en cuatro anchuras y ambos temas', async ({
  page,
}) => {
  await installCreateFixture(page);
  await page.route('**/api/teams/current/consultations/edit-responsive', (route) =>
    route.fulfill({
      json: {
        id: 'edit-responsive',
        type: 'date',
        title: 'Fechas por teclado',
        state: 'open',
        createdAt: new Date().toISOString(),
        createdBy: participant,
        options: [{ id: 'retained', date: civilDate(0), position: 0, count: 0, voters: [] }],
      },
    }),
  );
  await page.goto('/e/consultas/edit-responsive#t=dates-token');
  for (const width of [390, 768, 769, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const theme of ['light', 'dark']) {
      await page
        .locator('html')
        .evaluate((element, value) => element.setAttribute('data-theme', value), theme);
      await page.getByRole('button', { name: 'Acciones de la consulta' }).press('Enter');
      await page.getByRole('button', { name: 'Editar consulta', exact: true }).press('Enter');
      const editor = page.getByRole('dialog', { name: 'Editar consulta' });
      await expect(editor.getByRole('textbox', { name: 'Título breve' })).toBeFocused();
      const selected = editor.locator(`[data-date="${civilDate(0)}"]`);
      await expect(selected).toHaveAttribute('aria-pressed', 'true');
      await selected.focus();
      await page.keyboard.press('Space');
      await expect(selected).toHaveAttribute('aria-pressed', 'false');
      await expect(selected).toBeFocused();
      const bounds = await editor.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      await page.keyboard.press('Escape');
      const discard = page.getByRole('dialog', { name: '¿Descartar los cambios?' });
      await expect(discard.getByRole('button', { name: 'Seguir editando' })).toBeFocused();
      await discard.getByRole('button', { name: 'Descartar cambios' }).press('Enter');
      await expect(editor).toBeHidden();
      await expect(page.getByRole('button', { name: 'Acciones de la consulta' })).toBeFocused();
    }
  }
});

test('no ofrece edición para una consulta de fechas cerrada', async ({ page }) => {
  const closed = {
    id: 'closed-date',
    type: 'date',
    title: 'Consulta cerrada',
    state: 'resolved',
    createdAt: '2026-10-20T12:00:00+00:00',
    createdBy: participant,
    options: [{ id: 'closed-option', date: civilDate(2), position: 0, count: 0, voters: [] }],
  };
  await page.addInitScript(
    ({ teamId, participantId }) =>
      localStorage.setItem(`synqo-participant-${teamId}`, participantId),
    { teamId: team.id, participantId: participant.id },
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: [], resolved: [closed], rejected: [] } }),
  );
  await page.route('**/api/teams/current/consultations/closed-date', (route) =>
    route.fulfill({ json: closed }),
  );
  await page.goto('/e/consultas/closed-date#t=dates-token');
  await expect(page.getByRole('heading', { name: 'Consulta cerrada' })).toBeVisible();
  const actions = page.getByRole('button', { name: 'Acciones de la consulta' });
  if (await actions.count()) await actions.click();
  await expect(page.getByRole('button', { name: 'Editar consulta', exact: true })).toHaveCount(0);
});
