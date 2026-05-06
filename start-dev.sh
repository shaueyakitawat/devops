#!/usr/bin/env bash

set -euo pipefail

# =========================================
# MoneyMitra Local Bootstrap
# =========================================

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PIDS_DIR="$ROOT_DIR/.pids"

mkdir -p "$PIDS_DIR"

check_cmd() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Required command '$1' not found in PATH."
    exit 2
  fi
}

for cmd in docker minikube kubectl helm curl; do
  check_cmd "$cmd"
done

echo "======================================="
echo "Starting MoneyMitra Full Local Stack"
echo "======================================="

# Ensure Minikube is running
if ! minikube status >/dev/null 2>&1; then
  echo "Starting Minikube..."
  minikube start --driver=docker
fi

echo "Deploying infrastructure and services..."

bash "$ROOT_DIR/run-k8s.sh" "$@"

start_pf() {

  local name="$1"
  local svc="$2"
  local remote_port="$3"
  local local_port="$4"
  local ns="$5"

  echo "Starting port-forward: $name"

  nohup kubectl port-forward \
    svc/${svc} \
    ${local_port}:${remote_port} \
    -n ${ns} \
    >"$PIDS_DIR/${name}.log" 2>&1 &

  echo $! >"$PIDS_DIR/${name}.pid"
}

echo "Starting persistent port-forwards..."

# Jenkins
start_pf "jenkins" "jenkins" 8080 18080 default

# SonarQube
start_pf "sonarqube" "sonarqube-sonarqube" 9000 19000 default

# Gateway API
start_pf "gateway" "gateway" 8000 30001 moneymitra

# Frontend
start_pf "frontend" "frontend" 80 5173 moneymitra

sleep 5

echo ""
echo "======================================="
echo "MoneyMitra Local Environment Ready"
echo "======================================="
echo "Jenkins     : http://127.0.0.1:18080"
echo "SonarQube   : http://127.0.0.1:19000"
echo "Gateway API : http://127.0.0.1:30001"
echo "Frontend    : http://127.0.0.1:5173"
echo ""
echo "To stop local services:"
echo "./stop-dev.sh"
echo "======================================="

exit 0