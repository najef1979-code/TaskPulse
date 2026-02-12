# TaskPulse Systemd Service Setup

This guide explains how to set up TaskPulse as a systemd service that automatically starts on boot.

## What's Included

- **taskpulse-daemon.sh** - A long-running daemon that manages both backend and frontend servers
- **taskpulse.service** - Systemd service configuration file
- **setup-service.sh** - Installation script
- **cleanup-service.sh** - Cleanup script
- **diagnose-service.sh** - Diagnostic script

## Important: Node.js (NVM) Considerations

If you use NVM (Node Version Manager) to manage Node.js, systemd cannot access it by default because it doesn't load your shell configuration files (`.bashrc`, `.profile`, etc.).

The `taskpulse.service` file runs a bash daemon script which uses absolute paths to npm. If you change your Node.js version with NVM, you'll need to update the daemon script:

1. Find your Node.js path: `which node`
2. Update `NVM_NODE` variable in `taskpulse-daemon.sh` with the new path
3. Reinstall: `sudo ./setup-service.sh`

## Installation

Run the installation script with sudo:

```bash
sudo ./setup-service.sh
```

This will:
1. Automatically remove any existing TaskPulse service
2. Copy the service file to `/etc/systemd/system/`
3. Set proper permissions
4. Reload systemd daemon
5. Enable the service to start on boot
6. Start the service immediately

## Service Management

### Check Service Status
```bash
sudo systemctl status taskpulse
```

### Start Service
```bash
sudo systemctl start taskpulse
```

### Stop Service
```bash
sudo systemctl stop taskpulse
```

### Restart Service
```bash
sudo systemctl restart taskpulse
```

### Enable Auto-Start on Boot
```bash
sudo systemctl enable taskpulse
```

### Disable Auto-Start on Boot
```bash
sudo systemctl disable taskpulse
```

## Viewing Logs

### Service Logs (systemd journal)
```bash
journalctl -u taskpulse -f
```

### Daemon Logs
```bash
tail -f daemon.log
```

### Backend Server Logs
```bash
tail -f server.log
```

### Frontend Server Logs
```bash
tail -f client.log
```

## Service Behavior

### Automatic Restart
The service is configured with `Restart=on-failure`, which means:
- If the daemon crashes, systemd will restart it automatically
- If either backend or frontend server crashes, the daemon detects it and shuts down gracefully
- Systemd then restarts the entire service

### Graceful Shutdown
When stopping the service:
- The daemon receives a SIGTERM signal
- It gracefully stops the frontend server first
- Then gracefully stops the backend server
- Logs the shutdown process

### Health Checks
On startup, the daemon:
1. Cleans up any existing processes on ports 3000 and 3050
2. Starts the backend server on port 3000
3. Starts the frontend server on port 3050
4. Performs health checks (up to 30 seconds per server)
5. If health checks fail, it shuts down and reports the error

## Ports Used

**Production Mode (v1.1.0+):**
- **Server (Frontend + API)**: http://localhost:3000

**Development Mode:**
- **Backend**: http://localhost:3000
- **Frontend**: http://localhost:3050

## Troubleshooting

### Service Won't Start
Check the service status and logs:
```bash
sudo systemctl status taskpulse -l
journalctl -u taskpulse -n 50
cat daemon.log
```

### Backend Health Check Fails
If the backend health check fails, it's usually because:
1. **Node.js not found**: Check if the daemon script has the correct Node.js path
   - The daemon uses absolute paths to npm: `/home/najef/.nvm/versions/node/v24.11.0/bin/npm`
   - Update `NVM_NODE` variable in `taskpulse-daemon.sh` if you change Node.js version
   - Check the daemon log: `cat daemon.log`

2. **Database issues**: Check the backend log
   ```bash
   cat server.log
   ```

3. **Port conflicts**: Check if ports are in use
   ```bash
   lsof -i :3000
   lsof -i :3050
   ```

### Ports Already in Use
The daemon automatically kills processes on ports 3000 and 3050, but if you need to manually check:
```bash
lsof -i :3000
lsof -i :3050
```

### Service Status Shows "Failed"
Check the daemon log for details:
```bash
cat daemon.log
```

### Need to Stop All TaskPulse Processes Manually
```bash
pkill -f "node.*server"
pkill -f "vite"
```

### Run Diagnostics
Use the diagnostic script to check all aspects of the service:
```bash
./diagnose-service.sh
```

## Files

| File | Purpose |
|------|---------|
| `taskpulse-daemon.sh` | Main daemon script that manages servers |
| `taskpulse.service` | Systemd service configuration |
| `setup-service.sh` | Installation script |
| `cleanup-service.sh` | Cleanup script |
| `diagnose-service.sh` | Diagnostic script |
| `daemon.log` | Daemon operation logs |
| `server.log` | Backend server output |
| `client.log` | Frontend server output |

## Cleanup

### Automatic Cleanup
The `setup-service.sh` script automatically removes any existing TaskPulse service before installing the new one. You can simply run:

```bash
sudo ./setup-service.sh
```

### Manual Cleanup
If you want to remove the TaskPulse service completely, use the cleanup script:

```bash
sudo ./cleanup-service.sh
```

This will:
- Stop the service if running
- Disable auto-start on boot
- Remove the service file
- Reload systemd daemon

### Manual Uninstall
If you prefer to uninstall manually:

```bash
sudo systemctl stop taskpulse
sudo systemctl disable taskpulse
sudo rm /etc/systemd/system/taskpulse.service
sudo systemctl daemon-reload
```

## Updating Node.js Version

If you use NVM and switch Node.js versions:

1. Find the new Node.js path:
   ```bash
   which node
   ```

2. Edit `taskpulse.service` and update these lines:
   ```
   Environment="PATH=/home/najef/.nvm/versions/node/NEW_VERSION/bin:/usr/local/bin:/usr/bin:/bin"
   ExecStart=/home/najef/.nvm/versions/node/NEW_VERSION/bin/node /home/najef/Projects/TaskPulse/taskpulse-daemon.sh
   ```

3. Reinstall the service:
   ```bash
   sudo ./setup-service.sh