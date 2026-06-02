#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"
BACKEND_PYTHON="$BACKEND_DIR/venv/bin/python"
BACKEND_HOST="${BACKEND_HOST:-127.0.0.1}"
BACKEND_PORT="${BACKEND_PORT:-8057}"
BACKEND_HEALTH_URL="http://$BACKEND_HOST:$BACKEND_PORT/health"

if [ ! -x "$BACKEND_PYTHON" ]; then
  echo "Backend virtualenv not found at backend/venv."
  echo "Run: cd backend && python -m venv venv && source venv/bin/activate && pip install -r requirements.txt"
  exit 1
fi

cleanup() {
  if [ -n "${BACKEND_PID:-}" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi

  if [ -n "${FRONTEND_PID:-}" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

cd "$BACKEND_DIR"
if "$BACKEND_PYTHON" -c '
import sys
import urllib.request

try:
    with urllib.request.urlopen(sys.argv[1], timeout=1) as response:
        sys.exit(0 if 200 <= response.status < 500 else 1)
except Exception:
    sys.exit(1)
' "$BACKEND_HEALTH_URL"; then
  echo "Using existing backend at $BACKEND_HEALTH_URL"
else
  "$BACKEND_PYTHON" -m uvicorn app.main:app \
    --host "$BACKEND_HOST" \
    --port "$BACKEND_PORT" \
    --reload &
  BACKEND_PID=$!
fi

cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

if [ -n "${BACKEND_PID:-}" ]; then
  wait -n "$BACKEND_PID" "$FRONTEND_PID"
else
  wait "$FRONTEND_PID"
fi
