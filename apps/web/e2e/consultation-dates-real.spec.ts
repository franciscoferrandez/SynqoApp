import { expect, test } from '@playwright/test';

function dateInDays(days: number): string {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Madrid' }).format(value);
}

function formattedDate(date: string): string {
  return new Intl.DateTimeFormat('es', {
    dateStyle: 'full',
    timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

test('creates and edits a date consultation through the API, confirming voted date removal', async ({
  request,
}) => {
  const createdTeam = await request.post('/api/teams', {
    data: {
      name: 'Equipo E2E edición de fechas',
      firstParticipantName: 'Ana Creadora',
      timeZone: 'Europe/Madrid',
    },
  });
  expect(createdTeam.status()).toBe(201);
  const team = await createdTeam.json();
  const addedOptionId = crypto.randomUUID();
  const token = new URL(team.accessUrl).hash.slice('#t='.length);
  const headers = { Authorization: `Bearer ${token}` };
  const voterResponse = await request.post('/api/teams/current/participants', {
    headers,
    data: { name: 'Bea Votante' },
  });
  expect(voterResponse.status()).toBe(201);
  const voter = (await voterResponse.json()).participant;

  const created = await request.post('/api/teams/current/consultations', {
    headers,
    data: {
      participantId: team.firstParticipant.id,
      type: 'date',
      title: '¿Qué fechas sirven?',
      options: [dateInDays(3), dateInDays(5)],
      createEvent: true,
      timeZone: 'Europe/Madrid',
    },
  });
  expect(created.status()).toBe(201);
  const consultation = (await created.json()).consultation;
  const linkedEvent = consultation.event;
  expect(linkedEvent).toMatchObject({
    title: '¿Qué fechas sirven?',
    date: null,
    status: 'provisional',
  });
  const [removed, retained] = consultation.options;

  for (const participantId of [team.firstParticipant.id, voter.id]) {
    const vote = await request.put(
      `/api/teams/current/consultations/${consultation.id}/votes/${participantId}/options/${removed.id}`,
      { headers, data: { selected: true } },
    );
    expect(vote.status()).toBe(200);
  }

  const edited = await request.patch(`/api/teams/current/consultations/${consultation.id}`, {
    headers,
    data: {
      participantId: voter.id,
      title: '¿Qué fechas nos van mejor?',
      timeZone: 'Europe/Madrid',
      optionChanges: {
        add: [{ id: addedOptionId, date: dateInDays(7) }],
        update: [],
        remove: [removed.id],
      },
      confirmedRemovalOptionIds: [removed.id],
    },
  });
  expect(edited.status()).toBe(200);
  const result = (await edited.json()).consultation;
  expect(result).toMatchObject({
    id: consultation.id,
    type: 'date',
    state: 'open',
    title: '¿Qué fechas nos van mejor?',
    createdAt: consultation.createdAt,
    createdBy: { id: team.firstParticipant.id, name: 'Ana Creadora' },
    event: { id: linkedEvent.id, title: '¿Qué fechas sirven?', date: null, status: 'provisional' },
    lastModifiedBy: { id: voter.id, name: 'Bea Votante' },
    lastModifiedAt: expect.any(String),
    options: [
      { id: retained.id, date: retained.date, position: 0, count: 0 },
      {
        id: addedOptionId,
        date: dateInDays(7),
        position: 1,
        count: 0,
      },
    ],
  });

  const persisted = await request.get(`/api/teams/current/consultations/${consultation.id}`, {
    headers,
  });
  expect(persisted.status()).toBe(200);
  expect((await persisted.json()).options).toEqual(result.options);
});

test('creates from Consultas and confirms a voted-date removal in the browser against the API', async ({
  page,
  request,
}) => {
  const createdTeam = await request.post('/api/teams', {
    data: {
      name: 'Equipo E2E calendario de consultas',
      firstParticipantName: 'Ana Creadora',
      timeZone: 'Europe/Madrid',
    },
  });
  expect(createdTeam.status()).toBe(201);
  const team = await createdTeam.json();
  const token = new URL(team.accessUrl).hash.slice('#t='.length);
  const headers = { Authorization: `Bearer ${token}` };
  const voterResponse = await request.post('/api/teams/current/participants', {
    headers,
    data: { name: 'Bea Votante' },
  });
  expect(voterResponse.status()).toBe(201);
  const voter = (await voterResponse.json()).participant;

  await page.addInitScript(
    ({ teamId, participantId }) =>
      localStorage.setItem(`synqo-participant-${teamId}`, participantId),
    { teamId: team.id, participantId: team.firstParticipant.id },
  );
  await page.goto(`/e/consultas#t=${token}`);
  await page
    .locator('.consultations-empty')
    .getByRole('button', { name: /Crear consulta/ })
    .click();
  await page
    .getByRole('dialog', { name: '¿Qué quieres consultar?' })
    .getByRole('button', { name: 'Fechas' })
    .click();
  const creation = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  await creation.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué fechas nos van bien?');
  const firstDate = dateInDays(2);
  const retainedDate = dateInDays(4);
  const moveToDate = async (dialog: import('@playwright/test').Locator, date: string) => {
    for (let attempt = 0; attempt < 3; attempt += 1) {
      const day = dialog.locator(`.calendar-day[data-date="${date}"]`);
      if (await day.count()) {
        await day.click();
        return;
      }
      await dialog.getByRole('button', { name: 'Mes siguiente' }).click();
    }
    throw new Error(`No se encontró la fecha ${date} en el calendario`);
  };
  await moveToDate(creation, firstDate);
  await moveToDate(creation, retainedDate);
  await creation.getByRole('switch', { name: 'Crear evento provisional' }).check();
  await creation.getByRole('button', { name: 'Crear consulta', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Abiertas' })).toBeVisible();
  await expect(page.getByText('¿Qué fechas nos van bien?', { exact: true })).toBeVisible();

  const consultationsResponse = await request.get('/api/teams/current/consultations', { headers });
  expect(consultationsResponse.status()).toBe(200);
  const groups = await consultationsResponse.json();
  const consultation = groups.open.find(
    (item: { title: string }) => item.title === '¿Qué fechas nos van bien?',
  );
  expect(consultation).toBeDefined();
  const linkedEvent = consultation.event;
  expect(linkedEvent).toMatchObject({
    title: '¿Qué fechas nos van bien?',
    date: null,
    status: 'provisional',
  });
  const removed = consultation.options.find(
    (option: { date: string }) => option.date === firstDate,
  );
  const retained = consultation.options.find(
    (option: { date: string }) => option.date === retainedDate,
  );
  expect(removed).toBeDefined();
  expect(retained).toBeDefined();
  const vote = await request.put(
    `/api/teams/current/consultations/${consultation.id}/votes/${voter.id}/options/${removed.id}`,
    { headers, data: { selected: true } },
  );
  expect(vote.status()).toBe(200);

  await page.goto(`/e/consultas/${consultation.id}#t=${token}`);
  await page.getByRole('button', { name: 'Acciones de la consulta' }).click();
  await page.getByRole('button', { name: 'Editar consulta', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await editor.getByRole('textbox', { name: 'Título breve' }).fill('Fechas confirmadas');
  const removedDate = editor.locator(`.calendar-day[data-date="${firstDate}"]`);
  for (let attempt = 0; attempt < 3; attempt += 1) {
    if (await removedDate.count()) break;
    await editor.getByRole('button', { name: 'Mes siguiente' }).click();
  }
  await removedDate.click();
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Eliminar fechas y sus votos' });
  await expect(confirmation).toContainText(formattedDate(firstDate));
  await confirmation.getByRole('button', { name: 'Eliminar fechas y guardar' }).click();
  await expect(page.getByRole('heading', { name: 'Fechas confirmadas' })).toBeVisible();

  const persistedResponse = await request.get(
    `/api/teams/current/consultations/${consultation.id}`,
    { headers },
  );
  expect(persistedResponse.status()).toBe(200);
  const persisted = await persistedResponse.json();
  expect(persisted).toMatchObject({
    title: 'Fechas confirmadas',
    createdBy: { id: team.firstParticipant.id },
    lastModifiedBy: { id: team.firstParticipant.id, name: 'Ana Creadora' },
    lastModifiedAt: expect.any(String),
    event: {
      id: linkedEvent.id,
      title: '¿Qué fechas nos van bien?',
      date: null,
      status: 'provisional',
    },
  });
  expect(persisted.options).toEqual([
    expect.objectContaining({ id: retained.id, date: retainedDate, position: 0, count: 0 }),
  ]);
});
