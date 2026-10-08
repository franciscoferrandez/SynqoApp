import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createRailwayContext, project } from 'railway/iac';
import railwayModule from '../.railway/railway.ts';

// The repository root is CommonJS for Node tooling, so tsx wraps the TypeScript
// default export one level below its interop default.
const railway = railwayModule.default ?? railwayModule;

test('IaC describe preproduction without source transfer or active cron jobs by default', async () => {
  const previousPurge = process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE;
  const previousDemo = process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON;
  delete process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE;
  delete process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON;
  try {
    const definition = await railway(createRailwayContext({ environment: 'preproduction' }), project);

    assert.equal(definition.name, 'Synqo');
    assert.deepEqual(definition.environments, ['preproduction']);
    assert.deepEqual(definition.resources.map(({ name }) => name).sort(), ['synqo-http', 'synqo-postgres']);

    const http = definition.resources.find(({ name }) => name === 'synqo-http');
    assert.equal(http.build.dockerfilePath, 'Dockerfile.railway');
    assert.equal(http.deploy.healthcheckPath, '/healthz');
    assert.equal(http.deploy.preDeployCommand[0], 'php bin/console doctrine:migrations:migrate --no-interaction');
    assert.equal(http.variables.APP_ENV.value, 'prod');
    assert.equal(http.variables.DEFAULT_URI.value, 'https://${{RAILWAY_PUBLIC_DOMAIN}}');
    assert.equal(http.variables.TEAM_CREATION_EMAIL_ENABLED.value, 'false');
    assert.equal(http.variables.TEAM_CREATION_LIMIT.value, '2');
    assert.equal(http.variables.TEAM_CREATION_WINDOW_MINUTES.value, '60');
    assert.equal(http.variables.APP_SECRET.type, 'preserve');
    assert.equal(http.variables.DEMO_ACCESS_SECRET.type, 'preserve');
    assert.equal(http.variables.DEMO_DATABASE_HOST.value, '${{synqo-postgres.RAILWAY_PRIVATE_DOMAIN}}');
    assert.equal(Object.hasOwn(http, 'source'), false);

    const database = definition.resources.find(({ name }) => name === 'synqo-postgres');
    assert.equal(database.type, 'database');
    assert.match(database.image, /postgres[^:]*:18$/);
  } finally {
    if (previousPurge !== undefined) process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE = previousPurge;
    else delete process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE;
    if (previousDemo !== undefined) process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON = previousDemo;
    else delete process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON;
  }
});

test('IaC enables the purge cron independently from the destructive demo reset', async () => {
  const previous = process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE;
  const previousDemo = process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON;
  process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE = '1';
  delete process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON;
  try {
    const definition = await railway(createRailwayContext({ environment: 'preproduction' }), project);
    const purge = definition.resources.find(({ name }) => name === 'synqo-creation-limits-purge');

    assert.equal(definition.resources.some(({ name }) => name === 'synqo-demo-reset'), false);
    assert.equal(purge.deploy.cronSchedule, '*/5 * * * *');
    assert.equal(purge.deploy.startCommand, 'php bin/console app:creation-limits:purge --no-interaction');
    assert.equal(purge.source, undefined);
  } finally {
    if (previous !== undefined) process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE = previous;
    else delete process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE;
    if (previousDemo !== undefined) process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON = previousDemo;
    else delete process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON;
  }
});

test('IaC adds the guarded hourly reset only after its separate explicit opt-in', async () => {
  const previous = process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON;
  process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON = '1';
  try {
    const definition = await railway(createRailwayContext({ environment: 'preproduction' }), project);
    const demo = definition.resources.find(({ name }) => name === 'synqo-demo-reset');
    assert.equal(demo.deploy.cronSchedule, '0 * * * *');
    assert.equal(demo.deploy.startCommand, 'php bin/console app:demo:reset --force --no-interaction');
    assert.equal(demo.variables.DEMO_RESET_ENABLED.value, 'true');
    assert.deepEqual(demo.variables.DEMO_ACCESS_SECRET, { type: 'reference', resource: 'service.synqo-http', output: 'DEMO_ACCESS_SECRET' });
    assert.deepEqual(demo.variables.DEMO_DATABASE_HOST, { type: 'reference', resource: 'service.synqo-http', output: 'DEMO_DATABASE_HOST' });
    assert.equal(demo.source, undefined);
  } finally {
    if (previous !== undefined) process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON = previous;
    else delete process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON;
  }
});

test('IaC refuses another explicitly selected Railway environment', async () => {
  assert.throws(
    () => railway(createRailwayContext({ environment: 'production' }), project),
    /solo puede aplicarse al entorno preproduction/,
  );
});
