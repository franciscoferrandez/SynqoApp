#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"
local_uid="$(id -u)"
local_gid="$(id -g)"

# The dependency volume is shared between local runs; give it to the caller so
# reports and refreshed snapshots are writable from the host as well.
docker compose run --rm --no-deps --user root web-visual-test \
  chown -R "$local_uid:$local_gid" /workspace/apps/web/node_modules

container_command='lock_hash=$(sha256sum package-lock.json | cut -d " " -f1)
cached_hash=$(cat node_modules/.visual-lock-hash 2>/dev/null || true)
if [[ ! -x node_modules/.bin/playwright || "$cached_hash" != "$lock_hash" ]]; then
  npm ci --cache /tmp/npm-cache --no-audit --no-fund
  printf "%s" "$lock_hash" > node_modules/.visual-lock-hash
fi
exec npx playwright test visual-regressions.spec.ts --max-failures=1 "$@"'

docker compose run --rm --no-deps --user "$local_uid:$local_gid" \
  -e HOME=/tmp -e npm_config_cache=/tmp/npm-cache web-visual-test \
  bash -lc "$container_command" run-web-visual-e2e "$@"
