#!/bin/bash

#############################################
# TaskPulse Linux Installation Script
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

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_warning "Running as root is not recommended for installation"
        read -p "Continue anyway? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Detect Linux distribution
detect_distro() {
    print_header "Detecting Linux Distribution"
    
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        DISTRO=$ID
        VERSION=$VERSION_ID
        print_success "Detected: $PRETTY_NAME"
    else
        print_error "Cannot detect Linux distribution"
        exit 1
    fi
    
    case $DISTRO in
        ubuntu|debian)
            PKG_MANAGER="apt"
            ;;
        fedora)
            PKG_MANAGER="dnf"
            ;;
        centos|rhel)
            PKG_MANAGER="yum"
            ;;
        arch|manjaro)
            PKG_MANAGER="pacman"
            ;;
        *)
            print_error "Unsupported distribution: $DISTRO"
            exit 1
            ;;
    esac
    
    print_success "Package manager: $PKG_MANAGER"
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
    print_info "Installing Node.js latest LTS..."
    
    case $DISTRO in
        ubuntu|debian)
            curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
            sudo $PKG_MANAGER install -y nodejs
            ;;
        fedora|centos|rhel)
            curl -fsSL https://rpm.nodesource.com/setup_lts.x | sudo bash -
            sudo $PKG_MANAGER install -y nodejs
            ;;
        arch|manjaro)
            sudo $PKG_MANAGER -S --noconfirm nodejs npm
            ;;
    esac
    
    print_success "Node.js installed: $(node -v)"
    print_success "npm installed: $(npm -v)"
}

# Check and configure firewall
configure_firewall() {
    print_header "Configuring Firewall"
    
    print_info "TaskPulse requires ports $SERVER_PORT (server) and $CLIENT_PORT (client)"
    
    # Detect firewall
    if command -v ufw &> /dev/null; then
        FIREWALL="ufw"
    elif command -v firewall-cmd &> /dev/null; then
        FIREWALL="firewalld"
    elif command -v iptables &> /dev/null; then
        FIREWALL="iptables"
    else
        print_warning "No supported firewall detected"
        read -p "Skip firewall configuration? (y/n): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
        return
    fi
    
    print_success "Detected firewall: $FIREWALL"
    
    read -p "Open ports $SERVER_PORT and $CLIENT_PORT in firewall? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "Skipping firewall configuration"
        return
    fi
    
    case $FIREWALL in
        ufw)
            sudo ufw allow $SERVER_PORT/tcp
            sudo ufw allow $CLIENT_PORT/tcp
            print_success "Ports opened in ufw"
            ;;
        firewalld)
            sudo firewall-cmd --permanent --add-port=$SERVER_PORT/tcp
            sudo firewall-cmd --permanent --add-port=$CLIENT_PORT/tcp
            sudo firewall-cmd --reload
            print_success "Ports opened in firewalld"
            ;;
        iptables)
            sudo iptables -A INPUT -p tcp --dport $SERVER_PORT -j ACCEPT
            sudo iptables -A INPUT -p tcp --dport $CLIENT_PORT -j ACCEPT
            print_warning "iptables rules added (may not persist after reboot)"
            print_info "Consider using iptables-persistent or ufw"
            ;;
    esac
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

# Setup systemd services
setup_systemd() {
    print_header "Systemd Service Setup"
    
    read -p "Create systemd services for auto-startup? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_info "Skipping systemd setup"
        return
    fi
    
    # Get current directory
    SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
    
    # Create systemd service for server
    print_info "Creating systemd service for TaskPulse server..."
    sudo tee /etc/systemd/system/taskpulse-server.service > /dev/null <<EOF
[Unit]
Description=TaskPulse Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR/server
ExecStart=/usr/bin/node $SCRIPT_DIR/server/server.js
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    
    # Create systemd service for client
    print_info "Creating systemd service for TaskPulse client..."
    sudo tee /etc/systemd/system/taskpulse-client.service > /dev/null <<EOF
[Unit]
Description=TaskPulse Client
After=network.target taskpulse-server.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$SCRIPT_DIR/client
ExecStart=/usr/bin/npm run dev
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF
    
    # Reload systemd
    sudo systemctl daemon-reload
    
    print_success "Systemd services created"
    print_info "Enable services with: sudo systemctl enable taskpulse-server taskpulse-client"
    print_info "Start services with: sudo systemctl start taskpulse-server taskpulse-client"
    print_info "Check status with: sudo systemctl status taskpulse-server taskpulse-client"
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
    echo "║              for Linux                           ║"
    echo "║                                                  ║"
    echo "╚══════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    check_root
    detect_distro
    check_node
    configure_firewall
    install_dependencies
    init_database
    start_servers
    setup_systemd
    display_summary
}

# Run main function
main