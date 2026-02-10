#!/bin/bash
set -euo pipefail

# =============================================================================
# Mrliou Particle System - Deploy to AWS ECR
# Usage: ./deploy/deploy.sh [staging|production]
# =============================================================================

ENVIRONMENT="${1:-staging}"
AWS_REGION="${AWS_REGION:-ap-northeast-1}"
ECR_REPO="${ECR_REPOSITORY:-mrliou-particle}"
IMAGE_TAG="$(git rev-parse --short HEAD)-$(date +%Y%m%d%H%M%S)"

echo "======================================"
echo " Mr.Liou Particle System - Deploy"
echo "======================================"
echo " Environment : ${ENVIRONMENT}"
echo " Region      : ${AWS_REGION}"
echo " Image Tag   : ${IMAGE_TAG}"
echo "======================================"

# Step 1: Authenticate with ECR
echo "[1/5] Authenticating with AWS ECR..."
aws ecr get-login-password --region "${AWS_REGION}" \
    | docker login --username AWS --password-stdin \
    "${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"

# Step 2: Create repository if not exists
echo "[2/5] Ensuring ECR repository exists..."
aws ecr describe-repositories --repository-names "${ECR_REPO}" --region "${AWS_REGION}" 2>/dev/null \
    || aws ecr create-repository --repository-name "${ECR_REPO}" --region "${AWS_REGION}" \
        --image-scanning-configuration scanOnPush=true

# Step 3: Build image
echo "[3/5] Building Docker image..."
FULL_IMAGE="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com/${ECR_REPO}"

docker build \
    -f deploy/docker/Dockerfile \
    -t "${FULL_IMAGE}:${IMAGE_TAG}" \
    -t "${FULL_IMAGE}:latest" \
    -t "${FULL_IMAGE}:${ENVIRONMENT}" \
    --label "environment=${ENVIRONMENT}" \
    --label "git.sha=$(git rev-parse HEAD)" \
    .

# Step 4: Push to ECR
echo "[4/5] Pushing to ECR..."
docker push "${FULL_IMAGE}:${IMAGE_TAG}"
docker push "${FULL_IMAGE}:latest"
docker push "${FULL_IMAGE}:${ENVIRONMENT}"

# Step 5: Verify
echo "[5/5] Verifying deployment..."
aws ecr describe-images \
    --repository-name "${ECR_REPO}" \
    --image-ids imageTag="${IMAGE_TAG}" \
    --region "${AWS_REGION}"

echo ""
echo "======================================"
echo " Deploy complete!"
echo " Image: ${FULL_IMAGE}:${IMAGE_TAG}"
echo "======================================"
