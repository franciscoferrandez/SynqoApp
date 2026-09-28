import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type Team = { teamRef: string; name: string; timeZone: string };
type Home = { team: Team; currentActor: { participant: { displayName: string } } };
type AvailabilityStatus = 'AVAILABLE' | 'MAYBE' | 'UNAVAILABLE';
type AvailabilityEntry = { date: string; status: AvailabilityStatus };
const availabilityOptions: ReadonlyArray<readonly [AvailabilityStatus, string, string]> = [
  ['AVAILABLE', '✓', 'Disponible'],
  ['MAYBE', '?', 'Quizá'],
  ['UNAVAILABLE', '×', 'No disponible'],
];
const weekdayLabelFormat: 'SHORT' | 'LONG' = 'SHORT';
const weekdayLabels =
  weekdayLabelFormat === 'SHORT'
    ? ['L', 'M', 'X', 'J', 'V', 'S', 'D']
    : ['LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB', 'DOM'];
const api = '/api/v1';
const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const supportsShare = () => 'share' in (navigator as unknown as Record<string, unknown>);
const csrfToken = () => document.cookie.match(/(?:^|; )synqo_csrf=([^;]+)/)?.[1];
const mutationHeaders = () => ({
  'content-type': 'application/json',
  'idempotency-key': crypto.randomUUID(),
  ...(csrfToken() ? { 'x-csrf-token': csrfToken()! } : {}),
});
const localDate = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const dateFromLocal = (value: string) => new Date(`${value}T12:00:00`);
const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1, 12);
const startOfWeek = (date: Date) => {
  const start = new Date(date);
  start.setHours(12, 0, 0, 0);
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return start;
};
const weekDates = (offset = 0) => {
  const today = startOfWeek(new Date());
  today.setDate(today.getDate() + offset * 7);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() + index);
    return localDate(date);
  });
};
const monthDates = (month: Date) => {
  const first = monthStart(month);
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0, 12);
  const gridStart = startOfWeek(first);
  const gridEnd = startOfWeek(last);
  gridEnd.setDate(gridEnd.getDate() + 6);
  const cells: string[] = [];
  for (const date = new Date(gridStart); date <= gridEnd; date.setDate(date.getDate() + 1))
    cells.push(localDate(date));
  return { cells, from: cells[0], to: cells.at(-1)! };
};
const weekOffsetFor = (date: Date) =>
  Math.round((startOfWeek(date).getTime() - startOfWeek(new Date()).getTime()) / 604800000);
const labelFor = (date: string) =>
  new Intl.DateTimeFormat('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }).format(
    new Date(`${date}T12:00:00`),
  );

export function App() {
  const [team, setTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [home, setHome] = useState<Home | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const [availability, setAvailability] = useState<Record<string, AvailabilityStatus>>({});
  const [availabilityError, setAvailabilityError] = useState('');
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [availabilityView, setAvailabilityView] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [weekOffset, setWeekOffset] = useState(0);
  const [calendarMonth, setCalendarMonth] = useState(() => monthStart(new Date()));
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const teamRef = location.pathname.match(/^\/teams\/([^/]+)/)?.[1];
  const availabilityRoute = location.pathname.match(/^\/teams\/([^/]+)\/availability\/me$/);
  const availabilityTeamRef = availabilityRoute?.[1];
  useEffect(() => {
    if (teamRef)
      fetch(`${api}/teams/${teamRef}/home`)
        .then(async (response) => {
          if (response.ok) return setHome((await response.json()) as Home);
          const publicTeam = await fetch(`${api}/teams/${teamRef}`);
          if (publicTeam.ok) return setTeam((await publicTeam.json()) as Team);
          return setError('El enlace no es válido o ya no está disponible.');
        })
        .catch(() => setError('No se ha podido conectar con Synqo.'));
  }, [teamRef]);
  useEffect(() => {
    if (!availabilityTeamRef) return;
    const range =
      availabilityView === 'LIST'
        ? { from: weekDates(weekOffset)[0], to: weekDates(weekOffset).at(-1)! }
        : monthDates(calendarMonth);
    setAvailabilityLoading(true);
    fetch(`${api}/teams/${availabilityTeamRef}/availability/me?from=${range.from}&to=${range.to}`)
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const data = (await response.json()) as { entries: AvailabilityEntry[] };
        setAvailability(
          Object.fromEntries(data.entries.map((entry) => [entry.date, entry.status])),
        );
      })
      .catch(() => setAvailabilityError('No se ha podido cargar tu disponibilidad.'))
      .finally(() => setAvailabilityLoading(false));
  }, [availabilityTeamRef, availabilityView, weekOffset, calendarMonth]);
  async function create(event: FormEvent) {
    event.preventDefault();
    setError('');
    const response = await fetch(`${api}/teams/quick`, {
      method: 'POST',
      headers: mutationHeaders(),
      body: JSON.stringify({ teamName, timeZone: browserZone, participantDisplayName: name }),
    });
    if (!response.ok) return setError('Revisa los datos e inténtalo de nuevo.');
    const data = (await response.json()) as { redirectTo: string };
    location.assign(data.redirectTo);
  }
  async function join(event: FormEvent) {
    event.preventDefault();
    if (!team) return;
    setError('');
    const response = await fetch(`${api}/teams/${team.teamRef}/participants`, {
      method: 'POST',
      headers: mutationHeaders(),
      body: JSON.stringify({ displayName: name }),
    });
    if (!response.ok) return setError('No se ha podido crear tu participación.');
    location.assign(`/teams/${team.teamRef}`);
  }
  async function share() {
    setShareMessage('');
    const url = location.href;
    try {
      if (supportsShare()) {
        await navigator.share({ title: home?.team.name ?? 'Synqo', url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareMessage('Enlace copiado.');
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === 'AbortError') return;
      setShareMessage(
        'No se ha podido compartir el enlace. Puedes copiarlo desde la barra del navegador.',
      );
    }
  }
  async function updateAvailability(date: string, status: AvailabilityStatus) {
    if (!availabilityTeamRef) return false;
    setAvailabilityError('');
    const response = await fetch(`${api}/teams/${availabilityTeamRef}/availability/me`, {
      method: 'PUT',
      headers: mutationHeaders(),
      body: JSON.stringify({ entries: [{ date, status }] }),
    });
    if (!response.ok) {
      return setAvailabilityError('No se ha podido guardar el cambio. Inténtalo de nuevo.');
    }
    setAvailability((current) => ({ ...current, [date]: status }));
    return true;
  }
  async function clearAvailability(date: string) {
    if (!availabilityTeamRef) return false;
    const response = await fetch(`${api}/teams/${availabilityTeamRef}/availability/me/${date}`, {
      method: 'DELETE',
      headers: mutationHeaders(),
    });
    if (!response.ok) {
      setAvailabilityError('No se ha podido retirar la disponibilidad.');
      return false;
    }
    setAvailability((current) => {
      const next = { ...current };
      delete next[date];
      return next;
    });
    return true;
  }
  async function toggleAvailability(date: string, status: AvailabilityStatus) {
    return availability[date] === status
      ? clearAvailability(date)
      : updateAvailability(date, status);
  }
  if (availabilityTeamRef) {
    const dates = weekDates(weekOffset);
    const calendar = monthDates(calendarMonth);
    const today = localDate(new Date());
    const calendarContainsToday = calendar.from <= today && today <= calendar.to;
    const calendarTitle = new Intl.DateTimeFormat('es-ES', {
      month: 'long',
      year: 'numeric',
    }).format(calendarMonth);
    const switchToCalendar = () => {
      const monday = dates[0];
      setCalendarMonth(monthStart(dates.includes(today) ? new Date() : dateFromLocal(monday)));
      setAvailabilityView('CALENDAR');
    };
    const switchToList = () => {
      setWeekOffset(calendarContainsToday ? 0 : weekOffsetFor(calendarMonth));
      setAvailabilityView('LIST');
    };
    return (
      <main className="card availability">
        <p className="eyebrow">Equipo rápido</p>
        <h1>Mi disponibilidad</h1>
        <p>Indica tu disponibilidad general por día. No modifica respuestas a propuestas.</p>
        <div aria-label="Vista de disponibilidad" className="view-switch">
          <button type="button" aria-pressed={availabilityView === 'LIST'} onClick={switchToList}>
            Lista
          </button>
          <button
            type="button"
            aria-pressed={availabilityView === 'CALENDAR'}
            onClick={switchToCalendar}
          >
            Calendario
          </button>
        </div>
        <nav
          aria-label={availabilityView === 'LIST' ? 'Navegación de semanas' : 'Navegación de meses'}
          className="availability-navigation"
        >
          <button
            type="button"
            aria-label={availabilityView === 'LIST' ? 'Semana anterior' : 'Mes anterior'}
            onClick={() =>
              availabilityView === 'LIST'
                ? setWeekOffset((week) => week - 1)
                : setCalendarMonth(
                    (month) => new Date(month.getFullYear(), month.getMonth() - 1, 1, 12),
                  )
            }
          >
            ‹
          </button>
          <button
            type="button"
            onClick={() =>
              availabilityView === 'LIST'
                ? setWeekOffset(0)
                : setCalendarMonth(monthStart(new Date()))
            }
          >
            Hoy
          </button>
          <button
            type="button"
            aria-label={availabilityView === 'LIST' ? 'Semana siguiente' : 'Mes siguiente'}
            onClick={() =>
              availabilityView === 'LIST'
                ? setWeekOffset((week) => week + 1)
                : setCalendarMonth(
                    (month) => new Date(month.getFullYear(), month.getMonth() + 1, 1, 12),
                  )
            }
          >
            ›
          </button>
        </nav>
        {availabilityView === 'CALENDAR' && <p className="calendar-month">{calendarTitle}</p>}
        {availabilityLoading ? (
          <p role="status">Cargando disponibilidad…</p>
        ) : (
          <section
            aria-label={
              availabilityView === 'LIST'
                ? 'Lista de mi disponibilidad'
                : 'Calendario de mi disponibilidad'
            }
            className={availabilityView === 'LIST' ? 'availability-list' : 'availability-calendar'}
          >
            {availabilityView === 'CALENDAR' &&
              weekdayLabels.map((label) => (
                <span className="calendar-weekday" key={label}>
                  {label}
                </span>
              ))}
            {(availabilityView === 'LIST' ? dates : calendar.cells).map((date) =>
              availabilityView === 'LIST' ? (
                <div
                  className={`availability-day ${date === today ? 'availability-today' : ''}`}
                  key={date}
                >
                  <span>{labelFor(date)}</span>
                  <div
                    className="availability-options"
                    aria-label={`${labelFor(date)}: mi disponibilidad`}
                  >
                    {availabilityOptions.map(([status, icon, label]) => (
                      <button
                        className={`status ${status.toLowerCase()}`}
                        aria-pressed={availability[date] === status}
                        key={status}
                        type="button"
                        onClick={() => toggleAvailability(date, status)}
                        title={label}
                      >
                        {icon}
                        <span>{label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <button
                  aria-label={`${labelFor(date)}: ${availability[date] ? 'editar disponibilidad' : 'sin respuesta'}`}
                  className={`calendar-day ${date === today ? 'availability-today' : ''} ${
                    dateFromLocal(date).getMonth() !== calendarMonth.getMonth()
                      ? 'calendar-adjacent'
                      : ''
                  }`}
                  key={date}
                  type="button"
                  onClick={() => setEditingDate(date)}
                >
                  <span>{new Date(`${date}T12:00:00`).getDate()}</span>
                  <span
                    className={`calendar-status ${availability[date]?.toLowerCase() ?? ''}`}
                    aria-hidden="true"
                  >
                    {availability[date]
                      ? availabilityOptions.find(([status]) => status === availability[date])?.[1]
                      : ''}
                  </span>
                </button>
              ),
            )}
          </section>
        )}
        {editingDate && (
          <div
            className="availability-modal-backdrop"
            role="presentation"
            onMouseDown={() => setEditingDate(null)}
          >
            <section
              aria-labelledby="availability-modal-title"
              aria-modal="true"
              className="availability-modal"
              role="dialog"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <h2 id="availability-modal-title">{labelFor(editingDate)}</h2>
              <p>Selecciona tu disponibilidad. Repite el estado activo para retirarlo.</p>
              <div className="availability-options">
                {availabilityOptions.map(([status, icon, label]) => (
                  <button
                    className={`status ${status.toLowerCase()}`}
                    aria-pressed={availability[editingDate] === status}
                    key={status}
                    type="button"
                    onClick={async () => {
                      if (await toggleAvailability(editingDate, status)) setEditingDate(null);
                    }}
                  >
                    {icon}
                    <span>{label}</span>
                  </button>
                ))}
              </div>
              <button className="modal-close" type="button" onClick={() => setEditingDate(null)}>
                Cancelar
              </button>
            </section>
          </div>
        )}
        {availabilityError && <p role="alert">{availabilityError}</p>}
        <p>
          <a href={`/teams/${availabilityTeamRef}`}>Volver al equipo</a>
        </p>
      </main>
    );
  }
  if (home)
    return (
      <main className="card">
        <p className="eyebrow">Equipo rápido</p>
        <h1>{home.team.name}</h1>
        <p>Hola, {home.currentActor.participant.displayName}. Este equipo es temporal.</p>
        <button type="button" onClick={share}>
          {supportsShare() ? 'Compartir enlace' : 'Copiar enlace'}
        </button>
        {shareMessage && <p role="status">{shareMessage}</p>}
        <p>
          <a href={`/teams/${home.team.teamRef}/availability/me`}>Mi disponibilidad</a>
        </p>
      </main>
    );
  if (teamRef && team)
    return (
      <main className="card">
        <p className="eyebrow">Equipo rápido</p>
        <h1>{team.name}</h1>
        <p>Este equipo es temporal. Identifícate para participar sin crear una cuenta.</p>
        <form onSubmit={join}>
          <label>
            Tu nombre
            <input required value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <button>Entrar al equipo</button>
        </form>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  if (teamRef)
    return (
      <main className="card">
        <h1>Abriendo equipo…</h1>
        {error && <p role="alert">{error}</p>}
      </main>
    );
  return (
    <main className="card">
      <p className="eyebrow">Crear equipo rápido</p>
      <h1>Coordina sin cuentas</h1>
      <p>Comparte un enlace para que otras personas se unan. El equipo será temporal.</p>
      <form onSubmit={create}>
        <label>
          Nombre del equipo
          <input required value={teamName} onChange={(e) => setTeamName(e.target.value)} />
        </label>
        <label>
          Tu nombre
          <input required value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <button>Crear equipo rápido</button>
      </form>
      {error && <p role="alert">{error}</p>}
    </main>
  );
}
