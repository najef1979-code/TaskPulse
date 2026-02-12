#!/bin/bash

# TaskPulse Runner Script (Production Mode - Single Port)
# Starts the server, performs health checks, and runs integration tests

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_PORT=3000
SERVER_URL="http://localhost:${SERVER_PORT}"
API_URL="${SERVER_URL}/api"

# Log file
LOG_FILE="startup.log"

# Helper functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

print_header() {
    echo -e "\n${BLUE}======================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}======================================${NC}\n"
    log "$1"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
    log "SUCCESS: $1"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
    log "ERROR: $1"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
    log "WARNING: $1"
}

# Parse arguments
SKIP_TESTS=true  # Default to skipping demo creation
TEST_ONLY=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --test)
            SKIP_TESTS=false
            shift
            ;;
        --no-test)
            SKIP_TESTS=true
            shift
            ;;
        --test-only)
            TEST_ONLY=true
            shift
            ;;
        *)
            print_error "Unknown option: $1"
            echo "Usage: $0 [--test] [--no-test] [--test-only]"
            echo ""
            echo "Options:"
            echo "  --test      Run demo project creation tests (default: skipped)"
            echo "  --no-test   Skip demo project creation tests (default)"
            echo "  --test-only Only run tests, don't start server"
            exit 1
            ;;
    esac
done

# Initialize log
echo "=== TaskPulse Runner - $(date) ===" > "$LOG_FILE"

# Function to kill processes on specific ports
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null || true)
    if [ -n "$pid" ]; then
        log "Killing process on port $port (PID: $pid)"
        kill -9 "$pid" 2>/dev/null || true
        sleep 2
    fi
}

# Stop existing server (only if not test-only)
if [ "$TEST_ONLY" = false ]; then
    print_header "Stopping existing server..."
    kill_port $SERVER_PORT
fi

# Skip startup if test-only
if [ "$TEST_ONLY" = false ]; then
    # Start server in production mode
    print_header "Starting TaskPulse server (production mode)..."
    cd server
    NODE_ENV=production nohup node server.js > ../server.log 2>&1 &
    SERVER_PID=$!
    cd ..
    print_success "Server starting (PID: $SERVER_PID)"
    log "Server PID: $SERVER_PID"

    # Health checks
    print_header "Performing health checks..."
    
    # Check server
    SERVER_READY=false
    for i in {1..30}; do
        if curl -s "${SERVER_URL}/health" > /dev/null 2>&1; then
            print_success "Server is healthy on port $SERVER_PORT"
            SERVER_READY=true
            break
        fi
        echo -n "."
        sleep 1
    done
    echo
    
    if [ "$SERVER_READY" = false ]; then
        print_error "Server failed to start within 30 seconds"
        exit 1
    fi

    # Check frontend
    FRONTEND_READY=false
    for i in {1..30}; do
        if curl -s "${SERVER_URL}" > /dev/null 2>&1; then
            print_success "Frontend is serving on port $SERVER_PORT"
            FRONTEND_READY=true
            break
        fi
        echo -n "."
        sleep 1
    done
    echo
    
    if [ "$FRONTEND_READY" = false ]; then
        print_error "Frontend failed to serve within 30 seconds"
        exit 1
    fi

    print_success "TaskPulse is running!"
    echo ""
    echo -e "${GREEN}Server (Frontend + API):${NC} ${SERVER_URL}"
    echo ""
fi

# Run integration tests
if [ "$SKIP_TESTS" = false ]; then
    print_header "Running integration tests..."
    
    # Test 1: Create demo project
    echo -n "Creating demo project... "
    PROJECT_RESPONSE=$(curl -s -X POST "${API_URL}/projects" \
        -H "Content-Type: application/json" \
        -d '{"name":"DEMO_TEST_PROJECT","description":"Automated test project"}')
    
    if echo "$PROJECT_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        PROJECT_ID=$(echo "$PROJECT_RESPONSE" | jq -r '.id')
        print_success "Created project ID: $PROJECT_ID"
    else
        print_error "Failed to create project"
        echo "Response: $PROJECT_RESPONSE"
        exit 1
    fi

    # Test 2: Create demo task
    echo -n "Creating demo task... "
    TASK_RESPONSE=$(curl -s -X POST "${API_URL}/tasks" \
        -H "Content-Type: application/json" \
        -d "{\"title\":\"Demo Task\",\"projectId\":$PROJECT_ID,\"description\":\"Automated test task\",\"priority\":\"high\"}")
    
    if echo "$TASK_RESPONSE" | jq -e '.id' > /dev/null 2>&1; then
        TASK_ID=$(echo "$TASK_RESPONSE" | jq -r '.id')
        print_success "Created task ID: $TASK_ID"
    else
        print_error "Failed to create task"
        echo "Response: $TASK_RESPONSE"
        exit 1
    fi

    # Test 3: Start task
    echo -n "Starting task... "
    START_RESPONSE=$(curl -s -X POST "${API_URL}/tasks/${TASK_ID}/start")
    if echo "$START_RESPONSE" | jq -e '.status | select(.=="in-progress")' > /dev/null 2>&1; then
        print_success "Task status: in-progress"
    else
        print_error "Failed to start task"
        exit 1
    fi

    # Test 4: Complete task
    echo -n "Completing task... "
    COMPLETE_RESPONSE=$(curl -s -X POST "${API_URL}/tasks/${TASK_ID}/complete")
    if echo "$COMPLETE_RESPONSE" | jq -e '.status | select(.=="done")' > /dev/null 2>&1; then
        print_success "Task status: done"
    else
        print_error "Failed to complete task"
        exit 1
    fi

    # Test 5: Reopen task
    echo -n "Reopening task... "
    REOPEN_RESPONSE=$(curl -s -X POST "${API_URL}/tasks/${TASK_ID}/reopen")
    if echo "$REOPEN_RESPONSE" | jq -e '.status | select(.=="pending")' > /dev/null 2>&1; then
        print_success "Task status: pending"
    else
        print_error "Failed to reopen task"
        exit 1
    fi

    # Test 6: Delete task
    echo -n "Deleting task... "
    DELETE_TASK_RESPONSE=$(curl -s -X DELETE "${API_URL}/tasks/${TASK_ID}")
    if echo "$DELETE_TASK_RESPONSE" | jq -e '.deleted | select(.==true)' > /dev/null 2>&1; then
        print_success "Task deleted"
    else
        print_error "Failed to delete task"
        exit 1
    fi

    # Test 7: Delete project
    echo -n "Deleting project... "
    DELETE_PROJECT_RESPONSE=$(curl -s -X DELETE "${API_URL}/projects/${PROJECT_ID}")
    if echo "$DELETE_PROJECT_RESPONSE" | jq -e '.deleted | select(.==true)' > /dev/null 2>&1; then
        print_success "Project deleted"
    else
        print_error "Failed to delete project"
        exit 1
    fi

    print_header "All tests passed! ✓"
    print_success "TaskPulse is fully functional!"
fi

# Final status
echo ""
print_header "TaskPulse Status"
echo -e "${GREEN}✓ Server:${NC}  Running on ${SERVER_URL}"
echo -e "${GREEN}✓ Frontend:${NC}  Serving on ${SERVER_URL}"
echo -e "${GREEN}✓ API:${NC}       ${SERVER_URL}/api"
echo ""
echo "Logs available at:"
echo "  - server.log"
echo "  - startup.log"
echo ""
print_success "TaskPulse is ready to use!"