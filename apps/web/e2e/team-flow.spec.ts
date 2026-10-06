import { expect, test } from '@playwright/test';

test('creates a team, opens its link in another browser and remembers a local identity', async ({
  browser,
}) => {
  const creator = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await creator.newPage();
  let sentBody: Record<string, unknown> | undefined;
  page.on('request', (request) => {
    if (request.url().endsWith('/api/teams') && request.method() === 'POST') {
      sentBody = request.postDataJSON() as Record<string, unknown>;
    }
  });

  await page.goto('/');
  await expect.poll(() => page.locator('#team-name').getAttribute('placeholder')).not.toBe('');
  await page.locator('#team-name').fill(`Equipo ${Date.now()}`);
  await expect(page.locator('#participant-name')).toHaveAttribute('placeholder', '');
  await expect(page.locator('#email')).toHaveAttribute('placeholder', '');
  await page.locator('#participant-name').fill('Ana');
  await page.locator('#email').fill('no-enviado@example.invalid');
  await page.locator('button[type="submit"]').press('Enter');
  await expect(page.getByRole('heading', { name: /Equipo \d+/ })).toBeVisible();
  await expect(
    page.getByRole('heading', { name: 'Poneos de acuerdo más fácilmente.' }),
  ).toBeVisible();
  await expect(page.locator('#confirmation-title')).toBeFocused();
  await expect(
    page.getByText('Primer participante: Ana. Ya podéis empezar a coordinaros.'),
  ).toBeVisible();
  await expect(
    page.getByText(/Estamos enviando el enlace por correo|El correo con el enlace se ha enviado/),
  ).toBeVisible();
  await expect(page.getByText('Enlace de acceso')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Compartir' })).toBeDisabled();
  expect(sentBody).toBeDefined();
  expect(sentBody).toHaveProperty('email', 'no-enviado@example.invalid');

  const accessUrl = (await page.locator('[data-access-url]').textContent())!.trim();
  expect(accessUrl).toContain('/e#t=');
  await page.getByRole('button', { name: 'Copiar enlace' }).press('Enter');
  await expect(page.getByRole('status').last()).toHaveText('Enlace copiado.');
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(accessUrl);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await page.getByRole('link', { name: /Ver el calendario del equipo/ }).press('Enter');
  await expect(page.locator('[data-identity-trigger]')).toContainText('Ana');
  await expect(page.getByText('1 participante')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Disponibilidad del equipo' })).toBeVisible();
  await page.locator('.calendar-day.today').press('Enter');
  await expect(page.getByRole('dialog').getByText('Detalle del día')).toBeVisible();
  await page
    .getByRole('dialog')
    .getByRole('button', { name: 'Cerrar detalle del día' })
    .press('Enter');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  await expect(page.getByRole('button', { name: 'Copiar enlace' })).toHaveCSS('cursor', 'pointer');
  await expect(page.getByRole('button', { name: 'Compartir enlace' })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Consultas' })).toHaveCSS('cursor', 'pointer');
  await page.getByRole('link', { name: 'Consultas' }).press('Enter');
  await expect(page.getByRole('heading', { name: 'Aún no hay consultas' })).toBeVisible();
  await page.getByRole('link', { name: 'Calendario' }).press('Enter');

  const visitor = await browser.newContext();
  const secondPage = await visitor.newPage();
  await secondPage.goto(accessUrl);
  await expect(secondPage.getByRole('dialog')).toBeVisible();
  await expect(
    secondPage.getByRole('button', { name: 'Cerrar selección de identidad' }),
  ).toBeVisible();
  await expect(secondPage.getByRole('button', { name: 'Crear y participar' })).toBeVisible();
  const modalGeometry = await secondPage.getByRole('dialog').evaluate((dialog) => {
    const rect = dialog.getBoundingClientRect();
    return {
      centerX: rect.x + rect.width / 2,
      centerY: rect.y + rect.height / 2,
      viewportX: innerWidth / 2,
      viewportY: innerHeight / 2,
      backdrop: getComputedStyle(dialog, '::backdrop').backgroundColor,
    };
  });
  expect(Math.abs(modalGeometry.centerX - modalGeometry.viewportX)).toBeLessThan(2);
  expect(Math.abs(modalGeometry.centerY - modalGeometry.viewportY)).toBeLessThan(2);
  expect(modalGeometry.backdrop).not.toBe('rgba(0, 0, 0, 0)');
  await expect(secondPage.getByRole('button', { name: 'Ana', exact: true })).toBeFocused();
  await secondPage.keyboard.press('Tab');
  await expect(secondPage.locator('#new-name')).toBeFocused();
  await secondPage.getByRole('button', { name: 'Ana', exact: true }).press('Enter');
  await expect(secondPage.getByRole('dialog')).toBeHidden();
  const identityTrigger = secondPage.locator('[data-identity-trigger]');
  await expect(identityTrigger).toHaveCSS('cursor', 'pointer');
  await identityTrigger.press('Enter');
  await secondPage.getByRole('button', { name: 'Cerrar selección de identidad' }).press('Enter');
  await expect(secondPage.getByRole('dialog')).toBeHidden();
  await identityTrigger.press('Enter');
  await secondPage.locator('#new-name').fill('áNa');
  await secondPage.getByRole('button', { name: 'Crear y participar' }).press('Enter');
  await expect(secondPage.getByRole('alert')).toContainText('Ese nombre ya está en uso');
  await secondPage.locator('#new-name').fill('Bea');
  await secondPage.getByRole('button', { name: 'Crear y participar' }).press('Enter');
  await expect(secondPage.locator('[data-identity-trigger]')).toContainText('Bea');
  await secondPage.reload({ waitUntil: 'networkidle' });
  await expect(secondPage.locator('[data-identity-trigger]')).toContainText('Bea');
  await expect(secondPage.getByRole('dialog')).toBeHidden();
  await creator.close();
  await visitor.close();
});

test('uses static placeholders when reduced motion is requested and clears them on focus', async ({
  browser,
}) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.locator('#team-name')).toHaveAttribute(
    'placeholder',
    'Por ejemplo, Amigos del viernes',
  );
  await expect(page.locator('#participant-name')).toHaveAttribute(
    'placeholder',
    'Por ejemplo, Marta',
  );
  await page.locator('#email').focus();
  await expect(page.locator('#team-name')).toHaveAttribute('placeholder', '');
  await expect(page.locator('#participant-name')).toHaveAttribute('placeholder', '');
  await expect(page.locator('#email')).toHaveAttribute('placeholder', '');
  await context.close();
});

test('confirmation keeps the introductory column on desktop and works in dark mode', async ({
  browser,
}) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('#team-name').fill(`Equipo escritorio ${Date.now()}`);
  await page.locator('#participant-name').fill('Luz');
  await page.locator('button[type="submit"]').press('Enter');
  await expect(page.locator('#confirmation-title')).toBeFocused();
  await expect(page.getByText('No se ha enviado ningún correo.')).toHaveCount(0);
  const columns = await page.evaluate(() => {
    const intro = document.querySelector('app-arrival-intro')!.getBoundingClientRect();
    const panel = document.querySelector('.confirmation-panel')!.getBoundingClientRect();
    return { introRight: intro.right, panelLeft: panel.left };
  });
  expect(columns.introRight).toBeLessThan(columns.panelLeft);
  await page.locator('#theme').selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await expect(page.locator('[data-access-url]')).toContainText('/e#t=');
  await context.close();
});
