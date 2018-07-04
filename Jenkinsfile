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
                sh 'apt-get install libatk-bridge2.0-0 libgtk-3-0 -y'
                sh 'CHROME_BIN=/usr/bin/chromium yarn test'
            }
        }
    }
}
