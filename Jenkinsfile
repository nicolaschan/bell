pipeline {
  agent none
  stages {
    stage('Build and Test') {
      agent {
        docker {
          image 'node:10-stretch'
        }
      }
      stages {
        stage('Build') {
          steps {
            sh 'yarn'
            sh 'yarn build'
            archiveArtifacts artifacts: 'bin/*.js', fingerprint: true
          }
        }
        stage('Test') {
          steps {
            sh 'apt-get update'
            sh 'apt-get install libasound2 libxss1 libnss3-dev libatk-bridge2.0-0 libgtk-3-0 -y'
            sh 'CHROME_BIN=/usr/bin/chromium yarn test'
          }
        }
        stage('Report Test Results') {
          steps {
            cobertura(autoUpdateHealth: true, autoUpdateStability: true, coberturaReportFile: 'coverage/**/cobertura-coverage.xml', failUnhealthy: true, failUnstable: true)
          }
        }
      }
    }

    stage('Build Docker') {
      agent any
      steps {
        script {
          checkout scm
          def image = docker.build("bell:${BRANCH_NAME}")
        }
      }
    }

    stage('Deploy') {
      agent any
      steps {
        sh 'docker rm -f bell-dev || true'
        sh 'docker run -e WEBSERVER_PORT=8080 -e SERVER_NAME=bell-dev-ci -e POSTGRES_ENABLED=false -e POSTGRES_USER=false -e POSTGRES_HOST=false -e POSTGRES_DATABASE=false -e POSTGRES_PASSWORD=false -e POSTGRES_PORT=false -p 8102:8080 --name bell-dev bell:dev'
      }
    }
  }
}