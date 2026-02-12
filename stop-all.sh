#!/bin/bash

# TaskPulse Stop Script (Production Mode - Single Port)
# Stops the TaskPulse server

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping TaskPulse server...${NC}"

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        echo -e "${RED}Killing process on port $port (PID: $pid)${NC}"
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
    else
        echo -e "${GREEN}No process found on port $port${NC}"
    fi
}

# Stop server (single port in production mode)
kill_port 3000

echo -e "${GREEN}✓ TaskPulse server stopped${NC}"
