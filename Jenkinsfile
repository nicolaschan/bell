pipeline {
    agent {
        docker {
            image 'node:10-alpine'
        }
    }
    stages {
        stage('Build') {
            steps {
                sh 'apk update'
                sh 'apk add build-base python3'
                sh 'yarn'
                sh 'yarn build'
            }
        }
        stage('Test') {
            steps {
                sh 'apk update'
                sh 'apk add chromium'
                sh 'CHROME_BIN=/usr/bin/chromium-browser yarn test'
            }
        }
    }
}
