#!/bin/bash

#############################################
# TaskPulse macOS Installation Script
# Installs both server and client components
#############################################

set -e

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_PORT=3000
CLIENT_PORT=3050
NODE_MIN_VERSION="18.0.0"

# Helper functions
print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_header() {
    echo ""
    echo -e "${BLUE}================================${NC}"
    echo -e "${BLUE} $1${NC}"
    echo -e "${BLUE}================================${NC}"
}

# Check macOS
check_macos() {
    print_header "Checking macOS Version"
    
    if [[ "$OSTYPE" != "darwin"* ]]; then
        print_error "This script is for macOS only"
        print_info "Use install.sh for Linux"
        exit 1
    fi
    
    MACOS_VERSION=$(sw_vers -productVersion)
    print_success "macOS $MACOS_VERSION detected"
}

# Check/install Homebrew
check_homebrew() {
    print_header "Checking Homebrew"
    
    if command -v brew &> /dev/null; then
        BREW_VERSION=$(brew --version | head -n 1)
        print_success "Homebrew installed: $BREW_VERSION"
        brew update
    else
        print_warning "Homebrew not found"
        read -p "Install Homebrew? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            print_info "Installing Homebrew..."
            /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
            
            # Add Homebrew to PATH if not already there
            if [[ ! ":$PATH:" == *":/opt/homebrew/bin:"* ]]; then
                echo 'eval "$(/opt/homebrew/brew shellenv)"' >> ~/.zprofile
                eval "$(/opt/homebrew/brew shellenv)"
            fi
            
            print_success "Homebrew installed"
        else
            print_error "Homebrew is required to install Node.js"
            exit 1
        fi
    fi
}

# Check Node.js version
check_node() {
    print_header "Checking Node.js"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v | sed 's/v//')
        print_success "Node.js installed: $NODE_VERSION"
        
        # Compare versions
        if [ "$(printf '%s\n' "$NODE_MIN_VERSION" "$NODE_VERSION" | sort -V | head -n1)" = "$NODE_MIN_VERSION" ]; then
            print_success "Node.js version meets minimum requirement ($NODE_MIN_VERSION)"
        else
            print_warning "Node.js version is below minimum ($NODE_MIN_VERSION)"
            read -p "Upgrade Node.js to latest LTS? (y/n): " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                install_node
            fi
        fi
    else
        print_warning "Node.js not found"
        read -p "Install Node.js latest LTS? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            install_node
        else
            print_error "Node.js is required to run TaskPulse"
            exit 1
        fi
    fi
}

# Install Node.js latest LTS
install_node() {
    print_info "Installing Node.js latest LTS via Homebrew..."
    brew install node
    print_success "Node.js installed: $(node -v)"
    print_success "npm installed: $(npm -v)"
}

# Check and configure firewall
configure_firewall() {
    print_header "Firewall Configuration"
    
    print_info "TaskPulse requires ports $SERVER_PORT (server) and $CLIENT_PORT (client)"
    print_warning "macOS firewall configuration must be done manually"
    echo ""
    echo "To open ports on macOS:"
    echo ""
    echo "Option 1: System Preferences"
    echo "  1. Open System Preferences > Security & Privacy > Firewall"
    echo "  2. Click 'Firewall Options'"
    echo "  3. Ensure Node.js is allowed to accept incoming connections"
    echo "  4. Add rules if needed"
    echo ""
    echo "Option 2: Using pfctl (Advanced)"
    echo "  1. Create /etc/pf.anchors/taskpulse with:"
    echo "     pass in on lo0 proto tcp from any to any port $SERVER_PORT"
    echo "     pass in on lo0 proto tcp from any to any port $CLIENT_PORT"
    echo "  2. Load with: sudo pfctl -e -f /etc/pf.anchors/taskpulse"
    echo ""
    echo "Note: For local development (localhost), ports are usually accessible"
    echo "      without firewall configuration. Firewall is primarily for remote access."
    echo ""
    
    read -p "Continue with installation? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
}

# Install dependencies
install_dependencies() {
    print_header "Installing Dependencies"
    
    # Install server dependencies
    print_info "Installing server dependencies..."
    cd server
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Server dependencies installed"
    else
        print_info "Server dependencies already installed"
    fi
    cd ..
    
    # Install client dependencies
    print_info "Installing client dependencies..."
    cd client
    if [ ! -d "node_modules" ]; then
        npm install
        print_success "Client dependencies installed"
    else
        print_info "Client dependencies already installed"
    fi
    cd ..
}

# Initialize database
init_database() {
    print_header "Initializing Database"
    
    # Check if .env exists
    if [ ! -f "server/.env" ]; then
        if [ -f "server/.env.example" ]; then
            cp server/.env.example server/.env
            print_success "Created server/.env from .env.example"
        fi
    fi
    
    if [ ! -f "client/.env" ]; then
        if [ -f "client/.env.example" ]; then
            cp client/.env.example client/.env
            print_success "Created client/.env from .env.example"
        fi
    fi
    
    # Initialize database
    print_info "Initializing database and creating admin user..."
    cd server
    node init-db.js
    cd ..
    print_success "Database initialized"
    print_success "Admin user created (username: admin, password: admin123)"
}

# Start servers
start_servers() {
    print_header "Starting Servers"
    
    read -p "Start TaskPulse servers now? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping server startup"
        return
    fi
    
    # Check if ports are in use
    if lsof -Pi :$SERVER_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $SERVER_PORT is already in use"
        read -p "Kill existing process and continue? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            lsof -ti:$SERVER_PORT | xargs kill -9 2>/dev/null || true
        else
            print_error "Cannot start server - port in use"
            exit 1
        fi
    fi
    
    if lsof -Pi :$CLIENT_PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        print_warning "Port $CLIENT_PORT is already in use"
        read -p "Kill existing process and continue? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            lsof -ti:$CLIENT_PORT | xargs kill -9 2>/dev/null || true
        else
            print_error "Cannot start client - port in use"
            exit 1
        fi
    fi
    
    # Start server
    print_info "Starting server on port $SERVER_PORT..."
    cd server
    npm start > /dev/null 2>&1 &
    SERVER_PID=$!
    cd ..
    
    # Wait for server to start
    sleep 3
    
    # Check if server is running
    if curl -s http://localhost:$SERVER_PORT/health > /dev/null; then
        print_success "Server started successfully"
    else
        print_error "Server failed to start"
        exit 1
    fi
    
    # Start client
    print_info "Starting client on port $CLIENT_PORT..."
    cd client
    npm run dev > /dev/null 2>&1 &
    CLIENT_PID=$!
    cd ..
    
    # Wait for client to start
    sleep 3
    
    print_success "Client started successfully"
}

# Setup launchd services
setup_launchd() {
    print_header "Launchd Service Setup"
    
    read -p "Create launchd services for auto-startup? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping launchd setup"
        return
    fi
    
    # Get current directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    # Create launchd plist for server
    print_info "Creating launchd service for TaskPulse server..."
    cat > ~/Library/LaunchAgents/com.taskpulse.server.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.taskpulse.server</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/node</string>
        <string>$SCRIPT_DIR/server/server.js</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$SCRIPT_DIR/server</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$SCRIPT_DIR/server/server.log</string>
    <key>StandardErrorPath</key>
    <string>$SCRIPT_DIR/server/server.error.log</string>
</dict>
</plist>
EOF
    
    # Create launchd plist for client
    print_info "Creating launchd service for TaskPulse client..."
    cat > ~/Library/LaunchAgents/com.taskpulse.client.plist <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>com.taskpulse.client</string>
    <key>ProgramArguments</key>
    <array>
        <string>/usr/local/bin/npm</string>
        <string>run</string>
        <string>dev</string>
    </array>
    <key>WorkingDirectory</key>
    <string>$SCRIPT_DIR/client</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <true/>
    <key>StandardOutPath</key>
    <string>$SCRIPT_DIR/client/client.log</string>
    <key>StandardErrorPath</key>
    <string>$SCRIPT_DIR/client/client.error.log</string>
</dict>
</plist>
EOF
    
    # Load launchd services
    launchctl load ~/Library/LaunchAgents/com.taskpulse.server.plist
    launchctl load ~/Library/LaunchAgents/com.taskpulse.client.plist
    
    print_success "Launchd services created and loaded"
    print_info "Unload services with: launchctl unload ~/Library/LaunchAgents/com.taskpulse.server.plist"
    print_info "Unload services with: launchctl unload ~/Library/LaunchAgents/com.taskpulse.client.plist"
    print_info "Check status with: launchctl list | grep taskpulse"
}

# Display summary
display_summary() {
    print_header "Installation Complete!"
    
    echo ""
    print_success "TaskPulse has been installed successfully"
    echo ""
    echo -e "${BLUE}Access URLs:${NC}"
    echo "  Web UI:       http://localhost:$CLIENT_PORT"
    echo "  API:          http://localhost:$SERVER_PORT/api"
    echo "  Health Check: http://localhost:$SERVER_PORT/health"
    echo ""
    echo -e "${BLUE}Default Credentials:${NC}"
    echo "  Username: admin"
    echo "  Password: admin123"
    echo "  ⚠️  Please change these after first login!"
    echo ""
    echo -e "${BLUE}Manual Commands:${NC}"
    echo "  Start server:  cd server && npm start"
    echo "  Start client:  cd client && npm run dev"
    echo "  Or use:       ./taskpulse-runner.sh"
    echo ""
    echo -e "${BLUE}Documentation:${NC}"
    echo "  README.md      - Complete documentation"
    echo "  QUICKSTART.md  - Quick start guide"
    echo "  USER_GUIDE.md  - User documentation"
    echo ""
}

# Main installation flow
main() {
    clear
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════╗"
    echo "║                                                  ║"
    echo "║            TaskPulse Installation Script           ║"
    echo "║              for macOS                           ║"
    echo "║                                                  ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    check_macos
    check_homebrew
    check_node
    configure_firewall
    install_dependencies
    init_database
    start_servers
    setup_launchd
    display_summary
}

# Run main function
main