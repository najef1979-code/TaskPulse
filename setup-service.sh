#!/bin/bash

# TaskPulse Systemd Service Setup Script
# This script installs TaskPulse as a systemd service

set -e

echo "======================================"
echo "TaskPulse Service Setup"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "This script must be run as root (use sudo)"
    echo ""
    echo "Usage: sudo ./setup-service.sh"
    exit 1
fi

# Clean up any existing service
if [ -f /etc/systemd/system/taskpulse.service ]; then
    echo "Found existing TaskPulse service, removing..."
    systemctl stop taskpulse.service 2>/dev/null || true
    systemctl disable taskpulse.service 2>/dev/null || true
    rm /etc/systemd/system/taskpulse.service
    systemctl daemon-reload
    systemctl reset-failed 2>/dev/null || true
    echo "✓ Cleanup complete"
    echo ""
fi

# Copy service file
echo "Copying service file to /etc/systemd/system/..."
cp /home/najef/Projects/TaskPulse/taskpulse.service /etc/systemd/system/taskpulse.service
echo "✓ Service file copied"
echo ""

# Set proper permissions
echo "Setting permissions..."
chmod 644 /etc/systemd/system/taskpulse.service
echo "✓ Permissions set"
echo ""

# Reload systemd daemon
echo "Reloading systemd daemon..."
systemctl daemon-reload
echo "✓ Systemd reloaded"
echo ""

# Enable the service to start on boot
echo "Enabling TaskPulse service to start on boot..."
systemctl enable taskpulse.service
echo "✓ Service enabled"
echo ""

# Start the service
echo "Starting TaskPulse service..."
systemctl start taskpulse.service
echo "✓ Service started"
echo ""

# Wait a moment for service to start
sleep 5

# Check service status
echo "======================================"
echo "Service Status"
echo "======================================"
systemctl status taskpulse.service --no-pager -l
echo ""

echo "======================================"
echo "Setup Complete!"
echo "======================================"
echo ""
echo "TaskPulse is now running as a systemd service in production mode."
echo ""
echo "The service runs on a single port (production mode):"
echo "  - Server on port 3000 (serves both frontend and API)"
echo ""
echo "Access URLs:"
echo "  - Local:    http://localhost:3000"
echo "  - Network:  http://192.168.2.128:3000"
echo "  - Domain:   https://taskpulse.ceraimic.eu (once NAS proxy is configured)"
echo ""
echo "Useful commands:"
echo "  sudo systemctl status taskpulse      - Check service status"
echo "  sudo systemctl stop taskpulse       - Stop the service"
echo "  sudo systemctl start taskpulse      - Start the service"
echo "  sudo systemctl restart taskpulse    - Restart the service"
echo "  journalctl -u taskpulse -f          - Follow service logs"
echo ""
echo "The service will automatically start on system boot."
echo "If the server crashes, the service will detect it and shutdown gracefully,"
echo "then systemd will restart the entire service."
