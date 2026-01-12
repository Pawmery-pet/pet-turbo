#!/bin/bash

# Docker build script for golden-retriver
# This script must be run from the repository root

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="golden-retriver"
IMAGE_NAME="golden-retriver"
DEFAULT_TAG="latest"

# Get script directory and repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${GREEN}Building Docker image for ${APP_NAME}...${NC}"
echo -e "Repository root: ${REPO_ROOT}"
echo ""

# Change to repo root
cd "$REPO_ROOT"

# Parse arguments
TAG="${1:-$DEFAULT_TAG}"
PLATFORM="${2:-}"

# Build command
BUILD_CMD="docker build -f apps/${APP_NAME}/Dockerfile -t ${IMAGE_NAME}:${TAG}"

# Add platform if specified
if [ -n "$PLATFORM" ]; then
	BUILD_CMD="$BUILD_CMD --platform=$PLATFORM"
fi

# Add build context
BUILD_CMD="$BUILD_CMD ."

echo -e "${YELLOW}Running: ${BUILD_CMD}${NC}"
echo ""

# Execute build
if eval "$BUILD_CMD"; then
	echo ""
	echo -e "${GREEN}✓ Successfully built ${IMAGE_NAME}:${TAG}${NC}"
	echo ""
	echo "To run the container:"
	echo "  docker run -d -p 3030:3030 --env-file apps/${APP_NAME}/.env --name ${APP_NAME} ${IMAGE_NAME}:${TAG}"
	echo ""
	echo "To view logs:"
	echo "  docker logs -f ${APP_NAME}"
	echo ""
	echo "To test the API:"
	echo "  curl http://localhost:3030/"
else
	echo ""
	echo -e "${RED}✗ Build failed${NC}"
	exit 1
fi
