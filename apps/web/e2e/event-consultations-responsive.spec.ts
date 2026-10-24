import { consultationListFixture } from './fixtures/consultation-list';
import { eventListFixture } from './fixtures/event-list';
import { expect, test, type Locator, type Page } from '@playwright/test';

// Focused responsive smoke for the event/consultation linking controls. This is
// presentation evidence only and does not claim WCAG conformance.
const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 769, height: 1024 },
  { width: 1280, height: 800 },
];
const team = {
  id: 'evt-responsive-team',
  name: 'Equipo responsive de eventos',
  timeZone: 'Europe/Madrid',
  expiresAt: '2099-01-01T00:00:00Z',
  participants: [{ id: 'evt-responsive-person', name: 'Ana' }],
};
const consultation = {
  id: 'evt-responsive-consultation',
  type: 'date',
  title: '¿Cuándo hacemos la excursión?',
  state: 'open',
  createdAt: '2026-10-18T12:00:00Z',
  createdBy: team.participants[0],
  options: [
    { id: 'evt-responsive-option-1', date: '2026-10-20', position: 0, count: 0, voters: [] },
    { id: 'evt-responsive-option-2', date: '2026-10-21', position: 1, count: 0, voters: [] },
  ],
};
const event = {
  openConsultationId: consultation.id,
  id: 'evt-responsive-event',
  title: 'Excursión del equipo',
  date: null,
  effectiveDate: '2026-10-18',
  status: 'provisional',
  version: 1,
  notes: null,
  createdBy: team.participants[0],
  createdAt: '2026-10-18T12:00:00Z',
  lastModifiedAt: null,
  lastModifiedBy: null,
  consultations: [
    {
      id: consultation.id,
      title: consultation.title,
      state: 'open',
    },
  ],
};
const rejectedEvent = {
  ...event,
  id: 'evt-responsive-rejected-event',
  title: 'Plan cancelado',
  status: 'rejected',
  consultations: [],
};
const linkedConsultation = {
  ...consultation,
  event: { id: event.id, title: event.title, status: 'provisional', date: null, version: 1 },
};
const closedConsultation = {
  ...consultation,
  state: 'resolved',
  event: { id: event.id, title: event.title, status: 'provisional', date: null, version: 1 },
  resolution: {
    participant: team.participants[0],
    resolvedAt: '2026-10-18T13:00:00Z',
    acceptedOptionIds: ['evt-responsive-option-1'],
  },
};

async function installFixture(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.addInitScript(
    ({ teamId, preference }) => {
      localStorage.setItem(`synqo-participant-${teamId}`, 'evt-responsive-person');
      localStorage.setItem('synqo:theme', preference);
    },
    { teamId: team.id, preference: theme },
  );
  await page.route('**/api/configuration', (route) =>
    route.fulfill({ json: { teamCreationEmailMode: 'hidden' } }),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: consultationListFixture() }),
  );
  await page.route('**/api/teams/current/consultations/evt-responsive-consultation', (route) =>
    route.fulfill({ json: consultation }),
  );
}

async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
    .toBeLessThanOrEqual(1);
}

async function assertReachable(
  page: Page,
  role: 'button' | 'link' | 'switch',
  name: string,
): Promise<void> {
  const control = page.getByRole(role, { name });
  await expect(control).toBeVisible();
  await expect(control).toBeEnabled();
  await control.scrollIntoViewIfNeeded();
  const bounds = await control.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: innerWidth,
      height: innerHeight,
    };
  });
  expect(bounds.left).toBeGreaterThanOrEqual(-1);
  expect(bounds.right).toBeLessThanOrEqual(bounds.width + 1);
  expect(bounds.bottom).toBeGreaterThan(0);
  expect(bounds.top).toBeLessThan(bounds.height);
}

async function openActions(page: Page, name: string) {
  const trigger = page.getByRole('button', { name });
  await assertReachable(page, 'button', name);
  await trigger.focus();
  await page.keyboard.press('Enter');
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  const controls = await trigger.getAttribute('aria-controls');
  expect(controls).toBeTruthy();
  const group = page.locator(`[id="${controls}"]`);
  await expect(group).toBeVisible();
  await expect(group.getByRole('menu')).toHaveCount(0);
  return { trigger, group };
}

async function assertAligned(first: Locator, second: Locator, tolerance = 3): Promise<void> {
  const [firstCenter, secondCenter] = await Promise.all([
    first.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.top + bounds.height / 2;
    }),
    second.evaluate((element) => {
      const bounds = element.getBoundingClientRect();
      return bounds.top + bounds.height / 2;
    }),
  ]);
  expect(Math.abs(firstCenter - secondCenter)).toBeLessThanOrEqual(tolerance);
}

for (const viewport of viewports) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`event consultation smoke ${viewport.width}x${viewport.height} ${theme}`, () => {
      test.use({ viewport });

      test('shows retry and empty states, and returns keyboard focus when dialogs close', async ({
        page,
      }) => {
        let detailRequests = 0;
        await installFixture(page, theme);
        await page.route(
          '**/api/teams/current/consultations/evt-responsive-consultation',
          (route) => {
            detailRequests += 1;
            if (detailRequests === 1) return route.fulfill({ status: 500, json: { status: 500 } });
            return route.fulfill({ json: consultation });
          },
        );

        let eventsRequests = 0;
        let releaseFirstEvents!: () => void;
        const firstEvents = new Promise<void>((resolve) => (releaseFirstEvents = resolve));
        await page.route('**/api/teams/current/events', async (route) => {
          eventsRequests += 1;
          if (eventsRequests === 1) {
            await firstEvents;
            return route.fulfill({ status: 500, json: { status: 500 } });
          }
          return route.fulfill({ json: eventListFixture() });
        });

        await page.goto('/e/consultas/evt-responsive-consultation#t=evt-responsive-token');
        expect(await page.locator('html').getAttribute('data-theme')).toBe(theme);
        await expect(page.getByRole('alert')).toContainText('No se pudo cargar la consulta.');
        const detailRetry = page.getByRole('button', { name: 'Reintentar' });
        await assertReachable(page, 'button', 'Reintentar');
        await detailRetry.focus();
        await page.keyboard.press('Enter');
        await expect(page.getByRole('heading', { name: consultation.title })).toBeVisible();

        const consultationActions = await openActions(page, 'Acciones de la consulta');
        const chooseEvent = consultationActions.group.getByRole('button', {
          name: 'Elegir evento',
        });
        await assertReachable(page, 'button', 'Elegir evento');
        await chooseEvent.focus();
        await page.keyboard.press('Enter');
        const linkDialog = page.getByRole('dialog', { name: 'Evento vinculado' });
        await expect(linkDialog.getByRole('status')).toContainText('Cargando eventos…');
        releaseFirstEvents();
        await expect(linkDialog.getByRole('alert')).toContainText(
          'No se pudieron cargar los eventos.',
        );
        const selectorRetry = linkDialog.getByRole('button', { name: 'Reintentar' });
        await selectorRetry.focus();
        await page.keyboard.press('Enter');
        await expect(
          linkDialog.getByText('No hay eventos elegibles. Puedes continuar sin vínculo.'),
        ).toBeVisible();
        await assertNoHorizontalOverflow(page);
        await linkDialog.getByRole('button', { name: 'Cancelar' }).click();
        await expect(linkDialog).toBeHidden();
        await expect(consultationActions.trigger).toBeFocused();

        const resolutionActions = await openActions(page, 'Acciones de la consulta');
        const resolve = resolutionActions.group.getByRole('button', { name: 'Resolver consulta' });
        await assertReachable(page, 'button', 'Resolver consulta');
        await resolve.focus();
        await page.keyboard.press('Enter');
        const resolution = page.getByRole('dialog', { name: 'Resolver consulta' });
        await expect(resolution.getByRole('combobox')).toHaveCount(0);
        await expect(resolution.getByText(/Evento vinculado:/)).toHaveCount(0);
        await expect(resolution.getByText(/No hay eventos elegibles/)).toHaveCount(0);
        await assertNoHorizontalOverflow(page);
        await resolution.getByRole('button', { name: 'Cancelar' }).click();
        await expect(resolution).toBeHidden();
        await expect(resolutionActions.trigger).toBeFocused();
      });

      test('creation switch is keyboard reachable and reflows without horizontal overflow', async ({
        page,
      }) => {
        await installFixture(page, theme);
        await page.route('**/api/teams/current/availability**', (route) =>
          route.fulfill({ json: { days: [] } }),
        );
        await page.route('**/api/teams/current/events/calendar**', (route) =>
          route.fulfill({ json: { events: [] } }),
        );
        await page.route('**/api/teams/current/events', (route) =>
          route.fulfill({ json: eventListFixture() }),
        );

        await page.goto('/e/calendario#t=evt-responsive-token');
        expect(await page.locator('html').getAttribute('data-theme')).toBe(theme);
        const trigger = page.getByRole('button', { name: 'Crear consulta de fechas' });
        await trigger.focus();
        await page.keyboard.press('Enter');
        const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
        await expect(editor).toBeVisible();
        await expect(editor.getByRole('textbox', { name: 'Título breve' })).toBeFocused();
        const createSwitch = editor.getByRole('switch', { name: 'Crear evento provisional' });
        await expect(createSwitch).not.toBeChecked();
        await assertReachable(page, 'switch', 'Crear evento provisional');
        await createSwitch.focus();
        await page.keyboard.press('Space');
        await expect(createSwitch).toBeChecked();
        await expect(createSwitch).toBeFocused();
        await assertNoHorizontalOverflow(page);
        await page.keyboard.press('Space');
        await expect(createSwitch).not.toBeChecked();
        await assertNoHorizontalOverflow(page);
      });

      test('cancels linked-event rejection by keyboard and restores focus without a PUT', async ({
        page,
      }) => {
        await installFixture(page, theme);
        await page.route('**/api/teams/current/events/evt-responsive-event', (route) =>
          route.fulfill({ json: { event } }),
        );
        let rejectionRequests = 0;
        await page.route('**/api/teams/current/events/evt-responsive-event/rejection', (route) => {
          rejectionRequests += 1;
          return route.fulfill({ json: { event, expiresAt: team.expiresAt } });
        });

        await page.goto('/e/eventos/evt-responsive-event#t=evt-responsive-token');
        await expect(page.getByRole('heading', { name: event.title })).toBeVisible();
        const eyebrow = page.getByText('Detalle del evento', { exact: true });
        const title = page.getByRole('heading', { name: event.title });
        const badge = page.getByText('Provisional', { exact: true });
        const initialMenu = await openActions(page, 'Acciones del evento');
        const opener = initialMenu.trigger;
        await assertAligned(eyebrow, opener);
        await assertAligned(title, badge);
        await assertNoHorizontalOverflow(page);

        await page.keyboard.press('Tab');
        await expect(
          initialMenu.group.getByRole('button', { name: 'Editar evento' }),
        ).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(
          initialMenu.group.getByRole('button', { name: 'Rechazar evento' }),
        ).toBeFocused();
        await page.keyboard.press('Tab');
        const relatedConsultation = page.getByRole('link', { name: consultation.title });
        await expect(relatedConsultation).toBeFocused();
        await page.keyboard.press('Escape');
        await expect(opener).toHaveAttribute('aria-expanded', 'false');
        await expect(opener).toBeFocused();
        await opener.click();
        await expect(opener).toHaveAttribute('aria-expanded', 'true');
        await eyebrow.click();
        await expect(opener).toHaveAttribute('aria-expanded', 'false');
        expect(rejectionRequests).toBe(0);

        const openMenu = await openActions(page, 'Acciones del evento');
        await page.keyboard.press('Tab');
        await expect(openMenu.group.getByRole('button', { name: 'Editar evento' })).toBeFocused();
        await page.keyboard.press('Tab');
        await expect(openMenu.group.getByRole('button', { name: 'Rechazar evento' })).toBeFocused();
        await page.keyboard.press('Enter');

        const dialog = page.getByRole('dialog', { name: '¿Rechazar este evento?' });
        const disposition = dialog.getByLabel('Consulta abierta');
        await expect(disposition.locator('option')).toHaveCount(2);
        await expect(disposition).toHaveValue('unlink');
        await expect(disposition.locator('option').nth(0)).toHaveText(
          'Rechazar evento y desvincular consulta',
        );
        await expect(disposition.locator('option').nth(1)).toHaveText('Rechazar evento y consulta');
        await disposition.focus();
        await page.keyboard.press('ArrowDown');
        await expect(disposition).toHaveValue('reject_both');
        await page.keyboard.press('ArrowUp');
        await expect(disposition).toHaveValue('unlink');
        await page.keyboard.press('Escape');

        await expect(dialog).toBeHidden();
        await expect(openMenu.trigger).toBeFocused();
        expect(rejectionRequests).toBe(0);
        await assertNoHorizontalOverflow(page);
      });

      test('shows available actions by event and consultation state', async ({ page }) => {
        await installFixture(page, theme);
        await page.route('**/api/teams/current/events/evt-responsive-event', (route) =>
          route.fulfill({ json: { event } }),
        );
        await page.route('**/api/teams/current/events/evt-responsive-rejected-event', (route) =>
          route.fulfill({ json: { event: rejectedEvent } }),
        );

        await page.goto('/e/eventos/evt-responsive-event#t=evt-responsive-token');
        const activeMenu = await openActions(page, 'Acciones del evento');
        await expect(activeMenu.group.getByRole('button', { name: 'Editar evento' })).toBeVisible();
        await expect(
          activeMenu.group.getByRole('button', { name: 'Rechazar evento' }),
        ).toBeVisible();
        await expect(
          activeMenu.group.getByRole('button', { name: 'Recuperar evento' }),
        ).toHaveCount(0);

        await page.goto('/e/eventos/evt-responsive-rejected-event#t=evt-responsive-token');
        const rejectedMenu = await openActions(page, 'Acciones del evento');
        await expect(
          rejectedMenu.group.getByRole('button', { name: 'Recuperar evento' }),
        ).toBeVisible();
        await expect(rejectedMenu.group.getByRole('button', { name: 'Editar evento' })).toHaveCount(
          0,
        );
        await expect(
          rejectedMenu.group.getByRole('button', { name: 'Rechazar evento' }),
        ).toHaveCount(0);

        await page.goto('/e/consultas/evt-responsive-consultation#t=evt-responsive-token');
        const consultationMenu = await openActions(page, 'Acciones de la consulta');
        await expect(
          consultationMenu.group.getByRole('button', { name: 'Resolver consulta' }),
        ).toBeVisible();
        await expect(
          consultationMenu.group.getByRole('button', { name: 'Elegir evento' }),
        ).toBeVisible();

        await page.route(
          '**/api/teams/current/consultations/evt-responsive-consultation',
          (route) => route.fulfill({ json: linkedConsultation }),
        );
        await page.reload();
        const linkedMenu = await openActions(page, 'Acciones de la consulta');
        await expect(
          linkedMenu.group.getByRole('button', { name: 'Cambiar evento' }),
        ).toBeVisible();
        await expect(
          linkedMenu.group.getByRole('button', { name: 'Quitar vínculo' }),
        ).toBeVisible();

        await page.route(
          '**/api/teams/current/consultations/evt-responsive-consultation',
          (route) => route.fulfill({ json: closedConsultation }),
        );
        await page.reload();
        await expect(page.getByRole('link', { name: event.title })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Resolver consulta' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Elegir evento' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Cambiar evento' })).toHaveCount(0);
        await expect(page.getByRole('button', { name: 'Quitar vínculo' })).toHaveCount(0);
        await assertNoHorizontalOverflow(page);
      });
    });
  }
}
