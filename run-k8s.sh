#!/bin/bash
set -e

# Start Minikube if needed
echo "Checking Minikube status..."
if ! minikube status >/dev/null 2>&1; then
    echo "Starting Minikube..."
    minikube start --driver=docker
fi

echo "Building images..."
docker build -t shaueyakitawat/moneymitra-frontend:latest .
docker build -t shaueyakitawat/moneymitra-gateway:latest ./backend/gateway
docker build -t shaueyakitawat/moneymitra-market-service:latest ./backend/market-service
docker build -t shaueyakitawat/moneymitra-news-service:latest ./backend/news-service
docker build -t shaueyakitawat/moneymitra-portfolio-service:latest ./backend/portfolio-service
docker build -t shaueyakitawat/moneymitra-ai-service:latest ./backend/ai-service

echo "Loading images into Minikube..."
minikube image load shaueyakitawat/moneymitra-frontend:latest
minikube image load shaueyakitawat/moneymitra-gateway:latest
minikube image load shaueyakitawat/moneymitra-market-service:latest
minikube image load shaueyakitawat/moneymitra-news-service:latest
minikube image load shaueyakitawat/moneymitra-portfolio-service:latest
minikube image load shaueyakitawat/moneymitra-ai-service:latest

echo "Applying Kubernetes manifests..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/market-service.yaml
kubectl apply -f k8s/news-service.yaml
kubectl apply -f k8s/portfolio-service.yaml
kubectl apply -f k8s/ai-service.yaml
kubectl apply -f k8s/gateway.yaml
kubectl apply -f k8s/frontend.yaml

echo "All resources applied."

echo "Installing/Updating Jenkins via Helm..."
helm repo add jenkins https://charts.jenkins.io
helm repo update
helm upgrade --install jenkins jenkins/jenkins -f k8s/jenkins-values.yaml --namespace default

echo "Installing/Updating SonarQube via Helm..."
helm repo add sonarqube https://SonarSource.github.io/helm-chart-sonarqube
helm repo update
helm upgrade --install sonarqube sonarqube/sonarqube -f k8s/sonarqube-values.yaml --namespace default

echo ""
echo "========================================="
echo "Setup complete! Keep a separate terminal open for these commands to access the services:"
echo "  kubectl port-forward svc/gateway 30001:8000 -n moneymitra"
echo "  minikube service frontend -n moneymitra"
echo "  minikube service jenkins -n default"
echo "  minikube service sonarqube-sonarqube -n default"
echo "========================================="
