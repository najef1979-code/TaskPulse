# TaskPulse CLI - AI Assistant Guide

## Overview
This CLI allows you to manage TaskPulse projects, tasks, and subtasks via command-line commands. All output is JSON for easy parsing.

## Common AI Workflows

### 1. Check What Needs Attention
```bash
# Get overall status
./cli.js status

# Find high-priority tasks
./cli.js tasks --priority high

# Find pending tasks
./cli.js tasks --status pending
```

### 2. Help User Plan Work
```bash
# List all projects
./cli.js projects

# See tasks for specific project
./cli.js tasks --project 1

# Get full details of a task including subtasks
./cli.js task full 5
```

### 3. Create Tasks Based on Conversation
```bash
# Add a new task
./cli.js task add 1 "Implement user authentication" --priority high

# Add subtasks to break down work
./cli.js subtask add 5 "Which auth method?" --options "JWT,OAuth,Sessions"
```

### 4. Update Progress
```bash
# Start working on a task
./cli.js task start 5

# Complete a task
./cli.js task complete 5

# Answer a decision
./cli.js subtask answer 3 "JWT"
```

### 5. Search and Filter
```bash
# All in-progress tasks
./cli.js tasks --status in-progress

# Tasks for specific project that are pending
./cli.js tasks --project 1 --status pending

# High priority tasks across all projects
./cli.js tasks --priority high
```

## Response Parsing

All responses are JSON. Parse them to extract data:

### Success responses:
```json
{
  "success": true,
  "message": "Task created",
  "task": { ... }
}
```

### Data responses:
```json
[
  { "id": 1, "title": "Task 1", ... },
  { "id": 2, "title": "Task 2", ... }
]
```

### Error responses:
```json
{
  "error": "Task ID is required"
}
```

## Best Practices for AI

1. **Always check status first** - Get context before making changes
2. **Use full commands** - Get complete task details with `task full <id>`
3. **Parse JSON carefully** - Extract IDs and data from responses
4. **Provide context** - When suggesting tasks, explain reasoning
5. **Confirm destructive actions** - Before deleting, verify with user

## Example AI Conversation Flow

**User:** "What do I need to work on today?"

**AI Actions:**
```bash
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

## Quick Reference

### Projects
```bash
./cli.js projects                          # List all
./cli.js project add "Name"                # Create
./cli.js project get <id>                  # Get one
./cli.js project full <id>                 # Get with tasks
./cli.js project delete <id>                # Delete
```

### Tasks
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

### Subtasks
```bash
./cli.js subtasks <task-id>                              # List for task
./cli.js subtask add <task-id> "Question"             # Create
./cli.js subtask answer <id> "Option"                 # Answer
./cli.js subtask delete <id>                          # Delete
```

### Status
```bash
./cli.js status    # Overview of everything
```

## Command Reference

Full help available: `./cli.js help`

### Project Commands
- `cli.js projects [--status <status>]` - List projects
- `cli.js project add <name> [--description "text"]` - Create project
- `cli.js project get <id>` - Get project details
- `cli.js project full <id>` - Get project with all tasks
- `cli.js project update <id> [--name "text"]` - Update project
- `cli.js project archive <id>` - Archive project
- `cli.js project delete <id>` - Delete project

### Task Commands
- `cli.js tasks [--project <id>] [--status <status>] [--priority <priority>]` - List tasks
- `cli.js task add <project-id> <title> [--description "text"] [--priority <priority>]` - Create task
- `cli.js task get <id>` - Get task details
- `cli.js task full <id>` - Get task with subtasks
- `cli.js task update <id> [--title "text"]` - Update task
- `cli.js task start <id>` - Start task
- `cli.js task complete <id>` - Complete task
- `cli.js task reopen <id>` - Reopen task
- `cli.js task delete <id>` - Delete task

### Subtask Commands
- `cli.js subtasks <task-id>` - List subtasks for task
- `cli.js subtask add <task-id> <question> [--options "opt1,opt2,opt3"]` - Create subtask
- `cli.js subtask get <id>` - Get subtask details
- `cli.js subtask answer <id> <option>` - Answer subtask
- `cli.js subtask update <id> [--question "text"]` - Update subtask
- `cli.js subtask delete <id>` - Delete subtask

### Status Command
- `cli.js status` - Overview of all projects and tasks