pipeline {
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
            }
        }
        stage('Test') {
            steps {
                sh 'apt-get update'
                sh 'apt-get install chromium -y'
                sh 'CHROME_BIN=/usr/bin/chromium-browser yarn test'
            }
        }
    }
}
