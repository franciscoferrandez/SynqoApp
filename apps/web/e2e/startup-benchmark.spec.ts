import { expect, Page, Response, test } from '@playwright/test';

const AUTOMATIC_ACCEPTANCE_MS = 150_000;

test.use({
  viewport: { width: 1280, height: 800 },
  timezoneId: 'Europe/Madrid',
  actionTimeout: 15_000,
  navigationTimeout: 30_000,
});

/** Observe the real browser mutation, so optimistic rendering alone cannot pass a step. */
async function confirmedMutation(page: Page, path: RegExp, action: () => Promise<unknown>) {
  const [response] = await Promise.all([
    page.waitForResponse(
      (response) =>
        path.test(new URL(response.url()).pathname) && response.request().method() !== 'GET',
    ),
    action(),
  ]);
  expect(response.ok(), `La operación ${response.request().method()} debe confirmarse`).toBe(true);
}

async function selectIdentity(page: Page, name: string) {
  await page.locator('[data-identity-trigger]').click();
  await page.getByRole('dialog').getByRole('button', { name, exact: true }).click();
  await expect(page.locator('[data-identity-trigger]')).toContainText(name);
}

async function showDate(page: Page, date: string) {
  const day = page.locator(`.calendar-day[data-date="${date}"]`);
  // The following week may cross the month/year boundary. Keep navigation inside the UI.
  if ((await day.count()) === 0) {
    await page.getByRole('button', { name: 'Mes siguiente' }).click();
  }
  await expect(day).toBeVisible();
  return day;
}

async function markWeek(page: Page, dates: string[]) {
  for (const date of dates) {
    await (await showDate(page, date)).click();
    const available = page
      .locator('.calendar-detail')
      .getByRole('button', { name: /Disponible ·/ });
    await confirmedMutation(page, /\/availability\/.*\/participants\//, () => available.click());
    await expect(available).toHaveAttribute('aria-pressed', 'true');
    await expect(available).toContainText('Tú');
  }
}

test('benchmark del recorrido completo de arranque con WEB/API y correo reales', async ({
  page,
}, testInfo) => {
  test.setTimeout(360_000);
  await page.goto('/');
  await expect(page.locator('#team-name')).toBeVisible();
  const reference = await page.evaluate(() => {
    const now = new Date();
    const key = (date: Date) =>
      `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    const monday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    monday.setDate(monday.getDate() + 7 - ((monday.getDay() + 6) % 7));
    return {
      verificationDate: key(now),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      week: Array.from({ length: 7 }, (_, offset) => {
        const day = new Date(monday);
        day.setDate(day.getDate() + offset);
        return key(day);
      }),
    };
  });
  const teamName = `Benchmark ${Date.now()}`;
  const completedSteps: string[] = [];
  let currentStep = 'Crear equipo y acceder como P1';
  let receiptStatus = 'unverified';
  const receiptResponses: Promise<void>[] = [];
  let mailFailed = false;
  const observeReceipt = (response: Response) => {
    if (new URL(response.url()).pathname !== '/api/mail-attempts/current') return;
    receiptResponses.push(
      (async () => {
        if (!response.ok()) {
          mailFailed = true;
          return;
        }
        const result = (await response.json()) as { status: string };
        receiptStatus = result.status;
        if (result.status === 'failed') mailFailed = true;
      })().catch(() => {
        mailFailed = true;
      }),
    );
  };
  page.on('response', observeReceipt);
  let finishedAt: number | undefined;
  const startedAtIso = new Date().toISOString();
  const startedAt = performance.now();
  const step = async (name: string, action: () => Promise<void>) => {
    currentStep = name;
    await test.step(name, action);
    completedSteps.push(name);
  };
  try {
    await step(currentStep, async () => {
      await page.locator('#team-name').fill(teamName);
      await page.locator('#participant-name').fill('Ana');
      await page.locator('#email').fill(`benchmark-${Date.now()}@example.com`);
      await confirmedMutation(page, /^\/api\/teams$/, () =>
        page.locator('button[type="submit"]').click(),
      );
      await expect(page.locator('#confirmation-title')).toContainText(teamName);
      await page.getByRole('link', { name: /Ver el calendario del equipo/ }).click();
      await expect(page.locator('[data-identity-trigger]')).toContainText('Ana');
      await expect(page.getByRole('heading', { name: 'Disponibilidad del equipo' })).toBeVisible();
    });
    await step('Marcar disponibilidad P1 para la semana natural siguiente', async () => {
      await markWeek(page, reference.week);
    });
    await step('Crear P2 y marcar la misma semana', async () => {
      await page.locator('[data-identity-trigger]').click();
      await page.locator('#new-name').fill('Bea');
      await confirmedMutation(page, /\/participants$/, () =>
        page.getByRole('button', { name: 'Crear y participar' }).click(),
      );
      await expect(page.locator('[data-identity-trigger]')).toContainText('Bea');
      if (await page.getByRole('button', { name: 'Volver a hoy' }).count())
        await page.getByRole('button', { name: 'Volver a hoy' }).click();
      await markWeek(page, reference.week);
    });
    await step('Volver a P1 y crear consulta de dos fechas y de dos textos', async () => {
      await selectIdentity(page, 'Ana');
      await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
      await page.locator('#date-consultation-title').fill('¿Qué día nos reunimos?');
      if (await page.getByRole('button', { name: 'Volver a hoy' }).count())
        await page.getByRole('button', { name: 'Volver a hoy' }).click();
      for (const date of reference.week.slice(0, 2)) await (await showDate(page, date)).click();
      await expect(page.locator('.date-selection-list li')).toHaveCount(2);
      await page
        .locator('.calendar-detail-composer')
        .getByRole('button', { name: 'Crear consulta', exact: true })
        .click();
      await confirmedMutation(page, /\/consultations$/, () =>
        page
          .getByRole('dialog', { name: '¿Crear esta consulta?' })
          .getByRole('button', { name: 'Confirmar creación' })
          .click(),
      );
      await expect(page.getByRole('button', { name: /¿Qué día nos reunimos\?/ })).toBeVisible();
      await page
        .locator('.section-heading')
        .getByRole('button', { name: /Crear consulta/ })
        .click();
      const editor = page.getByRole('dialog', { name: 'Plantea una pregunta' });
      await editor.locator('#consultation-title').fill('¿Qué plan hacemos?');
      await editor
        .getByRole('textbox', { name: 'Texto de la opción 1', exact: true })
        .fill('Pasear');
      await editor.getByRole('button', { name: 'Añadir opción' }).click();
      await editor.getByRole('textbox', { name: 'Texto de la opción 2', exact: true }).fill('Cine');
      await expect(editor.getByRole('textbox', { name: /Texto de la opción/ })).toHaveCount(2);
      await editor.getByRole('button', { name: 'Crear consulta', exact: true }).click();
      await confirmedMutation(page, /\/consultations$/, () =>
        page
          .getByRole('dialog', { name: '¿Crear esta consulta?' })
          .getByRole('button', { name: 'Confirmar creación' })
          .click(),
      );
      await expect(
        page.locator('#open-heading').locator('..').locator('.consultation-card'),
      ).toHaveCount(2);
    });
    await step('Volver a P2 y votar en ambas consultas', async () => {
      await selectIdentity(page, 'Bea');
      for (const title of ['¿Qué día nos reunimos?', '¿Qué plan hacemos?']) {
        await page.getByRole('button', { name: new RegExp(title.replace(/[?]/g, '\\?')) }).click();
        const option = page.locator('.consultation-vote-option').first();
        await confirmedMutation(page, /\/votes\/.*\/options\//, () =>
          option.getByRole('checkbox').check(),
        );
        await expect(option.getByRole('checkbox')).toBeChecked();
        await expect(option).toContainText('1 voto');
        await expect(option).toContainText('Tú');
        await page.getByRole('button', { name: 'Volver a Consultas' }).click();
      }
    });
    await step('Volver a P1, resolver fechas y rechazar texto', async () => {
      await selectIdentity(page, 'Ana');
      for (const [title, decision] of [
        ['¿Qué día nos reunimos?', 'resolved'],
        ['¿Qué plan hacemos?', 'rejected'],
      ]) {
        await page.getByRole('button', { name: new RegExp(title.replace(/[?]/g, '\\?')) }).click();
        await expect(page.locator('.consultation-vote-option').first()).toContainText('Bea');
        await page.getByRole('button', { name: 'Resolver consulta', exact: true }).click();
        const dialog = page.getByRole('dialog', { name: 'Resolver consulta' });
        if (decision === 'resolved') {
          await dialog.getByRole('checkbox').first().check();
          await dialog.getByRole('button', { name: 'Aceptar seleccionadas' }).click();
        } else await dialog.getByRole('button', { name: 'Rechazar consulta', exact: true }).click();
        await confirmedMutation(page, /\/resolution$/, () =>
          dialog.getByRole('button', { name: 'Confirmar resolución' }).click(),
        );
        await expect(page.getByText('Resolución registrada por Ana.')).toBeVisible();
        await page.getByRole('button', { name: 'Volver a Consultas' }).click();
        await expect(page.locator(`#${decision}-heading`).locator('..')).toContainText(title);
      }
      await expect(page.locator('#open-heading')).toHaveCount(0);
    });
    await step('Comprobar recibo final del intento de correo sin error', async () => {
      await expect
        .poll(() => (mailFailed ? 'failed' : receiptStatus), { timeout: 30_000 })
        .toBe('succeeded');
      await Promise.all(receiptResponses);
      expect(mailFailed, 'El recibo real del navegador no debe informar error').toBe(false);
      await expect(page.locator('[data-mail-failed]')).toHaveCount(0);
      receiptStatus = 'succeeded';
    });
    finishedAt = performance.now();
    expect(completedSteps).toHaveLength(7);
    expect(
      finishedAt - startedAt,
      'Si dura 150 s o más, registrar además evidencia humana <300 s',
    ).toBeLessThan(AUTOMATIC_ACCEPTANCE_MS);
  } finally {
    page.off('response', observeReceipt);
    const durationMs = (finishedAt ?? performance.now()) - startedAt;
    const report = JSON.stringify(
      {
        spec: 'SPEC-COO-004',
        evidence: 'automated',
        browser: testInfo.project.name,
        viewport: { width: 1280, height: 800 },
        startedAtIso,
        ...reference,
        durationMs,
        automaticAcceptanceThresholdMs: AUTOMATIC_ACCEPTANCE_MS,
        completedSteps,
        currentStep,
        receiptStatus,
        complete: finishedAt !== undefined,
        automaticallyAccepted: finishedAt !== undefined && durationMs < AUTOMATIC_ACCEPTANCE_MS,
        humanVerificationRequired:
          finishedAt !== undefined && durationMs >= AUTOMATIC_ACCEPTANCE_MS,
        humanThresholdMs: 300_000,
        note: 'Tiempo automatizado; no mide a una persona ni confirma entrega al buzón. Setup excluido.',
      },
      null,
      2,
    );
    console.log('BENCHMARK_RESULT ' + report);
    await testInfo.attach('startup-benchmark.json', {
      body: report,
      contentType: 'application/json',
    });
  }
});
