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
                        def namespace = "moneymitra"
                        def services = [
                            'frontend', 'gateway', 'market-service', 'news-service', 'portfolio-service', 'ai-service'
                        ]

                        // Apply base configs first
                        sh "kubectl apply -f k8s/namespace.yaml || true"
                        sh "kubectl apply -f k8s/secret.yaml"
                        sh "kubectl apply -f k8s/configmap.yaml"
                        
                        // Apply and Restart each microservice explicitly
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
            echo 'SUCCESS: All microservices deployed and restarted!'
        }
        failure {
            echo 'FAILURE: Deployment failed. Check the logs above.'
        }
    }
}
