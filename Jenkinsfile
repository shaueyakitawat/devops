pipeline {
  agent any

  environment {
    DOCKER_BUILDKIT = "1"
  }

  stages {
    stage("Install Frontend") {
      steps {
        sh "npm ci"
      }
    }

    stage("Lint Frontend") {
      steps {
        sh "npm run lint"
      }
    }

    stage("Build Images") {
      steps {
        sh "docker build -t moneymitra-frontend:latest ."
        sh "docker build -t moneymitra-gateway:latest ./backend/gateway"
        sh "docker build -t moneymitra-market-service:latest ./backend/market-service"
        sh "docker build -t moneymitra-news-service:latest ./backend/news-service"
        sh "docker build -t moneymitra-portfolio-service:latest ./backend/portfolio-service"
        sh "docker build -t moneymitra-ai-service:latest ./backend/ai-service"
      }
    }
  }
}
