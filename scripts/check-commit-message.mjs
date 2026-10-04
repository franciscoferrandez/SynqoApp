import { readFileSync } from 'node:fs';
import { isValidCommitMessage } from './commit-message.mjs';

const message = readFileSync(process.argv[2], 'utf8');

if (!isValidCommitMessage(message)) {
  console.error('Mensaje inválido. Usa tipo(ambito): verbo en infinitivo + resumen, sin punto final.');
  console.error('Si usas !, añade un pie BREAKING CHANGE: con la incompatibilidad.');
  process.exit(1);
}
