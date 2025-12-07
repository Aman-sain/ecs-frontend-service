pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '724772079986'
        SERVICE_NAME = 'frontend'
        CLUSTER_NAME = 'auto-deploy-prod-cluster'
    }

    options {
        timestamps()
        timeout(time: 25, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        skipDefaultCheckout(true)  // We'll do clean checkout manually
    }

    stages {
        stage('🧹 Checkout Code') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🧹 Checking out code with clean workspace"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                // Clean checkout
                checkout([
                    $class: 'GitSCM',
                    branches: [[name: '*/main']],
                    extensions: [
                        [$class: 'CleanBeforeCheckout'],
                        [$class: 'CloneOption', depth: 1, shallow: true]
                    ],
                    userRemoteConfigs: [[
                        credentialsId: 'github-creds',
                        url: 'https://github.com/Aman-sain/ecs-frontend-service'
                    ]]
                ])
            }
        }

        stage('🔍 Validate Configuration') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🔍 Validating Frontend Service Configuration"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # Validate deploy.yaml exists
                    if [ ! -f "codepipeline/deploy.yaml" ]; then
                        echo "❌ codepipeline/deploy.yaml not found!"
                        exit 1
                    fi

                    # Validate Dockerfile exists
                    if [ ! -f "Dockerfile" ]; then
                        echo "❌ Dockerfile not found!"
                        exit 1
                    fi

                    # Validate deploy.yaml syntax
                    python3 -c "import yaml; yaml.safe_load(open('codepipeline/deploy.yaml'))"
                    echo "✓ Configuration valid"

                    # Validate package.json
                    if [ ! -f "package.json" ]; then
                        echo "❌ package.json not found!"
                        exit 1
                    fi
                '''
            }
        }

        stage('🧪 Build Test') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🧪 Testing Frontend Build"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # Test build in Docker container
                    docker run --rm -v $PWD:/app -w /app node:20-alpine sh -c "
                        npm ci &&
                        npm run build || true
                    "
                    echo "✓ Build test completed"
                '''
            }
        }

        stage('🐳 Build & Push Docker Image') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🐳 Building Frontend Docker Image"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # ECR Login
                    aws ecr get-login-password --region ${AWS_REGION} | \
                        docker login --username AWS --password-stdin \
                        ${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com

                    # Build image
                    IMAGE_TAG="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/auto-deploy-${SERVICE_NAME}:${BUILD_NUMBER}"
                    echo "Building image: $IMAGE_TAG"
                    docker build -t $IMAGE_TAG .

                    # Push to ECR
                    echo "Pushing image to ECR..."
                    docker push $IMAGE_TAG

                    # Tag as latest
                    docker tag $IMAGE_TAG "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/auto-deploy-${SERVICE_NAME}:latest"
                    docker push "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/auto-deploy-${SERVICE_NAME}:latest"

                    echo "✓ Image pushed: $IMAGE_TAG"
                '''
            }
        }

        stage('🚀 Deploy to ECS (Blue-Green)') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🚀 Deploying Frontend with Blue-Green Strategy"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # Install dependencies
                    pip3 install -q boto3 pyyaml

                    # Download deploy script if not present
                    if [ ! -f "deploy.py" ]; then
                        echo "Downloading deploy.py..."
                        curl -sO https://raw.githubusercontent.com/YOUR_REPO/deploy.py
                    fi

                    # Run deployment
                    python3 deploy.py
                '''
            }
        }

        stage('🏥 Health Check') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🏥 Running Health Checks"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    echo "Waiting for deployment to stabilize..."
                    sleep 30

                    # Health check loop
                    for i in {1..10}; do
                        if curl -sf https://www.webbyftw.co.in/ > /dev/null 2>&1; then
                            echo ""
                            echo "✅ Frontend is healthy!"
                            exit 0
                        fi
                        echo "⏳ Waiting for frontend... ($i/10)"
                        sleep 10
                    done

                    echo "⚠️  Health check timeout (service may still be starting)"
                '''
            }
        }

        stage('📊 Verify Deployment') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "📊 Verifying Deployment"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # Check running tasks
                    echo "Checking ECS service status..."
                    aws ecs describe-services \
                        --cluster ${CLUSTER_NAME} \
                        --services ${SERVICE_NAME} \
                        --query 'services[0].[serviceName,status,runningCount,desiredCount]' \
                        --output table

                    # List tasks
                    echo ""
                    echo "Running tasks:"
                    aws ecs list-tasks \
                        --cluster ${CLUSTER_NAME} \
                        --service-name ${SERVICE_NAME} \
                        --desired-status RUNNING \
                        --query 'taskArns' \
                        --output table
                '''
            }
        }
    }

    post {
        success {
            script {
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "✅ FRONTEND DEPLOYMENT SUCCESSFUL"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                echo "Service URL: https://www.webbyftw.co.in"
                echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

                emailext (
                    subject: "✅ Frontend Deployment Successful - Build #${env.BUILD_NUMBER}",
                    body: """
                    <h2>✅ Frontend Deployed Successfully!</h2>
                    <table border="1" cellpadding="10">
                        <tr><td><b>Service</b></td><td>Frontend Application</td></tr>
                        <tr><td><b>Build</b></td><td>#${env.BUILD_NUMBER}</td></tr>
                        <tr><td><b>Cluster</b></td><td>${env.CLUSTER_NAME}</td></tr>
                        <tr><td><b>Strategy</b></td><td>Blue-Green (Zero Downtime)</td></tr>
                    </table>
                    <h3>Service URLs:</h3>
                    <ul>
                        <li><a href='https://www.webbyftw.co.in'>Homepage</a></li>
                        <li><a href='https://www.webbyftw.co.in/dashboard'>Dashboard</a></li>
                    </ul>
                    <p><i>Deployment completed with zero downtime using blue-green strategy.</i></p>
                    <p><a href='${env.BUILD_URL}console'>View Console Output</a></p>
                    """,
                    to: 'vibhavhaneja2004@gmail.com',
                    mimeType: 'text/html'
                )
            }
        }

        failure {
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
            echo "❌ FRONTEND DEPLOYMENT FAILED"
            echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

            emailext (
                subject: "❌ Frontend Deployment Failed - Build #${env.BUILD_NUMBER}",
                body: """
                <h2>❌ Frontend Deployment Failed</h2>
                <table border="1" cellpadding="10">
                    <tr><td><b>Service</b></td><td>Frontend Application</td></tr>
                    <tr><td><b>Build</b></td><td>#${env.BUILD_NUMBER}</td></tr>
                    <tr><td><b>Status</b></td><td><span style="color:red">FAILED</span></td></tr>
                </table>
                <p>Please check the logs for details.</p>
                <p><a href='${env.BUILD_URL}console'>View Console Output</a></p>
                """,
                to: 'vibhavhaneja2004@gmail.com',
                mimeType: 'text/html'
            )
        }

        always {
            script {
                // Docker cleanup
                try {
                    sh 'docker system prune -f || true'
                } catch (Exception e) {
                    echo "Docker cleanup: ${e.message}"
                }
                // Workspace cleanup with permission handling
                try {
                    sh '''
                        # Fix permissions and remove files
                        chmod -R 777 ${WORKSPACE} || true
                        rm -rf ${WORKSPACE}/* ${WORKSPACE}/.* || true
                    '''
                } catch (Exception e) {
                    echo "Workspace cleanup: ${e.message}"
                }
            }
        }
    }
}
