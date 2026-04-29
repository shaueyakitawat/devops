$ErrorActionPreference = 'Stop'

$minikube = 'C:\Program Files\Kubernetes\Minikube\minikube.exe'
if (-not (Test-Path $minikube)) {
  throw "Minikube not found at $minikube"
}

# Start Minikube if needed
& $minikube status | Out-String | Write-Host
& $minikube start --driver=docker

# Build images
Write-Host "Building images..."
docker build -t moneymitra-frontend:latest .
docker build -t moneymitra-gateway:latest ./backend/gateway
docker build -t moneymitra-market-service:latest ./backend/market-service
docker build -t moneymitra-news-service:latest ./backend/news-service
docker build -t moneymitra-portfolio-service:latest ./backend/portfolio-service
docker build -t moneymitra-ai-service:latest ./backend/ai-service

# Load images into Minikube
Write-Host "Loading images into Minikube..."
& $minikube image load moneymitra-frontend:latest
& $minikube image load moneymitra-gateway:latest
& $minikube image load moneymitra-market-service:latest
& $minikube image load moneymitra-news-service:latest
& $minikube image load moneymitra-portfolio-service:latest
& $minikube image load moneymitra-ai-service:latest

# Apply manifests
Write-Host "Applying Kubernetes manifests..."
& $minikube kubectl -- apply -f k8s/namespace.yaml
& $minikube kubectl -- apply -f k8s/configmap.yaml
& $minikube kubectl -- apply -f k8s/secret.yaml
& $minikube kubectl -- apply -f k8s/market-service.yaml
& $minikube kubectl -- apply -f k8s/news-service.yaml
& $minikube kubectl -- apply -f k8s/portfolio-service.yaml
& $minikube kubectl -- apply -f k8s/ai-service.yaml
& $minikube kubectl -- apply -f k8s/gateway.yaml
& $minikube kubectl -- apply -f k8s/frontend.yaml

Write-Host "All resources applied."
Write-Host "Keep a separate terminal open for these commands:"
Write-Host "  $minikube kubectl -- port-forward svc/gateway 30001:8000 -n moneymitra"
Write-Host "  $minikube service frontend -n moneymitra"
