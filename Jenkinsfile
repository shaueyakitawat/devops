pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: kubectl
    image: alpine/k8s:1.29.2
    command: [cat]
    tty: true
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli:latest
    command: [cat]
    tty: true
"""
        }
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
                        sh "sonar-scanner -Dsonar.projectKey=MoneyMitra -Dsonar.sources=. -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_AUTH_TOKEN}"
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    script {
                        def namespace = "moneymitra"
                        def services = [
                            'frontend', 'gateway', 'market-service', 'news-service', 'portfolio-service', 'ai-service'
                        ]

                        sh "kubectl apply -f k8s/namespace.yaml || true"
                        sh "kubectl apply -f k8s/secret.yaml"
                        sh "kubectl apply -f k8s/configmap.yaml"
                        
                        services.each { name ->
                            echo "Deploying ${name}..."
                            sh "kubectl apply -f k8s/${name}.yaml"
                            sh "kubectl rollout restart deployment ${name} -n ${namespace}"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Code analyzed and services deployed!'
        }
        failure {
            echo 'FAILURE: Check the logs above.'
        }
    }
}
