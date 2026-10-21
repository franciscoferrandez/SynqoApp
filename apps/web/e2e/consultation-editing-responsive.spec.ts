import { expect, test, type Page } from '@playwright/test';

const viewports = [
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 769, height: 1024 },
  { width: 1280, height: 800 },
];
const participant = { id: 'editing-responsive-person', name: 'Ana' };
const team = {
  id: 'editing-responsive-team',
  name: 'Equipo responsive de edición',
  timeZone: 'Europe/Madrid',
  expiresAt: '2099-01-01T00:00:00Z',
  participants: [participant],
};
const consultation = {
  id: 'editing-responsive-consultation',
  type: 'text',
  title: '¿Qué plan elegimos para el encuentro del equipo?',
  state: 'open',
  createdAt: '2026-10-20T12:00:00Z',
  createdBy: participant,
  lastModifiedBy: null,
  lastModifiedAt: null,
  options: [
    {
      id: 'editing-responsive-option-1',
      text: 'Pasear por el parque cercano',
      position: 0,
      count: 0,
      voters: [],
    },
    {
      id: 'editing-responsive-option-2',
      text: 'Cenar en un restaurante del centro',
      position: 1,
      count: 0,
      voters: [],
    },
  ],
};

async function installFixture(page: Page, theme: 'light' | 'dark'): Promise<void> {
  await page.addInitScript(
    ({ teamId, preference }) => {
      localStorage.setItem(`synqo-participant-${teamId}`, 'editing-responsive-person');
      localStorage.setItem('synqo:theme', preference);
    },
    { teamId: team.id, preference: theme },
  );
  await page.route('**/api/configuration', (route) =>
    route.fulfill({ json: { teamCreationEmailMode: 'hidden' } }),
  );
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({ json: { open: [consultation], resolved: [], rejected: [] } }),
  );
  await page.route('**/api/teams/current/consultations/editing-responsive-consultation', (route) =>
    route.fulfill({ json: consultation }),
  );
}

for (const viewport of viewports) {
  for (const theme of ['light', 'dark'] as const) {
    test.describe(`consulta editable ${viewport.width}x${viewport.height} ${theme}`, () => {
      test.use({ viewport });

      test('dialog refluye, conserva foco de teclado y cancela sin cambios', async ({ page }) => {
        await installFixture(page, theme);
        await page.goto('/e/consultas/editing-responsive-consultation#t=editing-responsive-token');
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const actions = page.getByRole('button', { name: 'Acciones de la consulta' });
        await actions.focus();
        await page.keyboard.press('Enter');
        await expect(actions).toHaveAttribute('aria-expanded', 'true');
        await expect(page.getByRole('group', { name: 'Acciones de la consulta' })).toBeVisible();
        await page.keyboard.press('Tab');
        await expect(
          page.getByRole('button', { name: 'Editar consulta', exact: true }),
        ).toBeFocused();
        await page.keyboard.press('Enter');

        const editor = page.getByRole('dialog', { name: 'Editar consulta' });
        const title = editor.getByRole('textbox', { name: 'Título breve' });
        await expect(title).toBeFocused();
        const bounds = await editor.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.x).toBeGreaterThanOrEqual(0);
        expect(bounds!.width).toBeLessThanOrEqual(viewport.width);
        await expect
          .poll(() => page.evaluate(() => document.documentElement.scrollWidth - innerWidth))
          .toBeLessThanOrEqual(1);

        await page.keyboard.press('Escape');
        await expect(editor).toBeHidden();
        await expect(actions).toBeFocused();
      });
    });
  }
}
