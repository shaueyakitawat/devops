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
                        
                        // Rollout restart
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
