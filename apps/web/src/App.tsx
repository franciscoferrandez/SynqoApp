import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

type Team = { teamRef: string; name: string; timeZone: string };
type Home = { team: Team; currentActor: { participant: { displayName: string } } };
const api = '/api/v1';
const browserZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
const supportsShare = () => 'share' in (navigator as unknown as Record<string, unknown>);
const csrfToken = () => document.cookie.match(/(?:^|; )synqo_csrf=([^;]+)/)?.[1];
const mutationHeaders = () => ({
  'content-type': 'application/json',
  'idempotency-key': crypto.randomUUID(),
  ...(csrfToken() ? { 'x-csrf-token': csrfToken()! } : {}),
});

export function App() {
  const [team, setTeam] = useState<Team | null>(null);
  const [name, setName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [error, setError] = useState('');
  const [home, setHome] = useState<Home | null>(null);
  const [shareMessage, setShareMessage] = useState('');
  const teamRef = location.pathname.match(/^\/teams\/([^/]+)/)?.[1];
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
