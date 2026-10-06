import { expect, Page, test } from '@playwright/test';

const MAILPIT = 'http://localhost:8025';

async function createTeam(page: Page, name: string, email: string): Promise<string> {
  await page.goto('/');
  await page.locator('#team-name').fill(name);
  await page.locator('#participant-name').fill('Ana');
  await page.locator('#email').fill(email);
  await page.locator('button[type="submit"]').press('Enter');
  await expect(page.locator('#confirmation-title')).toBeFocused();
  return (await page.locator('[data-access-url]').textContent())!.trim();
}

test('sends the link to Mailpit once and reports the outcome only in the creator browser', async ({
  browser,
  request,
}) => {
  const address = `exito-${Date.now()}@example.com`;
  const teamName = `Equipo correo ${Date.now()}`;
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const accessUrl = await createTeam(page, teamName, address);

  await expect(page.getByText('El correo con el enlace se ha enviado.')).toBeVisible({
    timeout: 15_000,
  });
  await expect(page.locator('[data-mail-failed]')).toHaveCount(0);
  await expect(page.getByText('Enlace de acceso')).toBeVisible();

  const found = await expect
    .poll(
      async () => {
        const search = await request.get(`${MAILPIT}/api/v1/search`, {
          params: { query: `to:${address}` },
        });
        return (await search.json()).messages as { ID: string; Subject: string }[];
      },
      { timeout: 15_000 },
    )
    .toHaveLength(1);
  void found;
  const search = await request.get(`${MAILPIT}/api/v1/search`, {
    params: { query: `to:${address}` },
  });
  const [{ ID }] = (await search.json()).messages as { ID: string }[];
  const message = await (await request.get(`${MAILPIT}/api/v1/message/${ID}`)).json();
  expect(message.Subject).toContain(teamName);
  expect(message.Text).toContain(accessUrl);
  expect(message.HTML).toContain(`href="${accessUrl}"`);
  expect(message.HTML).not.toMatch(/<img|src=/i);

  const visitor = await browser.newContext();
  const other = await visitor.newPage();
  await other.goto(accessUrl);
  await expect(other.getByRole('dialog')).toBeVisible();
  await expect(other.locator('[data-mail-failed]')).toHaveCount(0);
  await context.close();
  await visitor.close();
});

test('rejects an invalid address without creating the team', async ({ page }) => {
  await page.goto('/');
  await page.locator('#team-name').fill('Equipo sin correo válido');
  await page.locator('#participant-name').fill('Ana');
  await page.locator('#email').fill('esto@no');
  await page.locator('button[type="submit"]').press('Enter');
  await expect(page.locator('#email-error')).toBeVisible();
  await expect(page.locator('#email')).toBeFocused();
  await expect(page.locator('#email')).toHaveAttribute('aria-invalid', 'true');
  await expect(page).toHaveURL(/\/$/);
});

test('shows a failed attempt with the link, keeps it across navigation until dismissed', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    permissions: ['clipboard-read', 'clipboard-write'],
  });
  const page = await context.newPage();
  await page.route('**/api/mail-attempts/current', (route) =>
    route.fulfill({ json: { status: 'failed' }, headers: { 'Cache-Control': 'no-store' } }),
  );
  const accessUrl = await createTeam(page, `Equipo fallo ${Date.now()}`, 'fallo@example.com');

  const notice = page.locator('[data-mail-failed]');
  await expect(notice).toContainText('El equipo se ha creado, pero el correo no se pudo enviar.');
  await expect(notice.locator('[data-mail-failed-link]')).toHaveText(accessUrl);
  await expect(page.getByRole('button', { name: 'Copiar enlace' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);

  await page.getByRole('link', { name: /Ver el calendario del equipo/ }).press('Enter');
  await expect(page.locator('[data-identity-trigger]')).toContainText('Ana');
  await expect(notice).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copiar enlace' })).toBeVisible();

  await page.reload();
  await expect(notice).toBeVisible();
  await notice.getByRole('button', { name: 'Descartar aviso' }).press('Enter');
  await expect(notice).toHaveCount(0);
  await page.reload();
  await expect(page.locator('[data-identity-trigger]')).toContainText('Ana');
  await expect(notice).toHaveCount(0);

  const visitor = await browser.newContext();
  const other = await visitor.newPage();
  await other.route('**/api/mail-attempts/current', (route) =>
    route.fulfill({ json: { status: 'failed' } }),
  );
  await other.goto(accessUrl);
  await expect(other.getByRole('dialog')).toBeVisible();
  await expect(other.locator('[data-mail-failed]')).toHaveCount(0);
  await context.close();
  await visitor.close();
});

test('shows a failure that becomes known after leaving the confirmation', async ({ page }) => {
  let polls = 0;
  await page.route('**/api/mail-attempts/current', (route) => {
    polls += 1;
    return route.fulfill({ json: { status: polls < 3 ? 'pending' : 'failed' } });
  });
  await createTeam(page, `Equipo tardío ${Date.now()}`, 'tarde@example.com');
  await page.getByRole('link', { name: /Ver el calendario del equipo/ }).press('Enter');
  await expect(page.locator('[data-identity-trigger]')).toContainText('Ana');
  await expect(page.locator('[data-mail-failed]')).toBeVisible({ timeout: 15_000 });
});
