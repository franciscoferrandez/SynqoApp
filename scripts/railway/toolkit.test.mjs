import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const root = new URL('../..', import.meta.url);
const projectId = 'fb3655c5-ee5b-4a81-80df-11c0a8db1097';
function fixture({ id = projectId, cron = true, environment = true, existingCrons = true } = {}) {
  const entries = [
    ['synqo-postgres', null],
    ['synqo-http', null],
    ['synqo-demo-reset', cron ? '0 * * * *' : null],
    ['synqo-creation-limits-purge', cron ? '*/5 * * * *' : null],
  ].filter(([serviceName]) => existingCrons || !serviceName.includes('purge') && !serviceName.includes('reset'));
  return {
    id, name: 'Synqo', environments: { edges: environment ? [{ node: {
      name: 'preproduction', deletedAt: null,
      serviceInstances: { edges: entries.map(([serviceName, cronSchedule]) => ({ node: {
        serviceName, cronSchedule, latestDeployment: { status: 'SUCCESS' },
        activeDeployments: serviceName === 'synqo-http' || serviceName === 'synqo-postgres'
          ? [{ instances: [{ status: 'RUNNING' }] }] : [],
      } })) },
    } }] : [] },
  };
}
function setup(t, options) {
  const temp = mkdtempSync(join(tmpdir(), 'synqo-railway-toolkit-'));
  t.after(() => rmSync(temp, { recursive: true, force: true }));
  const railway = join(temp, 'railway-mock');
  const calls = join(temp, 'calls.jsonl');
  const data = join(temp, 'status.json');
  const state = join(temp, 'pause.json');
  writeFileSync(data, JSON.stringify(fixture(options)));
  writeFileSync(railway, `#!/usr/bin/env node
const fs = require('node:fs');
const args = process.argv.slice(2);
fs.appendFileSync(process.env.MOCK_CALLS, JSON.stringify({args, demo: process.env.SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON, purge: process.env.SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE}) + '\\n');
if (args[0] === 'status') process.stdout.write(fs.readFileSync(process.env.MOCK_STATUS));
`);
  chmodSync(railway, 0o755);
  return {
    state,
    execute(...args) {
      return spawnSync('node', ['scripts/railway/toolkit.mjs', ...args], {
        cwd: root, encoding: 'utf8',
        env: { ...process.env, RAILWAY_TOOLKIT_BIN: railway, RAILWAY_TOOLKIT_STATE_FILE: state, MOCK_CALLS: calls, MOCK_STATUS: data },
      });
    },
    calls() { return existsSync(calls) ? readFileSync(calls, 'utf8').trim().split('\n').map(JSON.parse) : []; },
  };
}

test('help does not contact Railway', (t) => {
  const mock = setup(t);
  assert.equal(mock.execute('--help').status, 0);
  assert.deepEqual(mock.calls(), []);
});

test('status shows only the pinned preproduction services and schedules', (t) => {
  const mock = setup(t);
  const result = mock.execute('status');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /synqo-demo-reset: SUCCESS · Cron 0 \* \* \* \* UTC/);
  assert.deepEqual(mock.calls().map(({ args }) => args), [['status', '--json']]);
});

test('plan preserves existing Cron services rather than dropping them', (t) => {
  const mock = setup(t);
  const result = mock.execute('plan');
  assert.equal(result.status, 0, result.stderr);
  const calls = mock.calls();
  assert.deepEqual(calls[1].args, ['config', 'plan', '--environment', 'preproduction']);
  assert.equal(calls[1].demo, '1');
  assert.equal(calls[1].purge, '1');
});

test('plan keeps absent Cron services disabled', (t) => {
  const mock = setup(t, { existingCrons: false });
  const result = mock.execute('plan');
  assert.equal(result.status, 0, result.stderr);
  const plan = mock.calls()[1];
  assert.equal(plan.demo, '0');
  assert.equal(plan.purge, '0');
});

test('a wrong project blocks every write', (t) => {
  const mock = setup(t, { id: 'another-project' });
  const result = mock.execute('plan');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Proyecto inesperado/);
  assert.equal(mock.calls().length, 1);
});

test('first pause records the schedules but does not stop any service', (t) => {
  const mock = setup(t);
  const result = mock.execute('pause');
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Desactiva en Railway el horario/);
  assert.equal(mock.calls().length, 1);
  assert.deepEqual(JSON.parse(readFileSync(mock.state, 'utf8')).crons, {
    'synqo-demo-reset': '0 * * * *',
    'synqo-creation-limits-purge': '*/5 * * * *',
  });
});

test('a prepared pause can be cancelled only while schedules still match', (t) => {
  const mock = setup(t);
  assert.equal(mock.execute('pause').status, 0);
  const result = mock.execute('cancel-pause');
  assert.equal(result.status, 0, result.stderr);
  assert.equal(existsSync(mock.state), false);
  assert.deepEqual(mock.calls().map(({ args }) => args), [['status', '--json'], ['status', '--json']]);
});

test('pause refuses to stop services without confirmation of disabled autodeploy', (t) => {
  const mock = setup(t, { cron: false });
  const result = mock.execute('pause');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /autodeploy-disabled/);
  assert.equal(mock.calls().length, 1);
});

test('destroy requires explicit acknowledgement before any remote deletion', (t) => {
  const mock = setup(t);
  const result = mock.execute('destroy');
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /data-loss-accepted/);
  assert.equal(mock.calls().length, 1);
});
