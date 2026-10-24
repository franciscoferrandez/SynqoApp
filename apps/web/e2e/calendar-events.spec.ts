import { consultationListFixture } from './fixtures/consultation-list';
import { expect, test } from '@playwright/test';

const team = {
  id: 'calendar-events-team',
  name: 'Equipo calendario',
  timeZone: 'Europe/Madrid',
  expiresAt: '2027-01-01T00:00:00Z',
  participants: [{ id: 'calendar-participant', name: 'Ana' }],
};

const availability = {
  days: [
    {
      date: '2026-10-14',
      state: 'available',
      summaryStates: { worst: 'available', median: 'available', mostFrequent: 'available' },
      counts: { available: 1, maybe: 0, unavailable: 0 },
      marks: [
        { participantId: 'calendar-participant', participantName: 'Ana', state: 'available' },
      ],
    },
  ],
};

const events = [
  { id: 'calendar-event-one', date: '2026-10-14', title: 'Ensayo', status: 'provisional' },
  { id: 'calendar-event-two', date: '2026-10-14', title: 'Concierto', status: 'definitive' },
];

async function openCalendar(page: import('@playwright/test').Page): Promise<void> {
  await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-calendar-events-team', 'calendar-participant'),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: availability }),
  );
  await page.route('**/api/teams/current/events/calendar**', (route) =>
    route.fulfill({ json: { events } }),
  );
  await page.route('**/api/teams/current/events', (route) =>
    route.fulfill({ json: { unfinalized: [], future: [], past: [], rejected: [] } }),
  );
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: consultationListFixture() }),
  );
  await page.route('**/api/teams/current/events/calendar-event-one', (route) =>
    route.fulfill({ json: { event: { ...events[0], notes: null } } }),
  );
  await page.route('**/api/teams/current/events/calendar-event-two', (route) =>
    route.fulfill({ json: { event: { ...events[1], notes: null } } }),
  );
  await page.goto('/e/calendario#t=calendar-events-token');
  await expect(page.getByRole('heading', { name: 'Disponibilidad del equipo' })).toBeVisible();
}

test('shows event indicator, count, availability and event detail on desktop', async ({ page }) => {
  await openCalendar(page);

  const day = page.locator('.calendar-day[data-date="2026-10-14"]');
  await expect(day).toHaveAttribute('aria-label', /2 eventos/);
  await expect(day.locator('.calendar-event-indicator')).toHaveText('♧ 2');
  await day.click();
  await expect(page.locator('.calendar-detail .calendar-events')).toBeVisible();
  const detail = page.locator('.calendar-detail');
  await expect(detail.locator('.calendar-events-list')).toContainText('Ensayo');
  await expect(detail.locator('.calendar-events-list')).toContainText('Provisional');
  await expect(detail.locator('.calendar-events-list')).toContainText('Concierto');
  await expect(detail.locator('.calendar-events-list')).toContainText('Definitivo');
  await expect(page.locator('.calendar-detail .state-row.available')).toContainText('Tú');

  await page.getByRole('button', { name: 'Ensayo Provisional' }).click();
  await expect(page).toHaveURL(/\/e\/eventos\/calendar-event-one#t=calendar-events-token/);
  await expect(page.getByRole('heading', { name: 'Ensayo' })).toBeVisible();
});

test('keeps availability visible and retries only events after an event load failure', async ({
  page,
}) => {
  let eventAttempts = 0;
  await page.addInitScript(() =>
    localStorage.setItem('synqo-participant-calendar-events-team', 'calendar-participant'),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: availability }),
  );
  await page.route('**/api/teams/current/events/calendar**', (route) => {
    eventAttempts++;
    return route.fulfill(
      eventAttempts === 1 ? { status: 500, json: { status: 500 } } : { json: { events } },
    );
  });
  await page.goto('/e/calendario#t=calendar-events-token');
  await expect(page.locator('.calendar-detail .state-row.available')).toBeVisible();
  await expect(page.getByRole('alert')).toContainText('No se pudieron cargar los eventos');
  await page.getByRole('button', { name: 'Reintentar eventos' }).click();
  await expect(page.locator('.calendar-event-indicator')).toHaveCount(1);
  await page.locator('.calendar-day[data-date="2026-10-14"]').click();
  await expect(page.locator('.calendar-detail .calendar-events')).toBeVisible();
  expect(eventAttempts).toBe(2);
});

test('shows the same event detail inside the mobile dialog', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openCalendar(page);
  await page.locator('.calendar-day[data-date="2026-10-14"]').click();
  const dialog = page.locator('dialog.availability-dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('.calendar-events')).toBeVisible();
  await expect(dialog.locator('.calendar-events-list')).toContainText('Ensayo');
  await expect(dialog.locator('.state-row.available')).toContainText('Tú');
});

test('shows event bells in the date dialog without preselecting the open day', async ({ page }) => {
  await openCalendar(page);
  const mainCalendar = page.locator('.calendar-panel');
  const openDay = mainCalendar.locator('.calendar-day[data-date="2026-10-14"]');
  await openDay.click();
  await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
  const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
  const day = editor.locator('.calendar-day[data-date="2026-10-14"]');
  await expect(day.locator('.date-event-bell')).toHaveCount(1);
  await expect(day).toHaveAttribute('aria-label', /tiene evento/i);
  await expect(editor.locator('.calendar-day[aria-pressed="true"]')).toHaveCount(0);
  await expect(openDay).toHaveAttribute('aria-pressed', 'true');
  await day.click();
  await expect(day).toHaveAttribute('aria-pressed', 'true');
  await expect(day.locator('svg')).toHaveCount(1);
  await expect(day.locator('.date-event-bell')).toHaveCount(1);
});
