#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
STATE_DIR="$ROOT_DIR/.local-dev"
WEB_PID_FILE="$STATE_DIR/web.pid"
WEB_LOG_FILE="$STATE_DIR/web.log"
web_pid=""

cd "$ROOT_DIR"

stop_web() {
  if [[ -z "$web_pid" ]]; then
    return
  fi

  if kill -0 -- "-$web_pid" 2>/dev/null; then
    kill -TERM -- "-$web_pid" 2>/dev/null || true
    for _ in {1..5}; do
      kill -0 -- "-$web_pid" 2>/dev/null || break
      sleep 1
    done
    if kill -0 -- "-$web_pid" 2>/dev/null; then
      kill -KILL -- "-$web_pid" 2>/dev/null || true
    fi
  fi

  wait "$web_pid" 2>/dev/null || true
  if [[ -f "$WEB_PID_FILE" ]] && [[ "$(cat "$WEB_PID_FILE")" == "$web_pid" ]]; then
    unlink "$WEB_PID_FILE"
  fi
  web_pid=""
}

handle_signal() {
  local signal="$1"
  trap - INT TERM
  stop_web
  if [[ "$signal" == INT ]]; then
    exit 130
  fi
  exit 143
}

trap 'handle_signal INT' INT
trap 'handle_signal TERM' TERM

if ! command -v docker >/dev/null 2>&1 || ! docker compose version >/dev/null 2>&1; then
  echo "Se necesita Docker con Docker Compose v2." >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Creado .env a partir de .env.example."
fi

# Genera la clave local de correo una sola vez y conserva el resto del .env.
if ! grep -Eq '^MAIL_EVENT_KEY=.+$' .env; then
  if ! command -v openssl >/dev/null 2>&1; then
    echo "Se necesita openssl para generar MAIL_EVENT_KEY." >&2
    exit 1
  fi
  mail_event_key="$(openssl rand -base64 32 | tr -d '\n')"
  temp_env="$(mktemp .env.XXXXXX)"
  awk -v key="$mail_event_key" '
    BEGIN { replaced = 0 }
    /^MAIL_EVENT_KEY=/ {
      if (!replaced) print "MAIL_EVENT_KEY=" key
      replaced = 1
      next
    }
    { print }
    END { if (!replaced) print "MAIL_EVENT_KEY=" key }
  ' .env > "$temp_env"
  mv "$temp_env" .env
  unset mail_event_key
fi

# Selecciona la versión fijada en .nvmrc cuando nvm está instalado.
nvm_script="${NVM_DIR:-${HOME:-}/.nvm}/nvm.sh"
if [[ -s "$nvm_script" ]]; then
  # shellcheck source=/dev/null
  . "$nvm_script"
  nvm use
else
  expected_node="$(tr -d '[:space:]' < .nvmrc)"
  current_node="$(node --version 2>/dev/null || true)"
  if [[ "${current_node#v}" != "$expected_node" ]]; then
    echo "Node.js $expected_node es necesario (versión actual: ${current_node:-no instalado}). Instálalo con nvm o instala esa versión." >&2
    exit 1
  fi
fi

if [[ ! -x apps/web/node_modules/.bin/ng ]]; then
  echo "Instalando dependencias de WEB..."
  npm --prefix apps/web ci
fi

mkdir -p "$STATE_DIR"
if [[ -f "$WEB_PID_FILE" ]]; then
  old_pid="$(cat "$WEB_PID_FILE")"
  if [[ "$old_pid" =~ ^[0-9]+$ ]] && kill -0 "$old_pid" 2>/dev/null; then
    echo "El servidor WEB ya está iniciado (PID $old_pid). Usa ./cerrar-desarrollo.sh antes de volver a arrancarlo." >&2
    exit 1
  fi
  rm -f "$WEB_PID_FILE"
fi

echo "Levantando PostgreSQL, API, correo y worker..."
docker compose up -d --build database api mail-worker mailpit

echo "Instalando/verificando dependencias de API..."
docker compose exec -T api composer install --no-interaction

echo "Aplicando migraciones pendientes..."
docker compose exec -T api php bin/console doctrine:migrations:migrate --no-interaction

echo "Iniciando WEB en primer plano..."
setsid bash -o pipefail -c 'cd "$1/apps/web" && npm start 2>&1 | tee -a "$2"' _ "$ROOT_DIR" "$WEB_LOG_FILE" &
web_pid=$!
printf '%s\n' "$web_pid" > "$WEB_PID_FILE"

web_ready=false
for _ in {1..60}; do
  web_state="$(ps -o stat= -p "$web_pid" 2>/dev/null | tr -d '[:space:]' || true)"
  if [[ -z "$web_state" || "$web_state" == Z* ]]; then
    break
  fi
  if (echo > /dev/tcp/127.0.0.1/4200) >/dev/null 2>&1; then
    web_ready=true
    break
  fi
  sleep 1
done

if [[ "$web_ready" != true ]]; then
  stop_web
  echo "Angular no pudo iniciarse. Consulta $WEB_LOG_FILE." >&2
  exit 1
fi

echo "Synqo está en marcha:"
echo "  WEB:     http://localhost:4200"
echo "  API:     http://localhost:8000"
echo "  Mailpit: http://localhost:8025"
echo "  Registro WEB: $WEB_LOG_FILE"
echo "La WEB permanece en primer plano. Pulsa Ctrl+C para detenerla; ./cerrar-desarrollo.sh detiene también los servicios de Docker."

web_exit_code=0
wait "$web_pid" || web_exit_code=$?
stop_web
exit "$web_exit_code"
