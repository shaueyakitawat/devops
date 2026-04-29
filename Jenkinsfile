pipeline {
    agent {
        kubernetes {
            yaml """
apiVersion: v1
kind: Pod
metadata:
  labels:
    component: ci
spec:
  containers:
  - name: kubectl
    image: bitnami/kubectl:latest
    command:
    - cat
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

        stage('Deploy to Kubernetes') {
            steps {
                container('kubectl') {
                    script {
                        // Apply all manifests in k8s directory
                        sh "kubectl apply -f k8s/"
                        
                        def namespace = "moneymitra"
                        def deployments = [
                            'frontend', 'gateway', 'market-service', 'news-service', 'portfolio-service', 'ai-service'
                        ]
                        
                        // Rollout restart to ensure pods use the images we built
                        deployments.each { name ->
                            sh "kubectl rollout restart deployment ${name} -n ${namespace}"
                        }
                    }
                }
            }
        }
    }

    post {
        success {
            echo 'SUCCESS: All microservices deployed and restarted!'
        }
        failure {
            echo 'FAILURE: Deployment failed. Check the logs above.'
        }
    }
}
