#!/bin/bash

echo "======================================"
echo "TaskPulse Service Diagnostics"
echo "======================================"
echo ""

# Check if service file exists
echo "1. Checking if service file exists in /etc/systemd/system/..."
if [ -f /etc/systemd/system/taskpulse.service ]; then
    echo "✓ Service file exists"
    echo ""
    echo "Service file contents:"
    cat /etc/systemd/system/taskpulse.service
else
    echo "✗ Service file NOT found in /etc/systemd/system/"
    echo ""
    echo "The service was not installed. Please run:"
    echo "  sudo ./setup-service.sh"
    exit 1
fi

echo ""
echo "======================================"
echo "2. Checking if service is enabled..."
echo "(This requires sudo, please check manually with:)"
echo "  systemctl is-enabled taskpulse"
echo ""

echo "======================================"
echo "3. Checking if service is active..."
echo "(This requires sudo, please check manually with:)"
echo "  systemctl is-active taskpulse"
echo ""

echo "======================================"
echo "4. Checking service status..."
echo "(This requires sudo, please run:)"
echo "  sudo systemctl status taskpulse -l"
echo ""

echo "======================================"
echo "5. Checking recent service logs..."
echo "(This requires sudo, please run:)"
echo "  journalctl -u taskpulse -n 50"
echo ""

echo "======================================"
echo "6. Checking if ports are in use..."
echo ""
if lsof -i :3000 >/dev/null 2>&1; then
    echo "Port 3000 (backend) is in use by:"
    lsof -i :3000
else
    echo "✓ Port 3000 (backend) is free"
fi

echo ""
if lsof -i :3050 >/dev/null 2>&1; then
    echo "Port 3050 (frontend) is in use by:"
    lsof -i :3050
else
    echo "✓ Port 3050 (frontend) is free"
fi

echo ""
echo "======================================"
echo "7. Checking daemon log file..."
if [ -f daemon.log ]; then
    echo "✓ daemon.log exists"
    echo ""
    echo "Last 20 lines:"
    tail -20 daemon.log
else
    echo "✗ daemon.log not found"
fi

echo ""
echo "======================================"
echo "8. Checking Node.js availability..."
if command -v node >/dev/null 2>&1; then
    echo "✓ Node.js found: $(node --version)"
    echo "  Location: $(which node)"
else
    echo "✗ Node.js NOT found in PATH"
fi

echo ""
if command -v npm >/dev/null 2>&1; then
    echo "✓ npm found: $(npm --version)"
    echo "  Location: $(which npm)"
else
    echo "✗ npm NOT found in PATH"
fi

echo ""
echo "======================================"
echo "9. Checking daemon script..."
if [ -f taskpulse-daemon.sh ]; then
    echo "✓ taskpulse-daemon.sh exists"
    if [ -x taskpulse-daemon.sh ]; then
        echo "✓ taskpulse-daemon.sh is executable"
    else
        echo "✗ taskpulse-daemon.sh is NOT executable"
        echo "  Run: chmod +x taskpulse-daemon.sh"
    fi
else
    echo "✗ taskpulse-daemon.sh NOT found"
fi

echo ""
echo "======================================"
echo "Diagnostic Complete"
echo "======================================"
echo ""
echo "If the service is not enabled, run:"
echo "  sudo systemctl enable taskpulse"
echo ""
echo "If the service is enabled but not active, start it:"
echo "  sudo systemctl start taskpulse"
echo ""
echo "To reinstall the service:"
echo "  sudo ./setup-service.sh"