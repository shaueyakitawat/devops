#!/bin/bash
echo "🚀 Finalizing MoneyMitra Deployment..."

# Apply all Kubernetes manifests
echo "📦 Applying manifests..."
kubectl apply -f k8s/

# Define microservices
services=("frontend" "gateway" "market-service" "news-service" "portfolio-service" "ai-service")
namespace="moneymitra"

# Restart all deployments to ensure they are using the latest images and config
echo "🔄 Restarting microservices..."
for service in "${services[@]}"; do
    echo "  - Restarting $service"
    kubectl rollout restart deployment $service -n $namespace
done

# Wait for rollout to complete
echo "⏳ Waiting for services to be ready..."
for service in "${services[@]}"; do
    kubectl rollout status deployment $service -n $namespace --timeout=60s
done

echo "✅ Success! All microservices are live."
echo "🔗 Access your app here:"
minikube service frontend -n moneymitra
