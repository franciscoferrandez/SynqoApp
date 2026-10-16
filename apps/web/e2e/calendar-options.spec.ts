import { expect, test } from '@playwright/test';

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 769, height: 1024 },
  { width: 1280, height: 800 },
];

for (const viewport of viewports) {
  test(`calendar options persist and overlay both views at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));
    await page.addInitScript(() => localStorage.setItem('synqo-participant-options-team', 'ana'));
    await page.route('**/api/teams/current', (route) =>
      route.fulfill({
        json: {
          id: 'options-team',
          name: 'Equipo de opciones',
          timeZone: 'Europe/Madrid',
          expiresAt: '2027-01-01T00:00:00Z',
          participants: [
            { id: 'ana', name: 'Ana' },
            { id: 'bea', name: 'Bea' },
          ],
        },
      }),
    );
    await page.route('**/api/teams/current/availability**', (route) =>
      route.fulfill({
        json: {
          days: [
            {
              date: '2026-10-13',
              state: 'available',
              summaryStates: { worst: 'available', median: 'available', mostFrequent: 'available' },
              counts: { available: 1, maybe: 0, unavailable: 0 },
              marks: [{ participantId: 'ana', participantName: 'Ana', state: 'available' }],
            },
            {
              date: '2026-10-14',
              state: 'unavailable',
              summaryStates: { worst: 'unavailable', median: 'maybe', mostFrequent: 'available' },
              counts: { available: 1, maybe: 0, unavailable: 1 },
              marks: [
                { participantId: 'ana', participantName: 'Ana', state: 'available' },
                { participantId: 'bea', participantName: 'Bea', state: 'unavailable' },
              ],
            },
          ],
        },
      }),
    );
    await page.goto('/e/calendario#t=options-token');
    const menu = page.getByRole('button', { name: 'Opciones de visualización' });
    const scope = page.getByRole('button', { name: 'Mi disponibilidad', exact: true });
    const createDate = page.getByRole('button', { name: 'Crear consulta de fechas' });
    const [scopeBox, createBox, menuBox] = await Promise.all([
      scope.boundingBox(),
      createDate.boundingBox(),
      menu.boundingBox(),
    ]);
    expect(scopeBox!.x + scopeBox!.width).toBeLessThan(createBox!.x);
    expect(createBox!.x + createBox!.width).toBeLessThan(menuBox!.x);
    expect(createBox!.y).toBe(menuBox!.y);
    await expect(menu).toHaveAttribute('aria-expanded', 'false');
    await menu.click();
    const weeks = page.getByRole('checkbox', { name: 'Ver semanas completas' });
    const overlay = page.getByRole('checkbox', { name: 'Superponer calendarios' });
    const counts = page.getByRole('checkbox', { name: 'Mostrar recuentos del equipo' });
    const worst = page.getByRole('radio', { name: 'Peor disponibilidad' });
    const median = page.getByRole('radio', { name: 'Mediana de las marcas' });
    const frequent = page.getByRole('radio', { name: 'Estado más frecuente' });
    await expect(weeks).not.toBeChecked();
    await expect(overlay).not.toBeChecked();
    await expect(counts).not.toBeChecked();
    await expect(worst).toBeChecked();
    await weeks.check();
    const dates = await page
      .locator('.calendar-day')
      .evaluateAll((days) => days.map((day) => day.getAttribute('data-date')!));
    expect(dates.length % 7).toBe(0);
    expect(new Date(`${dates[0]}T12:00:00Z`).getUTCDay()).toBe(1);
    expect(new Date(`${dates.at(-1)}T12:00:00Z`).getUTCDay()).toBe(0);
    const day = page.locator('.calendar-day[data-date="2026-10-14"]');
    const unmarkedDay = page.locator('.calendar-day[data-date="2026-10-15"]');
    await day.focus();
    await page.keyboard.press('Tab');
    await expect(unmarkedDay).toBeFocused();
    const plainFocus = await unmarkedDay.evaluate((element) => {
      const button = element.getBoundingClientRect();
      const ring = getComputedStyle(element, '::after');
      return {
        outlineStyle: ring.outlineStyle,
        outlineWidth: ring.outlineWidth,
        outlineOffset: ring.outlineOffset,
        ringBottom: button.bottom - Number.parseFloat(ring.bottom),
        buttonBottom: button.bottom,
      };
    });
    expect(plainFocus.outlineStyle).toBe('dashed');
    expect(plainFocus.ringBottom).toBeCloseTo(plainFocus.buttonBottom, 0);
    await overlay.check();
    await counts.check();
    await expect(day).toHaveAttribute('aria-pressed', 'true');
    const selectedOutline = await day.evaluate((element) => {
      const button = element.getBoundingClientRect();
      const underlay = element.querySelector('.calendar-underlay')!.getBoundingClientRect();
      const ring = getComputedStyle(element, '::after');
      return {
        borderStyle: ring.borderTopStyle,
        ringBottom: button.bottom - Number.parseFloat(ring.bottom),
        underlayBottom: underlay.bottom,
      };
    });
    expect(selectedOutline.borderStyle).toBe('solid');
    expect(selectedOutline.ringBottom).toBeCloseTo(selectedOutline.underlayBottom, 0);
    await expect(day.locator('.calendar-day-face .team-count')).toHaveText(['✓1', '?_', '×1']);
    const countSpacing = await day
      .locator('.calendar-day-face .team-counts')
      .evaluate((element) => {
        const children = [...element.querySelectorAll('.team-count')];
        const box = element.getBoundingClientRect();
        return {
          left: children[0].getBoundingClientRect().left - box.left,
          right: box.right - children[2].getBoundingClientRect().right,
          justify: getComputedStyle(element).justifyContent,
        };
      });
    expect(countSpacing.justify).toBe('space-between');
    expect(countSpacing.left).toBeLessThanOrEqual(2);
    expect(countSpacing.right).toBeLessThanOrEqual(2);
    await expect(day.locator('.team-count.result')).toHaveText('×1');
    await median.check();
    await expect(day.locator('.team-count.result')).toHaveText('?_');
    await expect(day).toHaveClass(/maybe/);
    await expect(day).toHaveAttribute('aria-label', /equipo: \? Quizá/);
    await frequent.check();
    await expect(day.locator('.team-count.result')).toHaveText('✓1');
    await expect(day).toHaveClass(/available/);
    await worst.check();
    await menu.click();
    await expect(day.locator('.calendar-underlay .status')).toContainText('Disp.');
    const [faceBox, underlayBox] = await Promise.all([
      day.locator('.calendar-day-face').boundingBox(),
      day.locator('.calendar-underlay').boundingBox(),
    ]);
    expect(underlayBox!.y).toBeGreaterThan(faceBox!.y);
    expect(underlayBox!.y).toBeLessThan(faceBox!.y + faceBox!.height);
    expect(underlayBox!.x).toBeCloseTo(faceBox!.x, 0);
    expect(underlayBox!.width).toBeCloseTo(faceBox!.width, 0);
    const underlayCorners = await day.locator('.calendar-underlay').evaluate((element) => {
      const style = getComputedStyle(element);
      return [style.borderTopLeftRadius, style.borderTopRightRadius, style.borderBottomLeftRadius];
    });
    expect(underlayCorners.slice(0, 2)).toEqual(['0px', '0px']);
    expect(underlayCorners[2]).not.toBe('0px');
    await expect(day).toHaveAttribute(
      'aria-label',
      /disponible 1.*no disponible 1.*marca propia:.*Disponible/,
    );
    await day.focus();
    await page.keyboard.press('Tab');
    await expect(unmarkedDay).toBeFocused();
    const focusOutline = await unmarkedDay.evaluate((element) => {
      const button = element.getBoundingClientRect();
      const underlay = element.querySelector('.calendar-underlay')!.getBoundingClientRect();
      const ring = getComputedStyle(element, '::after');
      return {
        outlineStyle: ring.outlineStyle,
        outlineWidth: ring.outlineWidth,
        outlineOffset: ring.outlineOffset,
        ringBottom: button.bottom - Number.parseFloat(ring.bottom),
        underlayBottom: underlay.bottom,
      };
    });
    expect(focusOutline.outlineStyle).toBe('dashed');
    expect(focusOutline.outlineWidth).toBe(plainFocus.outlineWidth);
    expect(focusOutline.outlineOffset).toBe(plainFocus.outlineOffset);
    expect(focusOutline.ringBottom).toBeCloseTo(focusOutline.underlayBottom, 0);
    await page.keyboard.press('Shift+Tab');
    await expect(day).toBeFocused();
    await expect(day).toHaveAttribute('aria-pressed', 'true');
    expect(await day.evaluate((element) => getComputedStyle(element, '::after').outlineStyle)).toBe(
      'dashed',
    );
    await expect(unmarkedDay.locator('.calendar-underlay')).toBeVisible();
    await expect(unmarkedDay.locator('.calendar-underlay .status')).toHaveText('·');
    await expect(unmarkedDay.locator('.calendar-day-face .team-count')).toHaveText([
      '✓_',
      '?_',
      '×_',
    ]);
    await expect(unmarkedDay).toHaveAttribute(
      'aria-label',
      /disponible 0, quizá 0, no disponible 0/,
    );
    expect(
      await page
        .locator('.calendar-day-face .team-counts')
        .evaluateAll(
          (items) => items.filter((item) => item.scrollWidth > item.clientWidth + 1).length,
        ),
    ).toBe(0);
    const pastDay = page.locator('.calendar-day[data-date="2026-10-13"]');
    const pastColors = await pastDay.evaluate((element) => ({
      main: getComputedStyle(element.querySelector('.calendar-day-face')!).backgroundColor,
      underlay: getComputedStyle(element.querySelector('.calendar-underlay')!).backgroundColor,
      ownVote: getComputedStyle(element.querySelector('.calendar-underlay .status')!).color,
      muted: getComputedStyle(document.querySelector('.calendar-legend')!).color,
    }));
    expect(pastColors.underlay).toBe(pastColors.main);
    expect(pastColors.ownVote).toBe(pastColors.muted);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));
    const darkPastColors = await pastDay.evaluate((element) => ({
      main: getComputedStyle(element.querySelector('.calendar-day-face')!).backgroundColor,
      underlay: getComputedStyle(element.querySelector('.calendar-underlay')!).backgroundColor,
      ownVote: getComputedStyle(element.querySelector('.calendar-underlay .status')!).color,
      muted: getComputedStyle(document.querySelector('.calendar-legend')!).color,
    }));
    expect(darkPastColors.underlay).toBe(darkPastColors.main);
    expect(darkPastColors.ownVote).toBe(darkPastColors.muted);
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await unmarkedDay.locator('.calendar-underlay').click();
    await expect(unmarkedDay).toHaveAttribute('aria-pressed', 'true');
    if (viewport.width <= 768) {
      await expect(page.locator('dialog.availability-dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Cerrar detalle del día' }).click();
    }
    await scope.click();
    await expect(day.locator('.calendar-underlay .team-count')).toHaveText(['✓1', '?_', '×1']);
    await expect(day.locator('.calendar-underlay .team-counts')).toHaveCSS(
      'justify-content',
      'space-between',
    );
    await expect(day.locator('.calendar-underlay .team-count.result')).toHaveText('×1');
    await expect(unmarkedDay.locator('.calendar-underlay .team-count')).toHaveText([
      '✓_',
      '?_',
      '×_',
    ]);
    expect(
      await page
        .locator('.calendar-underlay .team-counts')
        .evaluateAll(
          (items) => items.filter((item) => item.scrollWidth > item.clientWidth + 1).length,
        ),
    ).toBe(0);
    const [countedTab, neutralTab] = await Promise.all([
      day.locator('.calendar-underlay').boundingBox(),
      unmarkedDay.locator('.calendar-underlay').boundingBox(),
    ]);
    expect(countedTab!.height).toBe(neutralTab!.height);
    await expect(
      page.locator('.calendar-day[data-date="2026-10-15"] .calendar-underlay'),
    ).toBeVisible();
    await page.getByRole('button', { name: 'Disponibilidad del equipo' }).click();
    await expect(unmarkedDay.locator('.calendar-underlay')).toBeVisible();
    await menu.click();
    await counts.press('Escape');
    await expect(menu).toBeFocused();
    await page.reload();
    await menu.click();
    await expect(weeks).toBeChecked();
    await expect(overlay).toBeChecked();
    await expect(counts).toBeChecked();
    await expect(day.locator('.team-count.result')).toHaveText('×1');
    await page.getByRole('button', { name: 'Mes siguiente' }).click();
    await expect(page.getByRole('button', { name: 'Volver a hoy' })).toBeVisible();
    await page.getByRole('button', { name: 'Volver a hoy' }).click();
    await expect(weeks).toBeChecked();
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    await page.evaluate(() => (document.documentElement.style.fontSize = '200%'));
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
      .toBeLessThanOrEqual(1);
    await page.goto('/');
    await page.goto('/e/calendario#t=options-token');
    await menu.click();
    await expect(weeks).toBeChecked();
    await expect(overlay).toBeChecked();
    await expect(counts).toBeChecked();
  });
}

test('invalid local storage falls back without blocking the menu', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('synqo:calendar-view:v2', '{invalid');
    localStorage.setItem('synqo-participant-options-team', 'ana');
  });
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      json: {
        id: 'options-team',
        name: 'Equipo de opciones',
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [{ id: 'ana', name: 'Ana' }],
      },
    }),
  );
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.goto('/e/calendario#t=options-token');
  await page.getByRole('button', { name: 'Opciones de visualización' }).click();
  const overlay = page.getByRole('checkbox', { name: 'Superponer calendarios' });
  await expect(overlay).not.toBeChecked();
  await expect(page.getByRole('radio', { name: 'Peor disponibilidad' })).toBeChecked();
  await overlay.check();
  await expect(overlay).toBeChecked();
});

test('blocked local storage keeps options usable during the visit', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('synqo-participant-options-team', 'ana');
    const getItem = Storage.prototype.getItem;
    const setItem = Storage.prototype.setItem;
    Storage.prototype.getItem = function (key) {
      if (key === 'synqo:calendar-view:v1' || key === 'synqo:calendar-view:v2')
        throw new Error('Storage blocked');
      return getItem.call(this, key);
    };
    Storage.prototype.setItem = function (key, value) {
      if (key === 'synqo:calendar-view:v1' || key === 'synqo:calendar-view:v2')
        throw new Error('Storage blocked');
      return setItem.call(this, key, value);
    };
  });
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      json: {
        id: 'options-team',
        name: 'Equipo de opciones',
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [{ id: 'ana', name: 'Ana' }],
      },
    }),
  );
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.goto('/e/calendario#t=options-token');
  await page.getByRole('button', { name: 'Opciones de visualización' }).click();
  const overlay = page.getByRole('checkbox', { name: 'Superponer calendarios' });
  await expect(overlay).not.toBeChecked();
  await overlay.check();
  await expect(overlay).toBeChecked();
  await page.getByRole('radio', { name: 'Mediana de las marcas' }).check();
  await expect(page.getByRole('radio', { name: 'Mediana de las marcas' })).toBeChecked();
});

test('old calendar preferences migrate without losing the three options', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('synqo-participant-options-team', 'ana');
    localStorage.setItem(
      'synqo:calendar-view:v1',
      JSON.stringify({ extended: true, overlay: true, counts: true }),
    );
  });
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      json: {
        id: 'options-team',
        name: 'Equipo',
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [{ id: 'ana', name: 'Ana' }],
      },
    }),
  );
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.goto('/e/calendario#t=options-token');
  await page.getByRole('button', { name: 'Opciones de visualización' }).click();
  await expect(page.getByRole('checkbox', { name: 'Ver semanas completas' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Superponer calendarios' })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Mostrar recuentos del equipo' })).toBeChecked();
  await expect(page.getByRole('radio', { name: 'Peor disponibilidad' })).toBeChecked();
  await expect
    .poll(() =>
      page.evaluate(() => JSON.parse(localStorage.getItem('synqo:calendar-view:v2') ?? '{}')),
    )
    .toEqual({
      extended: true,
      overlay: true,
      counts: true,
      rule: 'worst',
    });
});

test('the chosen rule is shared by teams opened on this device', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('synqo-participant-first-team', 'ana');
    localStorage.setItem('synqo-participant-second-team', 'ana');
  });
  await page.route('**/api/teams/current', (route) => {
    const id = route.request().headers()['authorization']?.includes('second-token')
      ? 'second-team'
      : 'first-team';
    return route.fulfill({
      json: {
        id,
        name: id,
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [{ id: 'ana', name: 'Ana' }],
      },
    });
  });
  await page.route('**/api/teams/current/availability**', (route) =>
    route.fulfill({ json: { days: [] } }),
  );
  await page.goto('/e/calendario#t=first-token');
  await page.getByRole('button', { name: 'Opciones de visualización' }).click();
  await page.getByRole('radio', { name: 'Estado más frecuente' }).check();
  await page.goto('/');
  await page.goto('/e/calendario#t=second-token');
  await expect(page.getByRole('heading', { name: 'second-team' })).toBeVisible();
  await page.getByRole('button', { name: 'Opciones de visualización' }).click();
  await expect(page.getByRole('radio', { name: 'Estado más frecuente' })).toBeChecked();
});

test('an alternate rule updates provisionally and restores the complete day after a failed write', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));
  await page.addInitScript(() => localStorage.setItem('synqo-participant-summary-team', 'ana'));
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      json: {
        id: 'summary-team',
        name: 'Equipo',
        timeZone: 'Europe/Madrid',
        expiresAt: '2027-01-01T00:00:00Z',
        participants: [
          { id: 'ana', name: 'Ana' },
          { id: 'bea', name: 'Bea' },
        ],
      },
    }),
  );
  let releaseWrite = () => {};
  const firstWrite = new Promise<void>((resolve) => {
    releaseWrite = resolve;
  });
  let writeCount = 0;
  await page.route('**/api/teams/current/availability**', async (route) => {
    if (route.request().method() === 'GET')
      return route.fulfill({
        json: {
          days: [
            {
              date: '2026-10-14',
              state: 'unavailable',
              summaryStates: { worst: 'unavailable', median: 'maybe', mostFrequent: 'available' },
              counts: { available: 1, maybe: 0, unavailable: 1 },
              marks: [
                { participantId: 'ana', participantName: 'Ana', state: 'available' },
                { participantId: 'bea', participantName: 'Bea', state: 'unavailable' },
              ],
            },
          ],
        },
      });
    writeCount++;
    if (writeCount === 1) {
      await firstWrite;
      return route.fulfill({
        json: {
          day: {
            date: '2026-10-14',
            state: 'unavailable',
            summaryStates: { worst: 'unavailable', median: 'maybe', mostFrequent: 'maybe' },
            counts: { available: 0, maybe: 1, unavailable: 1 },
            marks: [
              { participantId: 'ana', participantName: 'Ana', state: 'maybe' },
              { participantId: 'bea', participantName: 'Bea', state: 'unavailable' },
            ],
          },
          expiresAt: '2027-01-01T00:00:00Z',
        },
      });
    }
    return route.fulfill({ status: 500, contentType: 'application/problem+json', body: '{}' });
  });
  await page.goto('/e/calendario#t=summary-token');
  await page.getByRole('button', { name: 'Opciones de visualización' }).click();
  await page.getByRole('radio', { name: 'Estado más frecuente' }).check();
  await page.getByRole('button', { name: 'Opciones de visualización' }).click();
  const day = page.locator('.calendar-day[data-date="2026-10-14"]');
  await expect(day).toHaveClass(/available/);
  await day.click();
  const maybe = page.locator('.calendar-detail .state-row.maybe');
  await maybe.click();
  await expect(day).toHaveClass(/maybe/);
  await expect(day).toHaveAttribute('aria-label', /equipo: \? Quizá/);
  releaseWrite();
  await expect(page.getByRole('status').last()).toHaveText('Disponibilidad guardada.');
  await expect(maybe).toContainText('Tú');
  await maybe.click();
  await expect(page.getByRole('alert')).toContainText('Hemos recuperado la marca anterior');
  await expect(day).toHaveClass(/maybe/);
  await expect(maybe).toContainText('Tú');
});
