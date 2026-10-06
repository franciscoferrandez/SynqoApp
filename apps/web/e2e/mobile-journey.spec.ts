import { expect, Page, test } from '@playwright/test';

const matrix = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
];

async function fitsViewport(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
}

async function markAvailability(page: Page, date: string, mobile: boolean) {
  await page.locator(`.calendar-day[data-date="${date}"]`).click();
  const detail = mobile ? page.getByRole('dialog') : page.locator('.calendar-detail');
  await expect(detail).toBeVisible();
  const saved = page.waitForResponse(
    (response) =>
      response.request().method() === 'PUT' && response.url().includes('/availability/'),
  );
  await detail.getByRole('button', { name: /^✓ Disponible ·/ }).click();
  expect((await saved).ok()).toBeTruthy();
  await expect(detail.getByRole('button', { name: /^✓ Disponible ·/ })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  if (mobile) await detail.getByRole('button', { name: 'Cerrar detalle del día' }).click();
}

for (const viewport of matrix) {
  test(`completes the real coordination journey at ${viewport.width}×${viewport.height}`, async ({
    browser,
  }, testInfo) => {
    test.setTimeout(120_000);
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const mobile = viewport.width <= 768;
    const dateTitle = `Fechas ${Date.now()}`;
    const textTitle = `Actividad ${Date.now()}`;
    try {
      await page.goto('/');
      await page.locator('#team-name').fill(`Matriz ${viewport.width} ${Date.now()}`);
      await page.locator('#participant-name').fill('Ana');
      await page.locator('button[type="submit"]').click();
      await expect(page.locator('[data-access-url]')).toBeVisible();
      const accessLink = new URL((await page.locator('[data-access-url]').textContent())!.trim());
      // Keep the shared API's canonical URL on this test server's origin.
      const accessUrl = `${new URL(page.url()).origin}${accessLink.pathname}${accessLink.hash}`;
      await fitsViewport(page);
      const calendarLink = await page
        .getByRole('link', { name: /Ver el calendario del equipo/ })
        .getAttribute('href');
      const calendarUrl = new URL(calendarLink!, page.url());
      await page.goto(`${calendarUrl.pathname}${calendarUrl.hash}`);
      await expect(page.locator('[data-identity-trigger]')).toContainText('Ana');
      await page.getByRole('button', { name: 'Mes siguiente' }).click();
      const days = page.locator('.calendar-day:not(:disabled)');
      const dates = await days.evaluateAll((elements) =>
        elements.slice(0, 2).map((element) => element.getAttribute('data-date')!),
      );
      expect(dates).toHaveLength(2);
      await markAvailability(page, dates[0], mobile);
      await markAvailability(page, dates[1], mobile);
      await fitsViewport(page);
      const visitor = await context.browser()!.newContext({ viewport });
      try {
        const secondPage = await visitor.newPage();
        await secondPage.goto(accessUrl);
        await expect(secondPage.getByRole('dialog')).toBeVisible();
        await secondPage.locator('#new-name').fill('Bea');
        await secondPage.getByRole('button', { name: 'Crear y participar' }).click();
        await expect(secondPage.locator('[data-identity-trigger]')).toContainText('Bea');
        await secondPage.getByRole('button', { name: 'Mes siguiente' }).click();
        await markAvailability(secondPage, dates[0], mobile);
        await markAvailability(secondPage, dates[1], mobile);
        await fitsViewport(secondPage);
        await page.reload();
        await page.getByRole('button', { name: 'Mes siguiente' }).click();
        await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
        await page.locator('#date-consultation-title').fill(dateTitle);
        for (const date of dates) await page.locator(`.calendar-day[data-date="${date}"]`).click();
        await fitsViewport(page);
        await page
          .locator('.calendar-detail-composer')
          .getByRole('button', { name: 'Crear consulta', exact: true })
          .click();
        await page
          .getByRole('dialog', { name: '¿Crear esta consulta?' })
          .getByRole('button', { name: 'Confirmar creación' })
          .click();
        await expect(page.getByRole('button', { name: new RegExp(dateTitle) })).toBeVisible();
        await page
          .locator('.section-heading')
          .getByRole('button', { name: /Crear consulta/ })
          .click();
        const editor = page.getByRole('dialog', { name: 'Plantea una pregunta' });
        await editor.locator('#consultation-title').fill(textTitle);
        await editor.getByRole('textbox', { name: 'Texto de la opción 1' }).fill('Paseo');
        await editor.getByRole('button', { name: 'Añadir opción' }).click();
        await editor.getByRole('textbox', { name: 'Texto de la opción 2' }).fill('Cine');
        await fitsViewport(page);
        await editor.getByRole('button', { name: 'Crear consulta', exact: true }).click();
        await page
          .getByRole('dialog', { name: '¿Crear esta consulta?' })
          .getByRole('button', { name: 'Confirmar creación' })
          .click();
        await secondPage.getByRole('link', { name: 'Consultas', exact: true }).click();
        for (const title of [dateTitle, textTitle]) {
          await secondPage.getByRole('button', { name: new RegExp(title) }).click();
          const voted = secondPage.waitForResponse(
            (response) =>
              response.url().includes('/votes/') && response.request().method() === 'PUT',
          );
          await secondPage.locator('.consultation-vote-option').first().click();
          expect((await voted).ok()).toBeTruthy();
          await expect(secondPage.getByRole('checkbox').first()).toBeChecked();
          await fitsViewport(secondPage);
          await secondPage.getByRole('button', { name: 'Volver a Consultas' }).click();
        }
        for (const [title, accept] of [
          [dateTitle, true],
          [textTitle, false],
        ] as const) {
          await page.getByRole('button', { name: new RegExp(title) }).click();
          await expect(
            page.locator('.consultation-vote-option').first().getByText('Bea'),
          ).toBeVisible();
          await page.getByRole('button', { name: 'Resolver consulta' }).click();
          const resolution = page.getByRole('dialog', { name: 'Resolver consulta' });
          if (accept) {
            await resolution.locator('.consultation-vote-option').first().click();
            await resolution.getByRole('button', { name: 'Aceptar seleccionadas' }).click();
          } else {
            await resolution.getByRole('button', { name: 'Rechazar consulta' }).click();
          }
          await resolution.getByRole('button', { name: 'Confirmar resolución' }).click();
          await expect(page.getByText('Resolución registrada por Ana.')).toBeVisible();
          await fitsViewport(page);
          await page.getByRole('button', { name: 'Volver a Consultas' }).click();
        }
        await expect(page.getByRole('heading', { name: 'Resueltas', exact: true })).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Rechazadas', exact: true })).toBeVisible();
        await testInfo.attach('responsive-result', {
          body: JSON.stringify({
            viewport,
            browser: browser.version(),
            result: 'complete',
            journeys: [
              'team',
              'identity',
              'availability',
              'date consultation',
              'text consultation',
              'vote',
              'resolve',
              'reject',
            ],
          }),
          contentType: 'application/json',
        });
        await page.screenshot({ path: testInfo.outputPath('consultations.png'), fullPage: true });
      } finally {
        await visitor.close();
      }
    } finally {
      await context.close();
    }
  });
}

test('switches the calendar presentation exactly between 768 and 769 CSS pixels', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('#team-name').fill(`Frontera ${Date.now()}`);
  await page.locator('#participant-name').fill('Ana');
  await page.locator('button[type="submit"]').click();
  const calendarLink = await page
    .getByRole('link', { name: /Ver el calendario del equipo/ })
    .getAttribute('href');
  const calendarUrl = new URL(calendarLink!, page.url());
  await page.goto(`${calendarUrl.pathname}${calendarUrl.hash}`);
  for (const width of [768, 769]) {
    await page.setViewportSize({ width, height: 1024 });
    await fitsViewport(page);
    const columns = await page
      .locator('.calendar-layout')
      .evaluate((element) => getComputedStyle(element).gridTemplateColumns.split(' ').length);
    expect(columns).toBe(width === 768 ? 1 : 2);
    await page.locator('.calendar-day.today').click();
    if (width === 768) {
      await expect(page.getByRole('dialog')).toBeVisible();
      await page.getByRole('button', { name: 'Cerrar detalle del día' }).click();
    } else {
      await expect(page.getByRole('dialog')).toBeHidden();
      await expect(page.locator('.calendar-detail')).toBeVisible();
    }
  }
});

test('keeps the arrival form usable with enlarged text on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await page.evaluate(() => {
    document.documentElement.style.fontSize = '200%';
  });
  await fitsViewport(page);
  await page.getByRole('combobox', { name: 'Tema' }).selectOption('dark');
  await page.locator('#team-name').fill('Equipo con texto ampliado');
  await page.locator('#participant-name').fill('Ana');
  await expect(page.getByRole('button', { name: 'Crear equipo', exact: true })).toBeEnabled();
});
