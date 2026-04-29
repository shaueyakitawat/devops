pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = "1"
        DOCKER_HUB_CREDENTIALS = 'docker-hub-credentials'
        // FIXME: Replace with your actual Docker Hub username
        DOCKER_REGISTRY = 'your-dockerhub-username' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarQubeScanner'
                    withSonarQubeEnv('SonarQube') {
                        // Assuming SonarQube is accessible at this internal cluster URL from Jenkins
                        sh "${scannerHome}/bin/sonar-scanner -Dsonar.projectKey=moneymitra -Dsonar.sources=."
                    }
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    withCredentials([usernamePassword(credentialsId: env.DOCKER_HUB_CREDENTIALS, passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')]) {
                        sh "echo \$DOCKER_PASSWORD | docker login -u \$DOCKER_USERNAME --password-stdin"
                        
                        def services = [
                            'frontend': '.',
                            'gateway': './backend/gateway',
                            'market-service': './backend/market-service',
                            'news-service': './backend/news-service',
                            'portfolio-service': './backend/portfolio-service',
                            'ai-service': './backend/ai-service'
                        ]

                        services.each { name, path ->
                            sh "docker build -t ${env.DOCKER_REGISTRY}/moneymitra-${name}:latest ${path}"
                            sh "docker push ${env.DOCKER_REGISTRY}/moneymitra-${name}:latest"
                        }
                    }
                }
            }
        }

        stage('Deploy to Kubernetes') {
            steps {
                script {
                    // Apply config maps, secrets, and deployments
                    sh "kubectl apply -f k8s/"
                    
                    def namespace = "moneymitra"
                    def deployments = [
                        'frontend', 'gateway', 'market-service', 'news-service', 'portfolio-service', 'ai-service'
                    ]
                    
                    // Force rollout to pick up latest images
                    deployments.each { name ->
                        sh "kubectl rollout restart deployment ${name} -n ${namespace}"
                    }
                    
                    // Verify rollout status (fails the pipeline if a rollout fails)
                    deployments.each { name ->
                        sh "kubectl rollout status deployment ${name} -n ${namespace} --timeout=120s"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Build successful!'
            githubNotify context: 'Jenkins Pipeline', description: 'Build completed successfully', status: 'SUCCESS', targetUrl: env.BUILD_URL
        }
        failure {
            echo 'Build failed!'
            githubNotify context: 'Jenkins Pipeline', description: 'Build failed', status: 'FAILURE', targetUrl: env.BUILD_URL
        }
    }
}
