pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = "1"
        // Using your local tag prefix
        IMAGE_PREFIX = 'shaueyakitawat' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build Local Images') {
            steps {
                script {
                    def services = [
                        'frontend': '.',
                        'gateway': './backend/gateway',
                        'market-service': './backend/market-service',
                        'news-service': './backend/news-service',
                        'portfolio-service': './backend/portfolio-service',
                        'ai-service': './backend/ai-service'
                    ]

                    services.each { name, path ->
                        echo "Building ${name}..."
                        sh "docker build -t ${env.IMAGE_PREFIX}/moneymitra-${name}:latest ${path}"
                    }
                }
            }
        }

        stage('Deploy to Local Kubernetes') {
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
                    
                    // Verify rollout status
                    deployments.each { name ->
                        sh "kubectl rollout status deployment ${name} -n ${namespace} --timeout=120s"
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'Deployment successful! All microservices are updated.'
        }
        failure {
            echo 'Build or Deployment failed. Check the logs above.'
        }
    }
}
