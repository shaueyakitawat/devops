pipeline {
    agent any

    environment {
        // No Docker needed in Jenkins anymore
        IMAGE_PREFIX = 'shaueyakitawat' 
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        // We skip the Build stage because images are already in Minikube's local registry
        // This makes the pipeline lightning fast and reliable for the Hackathon

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
            echo 'Deployment successful! All microservices are updated in the cluster.'
        }
        failure {
            echo 'Deployment failed. Check the logs above.'
        }
    }
}
