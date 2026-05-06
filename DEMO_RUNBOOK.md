# 🚀 DevOps Pipeline Demo Runbook

### 🛑 STOP/START COMMANDS (Data is saved automatically)
* **Start Project:** `docker-compose up -d` (or `docker-compose start`)
* **Stop Project:** `docker-compose stop`
* *Never run `docker-compose down -v` unless you want to delete all data.*

---

## 1. The Application 
**URL:** http://localhost:5173
**Theory:** Containerized Microservice Architecture. Nginx React frontend talking to Python FastAPI backend services via an API Gateway.

## 2. Infrastructure as Code (Terraform & Ansible)
**Action:** Open VS Code (`terraform/main.tf` & `ansible/deploy.yml`)
**Theory:** We don't manually configure servers. Terraform provisions the AWS EC2 servers. Ansible automatically configures them and deploys the Docker stack.
**Commands to show (in terminal):**
```bash
# Show Terraform validation
cd terraform
terraform init
terraform validate

# Generate a visual graph of the Cloud Architecture!
terraform graph | dot -Tsvg > infrastructure_map.svg
```
*(After running the graph command, open `terraform/infrastructure_map.svg` in your web browser to show them the crazy automatically generated visual map of your cloud infrastructure!)*

# Show Ansible validation
cd ../ansible
ansible-playbook -i inventory.ini --syntax-check deploy.yml
```

## 3. Continuous Integration (Jenkins)
**URL:** http://localhost:18080 (Login: `admin` / `admin123`)
**Theory:** Automated pipeline. Pushing to GitHub triggers Jenkins to clone the code, build the Docker images, and run security tests automatically.

## 4. Continuous Inspection (SonarQube)
**URL:** http://localhost:19000 (Login: `admin` / `admin`)
**Theory:** Static Application Security Testing (SAST). Enforces Quality Gates to block deployments if bugs, code smells, or security vulnerabilities are found.

## 5. Live Observability (Prometheus)
**URL:** http://localhost:9090
**Theory:** Time-series database that scrapes live metrics from all our microservices and servers.
**Action:** Go to the "Graph" tab and run these PromQL queries to show live data:
* **Check Service Health:** `up`
* **CPU Usage:** `rate(node_cpu_seconds_total{mode!="idle"}[1m])`
* **Available Memory (GB):** `node_memory_MemAvailable_bytes / 1024 / 1024 / 1024`
* **Network Traffic (MB/s):** `rate(node_network_receive_bytes_total[1m]) / 1024 / 1024`

## 6. Dashboard Visualization (Grafana)
**URL:** http://localhost:3000 (Login: `admin` / `admin`)
**Theory:** Connects to Prometheus to provide beautiful, permanent, real-time dashboards for the infrastructure team.
**Action:** Go to Dashboards -> Prometheus Dashboards -> **Node Exporter Full**.

---

### 🚨 Emergency Commands
```bash
# Restart entire stack
docker-compose restart

# View logs for a broken service
docker logs devops-main-frontend-1 --tail 50
```
