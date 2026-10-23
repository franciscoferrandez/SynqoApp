import { expect, test } from '@playwright/test';

const team = {
  id: 'editing-team',
  name: 'Equipo de edición',
  timeZone: 'Europe/Madrid',
  expiresAt: '2027-01-01T00:00:00Z',
  participants: [
    { id: 'editing-creator', name: 'Ana' },
    { id: 'editing-actor', name: 'Bea' },
    { id: 'editing-voter', name: 'Carlos' },
  ],
};
const addedOptionId = '123e4567-e89b-42d3-a456-426614174000';
const option = (id: string, text: string, position: number, voterIds: string[] = []) => ({
  id,
  text,
  position,
  count: voterIds.length,
  voters: voterIds.map((id) => team.participants.find((person) => person.id === id)),
});
const baseConsultation = (overrides: Record<string, unknown> = {}) => ({
  id: 'editing-consultation',
  type: 'text',
  title: '¿Qué hacemos?',
  state: 'open',
  createdAt: '2026-10-20T12:00:00+00:00',
  createdBy: team.participants[0],
  lastModifiedBy: null,
  lastModifiedAt: null,
  options: [option('option-one', 'Pasear', 0), option('option-two', 'Cine', 1)],
  ...overrides,
});

async function installFixture(
  page: import('@playwright/test').Page,
  consultation = baseConsultation(),
  actorId = 'editing-actor',
): Promise<void> {
  await page.addInitScript(
    ({ teamId, participantId }) =>
      localStorage.setItem(`synqo-participant-${teamId}`, participantId),
    { teamId: team.id, participantId: actorId },
  );
  await page.route('**/api/configuration', (route) =>
    route.fulfill({ json: { teamCreationEmailMode: 'hidden' } }),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({
      json: {
        open: consultation.state === 'open' ? [consultation] : [],
        resolved: consultation.state === 'resolved' ? [consultation] : [],
        rejected: consultation.state === 'rejected' ? [consultation] : [],
      },
    }),
  );
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) =>
    route.fulfill({ json: consultation }),
  );
}

async function openEditor(page: import('@playwright/test').Page): Promise<void> {
  await page.getByRole('button', { name: 'Acciones de la consulta' }).click();
  await page.getByRole('button', { name: 'Editar consulta', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Editar consulta' })).toBeVisible();
}

test('edita título, texto sin votos y opciones conservando sus IDs y orden', async ({ page }) => {
  const initial = baseConsultation();
  let updateBody: Record<string, unknown> | undefined;
  const updated = baseConsultation({
    title: '¿Qué plan elegimos?',
    lastModifiedBy: team.participants[1],
    lastModifiedAt: '2026-10-21T10:30:00+00:00',
    options: [option('option-one', 'Pasear por el parque', 0), option(addedOptionId, 'Cenar', 1)],
  });
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', async (route) => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: initial });
    updateBody = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({ json: { consultation: updated, expiresAt: team.expiresAt } });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await expect(page.getByRole('heading', { name: initial.title })).toBeVisible();
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(initial.title);
  await expect(editor.getByRole('textbox', { name: 'Opción 1' })).toHaveValue('Pasear');
  await expect(editor.getByRole('textbox', { name: 'Opción 2' })).toHaveValue('Cine');
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué plan elegimos?');
  await editor.getByRole('textbox', { name: 'Opción 1' }).fill('Pasear por el parque');
  await editor.getByRole('button', { name: 'Eliminar opción 2' }).click();
  await editor.getByRole('button', { name: '+ Añadir opción' }).click();
  await editor.getByRole('textbox', { name: 'Opción 3' }).fill('Cenar');
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();

  await expect(page.getByRole('dialog', { name: 'Eliminar opciones y sus votos' })).toHaveCount(0);
  expect(updateBody).toMatchObject({
    participantId: 'editing-actor',
    title: '¿Qué plan elegimos?',
    optionChanges: {
      update: [{ id: 'option-one', text: 'Pasear por el parque' }],
      remove: ['option-two'],
    },
    confirmedRemovalOptionIds: [],
  });
  const changes = updateBody?.['optionChanges'] as { add: { id: string; text: string }[] };
  expect(changes.add).toHaveLength(1);
  expect(changes.add[0]).toMatchObject({ text: 'Cenar' });
  expect(changes.add[0].id).toMatch(/^[0-9a-f-]{36}$/i);
  await expect(page.getByRole('heading', { name: '¿Qué plan elegimos?' })).toBeVisible();
  await expect(page.getByText('Última edición: Bea')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Acciones de la consulta' })).toBeFocused();
});

test('retirar opción votada exige confirmación y conserva el borrador al volver', async ({
  page,
}) => {
  const initial = baseConsultation({
    options: [
      option('option-one', 'Pasear', 0, ['editing-creator', 'editing-actor']),
      option('option-two', 'Cine', 1, ['editing-voter']),
    ],
  });
  let updateBody: Record<string, unknown> | undefined;
  const updated = baseConsultation({
    title: '¿Qué plan elegimos?',
    options: [option('option-two', 'Cine', 0, ['editing-voter'])],
    lastModifiedBy: team.participants[1],
    lastModifiedAt: '2026-10-21T10:30:00+00:00',
  });
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', async (route) => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: initial });
    updateBody = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({ json: { consultation: updated, expiresAt: team.expiresAt } });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await expect(editor.getByRole('textbox', { name: 'Opción 1' })).toHaveAttribute('readonly', '');
  await expect(editor.getByRole('textbox', { name: 'Opción 2' })).toHaveAttribute('readonly', '');
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué plan elegimos?');
  await editor.getByRole('button', { name: 'Eliminar opción 1' }).click();
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Eliminar opciones y sus votos' });
  await expect(confirmation).toContainText('Pasear');
  await expect(confirmation).toContainText('2 votos');
  await confirmation.getByRole('button', { name: 'Volver a editar' }).click();
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(
    '¿Qué plan elegimos?',
  );
  await expect(editor.getByRole('textbox', { name: 'Opción 1' })).toHaveValue('Pasear');
  await expect(editor.getByRole('button', { name: 'Deshacer retirada de opción 1' })).toBeVisible();
  expect(updateBody).toBeUndefined();
  await editor.getByRole('button', { name: 'Deshacer retirada de opción 1' }).click();
  await expect(editor.getByRole('button', { name: 'Eliminar opción 1' })).toBeVisible();
  await editor.getByRole('button', { name: 'Eliminar opción 1' }).click();

  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  await page
    .getByRole('dialog', { name: 'Eliminar opciones y sus votos' })
    .getByRole('button', { name: 'Eliminar opciones y guardar' })
    .click();
  expect(updateBody).toMatchObject({
    title: '¿Qué plan elegimos?',
    optionChanges: { remove: ['option-one'] },
    confirmedRemovalOptionIds: ['option-one'],
  });
  await expect(page.getByText('Última edición: Bea')).toBeVisible();
  await expect(page.locator('.consultation-vote-option').filter({ hasText: 'Cine' })).toContainText(
    '1 voto',
  );
});

test('cancelar o Escape descarta cambios solo tras confirmación y no escribe', async ({ page }) => {
  let writes = 0;
  await installFixture(page);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() === 'PATCH') writes += 1;
    return route.fulfill({ json: baseConsultation() });
  });
  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await editor.getByRole('button', { name: 'Cancelar' }).click();
  await expect(editor).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Acciones de la consulta' })).toBeFocused();
  await openEditor(page);
  await page.getByRole('textbox', { name: 'Título breve' }).fill('Título cambiado');
  await page.keyboard.press('Escape');
  const discard = page.getByRole('dialog', { name: '¿Descartar los cambios?' });
  await expect(discard.getByRole('button', { name: 'Seguir editando' })).toBeFocused();
  await discard.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(
    'Título cambiado',
  );
  await editor.getByRole('button', { name: 'Cancelar' }).click();
  await page
    .getByRole('dialog', { name: '¿Descartar los cambios?' })
    .getByRole('button', { name: 'Descartar cambios' })
    .click();
  expect(writes).toBe(0);
  await expect(page.getByRole('heading', { name: '¿Qué hacemos?' })).toBeVisible();
});

test('guardar borrador intacto no muestra última edición', async ({ page }) => {
  let updateBody: Record<string, unknown> | undefined;
  const initial = baseConsultation();
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() === 'PATCH') {
      updateBody = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill({
        json: {
          consultation: initial,
          expiresAt: team.expiresAt,
        },
      });
    }
    return route.fulfill({ json: initial });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  await page.getByRole('button', { name: 'Guardar consulta' }).click();
  expect(updateBody).toMatchObject({
    participantId: 'editing-actor',
    optionChanges: { add: [], update: [], remove: [] },
    confirmedRemovalOptionIds: [],
  });
  expect(updateBody).not.toHaveProperty('title');
  await expect(page.getByText('Última edición:')).toHaveCount(0);
});

test('conserva espacios iniciales y finales de campos intactos al guardar otro campo', async ({
  page,
}) => {
  const initial = baseConsultation({
    title: ' Pregunta con espacios ',
    options: [option('option-one', ' Opción conservada ', 0), option('option-two', 'Otra', 1)],
  });
  const bodies: Record<string, unknown>[] = [];
  let current = initial;
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() === 'PATCH') {
      bodies.push(route.request().postDataJSON() as Record<string, unknown>);
      if (bodies.length === 1) {
        return route.fulfill({
          json: { consultation: initial, expiresAt: team.expiresAt },
        });
      }
      current = baseConsultation({
        ...current,
        options: [
          option('option-one', ' Opción conservada ', 0),
          option('option-two', 'Otra nueva', 1),
        ],
      });
      return route.fulfill({
        json: { consultation: current, expiresAt: team.expiresAt },
      });
    }
    return route.fulfill({ json: current });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(
    ' Pregunta con espacios ',
  );
  await expect(editor.getByRole('textbox', { name: 'Opción 1' })).toHaveValue(
    ' Opción conservada ',
  );
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  expect(bodies[0]).not.toHaveProperty('title');
  expect(bodies[0]).toMatchObject({ optionChanges: { update: [], remove: [], add: [] } });
  await expect(page.getByText('Última edición:')).toHaveCount(0);

  await openEditor(page);
  await editor.getByRole('textbox', { name: 'Opción 2' }).fill('Otra nueva');
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  expect(bodies[1]).not.toHaveProperty('title');
  expect(bodies[1]).toMatchObject({
    optionChanges: {
      update: [{ id: 'option-two', text: 'Otra nueva' }],
      remove: [],
      add: [],
    },
  });
  await expect(page.getByRole('heading', { name: ' Pregunta con espacios ' })).toBeVisible();
});

test('asocia un error de duplicado a la opción por su UUID y conserva el borrador', async ({
  page,
}) => {
  const initial = baseConsultation();
  let submittedBody: Record<string, unknown> | undefined;
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: initial });
    submittedBody = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({
      status: 422,
      json: {
        type: 'about:blank',
        title: 'Datos inválidos',
        status: 422,
        violations: [{ propertyPath: 'options.option-one', message: 'El texto ya está en uso.' }],
      },
    });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  const editedOption = editor.getByRole('textbox', { name: 'Opción 1' });
  await editedOption.fill('Texto enviado antes de un duplicado concurrente');
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();

  await expect(editor.getByRole('alert')).toContainText('No se guardó ningún cambio');
  await expect(editedOption).toHaveAttribute('aria-invalid', 'true');
  await expect(editedOption).toHaveValue('Texto enviado antes de un duplicado concurrente');
  expect(submittedBody).toMatchObject({
    optionChanges: {
      update: [{ id: 'option-one', text: 'Texto enviado antes de un duplicado concurrente' }],
    },
  });
});

test('conserva el borrador y el ID de alta al reintentar un error de guardado', async ({
  page,
}) => {
  let attempts = 0;
  const bodies: Record<string, unknown>[] = [];
  const initial = baseConsultation();
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: initial });
    attempts += 1;
    bodies.push(route.request().postDataJSON() as Record<string, unknown>);
    if (attempts === 1) return route.fulfill({ status: 500, json: { status: 500 } });
    return route.fulfill({
      json: {
        consultation: baseConsultation({ title: 'Título nuevo' }),
        expiresAt: team.expiresAt,
      },
    });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('Título nuevo');
  await editor.getByRole('button', { name: '+ Añadir opción' }).click();
  await editor.getByRole('textbox', { name: 'Opción 3' }).fill('Visitar museo');
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  await expect(editor.getByRole('alert')).toBeVisible();
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue('Título nuevo');
  await expect(editor.getByRole('textbox', { name: 'Opción 3' })).toHaveValue('Visitar museo');
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  expect(attempts).toBe(2);
  const firstAdd = (bodies[0]['optionChanges'] as { add: { id: string }[] }).add[0];
  const retryAdd = (bodies[1]['optionChanges'] as { add: { id: string }[] }).add[0];
  expect(retryAdd.id).toBe(firstAdd.id);
});

test('reintenta cargar el detalle vigente en el editor y devuelve foco al menú al cancelar', async ({
  page,
}) => {
  let detailReads = 0;
  const initial = baseConsultation();
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() !== 'GET') return route.fulfill({ json: initial });
    detailReads += 1;
    if (detailReads === 2) return route.fulfill({ status: 500, json: { status: 500 } });
    return route.fulfill({ json: initial });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await expect(editor.getByRole('alert')).toContainText('No se pudo cargar');
  await editor.getByRole('button', { name: 'Reintentar' }).click();
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(initial.title);
  await editor.getByRole('button', { name: 'Cancelar' }).click();
  await expect(editor).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Acciones de la consulta' })).toBeFocused();
});

test('marca opciones duplicadas y aplica el máximo de diez opciones en el borrador', async ({
  page,
}) => {
  let writes = 0;
  await installFixture(page);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() === 'PATCH') writes += 1;
    return route.fulfill({ json: baseConsultation() });
  });
  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await editor.getByRole('textbox', { name: 'Opción 2' }).fill(' pasear ');
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  await expect(editor.getByRole('alert')).toContainText('Revisa los campos indicados');
  await expect(editor.getByRole('textbox', { name: 'Opción 2' })).toHaveAttribute(
    'aria-invalid',
    'true',
  );
  await editor.getByRole('textbox', { name: 'Opción 2' }).fill('Cine');
  const add = editor.getByRole('button', { name: '+ Añadir opción' });
  for (let index = 0; index < 8; index += 1) await add.click();
  await expect(add).toBeDisabled();
  expect(writes).toBe(0);
});

test('un voto que llega mientras se edita bloquea el cambio de texto y permite recuperarlo', async ({
  page,
}) => {
  const initial = baseConsultation();
  const current = baseConsultation({
    options: [
      option('option-one', 'Pasear', 0, ['editing-voter']),
      option('option-two', 'Cine', 1),
    ],
  });
  const savedBodies: Record<string, unknown>[] = [];
  let attempts = 0;
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: initial });
    savedBodies.push(route.request().postDataJSON() as Record<string, unknown>);
    attempts += 1;
    if (attempts === 1) {
      return route.fulfill({
        status: 409,
        json: {
          type: 'urn:synqo:problem:consultation-edit-conflict',
          title: 'La opción tiene votos',
          status: 409,
          consultation: current,
        },
      });
    }
    return route.fulfill({
      json: {
        consultation: baseConsultation({ title: '¿Qué plan elegimos?', options: current.options }),
        expiresAt: team.expiresAt,
      },
    });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué plan elegimos?');
  await editor.getByRole('textbox', { name: 'Opción 1' }).fill('Pasear con el grupo');
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  await expect(editor.getByRole('alert')).toContainText('Conservamos tu borrador');
  const changedOption = editor.getByRole('textbox', { name: 'Opción 1' });
  await expect(changedOption).toHaveValue('Pasear con el grupo');
  await expect(changedOption).toHaveAttribute('readonly', '');
  await editor.getByRole('button', { name: 'Recuperar texto actual de opción 1' }).click();
  await expect(changedOption).toHaveValue('Pasear');
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(
    '¿Qué plan elegimos?',
  );
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  expect(attempts).toBe(2);
  expect(savedBodies[1]).toMatchObject({
    title: '¿Qué plan elegimos?',
    optionChanges: { update: [] },
  });
});

test('si la consulta se cierra durante la edición conserva el borrador hasta recargar', async ({
  page,
}) => {
  const initial = baseConsultation();
  const closed = baseConsultation({
    state: 'resolved',
    resolution: {
      participant: team.participants[0],
      resolvedAt: '2026-10-21T11:00:00+00:00',
      acceptedOptionIds: ['option-one'],
    },
  });
  let current = initial;
  let writes = 0;
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() === 'GET') return route.fulfill({ json: current });
    writes += 1;
    current = closed;
    return route.fulfill({
      status: 409,
      json: {
        type: 'urn:synqo:problem:consultation-closed',
        title: 'Consulta cerrada',
        status: 409,
        consultation: closed,
      },
    });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('Borrador conservado');
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  await expect(editor.getByRole('alert')).toContainText('Conservamos tu borrador');
  await expect(editor.getByRole('button', { name: 'Recargar ficha' })).toBeVisible();
  await expect(editor.getByRole('textbox', { name: 'Título breve' })).toHaveValue(
    'Borrador conservado',
  );
  await editor.getByRole('button', { name: 'Recargar ficha' }).click();
  const discard = page.getByRole('dialog', { name: '¿Descartar los cambios?' });
  await discard.getByRole('button', { name: 'Descartar cambios' }).click();
  await expect(page.getByText('Resuelta')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Acciones de la consulta' })).toHaveCount(0);
  expect(writes).toBe(1);
});

test('un voto nuevo en una opción marcada para retirar solicita confirmación antes de guardar', async ({
  page,
}) => {
  const initial = baseConsultation();
  const bodies: Record<string, unknown>[] = [];
  let attempts = 0;
  await installFixture(page, initial);
  await page.route('**/api/teams/current/consultations/editing-consultation', (route) => {
    if (route.request().method() !== 'PATCH') return route.fulfill({ json: initial });
    bodies.push(route.request().postDataJSON() as Record<string, unknown>);
    attempts += 1;
    if (attempts === 1) {
      return route.fulfill({
        status: 409,
        json: {
          type: 'urn:synqo:problem:consultation-removal-confirmation-required',
          title: 'Confirmar retirada',
          status: 409,
          optionsWithVotes: [{ id: 'option-one', text: 'Pasear', count: 1 }],
        },
      });
    }
    return route.fulfill({
      json: {
        consultation: baseConsultation({
          options: [option('option-two', 'Cine', 0)],
          lastModifiedBy: team.participants[1],
          lastModifiedAt: '2026-10-21T10:30:00+00:00',
        }),
        expiresAt: team.expiresAt,
      },
    });
  });

  await page.goto('/e/consultas/editing-consultation#t=editing-token');
  await openEditor(page);
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await editor.getByRole('button', { name: 'Eliminar opción 1' }).click();
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Eliminar opciones y sus votos' });
  await expect(confirmation).toContainText('Pasear');
  await expect(confirmation).toContainText('1 votos');
  await confirmation.getByRole('button', { name: 'Eliminar opciones y guardar' }).click();
  expect(attempts).toBe(2);
  expect(bodies[0]).toMatchObject({
    optionChanges: { remove: ['option-one'] },
    confirmedRemovalOptionIds: [],
  });
  expect(bodies[1]).toMatchObject({
    optionChanges: { remove: ['option-one'] },
    confirmedRemovalOptionIds: ['option-one'],
  });
});

test('editar consulta no aparece para consultas cerradas', async ({ page }) => {
  const cases = [
    baseConsultation({
      title: 'Consulta resuelta',
      state: 'resolved',
      lastModifiedBy: team.participants[0],
      lastModifiedAt: '2026-10-20T13:00:00+00:00',
      resolution: {
        participant: team.participants[0],
        resolvedAt: '2026-10-20T13:00:00+00:00',
        acceptedOptionIds: ['option-one'],
      },
    }),
    baseConsultation({
      title: 'Consulta rechazada',
      state: 'rejected',
      resolution: {
        participant: team.participants[0],
        resolvedAt: '2026-10-20T13:00:00+00:00',
        acceptedOptionIds: [],
      },
    }),
  ];
  for (const consultation of cases) {
    await page.goto('about:blank');
    await installFixture(page, consultation);
    await page.goto('/e/consultas/editing-consultation#t=editing-token');
    await expect(page.getByRole('heading', { name: consultation.title })).toBeVisible();
    const actions = page.getByRole('button', { name: 'Acciones de la consulta' });
    if (await actions.count()) await actions.click();
    await expect(page.getByRole('button', { name: 'Editar consulta', exact: true })).toHaveCount(0);
    if (consultation.state === 'resolved') {
      await expect(page.getByText('Última edición: Ana')).toBeVisible();
    }
  }
});
