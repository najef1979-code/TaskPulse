#!/bin/bash

# TaskPulse Status Script
# Shows the status of the server (production mode - single port)

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SERVER_URL="http://localhost:3000"

echo -e "${BLUE}======================================${NC}"
echo -e "${BLUE}TaskPulse Server Status${NC}"
echo -e "${BLUE}======================================${NC}\n"

# Check server (production mode - serves both API and frontend)
echo -n "TaskPulse (port 3000): "
if curl -s "${SERVER_URL}/health" > /dev/null 2>&1; then
    echo -e "${GREEN}✓ RUNNING${NC}"
    echo -e "  Health: ${GREEN}OK${NC}"
    echo "  URL: ${SERVER_URL}"
    echo "  API: ${SERVER_URL}/api"
    
    # Check if production mode (serves static files)
    if curl -s "${SERVER_URL}/" | grep -q "TaskPulse\|Vite\|React"; then
        echo -e "  Frontend: ${GREEN}Served from server (production mode)${NC}"
    fi
else
    echo -e "${RED}✗ NOT RUNNING${NC}"
    echo "  Unable to connect to ${SERVER_URL}"
fi

echo ""

# Check if process is running
echo "Process Status:"
SERVER_PID=$(lsof -ti:3000 2>/dev/null || true)

if [ -n "$SERVER_PID" ]; then
    echo -e "  Server PID: ${GREEN}$SERVER_PID${NC}"
else
    echo -e "  Server PID: ${RED}Not found${NC}"
fi

# Check node processes
echo ""
echo "Node Processes:"
pgrep -a node 2>/dev/null | head -5 || echo "  No node processes found"

echo ""

# Access URLs
echo -e "${BLUE}Access URLs:${NC}"
echo "  Local:    http://localhost:3000"
echo "  Network:  http://192.168.2.128:3000"
echo "  Domain:   https://taskpulse.ceraimic.eu"
echo ""
