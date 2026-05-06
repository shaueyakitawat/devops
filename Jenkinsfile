pipeline {

    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:

  - name: kubectl
    image: bitnami/kubectl:latest
    command: ['cat']
    tty: true

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli:latest
    command: ['cat']
    tty: true

  volumes:
  - name: workspace
    emptyDir: {}
"""
        }
    }

    environment {
        SONAR_HOST_URL = 'http://sonarqube-sonarqube.default.svc.cluster.local:9000'
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                container('sonar-scanner') {
                    withSonarQubeEnv('SonarQube') {
                        withCredentials([string(credentialsId: 'sonar-auth-token', variable: 'SONAR_TOKEN')]) {
                            sh """
                            sonar-scanner \
                            -Dsonar.projectKey=moneymitra \
                            -Dsonar.sources=. \
                            -Dsonar.host.url=$SONAR_HOST_URL \
                            -Dsonar.login=$SONAR_TOKEN
                            """
                        }
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                script {
                    timeout(time: 2, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }

        stage('Deploy') {
            steps {
                container('kubectl') {
                    sh """
                    kubectl apply -f k8s/namespace.yaml || true
                    kubectl apply -f k8s/configmap.yaml
                    kubectl apply -f k8s/secret.yaml

                    kubectl apply -f k8s/
                    """
                }
            }
        }
    }

    post {
        success {
            echo "Pipeline completed successfully"
        }
        failure {
            echo "Pipeline failed"
        }
    }
}