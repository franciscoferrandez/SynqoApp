import { expect, test } from '@playwright/test';

test('participante distinto a quien creó la consulta retira una opción votada preservando las demás selecciones', async ({
  page,
  request,
}) => {
  const createdTeam = await request.post('/api/teams', {
    data: {
      name: 'Equipo E2E Edición de consulta',
      firstParticipantName: 'Ana Creadora',
      timeZone: 'Europe/Madrid',
    },
  });
  expect(createdTeam.status()).toBe(201);
  const team = await createdTeam.json();
  const token = new URL(team.accessUrl).hash.slice('#t='.length);
  const headers = { Authorization: `Bearer ${token}` };

  const secondParticipantResponse = await request.post('/api/teams/current/participants', {
    headers,
    data: { name: 'Bea Editora' },
  });
  expect(secondParticipantResponse.status()).toBe(201);
  const secondParticipant = (await secondParticipantResponse.json()).participant;
  const consultationResponse = await request.post('/api/teams/current/consultations', {
    headers,
    data: {
      participantId: team.firstParticipant.id,
      title: '¿Qué plan elegimos?',
      options: ['Conservar', 'Retirada', 'Otra opción'],
    },
  });
  expect(consultationResponse.status()).toBe(201);
  const consultation = (await consultationResponse.json()).consultation;
  const [retainedOption, removedOption] = consultation.options;

  for (const [participantId, optionId] of [
    [team.firstParticipant.id, retainedOption.id],
    [team.firstParticipant.id, removedOption.id],
    [secondParticipant.id, removedOption.id],
  ]) {
    const voteResponse = await request.put(
      `/api/teams/current/consultations/${consultation.id}/votes/${participantId}/options/${optionId}`,
      { headers, data: { selected: true } },
    );
    expect(voteResponse.status()).toBe(200);
  }

  await page.addInitScript(
    ({ teamId, participantId }) =>
      localStorage.setItem(`synqo-participant-${teamId}`, participantId),
    { teamId: team.id, participantId: secondParticipant.id },
  );
  await page.goto(`/e/consultas/${consultation.id}#t=${token}`);
  await expect(page.getByRole('heading', { name: consultation.title })).toBeVisible();
  await page.getByRole('button', { name: 'Acciones de la consulta' }).click();
  await page.getByRole('button', { name: 'Editar consulta', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await expect(editor.getByRole('textbox', { name: 'Opción 1' })).toHaveAttribute('readonly', '');
  await expect(editor.getByRole('textbox', { name: 'Opción 2' })).toHaveAttribute('readonly', '');
  await editor.getByRole('button', { name: 'Eliminar opción 2' }).click();
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  const confirmation = page.getByRole('dialog', { name: 'Eliminar opciones y sus votos' });
  await expect(confirmation).toContainText('Retirada');
  await expect(confirmation).toContainText('2 votos');
  await confirmation.getByRole('button', { name: 'Eliminar opciones y guardar' }).click();

  await expect(page.getByRole('heading', { name: consultation.title })).toBeVisible();
  await expect(page.getByText('Última edición: Bea Editora')).toBeVisible();
  const persistedResponse = await request.get(
    `/api/teams/current/consultations/${consultation.id}`,
    { headers },
  );
  expect(persistedResponse.status()).toBe(200);
  expect(await persistedResponse.json()).toMatchObject({
    title: consultation.title,
    state: 'open',
    createdAt: consultation.createdAt,
    createdBy: { id: team.firstParticipant.id, name: 'Ana Creadora' },
    lastModifiedBy: { id: secondParticipant.id, name: 'Bea Editora' },
    lastModifiedAt: expect.any(String),
    options: [
      {
        id: retainedOption.id,
        text: 'Conservar',
        position: 0,
        count: 1,
        voters: [{ id: team.firstParticipant.id }],
      },
      {
        id: consultation.options[2].id,
        text: 'Otra opción',
        position: 1,
        count: 0,
      },
    ],
  });
});
