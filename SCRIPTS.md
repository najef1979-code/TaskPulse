# TaskPulse Management Scripts

**Last Updated:** 2026-02-12
**Version:** 1.1.0 (Single Port Production Mode)

> **Note:** Detailed administration and deployment information has been consolidated into the [Administration Guide](ADMIN_GUIDE.md). This file provides a quick reference for the available management scripts.

---

## Available Scripts

### Main Scripts

- **`taskpulse-runner.sh`** - Start server, health checks, and integration tests
- **`stop-all.sh`** - Stop TaskPulse server
- **`status.sh`** - Check server status
- **`restart-server.sh`** - Restart TaskPulse server (production mode)
- **`backup-db.sh`** - Backup the database
- **`setup-service.sh`** - Install TaskPulse as systemd service
- **`taskpulse-daemon.sh`** - Daemon script for systemd service

### Quick Usage

```bash
# Start server and run tests
./taskpulse-runner.sh

# Start without tests (faster)
./taskpulse-runner.sh --no-test

# Check if server is running
./status.sh

# Stop server
./stop-all.sh

# Restart server (production mode)
./restart-server.sh

# Install as systemd service (requires sudo)
sudo ./setup-service.sh

# Check service status
sudo systemctl status taskpulse
```

---

## Script Details

### taskpulse-runner.sh

**Purpose:** Main startup script for TaskPulse (production mode)

**Usage:**
```bash
./taskpulse-runner.sh              # Start with tests
./taskpulse-runner.sh --no-test    # Start without tests
./taskpulse-runner.sh --test-only  # Run tests only
```

**What it does:**
1. Stops existing server on port 3000
2. Starts server in production mode (serves both frontend and API from port 3000)
3. Performs health checks
4. Runs integration tests (unless `--no-test` is used)

---

### stop-all.sh

**Purpose:** Stop TaskPulse server

**Usage:**
```bash
./stop-all.sh
```

---

### status.sh

**Purpose:** Check the status of TaskPulse server

**Usage:**
```bash
./status.sh
```

**Output:** Shows server status, health, URLs, and process IDs

---

### restart-server.sh

**Purpose:** Restart TaskPulse server in production mode

**Usage:**
```bash
./restart-server.sh
```

**What it does:**
- Stops existing server on port 3000
- Starts server in production mode
- Shows access URLs

---

### setup-service.sh

**Purpose:** Install TaskPulse as systemd service

**Usage:**
```bash
sudo ./setup-service.sh
```

**What it does:**
- Removes existing service (if present)
- Installs TaskPulse as systemd service
- Enables auto-start on boot
- Starts the service immediately

---

### backup-db.sh

**Purpose:** Create a timestamped backup of the database

**Usage:**
```bash
cd server
./backup-db.sh
```

**Output:** Creates backup in `server/backups/taskpulse_YYYYMMDD_HHMMSS.db`

---

## Workflow Examples

### First Time Setup

```bash
./taskpulse-runner.sh
```

### Daily Development

```bash
./taskpulse-runner.sh --no-test
# ... work on code ...
./status.sh  # Check if still running
./stop-all.sh  # When done
```

### After Code Changes

```bash
# If servers are running, just test
./taskpulse-runner.sh --test-only

# Or restart and test everything
./taskpulse-runner.sh
```

### Backup Before Migration

```bash
cd server
./backup-db.sh
# ... run migration scripts ...
```

---

## For More Information

See the [Administration Guide](ADMIN_GUIDE.md) for:
- Complete system prerequisites
- Detailed installation instructions
- Configuration options
- Production deployment
- Database management
- Monitoring and logging
- Troubleshooting guides
- Backup and maintenance procedures

---

## Log Files

The scripts use the following log files:
- `server.log` - Server output (production mode - serves both frontend and API)
- `startup.log` - Combined startup and test logs

---

## Port Configuration (v1.1.0+)

**Production Mode (default):**
- **Single Port:** http://localhost:3000 (serves both frontend and API)
- **Access URLs:**
  - Local: http://localhost:3000
  - Network: http://192.168.2.128:3000
  - Domain: https://taskpulse.ceraimic.eu

**Development Mode:**
- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:3050

To switch modes, set `NODE_ENV=production` in `server/.env`

---

**TaskPulse Version:** 1.1.0
**Last Updated:** 2026-02-12
