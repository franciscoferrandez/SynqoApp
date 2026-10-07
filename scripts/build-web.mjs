import { spawnSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const web = resolve(root, 'apps/web');
const args = process.argv.slice(2);
let output = 'dist/web';
for (let index = 0; index < args.length; index++) {
  if (args[index].startsWith('--output-path=')) output = args[index].slice('--output-path='.length);
  else if (args[index] === '--output-path') output = args[++index];
}
const build = spawnSync(process.execPath, [resolve(web, 'node_modules/@angular/cli/bin/ng.js'), 'build', ...args], { cwd: web, stdio: 'inherit' });
if (build.status !== 0) process.exit(build.status ?? 1);
const notices = spawnSync(process.execPath, [resolve(root, 'scripts/distribution-notices.mjs'), 'web', resolve(web, output)], { stdio: 'inherit' });
process.exit(notices.status ?? 1);
