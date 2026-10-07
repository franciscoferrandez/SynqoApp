#!/usr/bin/env bash
set -euo pipefail

root_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
suffix="${$}-${RANDOM}"
network="synqo-coo006-${suffix}"
database="synqo-coo006-db-${suffix}"
application="synqo-coo006-app-${suffix}"
image="synqo-railway-local:coo-006"
database_password="local-smoke-only-${suffix}"

cleanup() {
  status=$?
  if [ "$status" -ne 0 ] && docker container inspect "$application" >/dev/null 2>&1; then
    docker logs "$application" >&2 || true
  fi
  docker rm -f "$application" "$database" >/dev/null 2>&1 || true
  docker network rm "$network" >/dev/null 2>&1 || true
  exit "$status"
}
trap cleanup EXIT

cd "$root_dir"
docker build -f Dockerfile.railway -t "$image" .
docker network create "$network" >/dev/null
docker run -d --name "$database" --network "$network" \
  -e POSTGRES_DB=synqo -e POSTGRES_USER=synqo -e "POSTGRES_PASSWORD=$database_password" \
  postgres:18-alpine >/dev/null

database_ready=0
for _ in $(seq 1 60); do
  if docker exec "$database" pg_isready -U synqo -d synqo >/dev/null 2>&1; then
    database_ready=1
    break
  fi
  sleep 1
done
[ "$database_ready" -eq 1 ]

database_url="postgresql://synqo:${database_password}@${database}:5432/synqo?charset=utf8"
docker run --rm --network "$network" \
  -e APP_ENV=prod -e APP_DEBUG=0 -e APP_SECRET=local-smoke-only-secret \
  -e APP_PUBLIC_URL=http://localhost -e DEFAULT_URI=http://localhost \
  -e "DATABASE_URL=$database_url" -e MAILER_DSN=null://null \
  -e TEAM_CREATION_EMAIL_ENABLED=false -e SYNQO_DEPLOYMENT_ENV=preproduction \
  -e TEAM_CREATION_LIMIT=2 -e TEAM_CREATION_WINDOW_MINUTES=60 \
  "$image" php bin/console doctrine:migrations:migrate --no-interaction

docker run -d --name "$application" --network "$network" -p 127.0.0.1::8080 \
  -e PORT=8080 -e APP_ENV=prod -e APP_DEBUG=0 -e APP_SECRET=local-smoke-only-secret \
  -e APP_PUBLIC_URL=http://localhost -e DEFAULT_URI=http://localhost \
  -e "DATABASE_URL=$database_url" -e MAILER_DSN=null://null \
  -e TEAM_CREATION_EMAIL_ENABLED=false -e SYNQO_DEPLOYMENT_ENV=preproduction \
  -e TEAM_CREATION_LIMIT=2 -e TEAM_CREATION_WINDOW_MINUTES=60 \
  "$image" >/dev/null

port="$(docker port "$application" 8080/tcp | sed 's/.*://')"
base_url="http://127.0.0.1:${port}"
http_ready=0
for _ in $(seq 1 30); do
  if curl --fail --silent "$base_url/healthz" >/dev/null 2>&1; then
    http_ready=1
    break
  fi
  sleep 1
done
[ "$http_ready" -eq 1 ]

SMOKE_BASE_URL="$base_url" node --input-type=module <<'NODE'
import assert from 'node:assert/strict';

const baseUrl = process.env.SMOKE_BASE_URL;
const health = await fetch(`${baseUrl}/healthz`);
assert.equal(health.status, 200);

const web = await fetch(`${baseUrl}/`);
assert.equal(web.status, 200);
assert.match(await web.text(), /<app-root/);

const configuration = await fetch(`${baseUrl}/api/configuration`);
assert.equal(configuration.status, 200);
assert.deepEqual(await configuration.json(), {
  teamCreationEmailEnabled: false,
  teamCreationMaxTeams: 2,
  teamCreationWindowMinutes: 60,
});

const unknownApi = await fetch(`${baseUrl}/api/no-such-route`);
assert.equal(unknownApi.status, 404);
assert.doesNotMatch(await unknownApi.text(), /<app-root/);

for (const path of [
  '/SYNQO-LICENSE.txt',
  '/THIRD_PARTY_NOTICES.txt',
  '/3rdpartylicenses.txt',
  '/ANGULAR-TEMPLATES-LICENSE.txt',
  '/SERVER-THIRD-PARTY-NOTICES.txt',
  '/frankenphp-LICENSE.txt',
  '/caddy-LICENSE.txt',
  '/php-LICENSE.txt',
]) {
  const response = await fetch(`${baseUrl}${path}`);
  assert.equal(response.status, 200, `Missing distribution notice ${path}`);
  assert.ok((await response.text()).length > 0, `Empty distribution notice ${path}`);
}

console.log('PASS: health, SPA, API configuration, API 404 and eight distribution notices');
NODE
