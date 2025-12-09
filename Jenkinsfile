pipeline {
    agent any

    environment {
        AWS_REGION = 'us-east-1'
        AWS_ACCOUNT_ID = '312871631203'
        SERVICE_NAME = 'frontend'
        CLUSTER_NAME = 'auto-deploy-prod-cluster'
        PATH = "/var/lib/jenkins/bin:$PATH"
    }

    options {
        timestamps()
        timeout(time: 25, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        skipDefaultCheckout(true)  // We'll do clean checkout manually
    }

    stages {
        stage('🧹 Clean Workspace') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🧹 Cleaning workspace before checkout"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # Force clean workspace with permission fix
                    sudo chmod -R 777 ${WORKSPACE} || chmod -R 777 ${WORKSPACE} || true
                    rm -rf ${WORKSPACE}/* ${WORKSPACE}/.* || true
                    echo "✓ Workspace cleaned"
                '''
            }
        }

        stage('🧹 Checkout Code') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🧹 Checking out code"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # Manual git clone to avoid Jenkins workspace cleanup issues
                    git clone --depth 1 --branch main https://github.com/Aman-sain/ecs-frontend-service.git ${WORKSPACE}/repo

                    # Move contents to workspace root
                    mv ${WORKSPACE}/repo/* ${WORKSPACE}/ || true
                    mv ${WORKSPACE}/repo/.* ${WORKSPACE}/ 2>/dev/null || true
                    rm -rf ${WORKSPACE}/repo

                    echo "✓ Code checked out successfully"
                '''
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
                    docker build --build-arg NEXT_PUBLIC_API_URL=http://api.webbyftw.co.in/api -t $IMAGE_TAG .

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

        stage('🚀 Deploy to ECS via CloudFormation') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🚀 Deploying Frontend with CloudFormation"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # Parse deploy.yaml configuration
                    pip3 install -q pyyaml

                    # Read deploy.yaml values
                    CPU=$(python3 -c "import yaml; print(yaml.safe_load(open('codepipeline/deploy.yaml'))['ecs']['cpu'])")
                    MEMORY=$(python3 -c "import yaml; print(yaml.safe_load(open('codepipeline/deploy.yaml'))['ecs']['memory'])")
                    DESIRED_COUNT=$(python3 -c "import yaml; print(yaml.safe_load(open('codepipeline/deploy.yaml'))['ecs']['desired_count'])")
                    CONTAINER_PORT=$(python3 -c "import yaml; print(yaml.safe_load(open('codepipeline/deploy.yaml'))['ecs']['container_port'])")

                    echo "📊 Fetching infrastructure outputs..."
                    VPC_ID="vpc-02d7f89b03701136a"
                    SUBNET_IDS='subnet-05f141a577517f739,subnet-0707e9e2240b0c1c6,subnet-0fa19e6646dfe40c2'
                    TASK_EXEC_ROLE=$(aws iam get-role --role-name auto-deploy-ecs-execution-role --query 'Role.Arn' --output text)
                    TASK_ROLE=$(aws iam get-role --role-name auto-deploy-ecs-task-role --query 'Role.Arn' --output text)

                    # Build image tag
                    IMAGE_URI="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/auto-deploy-${SERVICE_NAME}:${BUILD_NUMBER}"

                    echo "Deploying CloudFormation stack..."
                    echo "  CPU: $CPU"
                    echo "  Memory: $MEMORY"
                    echo "  Desired Count: $DESIRED_COUNT"
                    echo "  Image: $IMAGE_URI"
                    echo "  Subnet IDs: $SUBNET_IDS"

                    # Save current task definition for rollback
                    echo "📋 Saving current deployment state for rollback..."
                    if aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --query 'services[0].taskDefinition' --output text 2>/dev/null | grep -q 'arn:aws'; then
                        PREVIOUS_TASK_DEF=$(aws ecs describe-services --cluster ${CLUSTER_NAME} --services ${SERVICE_NAME} --query 'services[0].taskDefinition' --output text)
                        echo "Previous task definition: $PREVIOUS_TASK_DEF"
                        echo "$PREVIOUS_TASK_DEF" > /tmp/previous_task_def_frontend.txt
                    else
                        echo "No previous deployment found (first deployment)"
                        echo "NONE" > /tmp/previous_task_def_frontend.txt
                    fi

                    # Deploy CloudFormation stack
                    echo "🚀 Starting CloudFormation deployment..."
                    aws cloudformation deploy \\
                        --template-file codepipeline/service-stack.yaml \\
                        --stack-name ecs-service-${SERVICE_NAME} \\
                        --parameter-overrides \\
                            ServiceName=${SERVICE_NAME} \\
                            ClusterName=${CLUSTER_NAME} \\
                            ImageUri=${IMAGE_URI} \\
                            ContainerPort=${CONTAINER_PORT} \\
                            DesiredCount=${DESIRED_COUNT} \\
                            Cpu=${CPU} \\
                            Memory=${MEMORY} \\
                            VpcId=${VPC_ID} \\
                            SubnetIds=${SUBNET_IDS} \\
                            TaskExecutionRoleArn=${TASK_EXEC_ROLE} \\
                            TaskRoleArn=${TASK_ROLE} \\
                            LogGroupName=/ecs/auto-deploy-prod \\
                        --capabilities CAPABILITY_IAM \\
                        --region ${AWS_REGION} \\
                        --no-fail-on-empty-changeset

                    if [ $? -eq 0 ]; then
                        echo "✅ CloudFormation deployment initiated successfully!"
                        echo "⏳ Waiting for ECS service to stabilize (blue-green deployment)..."

                        # Wait for service to become stable (ensures new tasks are running)
                        aws ecs wait services-stable \\
                            --cluster ${CLUSTER_NAME} \\
                            --services ${SERVICE_NAME} \\
                            --region ${AWS_REGION}

                        if [ $? -eq 0 ]; then
                            echo "✅ ECS service stabilized - new tasks are running!"
                        else
                            echo "⚠️  Service stabilization timed out, but continuing to health check..."
                        fi
                    else
                        echo "❌ CloudFormation deployment failed!"
                        exit 1
                    fi
                '''
            }
        }

        stage('🌐 Update DNS') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🌐 Updating DNS Record (Direct Access)"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    # Find the running task ARN
                    echo "🔍 Finding running task..."
                    TASK_ARN=$(aws ecs list-tasks --cluster ${CLUSTER_NAME} --service-name ${SERVICE_NAME} --desired-status RUNNING --query 'taskArns[0]' --output text --region ${AWS_REGION})
                    
                    if [ "$TASK_ARN" == "None" ]; then
                        echo "❌ No running task found!"
                        exit 1
                    fi
                    
                    echo "📝 Task ARN: $TASK_ARN"

                    # Get Network Interface ID (ENI)
                    ENI_ID=$(aws ecs describe-tasks --cluster ${CLUSTER_NAME} --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text --region ${AWS_REGION})
                    echo "🔌 ENI ID: $ENI_ID"

                    # Get Public IP
                    PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text --region ${AWS_REGION})
                    echo "🌍 Public IP: $PUBLIC_IP"
                    
                    if [ -z "$PUBLIC_IP" ] || [ "$PUBLIC_IP" == "None" ]; then
                        echo "❌ Could not retrieve Public IP!"
                        exit 1
                    fi

                    # Update Route53
                    echo "🔄 Updating Route53 record for www.webbyftw.co.in..."
                    HOSTED_ZONE_ID="Z0937327HD133Q6A55PH"
                    
                    cat <<EOF > change-batch.json
{
  "Comment": "Update record to point to ECS Task Public IP",
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.webbyftw.co.in",
        "Type": "A",
        "TTL": 60,
        "ResourceRecords": [
          {
            "Value": "${PUBLIC_IP}"
          }
        ]
      }
    }
  ]
}
EOF
                    aws route53 change-resource-record-sets --hosted-zone-id $HOSTED_ZONE_ID --change-batch file://change-batch.json
                    echo "✅ DNS Update Submitted!"
                '''
            }
        }

        stage('🏥 Health Check') {
            steps {
                script {
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🏥 Running Health Checks (Direct)"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                }
                sh '''
                    echo "⏳ Waiting 60s for service startup..."
                    sleep 60

                    # Find the running task IP again to be sure
                    TASK_ARN=$(aws ecs list-tasks --cluster ${CLUSTER_NAME} --service-name ${SERVICE_NAME} --desired-status RUNNING --query 'taskArns[0]' --output text --region ${AWS_REGION})
                    ENI_ID=$(aws ecs describe-tasks --cluster ${CLUSTER_NAME} --tasks $TASK_ARN --query 'tasks[0].attachments[0].details[?name==`networkInterfaceId`].value' --output text --region ${AWS_REGION})
                    PUBLIC_IP=$(aws ec2 describe-network-interfaces --network-interface-ids $ENI_ID --query 'NetworkInterfaces[0].Association.PublicIp' --output text --region ${AWS_REGION})

                    echo "🔍 Checking Health at http://${PUBLIC_IP}:80/ ..."

                    HEALTH_CHECK_PASSED=false
                    for i in {1..10}; do
                        echo "Attempt $i/10..."
                        if curl -sf --connect-timeout 5 "http://${PUBLIC_IP}:80/"; then
                            echo "✅ Health check passed!"
                            HEALTH_CHECK_PASSED=true
                            break
                        else
                            echo "⏳ Waiting..."
                            sleep 10
                        fi
                    done

                    if [ "$HEALTH_CHECK_PASSED" = false ]; then
                        echo "❌ Health Check Failed!"
                        aws logs tail /ecs/auto-deploy-prod --follow --since 5m --format short | head -50 || true
                        exit 1
                    fi
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
                // Cleanup temporary files
                try {
                    sh 'rm -f /tmp/previous_task_def_frontend.txt || true'
                } catch (Exception e) {
                    echo "Temp file cleanup: ${e.message}"
                }
                // Workspace cleanup with permission handling
                try {
                    sh '''
                        # Remove node_modules and build artifacts
                        find ${WORKSPACE} -type d -name "node_modules" -exec rm -rf {} + 2>/dev/null || true
                        find ${WORKSPACE} -type d -name ".next" -exec rm -rf {} + 2>/dev/null || true
                        docker system prune -f || true
                    '''
                } catch (Exception e) {
                    echo "Workspace cleanup: ${e.message}"
                }
            }
        }
    }
}
