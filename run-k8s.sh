#!/bin/bash
set -e

JENKINS_ADMIN_USER="${JENKINS_ADMIN_USER:-admin}"
JENKINS_ADMIN_PASS="${JENKINS_ADMIN_PASS:-admin123}"
SONAR_ADMIN_USER="${SONAR_ADMIN_USER:-admin}"
SONAR_ADMIN_PASS="${SONAR_ADMIN_PASS:-Shaurya@1234}"
JENKINS_LOCAL_PORT="${JENKINS_LOCAL_PORT:-18080}"
SONAR_LOCAL_PORT="${SONAR_LOCAL_PORT:-19000}"
JENKINS_JOB_NAME="${JENKINS_JOB_NAME:-MoneyMitra-Pipeline}"
PIPELINE_FILE="${PIPELINE_FILE:-Jenkinsfile.local}"

wait_for_http() {
    local url="$1"
    local max_attempts="${2:-120}"
    local attempt=1
    while [ "$attempt" -le "$max_attempts" ]; do
        if curl -fsS "$url" >/dev/null 2>&1; then
            return 0
        fi
        sleep 2
        attempt=$((attempt + 1))
    done
    return 1
}

ensure_sonar_password() {
    local sonar_url="$1"
    echo "Ensuring SonarQube admin password is set..."

    if curl -fsS -u "$SONAR_ADMIN_USER:$SONAR_ADMIN_PASS" "$sonar_url/api/system/status" >/dev/null 2>&1; then
        echo "SonarQube admin password already configured."
        return 0
    fi

    if curl -fsS -u "$SONAR_ADMIN_USER:admin" "$sonar_url/api/system/status" >/dev/null 2>&1; then
        curl -fsS -u "$SONAR_ADMIN_USER:admin" -X POST "$sonar_url/api/users/change_password" \
            -d "login=$SONAR_ADMIN_USER" \
            -d "previousPassword=admin" \
            -d "password=$SONAR_ADMIN_PASS" >/dev/null
        echo "SonarQube admin password updated to configured value."
        return 0
    fi

    echo "Warning: Could not validate SonarQube admin credentials automatically."
    return 1
}

configure_jenkins_pipeline_job() {
    local jenkins_url="$1"
    local crumb
    local escaped_script
    local job_xml
    local auth

    if [ ! -f "$PIPELINE_FILE" ]; then
        echo "Error: Pipeline file '$PIPELINE_FILE' not found."
        exit 1
    fi

    auth="$JENKINS_ADMIN_USER:$JENKINS_ADMIN_PASS"
    crumb=$(curl -fsS -u "$auth" -c /tmp/jenkins-cookies.txt "http://127.0.0.1:$JENKINS_LOCAL_PORT/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\",//crumb)")


    escaped_script=$(sed -e 's/&/\&amp;/g' -e 's/</\&lt;/g' -e 's/>/\&gt;/g' "$PIPELINE_FILE")
    job_xml=$(mktemp)

    cat > "$job_xml" <<EOF
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <actions/>
  <description>Auto-managed by run-k8s.sh</description>
  <keepDependencies>false</keepDependencies>
  <properties/>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsFlowDefinition" plugin="workflow-cps">
    <script>$escaped_script</script>
    <sandbox>true</sandbox>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

    if curl -fsS -u "$auth" "http://127.0.0.1:$JENKINS_LOCAL_PORT/job/$JENKINS_JOB_NAME/api/json" >/dev/null 2>&1; then
        curl -fsS -u "$auth" -b /tmp/jenkins-cookies.txt -H "$crumb" -H "Content-Type: application/xml" \
            --data-binary "@$job_xml" "http://127.0.0.1:$JENKINS_LOCAL_PORT/job/$JENKINS_JOB_NAME/config.xml" >/dev/null
        echo "Updated Jenkins job '$JENKINS_JOB_NAME' from $PIPELINE_FILE."
    else
        curl -fsS -u "$auth" -b /tmp/jenkins-cookies.txt -H "$crumb" -H "Content-Type: application/xml" \
            --data-binary "@$job_xml" "http://127.0.0.1:$JENKINS_LOCAL_PORT/createItem?name=$JENKINS_JOB_NAME" >/dev/null
        echo "Created Jenkins job '$JENKINS_JOB_NAME' from $PIPELINE_FILE."
    fi

    curl -fsS -u "$auth" -b /tmp/jenkins-cookies.txt -H "$crumb" -X POST "http://127.0.0.1:$JENKINS_LOCAL_PORT/job/$JENKINS_JOB_NAME/build?delay=0sec" >/dev/null || true

    rm -f "$job_xml"
}

resolve_jenkins_credentials() {
    local login_url="http://127.0.0.1:$JENKINS_LOCAL_PORT/login"
    if curl -fsS -u "$JENKINS_ADMIN_USER:$JENKINS_ADMIN_PASS" "$login_url" >/dev/null 2>&1; then
        return 0
    fi

    if kubectl get secret jenkins -n default >/dev/null 2>&1; then
        JENKINS_ADMIN_USER=$(kubectl get secret jenkins -n default -o jsonpath='{.data.jenkins-admin-user}' | base64 -d)
        JENKINS_ADMIN_PASS=$(kubectl get secret jenkins -n default -o jsonpath='{.data.jenkins-admin-password}' | base64 -d)
        echo "Resolved Jenkins admin credentials from Kubernetes secret."
    fi
}

# Start Minikube if needed
echo "Checking Minikube status..."
if ! minikube status >/dev/null 2>&1; then
    echo "Starting Minikube..."
    minikube start --driver=docker
fi

if [ "${SKIP_APPS:-false}" != "true" ]; then
    echo "Building images..."
    for svc in frontend gateway market-service news-service portfolio-service ai-service; do
        img="shaueyakitawat/moneymitra-${svc}:latest"
        dir="."
        [ "$svc" != "frontend" ] && dir="./backend/$svc"
        
        if ! docker images -q "$img" >/dev/null 2>&1; then
            echo "Building $img..."
            docker build -t "$img" "$dir"
        else
            echo "Image $img already exists locally, skipping build."
        fi
    done

    echo "Loading images into Minikube..."
    for svc in frontend gateway market-service news-service portfolio-service ai-service; do
        img="shaueyakitawat/moneymitra-${svc}:latest"
        if ! minikube image ls | grep -q "$img"; then
            echo "Loading $img into Minikube..."
            minikube image load "$img"
        else
            echo "Image $img already exists in Minikube, skipping load."
        fi
    done

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
else
    echo "Skipping microservice deployment (SKIP_APPS=true)."
    kubectl apply -f k8s/namespace.yaml
    kubectl apply -f k8s/configmap.yaml
    kubectl apply -f k8s/secret.yaml
fi

echo "All resources applied."

echo "Installing/Updating Jenkins via Helm..."
helm repo add jenkins https://charts.jenkins.io
helm repo update
helm upgrade --install jenkins jenkins/jenkins -f k8s/jenkins-values.yaml --namespace default

echo "Installing/Updating SonarQube via Helm..."
helm repo add sonarqube https://SonarSource.github.io/helm-chart-sonarqube
helm repo update
helm upgrade --install sonarqube sonarqube/sonarqube -f k8s/sonarqube-values.yaml --namespace default

echo "Waiting for Jenkins and SonarQube pods..."
kubectl rollout status statefulset/jenkins -n default --timeout=10m || true
kubectl rollout status statefulset/sonarqube-sonarqube -n default --timeout=10m || true

echo "Starting temporary local tunnels for bootstrap automation..."
kubectl port-forward svc/jenkins "$JENKINS_LOCAL_PORT":8080 -n default >/tmp/jenkins-port-forward.log 2>&1 &
JENKINS_PF_PID=$!
kubectl port-forward svc/sonarqube-sonarqube "$SONAR_LOCAL_PORT":9000 -n default >/tmp/sonar-port-forward.log 2>&1 &
SONAR_PF_PID=$!

cleanup() {
    kill "$JENKINS_PF_PID" >/dev/null 2>&1 || true
    kill "$SONAR_PF_PID" >/dev/null 2>&1 || true
}
trap cleanup EXIT

echo "Waiting for local bootstrap endpoints..."
wait_for_http "http://127.0.0.1:$JENKINS_LOCAL_PORT/login" 180
wait_for_http "http://127.0.0.1:$SONAR_LOCAL_PORT/api/system/status" 180

# 1. SonarQube Token Generation
echo "Configuring SonarQube token..."
# Revoke existing if exists
curl -s -u "$SONAR_ADMIN_USER:$SONAR_ADMIN_PASS" -X POST "http://127.0.0.1:$SONAR_LOCAL_PORT/api/user_tokens/revoke?name=jenkins-token" || true
# Generate new
TOKEN_JSON=$(curl -s -u "$SONAR_ADMIN_USER:$SONAR_ADMIN_PASS" -X POST "http://127.0.0.1:$SONAR_LOCAL_PORT/api/user_tokens/generate?name=jenkins-token")
SONAR_TOKEN=$(echo "$TOKEN_JSON" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$SONAR_TOKEN" ]; then
    echo "Warning: Failed to generate SonarQube token. Response: $TOKEN_JSON"
else
    echo "SonarQube token generated."
    
    # 2. Inject token into Jenkins
    echo "Injecting SonarQube token into Jenkins credentials..."
    auth="$JENKINS_ADMIN_USER:$JENKINS_ADMIN_PASS"
    crumb=$(curl -fsS -u "$auth" -c /tmp/jenkins-cookies.txt "http://127.0.0.1:$JENKINS_LOCAL_PORT/crumbIssuer/api/xml?xpath=concat(//crumbRequestField,\":\",//crumb)")
    
    GROOVY_SCRIPT="
import jenkins.model.*
import com.cloudbees.plugins.credentials.*
import com.cloudbees.plugins.credentials.domains.*
import org.jenkinsci.plugins.plaincredentials.*
import org.jenkinsci.plugins.plaincredentials.impl.*
import hudson.util.Secret

def credentialsId = 'sonar-auth-token'
def secret = Secret.fromString('$SONAR_TOKEN')
def description = 'SonarQube Auth Token'

def store = Jenkins.instance.getExtensionList('com.cloudbees.plugins.credentials.SystemCredentialsProvider')[0].getStore()
def existing = store.getCredentials(Domain.global()).find { it.id == credentialsId }

if (existing) {
    store.updateCredentials(Domain.global(), existing, new StringCredentialsImpl(CredentialsScope.GLOBAL, credentialsId, description, secret))
} else {
    store.addCredentials(Domain.global(), new StringCredentialsImpl(CredentialsScope.GLOBAL, credentialsId, description, secret))
}
"
    curl -fsS -u "$auth" -b /tmp/jenkins-cookies.txt -H "$crumb" --data-urlencode "script=$GROOVY_SCRIPT" "http://127.0.0.1:$JENKINS_LOCAL_PORT/scriptText" >/dev/null
    echo "Jenkins credentials updated."
fi


ensure_sonar_password "http://127.0.0.1:$SONAR_LOCAL_PORT" || true
resolve_jenkins_credentials
configure_jenkins_pipeline_job "http://127.0.0.1:$JENKINS_LOCAL_PORT"

echo ""
echo "========================================="
echo "Setup complete! Keep a separate terminal open for these commands to access the services:"
echo "  kubectl port-forward svc/gateway 30001:8000 -n moneymitra"
echo "  minikube service frontend -n moneymitra"
echo "  minikube service jenkins -n default"
echo "  minikube service sonarqube-sonarqube -n default"
echo "========================================="
