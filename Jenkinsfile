pipeline {

    agent any

    environment {

        DOCKER_USER = "milan12344"

        FRONTEND_IMAGE = "${DOCKER_USER}/hostel-frontend"

        BACKEND_IMAGE = "${DOCKER_USER}/hostel-backend"

        KUBECONFIG = "/var/lib/jenkins/.kube/config"

        PATH = "/usr/bin:/usr/local/bin:${env.PATH}"
    }

    stages {

        stage('Checkout') {

            steps {

                checkout scm

            }
        }

        stage('Backend Test') {

            steps {

                sh '''
                    cd backend

                    npm install

                    npm test
                '''
            }
        }

        stage('Frontend Build Test') {

            steps {

                sh '''
                    cd frontend

                    npm install

                    npm run build
                '''
            }
        }

        stage('Docker Build') {

            steps {

                sh """
                    docker build \
                    -t ${BACKEND_IMAGE}:${BUILD_NUMBER} \
                    -t ${BACKEND_IMAGE}:latest \
                    ./backend
                """

                sh """
                    docker build \
                    -t ${FRONTEND_IMAGE}:${BUILD_NUMBER} \
                    -t ${FRONTEND_IMAGE}:latest \
                    ./frontend
                """
            }
        }

        stage('Docker Push') {

            steps {

                withCredentials([
                    usernamePassword(
                        credentialsId: 'dockerhub-credentials',
                        usernameVariable: 'DOCKER_USERNAME',
                        passwordVariable: 'DOCKER_PASSWORD'
                    )
                ]) {

                    sh '''
                        echo "$DOCKER_PASSWORD" | docker login \
                        -u "$DOCKER_USERNAME" \
                        --password-stdin

                        docker push ${BACKEND_IMAGE}:${BUILD_NUMBER}

                        docker push ${BACKEND_IMAGE}:latest

                        docker push ${FRONTEND_IMAGE}:${BUILD_NUMBER}

                        docker push ${FRONTEND_IMAGE}:latest

                        docker logout
                    '''
                }
            }
        }

        stage('Update Kubernetes Manifests') {

            steps {

                sh '''
                    sed -i "s|image: .*/hostel-backend:.*|image: ${BACKEND_IMAGE}:${BUILD_NUMBER}|g" k8s/backend.yaml

                    sed -i "s|image: .*/hostel-frontend:.*|image: ${FRONTEND_IMAGE}:${BUILD_NUMBER}|g" k8s/frontend.yaml

                    git config user.name "Jenkins"

                    git config user.email "jenkins@example.com"

                    git add k8s/

                    git commit -m "Update images to build ${BUILD_NUMBER}" || true
                '''

                withCredentials([
                    usernamePassword(
                        credentialsId: 'github-credentials',
                        usernameVariable: 'GITHUB_USERNAME',
                        passwordVariable: 'GITHUB_TOKEN'
                    )
                ]) {

                    sh '''
                        git config user.name "Jenkins"

                        git config user.email "jenkins@example.com"

                        git remote set-url origin "https://github.com/MilanVekariya03/hostel-management.git"

                        git -c credential.helper='!f() { echo username=$GITHUB_USERNAME; echo password=$GITHUB_TOKEN; }; f' push origin HEAD:main
                    '''
                }
            }
        }
    }

    post {

        success {

            echo "Pipeline completed successfully!"
        }

        failure {

            echo "Pipeline failed!"
        }
    }
}
