import { expect, test } from '@playwright/test';

async function consultationAction(
  page: import('@playwright/test').Page,
  name: string,
): Promise<void> {
  await page.getByRole('button', { name: 'Acciones de la consulta' }).click();
  await page.getByRole('button', { name, exact: true }).click();
}

async function eventAction(page: import('@playwright/test').Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Acciones del evento' }).click();
  await page.getByRole('button', { name, exact: true }).click();
}

test('crear evento provisional desde consulta y resolver conserva vínculo con API y PostgreSQL', async ({
  page,
  request,
}) => {
  const created = await request.post('/api/teams', {
    data: {
      name: 'Equipo E2E Vínculos',
      firstParticipantName: 'Ana Vínculos',
      timeZone: 'Europe/Madrid',
    },
  });
  expect(created.status()).toBe(201);
  const team = await created.json();
  const token = new URL(team.accessUrl).hash.slice('#t='.length);
  const headers = { Authorization: `Bearer ${token}` };
  await page.addInitScript(
    ({ id, actor }) => localStorage.setItem(`synqo-participant-${id}`, actor),
    { id: team.id, actor: team.firstParticipant.id },
  );
  await page.goto(`/e/calendario#t=${token}`);
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  const title = 'Fecha para excursión E2E';
  await editor.getByRole('textbox', { name: 'Título breve' }).fill(title);
  const createEvent = editor.getByRole('switch', { name: 'Crear evento provisional' });
  await expect(createEvent).not.toBeChecked();
  await createEvent.check();
  const day = editor.locator('.calendar-day.today');
  const date = await day.getAttribute('data-date');
  await day.click();
  await editor.getByRole('button', { name: 'Crear consulta', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '¿Crear esta consulta?' })).toHaveCount(0);
  await expect(page).toHaveURL(`/e/consultas#t=${token}`);
  await page.getByRole('button', { name: new RegExp(title) }).click();
  await expect(page.getByRole('link', { name: title })).toBeVisible();
  const authorization = { Authorization: `Bearer ${token}` };
  const createdConsultationResponse = await request.get('/api/teams/current/consultations', {
    headers: authorization,
  });
  expect(createdConsultationResponse.status()).toBe(200);
  const createdConsultations = await createdConsultationResponse.json();
  const linkedConsultation = [
    ...createdConsultations.open,
    ...createdConsultations.resolved,
    ...createdConsultations.rejected,
  ].find((item: { title: string }) => item.title === title);
  expect(linkedConsultation).toMatchObject({ title, event: { title } });
  const eventId = linkedConsultation.event.id;
  const provisionalResponse = await request.get(`/api/teams/current/events/${eventId}`, {
    headers: authorization,
  });
  expect(provisionalResponse.status()).toBe(200);
  expect(await provisionalResponse.json()).toMatchObject({
    event: {
      title,
      date: null,
      status: 'provisional',
      consultations: [{ id: linkedConsultation.id, title, state: 'open' }],
    },
  });
  await consultationAction(page, 'Resolver consulta');
  const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
  await expect(dialog.getByText(`Evento vinculado: ${title}`)).toBeVisible();
  await expect(dialog.getByRole('combobox')).toHaveCount(0);
  await expect(dialog.getByText('Comprobando el estado actual…')).toHaveCount(0);
  await dialog.getByRole('checkbox').check();
  await dialog.getByRole('button', { name: 'Aceptar seleccionadas' }).click();
  await expect(dialog.getByText(/quedará asignada como definitiva/)).toBeVisible();
  await dialog.getByRole('button', { name: 'Confirmar resolución' }).click();
  await expect(page.locator('.consultation-detail-view .badge')).toHaveText('Resuelta');
  await page.getByRole('link', { name: title }).click();
  await expect(page.locator('.event-detail-card .badge')).toHaveText('Definitivo');
  await page.reload();
  await page.getByRole('link', { name: title }).click();
  await expect(page.locator('.consultation-detail-view .badge')).toHaveText('Resuelta');
  await page.reload();
  await expect(page.getByRole('link', { name: title })).toBeVisible();
  const persisted = await request.get(`/api/teams/current/events/${eventId}`, { headers });
  expect(persisted.status()).toBe(200);
  expect(await persisted.json()).toMatchObject({
    event: {
      date,
      status: 'definitive',
      version: 2,
      lastModifiedBy: { id: team.firstParticipant.id },
      consultations: [{ title, state: 'resolved' }],
    },
  });
});

test('eventos persisten y se gestionan desde WEB contra API y PostgreSQL', async ({
  page,
  request,
}) => {
  const createTeam = await request.post('/api/teams', {
    data: {
      name: 'Equipo E2E Eventos',
      firstParticipantName: 'Ana E2E',
      timeZone: 'Europe/Madrid',
    },
  });
  expect(createTeam.status()).toBe(201);

  const team = (await createTeam.json()) as {
    id: string;
    firstParticipant: { id: string };
    accessUrl: string;
  };
  const token = new URL(team.accessUrl).hash.slice('#t='.length);
  expect(token).not.toBe('');

  await page.addInitScript(
    ({ teamId, participantId }) =>
      localStorage.setItem(`synqo-participant-${teamId}`, participantId),
    { teamId: team.id, participantId: team.firstParticipant.id },
  );
  await page.goto(`/e/eventos#t=${token}`);

  await expect(page.getByRole('heading', { name: 'Aún no hay eventos' })).toBeVisible();
  await page
    .locator('.consultations-empty')
    .getByRole('button', { name: /Crear evento/ })
    .click();
  const editor = page.getByRole('dialog', { name: 'Crea un evento' });
  await editor.locator('#event-title').fill('Ensayo E2E persistente');
  await editor.locator('#event-notes').fill('Comprobar lectura desde otra petición.');
  await editor.getByRole('button', { name: 'Guardar evento' }).click();

  const eventButton = page.getByRole('button', { name: /Ensayo E2E persistente/ });
  await expect(eventButton).toContainText('Provisional');

  const authorization = { Authorization: `Bearer ${token}` };
  const listAfterCreate = await request.get('/api/teams/current/events', {
    headers: authorization,
  });
  expect(listAfterCreate.status()).toBe(200);
  expect(await listAfterCreate.json()).toMatchObject({
    unfinalized: [
      {
        title: 'Ensayo E2E persistente',
        status: 'provisional',
      },
    ],
  });

  await page.reload();
  await expect(page.getByRole('button', { name: /Ensayo E2E persistente/ })).toBeVisible();
  await page.getByRole('button', { name: /Ensayo E2E persistente/ }).click();
  await expect(page.getByRole('heading', { name: 'Ensayo E2E persistente' })).toBeVisible();
  await expect(page.getByText('Comprobar lectura desde otra petición.')).toBeVisible();

  await eventAction(page, 'Editar evento');
  const edit = page.getByRole('dialog', { name: 'Edita el evento' });
  await edit.locator('#event-title').fill('Ensayo E2E editado');
  await edit.getByRole('button', { name: 'Guardar evento' }).click();
  await expect(page.getByRole('heading', { name: 'Ensayo E2E editado' })).toBeVisible();

  await eventAction(page, 'Rechazar evento');
  await page
    .getByRole('dialog', { name: '¿Rechazar este evento?' })
    .getByRole('button', { name: 'Rechazar evento' })
    .click();
  await expect(page.locator('.event-detail-card .badge')).toHaveText('Rechazado');

  await eventAction(page, 'Recuperar evento');
  await page
    .getByRole('dialog', { name: '¿Recuperar este evento?' })
    .getByRole('button', { name: 'Recuperar evento' })
    .click();
  await expect(page.locator('.event-detail-card .badge')).toHaveText('Provisional');

  const eventResponse = await request.get(
    `/api/teams/current/events/${(await listAfterCreate.json()).unfinalized[0].id}`,
    { headers: authorization },
  );
  expect(eventResponse.status()).toBe(200);
  expect(await eventResponse.json()).toMatchObject({
    event: {
      title: 'Ensayo E2E editado',
      status: 'provisional',
      notes: 'Comprobar lectura desde otra petición.',
    },
  });
});
