import { expect, test, type Page } from '@playwright/test';
import { consultationListFixture } from './fixtures/consultation-list';

const today = '2026-10-24';
const person = { id: 'listing-person', name: 'Ana' };
const team = {
  id: 'listing-team',
  name: 'Consultas por vigencia',
  timeZone: 'Europe/Madrid',
  expiresAt: '2027-01-01T00:00:00Z',
  participants: [person],
};
const listUrl = /\/api\/teams\/current\/consultations(?:\?.*)?$/;
const item = (id: string, effectiveDate: string, state = 'rejected') => ({
  id,
  title: `Consulta ${id}`,
  type: 'text',
  state,
  effectiveDate,
  createdAt: `${effectiveDate}T12:00:00+02:00`,
  createdBy: person,
  options: [{ id: `${id}-option`, text: 'Primera opción', position: 0, count: 0, voters: [] }],
  ...(state === 'rejected'
    ? {
        resolution: {
          participant: person,
          resolvedAt: `${effectiveDate}T13:00:00+02:00`,
          acceptedOptionIds: [],
        },
      }
    : {}),
});

async function install(page: Page) {
  await page.addInitScript(
    ({ teamId, personId }) => localStorage.setItem(`synqo-participant-${teamId}`, personId),
    { teamId: team.id, personId: person.id },
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
}

test('muestra todas las recientes aunque superen diez y añade diez, diez y el resto sin duplicar', async ({
  page,
}) => {
  await install(page);
  const active = [item('active-a', '2026-10-01', 'open'), item('active-b', today, 'open')];
  const recent = Array.from({ length: 12 }, (_, index) =>
    item(`recent-${String(index).padStart(2, '0')}`, '2026-10-23'),
  );
  const old = Array.from({ length: 23 }, (_, index) =>
    item(`old-${String(index).padStart(2, '0')}`, '2026-10-17'),
  );
  const initial = { ...consultationListFixture(active, recent, today), archivedCursor: 'page-0' };
  const cursors: string[] = [];
  await page.route(listUrl, (route) => {
    const cursor = new URL(route.request().url()).searchParams.get('archivedCursor');
    if (!cursor) return route.fulfill({ json: initial });
    cursors.push(cursor);
    const offset = Number(cursor.slice(5));
    return route.fulfill({
      json: {
        archived: old.slice(offset, offset + 10),
        archivedCursor: offset + 10 < old.length ? `page-${offset + 10}` : null,
        listContext: initial.listContext,
      },
    });
  });
  await page.goto('/e/consultas#t=listing-token');
  const activeCards = page.locator('section[aria-labelledby="active-heading"] .consultation-card');
  const archivedCards = page.locator(
    'section[aria-labelledby="archived-heading"] .consultation-card',
  );
  await expect(activeCards).toHaveCount(2);
  await expect(activeCards.locator('strong')).toHaveText(active.map((record) => record.title));
  await expect(archivedCards).toHaveCount(12);
  await expect(archivedCards.first()).toContainText('Vigencia: 23 de octubre de 2026');
  for (const count of [22, 32, 35]) {
    await page.getByRole('button', { name: 'Cargar más', exact: true }).click();
    await expect(archivedCards).toHaveCount(count);
    await expect(activeCards).toHaveCount(2);
  }
  await expect(archivedCards.locator('strong')).toHaveText(
    [...recent, ...old].map((record) => record.title),
  );
  expect(cursors).toEqual(['page-0', 'page-10', 'page-20']);
  await expect(page.getByRole('button', { name: 'Cargar más' })).toHaveCount(0);
});

test('una ventana vacía con historial ofrece cargar y conserva tarjetas al fallar, bloqueando doble pulsación', async ({
  page,
}) => {
  await install(page);
  const initial = { ...consultationListFixture([], [], today), archivedCursor: 'older' };
  let reads = 0;
  let release!: () => void;
  const ready = new Promise<void>((resolve) => (release = resolve));
  await page.route(listUrl, async (route) => {
    if (!new URL(route.request().url()).searchParams.has('archivedCursor'))
      return route.fulfill({ json: initial });
    reads += 1;
    if (reads === 1)
      return route.fulfill({
        json: {
          archived: [item('retained', '2026-10-17')],
          archivedCursor: 'older-again',
          listContext: initial.listContext,
        },
      });
    if (reads === 2) return route.fulfill({ status: 503, json: { status: 503 } });
    await ready;
    return route.fulfill({
      json: {
        archived: [item('retained', '2026-10-17'), item('last', '2026-10-16')],
        archivedCursor: null,
        listContext: initial.listContext,
      },
    });
  });
  await page.goto('/e/consultas#t=listing-token');
  await expect(page.getByRole('heading', { name: 'Aún no hay consultas' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Cargar más' }).click();
  await expect(page.locator('.consultation-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Cargar más' }).click();
  await expect(page.getByRole('alert')).toContainText('Conservamos las ya visibles');
  await expect(page.locator('.consultation-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Reintentar', exact: true }).click();
  const loading = page.getByRole('button', { name: 'Cargando…', exact: true });
  await expect(loading).toBeDisabled();
  await loading.evaluate((button: HTMLButtonElement) => button.click());
  expect(reads).toBe(3);
  release();
  await expect(page.locator('.consultation-card')).toHaveCount(2);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cargar más' })).toHaveCount(0);
});

test('un cambio de día o zona reinicia la ventana tras el conflicto 409', async ({ page }) => {
  await install(page);
  let initialReads = 0;
  await page.route(listUrl, (route) => {
    if (new URL(route.request().url()).searchParams.has('archivedCursor'))
      return route.fulfill({
        status: 409,
        json: { type: 'urn:synqo:problem:list-context-changed' },
      });
    initialReads += 1;
    return route.fulfill({
      json:
        initialReads === 1
          ? {
              ...consultationListFixture([], [item('yesterday', '2026-10-23')], today),
              archivedCursor: 'expired',
            }
          : consultationListFixture([item('fresh', '2026-10-25', 'open')], [], '2026-10-25'),
    });
  });
  await page.goto('/e/consultas#t=listing-token');
  await expect(page.getByRole('button', { name: /Consulta yesterday/ })).toBeVisible();
  await page.getByRole('button', { name: 'Cargar más' }).click();
  await expect(page.getByRole('button', { name: /Consulta fresh/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /Consulta yesterday/ })).toHaveCount(0);
  expect(initialReads).toBe(2);
});

test('ignora una continuación tardía después de abandonar y reabrir la lista', async ({ page }) => {
  await install(page);
  let initialReads = 0;
  let release!: () => void;
  let completed = false;
  const ready = new Promise<void>((resolve) => (release = resolve));
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.route('**/api/teams/current/events/calendar**', (route) =>
    route.fulfill({ json: { events: [] } }),
  );
  await page.route(listUrl, async (route) => {
    if (!new URL(route.request().url()).searchParams.has('archivedCursor')) {
      initialReads += 1;
      return route.fulfill({
        json:
          initialReads === 1
            ? { ...consultationListFixture([], [], today), archivedCursor: 'delayed' }
            : consultationListFixture([item('fresh', today, 'open')], [], today),
      });
    }
    await ready;
    await route
      .fulfill({
        json: {
          archived: [item('obsolete', '2026-10-10')],
          archivedCursor: null,
          listContext: consultationListFixture([], [], today).listContext,
        },
      })
      .catch(() => {});
    completed = true;
  });
  await page.goto('/e/consultas#t=listing-token');
  await page.getByRole('button', { name: 'Cargar más' }).click();
  await expect(page.getByRole('button', { name: 'Cargando…', exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'Calendario', exact: true }).click();
  await page.getByRole('link', { name: 'Consultas', exact: true }).click();
  await expect(page.getByRole('button', { name: /Consulta fresh/ })).toBeVisible();
  release();
  await expect.poll(() => completed).toBe(true);
  await expect(page.locator('.consultation-card')).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Consulta obsolete/ })).toHaveCount(0);
});

test('una abierta archivada conserva voto, edición y resolución y vuelve a activas al añadir hoy', async ({
  page,
}) => {
  await install(page);
  await page.clock.install({ time: new Date('2026-10-24T12:00:00Z') });
  const option = {
    id: 'past-option',
    date: '2026-10-17',
    position: 0,
    count: 0,
    voters: [] as (typeof person)[],
  };
  let consultation = {
    ...item('archived-open', '2026-10-17', 'open'),
    type: 'date',
    createdAt: '2026-10-01T12:00:00+02:00',
    options: [option],
  };
  let edited = false;
  let votes = 0;
  await page.route(listUrl, (route) =>
    route.fulfill({
      json: edited
        ? consultationListFixture([{ ...consultation, effectiveDate: '2026-10-01' }], [], today)
        : { ...consultationListFixture([], [], today), archivedCursor: 'past-open' },
    }),
  );
  await page.route(/\/api\/teams\/current\/consultations\?archivedCursor=/, (route) =>
    route.fulfill({
      json: {
        archived: [consultation],
        archivedCursor: null,
        listContext: consultationListFixture([], [], today).listContext,
      },
    }),
  );
  await page.route('**/api/teams/current/consultations/archived-open', async (route) => {
    if (route.request().method() === 'PATCH') {
      const body = route.request().postDataJSON();
      expect(body.optionChanges.remove).toEqual([]);
      expect(body.optionChanges.add).toHaveLength(1);
      expect(body.optionChanges.add[0].date).toBe(today);
      consultation = {
        ...consultation,
        options: [
          ...consultation.options,
          { id: body.optionChanges.add[0].id, date: today, position: 1, count: 0, voters: [] },
        ],
      };
      edited = true;
      return route.fulfill({ json: { consultation, expiresAt: team.expiresAt } });
    }
    return route.fulfill({ json: consultation });
  });
  await page.route('**/api/teams/current/consultations/archived-open/votes/**', (route) => {
    votes += 1;
    consultation = { ...consultation, options: [{ ...option, count: 1, voters: [person] }] };
    return route.fulfill({ json: { consultation, expiresAt: team.expiresAt } });
  });
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.route('**/api/teams/current/events/calendar**', (route) =>
    route.fulfill({ json: { events: [] } }),
  );
  await page.goto('/e/consultas#t=listing-token');
  await page.getByRole('button', { name: 'Cargar más' }).click();
  await page.getByRole('button', { name: /Consulta archived-open/ }).click();
  await page.getByRole('checkbox').check();
  await expect.poll(() => votes).toBe(1);
  await page.getByRole('button', { name: 'Acciones de la consulta' }).click();
  await expect(page.getByRole('button', { name: 'Resolver consulta', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Editar consulta', exact: true }).click();
  const editor = page.getByRole('dialog', { name: 'Editar consulta' });
  await editor.locator(`[data-date="${today}"]`).click();
  await editor.getByRole('button', { name: 'Guardar consulta' }).click();
  await expect(editor).toBeHidden();
  await page.getByRole('button', { name: '← Volver a Consultas' }).click();
  await expect(
    page.locator('section[aria-labelledby="active-heading"] .consultation-card'),
  ).toHaveCount(1);
  await expect(page.getByRole('heading', { name: 'Archivadas', exact: true })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Cargar más' })).toHaveCount(0);
});

test('volver de una tarjeta antigua reinicia la ventana y devuelve foco a crear si ya no está cargada', async ({
  page,
}) => {
  await install(page);
  const old = item('older-focus', '2026-10-17');
  const initial = { ...consultationListFixture([], [], today), archivedCursor: 'older-focus' };
  await page.route(listUrl, (route) =>
    route.fulfill({
      json: new URL(route.request().url()).searchParams.has('archivedCursor')
        ? { archived: [old], archivedCursor: null, listContext: initial.listContext }
        : initial,
    }),
  );
  await page.route('**/api/teams/current/consultations/older-focus', (route) =>
    route.fulfill({ json: old }),
  );
  await page.goto('/e/consultas#t=listing-token');
  await page.getByRole('button', { name: 'Cargar más' }).press('Enter');
  const card = page.getByRole('button', { name: /Consulta older-focus/ });
  await card.press('Enter');
  await expect(page.getByRole('heading', { name: old.title, exact: true })).toBeVisible();
  await page.getByRole('button', { name: '← Volver a Consultas' }).press('Enter');
  await expect(card).toHaveCount(0);
  await expect(
    page.locator('.section-heading').getByRole('button', { name: /Crear consulta/ }),
  ).toBeFocused();
  await expect(page.getByRole('button', { name: 'Cargar más' })).toBeVisible();
});
