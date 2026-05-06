#!/usr/bin/env bash
set -euo pipefail

# Wrapper to run the full local stack and keep convenient port-forwards running.
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_DIR="$ROOT_DIR/.pids"
mkdir -p "$PIDS_DIR"

check_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command '$1' not found in PATH. Install it and retry." >&2
    exit 2
  fi
}

for cmd in docker minikube kubectl helm curl; do
  check_cmd "$cmd"
done

echo "Starting MoneyMitra full local bootstrap..."
echo "This will build images, deploy to Minikube, install Jenkins+SonarQube, and auto-configure CI."

"$ROOT_DIR/run-k8s.sh" "$@"

start_pf() {
  local svc="$1" remote_port="$2" local_port="$3" ns="$4"
  echo "Starting port-forward: $svc ($ns) $local_port -> $remote_port"
  nohup kubectl port-forward svc/${svc} ${local_port}:${remote_port} -n ${ns} >"$PIDS_DIR/${svc}.pf.log" 2>&1 &
  echo $! >"$PIDS_DIR/${svc}.pid"
}

echo "Starting persistent port-forwards for local access..."
start_pf jenkins 8080 18080 default
start_pf sonarqube-sonarqube 9000 19000 default
start_pf gateway 8000 30001 moneymitra
start_pf frontend 80 5173 moneymitra

cat <<EOF
Local endpoints (access after a moment):
  - Jenkins:  http://127.0.0.1:18080
  - SonarQube: http://127.0.0.1:19000
  - Gateway:  http://127.0.0.1:30001
  - Frontend: http://127.0.0.1:5173

To stop these port-forwards run: ./stop-dev.sh
EOF

exit 0
