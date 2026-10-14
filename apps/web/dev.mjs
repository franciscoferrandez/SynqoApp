import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const webRoot = path.dirname(fileURLToPath(import.meta.url));
const node = process.execPath;
const brandboard = spawn(node, [path.join(webRoot, 'brandboard-dev-server.mjs')], {
  cwd: webRoot,
  stdio: ['inherit', 'inherit', 'inherit', 'ipc'],
});
const angularCli = path.join(webRoot, 'node_modules/@angular/cli/bin/ng.js');
let angular;
let stopping = false;
let readyTimeout;

function stop(signal = 'SIGTERM') {
  if (stopping) return;
  stopping = true;
  brandboard.kill(signal);
  angular?.kill(signal);
}

process.on('SIGINT', () => stop('SIGINT'));
process.on('SIGTERM', () => stop('SIGTERM'));
brandboard.on('error', (error) => {
  console.error('No se pudo iniciar el servicio local de brandboard:', error.message);
  clearTimeout(readyTimeout);
  stop();
  process.exitCode = 1;
});
brandboard.on('exit', (code) => {
  clearTimeout(readyTimeout);
  if (!stopping && code !== 0) {
    console.error(`El servicio local de brandboard terminó con código ${code ?? 'desconocido'}.`);
    stop();
    process.exitCode = code ?? 1;
  }
});

function startAngular() {
  if (stopping || angular) return;
  clearTimeout(readyTimeout);
  angular = spawn(
    node,
    [angularCli, 'serve', '--proxy-config', 'proxy.conf.json', ...process.argv.slice(2)],
    { cwd: webRoot, stdio: 'inherit' },
  );
  angular.on('error', (error) => {
    console.error('No se pudo iniciar Angular:', error.message);
    stop();
    process.exitCode = 1;
  });
  angular.on('exit', (code) => {
    if (!stopping) {
      stopping = true;
      brandboard.kill('SIGTERM');
      process.exitCode = code ?? 1;
    }
  });
}

brandboard.on('message', (message) => {
  if (message?.type === 'ready') startAngular();
});
readyTimeout = setTimeout(() => {
  console.error('El servicio local de brandboard no confirmó que está listo.');
  stop();
  process.exitCode = 1;
}, 10_000);
