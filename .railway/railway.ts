import { defineRailway, postgres, preserve, project, service, type ProjectResourceInput } from 'railway/iac';

const appImage = {
  builder: 'DOCKERFILE' as const,
  dockerfilePath: 'Dockerfile.railway',
};

export default defineRailway((context) => {
  if (context.environment && context.environment !== 'preproduction') {
    throw new Error('Esta definición solo puede aplicarse al entorno preproduction.');
  }

  const database = postgres('synqo-postgres');
  const http = service('synqo-http', {
    build: appImage,
    start: 'frankenphp run --config /etc/frankenphp/Caddyfile --adapter caddyfile',
    healthcheck: '/healthz',
    healthcheckTimeout: 30,
    preDeploy: 'php bin/console doctrine:migrations:migrate --no-interaction',
    replicas: 1,
    env: {
      APP_ENV: 'prod',
      APP_DEBUG: '0',
      APP_SECRET: preserve(),
      APP_PUBLIC_URL: 'https://${{RAILWAY_PUBLIC_DOMAIN}}',
      DEFAULT_URI: 'https://${{RAILWAY_PUBLIC_DOMAIN}}',
      DATABASE_URL: database.env.DATABASE_URL,
      SYNQO_DEPLOYMENT_ENV: 'preproduction',
      TEAM_CREATION_EMAIL_ENABLED: 'false',
      TEAM_CREATION_LIMIT: '2',
      TEAM_CREATION_WINDOW_MINUTES: '60',
      TEAM_DELETION_RETENTION_DAYS: '90',
      MAILER_DSN: 'null://null',
      MAIL_EVENT_TTL_SECONDS: '1800',
    },
  });

  const resources: ProjectResourceInput[] = [database, http];

  // The reset job remains absent from the desired state until the operator
  // explicitly opts in after deploy verification and SPEC-EQU-006 is ready.
  const processEnvironment = (globalThis as typeof globalThis & {
    process?: { env?: Record<string, string | undefined> };
  }).process?.env;
  if (processEnvironment?.SYNQO_ENABLE_PREPRODUCTION_CRONS === '1') {
    resources.push(service('synqo-demo-reset', {
      build: appImage,
      start: 'php bin/console app:demo:reset --force --no-interaction',
      deploy: { cronSchedule: '0 * * * *', restartPolicyType: 'NEVER' },
      env: {
        APP_ENV: 'prod',
        APP_DEBUG: '0',
        APP_SECRET: http.env.APP_SECRET,
        APP_PUBLIC_URL: http.env.APP_PUBLIC_URL,
        DEFAULT_URI: http.env.DEFAULT_URI,
        DATABASE_URL: database.env.DATABASE_URL,
        SYNQO_DEPLOYMENT_ENV: 'preproduction',
        TEAM_CREATION_EMAIL_ENABLED: 'false',
        MAILER_DSN: 'null://null',
      },
    }));

    resources.push(service('synqo-creation-limits-purge', {
      build: appImage,
      start: 'php bin/console app:creation-limits:purge --no-interaction',
      deploy: { cronSchedule: '*/5 * * * *', restartPolicyType: 'NEVER' },
      env: {
        APP_ENV: 'prod',
        APP_DEBUG: '0',
        APP_SECRET: http.env.APP_SECRET,
        APP_PUBLIC_URL: http.env.APP_PUBLIC_URL,
        DEFAULT_URI: http.env.DEFAULT_URI,
        DATABASE_URL: database.env.DATABASE_URL,
        SYNQO_DEPLOYMENT_ENV: 'preproduction',
        TEAM_CREATION_EMAIL_ENABLED: 'false',
        MAILER_DSN: 'null://null',
      },
    }));
  }

  return project('Synqo', {
    environments: ['preproduction'],
    resources,
  });
});
