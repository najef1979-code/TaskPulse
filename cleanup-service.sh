#!/bin/bash

# TaskPulse Service Cleanup Script
# Removes any previously installed TaskPulse service

echo "======================================"
echo "TaskPulse Service Cleanup"
echo "======================================"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo "This script must be run as root (use sudo)"
    echo ""
    echo "Usage: sudo ./cleanup-service.sh"
    exit 1
fi

# Check if service exists
if [ -f /etc/systemd/system/taskpulse.service ]; then
    echo "Found existing TaskPulse service..."
    
    # Stop the service if running
    echo "Stopping service..."
    systemctl stop taskpulse.service 2>/dev/null || true
    echo "✓ Service stopped"
    
    # Disable the service
    echo "Disabling service..."
    systemctl disable taskpulse.service 2>/dev/null || true
    echo "✓ Service disabled"
    
    # Remove the service file
    echo "Removing service file..."
    rm /etc/systemd/system/taskpulse.service
    echo "✓ Service file removed"
    
    # Reload systemd daemon
    echo "Reloading systemd daemon..."
    systemctl daemon-reload
    echo "✓ Systemd reloaded"
    
    # Reset failed state
    systemctl reset-failed 2>/dev/null || true
    echo "✓ Reset failed state"
else
    echo "No existing TaskPulse service found."
fi

echo ""
echo "======================================"
echo "Cleanup Complete!"
echo "======================================"
echo ""
echo "You can now run: sudo ./setup-service.sh"