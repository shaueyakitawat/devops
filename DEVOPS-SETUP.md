# MoneyMitra CI/CD Pipeline Setup & Usage

This document outlines how to set up and manage the DevOps CI/CD pipeline for the MoneyMitra project using Jenkins, SonarQube, Minikube, and GitHub.

## 1. Prerequisites

Make sure you have the following installed on your machine:
- **Docker Desktop** (or equivalent Docker daemon)
- **Minikube** (`brew install minikube` on Mac)
- **kubectl** (`brew install kubectl`)
- **Helm** (`brew install helm`)
- **PowerShell** (`brew install --cask powershell` for Mac `pwsh`)

## 2. Automated Setup

Run the automated PowerShell script to spin up the entire cluster:

```powershell
pwsh ./run-k8s.ps1
```

This script will:
1. Start Minikube.
2. Build local Docker images.
3. Load them into Minikube.
4. Deploy the MoneyMitra backend microservices and frontend to Kubernetes.
5. Install/Update Jenkins and SonarQube using Helm with persistent storage.
6. Auto-bootstrap CI integration by setting SonarQube admin password (if needed), creating/updating Jenkins pipeline job, and triggering a build.

## 3. Accessing Services

Once deployed, you can access the tools by keeping the following commands running in separate terminal windows:

- **Frontend**: `minikube service frontend -n default`
- **Jenkins**: `minikube service jenkins -n default`
- **SonarQube**: `minikube service sonarqube-sonarqube -n default`

### Default Credentials
- **Jenkins**: 
  - Username: `admin`
  - Password: `admin123` (Configured in `k8s/jenkins-values.yaml`)
- **SonarQube**: 
  - Username: `admin`
  - Password: `admin123` (Auto-set by `run-k8s.sh` during bootstrap)

## 3.1 Zero-Touch CI Bootstrap (No Manual Rewiring)

On every run, `run-k8s.sh` now automatically:
1. Waits for Jenkins and SonarQube to be reachable.
2. Ensures SonarQube admin password is configured.
3. Creates/updates the Jenkins pipeline job `MoneyMitra-Pipeline` from `Jenkinsfile.local`.
4. Triggers a build so CI validation starts immediately.

You can override defaults using environment variables:
- `JENKINS_ADMIN_USER`
- `JENKINS_ADMIN_PASS`
- `SONAR_ADMIN_USER`
- `SONAR_ADMIN_PASS`
- `JENKINS_LOCAL_PORT`
- `SONAR_LOCAL_PORT`
- `JENKINS_JOB_NAME`
- `PIPELINE_FILE`

## 4. Jenkins Configuration

Most Jenkins and SonarQube linkage is now automated. Manual setup is only required if you want to use a custom SCM pipeline or custom credentials.

### A. Update `Jenkinsfile`
In the root `Jenkinsfile`, update the `DOCKER_REGISTRY` environment variable to match your actual Docker Hub username:
```groovy
DOCKER_REGISTRY = 'your-dockerhub-username' 
```

### B. Add Docker Hub Credentials
1. Go to **Manage Jenkins** -> **Credentials** -> **System** -> **Global credentials (unrestricted)**.
2. Click **Add Credentials**.
3. **Kind**: Username with password.
4. **Username**: Your Docker Hub username.
5. **Password**: Your Docker Hub access token or password.
6. **ID**: `docker-hub-credentials` (This MUST match the ID in the `Jenkinsfile`).
7. **Description**: Docker Hub Auth.

### C. SonarQube Integration
The bootstrap pipeline in `Jenkinsfile.local` uses direct API health/quality checks, so manual token creation and manual Jenkins-Sonar server binding are not required for default local deployment.

## 5. GitHub Webhook Integration

To trigger the pipeline automatically whenever code is pushed to the `main` branch, configure a GitHub Webhook.

### Exposing Local Jenkins (For Webhooks)
Since Jenkins is running locally on Minikube, GitHub cannot reach it directly. You must use a tool like `ngrok` to expose it:
```bash
# Get the local port Jenkins is running on (e.g. from minikube service jenkins)
ngrok http <JENKINS_LOCAL_PORT>
```
Copy the `https://xxxx-xx.ngrok.app` URL provided by ngrok.

### Setting up the Webhook in GitHub
1. Go to your GitHub Repository -> **Settings** -> **Webhooks**.
2. Click **Add webhook**.
3. **Payload URL**: `https://<YOUR_NGROK_URL>/github-webhook/` (Ensure the trailing slash is included!).
4. **Content type**: `application/json`.
5. **Which events**: "Just the push event".
6. **Active**: Checked.
7. Click **Add webhook**.

### Creating the Jenkins Pipeline Job
1. In Jenkins, click **New Item**.
2. Name it `MoneyMitra-Pipeline`, select **Pipeline**, and click **OK**.
3. Under **Build Triggers**, check **GitHub hook trigger for GITScm polling**.
4. Under **Pipeline**:
   - **Definition**: `Pipeline script from SCM`
   - **SCM**: `Git`
   - **Repository URL**: `https://github.com/yourusername/MoneyMitra-LaserHack-main.git`
   - **Credentials**: Add a Jenkins credential for your GitHub Personal Access Token if it's a private repo.
   - **Script Path**: `Jenkinsfile`
5. Save and click **Build Now** to test the first run!

## 6. Pipeline Stages Overview

The Jenkins pipeline performs the following steps:
1. **Checkout**: Pulls the latest code from GitHub.
2. **SonarQube Analysis**: Runs static code analysis and sends results to the local SonarQube instance.
3. **Build & Push Images**: Builds Docker images for the frontend and all 5 backend microservices, then pushes them to Docker Hub.
4. **Deploy to Kubernetes**: Applies the manifests in the `k8s/` directory to Minikube and rolls out the updated deployments.
5. **Post Actions**: Notifies the GitHub repository of the build status (Success/Failure).
