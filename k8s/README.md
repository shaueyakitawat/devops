# Kubernetes Setup (Minikube)

## 1) Start Minikube

```
minikube start --driver=docker
```

## 2) Set Groq API key

Edit `k8s/secret.yaml` and replace `replace_me` with your key.

## 3) Build images (local Docker) and load to Minikube

```
docker build -t moneymitra-frontend:latest .
docker build -t moneymitra-gateway:latest ./backend/gateway
docker build -t moneymitra-market-service:latest ./backend/market-service
docker build -t moneymitra-news-service:latest ./backend/news-service
docker build -t moneymitra-portfolio-service:latest ./backend/portfolio-service
docker build -t moneymitra-ai-service:latest ./backend/ai-service

minikube image load moneymitra-frontend:latest
minikube image load moneymitra-gateway:latest
minikube image load moneymitra-market-service:latest
minikube image load moneymitra-news-service:latest
minikube image load moneymitra-portfolio-service:latest
minikube image load moneymitra-ai-service:latest
```

## 4) Apply manifests

```
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/market-service.yaml
kubectl apply -f k8s/news-service.yaml
kubectl apply -f k8s/portfolio-service.yaml
kubectl apply -f k8s/ai-service.yaml
kubectl apply -f k8s/gateway.yaml
kubectl apply -f k8s/frontend.yaml
```

## 5) Access services

```
minikube ip
```

- Frontend: http://<minikube-ip>:30000
- Gateway: http://<minikube-ip>:30001

If the frontend cannot reach the gateway, update `VITE_API_URL` in `k8s/configmap.yaml` to the gateway URL, then re-apply the configmap and restart the frontend pod.

## 6) Install Jenkins and SonarQube (Helm)

```
helm repo add jenkins https://charts.jenkins.io
helm repo add sonarqube https://SonarSource.github.io/helm-chart-sonarqube
helm repo update

helm upgrade --install jenkins jenkins/jenkins -n devops-tools --create-namespace -f k8s/jenkins-values.yaml
helm upgrade --install sonarqube sonarqube/sonarqube -n devops-tools --create-namespace -f k8s/sonarqube-values.yaml
```

Access:
- Jenkins: http://<minikube-ip>:30003
- SonarQube: http://<minikube-ip>:30002
