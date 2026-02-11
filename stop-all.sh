#!/bin/bash

# TaskPulse Stop Script
# Stops both backend and frontend servers

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Stopping TaskPulse servers...${NC}"

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

# Stop servers
kill_port 3000
kill_port 3050

echo -e "${GREEN}✓ All servers stopped${NC}"