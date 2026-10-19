import { expect, test } from '@playwright/test';

const team = {
  id: 'evt-consult-team',
  name: 'Equipo de vínculos',
  timeZone: 'Europe/Madrid',
  expiresAt: '2027-01-01T00:00:00Z',
  participants: [{ id: 'evt-person', name: 'Ana' }],
};
const participant = team.participants[0];
const event = {
  id: 'evt-1',
  title: 'Excursión',
  date: null as string | null,
  status: 'provisional' as 'provisional' | 'definitive' | 'rejected',
  version: 3,
  lastModifiedAt: null,
};
const option = (id: string, date: string, position: number) => ({
  id,
  date,
  position,
  count: 0,
  voters: [],
});
const consultation = (overrides: Record<string, unknown> = {}) => ({
  id: 'con-1',
  type: 'date',
  title: '¿Cuándo hacemos la excursión?',
  state: 'open',
  createdAt: '2026-10-18T12:00:00+00:00',
  createdBy: participant,
  options: [option('opt-1', '2026-10-20', 0), option('opt-2', '2026-10-21', 1)],
  ...overrides,
});

async function installTeam(page: import('@playwright/test').Page): Promise<void> {
  await page.addInitScript((teamId) => {
    localStorage.setItem(`synqo-participant-${teamId}`, 'evt-person');
  }, team.id);
  await page.route('**/api/teams/current**', (route) => route.fulfill({ json: team }));
  await page.route('**/api/configuration', (route) =>
    route.fulfill({
      json: {
        teamCreationEmailMode: 'hidden',
        teamCreationMaxTeams: 3,
        teamCreationWindowMinutes: 60,
      },
    }),
  );
  await page.route('**/api/teams/current/events', (route) =>
    route.fulfill({ json: { unfinalized: [], future: [], past: [], rejected: [] } }),
  );
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: [], resolved: [], rejected: [] } }),
  );
}

test('crea consulta y evento provisional vinculados desde el switch opcional', async ({ page }) => {
  await installTeam(page);
  let created: Record<string, unknown> | undefined;
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.route('**/api/teams/current/events/calendar**', (route) =>
    route.fulfill({ json: { events: [] } }),
  );
  await page.route('**/api/teams/current/consultations', async (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ json: { open: [], resolved: [], rejected: [] } });
    }
    created = route.request().postDataJSON() as Record<string, unknown>;
    const result = consultation({
      event: { ...event, title: '¿Cuándo hacemos la excursión?', date: null, status: 'provisional' },
    });
    return route.fulfill({
      status: 201,
      json: { consultation: result, expiresAt: team.expiresAt },
    });
  });

  await page.goto('/e/calendario#t=evt-token');
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
  await page.locator('#date-consultation-title').fill('¿Cuándo hacemos la excursión?');
  await page.locator('.calendar-day.today').click();
  const createEvent = page.getByRole('switch', { name: 'Crear evento provisional' });
  await expect(createEvent).not.toBeChecked();
  await createEvent.check();
  const composer = page.locator('.calendar-detail-composer');
  await composer.getByRole('button', { name: 'Crear consulta', exact: true }).click();
  await page
    .getByRole('dialog', { name: '¿Crear esta consulta?' })
    .getByRole('button', { name: 'Confirmar creación' })
    .click();

  expect(created).toMatchObject({ type: 'date', createEvent: true });
  expect(created).not.toHaveProperty('eventId');
});

test('consulta abierta permite cambiar o retirar vínculo y cancelar sin guardar', async ({
  page,
}) => {
  await installTeam(page);
  const secondEvent = { ...event, id: 'evt-2', title: 'Comida' };
  let currentEvent: typeof event | undefined = event;
  const requests: Record<string, unknown>[] = [];
  await page.route('**/api/teams/current/consultations/con-1', (route) =>
    route.fulfill({ json: consultation({ ...(currentEvent ? { event: currentEvent } : {}) }) }),
  );
  await page.route('**/api/teams/current/events', (route) =>
    route.fulfill({
      json: { unfinalized: [event, secondEvent], future: [], past: [], rejected: [] },
    }),
  );
  await page.route('**/api/teams/current/consultations/con-1/event', async (route) => {
    const body = route.request().postDataJSON() as Record<string, unknown>;
    requests.push(body);
    currentEvent = body['eventId'] === secondEvent.id ? secondEvent : undefined;
    return route.fulfill({
      json: {
        consultation: consultation({ ...(currentEvent ? { event: currentEvent } : {}) }),
        expiresAt: team.expiresAt,
      },
    });
  });

  await page.goto('/e/consultas/con-1#t=evt-token');
  await expect(page.getByRole('heading', { name: consultation().title })).toBeVisible();
  await page.getByRole('button', { name: 'Cambiar evento' }).click();
  const linkDialog = page.getByRole('dialog', { name: 'Evento vinculado' });
  await linkDialog.getByLabel('Evento (opcional)').selectOption(secondEvent.id);
  await linkDialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(linkDialog).toHaveCount(0);
  expect(requests).toHaveLength(0);

  await page.getByRole('button', { name: 'Cambiar evento' }).click();
  await page
    .getByRole('dialog', { name: 'Evento vinculado' })
    .getByLabel('Evento (opcional)')
    .selectOption(secondEvent.id);
  await page.getByRole('button', { name: 'Guardar vínculo' }).click();
  await expect(page.getByRole('link', { name: secondEvent.title })).toBeVisible();
  await page.getByRole('button', { name: 'Quitar vínculo' }).click();
  await page
    .getByRole('dialog', { name: 'Evento vinculado' })
    .getByRole('button', { name: 'Guardar vínculo' })
    .click();
  expect(requests).toEqual([{ eventId: secondEvent.id }, { eventId: null }]);
});

test('resolver consulta vinculada con una fecha asigna esa fecha como definitiva al evento', async ({
  page,
}) => {
  await installTeam(page);
  let resolutionBody: Record<string, unknown> | undefined;
  await page.route('**/api/teams/current/consultations/con-1', (route) =>
    route.fulfill({ json: consultation({ event }) }),
  );
  await page.route('**/api/teams/current/events/evt-1', (route) =>
    route.fulfill({
      json: {
        event: {
          ...event,
          notes: null,
          createdBy: participant,
          createdAt: '2026-10-18T12:00:00+00:00',
          lastModifiedBy: null,
        },
      },
    }),
  );
  await page.route('**/api/teams/current/consultations/con-1/resolution', async (route) => {
    resolutionBody = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({
      json: {
        consultation: consultation({
          event: { ...event, date: '2026-10-20', status: 'definitive', version: 4 },
          state: 'resolved',
          resolution: {
            participant,
            resolvedAt: '2026-10-18T12:00:00+00:00',
            acceptedOptionIds: ['opt-1'],
          },
        }),
        expiresAt: team.expiresAt,
      },
    });
  });

  await page.goto('/e/consultas/con-1#t=evt-token');
  await page.getByRole('button', { name: 'Resolver consulta' }).click();
  const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
  await expect(dialog.locator('.calendar-note')).toHaveText(`Evento vinculado: ${event.title}`);
  await expect(dialog.locator('select')).toHaveCount(0);
  await expect(dialog.getByRole('combobox')).toHaveCount(0);
  await expect(
    dialog.getByText('Elige exactamente una fecha para el evento vinculado.'),
  ).toBeVisible();
  await dialog.getByRole('checkbox').first().check();
  await dialog.getByRole('button', { name: 'Aceptar seleccionadas' }).click();
  await page.getByRole('button', { name: 'Confirmar resolución' }).click();
  expect(resolutionBody).toMatchObject({ status: 'resolved', acceptedOptionIds: ['opt-1'] });
  await expect(page.getByText('Resuelta')).toBeVisible();
});

test('una consulta sin vínculo conserva la aceptación de varias fechas', async ({ page }) => {
  await installTeam(page);
  let resolutionBody: Record<string, unknown> | undefined;
  await page.route('**/api/teams/current/consultations/con-1', (route) =>
    route.fulfill({ json: consultation() }),
  );
  await page.route('**/api/teams/current/consultations/con-1/resolution', (route) => {
    resolutionBody = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({
      json: {
        consultation: consultation({
          state: 'resolved',
          resolution: {
            participant,
            resolvedAt: '2026-10-18T12:00:00+00:00',
            acceptedOptionIds: ['opt-1', 'opt-2'],
          },
        }),
        expiresAt: team.expiresAt,
      },
    });
  });
  await page.goto('/e/consultas/con-1#t=evt-token');
  await page.getByRole('button', { name: 'Resolver consulta' }).click();
  const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
  await expect(dialog.locator('.calendar-note')).toHaveCount(0);
  await expect(dialog.getByRole('combobox')).toHaveCount(0);
  await dialog.getByRole('checkbox').nth(0).check();
  await dialog.getByRole('checkbox').nth(1).check();
  await dialog.getByRole('button', { name: 'Aceptar seleccionadas' }).click();
  await page.getByRole('button', { name: 'Confirmar resolución' }).click();
  expect(resolutionBody).toMatchObject({ acceptedOptionIds: ['opt-1', 'opt-2'] });
});

test('un evento definitivo se confirma con expectedEventVersion y un conflicto pide revisar', async ({
  page,
}) => {
  await installTeam(page);
  const definitive = { ...event, date: '2026-10-22', status: 'definitive' as const, version: 8 };
  let resolutionBody: Record<string, unknown> | undefined;
  let detailReads = 0;
  await page.route('**/api/teams/current/consultations/con-1', (route) =>
    route.fulfill({ json: consultation({ event: definitive }) }),
  );
  await page.route('**/api/teams/current/events/evt-1', (route) => {
    detailReads += 1;
    return route.fulfill({
      json: {
        event: {
          ...definitive,
          notes: null,
          createdBy: participant,
          createdAt: '2026-10-18T12:00:00+00:00',
          lastModifiedBy: null,
        },
      },
    });
  });
  await page.route('**/api/teams/current/consultations/con-1/resolution', (route) => {
    resolutionBody = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({
      status: 409,
      contentType: 'application/problem+json',
      json: { title: 'Conflict', status: 409 },
    });
  });

  await page.goto('/e/consultas/con-1#t=evt-token');
  await page.getByRole('button', { name: 'Resolver consulta' }).click();
  const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
  await dialog.getByRole('checkbox').first().check();
  await dialog.getByRole('button', { name: 'Aceptar seleccionadas' }).click();
  await expect(dialog.getByRole('alert')).toContainText('El evento ya tiene fecha definitiva');
  await dialog.getByRole('button', { name: 'Confirmar resolución' }).click();
  expect(resolutionBody).toMatchObject({ expectedEventVersion: 8, acceptedOptionIds: ['opt-1'] });
  await expect(dialog.getByRole('alert')).toContainText('El estado ha cambiado');
  expect(detailReads).toBeGreaterThan(1);
  await expect(dialog.getByRole('button', { name: 'Confirmar resolución' })).toHaveCount(0);
});

test('cancelar la resolución con evento rechazado no envía cambios', async ({ page }) => {
  await installTeam(page);
  const rejected = { ...event, status: 'rejected' as const };
  let writes = 0;
  await page.route('**/api/teams/current/consultations/con-1', (route) =>
    route.fulfill({ json: consultation({ event: rejected }) }),
  );
  await page.route('**/api/teams/current/events/evt-1', (route) =>
    route.fulfill({
      json: {
        event: {
          ...rejected,
          notes: null,
          createdBy: participant,
          createdAt: '2026-10-18T12:00:00+00:00',
          lastModifiedBy: null,
        },
      },
    }),
  );
  await page.route('**/api/teams/current/consultations/con-1/resolution', (route) => {
    writes += 1;
    return route.fulfill({ status: 500 });
  });
  await page.goto('/e/consultas/con-1#t=evt-token');
  await page.getByRole('button', { name: 'Resolver consulta' }).click();
  const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
  await expect(dialog.getByText(/El evento está rechazado/)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Aceptar seleccionadas' })).toBeDisabled();
  await expect(dialog.getByRole('combobox')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog).toHaveCount(0);
  expect(writes).toBe(0);
  await expect(page.getByRole('button', { name: 'Resolver consulta' })).toBeFocused();
});

test('rechazar consulta conserva el vínculo histórico con el evento rechazado', async ({
  page,
}) => {
  await installTeam(page);
  const rejected = { ...event, status: 'rejected' as const };
  let resolutionBody: Record<string, unknown> | undefined;
  await page.route('**/api/teams/current/consultations/con-1', (route) =>
    route.fulfill({ json: consultation({ event: rejected }) }),
  );
  await page.route('**/api/teams/current/events/evt-1', (route) =>
    route.fulfill({
      json: {
        event: {
          ...rejected,
          notes: null,
          createdBy: participant,
          createdAt: '2026-10-18T12:00:00+00:00',
          lastModifiedBy: null,
        },
      },
    }),
  );
  await page.route('**/api/teams/current/consultations/con-1/resolution', (route) => {
    resolutionBody = route.request().postDataJSON() as Record<string, unknown>;
    return route.fulfill({
      json: {
        consultation: consultation({
          event: rejected,
          state: 'rejected',
          resolution: {
            participant,
            resolvedAt: '2026-10-18T12:00:00+00:00',
            acceptedOptionIds: [],
          },
        }),
        expiresAt: team.expiresAt,
      },
    });
  });
  await page.goto('/e/consultas/con-1#t=evt-token');
  await page.getByRole('button', { name: 'Resolver consulta' }).click();
  const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
  await dialog.getByRole('button', { name: 'Rechazar consulta' }).click();
  await dialog.getByRole('button', { name: 'Confirmar resolución' }).click();
  expect(resolutionBody).toMatchObject({ status: 'rejected', acceptedOptionIds: [] });
});

test('evento rechazado bloquea aceptación; se retira desde la ficha tras cancelar', async ({ page }) => {
  await installTeam(page);
  const rejected = { ...event, status: 'rejected' as const };
  let writes = 0;
  let currentEvent: typeof rejected | undefined = rejected;
  await page.route('**/api/teams/current/consultations/con-1', (route) =>
    route.fulfill({ json: consultation({ ...(currentEvent ? { event: currentEvent } : {}) }) }),
  );
  await page.route('**/api/teams/current/events/evt-1', (route) =>
    route.fulfill({
      json: {
        event: {
          ...rejected,
          notes: null,
          createdBy: participant,
          createdAt: '2026-10-18T12:00:00+00:00',
          lastModifiedBy: null,
        },
      },
    }),
  );
  await page.route('**/api/teams/current/consultations/con-1/resolution', (route) => {
    writes += 1;
    return route.fulfill({ status: 500 });
  });
  await page.route('**/api/teams/current/consultations/con-1/event', (route) => {
    writes += 1;
    currentEvent = undefined;
    return route.fulfill({
      json: { consultation: consultation(), expiresAt: team.expiresAt },
    });
  });
  await page.goto('/e/consultas/con-1#t=evt-token');
  await page.getByRole('button', { name: 'Resolver consulta' }).click();
  const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
  await expect(dialog.getByRole('button', { name: 'Aceptar seleccionadas' })).toBeDisabled();
  await expect(dialog.getByText(/Cancelar.*retirar el vínculo desde la ficha/i)).toBeVisible();
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await page.getByRole('button', { name: 'Quitar vínculo' }).click();
  await page
    .getByRole('dialog', { name: 'Evento vinculado' })
    .getByRole('button', { name: 'Guardar vínculo' })
    .click();
  expect(writes).toBe(1);
  await expect(page.getByRole('link', { name: event.title })).toHaveCount(0);
});

for (const disposition of ['unlink', 'reject_both'] as const) {
  test(`rechaza el evento con disposición ${disposition}`, async ({ page }) => {
    await installTeam(page);
    let rejectionBody: Record<string, unknown> | undefined;
    const linked = {
      ...event,
      notes: null,
      createdBy: participant,
      createdAt: '2026-10-18T12:00:00+00:00',
      lastModifiedBy: null,
      consultations: [{ id: 'con-1', title: '¿Cuándo hacemos la excursión?', state: 'open' }],
    };
    await page.route('**/api/teams/current/events', (route) =>
      route.fulfill({ json: { unfinalized: [event], future: [], past: [], rejected: [] } }),
    );
    await page.route('**/api/teams/current/events/evt-1', (route) =>
      route.fulfill({ json: { event: linked } }),
    );
    await page.route('**/api/teams/current/events/evt-1/rejection', async (route) => {
      rejectionBody = route.request().postDataJSON() as Record<string, unknown>;
      return route.fulfill({
        json: { event: { ...linked, status: 'rejected' }, expiresAt: team.expiresAt },
      });
    });
    await page.goto('/e/eventos/evt-1#t=evt-token');
    await page.getByRole('button', { name: 'Rechazar evento' }).click();
    const dialog = page.getByRole('dialog', { name: '¿Rechazar este evento?' });
    await dialog.getByLabel('Consulta abierta').selectOption(disposition);
    await dialog.getByRole('button', { name: 'Rechazar evento' }).click();
    expect(rejectionBody).toMatchObject({ disposition });
  });
}

test('cancelar el rechazo coordinado conserva ambos recursos y no envía la operación', async ({
  page,
}) => {
  await installTeam(page);
  const linked = {
    ...event,
    notes: null,
    createdBy: participant,
    createdAt: '2026-10-18T12:00:00+00:00',
    lastModifiedBy: null,
    consultations: [{ id: 'con-1', title: '¿Cuándo hacemos la excursión?', state: 'open' }],
  };
  let writes = 0;
  await page.route('**/api/teams/current/events/evt-1', (route) =>
    route.fulfill({ json: { event: linked } }),
  );
  await page.route('**/api/teams/current/events/evt-1/rejection', (route) => {
    writes += 1;
    return route.fulfill({ status: 500 });
  });
  await page.goto('/e/eventos/evt-1#t=evt-token');
  const opener = page.getByRole('button', { name: 'Rechazar evento' });
  await opener.click();
  const dialog = page.getByRole('dialog', { name: '¿Rechazar este evento?' });
  await dialog.getByRole('button', { name: 'Cancelar' }).click();
  await expect(dialog).toHaveCount(0);
  expect(writes).toBe(0);
  await expect(opener).toBeFocused();
  await expect(page.getByRole('heading', { name: event.title })).toBeVisible();
});

test('navega de consulta a evento y de evento a la relación histórica', async ({ page }) => {
  await installTeam(page);
  const closed = consultation({
    state: 'rejected',
    event,
    resolution: {
      participant,
      resolvedAt: '2026-10-18T12:00:00+00:00',
      acceptedOptionIds: [],
    },
  });
  const linked = {
    ...event,
    notes: null,
    createdBy: participant,
    createdAt: '2026-10-18T12:00:00+00:00',
    lastModifiedBy: null,
    consultations: [{ id: 'con-1', title: closed.title, state: 'rejected' }],
  };
  await page.route('**/api/teams/current/consultations/con-1', (route) =>
    route.fulfill({ json: closed }),
  );
  await page.route('**/api/teams/current/events/evt-1', (route) =>
    route.fulfill({ json: { event: linked } }),
  );
  await page.goto('/e/consultas/con-1#t=evt-token');
  await page.getByRole('link', { name: event.title }).click();
  await expect(page).toHaveURL(/\/e\/eventos\/evt-1#t=evt-token$/);
  await page.getByRole('link', { name: closed.title }).click();
  await expect(page).toHaveURL(/\/e\/consultas\/con-1#t=evt-token$/);
});
