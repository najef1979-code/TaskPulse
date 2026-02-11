#!/bin/bash

# TaskPulse Status Script
# Shows the status of both servers

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3050"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}TaskPulse Server Status${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check backend
echo -n "Backend (port 3000): "
if curl -s "${BACKEND_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ RUNNING${NC}"
    echo -e "  Health: ${GREEN}OK${NC}"
    echo "  URL: ${BACKEND_URL}"
    echo "  API: ${BACKEND_URL}/api"
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    echo "  Unable to connect to ${BACKEND_URL}"
fi

echo ""

# Check frontend
echo -n "Frontend (port 3050): "
if curl -s "${FRONTEND_URL}" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ RUNNING${NC}"
    echo -e "  Health: ${GREEN}OK${NC}"
    echo "  URL: ${FRONTEND_URL}"
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    echo "  Unable to connect to ${FRONTEND_URL}"
fi

echo ""

# Check if processes are running
echo "Process Status:"
BACKEND_PID=$(lsof -ti:3000 2>/dev/null || true)
FRONTEND_PID=$(lsof -ti:3050 2>/dev/null || true)

if [ -n "$BACKEND_PID" ]; then
    echo -e "  Backend PID: ${GREEN}$BACKEND_PID${NC}"
else
    echo -e "  Backend PID: ${RED}Not found${NC}"
fi

if [ -n "$FRONTEND_PID" ]; then
    echo -e "  Frontend PID: ${GREEN}$FRONTEND_PID${NC}"
else
    echo -e "  Frontend PID: ${RED}Not found${NC}"
fi

echo ""