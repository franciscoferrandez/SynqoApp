import { expect, test } from '@playwright/test';

async function createTeam(page: import('@playwright/test').Page) {
  const marks = new Map<string, { participantId: string; state: string }>();
  let failNextWrite = false;
  await page.route('**/api/teams/current/availability**', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      const url = new URL(request.url());
      const from = new Date(`${url.searchParams.get('from')}T12:00:00Z`);
      const to = new Date(`${url.searchParams.get('to')}T12:00:00Z`);
      const days = [];
      for (const date = new Date(from); date <= to; date.setUTCDate(date.getUTCDate() + 1)) {
        const key = date.toISOString().slice(0, 10);
        const mark = marks.get(key);
        const counts = { available: 0, maybe: 0, unavailable: 0 };
        if (mark) counts[mark.state as keyof typeof counts] = 1;
        days.push({
          date: key,
          state: mark?.state ?? null,
          counts,
          marks: mark ? [{ ...mark, participantName: 'Ana' }] : [],
        });
      }
      await route.fulfill({ json: { days } });
      return;
    }
    if (request.method() === 'PUT') {
      if (failNextWrite) {
        failNextWrite = false;
        await route.fulfill({ status: 500, contentType: 'application/problem+json', body: '{}' });
        return;
      }
      const url = new URL(request.url());
      const [, date, participantId] = url.pathname.match(
        /availability\/(\d{4}-\d{2}-\d{2})\/participants\/([^/]+)$/,
      )!;
      const { state } = request.postDataJSON() as { state: string | null };
      if (state) marks.set(date, { participantId, state });
      else marks.delete(date);
      const mark = marks.get(date);
      const counts = { available: 0, maybe: 0, unavailable: 0 };
      if (mark) counts[mark.state as keyof typeof counts] = 1;
      await route.fulfill({
        json: {
          day: {
            date,
            state: mark?.state ?? null,
            counts,
            marks: mark ? [{ ...mark, participantName: 'Ana' }] : [],
          },
          expiresAt: '2027-01-05T00:00:00+00:00',
        },
      });
    }
  });
  await page.goto('/');
  const name = `Disponibilidad ${Date.now()}`;
  await page.locator('#team-name').fill(name);
  await page.locator('#participant-name').fill('Ana');
  await page.locator('#participant-name').press('Enter');
  await expect(page.getByRole('heading', { name: new RegExp(name) })).toBeVisible();
  const accessUrl = (await page.locator('[data-access-url]').textContent())!.trim();
  await page.getByRole('link', { name: /Ver el calendario del equipo/ }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Disponibilidad del equipo' })).toBeVisible();
  await expect(page.locator('.calendar-day.today')).toBeVisible();
  return { accessUrl, failNextWrite: () => (failNextWrite = true) };
}

function futureDate(today: string, offset = 3): string {
  const date = new Date(`${today}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + offset);
  return date.toISOString().slice(0, 10);
}

test('shows distinct keyboard focus and selection on the selected day', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('synqo-participant-focus-team', 'focus-person');
  });
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      json: {
        id: 'focus-team',
        name: 'Equipo de foco',
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [{ id: 'focus-person', name: 'Ana' }],
      },
    }),
  );
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );

  await page.goto('/e/calendario#t=focus-token');
  const selectedDay = page.locator('.calendar-day.today');
  await expect(selectedDay).toHaveAttribute('aria-pressed', 'true');

  await selectedDay.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(selectedDay).toBeFocused();

  const focusStyles = await selectedDay.evaluate((element) => {
    const styles = getComputedStyle(element);
    const focusProbe = document.createElement('span');
    focusProbe.style.color = 'var(--focus)';
    document.body.append(focusProbe);
    const focusColor = getComputedStyle(focusProbe).color;
    focusProbe.remove();
    return {
      outlineStyle: styles.outlineStyle,
      outlineWidth: styles.outlineWidth,
      outlineOffset: styles.outlineOffset,
      outlineColor: styles.outlineColor,
      boxShadow: styles.boxShadow,
      focusColor,
    };
  });
  expect(focusStyles.outlineStyle).toBe('solid');
  expect(focusStyles.outlineWidth).toBe('3px');
  expect(focusStyles.outlineOffset).toBe('3px');
  expect(focusStyles.outlineColor).toBe(focusStyles.focusColor);
  expect(focusStyles.boxShadow).toContain('inset');
});

test('marks today and reads the confirmed state after reloading the team link', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#team-name').fill(`Disponibilidad ${Date.now()}`);
  await page.locator('#participant-name').fill('Ana');
  await page.locator('#participant-name').press('Enter');
  await expect(page.getByRole('heading', { name: /Disponibilidad \d+/ })).toBeVisible();
  const accessUrl = (await page.locator('[data-access-url]').textContent())!.trim();
  await page.getByRole('link', { name: /Ver el calendario del equipo/ }).press('Enter');

  const today = page.locator('.calendar-day.today');
  await expect(today).toBeVisible();
  const date = await today.getAttribute('data-date');
  await today.press('Enter');
  const available = page.locator('.calendar-detail .state-row.available');
  await expect(available).toContainText('Nadie');
  await available.press('Enter');
  await expect(available).toContainText('Tú');
  await expect(available).toContainText('1');

  await page.goto(accessUrl);
  await expect(page.locator(`.calendar-day[data-date="${date}"]`)).toHaveClass(/available/);
  await page.locator(`.calendar-day[data-date="${date}"]`).press('Enter');
  await expect(page.locator('.calendar-detail .state-row.available')).toContainText('Tú');
});

test('edits and removes a mark with the active option, and switches calendar scope', async ({
  page,
}) => {
  await createTeam(page);
  const today = await page.locator('.calendar-day.today').getAttribute('data-date');
  const date = futureDate(today!);
  const day = page.locator(`.calendar-day[data-date="${date}"]`);
  await day.press('Enter');

  const detail = page.locator('.calendar-detail');
  const available = detail.getByRole('button', { name: /Disponible ·/ });
  const maybe = detail.getByRole('button', { name: /Quizá ·/ });
  await available.press('Enter');
  await expect(day).toHaveClass(/available/);
  await expect(available).toContainText('Tú');
  await expect(available).toHaveAttribute('aria-pressed', 'true');

  await maybe.press('Enter');
  await expect(day).toHaveClass(/maybe/);
  await expect(maybe).toContainText('Tú');
  await expect(available).toContainText('Nadie');

  await maybe.press('Enter');
  await expect(day).not.toHaveClass(/maybe|available|unavailable/);
  await expect(maybe).toContainText('Nadie');

  await detail.getByRole('button', { name: /Disponible ·/ }).press('Enter');
  await page.getByRole('button', { name: 'Mi disponibilidad' }).press('Enter');
  await expect(day).toHaveClass(/available/);
  await expect(page.getByRole('heading', { name: 'Mi disponibilidad' })).toBeVisible();
  await page.getByRole('button', { name: 'Disponibilidad del equipo' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Disponibilidad del equipo' })).toBeVisible();
  await expect(detail.getByRole('button', { name: /Disponible ·/ })).toContainText('Tú');
});

test('keeps shared counts and places the active identity first in its detail group', async ({
  browser,
  page,
}) => {
  await page.goto('/');
  const origin = new URL(page.url()).origin;
  const createdResponse = await page.request.post(`${origin}/api/teams`, {
    data: { name: `Resumen ${Date.now()}`, firstParticipantName: 'Ana', timeZone: 'UTC' },
  });
  expect(createdResponse.status()).toBe(201);
  const created = (await createdResponse.json()) as {
    id: string;
    firstParticipant: { id: string };
    accessUrl: string;
  };
  const token = new URL(created.accessUrl).hash.slice(3);
  const headers = { Authorization: `Bearer ${token}` };
  const addedResponse = await page.request.post(`${origin}/api/teams/current/participants`, {
    headers,
    data: { name: 'Bea' },
  });
  expect(addedResponse.status()).toBe(201);
  const added = (await addedResponse.json()) as { participant: { id: string } };
  const unmarkedResponse = await page.request.post(`${origin}/api/teams/current/participants`, {
    headers,
    data: { name: 'Carlos' },
  });
  expect(unmarkedResponse.status()).toBe(201);

  await page.evaluate(
    ({ teamId, participantId }) =>
      localStorage.setItem(`synqo-participant-${teamId}`, participantId),
    { teamId: created.id, participantId: created.firstParticipant.id },
  );
  await page.goto(created.accessUrl);
  await expect(page.getByRole('heading', { name: 'Disponibilidad del equipo' })).toBeVisible();
  const date = await page.locator('.calendar-day.today').getAttribute('data-date');
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  for (const participantId of [created.firstParticipant.id, added.participant.id]) {
    const response = await page.request.put(
      `${origin}/api/teams/current/availability/${date}/participants/${participantId}`,
      { headers, data: { state: 'available', timeZone: zone } },
    );
    expect(response.status()).toBe(200);
  }

  await page.reload();
  await page.locator(`.calendar-day[data-date="${date}"]`).press('Enter');
  const available = page.locator('.calendar-detail .state-row.available');
  await expect(available).toContainText('Disponible · 2');
  await expect(available.locator('.names')).toHaveText(/Tú\s*,\s*Bea/);

  const otherContext = await browser.newContext();
  try {
    const otherPage = await otherContext.newPage();
    await otherPage.goto('/');
    await otherPage.evaluate(
      ({ teamId, participantId }) =>
        localStorage.setItem(`synqo-participant-${teamId}`, participantId),
      { teamId: created.id, participantId: added.participant.id },
    );
    await otherPage.goto(created.accessUrl);
    await expect(otherPage.locator('[data-identity-trigger]')).toContainText('Bea');
    await otherPage.locator(`.calendar-day[data-date="${date}"]`).press('Enter');
    const otherAvailability = otherPage.locator('.calendar-detail .state-row.available');
    await expect(otherAvailability).toContainText('Disponible · 2');
    await expect(otherAvailability.locator('.names')).toHaveText(/Tú\s*,\s*Ana/);
    await expect(otherAvailability.locator('.names')).not.toContainText('Carlos');
    await expect(otherAvailability).toHaveAttribute('aria-pressed', 'true');
  } finally {
    await otherContext.close();
  }
});

test('navigates months, shows complete Monday-to-Sunday weeks, and returns to today', async ({
  page,
}) => {
  await createTeam(page);
  const monthHeading = page.locator('.monthbar h3');
  const initialMonth = await monthHeading.textContent();
  await page.getByRole('button', { name: 'Mes siguiente' }).press('Enter');
  await expect(monthHeading).not.toHaveText(initialMonth!);
  await expect(page.getByRole('button', { name: 'Volver a hoy' })).toBeVisible();

  await page.getByRole('button', { name: 'Semanas completas' }).press('Enter');
  await expect(page.getByRole('button', { name: 'Semanas completas' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  const dates = await page
    .locator('.calendar-day')
    .evaluateAll((days) => days.map((day) => day.getAttribute('data-date')!));
  expect(dates.length % 7).toBe(0);
  expect(new Date(`${dates[0]}T12:00:00Z`).getUTCDay()).toBe(1);
  expect(new Date(`${dates.at(-1)}T12:00:00Z`).getUTCDay()).toBe(0);
  await page.getByRole('button', { name: 'Volver a hoy' }).press('Enter');
  await expect(monthHeading).toHaveText(initialMonth!);
  await expect(page.locator('.calendar-day.today')).toBeVisible();
  await page.getByLabel('Tema').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(monthHeading).toBeVisible();
});

test('opens the day detail as a mobile dialog and returns focus to its day', async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await createTeam(page);
  const day = page.locator('.calendar-day.today');
  await day.press('Enter');
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Cerrar detalle del día' }).press('Enter');
  await expect(dialog).toBeHidden();
  await expect(day).toBeFocused();
  const lastPastDay = new Date(`${await day.getAttribute('data-date')}T12:00:00Z`);
  lastPastDay.setUTCDate(0);
  const pastDate = lastPastDay.toISOString().slice(0, 10);
  await page.getByRole('button', { name: 'Mes anterior' }).press('Enter');
  await page.locator(`.calendar-day[data-date="${pastDate}"]`).press('Enter');
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole('button', { name: /Disponible ·/ })).toBeDisabled();
  await context.close();
});

test('restores the previous mark after a 500 response and retries the same action', async ({
  page,
}) => {
  const team = await createTeam(page);
  const today = await page.locator('.calendar-day.today').getAttribute('data-date');
  const date = futureDate(today!);
  const day = page.locator(`.calendar-day[data-date="${date}"]`);
  await day.press('Enter');
  const available = page.locator('.calendar-detail').getByRole('button', {
    name: /Disponible ·/,
  });
  team.failNextWrite();
  await available.press('Enter');
  await expect(page.getByRole('alert')).toContainText('Hemos recuperado la marca anterior');
  await expect(day).not.toHaveClass(/available/);
  await expect(available).toContainText('Nadie');
  await page.getByRole('button', { name: 'Reintentar' }).press('Enter');
  await expect(day).toHaveClass(/available/);
  await expect(available).toContainText('Tú');
  await expect(page.getByRole('status').last()).toHaveText('Disponibilidad guardada.');
});
