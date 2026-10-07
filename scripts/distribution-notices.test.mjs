import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const run = (...args) => spawnSync(process.execPath, ['scripts/distribution-notices.mjs', ...args], { encoding: 'utf8' });
const fixture = (t) => {
  const directory = mkdtempSync(join(tmpdir(), 'synqo-notices-'));
  t.after(() => rmSync(directory, { recursive: true, force: true }));
  return directory;
};

test('WEB preserves generated notices and rejects builds missing Inter attribution', (t) => {
  const directory = fixture(t);
  mkdirSync(join(directory, 'browser/fonts'), { recursive: true });
  writeFileSync(join(directory, '3rdpartylicenses.txt'), 'Package: example\nMIT\nCopyright: fixture\n');
  copyFileSync('apps/web/public/fonts/LICENSE.txt', join(directory, 'browser/fonts/LICENSE.txt'));
  assert.equal(run('web', directory).status, 0);
  assert.equal(readFileSync(join(directory, 'browser/3rdpartylicenses.txt'), 'utf8'), readFileSync(join(directory, '3rdpartylicenses.txt'), 'utf8'));
  assert.equal(readFileSync(join(directory, 'browser/SYNQO-LICENSE.txt'), 'utf8'), readFileSync('LICENSE', 'utf8'));
  writeFileSync(join(directory, 'browser/fonts/LICENSE.txt'), 'removed attribution');
  assert.notEqual(run('web', directory).status, 0);
  rmSync(join(directory, '3rdpartylicenses.txt'));
  assert.notEqual(run('web', directory).status, 0);
});

test('API refuses an incomplete package license or a staging containing development packages', (t) => {
  const directory = fixture(t);
  mkdirSync(join(directory, 'vendor/composer'), { recursive: true });
  mkdirSync(join(directory, 'vendor/example/library'), { recursive: true });
  const library = { name: 'example/library', version: '1.0.0', license: ['MIT'] };
  writeFileSync(join(directory, 'composer.lock'), JSON.stringify({ packages: [library], 'packages-dev': [{ name: 'example/dev' }] }));
  writeFileSync(join(directory, 'vendor/composer/installed.json'), JSON.stringify({ packages: [library] }));
  copyFileSync('apps/api/LICENSE', join(directory, 'LICENSE'));
  writeFileSync(join(directory, 'vendor/composer/LICENSE'), 'Composer fixture');
  assert.notEqual(run('api', directory, '--production').status, 0);
  writeFileSync(join(directory, 'vendor/example/library/LICENSE'), 'Library copyright fixture');
  assert.equal(run('api', directory, '--production').status, 0);
  assert.match(readFileSync(join(directory, 'THIRD_PARTY_NOTICES.txt'), 'utf8'), /Library copyright fixture/);
  writeFileSync(join(directory, 'vendor/composer/installed.json'), JSON.stringify({ packages: [library, { name: 'example/dev' }] }));
  assert.notEqual(run('api', directory, '--production').status, 0);
});
