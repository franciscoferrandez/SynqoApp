import { execFileSync } from 'node:child_process';

function paths(args) {
  return new Set(
    execFileSync('git', ['diff', '--name-only', ...args, '--', 'apps/api'], { encoding: 'utf8' })
      .trim()
      .split('\n')
      .filter(Boolean),
  );
}

const staged = paths(['--cached']);
const unstaged = paths([]);
const partial = [...staged].filter((path) => unstaged.has(path));
if (partial.length) {
  console.error('Prepara completos los archivos API antes del commit:');
  for (const path of partial) console.error(`- ${path}`);
  process.exit(1);
}
