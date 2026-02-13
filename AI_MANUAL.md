# TaskPulse API Manual for AI Assistants

**Last Updated:** 2026-02-11

This manual provides complete API reference for AI assistants and bot developers to interact with TaskPulse.

## Table of Contents

- [Getting Started](#getting-started)
- [CLI Usage](#cli-usage)
- [REST API](#rest-api)
- [Authentication](#authentication)
- [Projects API](#projects-api)
- [Tasks API](#tasks-api)
- [Subtasks API](#subtasks-api)
- [Bots API](#bots-api)
- [Activity API](#activity-api)
- [Error Handling](#error-handling)
- [Testing Examples](#testing-examples)

---

## Getting Started

TaskPulse provides two ways for AI assistants to interact:

1. **CLI (Command-Line Interface)** - Direct script execution with JSON output
2. **REST API** - Full HTTP API for remote or complex operations

Choose the approach that best fits your use case:
- Use **CLI** for local, simple operations
- Use **REST API** for remote access, web applications, or advanced features

### Base URLs
- **API:** `http://localhost:3000`
- **Web UI:** `http://localhost:3050`
- **Health Check:** `http://localhost:3000/health`

### API Documentation
Full API reference available at: `http://localhost:3000/api`

### Authentication
TaskPulse uses hybrid authentication:
- **Session-based:** For human users (cookie-based)
- **Token-based:** For bots (API token in headers)

### 🔒 Security for Online Deployments

When TaskPulse is hosted online (production environment), administrators can configure IP-based access control:

**For Bots:**
- API access can be restricted to whitelisted IP addresses only
- Only known, trusted bots can connect to the API
- Bot IP addresses must be pre-approved in the server configuration

**For Humans:**
- Web UI access remains available from any location
- Team members can work from anywhere in the world
- Authentication is handled via secure sessions

**Benefits:**
- **Secure Integration** - Prevents unauthorized bot access to your API
- **Flexibility** - Human users aren't restricted by IP whitelists
- **Fine-Grained Control** - Different security policies for bots vs humans
- **Compliance** - Meets security requirements for automated systems

To configure IP whitelisting for bots, administrators should:
1. Obtain the static IP address of each bot/service
2. Configure the reverse proxy (e.g., Nginx) or firewall rules
3. Allow API endpoints only from whitelisted IPs for bot tokens
4. Ensure web UI remains accessible to authenticated users from anywhere

See [ADMIN_GUIDE.md](ADMIN_GUIDE.md) for detailed deployment and security configuration.

---

## CLI Usage

The CLI (`server/cli.js`) provides direct script execution with JSON output for easy parsing.

### Common AI Workflows

#### 1. Check What Needs Attention
```bash
cd server
./cli.js status

# Find high-priority tasks
./cli.js tasks --priority high

# Find pending tasks
./cli.js tasks --status pending
```

#### 2. Help User Plan Work
```bash
# List all projects
./cli.js projects

# See tasks for specific project
./cli.js tasks --project 1

# Get full details of a task including subtasks
./cli.js task full 5
```

#### 3. Create Tasks Based on Conversation
```bash
# Add a new task
./cli.js task add 1 "Implement user authentication" --priority high

# Add subtasks to break down work
./cli.js subtask add 5 "Which auth method?" --options "JWT,OAuth,Sessions"
```

#### 4. Update Progress
```bash
# Start working on a task
./cli.js task start 5

# Complete a task
./cli.js task complete 5

# Answer a decision
./cli.js subtask answer 3 "JWT"
```

#### 5. Search and Filter
```bash
# All in-progress tasks
./cli.js tasks --status in-progress

# Tasks for specific project that are pending
./cli.js tasks --project 1 --status pending

# High priority tasks across all projects
./cli.js tasks --priority high
```

### CLI Response Parsing

All CLI responses are JSON. Parse them to extract data:

#### Success responses:
```json
{
  "success": true,
  "message": "Task created",
  "task": { ... }
}
```

#### Data responses:
```json
[
  { "id": 1, "title": "Task 1", ... },
  { "id": 2, "title": "Task 2", ... }
]
```

#### Error responses:
```json
{
  "error": "Task ID is required"
}
```

### CLI Best Practices

1. **Always check status first** - Get context before making changes
2. **Use full commands** - Get complete task details with `task full <id>`
3. **Parse JSON carefully** - Extract IDs and data from responses
4. **Provide context** - When suggesting tasks, explain reasoning
5. **Confirm destructive actions** - Before deleting, verify with user

### CLI Example Conversation Flow

**User:** "What do I need to work on today?"

**AI Actions:**
```bash
cd server
./cli.js status
./cli.js tasks --status pending --priority high
```

**AI Response:** "You have 3 high-priority pending tasks:
1. Implement user auth (Task #5)
2. Design database schema (Task #3)
3. Write API docs (Task #7)

Would you like me to start any of these?"

**User:** "Start the auth task"

**AI Actions:**
```bash
./cli.js task start 5
./cli.js task full 5
```

**AI Response:** "Started Task #5: Implement user authentication.
This task has a subtask asking which auth method to use. The options are JWT, OAuth, or Sessions. Which would you prefer?"

**User:** "JWT"

**AI Actions:**
```bash
./cli.js subtask answer 3 "JWT"
```

**AI Response:** "Great! I've recorded JWT as your choice. The task is now in progress."

### CLI Quick Reference

#### Project Commands
```bash
./cli.js projects                          # List all
./cli.js project add "Name"                # Create
./cli.js project get <id>                  # Get one
./cli.js project full <id>                 # Get with tasks
./cli.js project delete <id>                # Delete
```

#### Task Commands
```bash
./cli.js tasks                              # List all
./cli.js tasks --project <id>               # Filter by project
./cli.js tasks --status pending              # Filter by status
./cli.js tasks --priority high               # Filter by priority
./cli.js task add <project-id> "Title"       # Create
./cli.js task start <id>                    # Start
./cli.js task complete <id>                 # Complete
./cli.js task reopen <id>                    # Reopen
./cli.js task delete <id>                    # Delete
```

#### Subtask Commands
```bash
./cli.js subtasks <task-id>                              # List for task
./cli.js subtask add <task-id> "Question"             # Create
./cli.js subtask answer <id> "Option"                 # Answer
./cli.js subtask delete <id>                          # Delete
```

#### Status Command
```bash
./cli.js status    # Overview of everything
```

### CLI Command Reference

#### Project Commands
- `cli.js projects [--status <status>]` - List projects
- `cli.js project add <name> [--description "text"]` - Create project
- `cli.js project get <id>` - Get project details
- `cli.js project full <id>` - Get project with all tasks
- `cli.js project update <id> [--name "text"]` - Update project
- `cli.js project archive <id>` - Archive project
- `cli.js project delete <id>` - Delete project

#### Task Commands
- `cli.js tasks [--project <id>] [--status <status>] [--priority <priority>]` - List tasks
- `cli.js task add <project-id> <title> [--description "text"] [--priority <priority>]` - Create task
- `cli.js task get <id>` - Get task details
- `cli.js task full <id>` - Get task with subtasks
- `cli.js task update <id> [--title "text"]` - Update task
- `cli.js task start <id>` - Start task
- `cli.js task complete <id>` - Complete task
- `cli.js task reopen <id>` - Reopen task
- `cli.js task delete <id>` - Delete task

#### Subtask Commands
- `cli.js subtasks <task-id>` - List subtasks for task
- `cli.js subtask add <task-id> <question> [--options "opt1,opt2,opt3"]` - Create subtask
- `cli.js subtask get <id>` - Get subtask details
- `cli.js subtask answer <id> <option>` - Answer subtask
- `cli.js subtask update <id> [--question "text"]` - Update subtask
- `cli.js subtask delete <id>` - Delete subtask

#### Status Command
- `cli.js status` - Overview of all projects and tasks

### CLI Help

Full help available:
```bash
cd server
./cli.js help
```

---

## REST API

### Register (Human Users Only)
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "alice",
  "password": "secure_password_123",
  "fullName": "Alice Johnson"
}
```

**Response (201):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "alice",
    "fullName": "Alice Johnson",
    "userType": "human"
  }
}
```

### Login (Human Users Only)
```http
POST /api/auth/login
Content-Type: application/json

{
  "username": "alice",
  "password": "secure_password_123"
}
```

**Response (200):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "alice",
    "fullName": "Alice Johnson",
    "userType": "human",
    "teamId": 1,
    "lastVisit": "2026-02-11T09:00:00.000Z"
  },
  "lastVisit": "2026-02-11T09:00:00.000Z"
}
```

### Logout
```http
POST /api/auth/logout
Cookie: sessionId=<session_id>
```

### Get Current User
```http
GET /api/auth/me
Cookie: sessionId=<session_id>
```

**Response (200):**
```json
{
  "user": {
    "id": 1,
    "username": "alice",
    "fullName": "Alice Johnson",
    "userType": "human",
    "teamId": 1
  }
}
```

---

## Bots API

### Create Bot (Human Users Only)
```http
POST /api/bots
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "name": "Task Assistant",
  "description": "Helps manage tasks"
}
```

**Response (201):**
```json
{
  "success": true,
  "bot": {
    "id": 1,
    "name": "Task Assistant",
    "description": "Helps manage tasks",
    "apiToken": "bot_token_xxxxxxxxxxxxxxxx",
    "ownerId": 1,
    "isActive": true
  }
}
```

### List User's Bots
```http
GET /api/bots
Cookie: sessionId=<session_id>
```

### Get Bot Details
```http
GET /api/bots/:id
Cookie: sessionId=<session_id>
```

### Update Bot
```http
PUT /api/bots/:id
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "name": "Updated Bot Name",
  "description": "Updated description"
}
```

### Regenerate Bot Token
```http
POST /api/bots/:id/regenerate-token
Cookie: sessionId=<session_id>
```

**Response (200):**
```json
{
  "success": true,
  "apiToken": "new_bot_token_yyyyyyyyyyyyyyyy"
}
```

### Deactivate Bot
```http
POST /api/bots/:id/deactivate
Cookie: sessionId=<session_id>
```

### Delete Bot
```http
DELETE /api/bots/:id
Cookie: sessionId=<session_id>
```

---

## Projects API

### List All Projects
```http
GET /api/projects
Cookie: sessionId=<session_id>
```

**Query Parameters:**
- `status` (optional): Filter by status (`active`, `archived`)

### Get Single Project
```http
GET /api/projects/:id
Cookie: sessionId=<session_id>
```

### Get Project with Tasks
```http
GET /api/projects/:id/full
Cookie: sessionId=<session_id>
```

### Create Project
```http
POST /api/projects
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "dueDate": "2026-03-01T00:00:00.000Z"
}
```

**Response (201):**
```json
{
  "id": 1,
  "name": "Website Redesign",
  "description": "Redesign the company website",
  "status": "active",
  "dueDate": "2026-03-01T00:00:00.000Z",
  "ownerId": 1,
  "createdBy": 1,
  "teamId": 1,
  "createdAt": "2026-02-11T09:00:00.000Z"
}
```

### Update Project
```http
PUT /api/projects/:id
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "Updated description"
}
```

### Archive Project
```http
POST /api/projects/:id/archive
Cookie: sessionId=<session_id>
```

### Delete Project
```http
DELETE /api/projects/:id
Cookie: sessionId=<session_id>
```

### Get Overdue Projects
```http
GET /api/projects/overdue
Cookie: sessionId=<session_id>
```

### Get Projects Due Soon
```http
GET /api/projects/due-soon?days=7
Cookie: sessionId=<session_id>
```

---

## Tasks API

### List All Tasks
```http
GET /api/tasks
Cookie: sessionId=<session_id>
```

**Query Parameters:**
- `projectId` (optional): Filter by project
- `status` (optional): Filter by status (`pending`, `in-progress`, `done`)
- `priority` (optional): Filter by priority (`low`, `medium`, `high`)
- `assignedTo` (optional): Filter by assignee (use `me` for current user)
- `dueBefore` (optional): ISO date string
- `dueAfter` (optional): ISO date string
- `startDateBefore` (optional): ISO date string
- `startDateAfter` (optional): ISO date string
- `search` (optional): Search in title and description
- `completedAfter` (optional): ISO date string
- `completedBefore` (optional): ISO date string
- `completedToday` (optional): `true` or `false`

**Examples:**
```bash
# Get all high-priority tasks
GET /api/tasks?priority=high

# Get pending tasks for project 1
GET /api/tasks?projectId=1&status=pending

# Get tasks assigned to current user
GET /api/tasks?assignedTo=me

# Get tasks due in the next week
GET /api/tasks?dueAfter=2026-02-11T00:00:00.000Z&dueBefore=2026-02-18T00:00:00.000Z
```

### Get Single Task
```http
GET /api/tasks/:id
Cookie: sessionId=<session_id>
```

### Get Task with Subtasks
```http
GET /api/tasks/:id/full
Cookie: sessionId=<session_id>
```

**Response (200):**
```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add login and registration functionality",
  "status": "pending",
  "priority": "high",
  "projectId": 1,
  "assignedTo": 1,
  "dueDate": "2026-02-15T00:00:00.000Z",
  "startDate": "2026-02-11T00:00:00.000Z",
  "ownerId": 1,
  "teamId": 1,
  "createdAt": "2026-02-11T09:00:00.000Z",
  "completedAt": null,
  "subtasks": [
    {
      "id": 1,
      "question": "Which auth method?",
      "options": ["JWT", "OAuth", "Sessions"],
      "answered": false,
      "selectedOption": null
    }
  ]
}
```

### Create Task
```http
POST /api/tasks
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "projectId": 1,
  "title": "Implement user authentication",
  "description": "Add login and registration functionality",
  "priority": "high",
  "assignedTo": 1,
  "dueDate": "2026-02-15T00:00:00.000Z",
  "startDate": "2026-02-11T00:00:00.000Z",
  "provided_file": "no_file",
  "file_reference": null
}
```

**Response (201):**
```json
{
  "id": 1,
  "title": "Implement user authentication",
  "description": "Add login and registration functionality",
  "status": "pending",
  "priority": "high",
  "projectId": 1,
  "assignedTo": 1,
  "dueDate": "2026-02-15T00:00:00.000Z",
  "startDate": "2026-02-11T00:00:00.000Z",
  "ownerId": 1,
  "teamId": 1,
  "createdAt": "2026-02-11T09:00:00.000Z"
}
```

### Update Task
```http
PUT /api/tasks/:id
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "medium",
  "dueDate": "2026-02-20T00:00:00.000Z"
}
```

### Start Task
```http
POST /api/tasks/:id/start
Cookie: sessionId=<session_id>
```

### Complete Task
```http
POST /api/tasks/:id/complete
Cookie: sessionId=<session_id>
```

### Reopen Task
```http
POST /api/tasks/:id/reopen
Cookie: sessionId=<session_id>
```

### Assign Task to User
```http
POST /api/tasks/:id/assign
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "assignedTo": 2
}
```

### Delete Task
```http
DELETE /api/tasks/:id
Cookie: sessionId=<session_id>
```

### Get Overdue Tasks
```http
GET /api/tasks/overdue
Cookie: sessionId=<session_id>
```

### Get Tasks Due Soon
```http
GET /api/tasks/due-soon?days=7
Cookie: sessionId=<session_id>
```

### Get Tasks Due Today
```http
GET /api/tasks/due-today
Cookie: sessionId=<session_id>
```

### Get Tasks Completed Today
```http
GET /api/tasks/completed-today
Cookie: sessionId=<session_id>
```

### Get Recently Completed Tasks
```http
GET /api/tasks/completed-recent?days=7
Cookie: sessionId=<session_id>
```

---

## Subtasks API

### List Subtasks for Task
```http
GET /api/tasks/:taskId/subtasks
Cookie: sessionId=<session_id>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "taskId": 1,
    "question": "Which auth method?",
    "options": ["JWT", "OAuth", "Sessions"],
    "assignedTo": null,
    "assignedToUsername": null,
    "assignedToName": null,
    "answered": false,
    "selectedOption": null,
    "type": "multiple_choice",
    "providedFile": "no_file",
    "fileReference": null,
    "createdAt": "2026-02-11T09:00:00.000Z"
  }
]
```

### Create Subtask (Task ID from URL)
```http
POST /api/tasks/:taskId/subtasks
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "question": "Which framework should we use?",
  "type": "multiple_choice",
  "options": ["React", "Vue", "Angular"],
  "assignedTo": 2,
  "provided_file": "no_file",
  "file_reference": null
}
```

**Required Fields:**
- `question` (string): The subtask question
- `type` (string): Either `multiple_choice` or `open_answer`
- `options` (array): Required for `multiple_choice` type - array of option strings

**Optional Fields:**
- `assignedTo` (number): User ID to assign the subtask to
- `provided_file` (string): One of `no_file`, `emailed`, `on_disk`
- `file_reference` (string): Reference to file (required when `provided_file` is `emailed` or `on_disk`)

**Response (201):**
```json
{
  "id": 1,
  "taskId": 1,
  "question": "Which framework should we use?",
  "options": ["React", "Vue", "Angular"],
  "assignedTo": 2,
  "assignedToUsername": "bob",
  "assignedToName": "Bob Smith",
  "answered": false,
  "selectedOption": null,
  "type": "multiple_choice",
  "providedFile": "no_file",
  "fileReference": null,
  "createdAt": "2026-02-11T09:00:00.000Z"
}
```

### Create Subtask (Task ID in Body)
```http
POST /api/subtasks
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "taskId": 1,
  "question": "What's the deadline for this?",
  "type": "open_answer",
  "assignedTo": 1,
  "provided_file": "no_file",
  "file_reference": null
}
```

**Required Fields:**
- `taskId` (number): The parent task ID
- `question` (string): The subtask question
- `type` (string): Either `multiple_choice` or `open_answer`
- `options` (array): Required for `multiple_choice` type - array of option strings

**Optional Fields:**
- `assignedTo` (number): User ID to assign the subtask to
- `provided_file` (string): One of `no_file`, `emailed`, `on_disk`
- `file_reference` (string): Reference to file (required when `provided_file` is `emailed` or `on_disk`)

### Get Single Subtask
```http
GET /api/subtasks/:id
Cookie: sessionId=<session_id>
```

### Answer Subtask
```http
POST /api/subtasks/:id/answer
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "selectedOption": "JWT"
}
```

**Response (200):**
```json
{
  "id": 1,
  "taskId": 1,
  "question": "Which auth method?",
  "options": ["JWT", "OAuth", "Sessions"],
  "answered": true,
  "selectedOption": "JWT",
  "type": "multiple_choice",
  "providedFile": "no_file",
  "fileReference": null,
  "createdAt": "2026-02-11T09:00:00.000Z"
}
```

### Update Subtask
```http
PUT /api/subtasks/:id
Cookie: sessionId=<session_id>
Content-Type: application/json

{
  "question": "Updated question?",
  "options": ["Option A", "Option B", "Option C"],
  "assignedTo": 2,
  "type": "multiple_choice",
  "provided_file": "emailed",
  "file_reference": "path/to/file.pdf"
}
```

### Delete Subtask
```http
DELETE /api/subtasks/:id
Cookie: sessionId=<session_id>
```

---

## Activity API

### Get Recent Activity
```http
GET /api/activity?limit=50
Cookie: sessionId=<session_id>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "actorId": 1,
    "actorType": "human",
    "actionType": "task_created",
    "entityType": "task",
    "entityId": 1,
    "entityName": "Implement user authentication",
    "details": {},
    "createdAt": "2026-02-11T09:00:00.000Z",
    "message": "Alice Johnson created task 'Implement user authentication'"
  }
]
```

### Get Changes Since Last Visit
```http
GET /api/activity/whats-new?since=2026-02-10T09:00:00.000Z
Cookie: sessionId=<session_id>
```

**Response (200):**
```json
{
  "totalChanges": 5,
  "recentActivities": [
    {
      "id": 1,
      "actorId": 2,
      "actorType": "human",
      "actionType": "task_assigned",
      "entityType": "task",
      "entityId": 1,
      "entityName": "Implement user authentication",
      "details": {},
      "createdAt": "2026-02-11T09:00:00.000Z",
      "message": "Bob Smith assigned task 'Implement user authentication' to you"
    }
  ]
}
```

---

## Users API

### List All Users
```http
GET /api/users
Cookie: sessionId=<session_id>
```

**Response (200):**
```json
[
  {
    "id": 1,
    "username": "alice",
    "fullName": "Alice Johnson"
  },
  {
    "id": 2,
    "username": "bob",
    "fullName": "Bob Smith"
  }
]
```

---

## Error Handling

### Error Response Format
All errors follow this format:

```json
{
  "error": "Error message here",
  "path": "/api/tasks/999"
}
```

### Common HTTP Status Codes
- `200 OK` - Successful GET, PUT, POST
- `201 Created` - Successful resource creation
- `400 Bad Request` - Validation errors, missing required fields
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

### Common Error Messages

**Authentication Errors:**
- "Authentication required"
- "Invalid username or password"
- "Session expired"

**Validation Errors:**
- "Subtask question is required"
- "Task ID is required"
- "Type must be multiple_choice or open_answer"
- "Multiple choice subtasks must have at least one option"
- "Provided file must be no_file, emailed, or on_disk"
- "File reference is required when provided_file is emailed or on_disk"

**Permission Errors:**
- "You must be a member of a team to view projects"
- "You do not have permission to view this task"
- "You do not have permission to create subtasks for this task"

**Not Found Errors:**
- "Task 999 not found"
- "Subtask 999 not found"
- "Project 999 not found"

---

## Testing Examples

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"alice","password":"password"}' \
  -c cookies.txt
```

**Create Task:**
```bash
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "projectId": 1,
    "title": "Test task",
    "priority": "high"
  }'
```

**Create Subtask (URL-based):**
```bash
curl -X POST http://localhost:3000/api/tasks/1/subtasks \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "question": "What is your preference?",
    "type": "multiple_choice",
    "options": ["Option A", "Option B"]
  }'
```

### Using Node.js

```javascript
// Create a task
async function createTask(sessionId, taskData) {
  const response = await fetch('http://localhost:3000/api/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sessionId=${sessionId}`
    },
    body: JSON.stringify(taskData)
  });
  return response.json();
}

// Create a subtask (URL-based)
async function createSubtask(sessionId, taskId, subtaskData) {
  const response = await fetch(`http://localhost:3000/api/tasks/${taskId}/subtasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cookie': `sessionId=${sessionId}`
    },
    body: JSON.stringify(subtaskData)
  });
  return response.json();
}
```

### Using Python

```python
import requests

# Create a task
def create_task(session_id, task_data):
    response = requests.post(
        'http://localhost:3000/api/tasks',
        json=task_data,
        cookies={'sessionId': session_id}
    )
    return response.json()

# Create a subtask (URL-based)
def create_subtask(session_id, task_id, subtask_data):
    response = requests.post(
        f'http://localhost:3000/api/tasks/{task_id}/subtasks',
        json=subtask_data,
        cookies={'sessionId': session_id}
    )
    return response.json()
```

---

## Best Practices for AI Assistants

1. **Always check API documentation first** - The `/api` endpoint provides the most up-to-date information
2. **Parse error messages carefully** - They provide specific feedback on what went wrong
3. **Use appropriate subtask types:**
   - `multiple_choice` for decisions with predefined options
   - `open_answer` for questions requiring text responses
4. **Validate required fields before sending:**
   - For `multiple_choice` subtasks: `question`, `type`, `options`
   - For `open_answer` subtasks: `question`, `type`
5. **Handle file references properly:**
   - Use `no_file` when no file is attached
   - Use `emailed` or `on_disk` when a file is referenced
   - Always provide `file_reference` when not using `no_file`
6. **Check permissions** - Ensure the user is a member of a team before creating projects/tasks
7. **Use RESTful patterns** - Prefer `/api/tasks/:taskId/subtasks` over `/api/subtasks` for creating subtasks
8. **Handle errors gracefully** - Catch and report errors to users with helpful messages

---

## Quick Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login user |
| `/api/auth/me` | GET | Get current user |
| `/api/projects` | GET | List projects |
| `/api/projects` | POST | Create project |
| `/api/projects/:id` | GET | Get project |
| `/api/projects/:id/full` | GET | Get project with tasks |
| `/api/projects/:id` | PUT | Update project |
| `/api/projects/:id/archive` | POST | Archive project |
| `/api/projects/:id` | DELETE | Delete project |
| `/api/tasks` | GET | List tasks |
| `/api/tasks` | POST | Create task |
| `/api/tasks/:id` | GET | Get task |
| `/api/tasks/:id/full` | GET | Get task with subtasks |
| `/api/tasks/:id` | PUT | Update task |
| `/api/tasks/:id/start` | POST | Start task |
| `/api/tasks/:id/complete` | POST | Complete task |
| `/api/tasks/:id/reopen` | POST | Reopen task |
| `/api/tasks/:id/assign` | POST | Assign task |
| `/api/tasks/:id` | DELETE | Delete task |
| `/api/tasks/:taskId/subtasks` | GET | List subtasks |
| `/api/tasks/:taskId/subtasks` | POST | Create subtask (taskId in URL) |
| `/api/subtasks` | POST | Create subtask (taskId in body) |
| `/api/subtasks/:id` | GET | Get subtask |
| `/api/subtasks/:id/answer` | POST | Answer subtask |
| `/api/subtasks/:id` | PUT | Update subtask |
| `/api/subtasks/:id` | DELETE | Delete subtask |
| `/api/activity` | GET | Get recent activity |
| `/api/activity/whats-new` | GET | Get changes since last visit |
| `/api/users` | GET | List users |

---

**TaskPulse API Version:** v1.2.0  
**Last Updated:** 2026-02-13
