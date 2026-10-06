import { expect, Locator, Page, test } from '@playwright/test';

// HTTP-fixtured presentation smoke, not a WCAG audit or API integration test.
const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 769, height: 1024 },
  { width: 1280, height: 800 },
];
const participant = { id: 'smoke-person', name: 'Ana' };
const team = {
  id: 'smoke-team',
  name: 'Equipo de accesibilidad responsive',
  timeZone: 'Europe/Madrid',
  expiresAt: '2099-01-01T00:00:00Z',
  participants: [participant],
};

async function reflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
    .toBeLessThanOrEqual(1);
}
async function reachable(control: Locator): Promise<void> {
  await expect(control).toBeVisible();
  await expect(control).toBeEnabled();
  await control.scrollIntoViewIfNeeded();
  const geometry = await control.evaluate((element) => {
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
  expect(geometry.left).toBeGreaterThanOrEqual(-1);
  expect(geometry.right).toBeLessThanOrEqual(geometry.width + 1);
  expect(geometry.bottom).toBeGreaterThan(0);
  expect(geometry.top).toBeLessThan(geometry.height);
}
async function keyboardFocus(control: Locator): Promise<void> {
  await reachable(control);
  await control.focus();
  await control.press('Tab');
  await control.page().keyboard.press('Shift+Tab');
  await expect(control).toBeFocused();
  const focus = await control.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      visible: element.matches(':focus-visible'),
      outline: style.outlineStyle,
      width: parseFloat(style.outlineWidth),
      color: style.outlineColor,
    };
  });
  expect(focus.visible).toBe(true);
  expect(focus.outline).not.toBe('none');
  expect(focus.width).toBeGreaterThan(0);
  expect(focus.color).not.toBe('rgba(0, 0, 0, 0)');
}
for (const viewport of viewports) {
  test.describe(`partial accessibility smoke ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport });
    test.afterEach(async ({ page }, testInfo) => {
      await testInfo.attach('partial-smoke-evidence', {
        body: JSON.stringify({
          viewport,
          browser: page.context().browser()!.version(),
          result: testInfo.status,
          evidence:
            'Partial HTTP-fixtured presentation smoke. Text enlargement is not browser zoom. No WCAG 2.2 AA conformance claim; full audit remains pending.',
          errors: testInfo.errors.map((error) => error.message),
        }),
        contentType: 'application/json',
      });
      await testInfo.attach('viewport', {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    });
    test.beforeEach(async ({ page }) => {
      await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
      await page.route('**/api/teams/current/availability**', (route) =>
        route.fulfill({ json: { days: [] } }),
      );
      await page.route('**/api/teams/current/consultations', (route) =>
        route.fulfill({ json: { open: [], resolved: [], rejected: [] } }),
      );
    });
    test('creation, confirmation and link messages keep named controls keyboard accessible', async ({
      page,
    }, testInfo) => {
      await page.route('**/api/teams', (route) =>
        route.fulfill({
          status: 201,
          json: {
            ...team,
            firstParticipant: participant,
            accessUrl: 'http://localhost:4200/e#t=smoke-token',
          },
        }),
      );
      await page.goto('/');
      await expect(page.getByRole('heading', { name: 'Crea tu equipo' })).toBeVisible();
      const name = page.getByRole('textbox', { name: 'Nombre del equipo o grupo' });
      await keyboardFocus(name);
      await name.fill(team.name);
      await page.keyboard.press('Tab');
      await expect(
        page.getByRole('textbox', { name: 'Nombre del primer participante' }),
      ).toBeFocused();
      await page.keyboard.type(participant.name);
      await reachable(page.getByRole('textbox', { name: /Correo para recibir el enlace/ }));
      await reflow(page);
      await keyboardFocus(page.getByRole('button', { name: 'Crear equipo', exact: true }));
      await page.keyboard.press('Enter');
      await expect(page.locator('#confirmation-title')).toBeFocused();
      await reachable(page.getByRole('button', { name: 'Copiar enlace', exact: true }));
      await keyboardFocus(page.getByRole('link', { name: /Ver el calendario del equipo/ }));
      await reflow(page);
      for (const [route, title] of [
        ['/caducado', 'Este equipo ha caducado'],
        ['/no-encontrado', 'No encontramos este equipo'],
      ]) {
        await page.goto(route);
        await expect(page.getByRole('heading', { name: title })).toBeVisible();
        await keyboardFocus(page.getByRole('link', { name: 'Synqo, inicio' }));
        await reflow(page);
      }
      await testInfo.attach('scope', {
        body: JSON.stringify({
          viewport,
          browser: page.context().browser()!.version(),
          evidence:
            'Partial presentation smoke. HTTP-fixtured creation/reads. No WCAG 2.2 AA conformance claim; full audit remains pending.',
        }),
        contentType: 'application/json',
      });
    });
    test('identity, calendar and editor preserve keyboard focus and reflow', async ({ page }) => {
      await page.goto('/e/calendario#t=smoke-token');
      const identity = page.getByRole('dialog', { name: '¿Con quién participas?' });
      const ana = identity.getByRole('button', { name: 'Ana', exact: true });
      await expect(ana).toBeFocused();
      await keyboardFocus(ana);
      await page.keyboard.press('Enter');
      await expect(identity).toBeHidden();
      const trigger = page.locator('[data-identity-trigger]');
      await keyboardFocus(trigger);
      await page.keyboard.press('Enter');
      await expect(ana).toBeFocused();
      await page.keyboard.press('Escape');
      await expect(trigger).toBeFocused();
      await reflow(page);
      const today = page.locator('.calendar-day.today');
      await keyboardFocus(today);
      await page.keyboard.press('Enter');
      if (viewport.width <= 768) {
        const detail = page.locator('dialog.availability-dialog');
        await expect(detail).toBeVisible();
        await expect
          .poll(() => detail.evaluate((element) => element.contains(document.activeElement)))
          .toBe(true);
        await keyboardFocus(detail.getByRole('button', { name: 'Cerrar detalle del día' }));
        await page.keyboard.press('Enter');
        await expect(today).toBeFocused();
      }
      await keyboardFocus(page.getByRole('link', { name: 'Consultas', exact: true }));
      await page.keyboard.press('Enter');
      await expect(page.getByRole('heading', { name: 'Aún no hay consultas' })).toBeVisible();
      const create = page
        .locator('.section-heading')
        .getByRole('button', { name: /Crear consulta/ });
      await keyboardFocus(create);
      await page.keyboard.press('Enter');
      const editor = page.getByRole('dialog', { name: 'Plantea una pregunta' });
      await expect(editor.getByRole('textbox', { name: 'Título breve' })).toBeFocused();
      await reachable(editor.getByRole('textbox', { name: 'Texto de la opción 1', exact: true }));
      await keyboardFocus(editor.getByRole('button', { name: 'Añadir opción' }));
      await page.keyboard.press('Enter');
      await expect(
        editor.getByRole('textbox', { name: 'Texto de la opción 2', exact: true }),
      ).toBeVisible();
      await reflow(page);
      await keyboardFocus(editor.getByRole('button', { name: 'Cancelar', exact: true }));
      await page.keyboard.press('Enter');
      await expect(editor).toBeHidden();
      await expect(create).toBeFocused();
    });
    test('load errors and open or closed consultation details keep controls reachable', async ({
      page,
    }) => {
      await page.addInitScript(() =>
        localStorage.setItem('synqo-participant-smoke-team', 'smoke-person'),
      );
      const consultations = ['open', 'resolved', 'rejected'].map((state) => ({
        id: `smoke-${state}`,
        title: `Consulta ${state}`,
        type: 'text',
        state,
        createdAt: '2026-10-05T12:00:00Z',
        createdBy: participant,
        options: [
          {
            id: 'option',
            position: 0,
            text: 'Una opción suficientemente descriptiva para comprobar el reflow',
            count: 0,
            voters: [],
          },
        ],
        ...(state === 'open'
          ? {}
          : {
              resolution: {
                participant,
                resolvedAt: '2026-10-05T13:00:00Z',
                acceptedOptionIds: state === 'resolved' ? ['option'] : [],
              },
            }),
      }));
      let failed = true;
      await page.route('**/api/teams/current/consultations', (route) => {
        if (failed) {
          failed = false;
          return route.fulfill({ status: 500, json: { status: 500 } });
        }
        return route.fulfill({
          json: {
            open: [consultations[0]],
            resolved: [consultations[1]],
            rejected: [consultations[2]],
          },
        });
      });
      await page.route('**/api/teams/current/consultations/smoke-*', (route) =>
        route.fulfill({
          json: consultations.find((item) => route.request().url().endsWith(item.id)),
        }),
      );
      await page.goto('/e/consultas#t=smoke-token');
      await expect(page.getByRole('alert')).toContainText('No se pudieron cargar');
      await keyboardFocus(page.getByRole('button', { name: 'Reintentar' }));
      await page.keyboard.press('Enter');
      for (const consultation of consultations) {
        const card = page.locator(`[data-consultation-id="${consultation.id}"]`);
        await keyboardFocus(card);
        await page.keyboard.press('Enter');
        await expect(
          page.getByRole('heading', { name: consultation.title, exact: true }),
        ).toBeVisible();
        await reflow(page);
        await keyboardFocus(page.getByRole('button', { name: 'Volver a Consultas' }));
        await page.keyboard.press('Enter');
        await expect(card).toBeVisible();
      }
    });
    test('200 percent text enlargement keeps arrival and editor controls reachable', async ({
      page,
    }) => {
      // Text enlargement, not browser zoom: doubles root font size at the CSS viewport.
      await page.addInitScript(() =>
        localStorage.setItem('synqo-participant-smoke-team', 'smoke-person'),
      );
      await page.goto('/');
      const originalSize = await page
        .locator('html')
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize));
      await page.addStyleTag({ content: `html { font-size: ${originalSize * 2}px !important; }` });
      await reachable(page.getByRole('textbox', { name: 'Nombre del equipo o grupo' }));
      await keyboardFocus(page.getByRole('button', { name: 'Crear equipo', exact: true }));
      await reflow(page);
      await page.goto('/e/consultas#t=smoke-token');
      await expect(page.getByRole('heading', { name: 'Aún no hay consultas' })).toBeVisible();
      await page.addStyleTag({ content: `html { font-size: ${originalSize * 2}px !important; }` });
      const create = page
        .locator('.section-heading')
        .getByRole('button', { name: /Crear consulta/ });
      await keyboardFocus(create);
      await page.keyboard.press('Enter');
      const editor = page.getByRole('dialog', { name: 'Plantea una pregunta' });
      await reachable(editor.getByRole('textbox', { name: 'Título breve' }));
      await reachable(editor.getByRole('textbox', { name: 'Texto de la opción 1', exact: true }));
      await keyboardFocus(editor.getByRole('button', { name: 'Cancelar', exact: true }));
      await reflow(page);
      await page.keyboard.press('Enter');
      await expect(editor).toBeHidden();
    });
  });
}
