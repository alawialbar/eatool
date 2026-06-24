#!/bin/bash
# =============================================================================
# EA Management Tool - Deployment Script
# =============================================================================
# Usage: ./deploy.sh
#
# Prerequisites:
#   - AWS CLI configured with appropriate credentials
#   - Docker installed and running
#   - Node.js 20+ installed
#   - CloudFormation stack already deployed (stack name: ea-mgmt)
# =============================================================================

set -euo pipefail

STACK_NAME="ea-mgmt"
REGION="us-east-1"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "========================================"
echo "EA Management Tool - Deployment"
echo "========================================"

# -----------------------------------------------------------------------------
# Fetch stack outputs
# -----------------------------------------------------------------------------
echo ""
echo "[1/7] Fetching CloudFormation stack outputs..."

get_output() {
  aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME" \
    --region "$REGION" \
    --query "Stacks[0].Outputs[?OutputKey=='$1'].OutputValue" \
    --output text
}

ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REPO="${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com/ea-mgmt-backend"
COGNITO_USER_POOL_ID=$(get_output "CognitoUserPoolId")
COGNITO_CLIENT_ID=$(get_output "CognitoClientId")
FRONTEND_URL=$(get_output "FrontendURL")
BACKEND_URL=$(get_output "BackendURL")
DB_ENDPOINT=$(get_output "DatabaseEndpoint")
FRONTEND_BUCKET="ea-mgmt-frontend-${ACCOUNT_ID}"
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --query "DistributionList.Items[?Origins.Items[?Id=='S3Origin' && contains(DomainName, '${FRONTEND_BUCKET}')]].Id" \
  --output text)

echo "  ECR Repo: $ECR_REPO"
echo "  Backend URL: $BACKEND_URL"
echo "  Frontend URL: $FRONTEND_URL"

# -----------------------------------------------------------------------------
# Step 1: Build backend Docker image
# -----------------------------------------------------------------------------
echo ""
echo "[2/7] Building backend Docker image..."

cd "$PROJECT_ROOT/backend"
docker build -t ea-mgmt-backend:latest .

echo "  Docker image built successfully."

# -----------------------------------------------------------------------------
# Step 2: Push to ECR
# -----------------------------------------------------------------------------
echo ""
echo "[3/7] Pushing Docker image to ECR..."

# Authenticate Docker with ECR
aws ecr get-login-password --region "$REGION" | \
  docker login --username AWS --password-stdin "${ACCOUNT_ID}.dkr.ecr.${REGION}.amazonaws.com"

# Tag and push
docker tag ea-mgmt-backend:latest "${ECR_REPO}:latest"
docker push "${ECR_REPO}:latest"

echo "  Image pushed to ECR."

# -----------------------------------------------------------------------------
# Step 3: Run Prisma migrations against RDS
# -----------------------------------------------------------------------------
echo ""
echo "[4/7] Running Prisma migrations..."

# Fetch the database password from Secrets Manager
DB_PASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "ea-mgmt/db-password" \
  --region "$REGION" \
  --query "SecretString" \
  --output text | jq -r '.password')

export DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@${DB_ENDPOINT}:5432/eamgmt?schema=public"

cd "$PROJECT_ROOT/backend"
npx prisma migrate deploy

echo "  Migrations applied successfully."

# -----------------------------------------------------------------------------
# Step 4: Build frontend with environment variables
# -----------------------------------------------------------------------------
echo ""
echo "[5/7] Building frontend..."

cd "$PROJECT_ROOT/frontend"

# Set environment variables for the Vite build
export VITE_API_URL="${BACKEND_URL}"
export VITE_COGNITO_USER_POOL_ID="${COGNITO_USER_POOL_ID}"
export VITE_COGNITO_CLIENT_ID="${COGNITO_CLIENT_ID}"
export VITE_COGNITO_REGION="${REGION}"

npm run build

echo "  Frontend built successfully."

# -----------------------------------------------------------------------------
# Step 5: Sync frontend to S3
# -----------------------------------------------------------------------------
echo ""
echo "[6/7] Syncing frontend to S3..."

aws s3 sync dist/ "s3://${FRONTEND_BUCKET}/" \
  --delete \
  --cache-control "public, max-age=31536000, immutable" \
  --region "$REGION"

# Set shorter cache for index.html (so updates propagate quickly)
aws s3 cp dist/index.html "s3://${FRONTEND_BUCKET}/index.html" \
  --cache-control "public, max-age=0, must-revalidate" \
  --content-type "text/html" \
  --region "$REGION"

echo "  Frontend synced to S3."

# -----------------------------------------------------------------------------
# Step 6: Invalidate CloudFront cache
# -----------------------------------------------------------------------------
echo ""
echo "[7/7] Invalidating CloudFront cache..."

if [ -n "$DISTRIBUTION_ID" ]; then
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" \
    --region "$REGION"
  echo "  CloudFront invalidation created."
else
  echo "  WARNING: Could not determine CloudFront distribution ID. Skipping invalidation."
fi

# -----------------------------------------------------------------------------
# Step 7: Update ECS service to pull new image
# -----------------------------------------------------------------------------
echo ""
echo "[BONUS] Forcing ECS service redeployment..."

aws ecs update-service \
  --cluster ea-mgmt-cluster \
  --service ea-mgmt-backend-service \
  --force-new-deployment \
  --region "$REGION" \
  --no-cli-pager

echo "  ECS service update triggered."

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo ""
echo "========================================"
echo "Deployment complete!"
echo "========================================"
echo ""
echo "  Frontend: $FRONTEND_URL"
echo "  Backend:  $BACKEND_URL"
echo ""
