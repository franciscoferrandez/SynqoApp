import { expect, Locator, test } from '@playwright/test';

async function activate(button: Locator): Promise<void> {
  await button.focus();
  await button.press('Enter');
}

const team = {
  id: 'consultation-team',
  name: 'Equipo de pruebas',
  timeZone: 'Europe/Madrid',
  expiresAt: '2027-01-01T00:00:00Z',
  participants: [{ id: 'participant-ana', name: 'Ana' }],
};

test('creates a text consultation, confirms the action, and retains it after reload and in another browser', async ({
  browser,
}) => {
  let created: Record<string, unknown>[] = [];
  let submitted: Record<string, unknown> | undefined;
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  await context.addInitScript(() =>
    localStorage.setItem('synqo-participant-consultation-team', 'participant-ana'),
  );
  await context.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await context.route('**/api/teams/current/consultations', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { open: created, resolved: [], rejected: [] } });
    }
    submitted = route.request().postDataJSON() as Record<string, unknown>;
    const bodyOptions = submitted['options'] as string[];
    const consultation = {
      id: 'consultation-created',
      type: 'text',
      state: 'open',
      title: submitted['title'],
      createdAt: '2026-10-05T12:00:00+00:00',
      options: bodyOptions.map((text, position) => ({ id: `option-${position}`, text, position })),
    };
    created = [consultation];
    return route.fulfill({ status: 201, json: { consultation, expiresAt: team.expiresAt } });
  });

  const page = await context.newPage();
  await page.goto('/e/consultas#t=consultation-token');
  await expect(page.getByRole('heading', { name: 'Aún no hay consultas' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Abiertas' })).toHaveCount(0);

  const emptyCreate = page
    .locator('.consultations-empty')
    .getByRole('button', { name: /Crear consulta/ });
  await expect(emptyCreate).toBeVisible();
  await expect
    .poll(() => emptyCreate.evaluate((button) => getComputedStyle(button).backgroundColor))
    .not.toBe('rgba(0, 0, 0, 0)');
  await emptyCreate.focus();
  await emptyCreate.press('Enter');
  const editor = page.getByRole('dialog', { name: 'Plantea una pregunta' });
  await expect(editor).toBeVisible();
  await expect(editor.locator('#consultation-title')).toBeFocused();
  await editor.locator('#consultation-title').fill('¿Qué tomamos?');
  await editor.getByRole('textbox', { name: 'Texto de la opción 1' }).fill('Café');
  await activate(editor.getByRole('button', { name: 'Añadir opción' }));
  await editor.getByRole('textbox', { name: 'Texto de la opción 2' }).fill('Café');
  await expect(editor.getByRole('alert')).toContainText('repite la 1');
  await expect(editor.getByRole('button', { name: 'Crear consulta', exact: true })).toBeDisabled();
  await editor.getByRole('textbox', { name: 'Texto de la opción 2' }).fill('Té');

  for (let index = 2; index < 10; index++) {
    await activate(editor.getByRole('button', { name: 'Añadir opción' }));
  }
  await expect(editor.getByRole('textbox', { name: 'Texto de la opción 10' })).toBeVisible();
  await expect(editor.getByRole('button', { name: 'Añadir opción' })).toBeDisabled();
  for (let index = 3; index <= 10; index++) {
    await editor
      .getByRole('textbox', { name: `Texto de la opción ${index}` })
      .fill(`Opción ${index}`);
  }

  await activate(editor.getByRole('button', { name: 'Crear consulta', exact: true }));
  const confirmation = page.getByRole('dialog', { name: '¿Crear esta consulta?' });
  await expect(confirmation).toBeVisible();
  await expect(confirmation.getByRole('button', { name: 'Volver' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(editor).toBeVisible();
  await expect(editor.locator('#consultation-title')).toHaveValue('¿Qué tomamos?');
  await expect(
    editor.getByRole('textbox', { name: 'Texto de la opción 1', exact: true }),
  ).toHaveValue('Café');
  await expect(
    editor.getByRole('textbox', { name: 'Texto de la opción 2', exact: true }),
  ).toHaveValue('Té');
  await activate(editor.getByRole('button', { name: 'Crear consulta', exact: true }));
  await activate(
    page
      .getByRole('dialog', { name: '¿Crear esta consulta?' })
      .getByRole('button', { name: 'Confirmar creación' }),
  );

  await expect(page.getByRole('heading', { name: 'Abiertas' })).toBeVisible();
  await expect(page.getByText('¿Qué tomamos?', { exact: true })).toBeVisible();
  expect(submitted).toEqual({
    participantId: 'participant-ana',
    title: '¿Qué tomamos?',
    options: ['Café', 'Té', ...Array.from({ length: 8 }, (_, index) => `Opción ${index + 3}`)],
  });

  await page.reload();
  await expect(page.getByRole('heading', { name: 'Abiertas' })).toBeVisible();
  await expect(page.getByText('¿Qué tomamos?', { exact: true })).toBeVisible();

  const secondContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await secondContext.addInitScript(() =>
    localStorage.setItem('synqo-participant-consultation-team', 'participant-ana'),
  );
  await secondContext.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await secondContext.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: created, resolved: [], rejected: [] } }),
  );
  const secondPage = await secondContext.newPage();
  await secondPage.goto('/e/consultas#t=consultation-token');
  await expect(secondPage.getByText('¿Qué tomamos?', { exact: true })).toBeVisible();
  expect(await secondPage.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    390,
  );
  await context.close();
  await secondContext.close();
});

test('cancel confirms only when a draft has text and keeps it when continuing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-consultation-team', 'participant-ana'),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: [], resolved: [], rejected: [] } }),
  );
  await page.goto('/e/consultas#t=consultation-token');
  const createButton = page
    .locator('.section-heading')
    .getByRole('button', { name: /Crear consulta/ });
  await expect(createButton).toBeVisible();
  await createButton.focus();
  await createButton.press('Enter');
  const editor = page.getByRole('dialog', { name: 'Plantea una pregunta' });
  const geometry = await editor.evaluate((dialog) => {
    const rect = dialog.getBoundingClientRect();
    return {
      centerX: rect.x + rect.width / 2,
      centerY: rect.y + rect.height / 2,
      backdrop: getComputedStyle(dialog, '::backdrop').backgroundColor,
    };
  });
  expect(Math.abs(geometry.centerX - 195)).toBeLessThan(2);
  expect(Math.abs(geometry.centerY - 422)).toBeLessThan(2);
  expect(geometry.backdrop).not.toBe('rgba(0, 0, 0, 0)');
  await activate(editor.getByRole('button', { name: 'Cancelar', exact: true }));
  await expect(editor).toBeHidden();
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await expect(createButton).toBeVisible();
  await createButton.focus();
  await createButton.press('Enter');
  await editor.locator('#consultation-title').fill('Una idea');
  await activate(editor.getByRole('button', { name: 'Cancelar', exact: true }));
  const confirmation = page.getByRole('dialog', { name: '¿Cancelar esta consulta?' });
  await expect(confirmation.getByRole('button', { name: 'Seguir editando' })).toBeFocused();
  await activate(confirmation.getByRole('button', { name: 'Seguir editando' }));
  await expect(editor.locator('#consultation-title')).toHaveValue('Una idea');
  await activate(editor.getByRole('button', { name: 'Cancelar', exact: true }));
  await activate(
    page
      .getByRole('dialog', { name: '¿Cancelar esta consulta?' })
      .getByRole('button', { name: 'Abandonar edición' }),
  );
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('reports missing title and options and keeps invalid drafts from confirmation', async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-consultation-team', 'participant-ana'),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: [], resolved: [], rejected: [] } }),
  );
  await page.goto('/e/consultas#t=consultation-token');
  const createButton = page
    .locator('.section-heading')
    .getByRole('button', { name: /Crear consulta/ });
  await createButton.focus();
  await createButton.press('Enter');

  const editor = page.getByRole('dialog', { name: 'Plantea una pregunta' });
  const title = editor.locator('#consultation-title');
  const firstOption = editor.getByRole('textbox', {
    name: 'Texto de la opción 1',
    exact: true,
  });
  const submit = editor.getByRole('button', { name: 'Crear consulta', exact: true });
  expect(await title.getAttribute('maxlength')).toBe('250');
  expect(await firstOption.getAttribute('maxlength')).toBe('50');
  await title.evaluate((input: HTMLInputElement) => input.blur());
  await expect(editor.getByRole('alert')).toContainText('Escribe un título');
  await title.fill('Pregunta válida');
  await firstOption.focus();
  await firstOption.evaluate((input: HTMLInputElement) => input.blur());
  await expect(editor.getByRole('alert')).toContainText('Completa cada opción');
  await expect(firstOption).toHaveAttribute('aria-invalid', 'true');
  await expect(submit).toBeDisabled();

  await activate(editor.getByRole('button', { name: 'Eliminar opción 1' }));
  await expect(
    editor.getByRole('textbox', { name: 'Texto de la opción 1', exact: true }),
  ).toHaveCount(0);
  await expect(submit).toBeDisabled();
  await expect(editor.getByRole('alert')).toContainText('Añade al menos una opción');
  await expect(editor.getByRole('button', { name: 'Añadir opción' })).toBeEnabled();
});

test('server failure keeps the draft and offers a confirmed retry', async ({ page }) => {
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-consultation-team', 'participant-ana'),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  let submissions = 0;
  await page.route('**/api/teams/current/consultations', async (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({ json: { open: [], resolved: [], rejected: [] } });
    if (++submissions === 1) return route.fulfill({ status: 500, json: { status: 500 } });
    const body = route.request().postDataJSON() as {
      participantId: string;
      title: string;
      options: string[];
    };
    const consultation = {
      id: 'retried-consultation',
      type: 'text',
      state: 'open',
      title: body.title,
      createdAt: '2026-10-05T12:00:00+00:00',
      options: body.options.map((text, position) => ({ id: `option-${position}`, text, position })),
    };
    return route.fulfill({ status: 201, json: { consultation, expiresAt: team.expiresAt } });
  });

  await page.goto('/e/consultas#t=consultation-token');
  const createButton = page
    .locator('.section-heading')
    .getByRole('button', { name: /Crear consulta/ });
  await expect(createButton).toBeVisible();
  await createButton.focus();
  await createButton.press('Enter');
  const editor = page.getByRole('dialog', { name: 'Plantea una pregunta' });
  await editor.locator('#consultation-title').fill('Pregunta guardada');
  await editor.getByRole('textbox', { name: 'Texto de la opción 1' }).fill('Opción guardada');
  await activate(editor.getByRole('button', { name: 'Crear consulta', exact: true }));
  await activate(
    page
      .getByRole('dialog', { name: '¿Crear esta consulta?' })
      .getByRole('button', { name: 'Confirmar creación' }),
  );

  await expect(page.getByRole('alert')).toContainText('Conservamos el borrador');
  await expect(editor.locator('#consultation-title')).toHaveValue('Pregunta guardada');
  await activate(editor.getByRole('button', { name: 'Reintentar' }));
  await activate(
    page
      .getByRole('dialog', { name: '¿Crear esta consulta?' })
      .getByRole('button', { name: 'Confirmar creación' }),
  );
  await expect(page.getByText('Pregunta guardada', { exact: true })).toBeVisible();
  expect(submissions).toBe(2);
});
