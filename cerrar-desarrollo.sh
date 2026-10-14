#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$ROOT_DIR/.local-dev"
WEB_PID_FILE="$STATE_DIR/web.pid"

cd "$ROOT_DIR"

if [[ -f "$WEB_PID_FILE" ]]; then
  web_pid="$(cat "$WEB_PID_FILE")"
  if [[ "$web_pid" =~ ^[0-9]+$ ]] && kill -0 -- "-$web_pid" 2>/dev/null; then
    process_group="$(ps -o pgid= -p "$web_pid" 2>/dev/null | tr -d '[:space:]' || true)"
    if [[ -z "$process_group" || "$process_group" == "$web_pid" ]]; then
      echo "Deteniendo WEB (PID $web_pid)..."
      kill -TERM -- "-$web_pid" 2>/dev/null || true
      for _ in {1..5}; do
        kill -0 -- "-$web_pid" 2>/dev/null || break
        sleep 1
      done
      if kill -0 -- "-$web_pid" 2>/dev/null; then
        kill -KILL -- "-$web_pid" 2>/dev/null || true
      fi
    else
      echo "El PID guardado ya no corresponde al grupo de procesos de WEB; no lo detengo." >&2
    fi
  fi
  rm -f "$WEB_PID_FILE"
fi

if command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  echo "Deteniendo servicios de Docker (los datos locales se conservan)..."
  docker compose stop database api mail-worker mailpit
else
  echo "Docker Compose no está disponible; no se pudieron detener sus servicios." >&2
  exit 1
fi

echo "Synqo está detenido. El volumen de PostgreSQL se ha conservado."
