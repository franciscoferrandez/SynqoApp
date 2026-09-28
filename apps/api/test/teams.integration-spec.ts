import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { MikroORM } from '@mikro-orm/postgresql';
import { Client } from 'pg';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';
import {
  AccessCredentialEntity,
  AvailabilityEntryEntity,
  ParticipantEntity,
  ParticipantSessionEntity,
  QuickTeamEntity,
} from '../src/entities/quick-team.entities.js';

const schema = [
  "create table teams (id uuid primary key, public_ref text not null unique, name text not null, mode text not null check (mode = 'QUICK'), time_zone text not null, quick_state text not null check (quick_state = 'ACTIVE'), last_relevant_activity_at timestamptz not null, created_at timestamptz not null default now())",
  'create table participants (id uuid primary key, team_id uuid not null references teams(id) on delete cascade, public_ref text not null, display_name text not null, is_active boolean not null default true, created_at timestamptz not null default now(), unique(team_id, public_ref))',
  'create table participant_sessions (id uuid primary key, team_id uuid not null references teams(id) on delete cascade, participant_id uuid not null references participants(id) on delete cascade, token_hash text not null unique, expires_at timestamptz not null, revoked_at timestamptz, created_at timestamptz not null default now())',
  "create table access_credentials (id uuid primary key, team_id uuid not null references teams(id) on delete cascade, public_ref text not null unique, type text not null check (type = 'PUBLIC_LINK'), scope text not null check (scope = 'TEAM_PUBLIC'), revoked_at timestamptz, created_at timestamptz not null default now())",
  "create table availability_entries (id uuid primary key, team_id uuid not null references teams(id) on delete cascade, participant_id uuid not null references participants(id) on delete cascade, local_date date not null, status text not null check (status in ('AVAILABLE','MAYBE','UNAVAILABLE')), source_request_id uuid, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(team_id, participant_id, local_date))",
];

describe('quick teams API', () => {
  let app: INestApplication;
  let database: { getConnectionUri(): string; stop(): Promise<unknown> };
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeAll(async () => {
    database = await new PostgreSqlContainer('postgres:17-alpine').start();
    process.env.DATABASE_URL = database.getConnectionUri();
    const client = new Client({ connectionString: database.getConnectionUri() });
    await client.connect();
    for (const statement of schema) await client.query(statement);
    await client.end();
    app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0, '127.0.0.1');
  });

  afterAll(async () => {
    await app?.close();
    await database?.stop();
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  async function create(name: string, participant = 'Creador') {
    const response = await fetch(`${await app.getUrl()}/api/v1/teams/quick`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        teamName: name,
        participantDisplayName: participant,
        timeZone: 'Europe/Madrid',
      }),
    });
    return {
      response,
      body: (await response.json()) as {
        team: { teamRef: string };
        participant: { displayName: string };
      },
    };
  }

  function contextualCookies(response: Response) {
    const raw = response.headers.get('set-cookie') ?? '';
    const session = raw.match(/synqo_context_session=([^;]+)/)?.[1] ?? '';
    const csrf = raw.match(/synqo_csrf=([^;]+)/)?.[1] ?? '';
    return { cookie: `synqo_context_session=${session}; synqo_csrf=${csrf}`, csrf };
  }

  it('integra MikroORM con las entidades de persistencia de Slice 1', () => {
    const orm = app.get(MikroORM);
    expect(orm.getMetadata().get(QuickTeamEntity).tableName).toBe('teams');
    expect(orm.getMetadata().get(ParticipantEntity).tableName).toBe('participants');
    expect(orm.getMetadata().get(AccessCredentialEntity).tableName).toBe('access_credentials');
    expect(orm.getMetadata().get(ParticipantSessionEntity).tableName).toBe('participant_sessions');
    expect(orm.getMetadata().get(AvailabilityEntryEntity).tableName).toBe('availability_entries');
  });

  it('crea equipo, participante y sesión contextual', async () => {
    const { response, body } = await create('Equipo de prueba');
    expect(response.status).toBe(201);
    expect(body.participant.displayName).toBe('Creador');
    const cookie = response.headers.get('set-cookie');
    const home = await fetch(`${await app.getUrl()}/api/v1/teams/${body.team.teamRef}/home`, {
      headers: { cookie: cookie ?? '' },
    });
    expect(home.status).toBe(200);
  });

  it('permite un segundo participante sin apropiarse del creador', async () => {
    const { body } = await create('Equipo compartido', 'Alex');
    const joined = await fetch(
      `${await app.getUrl()}/api/v1/teams/${body.team.teamRef}/participants`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ displayName: 'Alex' }),
      },
    );
    expect(joined.status).toBe(201);
    await expect(joined.json()).resolves.toMatchObject({
      displayName: 'Alex',
      linkedAccount: false,
    });
  });

  it('rechaza zona horaria inválida y contexto de otro equipo', async () => {
    const invalid = await fetch(`${await app.getUrl()}/api/v1/teams/quick`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        teamName: 'Inválido',
        participantDisplayName: 'Ana',
        timeZone: 'UTC+99',
      }),
    });
    expect(invalid.status).toBe(400);
    const first = await create('Equipo A');
    const second = await create('Equipo B');
    const denied = await fetch(
      `${await app.getUrl()}/api/v1/teams/${second.body.team.teamRef}/home`,
      { headers: { cookie: first.response.headers.get('set-cookie') ?? '' } },
    );
    expect(denied.status).toBe(403);
  });

  it('protege origen, CSRF e idempotencia', async () => {
    const payload = {
      teamName: 'Idempotente',
      participantDisplayName: 'Ana',
      timeZone: 'Europe/Madrid',
    };
    const first = await fetch(`${await app.getUrl()}/api/v1/teams/quick`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': 'same-key' },
      body: JSON.stringify(payload),
    });
    const second = await fetch(`${await app.getUrl()}/api/v1/teams/quick`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': 'same-key' },
      body: JSON.stringify(payload),
    });
    expect(((await first.json()) as { team: { teamRef: string } }).team.teamRef).toBe(
      ((await second.json()) as { team: { teamRef: string } }).team.teamRef,
    );
    const conflict = await fetch(`${await app.getUrl()}/api/v1/teams/quick`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'idempotency-key': 'same-key' },
      body: JSON.stringify({ ...payload, teamName: 'Distinto' }),
    });
    expect(conflict.status).toBe(409);
    expect(conflict.headers.get('content-type')).toContain('application/problem+json');
    const origin = await fetch(`${await app.getUrl()}/api/v1/teams/quick`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: 'https://evil.example' },
      body: JSON.stringify(payload),
    });
    expect(origin.status).toBe(403);
    const cookie = first.headers.get('set-cookie') ?? '';
    const csrf = cookie.match(/synqo_csrf=([^;]+)/)?.[1] ?? '';
    const csrfFailure = await fetch(`${await app.getUrl()}/api/v1/teams/id/participants`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', cookie },
      body: JSON.stringify({ displayName: 'Otro' }),
    });
    expect(csrfFailure.status).toBe(403);
    expect(csrf).not.toBe('');
  });

  it('guarda disponibilidad propia por día y deriva sin respuesta por ausencia', async () => {
    const created = await create('Disponibilidad');
    const { cookie, csrf } = contextualCookies(created.response);
    const url = `${await app.getUrl()}/api/v1/teams/${created.body.team.teamRef}/availability/me`;
    const updated = await fetch(url, {
      method: 'PUT',
      headers: {
        'content-type': 'application/json',
        cookie,
        'x-csrf-token': csrf,
        'idempotency-key': 'availability-1',
      },
      body: JSON.stringify({
        entries: [
          { date: '2026-10-12', status: 'AVAILABLE' },
          { date: '2026-10-14', status: 'MAYBE' },
        ],
      }),
    });
    expect(updated.status).toBe(200);
    const listed = await fetch(`${url}?from=2026-10-12&to=2026-10-15`, { headers: { cookie } });
    await expect(listed.json()).resolves.toEqual({
      entries: [
        { date: '2026-10-12', status: 'AVAILABLE' },
        { date: '2026-10-14', status: 'MAYBE' },
      ],
    });
    const replacement = await fetch(url, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie, 'x-csrf-token': csrf },
      body: JSON.stringify({ entries: [{ date: '2026-10-12', status: 'UNAVAILABLE' }] }),
    });
    expect(replacement.status).toBe(200);
    const cleared = await fetch(`${url}/2026-10-12`, {
      method: 'DELETE',
      headers: {
        cookie,
        'x-csrf-token': csrf,
        'idempotency-key': 'availability-clear-1',
      },
    });
    expect(cleared.status).toBe(200);
    const clearRetry = await fetch(`${url}/2026-10-12`, {
      method: 'DELETE',
      headers: {
        cookie,
        'x-csrf-token': csrf,
        'idempotency-key': 'availability-clear-1',
      },
    });
    expect(clearRetry.status).toBe(200);
    const afterClear = await fetch(`${url}?from=2026-10-12&to=2026-10-15`, {
      headers: { cookie },
    });
    await expect(afterClear.json()).resolves.toEqual({
      entries: [{ date: '2026-10-14', status: 'MAYBE' }],
    });
  });

  it('rechaza estados inválidos y el acceso de otro equipo', async () => {
    const first = await create('Equipo disponible A');
    const second = await create('Equipo disponible B');
    const { cookie, csrf } = contextualCookies(first.response);
    const own = `${await app.getUrl()}/api/v1/teams/${first.body.team.teamRef}/availability/me`;
    const invalid = await fetch(own, {
      method: 'PUT',
      headers: { 'content-type': 'application/json', cookie, 'x-csrf-token': csrf },
      body: JSON.stringify({ entries: [{ date: '2026-10-12', status: 'UNANSWERED' }] }),
    });
    expect(invalid.status).toBe(400);
    expect(invalid.headers.get('content-type')).toContain('application/problem+json');
    const other = `${await app.getUrl()}/api/v1/teams/${second.body.team.teamRef}/availability/me?from=2026-10-12&to=2026-10-12`;
    expect((await fetch(other, { headers: { cookie } })).status).toBe(403);
  });

  it('revierte la creación rápida si falla una escritura de la transacción', async () => {
    const client = new Client({ connectionString: database.getConnectionUri() });
    await client.connect();
    await client.query('drop table participant_sessions');

    const { response } = await create('No parcial');
    expect(response.status).toBe(500);

    const result = await client.query('select count(*)::int as count from teams where name = $1', [
      'No parcial',
    ]);
    expect(result.rows[0].count).toBe(0);
    await client.end();
  });

  it('limita el abuso de las creaciones públicas', async () => {
    let limited = false;
    for (let attempt = 0; attempt < 130; attempt += 1) {
      const response = await fetch(`${await app.getUrl()}/api/v1/teams/quick`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          teamName: 'No persistir',
          participantDisplayName: 'Abuso',
          timeZone: 'UTC+99',
        }),
      });
      if (response.status === 429) {
        limited = true;
        break;
      }
    }
    expect(limited).toBe(true);
  });
});
