import { expect, Page, test } from '@playwright/test';

test.use({ locale: 'es-ES', timezoneId: 'Europe/Madrid', reducedMotion: 'reduce' });

const viewports = [
  { name: 'movil-390x844', width: 390, height: 844 },
  { name: 'escritorio-1280x800', width: 1280, height: 800 },
] as const;
const themes = ['light', 'dark'] as const;
const teamId = 'visual-team';
const participantId = 'visual-ana';
const participants = [
  { id: participantId, name: 'Ana' },
  { id: 'visual-bruno', name: 'Bruno' },
  { id: 'visual-carmen', name: 'Carmen' },
];
const team = {
  id: teamId,
  name: 'Equipo de ejemplo',
  timeZone: 'Europe/Madrid',
  expiresAt: '2026-10-21T14:00:00+02:00',
  participants,
};
const accessToken = 'visual-token';
const teamUrl = `/e/calendario#t=${accessToken}`;

type ScenarioOptions = {
  emailMode?: 'hidden' | 'demo' | 'send';
  activeParticipant?: boolean;
  emptyConsultations?: boolean;
  currentStatus?: number;
  noOwnVote?: boolean;
};
type Scenario = {
  id: string;
  title: string;
  options?: ScenarioOptions;
  fullPage?: boolean;
  run: (page: Page) => Promise<void>;
};

function availabilityDays(from: string, to: string) {
  const days = [];
  const date = new Date(`${from}T12:00:00Z`);
  const last = new Date(`${to}T12:00:00Z`);
  while (date <= last) {
    const key = date.toISOString().slice(0, 10);
    const marks =
      key === '2026-10-14'
        ? [
            { participantId, participantName: 'Ana', state: 'available' },
            { participantId: 'visual-bruno', participantName: 'Bruno', state: 'maybe' },
            { participantId: 'visual-carmen', participantName: 'Carmen', state: 'unavailable' },
          ]
        : key === '2026-10-15'
          ? [{ participantId, participantName: 'Ana', state: 'maybe' }]
          : [];
    const counts = { available: 0, maybe: 0, unavailable: 0 };
    for (const mark of marks) counts[mark.state as keyof typeof counts] += 1;
    days.push({
      date: key,
      state: marks.some((mark) => mark.state === 'unavailable')
        ? 'unavailable'
        : marks.some((mark) => mark.state === 'maybe')
          ? 'maybe'
          : marks.length
            ? 'available'
            : null,
      summaryStates:
        key === '2026-10-14'
          ? { worst: 'unavailable', median: 'maybe', mostFrequent: 'available' }
          : key === '2026-10-15'
            ? { worst: 'maybe', median: 'maybe', mostFrequent: 'maybe' }
            : { worst: null, median: null, mostFrequent: null },
      counts,
      marks,
    });
    date.setUTCDate(date.getUTCDate() + 1);
  }
  return days;
}

const textConsultation = {
  id: 'visual-text-consultation',
  type: 'text' as const,
  title: '¿Qué plan nos apetece?',
  state: 'open' as const,
  createdAt: '2026-10-14T10:00:00+02:00',
  createdBy: participants[0],
  options: [
    {
      id: 'visual-option-cafe',
      position: 0,
      text: 'Café y paseo',
      count: 2,
      voters: [participants[0], participants[1]],
    },
    { id: 'visual-option-cine', position: 1, text: 'Cine', count: 1, voters: [participants[2]] },
  ],
};
const dateConsultation = {
  id: 'visual-date-consultation',
  type: 'date' as const,
  title: '¿Qué día nos viene mejor?',
  state: 'open' as const,
  createdAt: '2026-10-14T10:00:00+02:00',
  createdBy: participants[0],
  options: [
    {
      id: 'visual-date-1',
      position: 0,
      date: '2026-10-17',
      count: 2,
      voters: [participants[0], participants[1]],
    },
    { id: 'visual-date-2', position: 1, date: '2026-10-18', count: 1, voters: [participants[2]] },
  ],
};
const textConsultationWithoutOwnVote = {
  ...textConsultation,
  options: [
    {
      id: 'visual-option-cafe',
      position: 0,
      text: 'Café y paseo',
      count: 1,
      voters: [participants[1]],
    },
    { id: 'visual-option-cine', position: 1, text: 'Cine', count: 1, voters: [participants[2]] },
  ],
};
const resolvedConsultation = {
  ...textConsultation,
  id: 'visual-resolved-consultation',
  state: 'resolved' as const,
  resolution: {
    participant: participants[0],
    resolvedAt: '2026-10-14T11:00:00+02:00',
    acceptedOptionIds: ['visual-option-cafe'],
  },
};
const eventGroups = {
  unfinalized: [
    {
      id: 'visual-event-provisional',
      title: 'Ensayo general',
      date: '2026-10-24',
      status: 'provisional',
      lastModifiedAt: null,
      version: 1,
    },
  ],
  future: [
    {
      id: 'visual-event-future',
      title: 'Concierto de otoño',
      date: '2026-10-30',
      status: 'definitive',
      lastModifiedAt: '2026-10-14T11:00:00+02:00',
      version: 2,
    },
  ],
  past: [
    {
      id: 'visual-event-past',
      title: 'Actuación en la plaza',
      date: '2026-10-10',
      status: 'definitive',
      lastModifiedAt: null,
      version: 1,
    },
  ],
  rejected: [
    {
      id: 'visual-event-rejected',
      title: 'Plan descartado',
      date: null,
      status: 'rejected',
      lastModifiedAt: '2026-10-14T11:30:00+02:00',
      version: 2,
    },
  ],
};
const eventDetail = {
  ...eventGroups.unfinalized[0],
  notes: 'Repasar las canciones nuevas antes del ensayo.',
  createdBy: participants[0],
  createdAt: '2026-10-12T10:00:00+02:00',
  lastModifiedBy: null,
};
const rejectedEventDetail = {
  ...eventGroups.rejected[0],
  notes: null,
  createdBy: participants[0],
  createdAt: '2026-10-12T10:00:00+02:00',
  lastModifiedBy: participants[1],
};

async function installFixtures(page: Page, options: ScenarioOptions = {}): Promise<void> {
  await page.clock.setFixedTime(new Date('2026-10-14T12:00:00+02:00'));
  await page.addInitScript(
    ({ storedTeam, storedParticipant, active }) => {
      if (active) localStorage.setItem(`synqo-participant-${storedTeam}`, storedParticipant);
      else localStorage.removeItem(`synqo-participant-${storedTeam}`);
    },
    {
      storedTeam: teamId,
      storedParticipant: participantId,
      active: options.activeParticipant !== false,
    },
  );
  await page.route('**/api/**', (route) => route.fulfill({ status: 404, json: {} }));
  await page.route('**/api/configuration', (route) =>
    route.fulfill({
      json: {
        teamCreationEmailMode: options.emailMode ?? 'hidden',
        teamCreationMaxTeams: 2,
        teamCreationWindowMinutes: 60,
        demo: {
          nextResetAt: '2026-10-14T13:00:00+00:00',
          teams: [
            { name: 'La mesa del jueves', accessUrl: '/e#t=visual-friends', kind: 'social' },
            { name: 'La banda del patio', accessUrl: '/e#t=visual-band', kind: 'music' },
          ],
        },
      },
    }),
  );
  await page.route('**/api/teams', (route) => {
    const body = route.request().postDataJSON() as {
      name: string;
      firstParticipantName: string;
      email?: string;
    };
    return route.fulfill({
      status: 201,
      json: {
        id: teamId,
        name: body.name,
        timeZone: 'Europe/Madrid',
        expiresAt: team.expiresAt,
        firstParticipant: { id: participantId, name: body.firstParticipantName },
        accessUrl: `http://localhost:4200/e#t=${accessToken}`,
        creationAllowance: { maxTeams: 2, windowMinutes: 60, remaining: 1 },
        ...(body.email ? { mailAttempt: { status: 'pending', receipt: 'visual-receipt' } } : {}),
      },
    });
  });
  await page.route('**/api/teams/current', (route) =>
    route.fulfill({
      status: options.currentStatus ?? 200,
      json: options.currentStatus ? {} : team,
    }),
  );
  await page.route('**/api/teams/current/availability**', async (route) => {
    const url = new URL(route.request().url());
    return route.fulfill({
      json: { days: availabilityDays(url.searchParams.get('from')!, url.searchParams.get('to')!) },
    });
  });
  await page.route('**/api/teams/current/consultations', (route) =>
    route.fulfill({
      json: options.emptyConsultations
        ? { open: [], resolved: [], rejected: [] }
        : {
            open: [textConsultation, dateConsultation],
            resolved: [resolvedConsultation],
            rejected: [],
          },
    }),
  );
  await page.route(/\/api\/teams\/current\/consultations\/[^/]+$/, (route) => {
    const id = new URL(route.request().url()).pathname.split('/').at(-1);
    return route.fulfill({
      json:
        id === resolvedConsultation.id
          ? resolvedConsultation
          : id === dateConsultation.id
            ? dateConsultation
            : options.noOwnVote
              ? textConsultationWithoutOwnVote
              : textConsultation,
    });
  });
  await page.route('**/api/teams/current/events', (route) => route.fulfill({ json: eventGroups }));
  await page.route('**/api/teams/current/events/calendar**', (route) =>
    route.fulfill({ json: { events: [] } }),
  );
  await page.route(/\/api\/teams\/current\/events\/(?!calendar(?:\?|$))[^/]+$/, (route) =>
    route.fulfill({
      json: {
        event: route.request().url().endsWith('visual-event-rejected')
          ? rejectedEventDetail
          : eventDetail,
      },
    }),
  );
  await page.route('**/api/mail-attempts/current', (route) =>
    route.fulfill({ json: { status: 'failed' } }),
  );
}

async function open(page: Page, path: string, theme: (typeof themes)[number]): Promise<void> {
  await page.goto(path);
  await setTheme(page, theme);
  await page.evaluate(() => document.fonts.ready);
  await page.mouse.move(-1, -1);
}

async function setTheme(page: Page, theme: (typeof themes)[number]): Promise<void> {
  const themePicker = page.getByRole('button', { name: /^Tema / });
  if (!(await themePicker.isVisible())) return;
  for (let attempt = 0; attempt < 3; attempt++) {
    const label = await themePicker.getAttribute('aria-label');
    if (label?.startsWith(`Tema ${theme === 'light' ? 'claro' : 'oscuro'}.`)) return;
    // A captured scenario may have a modal open over the shared header.
    await themePicker.evaluate((button: HTMLButtonElement) => button.click());
  }
}

async function capture(
  page: Page,
  id: string,
  viewport: string,
  theme: string,
  fullPage: boolean,
): Promise<void> {
  await page.clock.pauseAt(new Date('2026-10-14T12:00:00+02:00'));
  await expect(page).toHaveScreenshot(`${id}-${viewport}-${theme}.png`, {
    fullPage,
    animations: 'disabled',
    caret: 'hide',
    maxDiffPixels: 0,
  });
}

const scenarios: Scenario[] = [
  {
    id: 'crear-equipo-correo-oculto',
    title: 'creación inicial con el correo oculto',
    options: { emailMode: 'hidden' },
    run: async (page) => {
      await open(page, '/', 'light');
      await expect(page.getByRole('heading', { name: 'Crea tu equipo' })).toBeVisible();
    },
  },
  {
    id: 'crear-equipo-correo-demo',
    title: 'creación con correo de demostración',
    options: { emailMode: 'demo' },
    run: async (page) => {
      await open(page, '/', 'light');
      await expect(
        page.getByRole('textbox', { name: 'Correo para recibir el enlace (opcional)' }),
      ).toBeVisible();
      await expect(page.getByText(/Campo de demostración/)).toBeVisible();
    },
  },
  {
    id: 'crear-equipo-correo-envio',
    title: 'creación con correo habilitado',
    options: { emailMode: 'send' },
    run: async (page) => {
      await open(page, '/', 'light');
      await expect(
        page.getByRole('textbox', { name: 'Correo para recibir el enlace (opcional)' }),
      ).toBeVisible();
    },
  },
  {
    id: 'confirmacion-equipo-creado',
    title: 'confirmación de equipo creado',
    run: async (page) => {
      await open(page, '/', 'light');
      await page.locator('#team-name').fill('Equipo de ejemplo');
      await page.locator('#participant-name').fill('Ana');
      await page.getByRole('button', { name: 'Crear equipo' }).click();
      await expect(page.getByRole('heading', { name: 'Equipo de ejemplo' })).toBeVisible();
      await expect(page).toHaveURL(/confirmacion/);
      await expect(page.getByText('Enlace de acceso')).toBeVisible();
    },
  },
  {
    id: 'confirmacion-error-correo',
    title: 'confirmación con fallo de correo',
    options: { emailMode: 'send' },
    run: async (page) => {
      await open(page, '/', 'light');
      await page.locator('#team-name').fill('Equipo de ejemplo');
      await page.locator('#participant-name').fill('Ana');
      await page.locator('#email').fill('ana@example.invalid');
      await page.getByRole('button', { name: 'Crear equipo' }).click();
      await expect(page.locator('[data-mail-failed]')).toBeVisible();
    },
  },
  {
    id: 'confirmacion-sin-creacion',
    title: 'confirmación sin creación reciente',
    run: async (page) => {
      await open(page, '/confirmacion', 'light');
      await expect(
        page.getByRole('heading', { name: 'No hay una creación reciente' }),
      ).toBeVisible();
    },
  },
  {
    id: 'seleccion-identidad',
    title: 'selección de identidad del equipo',
    options: { activeParticipant: false },
    fullPage: false,
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await expect(page.getByRole('dialog', { name: '¿Con quién participas?' })).toBeVisible();
    },
  },
  {
    id: 'calendario-equipo-detalle-dia',
    title: 'calendario del equipo y detalle de día',
    fullPage: false,
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await expect(page.getByRole('heading', { name: 'Disponibilidad del equipo' })).toBeVisible();
      await page.locator('.calendar-day[data-date="2026-10-14"]').click();
      await expect(page.locator('.state-row.available:visible')).toContainText('Tú');
    },
  },
  {
    id: 'calendario-mi-disponibilidad',
    title: 'calendario con mi disponibilidad',
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await page.getByRole('button', { name: 'Mi disponibilidad' }).click();
      await expect(page.getByRole('heading', { name: 'Mi disponibilidad' })).toBeVisible();
    },
  },
  {
    id: 'calendario-menu-visualizacion',
    title: 'menú de opciones del calendario',
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await page.getByRole('button', { name: 'Opciones de visualización' }).click();
      await expect(page.getByRole('checkbox', { name: 'Ver semanas completas' })).toBeVisible();
    },
  },
  {
    id: 'calendario-mediana-superpuesto',
    title: 'mediana del equipo con solapa y recuentos',
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await page.getByRole('button', { name: 'Opciones de visualización' }).click();
      await page.getByRole('checkbox', { name: 'Superponer calendarios' }).check();
      await page.getByRole('checkbox', { name: 'Mostrar recuentos del equipo' }).check();
      await page.getByRole('radio', { name: 'Mediana de las marcas' }).check();
      await page.getByRole('button', { name: 'Opciones de visualización' }).click();
      await expect(
        page.locator('.calendar-day[data-date="2026-10-14"] .team-count.result'),
      ).toHaveText('?1');
    },
  },
  {
    id: 'calendario-equipo-superpuesto',
    title: 'equipo con solapa y recuentos',
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await page.getByRole('button', { name: 'Opciones de visualización' }).click();
      await page.getByRole('checkbox', { name: 'Superponer calendarios' }).check();
      await page.getByRole('checkbox', { name: 'Mostrar recuentos del equipo' }).check();
      await page.getByRole('button', { name: 'Opciones de visualización' }).click();
      await expect(
        page.locator('.calendar-day[data-date="2026-10-14"] .calendar-underlay'),
      ).toBeVisible();
    },
  },
  {
    id: 'calendario-propio-superpuesto',
    title: 'disponibilidad propia con solapa del equipo',
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await page.getByRole('button', { name: 'Opciones de visualización' }).click();
      await page.getByRole('checkbox', { name: 'Superponer calendarios' }).check();
      await page.getByRole('checkbox', { name: 'Mostrar recuentos del equipo' }).check();
      await page.getByRole('button', { name: 'Opciones de visualización' }).click();
      await page.getByRole('button', { name: 'Mi disponibilidad', exact: true }).click();
      await expect(
        page.locator('.calendar-day[data-date="2026-10-14"] .calendar-underlay'),
      ).toBeVisible();
    },
  },
  {
    id: 'calendario-consulta-fechas',
    title: 'composición de consulta de fechas',
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
      const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
      await editor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué día nos viene mejor?');
      await editor.locator('.calendar-day[data-date="2026-10-17"]').click();
      await expect(page.getByRole('button', { name: 'Crear consulta', exact: true })).toBeEnabled();
    },
  },
  {
    id: 'calendario-confirmar-consulta-fechas',
    title: 'confirmación de descarte de consulta de fechas',
    fullPage: false,
    run: async (page) => {
      await open(page, teamUrl, 'light');
      await page.getByRole('button', { name: 'Crear consulta de fechas' }).click();
      const editor = page.getByRole('dialog', { name: 'Nueva consulta de fechas' });
      await editor.getByRole('textbox', { name: 'Título breve' }).fill('¿Qué día nos viene mejor?');
      await editor.locator('.calendar-day[data-date="2026-10-17"]').click();
      await editor.getByRole('button', { name: 'Cancelar', exact: true }).click();
      await expect(page.getByRole('dialog', { name: '¿Descartar los cambios?' })).toBeVisible();
    },
  },
  {
    id: 'consultas-lista-vacia',
    title: 'estado vacío de consultas',
    options: { emptyConsultations: true },
    run: async (page) => {
      await open(page, `/e/consultas#t=${accessToken}`, 'light');
      await expect(page.getByRole('heading', { name: 'Aún no hay consultas' })).toBeVisible();
    },
  },
  {
    id: 'eventos-lista-agrupada',
    title: 'eventos organizados por estado y fecha',
    run: async (page) => {
      await open(page, `/e/eventos#t=${accessToken}`, 'light');
      await expect(page.getByRole('heading', { name: 'Sin fecha definitiva' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Futuros' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Pasados' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Rechazados' })).toBeVisible();
    },
  },
  {
    id: 'eventos-ficha',
    title: 'ficha de evento',
    fullPage: false,
    run: async (page) => {
      await open(page, `/e/eventos#t=${accessToken}`, 'light');
      await page.locator('[data-event-id="visual-event-provisional"]').click();
      await expect(page.getByRole('heading', { name: 'Ensayo general' })).toBeVisible();
      await expect(page.getByText('Repasar las canciones nuevas antes del ensayo.')).toBeVisible();
    },
  },
  {
    id: 'eventos-crear-formulario',
    title: 'formulario de creación de evento',
    fullPage: false,
    run: async (page) => {
      await open(page, `/e/eventos#t=${accessToken}`, 'light');
      await page.getByRole('button', { name: '+ Crear evento' }).click();
      await expect(page.getByRole('dialog', { name: 'Crea un evento' })).toBeVisible();
      await expect(page.locator('#event-title')).toBeFocused();
    },
  },
  {
    id: 'eventos-editar-formulario',
    title: 'formulario de edición de evento',
    fullPage: false,
    run: async (page) => {
      await open(page, `/e/eventos#t=${accessToken}`, 'light');
      await page.locator('[data-event-id="visual-event-provisional"]').click();
      await page.getByRole('button', { name: 'Acciones del evento' }).click();
      await page.getByRole('button', { name: 'Editar evento' }).click();
      await expect(page.getByRole('dialog', { name: 'Edita el evento' })).toBeVisible();
      await expect(page.locator('#event-title')).toHaveValue('Ensayo general');
    },
  },
  {
    id: 'eventos-confirmar-rechazo',
    title: 'confirmación para rechazar evento',
    fullPage: false,
    run: async (page) => {
      await open(page, `/e/eventos#t=${accessToken}`, 'light');
      await page.locator('[data-event-id="visual-event-provisional"]').click();
      await page.getByRole('button', { name: 'Acciones del evento' }).click();
      await page.getByRole('button', { name: 'Rechazar evento' }).click();
      await expect(page.getByRole('dialog', { name: '¿Rechazar este evento?' })).toBeVisible();
    },
  },
  {
    id: 'eventos-confirmar-recuperacion',
    title: 'confirmación para recuperar evento',
    fullPage: false,
    run: async (page) => {
      await open(page, `/e/eventos#t=${accessToken}`, 'light');
      await page.locator('[data-event-id="visual-event-rejected"]').click();
      await page.getByRole('button', { name: 'Acciones del evento' }).click();
      await page.getByRole('button', { name: 'Recuperar evento' }).click();
      await expect(page.getByRole('dialog', { name: '¿Recuperar este evento?' })).toBeVisible();
      // Opening the action can leave the inert background a few pixels scrolled.
      await page.evaluate(() => window.scrollTo(0, 0));
    },
  },
  {
    id: 'consultas-lista-varios-estados',
    title: 'consultas de texto y fecha abiertas y resueltas',
    run: async (page) => {
      await open(page, `/e/consultas#t=${accessToken}`, 'light');
      await expect(page.getByRole('heading', { name: 'Abiertas' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Resueltas' })).toBeVisible();
    },
  },
  {
    id: 'consultas-componer-texto',
    title: 'composición de consulta de texto',
    fullPage: false,
    run: async (page) => {
      await open(page, `/e/consultas#t=${accessToken}`, 'light');
      await page.getByRole('button', { name: '+ Crear consulta' }).click();
      await page
        .getByRole('dialog', { name: '¿Qué quieres consultar?' })
        .getByRole('button', { name: 'Texto', exact: true })
        .click();
      const dialog = page.getByRole('dialog', { name: 'Plantea una pregunta' });
      await dialog.locator('#consultation-title').fill('¿Qué plan nos apetece?');
      await dialog.getByRole('textbox', { name: 'Texto de la opción 1' }).fill('Café y paseo');
      await dialog.getByRole('button', { name: 'Añadir opción' }).click();
      await dialog.getByRole('textbox', { name: 'Texto de la opción 2' }).fill('Cine');
      await expect(
        dialog.getByRole('button', { name: 'Crear consulta', exact: true }),
      ).toBeEnabled();
    },
  },
  {
    id: 'consultas-detalle-votos',
    title: 'detalle de consulta y votos',
    run: async (page) => {
      await open(page, `/e/consultas#t=${accessToken}`, 'light');
      await page.locator(`[data-consultation-id="${textConsultation.id}"]`).click();
      await expect(page.getByRole('heading', { name: textConsultation.title })).toBeVisible();
    },
  },
  {
    id: 'consultas-detalle-sin-voto',
    title: 'detalle de consulta sin voto propio',
    options: { noOwnVote: true },
    run: async (page) => {
      await open(page, `/e/consultas#t=${accessToken}`, 'light');
      await page.locator(`[data-consultation-id="${textConsultation.id}"]`).click();
      await expect(page.getByRole('heading', { name: textConsultation.title })).toBeVisible();
    },
  },
  {
    id: 'consultas-detalle-fechas',
    title: 'detalle de consulta de fechas y votos',
    run: async (page) => {
      await open(page, `/e/consultas#t=${accessToken}`, 'light');
      await page.locator(`[data-consultation-id="${dateConsultation.id}"]`).click();
      await expect(page.getByRole('heading', { name: dateConsultation.title })).toBeVisible();
    },
  },
  {
    id: 'consultas-resolucion',
    title: 'confirmación de resolución de consulta',
    fullPage: false,
    run: async (page) => {
      await open(page, `/e/consultas#t=${accessToken}`, 'light');
      await page.locator(`[data-consultation-id="${textConsultation.id}"]`).click();
      await page.getByRole('button', { name: 'Acciones de la consulta' }).click();
      await page.getByRole('button', { name: 'Resolver consulta' }).click();
      await expect(page.getByRole('dialog', { name: 'Resolver consulta' })).toBeVisible();
    },
  },
  {
    id: 'consultas-resuelta',
    title: 'detalle de consulta resuelta',
    run: async (page) => {
      await open(page, `/e/consultas#t=${accessToken}`, 'light');
      await page.locator(`[data-consultation-id="${resolvedConsultation.id}"]`).click();
      await expect(page.getByText('Opciones aceptadas')).toBeVisible();
    },
  },
  {
    id: 'enlace-equipo-caducado',
    title: 'equipo caducado',
    options: { currentStatus: 410 },
    run: async (page) => {
      await open(page, `/e#t=${accessToken}`, 'light');
      await expect(page.getByRole('heading', { name: 'Este equipo ha caducado' })).toBeVisible();
    },
  },
  {
    id: 'enlace-equipo-no-encontrado',
    title: 'equipo no encontrado',
    options: { currentStatus: 404 },
    run: async (page) => {
      await open(page, `/e#t=${accessToken}`, 'light');
      await expect(page.getByRole('heading', { name: 'No encontramos este equipo' })).toBeVisible();
    },
  },
  {
    id: 'equipo-error-carga',
    title: 'error al cargar el equipo',
    options: { currentStatus: 500 },
    run: async (page) => {
      await open(page, `/e#t=${accessToken}`, 'light');
      await expect(
        page.getByRole('heading', { name: 'No se pudo cargar el equipo' }),
      ).toBeVisible();
    },
  },
  {
    id: 'enlace-sin-token',
    title: 'falta el enlace de acceso',
    options: { currentStatus: 401 },
    run: async (page) => {
      await open(page, '/e', 'light');
      await expect(
        page.getByRole('heading', { name: 'Se requiere el enlace de acceso' }),
      ).toBeVisible();
    },
  },
  {
    id: 'herramienta-brandboard',
    title: 'herramienta de brandboard de desarrollo',
    run: async (page) => {
      await open(page, '/desarrollo/brandboard', 'light');
      await expect(
        page.getByRole('heading', { name: 'Recortar elementos de la brandboard' }),
      ).toBeVisible();
    },
  },
];

for (const scenario of scenarios) {
  for (const viewport of viewports) {
    for (const theme of themes) {
      test(`${scenario.title} · ${viewport.name} · ${theme}`, async ({ page }) => {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await installFixtures(page, scenario.options);
        await scenario.run(page);
        await setTheme(page, theme);
        await page.evaluate(() => document.fonts.ready);
        await page.mouse.move(-1, -1);
        await capture(page, scenario.id, viewport.name, theme, scenario.fullPage ?? true);
      });
    }
  }
}
