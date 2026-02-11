# TaskPulse Administration Guide

**Last Updated:** 2026-02-11

This guide provides complete setup, deployment, and management instructions for TaskPulse administrators and developers.

---

## Table of Contents

- [System Prerequisites](#system-prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running TaskPulse](#running-taskpulse)
- [Team System](#team-system)
- [User and Bot Management](#user-and-bot-management)
- [Management Scripts](#management-scripts)
- [Database Management](#database-management)
- [Testing](#testing)
- [Deployment](#deployment)
- [Monitoring](#monitoring)
- [Backup and Maintenance](#backup-and-maintenance)
- [Troubleshooting](#troubleshooting)

---

## System Prerequisites

### Required Software

- **Node.js** v16.0 or higher (v18+ recommended)
- **npm** v8.0 or higher
- **curl** (for API testing)
- **jq** (optional, for JSON parsing)

### Optional Software

- **PM2** (for production process management)
- **Docker** (for containerized deployment)
- **Nginx** (for reverse proxy and SSL)
- **PostgreSQL/MySQL** (alternatives to SQLite)

### Checking Prerequisites

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check curl
curl --version

# Check jq (optional)
jq --version
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/najef1979-code/TaskPulse.git
cd TaskPulse
```

### 2. Backend Setup

```bash
cd server

# Install dependencies
npm install

# Initialize database
node init-db.js

# Configure environment
cp .env.example .env
# Edit .env with your settings (default values work for development)
```

### 3. Frontend Setup

```bash
cd ../client

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your settings (default values work for development)
```

---

## Configuration

### Environment Variables

#### Backend (`server/.env`)

```env
# Database
DB_PATH=./taskpulse.db

# Server
PORT=3000
NODE_ENV=development

# Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

#### Frontend (`client/.env`)

```env
# API URL
VITE_API_URL=http://localhost:3000/api

# Application
VITE_APP_NAME=TaskPulse
NODE_ENV=development
```

#### User Registration Control

By default, TaskPulse allows users to register new accounts through the web interface. Administrators can disable public registration and manage user accounts directly.

**Environment Variable (`client/.env`):**

```env
# Allow new user registration
# Set to 'true' to enable registration link on login page
# Set to 'false' to hide registration (admin creates accounts)
VITE_ALLOW_REGISTRATION=true
```

**When Registration is Disabled (`VITE_ALLOW_REGISTRATION=false`):**
- "Create one" link is hidden from the login page
- New users cannot self-register
- Only administrators can create new user accounts (using the user CLI)
- Useful for:
  - Private/team-only deployments
  - Controlled onboarding processes
  - Security-sensitive environments

**When Registration is Enabled (`VITE_ALLOW_REGISTRATION=true`):**
- "Create one" link is shown on the login page
- Users can register their own accounts
- Users must provide or create a team during registration
- Default setting for most deployments

**Creating Users When Registration is Disabled:**

Use the user CLI to create accounts:

```bash
cd server
node user-cli.js
```

Select option 1 (Register new human user) and provide:
- Username (required)
- Email (required)
- Password (required)
- Full Name (optional)
- Team Name (required for users to work with projects/tasks)

**Note:** This setting is client-side only. The API still accepts registration requests, but the UI hides the option. For complete security, implement server-side validation if needed.

### Port Configuration

- **Backend API:** Default 3000 (change in `server/.env`)
- **Frontend:** Default 3050 (change in `client/vite.config.js`)

### Database

TaskPulse uses SQLite by default for simplicity. The database file is created automatically at `server/taskpulse.db`.

**To use PostgreSQL or MySQL:**
1. Install the appropriate driver (`pg` or `mysql2`)
2. Modify `server/lib/database.js` to use your preferred database
3. Update connection string in `.env`

---

## Running TaskPulse

### Method 1: Using Runner Script (Recommended)

```bash
./taskpulse-runner.sh
```

This script:
- Stops any existing servers
- Starts backend on port 3000
- Starts frontend on port 3050
- Performs health checks
- Runs integration tests

### Method 2: Manual Startup

**Backend:**
```bash
cd server
npm start
```

**Frontend:**
```bash
cd client
npm run dev
```

### Method 3: Using PM2 (Production)

```bash
# Start backend
cd server
pm2 start server.js --name "taskpulse-backend"

# Start frontend
cd client
pm2 start "npm run dev" --name "taskpulse-frontend"
```

---

## Team System

TaskPulse uses a team-based system where all users must belong to a team to create and view projects and tasks.

### What Changed

#### Database Schema
- Added `teams` table for team management
- Added `team_requests` table for join requests
- Added `team_id` and `created_by` columns to `projects` table
- Added `team_id` and `created_by` columns to `tasks` table
- Added `team_id` and `is_team_admin` columns to `users` table

#### API Changes
- All project and task endpoints now require `teamId` from authenticated user
- Users without a team cannot view/create projects or tasks
- Returns 403 error if user is not in a team

### Migration Steps

#### 1. Apply Schema Changes

```bash
cd server
node migrate-to-teams.js
```

This will:
- Create teams table
- Create team_requests table
- Add team_id and created_by columns to projects
- Add team_id and created_by columns to tasks
- Add team_id and is_team_admin columns to users
- Create necessary indexes

#### 2. Create Users and Teams

Use the user CLI:

```bash
cd server
node user-cli.js
```

Select option 1 to register a new human user. You'll be prompted for:
- Username
- Email
- Password
- Full Name (optional)
- Team Name (required for users to work with projects/tasks)

The first user you create should include a team name. This user will be team admin.

#### 3. Migrate Existing Data

If you have existing projects and tasks:

```bash
node migrate-existing-data.js
```

This script will:
1. List available human users
2. Ask you to select a user (must be in a team)
3. Show how many projects/tasks will be migrated
4. Ask for confirmation
5. Migrate all projects and tasks to the selected user's team

### Team System Architecture

#### Teams
- Teams are collections of users working together
- Each team has a creator (the team admin)
- Team admins can approve/reject join requests
- Team admins can remove members from the team

#### Team Members
- Each user belongs to exactly one team
- Users without a team cannot view/create projects or tasks
- Bots inherit their team membership from their owner

#### Projects and Tasks
- All projects belong to a team
- All tasks belong to a team
- Users can only see projects/tasks from their own team
- Projects and tasks have:
  - `team_id`: The team they belong to
  - `owner_id`: The user who owns them
  - `created_by`: The user who created them (for bots, this is the human who triggered the action)

#### Bot Authentication
- Bots inherit their team from their owner
- Bot API tokens include team_id in the authenticated user object
- Bots can only create/view projects/tasks in their owner's team

### Common Team Use Cases

#### Creating a New User with Team

```bash
node user-cli.js
# Select 1 (Register new human user)
# Enter: username: alice
# Enter: email: alice@example.com
# Enter: password: securepassword
# Enter: Full Name: Alice Smith
# Enter: Team Name: Engineering Team
```

Result: Alice is created and becomes admin of "Engineering Team"

#### Creating a Bot

```bash
node user-cli.js
# Select 2 (Create new bot)
# Enter: Owner Username: alice
# Enter: Bot Name: TaskBot
# Enter: Permissions: read,create_tasks,update_tasks
```

Result: TaskBot is created and added to Alice's team

#### Migrating Existing Data

```bash
node migrate-existing-data.js
# Select user with a team
# Confirm migration
```

Result: All projects and tasks are assigned to the selected user's team

### Team System Troubleshooting

#### Error: "You must be a member of a team to view projects"

This means the user is not in a team. Use the user CLI to:

1. Create a team for the user (if user should be team admin)
2. Add user to existing team (requires team admin)

#### Error: "Team ID is required"

This occurs when trying to create projects/tasks without a team_id. Ensure:

1. User is logged in and has a team_id
2. Authentication is working correctly
3. Session/token is valid

#### No Projects Visible After Migration

After migration, ensure:

1. The user who migrated the data is logged in
2. The user is in the same team the data was migrated to
3. Restart the server to clear any cached data

---

## User and Bot Management

### User CLI

The user CLI (`server/user-cli.js`) provides the following options:

1. **Register new human user** - Create a human user (optionally with a team)
2. **Create new bot** - Create a bot and add it to your team
3. **List all users** - View all human users
4. **List bots** - View all bots (optionally filter by owner)
5. **Reset user password** - Reset a human user's password
6. **Regenerate bot token** - Generate a new API token for a bot
7. **Remove human user** - Remove a human user (transfers their content)
8. **Remove bot** - Remove a bot (transfers or clears their content)

### Creating Users and Bots

#### Register a New User

```bash
cd server
node user-cli.js
```

Select option 1 and provide:
- Username (required)
- Email (required)
- Password (required)
- Full Name (optional)
- Team Name (required for users to work with projects/tasks)

#### Create a Bot

```bash
cd server
node user-cli.js
```

Select option 2 and provide:
- Owner Username (required)
- Bot Name (required)
- Permissions (comma-separated, optional)

Bot Permissions:
- `read` - Read projects and tasks
- `create_projects` - Create projects
- `create_tasks` - Create tasks
- `update_tasks` - Update tasks
- `delete_tasks` - Delete tasks

#### Reset User Password

```bash
cd server
node user-cli.js
```

Select option 5 and provide:
- Username (required)
- New Password (required)

#### Regenerate Bot Token

```bash
cd server
node user-cli.js
```

Select option 6 and provide:
- Bot ID (required)

The bot token will be regenerated and displayed. Make sure to save it securely.

---

## Management Scripts

### `taskpulse-runner.sh` - Main Runner Script

Starts both servers, performs health checks, and runs integration tests.

#### Usage

```bash
# Start servers and run all tests
./taskpulse-runner.sh

# Start servers only (skip tests)
./taskpulse-runner.sh --no-test

# Run tests only (servers must already be running)
./taskpulse-runner.sh --test-only
```

#### What It Does

1. **Stops existing servers** - Kills any processes on ports 3000 and 3050
2. **Starts backend server** - Launches Express API on port 3000
3. **Starts frontend server** - Launches Vite dev server on port 3050
4. **Health checks** - Waits up to 30 seconds for each server to become responsive
5. **Integration tests** (unless `--no-test` is used):
   - Creates a demo project
   - Creates a demo task
   - Changes task status: pending → in-progress → done → pending
   - Deletes the task
   - Deletes the project
6. **Reports status** - Shows URLs and process IDs

### `stop-all.sh` - Stop All Servers

Stops both backend and frontend servers.

#### Usage

```bash
./stop-all.sh
```

### `status.sh` - Check Server Status

Shows the current status of both servers.

#### Usage

```bash
./status.sh
```

#### Output

```
======================================
TaskPulse Server Status
======================================

Backend (port 3000): RUNNING
  Health: OK
  URL: http://localhost:3000
  API: http://localhost:3000/api

Frontend (port 3050): RUNNING
  Health: OK
  URL: http://localhost:3050

Process Status:
  Backend PID: 12345
  Frontend PID: 12346
```

### `restart-server.sh` - Restart Backend

Restarts only the backend server with proper cleanup.

#### Usage

```bash
./restart-server.sh
```

---

## Database Management

### Database Files

- **Primary DB:** `server/taskpulse.db`
- **Backups:** `server/backups/taskpulse_YYYYMMDD_HHMMSS.db`

### Backup Database

```bash
cd server
./backup-db.sh
```

This creates a timestamped backup in `server/backups/`.

### Restore Database

```bash
cd server
cp backups/taskpulse_YYYYMMDD_HHMMSS.db taskpulse.db
```

### Manual Database Queries

```bash
cd server
sqlite3 taskpulse.db
```

Common queries:
```sql
-- List all users
SELECT id, username, full_name, team_id FROM users;

-- List all projects
SELECT id, name, status, team_id FROM projects;

-- List all tasks
SELECT id, title, status, priority, project_id, team_id FROM tasks;

-- List all teams
SELECT id, name, created_by FROM teams;
```

---

## Testing

### Health Check

```bash
curl http://localhost:3000/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-11T..."}
```

### API Documentation

```bash
curl http://localhost:3000/api
```

### Run Integration Tests

```bash
./taskpulse-runner.sh
```

### Manual API Testing

```bash
# Health check
curl http://localhost:3000/health

# List projects (with bot token)
curl http://localhost:3000/api/projects \
  -H "x-api-token: bot_YOUR_TOKEN"

# Create task
curl -X POST http://localhost:3000/api/tasks \
  -H "x-api-token: bot_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId":1,"title":"Test Task"}'
```

---

## Deployment

### Production Deployment

#### 1. Set Environment Variables

**server/.env:**
```env
NODE_ENV=production
PORT=3000
JWT_SECRET=<secure-random-string>
DB_PATH=/var/lib/taskpulse/taskpulse.db
```

**client/.env:**
```env
VITE_API_URL=https://yourdomain.com/api
VITE_APP_NAME=TaskPulse
NODE_ENV=production
```

#### 2. Build Frontend

```bash
cd client
npm run build
# Output in client/dist/
```

#### 3. Deploy with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd server
pm2 start server.js --name "taskpulse-backend" --env production

# Serve frontend (using simple HTTP server)
cd client
npm install -g serve
pm2 start "serve -s dist -l 3050" --name "taskpulse-frontend"
```

#### 4. Set Up Reverse Proxy (Nginx)

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # API backend
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Frontend
    location / {
        proxy_pass http://localhost:3050;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 5. Set Up SSL/TLS

Use Let's Encrypt with certbot:

```bash
sudo certbot --nginx -d yourdomain.com
```

### Docker Deployment

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
    volumes:
      - taskpulse-data:/app/data

  frontend:
    build: ./client
    ports:
      - "3050:80"
    depends_on:
      - backend

volumes:
  taskpulse-data:
```

Run with:
```bash
docker-compose up -d
```

---

## Monitoring

### Built-in Monitoring

TaskPulse includes built-in monitoring features:

- **Request logging** - All API requests are logged with user context
- **Error tracking** - Errors are logged with stack traces
- **Health checks** - `/health` endpoint provides status
- **Performance metrics** - Track response times (see `client/src/utils/performance.js`)

### Log Files

- `server.log` - Backend server output
- `client.log` - Frontend server output
- `startup.log` - Combined startup and test logs

### View Logs

```bash
# Follow backend logs
tail -f server.log

# Follow frontend logs
tail -f client.log

# Follow startup logs
tail -f startup.log
```

### External Monitoring Tools

Consider integrating with:
- **Sentry** - Error tracking and monitoring
- **New Relic** - Application performance monitoring
- **Prometheus + Grafana** - Metrics and visualization
- **Loggly / Papertrail** - Log aggregation

---

## Backup and Maintenance

### Automated Backups

Set up a cron job for daily backups:

```bash
# Edit crontab
crontab -e

# Add daily backup at 2 AM
0 2 * * * cd /path/to/TaskPulse/server && ./backup-db.sh
```

### Database Maintenance

#### Clean Orphaned Data

```bash
cd server
node cleanup-orphaned-data.js
```

This script:
- Finds subtasks without parent tasks
- Finds tasks without parent projects
- Prompts for cleanup

#### Session Cleanup

The server automatically cleans expired sessions every hour (via cron job).

### Log Rotation

Set up log rotation to prevent logs from growing too large:

```bash
# Create logrotate config
sudo nano /etc/logrotate.d/taskpulse
```

Content:
```
/path/to/TaskPulse/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
}
```

---

## Troubleshooting

### Server Issues

#### Port Already in Use

```bash
# Check what's using the ports
lsof -ti:3000
lsof -ti:3050

# Kill the processes
kill -9 <PID>

# Or use the stop script
./stop-all.sh
```

#### Server Not Starting

1. Check logs:
   ```bash
   tail -50 server.log
   tail -50 client.log
   ```

2. Check dependencies:
   ```bash
   cd server && npm install
   cd ../client && npm install
   ```

3. Verify Node.js is installed:
   ```bash
   node --version
   npm --version
   ```

4. Check for syntax errors:
   ```bash
   cd server && node server.js
   cd ../client && npm run dev
   ```

### Database Issues

#### Database Lock

```bash
# Stop server
./stop-all.sh

# Check for lock files
ls -la server/*.db-*

# Remove lock files
rm server/*.db-*

# Restart server
./taskpulse-runner.sh --no-test
```

#### Database Corruption

```bash
# Restore from backup
cd server
cp backups/taskpulse_YYYYMMDD_HHMMSS.db taskpulse.db

# Or attempt repair
sqlite3 taskpulse.db ".recover" | sqlite3 taskpulse_recovered.db
```

### API Issues

#### 403 Forbidden Errors

- Ensure user is in a team (see Team System section)
- Check that authentication is working correctly
- Verify team_id is not null in the database

#### 404 Not Found

- Check the API endpoint is correct
- Verify the resource exists in the database
- Check server logs for more details

#### 500 Internal Server Error

- Check server logs for stack traces
- Verify database is accessible
- Check for missing environment variables

### Performance Issues

#### Slow API Responses

1. Check database indexes:
   ```sql
   PRAGMA index_list('tasks');
   PRAGMA index_list('projects');
   ```

2. Consider adding indexes for frequently queried columns

3. Check server resources:
   ```bash
   top
   htop
   ```

#### Frontend Slowness

1. Clear browser cache
2. Check browser console for errors
3. Verify API is responding quickly
4. Consider enabling code splitting

---

## Support

For additional help:

1. Check the logs in `server.log` and `client.log`
2. Review this documentation
3. Check the [API Documentation](AI_MANUAL.md)
4. Check the [User Guide](USER_GUIDE.md)
5. Create an issue on [GitHub](https://github.com/najef1979-code/TaskPulse/issues)

---

**TaskPulse Version:** 2.0.0  
**Admin Guide Version:** 2.0.0  
**Last Updated:** 2026-02-11