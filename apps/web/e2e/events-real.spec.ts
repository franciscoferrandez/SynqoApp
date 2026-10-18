import { expect, test } from '@playwright/test';

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

  await page.getByRole('button', { name: 'Editar evento' }).click();
  const edit = page.getByRole('dialog', { name: 'Edita el evento' });
  await edit.locator('#event-title').fill('Ensayo E2E editado');
  await edit.getByRole('button', { name: 'Guardar evento' }).click();
  await expect(page.getByRole('heading', { name: 'Ensayo E2E editado' })).toBeVisible();

  await page.getByRole('button', { name: 'Rechazar evento' }).click();
  await page
    .getByRole('dialog', { name: '¿Rechazar este evento?' })
    .getByRole('button', { name: 'Rechazar evento' })
    .click();
  await expect(page.locator('.event-detail-card .badge')).toHaveText('Rechazado');

  await page.getByRole('button', { name: 'Recuperar evento' }).click();
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
