pipeline {

    agent any

    environment {

        SONAR_HOST_URL = 'http://sonarqube-sonarqube.default.svc.cluster.local:9000'
        PROJECT_KEY = 'moneymitra'
    }

    stages {

        stage('Checkout') {

            steps {
                checkout scm
            }
        }

        stage('Verify Workspace') {

            steps {

                sh '''
                echo "Current workspace:"
                pwd

                echo "Files:"
                ls -la
                '''
            }
        }

        stage('SonarQube Analysis') {

            steps {

                withSonarQubeEnv('SonarQube') {

                    withCredentials([
                        string(
                            credentialsId: 'sonar-auth-token',
                            variable: 'SONAR_AUTH_TOKEN'
                        )
                    ]) {

                        sh '''
                        docker run --rm \
                          -v "$PWD:/usr/src" \
                          sonarsource/sonar-scanner-cli:latest \
                          sonar-scanner \
                          -Dsonar.projectKey=moneymitra \
                          -Dsonar.projectName=MoneyMitra \
                          -Dsonar.sources=/usr/src \
                          -Dsonar.host.url='"$SONAR_HOST_URL"' \
                          -Dsonar.login='"$SONAR_AUTH_TOKEN"'
                        '''
                    }
                }
            }
        }

        stage('Quality Gate') {

            steps {

                timeout(time: 5, unit: 'MINUTES') {

                    waitForQualityGate abortPipeline: true
                }
            }
        }
    }

    post {

        success {

            echo 'SUCCESS: SonarQube analysis completed successfully.'
        }

        failure {

            echo 'FAILURE: Pipeline failed.'
        }

        always {

            echo 'Pipeline execution completed.'
        }
    }
}