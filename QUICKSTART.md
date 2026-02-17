# TaskPulse Quick Start Guide

Welcome to TaskPulse! This guide will help you get started quickly with the web interface.


## What is TaskPulse?

TaskPulse is a modern task management application with:
- ✅ **Kanban Boards** - Visual task organization
- ✅ **Priorities** - Low, Medium, High, Critical
- ✅ **Due Dates** - Never miss a deadline
- ✅ **Assignments** - Delegate tasks to team members
- ✅ **Subtasks** - Break down complex tasks
- ✅ **Mobile App** - Works on phones and tablets
- ✅ **Offline Mode** - Keep working without internet


## Getting Started

### 1. Access TaskPulse

Open your web browser and navigate to:

...
http://localhost:3050
```

If TaskPulse isn't running, ask your administrator to start it.

### 2. Create Your Account

1. Click the **"Register"** link in the top right
2. Fill in your information:
   - **Username** (e.g., `john_doe`)
   - **Email** (e.g., `john@example.com`)
   - **Password** (minimum 6 characters)
   - **Full Name** (optional - e.g., `John Doe`)
3. Click **"Register"**

That's it! You're ready to start creating tasks.

### 3. First Login

1. Go to `http://localhost:3050`
2. Enter your username and password
3. Click **"Login"**

You'll see your task dashboard with an empty project list.

---

## Creating Your First Project

### What is a Project?

Projects help you organize your tasks by category, client, or timeframe.

**Examples:**
- "Website Redesign"
- "Mobile App Development"
- "Q1 Marketing Campaign"
- "Client: Acme Corp"

### Create a Project

1. Click the **"+ New Project"** button
2. Enter project details:
   - **Name** (required) - e.g., "Website Redesign"
   - **Description** (optional) - e.g., "Q1 2026 website overhaul"
3. Click **"Create Project"**

Your project will appear in the left sidebar. Click it to view your Kanban board.

---

## Understanding the Kanban Board

Your Kanban board has three columns:

### To Do
Tasks that haven't been started yet

### In Progress
Tasks you're currently working on

### Done
Completed tasks

**Tip:** Drag and drop tasks between columns to change their status!

---

## Creating Your First Task

### Create a Task

1. Make sure you've selected a project
2. Click the **"+ Add Task"** button (or double-click anywhere in the board)
3. Fill in task details:
   - **Title** (required) - e.g., "Design homepage"
   - **Description** (optional) - e.g., "Create wireframes and mockups"
   - **Priority** (required) - Choose from dropdown:
     - 🔵 Low
     - 🟡 Medium
     - 🟠 High
     - 🔴 Critical
   - **Due Date** (optional) - Click date picker
   - **Assigned To** (optional) - Type username
4. Click **"Create Task"**

Your task appears in the "To Do" column!

### Task Cards

Each task card shows:
- **Priority badge** (color-coded)
- **Title**
- **Due date** (if set)
- **Completion timestamp** (when task was completed)
- **Assigned user** (if assigned)
- **Subtask progress** (if subtasks exist)

---

## Managing Tasks

### Change Task Status

**Method 1: Drag and Drop (Desktop)**
- Click and hold on a task card
- Drag it to a different column
- Release to drop

**Method 2: Click Buttons**
- Click the task to open details
- Click status buttons at the bottom:
  - **"▶ Start"** → Moves to In Progress
  - **"✓ Complete"** → Moves to Done
  - **"↺ Reopen"** → Moves back to To Do

### Edit a Task

1. Click on any task card
2. The task details modal opens
3. Modify any field you want to change
4. Click **"Save"**

### Delete a Task

1. Click on a task card
2. Click the **"🗑️ Delete"** button
3. Confirm deletion

**Warning:** This cannot be undone!

---

## Using Subtasks

### What are Subtasks?

Subtasks break down complex tasks into smaller, manageable pieces.

### Add a Subtask

1. Click on a task to open details
2. Find the **"Subtasks"** section
3. Click **"+ Add Subtask"**
4. Enter subtask title
5. Click **"Add"**

### Complete a Subtask

Click the checkbox next to a subtask to mark it complete.

**Tip:** Task progress bar updates as you complete subtasks!

### Delete a Subtask

Click the **"×"** next to a subtask to remove it.

---

## Task Priorities

### Priority Levels

| Priority | Color | When to Use |
|----------|--------|--------------|
| 🔵 Low | Blue | Nice-to-have, low impact |
| 🟡 Medium | Yellow | Important but not urgent |
| 🟠 High | Orange | Urgent, affects timeline |
| 🔴 Critical | Red | Blocking, immediate action needed |

### Changing Priority

1. Click on a task
2. Select new priority from dropdown
3. Click **"Save"**

---

## Due Dates

### Setting Due Dates

1. Click on a task
2. Click on date picker field
3. Select a date
4. Click **"Save"**

### Overdue Tasks

Tasks past their due date appear with a red warning indicator.

---

## Completion Tracking

### What is Completion Tracking?

When you complete a task, TaskPulse automatically records **when** it was completed. This helps you:

- Track how long tasks take to complete
- Review your productivity over time
- See exactly when you finished important work

### When is Completion Time Recorded?

The completion timestamp is set automatically when:
- You move a task to "Done" column
- You click the "✓ Complete" button
- A bot or AI completes a task

If you reopen a task (move it back to "To Do" or "In Progress"), the completion timestamp is cleared. When you complete it again, a new timestamp is recorded.

### Viewing Completion Time

You can see when a task was completed:
- **On task cards** - Shows "Completed X hours/days ago"
- **In task details** - Shows exact date and time
- **In API responses** - The `completed_at` field is included

### Productivity Insights

This feature enables powerful productivity tracking:
- "How many tasks did I complete this week?"
- "What was my most productive day?"
- "How long does it typically take to complete high-priority tasks?"

**Note:** Completion tracking works automatically - no setup required!

---

## Assigning Tasks

### Assign to a Team Member

1. Click on a task
2. In the **"Assigned To"** field, type a username
3. Click **"Save"**

The assigned user will see:
- The task in their view
- Notifications about the task

### View Assigned Tasks

Tasks assigned to you appear in your dashboard with your name shown.

---

## Mobile App Features

TaskPulse works great on phones and tablets! Here's what's different:

### Navigation

- **Bottom Tab Bar** - Switch between projects, tasks, and settings
- **Swipe Gestures** - Swipe tasks left/right to move between columns
- **Tap to Edit** - Tap any task to open details

### Touch-Friendly UI

- **Large Buttons** - Easy to tap (44px minimum)
- **No Zoom** - Fonts sized to prevent iOS zoom
- **Sticky Tabs** - Easy access to column filters

### Swipe Actions

**Swipe Right** → Move to previous column  
**Swipe Left** → Move to next column  
**Long Swipe Left** → Delete task

### Offline Mode

When you lose internet connection:
- Continue viewing tasks
- Edit tasks locally
- Changes sync when you're back online

**Note:** You need to install TaskPulse as an app for offline mode to work.

---

## Installing as a Mobile App

### On Android (Chrome)

1. Open TaskPulse in Chrome
2. Tap the **"⋮"** menu (three dots)
3. Tap **"Add to Home screen"**
4. Tap **"Add"**

### On iOS (Safari)

1. Open TaskPulse in Safari
2. Tap the **"Share"** button (square with arrow)
3. Tap **"Add to Home Screen"**
4. Tap **"Add"**

### On Desktop (Chrome/Edge)

1. Open TaskPulse
2. Click the **"⊕"** icon in address bar (or lock icon)
3. Click **"Install"** or **"Add to Home Screen"**

---

## Tips for Success

### Best Practices

✅ **Break down large tasks** - Use subtasks for complex work  
✅ **Set realistic due dates** - Avoid overwhelming yourself  
✅ **Assign clearly** - Make sure assignees know their responsibilities  
✅ **Review daily** - Check your board each morning  
✅ **Use priorities wisely** - Reserve "Critical" for blockers  

### Keyboard Shortcuts (Desktop)

| Action | Shortcut |
|---------|----------|
| Create task | Double-click anywhere |
| Edit task | Click task card |
| Delete task | Open task → Delete button |
| Move column | Drag and drop |

---

## Getting Help

### Common Issues

**Q: I can't login**  
A: Check your username and password. Make sure Caps Lock is off.

**Q: My tasks aren't saving**  
A: Refresh the page. If that doesn't work, contact your administrator.

**Q: Mobile app isn't working**  
A: Make sure you have internet connection for the first load. Then offline mode will work.

**Q: How do I create more projects?**  
A: Click **"+ New Project"** in the sidebar. You can have unlimited projects!

**Q: Can I export my tasks?**  
A: Not yet, but this feature is planned for a future update.

---

## Next Steps

Now that you know the basics, try:

1. ✅ Create 2-3 projects for different areas of work
2. ✅ Add tasks with different priorities
3. ✅ Try creating subtasks for complex work
4. ✅ Assign a task to a colleague
5. ✅ Complete a task and move it to "Done"
6. ✅ Install TaskPulse on your phone

---

## Need More Help?

- **Admin Guide:** See `ADMIN_GUIDE.md` for setup and management
- **AI Manual:** See `AI_MANUAL.md` for API documentation
- **Your Administrator:** Contact your system admin for account issues

---

**Enjoy managing your tasks with TaskPulse!** ⚡

---

**Last Updated:** 2026-02-17  
**TaskPulse Version:** v1.9.0  
**Purpose:** Quick Start Guide for End Users
