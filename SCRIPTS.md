# TaskPulse Management Scripts

**TaskPulse Version:** v1.9.0  
**Last Updated:** 2026-02-17

> **Note:** Detailed administration and deployment information has been consolidated into the [Administration Guide](ADMIN_GUIDE.md). This file provides a quick reference for the available management scripts.

---

## Available Scripts

### Main Scripts

- **`taskpulse-runner.sh`** - Start servers, health checks, and integration tests
- **`stop-all.sh`** - Stop both backend and frontend servers
- **`status.sh`** - Check server status
- **`restart-server.sh`** - Restart backend server
- **`backup-db.sh`** - Backup the database

### Quick Usage

```bash
# Start everything and run tests
./taskpulse-runner.sh

# Start without tests (faster)
./taskpulse-runner.sh --no-test

# Check if servers are running
./status.sh

# Stop all servers
./stop-all.sh

# Restart backend only
./restart-server.sh
```

---

## Script Details

### taskpulse-runner.sh

**Purpose:** Main startup script for TaskPulse

**Usage:**
```bash
./taskpulse-runner.sh              # Start with tests
./taskpulse-runner.sh --no-test    # Start without tests
./taskpulse-runner.sh --test-only  # Run tests only
```

**What it does:**
1. Stops existing servers on ports 3000 and 3050
2. Starts backend server on port 3000
3. Starts frontend server on port 3050
4. Performs health checks
5. Runs integration tests (unless `--no-test` is used)

---

### stop-all.sh

**Purpose:** Stop all TaskPulse servers

**Usage:**
```bash
./stop-all.sh
```

---

### status.sh

**Purpose:** Check the status of TaskPulse servers

**Usage:**
```bash
./status.sh
```

**Output:** Shows server status, health, URLs, and process IDs

---

### restart-server.sh

**Purpose:** Restart the backend server with proper cleanup

**Usage:**
```bash
./restart-server.sh
```

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
- `server.log` - Backend server output
- `client.log` - Frontend server output
- `startup.log` - Combined startup and test logs

---

## Port Configuration

Default ports (can be changed in configuration):
- **Backend API:** http://localhost:3000
- **Frontend:** http://localhost:3050

