#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_DIR="$ROOT_DIR/.pids"

if [ ! -d "$PIDS_DIR" ]; then
  echo "No running port-forwards found (no $PIDS_DIR)."
  exit 0
fi

for pidfile in "$PIDS_DIR"/*.pid; do
  [ -f "$pidfile" ] || continue
  pid=$(cat "$pidfile")
  if [ -n "$pid" ]; then
    echo "Stopping PID $pid from $pidfile"
    kill "$pid" >/dev/null 2>&1 || true
  fi
  rm -f "$pidfile"
done

echo "Stopped port-forwards."
exit 0