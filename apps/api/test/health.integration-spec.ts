import type { INestApplication } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { PostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { AppModule } from '../src/app.module.js';

describe('healthcheck', () => {
  let app: INestApplication;
  let database: { getConnectionUri(): string; stop(): Promise<unknown> };
  const originalDatabaseUrl = process.env.DATABASE_URL;

  beforeAll(async () => {
    database = await new PostgreSqlContainer('postgres:17-alpine').start();
    process.env.DATABASE_URL = database.getConnectionUri();

    app = await NestFactory.create(AppModule, { logger: false });
    await app.listen(0, '127.0.0.1');
  });

  afterAll(async () => {
    await app?.close();
    await database?.stop();
    process.env.DATABASE_URL = originalDatabaseUrl;
  });

  it('reports the database as available', async () => {
    const response = await fetch(`${await app.getUrl()}/health`);

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      status: 'ok',
      info: { database: { status: 'up' } },
    });
  });

  it('does not expose connection details when the database is unavailable', async () => {
    const databaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = 'postgresql://synqo:synqo@127.0.0.1:1/synqo';

    try {
      const response = await fetch(`${await app.getUrl()}/health`);

      expect(response.status).toBe(503);
      await expect(response.json()).resolves.toEqual({
        status: 'error',
        message: 'Database unavailable',
      });
    } finally {
      process.env.DATABASE_URL = databaseUrl;
    }
  });
});
