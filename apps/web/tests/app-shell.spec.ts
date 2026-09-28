import { expect, test } from '@playwright/test';

test('muestra el formulario de equipo rápido', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Coordina sin cuentas' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Crear equipo rápido' })).toBeVisible();
});

test('crea un equipo, mantiene al creador en su home y admite otra participación', async ({
  browser,
  page,
}) => {
  await page.goto('/');
  await page.getByLabel('Nombre del equipo').fill('Equipo E2E');
  await page.getByLabel('Tu nombre').fill('Creador E2E');
  await page.getByRole('button', { name: 'Crear equipo rápido' }).click();

  await expect(page.getByRole('heading', { name: 'Equipo E2E' })).toBeVisible();
  await expect(page.getByText('Hola, Creador E2E. Este equipo es temporal.')).toBeVisible();
  await expect(page.getByRole('button', { name: /Compartir enlace|Copiar enlace/ })).toBeVisible();
  await page.getByRole('link', { name: 'Mi disponibilidad' }).click();
  await expect(page.getByRole('heading', { name: 'Mi disponibilidad' })).toBeVisible();
  await page.locator('.availability-options .available').first().click();
  await page.reload();
  await expect(page.locator('.availability-options .available').first()).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('button', { name: 'Calendario' }).click();
  await expect(page.getByText('L', { exact: true })).toBeVisible();
  await expect(page.locator('.calendar-adjacent').first()).toBeVisible();
  await page.getByRole('button', { name: 'Mes siguiente' }).click();
  await page.getByRole('button', { name: 'Hoy' }).click();
  await page
    .getByRole('button', { name: /sin respuesta/ })
    .first()
    .click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await page.getByRole('link', { name: 'Volver al equipo' }).click();

  const guestContext = await browser.newContext();
  const guest = await guestContext.newPage();
  await guest.goto(page.url());
  await guest.getByLabel('Tu nombre').fill('Invitada E2E');
  await guest.getByRole('button', { name: 'Entrar al equipo' }).click();
  await expect(guest.getByText('Hola, Invitada E2E. Este equipo es temporal.')).toBeVisible();
  await guestContext.close();
});
