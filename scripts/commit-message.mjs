export function isValidCommitMessage(message) {
  const heading = message.split('\n', 1)[0];
  const pattern = /^(feat|fix|docs|refactor|test|perf|style|build|ci|chore|revert)\([a-z]+(?:-[a-z]+)*\)(!)?: ([a-záéíóúñ]+(?:ar|er|ir))\b .+[^.]$/u;
  const match = heading.match(pattern);
  return Boolean(match) && Boolean(match[2]) === message.includes('BREAKING CHANGE:');
}
