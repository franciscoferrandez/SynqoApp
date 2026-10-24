import { expect, test } from '@playwright/test';

const team = {
  id: 'events-team',
  name: 'Equipo de eventos',
  timeZone: 'Europe/Madrid',
  expiresAt: '2027-01-01T00:00:00Z',
  participants: [{ id: 'participant-ana', name: 'Ana' }],
};

type EventItem = {
  id: string;
  title: string;
  notes: string | null;
  date: string | null;
  status: 'provisional' | 'definitive' | 'rejected';
  createdBy: { id: string; name: string };
  createdAt: string;
  lastModifiedAt: string | null;
  lastModifiedBy: { id: string; name: string } | null;
  version: number;
};

function summary(item: EventItem) {
  return {
    id: item.id,
    title: item.title,
    date: item.date,
    status: item.status,
    lastModifiedAt: item.lastModifiedAt,
    version: item.version,
    openConsultationId: null,
  };
}

async function eventAction(page: import('@playwright/test').Page, name: string): Promise<void> {
  await page.getByRole('button', { name: 'Acciones del evento' }).click();
  await page.getByRole('button', { name, exact: true }).click();
}

test('creates, edits, rejects and recovers an event with confirmations', async ({ page }) => {
  let item: EventItem | undefined;
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-events-team', 'participant-ana'),
  );
  await page.route('**/api/configuration', (route) =>
    route.fulfill({
      json: {
        teamCreationEmailMode: 'hidden',
        teamCreationMaxTeams: 10,
        teamCreationWindowMinutes: 60,
      },
    }),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/events**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (request.method() === 'GET' && url.pathname.endsWith('/events')) {
      return route.fulfill({
        json: {
          unfinalized: item && item.status === 'provisional' ? [summary(item)] : [],
          future: item && item.status === 'definitive' ? [summary(item)] : [],
          past: [],
          rejected: item && item.status === 'rejected' ? [summary(item)] : [],
        },
      });
    }
    if (request.method() === 'POST') {
      const body = request.postDataJSON() as Omit<
        EventItem,
        'id' | 'createdBy' | 'createdAt' | 'lastModifiedAt' | 'lastModifiedBy' | 'version'
      >;
      item = {
        ...body,
        id: 'event-one',
        createdBy: team.participants[0],
        createdAt: '2026-10-18T10:00:00Z',
        lastModifiedAt: null,
        lastModifiedBy: null,
        version: 1,
      };
      return route.fulfill({ status: 201, json: { event: item, expiresAt: team.expiresAt } });
    }
    if (!item) return route.fulfill({ status: 404, json: { status: 404 } });
    if (request.method() === 'GET') return route.fulfill({ json: { event: item } });
    if (request.method() === 'PUT' && url.pathname.endsWith('/rejection')) {
      item = {
        ...item,
        status: 'rejected',
        lastModifiedAt: '2026-10-18T11:00:00Z',
        lastModifiedBy: team.participants[0],
        version: item.version + 1,
      };
      return route.fulfill({ json: { event: item, expiresAt: team.expiresAt } });
    }
    if (request.method() === 'PUT' && url.pathname.endsWith('/recovery')) {
      item = {
        ...item,
        status: 'provisional',
        lastModifiedAt: '2026-10-18T12:00:00Z',
        lastModifiedBy: team.participants[0],
        version: item.version + 1,
      };
      return route.fulfill({ json: { event: item, expiresAt: team.expiresAt } });
    }
    if (request.method() === 'PUT') {
      const body = request.postDataJSON() as Partial<EventItem>;
      item = {
        ...item,
        ...body,
        lastModifiedAt: '2026-10-18T10:30:00Z',
        lastModifiedBy: team.participants[0],
        version: item.version + 1,
      };
      return route.fulfill({ json: { event: item, expiresAt: team.expiresAt } });
    }
    return route.continue();
  });

  await page.goto('/e/eventos#t=events-token');
  await expect(page.getByRole('heading', { name: 'Aún no hay eventos' })).toBeVisible();
  await page
    .locator('.consultations-empty')
    .getByRole('button', { name: /Crear evento/ })
    .click();
  const editor = page.getByRole('dialog', { name: 'Crea un evento' });
  await expect(editor.locator('#event-title')).toBeFocused();
  await editor.locator('#event-title').fill('Ensayo general');
  await editor.locator('#event-notes').fill('Traer partituras.');
  await editor.locator('#event-date').fill('2026-11-02');
  await expect(editor.locator('#event-status')).toHaveValue('provisional');
  await editor.locator('#event-status').selectOption('definitive');
  await editor.getByRole('button', { name: 'Guardar evento' }).click();
  await expect(page.getByRole('heading', { name: 'Futuros' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Ensayo general/ })).toContainText('Definitivo');

  await page.getByRole('button', { name: /Ensayo general/ }).click();
  await expect(page.getByRole('heading', { name: 'Ensayo general' })).toBeVisible();
  await expect(page.getByText('Traer partituras.')).toBeVisible();
  await expect(page.getByText('Última modificación')).toHaveCount(0);
  const actions = page.getByRole('button', { name: 'Acciones del evento' });
  await expect(actions).toHaveAttribute('aria-expanded', 'false');
  const actionsId = await actions.getAttribute('aria-controls');
  expect(actionsId).toBeTruthy();
  await actions.focus();
  await page.keyboard.press('Enter');
  await expect(actions).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByRole('menu')).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Acciones del evento' })).toHaveAttribute(
    'id',
    actionsId!,
  );
  await expect(page.getByRole('button', { name: 'Editar evento', exact: true })).toBeEnabled();
  await page.keyboard.press('Escape');
  await expect(actions).toHaveAttribute('aria-expanded', 'false');
  await expect(actions).toBeFocused();
  await actions.click();
  await page.getByRole('heading', { name: 'Ensayo general' }).click();
  await expect(actions).toHaveAttribute('aria-expanded', 'false');
  await eventAction(page, 'Editar evento');
  const edit = page.getByRole('dialog', { name: 'Edita el evento' });
  await edit.locator('#event-title').fill('Ensayo y repertorio');
  await edit.getByRole('button', { name: 'Cancelar' }).click();
  const discard = page.getByRole('dialog', { name: '¿Descartar los cambios?' });
  await expect(discard.getByRole('button', { name: 'Seguir editando' })).toBeFocused();
  await discard.getByRole('button', { name: 'Seguir editando' }).click();
  await expect(edit.locator('#event-title')).toHaveValue('Ensayo y repertorio');
  await edit.getByRole('button', { name: 'Guardar evento' }).click();
  await expect(page.getByRole('heading', { name: 'Ensayo y repertorio' })).toBeVisible();
  await expect(page.getByText('Última modificación')).toBeVisible();

  await eventAction(page, 'Rechazar evento');
  const reject = page.getByRole('dialog', { name: '¿Rechazar este evento?' });
  await reject.getByRole('button', { name: 'Rechazar evento' }).click();
  await expect(page.locator('.event-detail-card .badge')).toHaveText('Rechazado');
  await page.getByRole('button', { name: 'Acciones del evento' }).click();
  await expect(page.getByRole('button', { name: 'Editar evento', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: 'Recuperar evento', exact: true }).click();
  await page
    .getByRole('dialog', { name: '¿Recuperar este evento?' })
    .getByRole('button', { name: 'Recuperar evento' })
    .click();
  await expect(page.locator('.event-detail-card .badge')).toHaveText('Provisional');
  await page.getByRole('button', { name: '← Volver a Eventos' }).click();
  await expect(page.getByRole('heading', { name: 'Sin fecha definitiva' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Ensayo y repertorio/ })).toContainText(
    'Provisional',
  );
});

test('the event list and editor fit a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-events-team', 'participant-ana'),
  );
  await page.route('**/api/configuration', (route) =>
    route.fulfill({
      json: {
        teamCreationEmailMode: 'hidden',
        teamCreationMaxTeams: 10,
        teamCreationWindowMinutes: 60,
      },
    }),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/events', (route) =>
    route.fulfill({ json: { unfinalized: [], future: [], past: [], rejected: [] } }),
  );

  await page.goto('/e/eventos#t=events-token');
  await expect(page.getByRole('heading', { name: 'Aún no hay eventos' })).toBeVisible();
  await page
    .locator('.consultations-empty')
    .getByRole('button', { name: /Crear evento/ })
    .click();
  const editor = page.getByRole('dialog', { name: 'Crea un evento' });
  await expect(editor.locator('#event-title')).toBeFocused();
  const bounds = await editor.boundingBox();
  expect(bounds).not.toBeNull();
  expect(bounds!.width).toBeLessThanOrEqual(390);
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
});

test('load and save errors allow retry without losing the event draft', async ({ page }) => {
  let loadAttempts = 0;
  let saveAttempts = 0;
  let savedTitle: string | undefined;
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-events-team', 'participant-ana'),
  );
  await page.route('**/api/configuration', (route) =>
    route.fulfill({
      json: {
        teamCreationEmailMode: 'hidden',
        teamCreationMaxTeams: 10,
        teamCreationWindowMinutes: 60,
      },
    }),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/events**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      if (++loadAttempts === 1) return route.fulfill({ status: 500, json: { status: 500 } });
      return route.fulfill({
        json: {
          unfinalized: savedTitle
            ? [
                {
                  id: 'event-retried',
                  title: savedTitle,
                  date: null,
                  status: 'provisional',
                  openConsultationId: null,
                  lastModifiedAt: null,
                  version: 1,
                },
              ]
            : [],
          future: [],
          past: [],
          rejected: [],
        },
      });
    }
    if (++saveAttempts === 1) return route.fulfill({ status: 500, json: { status: 500 } });
    const body = request.postDataJSON() as { participantId: string; title: string };
    savedTitle = body.title;
    return route.fulfill({
      status: 201,
      json: {
        event: {
          id: 'event-retried',
          title: body.title,
          notes: null,
          date: null,
          status: 'provisional',
          openConsultationId: null,
          createdBy: team.participants[0],
          createdAt: '2026-10-18T10:00:00Z',
          lastModifiedAt: null,
          lastModifiedBy: null,
          version: 1,
        },
        expiresAt: team.expiresAt,
      },
    });
  });

  await page.goto('/e/eventos#t=events-token');
  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar los eventos');
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await expect(page.getByRole('heading', { name: 'Aún no hay eventos' })).toBeVisible();
  await page
    .locator('.consultations-empty')
    .getByRole('button', { name: /Crear evento/ })
    .click();
  const editor = page.getByRole('dialog', { name: 'Crea un evento' });
  await editor.locator('#event-title').fill('Ensayo para reintentar');
  await editor.getByRole('button', { name: 'Guardar evento' }).click();
  await expect(editor.getByRole('alert')).toContainText('No se pudo guardar el evento');
  await expect(editor.locator('#event-title')).toHaveValue('Ensayo para reintentar');
  await editor.getByRole('button', { name: 'Guardar evento' }).click();
  await expect(page.getByRole('button', { name: /Ensayo para reintentar/ })).toBeVisible();
});
