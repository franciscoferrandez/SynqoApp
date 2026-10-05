import { expect, test } from '@playwright/test';

async function activate(button: import('@playwright/test').Locator): Promise<void> {
  await button.focus();
  await button.press('Enter');
}

async function toggle(checkbox: import('@playwright/test').Locator): Promise<void> {
  await checkbox.focus();
  await checkbox.press('Space');
}

test('opens votes, restores a failed change, retries and confirms a resolution', async ({
  page,
}) => {
  const team = {
    id: 'decision-team',
    name: 'Equipo de prueba',
    timeZone: 'Europe/Madrid',
    expiresAt: '2027-01-01T00:00:00Z',
    participants: [
      { id: 'ana', name: 'Ana' },
      { id: 'bea', name: 'Bea' },
      { id: 'carlos', name: 'Carlos' },
      { id: 'dora', name: 'Dora' },
    ],
  };
  const consultation = {
    id: 'consultation-one',
    type: 'text',
    title: '¿Qué hacemos?',
    state: 'open',
    createdAt: '2026-10-05T12:00:00+00:00',
    createdBy: team.participants[0],
    options: [
      { id: 'option-one', text: 'Pasear', position: 0 },
      { id: 'option-two', text: 'Cine', position: 1 },
    ],
  };
  const detail = {
    ...consultation,
    options: [
      { ...consultation.options[0], count: 4, voters: [...team.participants] },
      { ...consultation.options[1], count: 0, voters: [] },
    ],
    resolution: undefined as
      | undefined
      | {
          participant: { id: string; name: string };
          resolvedAt: string;
          acceptedOptionIds: string[];
        },
  };
  let votes = 0;
  await page.addInitScript(() => localStorage.setItem('synqo-participant-decision-team', 'ana'));
  await page.route('**/api/teams/current', (route) => route.fulfill({ json: team }));
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({
      json: {
        open: detail.state === 'open' ? [consultation] : [],
        resolved:
          detail.state === 'resolved'
            ? [{ ...consultation, state: 'resolved', resolution: detail.resolution }]
            : [],
        rejected: [],
      },
    }),
  );
  await page.route('**/api/teams/current/consultations/consultation-one', (route) =>
    route.fulfill({ json: detail }),
  );
  await page.route(
    '**/api/teams/current/consultations/consultation-one/votes/ana/options/option-one',
    (route) => {
      votes++;
      if (votes === 1) return route.fulfill({ status: 500, json: { status: 500 } });
      detail.options[0].voters = detail.options[0].voters.filter((voter) => voter.id !== 'ana');
      detail.options[0].count = 3;
      return route.fulfill({ json: { consultation: detail, expiresAt: team.expiresAt } });
    },
  );
  await page.route('**/api/teams/current/consultations/consultation-one/resolution', (route) => {
    const body = route.request().postDataJSON() as { status: string; acceptedOptionIds: string[] };
    expect(body.status).toBe('resolved');
    expect(body.acceptedOptionIds).toEqual(['option-one', 'option-two']);
    detail.state = 'resolved';
    detail.resolution = {
      participant: team.participants[0],
      resolvedAt: '2026-10-05T12:30:00+00:00',
      acceptedOptionIds: body.acceptedOptionIds,
    };
    return route.fulfill({ json: { consultation: detail, expiresAt: team.expiresAt } });
  });

  await page.goto('/e/consultas#t=decision-token');
  await page.getByRole('button', { name: /¿Qué hacemos\?/ }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('heading', { name: '¿Qué hacemos?' })).toBeVisible();
  const first = page.locator('.consultation-vote-option').first();
  await expect(first.getByText('4 votos')).toBeVisible();
  await expect(first.getByText('Tú')).toBeVisible();
  await activate(first.getByRole('button', { name: '(+1)' }));
  await expect(first.getByText('Dora')).toBeVisible();

  await first.focus();
  await first.press('Space');
  await expect(page.getByRole('alert')).toContainText('Hemos recuperado tu selección anterior');
  await expect(first.getByRole('checkbox')).toBeChecked();
  await activate(page.getByRole('button', { name: 'Reintentar' }));
  await expect(first.getByRole('checkbox')).not.toBeChecked();
  await expect(first.getByText('3 votos')).toBeVisible();

  await activate(page.getByRole('button', { name: 'Resolver consulta' }));
  const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
  await expect(dialog.getByRole('checkbox')).toHaveCount(2);
  await expect(dialog.getByRole('checkbox').first()).not.toBeChecked();
  await toggle(dialog.getByRole('checkbox').first());
  await toggle(dialog.getByRole('checkbox').last());
  await expect(dialog.getByRole('button', { name: 'Aceptar seleccionadas' })).toBeEnabled();
  const buttonBounds = await dialog
    .getByRole('button', { name: 'Aceptar seleccionadas' })
    .boundingBox();
  expect(buttonBounds).not.toBeNull();
  await page.mouse.click(
    buttonBounds!.x + buttonBounds!.width / 2,
    buttonBounds!.y + buttonBounds!.height / 2,
  );
  await expect(dialog.getByText('Al confirmar, la consulta dejará de admitir votos')).toBeVisible();
  await activate(dialog.getByRole('button', { name: 'Confirmar resolución' }));
  await expect(page.getByText('Resolución registrada por Ana.')).toBeVisible();
  await expect(page.locator('.consultation-detail-view').getByRole('checkbox')).toHaveCount(0);
  await activate(page.getByRole('button', { name: 'Volver a Consultas' }));
  await expect(page.getByRole('heading', { name: 'Resueltas' })).toBeVisible();
  const closedCard = page.getByRole('button', { name: /¿Qué hacemos\?/ });
  await expect(closedCard).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('combobox', { name: 'Tema' }).selectOption('dark');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  await activate(closedCard);
  await expect(page.getByText('Opciones aceptadas')).toBeVisible();
  await expect(page.locator('.consultation-detail-view').getByRole('checkbox')).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
