#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

local_uid="$(id -u)"
local_gid="$(id -g)"
docker compose run --rm --no-deps --user root web-visual-test \
  chown -R "$local_uid:$local_gid" /workspace/apps/web/node_modules

# This profile points DATABASE_URL and POSTGRES_DB only at synqo_test. The
# guard in composer db:reset:test verifies the target before dropping it.
docker compose up -d database
docker compose --profile e2e run --rm api-e2e composer db:reset:test
docker compose --profile e2e up -d api-e2e
cleanup() {
  docker compose --profile e2e stop api-e2e >/dev/null 2>&1 || true
}
trap cleanup EXIT

container_command='lock_hash=$(sha256sum package-lock.json | cut -d " " -f1)
cached_hash=$(cat node_modules/.visual-lock-hash 2>/dev/null || true)
if [[ ! -x node_modules/.bin/playwright || "$cached_hash" != "$lock_hash" ]]; then
  npm ci --cache /tmp/npm-cache --no-audit --no-fund
  printf "%s" "$lock_hash" > node_modules/.visual-lock-hash
fi
export WEB_PROXY_CONFIG=proxy.e2e.conf.json
exec npx playwright test e2e/events-real.spec.ts'

docker compose run --rm --no-deps --user "$local_uid:$local_gid" \
  -e HOME=/tmp -e npm_config_cache=/tmp/npm-cache web-visual-test \
  bash -lc "$container_command" run-web-real-e2e
