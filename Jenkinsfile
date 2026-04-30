pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
spec:
  containers:
  - name: docker
    image: docker:24.0.6
    command: [cat]
    tty: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock
  - name: kubectl
    image: alpine/k8s:1.29.2
    command: [cat]
    tty: true
  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli:latest
    command: [cat]
    tty: true
  volumes:
  - name: docker-sock
    hostPath:
      path: /var/run/docker.sock
"""
        }
    }

    environment {
        DOCKER_REGISTRY = 'shaueyakitawat'
        DOCKER_CREDS = 'docker-hub-credentials'
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
                    script {
                        // Using credentials for Sonar token
                        withCredentials([string(credentialsId: 'sonar-auth-token', variable: 'SONAR_AUTH_TOKEN')]) {
                            sh "sonar-scanner -Dsonar.host.url=${SONAR_HOST_URL} -Dsonar.login=${SONAR_AUTH_TOKEN}"
                        }
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                container('docker') {
                    withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", usernameVariable: 'DOCKER_USER', passwordVariable: 'DOCKER_PASS')]) {
                        sh "docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}"
                        
                        script {
                            def services = [
                                'frontend': '.',
                                'gateway': 'backend/gateway',
                                'market-service': 'backend/market-service',
                                'news-service': 'backend/news-service',
                                'portfolio-service': 'backend/portfolio-service',
                                'ai-service': 'backend/ai-service'
                            ]
                            
                            services.each { name, path ->
                                echo "Building and pushing ${name}..."
                                sh "docker build -t ${DOCKER_REGISTRY}/moneymitra-${name}:latest ${path}"
                                sh "docker push ${DOCKER_REGISTRY}/moneymitra-${name}:latest"
                            }
                        }
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
                            sh "kubectl rollout status deployment ${name} -n ${namespace} --timeout=90s"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: Code analyzed, images pushed, and services deployed!'
        }
        failure {
            echo 'FAILURE: Pipeline failed. Check the logs above.'
        }
    }
}
