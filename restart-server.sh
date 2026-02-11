#!/bin/bash
# Robust TaskPulse Server Startup Script
# This script prevents port conflicts and ensures clean startup

set -e  # Exit on any error

echo "╔══════════════════════════════════════════════════════════╗"
echo "║  TaskPulse Server - Robust Startup                       ║"
echo "╚══════════════════════════════════════════════════════════╝"
echo ""

# Kill any existing processes on port 3000
echo "🔍 Checking for processes on port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Found process on port 3000, terminating..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
    sleep 2
    echo "✅ Process terminated"
else
    echo "✅ Port 3000 is free"
fi

# Kill any existing nodemon/node processes for TaskPulse
echo ""
echo "🔍 Checking for orphaned TaskPulse processes..."
pkill -f "node server.js" 2>/dev/null || true
pkill -f "nodemon.*server" 2>/dev/null || true
sleep 1
echo "✅ Cleaned up any orphaned processes"

# Navigate to server directory
cd server

# Start the server
echo ""
echo "🚀 Starting TaskPulse server..."
echo "   Backend: http://localhost:3000"
echo "   API Docs: http://localhost:3000/api"
echo ""

# Run in foreground so we can see output
npm run dev