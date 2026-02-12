#!/bin/bash

# TaskPulse Daemon Script (Production Mode - Single Port)
# Starts and manages the TaskPulse server

set -e

# Configuration
SERVER_PORT=3000
SERVER_URL="http://localhost:${SERVER_PORT}"

# NVM Node.js path
NVM_NODE="/home/najef/.nvm/versions/node/v24.11.0/bin"
export PATH="${NVM_NODE}:${PATH}"
export NVM_DIR="/home/najef/.nvm"

# Load NVM environment manually
if [ -f "$NVM_DIR/nvm.sh" ]; then
    . "$NVM_DIR/nvm.sh"
fi

# Log files
DAEMON_LOG="/home/najef/Projects/TaskPulse/daemon.log"
SERVER_LOG="/home/najef/Projects/TaskPulse/server.log"

# PID
SERVER_PID=""

# Trap signals for graceful shutdown
trap 'shutdown' SIGTERM SIGINT

# Helper functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$DAEMON_LOG"
}

kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        log "Killing process on port $port (PID: $pid)"
        kill -9 "$pid" 2>/dev/null || true
        sleep 1
    fi
}

shutdown() {
    log "Received shutdown signal, stopping server..."
    
    # Stop server
    if [ -n "$SERVER_PID" ]; then
        log "Stopping server (PID: $SERVER_PID)..."
        kill -TERM "$SERVER_PID" 2>/dev/null || true
        wait "$SERVER_PID" 2>/dev/null || true
        log "Server stopped"
    fi
    
    log "TaskPulse daemon shutdown complete"
    exit 0
}

# Main startup
log "=== TaskPulse Daemon Starting (Production Mode) ==="

# Stop existing server
log "Cleaning up existing processes..."
kill_port $SERVER_PORT

# Start server in production mode
log "Starting TaskPulse server on port $SERVER_PORT (production mode)..."
cd /home/najef/Projects/TaskPulse/server
NODE_ENV=production node server.js > "$SERVER_LOG" 2>&1 &
SERVER_PID=$!
log "Server started (PID: $SERVER_PID)"

# Health checks
log "Performing health checks..."

SERVER_READY=false
for i in {1..30}; do
    if curl -s "${SERVER_URL}/health" > /dev/null 2>&1; then
        log "Server is healthy"
        SERVER_READY=true
        break
    fi
    sleep 1
done

if [ "$SERVER_READY" = false ]; then
    log "ERROR: Server failed to start within 30 seconds"
    shutdown
    exit 1
fi

log "=== TaskPulse is running ==="
log "Server:   ${SERVER_URL}"
log "Frontend: ${SERVER_URL}"
log "API:       ${SERVER_URL}/api"
log "Logs:      server.log"
log ""

# Monitor child process and wait for it to finish
while true; do
    # Check if server is still running
    if ! kill -0 "$SERVER_PID" 2>/dev/null; then
        log "ERROR: Server process died (PID: $SERVER_PID)"
        shutdown
        exit 1
    fi
    
    sleep 5
done