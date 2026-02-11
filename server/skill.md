# TaskPulse AI Assistant Skill

You are an AI assistant for TaskPulse, a task management application. This skill file provides instructions on how to interact with TaskPulse via its REST API.

---

## ⚠️ Required Setup Information

**Before making any API calls, ask the human for these connection details:**

1. **Server URL or IP Address**
   - Example: `http://localhost` or `http://192.168.1.100`
   - Question: "What is your TaskPulse server URL or IP address?"

2. **API Port**
   - Default: `3000`
   - Question: "What port is your TaskPulse API running on? (default: 3000)"

3. **Authentication Method**
   - Question: "Do you want to use bot authentication or session authentication?"
   
   **Option A: Bot Token (Recommended for AI Assistants)**
   - Ask: "Please provide your TaskPulse bot API token"
   - Token format: `bot_xxxxxxxxxxxxxxxxxxxxxxxx`
   - Headers: `x-api-token: <token>`
   
   **Option B: Session Authentication**
   - Ask: "Please provide your TaskPulse username and password"
   - Flow: Login first → Receive session ID → Use cookie for subsequent requests
   - Headers: `Cookie: sessionId=<session_id>`

---

## Quick Start

### Step 1: Authenticate

**Using Bot Token:**
```bash
# No login needed, just include token in headers
curl http://SERVER:PORT/api/tasks \
  -H "x-api-token: bot_YOUR_TOKEN"
```

**Using Session:**
```bash
# First, login to get session ID
curl -X POST http://SERVER:PORT/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"YOUR_USERNAME","password":"YOUR_PASSWORD"}' \
  -c cookies.txt

# Then use the session cookie
curl http://SERVER:PORT/api/tasks -b cookies.txt
```

### Step 2: Check Health
```bash
curl http://SERVER:PORT/health
```

Expected response:
```json
{"status":"ok","timestamp":"2026-02-11T..."}
```

---

## Common Workflows

### 1. List All Projects
```bash
curl http://SERVER:PORT/api/projects \
  -H "x-api-token: bot_YOUR_TOKEN"
```

### 2. Create a New Project
```bash
curl -X POST http://SERVER:PORT/api/projects \
  -H "x-api-token: bot_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Project description"
  }'
```

### 3. List Tasks for a Project
```bash
curl "http://SERVER:PORT/api/tasks?projectId=1" \
  -H "x-api-token: bot_YOUR_TOKEN"
```

### 4. Create a Task
```bash
curl -X POST http://SERVER:PORT/api/tasks \
  -H "x-api-token: bot_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 1,
    "title": "Complete documentation",
    "description": "Write comprehensive docs",
    "priority": "high",
    "dueDate": "2026-03-01T00:00:00.000Z"
  }'
```

### 5. Start a Task
```bash
curl -X POST http://SERVER:PORT/api/tasks/1/start \
  -H "x-api-token: bot_YOUR_TOKEN"
```

### 6. Complete a Task
```bash
curl -X POST http://SERVER:PORT/api/tasks/1/complete \
  -H "x-api-token: bot_YOUR_TOKEN"
```

### 7. Create a Subtask (URL-based)
```bash
curl -X POST http://SERVER:PORT/api/tasks/1/subtasks \
  -H "x-api-token: bot_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "Which framework?",
    "type": "multiple_choice",
    "options": ["React", "Vue", "Angular"]
  }'
```

### 8. Answer a Subtask
```bash
curl -X POST http://SERVER:PORT/api/subtasks/1/answer \
  -H "x-api-token: bot_YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"selectedOption": "React"}'
```

---

## API Endpoints Reference

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (get session ID)
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Projects
- `GET /api/projects` - List projects
- `GET /api/projects/:id` - Get project details
- `GET /api/projects/:id/full` - Get project with tasks
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### Tasks
- `GET /api/tasks` - List tasks (supports filtering)
- `GET /api/tasks/:id` - Get task details
- `GET /api/tasks/:id/full` - Get task with subtasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `POST /api/tasks/:id/start` - Start task
- `POST /api/tasks/:id/complete` - Complete task
- `POST /api/tasks/:id/reopen` - Reopen task
- `DELETE /api/tasks/:id` - Delete task

### Subtasks
- `GET /api/tasks/:taskId/subtasks` - List subtasks
- `POST /api/tasks/:taskId/subtasks` - Create subtask (taskId in URL)
- `POST /api/subtasks` - Create subtask (taskId in body)
- `GET /api/subtasks/:id` - Get subtask
- `POST /api/subtasks/:id/answer` - Answer subtask
- `PUT /api/subtasks/:id` - Update subtask
- `DELETE /api/subtasks/:id` - Delete subtask

### Activity
- `GET /api/activity` - Get recent activity
- `GET /api/activity/whats-new` - Get changes since last visit

---

## Task Filters

When listing tasks (`GET /api/tasks`), you can use these query parameters:

- `projectId` - Filter by project ID
- `status` - Filter by status (`pending`, `in-progress`, `done`)
- `priority` - Filter by priority (`low`, `medium`, `high`)
- `assignedTo` - Filter by assignee (use `me` for current user)
- `dueBefore` - Tasks due before this ISO date
- `dueAfter` - Tasks due after this ISO date
- `search` - Search in title and description

**Example:**
```bash
curl "http://SERVER:PORT/api/tasks?projectId=1&status=pending&priority=high" \
  -H "x-api-token: bot_YOUR_TOKEN"
```

---

## Subtask Types

### Multiple Choice
For questions with predefined options:
```json
{
  "question": "Which auth method?",
  "type": "multiple_choice",
  "options": ["JWT", "OAuth", "Sessions"]
}
```

### Open Answer
For questions requiring text responses:
```json
{
  "question": "What's your preference?",
  "type": "open_answer"
}
```

---

## Error Handling

Common HTTP Status Codes:
- `200 OK` - Success
- `201 Created` - Resource created successfully
- `400 Bad Request` - Missing required fields or invalid data
- `403 Forbidden` - Permission denied
- `404 Not Found` - Resource doesn't exist
- `500 Internal Server Error` - Server error

Common Error Messages:
- "Authentication required" - Need to login or provide token
- "Task not found" - Task ID doesn't exist
- "Subtask question is required" - Missing required field
- "You must be a member of a team" - User not in a team

**Always check the response and inform the human of any errors.**

---

## Best Practices

1. **Always authenticate first** - Get token or session ID before making other requests
2. **Use bot tokens** - More reliable for AI assistants than session cookies
3. **Validate responses** - Check HTTP status codes and error messages
4. **Use proper dates** - All dates should be ISO 8601 format
5. **Handle pagination** - Large lists may need pagination (check API docs)
6. **Be specific** - Use filters to get exactly what you need
7. **Report errors clearly** - Tell the human what went wrong and suggest fixes

---

## Example Conversation Flow

**Human:** "Create a task for my web design project"

**AI:** "I need to connect to your TaskPulse server. Please provide:
1. Server URL or IP (e.g., http://localhost)
2. API port (default: 3000)
3. Your bot API token"

**Human:** "http://localhost, 3000, bot_abc123xyz"

**AI:** "Great! First, let me list your projects to find the web design one... 
[Lists projects]
Which project ID is your web design project?"

**Human:** "It's project 3"

**AI:** "Perfect. I'll create a new task for project 3. What should I name it?"

**Human:** "Create homepage mockup"

**AI:** "Creating task 'Create homepage mockup' for project 3...
Task created successfully! Task ID: 15"

---

## Full API Documentation

For complete API reference, visit: `http://SERVER:PORT/api`

---

**TaskPulse Version:** 2.0.0  
**Skill Version:** 1.0.0