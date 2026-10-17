#!/usr/bin/env node
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readSync, writeFileSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../..', import.meta.url));
const railway = process.env.RAILWAY_TOOLKIT_BIN || 'railway';
const projectId = 'fb3655c5-ee5b-4a81-80df-11c0a8db1097';
const environment = 'preproduction';
const stateFile = process.env.RAILWAY_TOOLKIT_STATE_FILE || join(root, '.local-dev/railway-toolkit-state.json');
const cronSchedules = {
  'synqo-creation-limits-purge': '*/5 * * * *',
  'synqo-demo-reset': '0 * * * *',
};
const services = ['synqo-postgres', 'synqo-http', ...Object.keys(cronSchedules)];

function die(message) { throw new Error(message); }
function run(args, { capture = false, env = process.env } = {}) {
  const result = spawnSync(railway, args, {
    cwd: root,
    encoding: 'utf8',
    env,
    stdio: capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
  });
  if (result.error) die(`No se pudo ejecutar Railway: ${result.error.message}`);
  if (result.status !== 0) die(`Railway terminó con código ${result.status}: ${args.slice(0, 2).join(' ')}${capture ? `\n${result.stderr.trim()}` : ''}`);
  return result.stdout;
}
function status({ allowMissingEnvironment = false } = {}) {
  const raw = JSON.parse(run(['status', '--json'], { capture: true }));
  if (raw.id !== projectId || raw.name !== 'Synqo') die(`Proyecto inesperado: ${raw.name || '?'} (${raw.id || '?'}). No se realizará ninguna operación.`);
  const target = raw.environments?.edges?.find(({ node }) => node.name === environment && !node.deletedAt)?.node;
  if (!target && !allowMissingEnvironment) die('No existe el entorno preproduction en el proyecto esperado.');
  const list = target?.serviceInstances?.edges?.map(({ node }) => node) || [];
  return { raw, target, byName: new Map(list.map((entry) => [entry.serviceName, entry])) };
}
function targetService(snapshot, name) {
  if (!services.includes(name)) die(`Servicio no permitido: ${name}`);
  const service = snapshot.byName.get(name);
  if (!service) die(`No existe ${name} en preproduction.`);
  return service;
}
function persistedState() {
  if (!existsSync(stateFile)) return null;
  const state = JSON.parse(readFileSync(stateFile, 'utf8'));
  if (state.projectId !== projectId || state.environment !== environment) die('El estado local de pausa corresponde a otro destino.');
  return state;
}
function saveState(state) {
  mkdirSync(dirname(stateFile), { recursive: true });
  writeFileSync(stateFile, `${JSON.stringify(state, null, 2)}\n`, { mode: 0o600 });
}
function confirmation(expected) {
  if (!process.stdin.isTTY) die(`Esta operación exige una terminal interactiva y escribir ${expected}.`);
  process.stdout.write(`Escribe "${expected}" para continuar: `);
  const buffer = Buffer.alloc(256);
  const count = readSync(process.stdin.fd, buffer, 0, buffer.length, null);
  if (buffer.toString('utf8', 0, count).trim() !== expected) die('Operación cancelada.');
}

function isRunning(service) {
  return service?.activeDeployments?.some(({ instances }) => instances?.some(({ status }) => status === 'RUNNING')) || false;
}

function printStatus(snapshot) {
  console.log(`Synqo · ${environment} · ${projectId}`);
  for (const name of services) {
    const service = snapshot.byName.get(name);
    if (!service) { console.log(`${name}: no creado`); continue; }
    const deployment = service.latestDeployment;
    const running = isRunning(service);
    console.log(`${name}: ${deployment?.status || 'sin despliegue'}${running ? ' · en ejecución' : ''}${service.cronSchedule ? ` · Cron ${service.cronSchedule} UTC` : ''}`);
  }
  if (persistedState()) console.log('Existe una pausa local registrada para este proyecto.');
}
function cronFlags(snapshot) {
  return {
    ...process.env,
    SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON: snapshot.byName.has('synqo-demo-reset') ? '1' : '0',
    SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE: snapshot.byName.has('synqo-creation-limits-purge') ? '1' : '0',
  };
}
function ensureNotPaused() {
  if (persistedState()) die('Hay una pausa pendiente o activa. Completa resume antes de aplicar IaC o publicar código.');
}
function waitRunning(name, seconds = 300) {
  const end = Date.now() + seconds * 1000;
  while (Date.now() < end) {
    const service = targetService(status(), name);
    if (isRunning(service) && service.latestDeployment?.status === 'SUCCESS') return;
    spawnSync('sleep', ['5']);
  }
  die(`${name} no figura en ejecución tras ${seconds} segundos. Revisa los logs antes de continuar.`);
}
function usage() {
  console.log(`Uso: ./railway-toolkit.sh <orden> [argumentos]

  status                       Estado de preproducción
  plan | apply                 IaC con Cron existentes preservados
  logs <servicio>              Últimas 100 líneas del servicio
  cron-run <purge|demo-reset>  Ejecución puntual del Cron
  pause                        Preparar y, tras desactivar Cron/autodeploy, parar HTTP y PostgreSQL
  cancel-pause                 Cancelar preparación si no se ha parado ningún servicio
  resume                       Reanudar DB, HTTP y horarios Cron; autodeploy se reactiva en Railway
  publish                      Publicar DB y HTTP tras create/apply y configurar secretos/fuente
  deploy-local <servicio>      Subir código local limpio (acción excepcional)
  destroy --data-loss-accepted Borrar preproduction tras revisar la pérdida de datos
  create                       Crear entorno y mostrar el plan IaC; después ejecutar apply

El toolkit no ejecuta comandos remotos al mostrar esta ayuda.`);
}

function main() {
  const [command, argument] = process.argv.slice(2);
  if (!command || ['help', '--help', '-h'].includes(command)) return usage();
  if (!['status', 'plan', 'apply', 'logs', 'cron-run', 'pause', 'cancel-pause', 'resume', 'publish', 'deploy-local', 'destroy', 'create'].includes(command)) die(`Orden desconocida: ${command}`);
  const snapshot = status({ allowMissingEnvironment: command === 'create' });
  if (command === 'status') return printStatus(snapshot);
  if (command === 'logs') {
    targetService(snapshot, argument);
    return run(['logs', '--service', argument, '--environment', environment, '--lines', '100']);
  }
  if (command === 'cron-run') {
    const name = argument === 'purge' ? 'synqo-creation-limits-purge' : argument === 'demo-reset' ? 'synqo-demo-reset' : null;
    if (!name) die('Elige purge o demo-reset.');
    const service = targetService(snapshot, name);
    if (!service.cronSchedule) die(`${name} no tiene horario activo.`);
    confirmation(argument === 'demo-reset' ? 'RESET DEMO preproduction' : 'PURGAR LIMITES preproduction');
    return run(['cron', 'run', '--service', name, '--environment', environment, '--project', projectId, '--yes']);
  }
  if (command === 'plan' || command === 'apply') {
    ensureNotPaused();
    const vars = cronFlags(snapshot);
    run(['config', 'plan', '--environment', environment], { env: vars });
    if (command === 'apply') {
      confirmation('APLICAR preproduction');
      run(['config', 'apply', '--environment', environment], { env: vars });
    }
    return;
  }
  if (command === 'pause') {
    let state = persistedState();
    if (!state) {
      state = {
        projectId, environment,
        crons: Object.fromEntries(Object.keys(cronSchedules)
          .filter((name) => snapshot.byName.get(name)?.cronSchedule)
          .map((name) => [name, snapshot.byName.get(name).cronSchedule])),
      };
      saveState(state);
    }
    const scheduled = Object.keys(cronSchedules).filter((name) => snapshot.byName.get(name)?.cronSchedule);
    if (scheduled.length) {
      console.log(`Pausa preparada. Desactiva en Railway el horario de: ${scheduled.join(', ')}. Desactiva también Automatic Deployments de los servicios GitHub. Después repite pause. No se ha parado ningún servicio.`);
      return;
    }
    const activeCron = Object.keys(cronSchedules).find((name) => isRunning(snapshot.byName.get(name)));
    if (activeCron) die(`El Cron ${activeCron} sigue ejecutándose. Espera a que termine antes de parar PostgreSQL.`);
    if (process.argv[3] !== '--autodeploy-disabled') die('Confirma que Automatic Deployments está desactivado en HTTP y ambos Cron con: pause --autodeploy-disabled');
    confirmation('PAUSAR preproduction');
    state.paused = true;
    saveState(state);
    for (const name of ['synqo-http', 'synqo-postgres']) {
      const service = targetService(status(), name);
      if (isRunning(service)) run(['down', '--service', name, '--environment', environment]);
    }
    console.log('HTTP y PostgreSQL detenidos. Los horarios Cron siguen desactivados. Conserva el volumen y el archivo local de estado.');
    return;
  }
  if (command === 'cancel-pause') {
    const state = persistedState();
    if (!state || state.paused) die('No hay preparación cancelable. Si los servicios ya se pararon, usa resume.');
    for (const [name, schedule] of Object.entries(state.crons)) {
      if (snapshot.byName.get(name)?.cronSchedule !== schedule) die(`Restaura primero el horario de ${name} en Railway.`);
    }
    unlinkSync(stateFile);
    console.log('Preparación de pausa cancelada. Comprueba Automatic Deployments en Railway.');
    return;
  }
  if (command === 'resume' || command === 'publish') {
    const state = persistedState();
    if (command === 'resume' && !state?.paused) die('No hay una pausa completa registrada en este equipo. Revisa status y Railway antes de reanudar.');
    if (command === 'publish' && state) die('Hay una pausa registrada. Usa resume o resuelve esa pausa primero.');
    targetService(snapshot, 'synqo-postgres');
    const httpBefore = targetService(snapshot, 'synqo-http');
    if (!isRunning(httpBefore) && !httpBefore.source?.repo) die('Conecta primero synqo-http al repositorio GitHub en Railway.');
    confirmation(command === 'resume' ? 'REANUDAR preproduction' : 'PUBLICAR preproduction');
    const db = targetService(status(), 'synqo-postgres');
    if (!isRunning(db)) {
      if (db.latestDeployment && db.latestDeployment.canRedeploy === false) die('PostgreSQL no permite redeploy desde su último despliegue. Revísalo en Railway.');
      run(['redeploy', '--service', 'synqo-postgres', '--environment', environment, '--project', projectId, '--yes']);
    }
    waitRunning('synqo-postgres');
    const http = targetService(status(), 'synqo-http');
    if (!isRunning(http)) {
      run(['redeploy', '--from-source', '--service', 'synqo-http', '--environment', environment, '--project', projectId, '--yes']);
    }
    waitRunning('synqo-http');
    if (command === 'publish') {
      console.log('PostgreSQL y HTTP publicados. Revisa /healthz y la API. Si configuras Cron, conéctalos a GitHub, despliega su imagen y revisa Cron Runs.');
      return;
    }
    // The prior schedules are restored only after DB and HTTP are available.
    for (const [name, schedule] of Object.entries(state.crons)) {
      if (cronSchedules[name] !== schedule) die(`Horario desconocido para ${name}; restáuralo manualmente.`);
      run(['environment', 'edit', '--project', projectId, '--environment', environment,
        '--service-config', name, 'deploy.cronSchedule', schedule,
        '--message', `Reanudar horario de ${name}`]);
    }
    unlinkSync(stateFile);
    console.log('Servicios reanudados. Comprueba /healthz, API y Cron Runs; vuelve a activar Automatic Deployments en Railway.');
    return;
  }
  if (command === 'deploy-local') {
    ensureNotPaused();
    if (!['synqo-http', 'synqo-demo-reset', 'synqo-creation-limits-purge'].includes(argument)) die('Elige un servicio de aplicación válido.');
    targetService(snapshot, argument);
    if (runGit(['status', '--porcelain']).trim()) die('El árbol Git contiene cambios: publica únicamente una versión limpia y revisada.');
    console.log('Esta publicación local puede diferir de main y el siguiente push puede sustituirla.');
    confirmation(`DESPLEGAR ${argument}`);
    return run(['up', '--service', argument, '--environment', environment, '--project', projectId]);
  }
  if (command === 'destroy') {
    if (persistedState()) die('Hay una pausa registrada. Reanúdala o resuélvela antes de borrar el entorno.');
    if (process.argv[3] !== '--data-loss-accepted') die('Antes de borrar, prepara una copia externa o acepta expresamente la pérdida de datos con destroy --data-loss-accepted.');
    console.log('Se borrará todo preproduction, incluido PostgreSQL. Este repositorio no configura copias de seguridad.');
    confirmation('BORRAR preproduction Y SUS DATOS');
    return run(['environment', 'delete', environment]);
  }
  if (command === 'create') {
    if (snapshot.target) die('preproduction ya existe. create solo se puede usar después de destroy.');
    confirmation('CREAR preproduction');
    run(['environment', 'new', environment]);
    run(['config', 'plan', '--environment', environment], { env: { ...process.env,
      SYNQO_ENABLE_PREPRODUCTION_DEMO_RESET_CRON: '0',
      SYNQO_ENABLE_PREPRODUCTION_CREATION_LIMITS_PURGE: '0',
    } });
    console.log('Entorno creado. Revisa el plan y ejecuta apply; después configura secretos, fuentes GitHub, dominio y despliegues según la guía de operación.');
  }
}
function runGit(args) {
  const result = spawnSync('git', args, { cwd: root, encoding: 'utf8' });
  if (result.status !== 0) die('No se pudo comprobar el estado de Git.');
  return result.stdout;
}

try { main(); } catch (error) { console.error(`Error: ${error.message}`); process.exitCode = 1; }
