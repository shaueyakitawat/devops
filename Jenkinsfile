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
    command: ['cat']
    tty: true
    volumeMounts:
    - name: docker-sock
      mountPath: /var/run/docker.sock

  - name: kubectl
    image: alpine/k8s:1.29.2
    command: ['cat']
    tty: true

  - name: sonar-scanner
    image: sonarsource/sonar-scanner-cli:latest
    command: ['cat']
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

        SONAR_HOST_URL = 'http://sonarqube-sonarqube:9000'
        PROJECT_KEY = 'moneymitra'

        K8S_NAMESPACE = 'moneymitra'
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

                        sh """
                        sonar-scanner \
                          -Dsonar.projectKey=${PROJECT_KEY} \
                          -Dsonar.projectName=MoneyMitra \
                          -Dsonar.sources=. \
                          -Dsonar.host.url=${SONAR_HOST_URL} \
                          -Dsonar.ws.timeout=60 \
                          -X
                        """
                    }
                }
            }
        }

        stage('SonarQube Quality Gate') {

            steps {

                timeout(time: 5, unit: 'MINUTES') {

                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Build & Push Images') {

            steps {

                container('docker') {

                    withCredentials([
                        usernamePassword(
                            credentialsId: "${DOCKER_CREDS}",
                            usernameVariable: 'DOCKER_USER',
                            passwordVariable: 'DOCKER_PASS'
                        )
                    ]) {

                        sh """
                        echo "${DOCKER_PASS}" | docker login \
                        -u "${DOCKER_USER}" \
                        --password-stdin
                        """

                        script {

                            def services = [
                                'frontend'         : '.',
                                'gateway'          : 'backend/gateway',
                                'market-service'   : 'backend/market-service',
                                'news-service'     : 'backend/news-service',
                                'portfolio-service': 'backend/portfolio-service',
                                'ai-service'       : 'backend/ai-service'
                            ]

                            services.each { name, path ->

                                echo "Building ${name}"

                                sh """
                                docker build \
                                  -t ${DOCKER_REGISTRY}/moneymitra-${name}:latest \
                                  ${path}
                                """

                                echo "Pushing ${name}"

                                sh """
                                docker push \
                                  ${DOCKER_REGISTRY}/moneymitra-${name}:latest
                                """
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

                        def services = [
                            'frontend',
                            'gateway',
                            'market-service',
                            'news-service',
                            'portfolio-service',
                            'ai-service'
                        ]

                        sh "kubectl apply -f k8s/namespace.yaml || true"
                        sh "kubectl apply -f k8s/secret.yaml"
                        sh "kubectl apply -f k8s/configmap.yaml"

                        services.each { name ->

                            echo "Deploying ${name}"

                            sh """
                            kubectl apply \
                              -f k8s/${name}.yaml
                            """

                            sh """
                            kubectl rollout restart deployment/${name} \
                              -n ${K8S_NAMESPACE}
                            """

                            sh """
                            kubectl rollout status deployment/${name} \
                              -n ${K8S_NAMESPACE} \
                              --timeout=180s
                            """
                        }
                    }
                }
            }
        }

        stage('Verify SonarQube Quality Gate') {

            steps {

                container('kubectl') {

                    sh """
                    echo "Verifying SonarQube Quality Gate"

                    curl -s \
                    ${SONAR_HOST_URL}/api/qualitygates/project_status?projectKey=${PROJECT_KEY}
                    """
                }
            }
        }

        stage('Verify Deployed Services') {

            steps {

                container('kubectl') {

                    sh '''
                    set -e

                    for url in \
                      http://gateway.moneymitra.svc.cluster.local:8000/health \
                      http://market-service.moneymitra.svc.cluster.local:8000/health \
                      http://news-service.moneymitra.svc.cluster.local:8000/health \
                      http://portfolio-service.moneymitra.svc.cluster.local:8000/health \
                      http://ai-service.moneymitra.svc.cluster.local:8000/health
                    do
                      echo "Checking $url"

                      curl -fsS "$url" >/dev/null
                    done
                    '''
                }
            }
        }
    }

    post {

        success {

            echo 'SUCCESS: Analysis, build, push, deployment and verification completed.'
        }

        failure {

            echo 'FAILURE: Pipeline failed. Check console logs.'
        }

        always {

            echo 'Pipeline completed.'
        }
    }
}