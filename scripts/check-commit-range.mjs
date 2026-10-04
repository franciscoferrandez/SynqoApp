import { execFileSync } from 'node:child_process';
import { isValidCommitMessage } from './commit-message.mjs';

const base = process.argv[2];
if (!base || !/^[0-9a-f]{40}$/.test(base)) {
  console.error('Indica el SHA base del rango de commits.');
  process.exit(1);
}

const commits = execFileSync('git', ['log', '--format=%H', `${base}..HEAD`], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean);
for (const commit of commits) {
  const message = execFileSync('git', ['show', '-s', '--format=%B', commit], { encoding: 'utf8' });
  if (!isValidCommitMessage(message)) {
    console.error(`Mensaje de commit inválido: ${commit.slice(0, 8)} ${message.split('\n', 1)[0]}`);
    process.exitCode = 1;
  }
}
