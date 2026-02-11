import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import cron from 'node-cron';
import path from 'path';
import { fileURLToPath } from 'url';
import projectService from './lib/projects.js';
import taskService from './lib/tasks.js';
import subtaskService from './lib/subtasks.js';
import activityService from './lib/activity.js';
import authService from './lib/auth.js';
import { requireAuth, requireHuman, optionalAuth } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware - Dynamic CORS for any IP
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and network IPs
    const allowedPatterns = [
      /^http:\/\/localhost(:\d+)?$/,
      /^http:\/\/127\.0\.0\.1(:\d+)?$/,
      /^http:\/\/192\.168\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/10\.\d+\.\d+\.\d+(:\d+)?$/,
      /^http:\/\/172\.(1[6-9]|2\d|3[01])\.\d+\.\d+(:\d+)?$/,
    ];
    
    const allowed = allowedPatterns.some(pattern => pattern.test(origin));
    
    if (allowed) {
      callback(null, true);
    } else {
      console.log(`CORS blocked origin: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Request logging middleware
app.use((req, res, next) => {
  const user = req.user ? `(${req.user.userType}: ${req.user.username})` : '';
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} ${user}`);
  next();
});

// Health check endpoint (no auth required)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Skill file endpoint (no auth required) - For AI assistants
app.get('/api/skill.md', (req, res) => {
  const skillPath = path.join(process.cwd(), 'skill.md');
  res.setHeader('Content-Type', 'text/markdown');
  res.sendFile(skillPath);
});

// API documentation (no auth required)
app.get('/api', (req, res) => {
  res.json({
    name: 'TaskPulse API',
    version: '2.0.0',
    authentication: 'Hybrid (session for humans, token for bots)',
    documentation: {
      'GET /api': 'API documentation',
      'GET /api/skill.md': 'AI assistant skill file (markdown)',
      'GET /health': 'Health check'
    },
    endpoints: {
      auth: {
        'POST /api/auth/register': 'Register new human user',
        'POST /api/auth/login': 'Login human user',
        'POST /api/auth/logout': 'Logout human user',
        'GET /api/auth/me': 'Get current user',
        'POST /api/auth/update-password': 'Update password (requires old password)'
      },
      bots: {
        'GET /api/bots': 'List user\'s bots',
        'POST /api/bots': 'Create new bot',
        'GET /api/bots/:id': 'Get bot details',
        'PUT /api/bots/:id': 'Update bot',
        'POST /api/bots/:id/regenerate-token': 'Regenerate bot token',
        'POST /api/bots/:id/deactivate': 'Deactivate bot',
        'DELETE /api/bots/:id': 'Delete bot'
      },
      projects: {
        'GET /api/projects': 'List all projects',
        'GET /api/projects/:id': 'Get single project',
        'GET /api/projects/:id/full': 'Get project with tasks',
        'POST /api/projects': 'Create project',
        'PUT /api/projects/:id': 'Update project',
        'POST /api/projects/:id/archive': 'Archive project',
        'DELETE /api/projects/:id': 'Delete project'
      },
      tasks: {
        'GET /api/tasks': 'List all tasks with combined filters (projectId, status, priority, assignedTo, dueBefore, dueAfter, startDateBefore, startDateAfter, search, completedAfter, completedBefore, completedToday)',
        'GET /api/tasks/:id': 'Get single task',
        'GET /api/tasks/:id/full': 'Get task with subtasks',
        'POST /api/tasks': 'Create task (with optional provided_file and file_reference)',
        'PUT /api/tasks/:id': 'Update task (can update provided_file and file_reference)',
        'POST /api/tasks/:id/start': 'Start task',
        'POST /api/tasks/:id/complete': 'Complete task',
        'POST /api/tasks/:id/reopen': 'Reopen task',
        'POST /api/tasks/:id/assign': 'Assign task to user',
        'DELETE /api/tasks/:id': 'Delete task',
        'GET /api/tasks/overdue': 'Get overdue tasks',
        'GET /api/tasks/due-soon': 'Get tasks due soon',
        'GET /api/tasks/due-today': 'Get tasks due today',
        'GET /api/tasks/completed-today': 'Get tasks completed today',
        'GET /api/tasks/completed-recent': 'Get recently completed tasks (default: 7 days)'
      },
      activity: {
        'GET /api/activity': 'Get recent activity',
        'GET /api/activity/whats-new': 'Get changes since last visit'
      },
      subtasks: {
        'GET /api/tasks/:taskId/subtasks': 'List subtasks for task',
        'POST /api/tasks/:taskId/subtasks': 'Create subtask for a specific task (taskId from URL, requires: question, type, options for multiple_choice, optional: assignedTo, provided_file, file_reference)',
        'GET /api/subtasks/:id': 'Get single subtask',
        'POST /api/subtasks': 'Create subtask (requires: taskId, question, type, options for multiple_choice, optional: assignedTo, provided_file, file_reference)',
        'POST /api/subtasks/:id/answer': 'Answer subtask (works with both multiple_choice and open_answer types)',
        'PUT /api/subtasks/:id': 'Update subtask (can update question, options, assignedTo, type, provided_file, file_reference)',
        'DELETE /api/subtasks/:id': 'Delete subtask'
      }
    }
  });
});

// ============================================
// AUTHENTICATION API
// ============================================

// Register (human users only)
app.post('/api/auth/register', async (req, res, next) => {
  try {
    const user = await authService.register(req.body);
    res.status(201).json({ success: true, user });
  } catch (error) {
    next(error);
  }
});

// Login (human users only)
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await authService.login(username, password);
    
    // Update last_visit timestamp
    await authService.updateLastVisit(result.user.id);
    
    res.cookie('sessionId', result.sessionId, {
      httpOnly: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production'
    });

    res.json({ 
      success: true, 
      user: result.user,
      lastVisit: result.user.last_visit
    });
  } catch (error) {
    next(error);
  }
});

// Logout
app.post('/api/auth/logout', requireAuth, async (req, res, next) => {
  try {
    const sessionId = req.cookies.sessionId;
    if (sessionId) {
      await authService.logout(sessionId);
    }
    res.clearCookie('sessionId');
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Get current user
app.get('/api/auth/me', requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// Update password (human users only)
app.post('/api/auth/update-password', requireAuth, requireHuman, async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;
    await authService.updatePassword(req.user.id, oldPassword, newPassword);
    res.json({ success: true, message: 'Password updated successfully' });
  } catch (error) {
    next(error);
  }
});

// Update last visit timestamp
app.post('/api/auth/update-last-visit', requireAuth, async (req, res, next) => {
  try {
    await authService.updateLastVisit(req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// BOT MANAGEMENT API
// ============================================

// List user's bots
app.get('/api/bots', requireAuth, requireHuman, async (req, res, next) => {
  try {
    const bots = await authService.listBots(req.user.id);
    res.json(bots);
  } catch (error) {
    next(error);
  }
});

// Create bot
app.post('/api/bots', requireAuth, requireHuman, async (req, res, next) => {
  try {
    const bot = await authService.createBot({
      ...req.body,
      ownerId: req.user.id
    });
    res.status(201).json({ success: true, bot });
  } catch (error) {
    next(error);
  }
});

// Get bot details
app.get('/api/bots/:id', requireAuth, requireHuman, async (req, res, next) => {
  try {
    const bot = await authService.getBot(req.params.id, req.user.id);
    res.json(bot);
  } catch (error) {
    next(error);
  }
});

// Update bot
app.put('/api/bots/:id', requireAuth, requireHuman, async (req, res, next) => {
  try {
    const bot = await authService.updateBot(req.params.id, req.user.id, req.body);
    res.json({ success: true, bot });
  } catch (error) {
    next(error);
  }
});

// Regenerate bot token
app.post('/api/bots/:id/regenerate-token', requireAuth, requireHuman, async (req, res, next) => {
  try {
    const result = await authService.regenerateBotToken(req.params.id, req.user.id);
    res.json({ success: true, apiToken: result.apiToken });
  } catch (error) {
    next(error);
  }
});

// Deactivate bot
app.post('/api/bots/:id/deactivate', requireAuth, requireHuman, async (req, res, next) => {
  try {
    await authService.deactivateBot(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Delete bot
app.delete('/api/bots/:id', requireAuth, requireHuman, async (req, res, next) => {
  try {
    await authService.deleteBot(req.params.id, req.user.id);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PROTECTED ROUTES
// ============================================

// All project/task/subtask/activity routes now require authentication
app.use('/api/projects', requireAuth);
app.use('/api/tasks', requireAuth);
app.use('/api/subtasks', requireAuth);
app.use('/api/activity', requireAuth);

// ============================================
// PROJECTS API
// ============================================

// Get all projects
app.get('/api/projects', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to view projects' });
    }
    
    const filters = { teamId: req.user.teamId };
    if (req.query.status) {
      filters.status = req.query.status;
    }
    
    const projects = await projectService.getProjects(filters);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// Get single project
app.get('/api/projects/:id', async (req, res, next) => {
  try {
    const project = await projectService.getProject(req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Get project with all its tasks
app.get('/api/projects/:id/full', async (req, res, next) => {
  try {
    const project = await projectService.getProjectWithTasks(req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Create project
app.post('/api/projects', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to create projects' });
    }
    
    const ownerId = req.user.userType === 'bot' ? req.user.ownerId : req.user.id;
    const project = await projectService.createProject({
      teamId: req.user.teamId,
      ownerId,
      createdBy: req.user.id,
      ...req.body
    });
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
});

// Update project
app.put('/api/projects/:id', async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Archive project
app.post('/api/projects/:id/archive', async (req, res, next) => {
  try {
    const project = await projectService.archiveProject(req.params.id);
    res.json(project);
  } catch (error) {
    next(error);
  }
});

// Delete project
app.delete('/api/projects/:id', async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get overdue projects
app.get('/api/projects/overdue', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to view projects' });
    }
    
    const filters = { teamId: req.user.teamId };
    const projects = await projectService.getOverdueProjects(filters);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// Get projects due soon
app.get('/api/projects/due-soon', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to view projects' });
    }
    
    const days = (parseInt(req.query.days) || 7);
    const filters = { teamId: req.user.teamId };
    const projects = await projectService.getProjectsDueSoon(days, filters);
    res.json(projects);
  } catch (error) {
    next(error);
  }
});

// ============================================
// TASKS API
// ============================================

// Special endpoints MUST come before :id route
// Get overdue tasks
app.get('/api/tasks/overdue', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to view tasks' });
    }
    
    const filters = { teamId: req.user.teamId };
    if (req.query.projectId) {
      filters.projectId = parseInt(req.query.projectId);
    }
    const tasks = await taskService.getOverdueTasks(filters);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Get tasks due soon
app.get('/api/tasks/due-soon', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to view tasks' });
    }
    
    const days = (parseInt(req.query.days) || 7);
    const filters = { teamId: req.user.teamId };
    if (req.query.projectId) {
      filters.projectId = parseInt(req.query.projectId);
    }
    const tasks = await taskService.getTasksDueSoon(days, filters);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Get tasks completed today
app.get('/api/tasks/completed-today', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to view tasks' });
    }
    
    const filters = { 
      teamId: req.user.teamId,
      status: 'done',
      completedToday: true
    };
    if (req.query.projectId) {
      filters.projectId = parseInt(req.query.projectId);
    }
    const tasks = await taskService.getTasks(filters);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Get recently completed tasks
app.get('/api/tasks/completed-recent', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to view tasks' });
    }
    
    const days = (parseInt(req.query.days) || 7);
    const filters = { 
      teamId: req.user.teamId,
      status: 'done'
    };
    if (req.query.projectId) {
      filters.projectId = parseInt(req.query.projectId);
    }
    
    // Calculate date range for "recently completed"
    const now = new Date();
    const past = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    filters.completedAfter = past.toISOString();
    
    const tasks = await taskService.getTasks(filters);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Get all tasks (with optional combined filters)
app.get('/api/tasks', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to view tasks' });
    }
    
    const filters = { teamId: req.user.teamId };
    
    // Basic filters
    if (req.query.projectId) {
      filters.projectId = parseInt(req.query.projectId);
    }
    if (req.query.status) {
      filters.status = req.query.status;
    }
    if (req.query.priority) {
      filters.priority = req.query.priority;
    }
    if (req.query.assignedTo) {
      // Handle special case 'me' for current user
      if (req.query.assignedTo === 'me') {
        filters.assignedTo = req.user.id;
      } else {
        filters.assignedTo = parseInt(req.query.assignedTo);
      }
    }
    
    // Date range filters
    if (req.query.dueBefore) {
      filters.dueBefore = req.query.dueBefore;
    }
    if (req.query.dueAfter) {
      filters.dueAfter = req.query.dueAfter;
    }
    if (req.query.startDateBefore) {
      filters.startDateBefore = req.query.startDateBefore;
    }
    if (req.query.startDateAfter) {
      filters.startDateAfter = req.query.startDateAfter;
    }
    
    // Search filter
    if (req.query.search) {
      filters.search = req.query.search;
    }
    
    // Completion date filters
    if (req.query.completedAfter) {
      filters.completedAfter = req.query.completedAfter;
    }
    if (req.query.completedBefore) {
      filters.completedBefore = req.query.completedBefore;
    }
    if (req.query.completedToday) {
      filters.completedToday = req.query.completedToday === 'true';
    }
    
    const tasks = await taskService.getTasks(filters);
    res.json(tasks);
  } catch (error) {
    next(error);
  }
});

// Get single task
app.get('/api/tasks/:id', async (req, res, next) => {
  try {
    const task = await taskService.getTask(req.params.id);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Get task with all its subtasks
app.get('/api/tasks/:id/full', async (req, res, next) => {
  try {
    // Verify task belongs to user's team
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    const task = await db.get('SELECT team_id FROM tasks WHERE id = ?', [parseInt(req.params.id)]);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.team_id !== req.user.teamId) {
      return res.status(403).json({ error: 'You do not have permission to view this task' });
    }
    
    const fullTask = await taskService.getTaskWithSubtasks(req.params.id);
    res.json(fullTask);
  } catch (error) {
    next(error);
  }
});

// Create task
app.post('/api/tasks', async (req, res, next) => {
  try {
    if (!req.user.teamId) {
      return res.status(403).json({ error: 'You must be a member of a team to create tasks' });
    }
    
    const ownerId = req.user.userType === 'bot' ? req.user.ownerId : req.user.id;
    const task = await taskService.createTask({
      teamId: req.user.teamId,
      ownerId,
      createdBy: req.user.id,
      ...req.body,
      actorId: req.user.id,
      actorType: req.user.userType,
      providedFile: req.body.provided_file || 'no_file',
      fileReference: req.body.file_reference || null
    });
    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
});

// Update task
app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const task = await taskService.updateTask(
      req.params.id, 
      req.body, 
      req.user.id, 
      req.user.userType
    );
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Start task (move to in-progress)
app.post('/api/tasks/:id/start', async (req, res, next) => {
  try {
    const task = await taskService.startTask(req.params.id, req.user.id, req.user.userType);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Complete task (move to done)
app.post('/api/tasks/:id/complete', async (req, res, next) => {
  try {
    const task = await taskService.completeTask(req.params.id, req.user.id, req.user.userType);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Reopen task (move back to pending)
app.post('/api/tasks/:id/reopen', async (req, res, next) => {
  try {
    const task = await taskService.reopenTask(req.params.id, req.user.id, req.user.userType);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Assign task to user
app.post('/api/tasks/:id/assign', async (req, res, next) => {
  try {
    const { assignedTo } = req.body;
    const task = await taskService.assignTask(req.params.id, assignedTo, req.user.id, req.user.userType);
    res.json(task);
  } catch (error) {
    next(error);
  }
});

// Delete task
app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const result = await taskService.deleteTask(req.params.id, req.user.id, req.user.userType);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// SUBTASKS API
// ============================================

// Get all subtasks for a task
app.get('/api/tasks/:taskId/subtasks', async (req, res, next) => {
  try {
    // Verify task belongs to user's team
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    const task = await db.get('SELECT team_id FROM tasks WHERE id = ?', [parseInt(req.params.taskId)]);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.team_id !== req.user.teamId) {
      return res.status(403).json({ error: 'You do not have permission to view subtasks for this task' });
    }
    
    const subtasks = await subtaskService.getSubtasks(parseInt(req.params.taskId));
    res.json(subtasks);
  } catch (error) {
    next(error);
  }
});

// Create subtask for a task (taskId from URL)
app.post('/api/tasks/:taskId/subtasks', async (req, res, next) => {
  try {
    // Verify task belongs to user's team
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    const task = await db.get('SELECT team_id, owner_id, created_by FROM tasks WHERE id = ?', [parseInt(req.params.taskId)]);
    
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.team_id !== req.user.teamId) {
      return res.status(403).json({ error: 'You do not have permission to create subtasks for this task' });
    }
    
    const subtask = await subtaskService.createSubtask({
      taskId: parseInt(req.params.taskId),
      ...req.body,
      actorId: req.user.id,
      actorType: req.user.userType,
      type: req.body.type || 'multiple_choice',
      providedFile: req.body.provided_file || 'no_file',
      fileReference: req.body.file_reference || null
    });
    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
});

// Get single subtask
app.get('/api/subtasks/:id', async (req, res, next) => {
  try {
    const subtask = await subtaskService.getSubtask(req.params.id);
    res.json(subtask);
  } catch (error) {
    next(error);
  }
});

// Create subtask
app.post('/api/subtasks', async (req, res, next) => {
  try {
    const subtask = await subtaskService.createSubtask({
      ...req.body,
      actorId: req.user.id,
      actorType: req.user.userType,
      type: req.body.type || 'multiple_choice',
      providedFile: req.body.provided_file || 'no_file',
      fileReference: req.body.file_reference || null
    });
    res.status(201).json(subtask);
  } catch (error) {
    next(error);
  }
});

// Answer a subtask
app.post('/api/subtasks/:id/answer', async (req, res, next) => {
  try {
    const { selectedOption } = req.body;
    
    if (!selectedOption) {
      return res.status(400).json({ error: 'selectedOption is required' });
    }
    
    const subtask = await subtaskService.answerSubtask(req.params.id, selectedOption, req.user.id, req.user.userType);
    res.json(subtask);
  } catch (error) {
    next(error);
  }
});

// Update subtask
app.put('/api/subtasks/:id', async (req, res, next) => {
  try {
    const subtask = await subtaskService.updateSubtask(req.params.id, req.body, req.user.id, req.user.userType);
    res.json(subtask);
  } catch (error) {
    next(error);
  }
});

// Delete subtask
app.delete('/api/subtasks/:id', async (req, res, next) => {
  try {
    const result = await subtaskService.deleteSubtask(req.params.id, req.user.id, req.user.userType);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// ============================================
// ACTIVITY API
// ============================================

// Get recent activity
app.get('/api/activity', async (req, res, next) => {
  try {
    const limit = (parseInt(req.query.limit) || 50);
    const activities = await activityService.getRecentActivity(limit);
    
    // Format activities with human-readable messages
    const formatted = activities.map(a => ({
      ...a,
      message: activityService.formatActivityMessage(a)
    }));
    
    res.json(formatted);
  } catch (error) {
    next(error);
  }
});

// Get "What's New" - changes since last visit (assigned to you only)
app.get('/api/activity/whats-new', async (req, res, next) => {
  try {
    const { since } = req.query;
    
    if (!since) {
      return res.status(400).json({ error: 'since parameter is required' });
    }
    
    const activities = await activityService.getActivitiesAssignedToUser(req.user.id, since);
    
    // Format activities with messages
    const formattedActivities = activities.map(a => ({
      ...a,
      message: activityService.formatActivityMessage(a)
    }));
    
    const summary = {
      totalChanges: activities.length,
      recentActivities: formattedActivities
    };
    
    res.json(summary);
  } catch (error) {
    next(error);
  }
});

// ============================================
// USERS API
// ============================================

// List all users (for assignment dropdowns)
app.get('/api/users', async (req, res, next) => {
  try {
    const users = await authService.listUsers();
    res.json(users);
  } catch (error) {
    next(error);
  }
});

// Enhanced error handling middleware
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  console.error('Stack:', err.stack);
  
  // Database errors
  if (err.message.includes('not found')) {
    return res.status(404).json({
      error: err.message,
      path: req.path
    });
  }
  
  // Validation errors
  if (err.message.includes('required') || 
      err.message.includes('Invalid') ||
      err.message.includes('must be')) {
    return res.status(400).json({
      error: err.message,
      path: req.path
    });
  }
  
  // Default server error
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler (should be last)
app.use((req, res) => {
  res.status(404).json({
    error: 'Endpoint not found',
    path: req.path,
    availableEndpoints: '/api'
  });
});

// Session cleanup cron job (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    const result = await authService.cleanExpiredSessions();
    console.log(`[CRON] Cleaned up ${result.deleted} expired sessions`);
  } catch (error) {
    console.error('[CRON] Session cleanup failed:', error.message);
  }
});

// Start server with error handling
const server = app.listen(PORT, () => {
  console.log(`🚀 TaskPulse API running on http://localhost:${PORT}`);
  console.log(`📊 API documentation: http://localhost:${PORT}/api`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
  console.log(`🔐 Authentication enabled (session + bot token)`);
});

// Handle server errors gracefully
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Please kill the process using this port or use a different port.`);
    process.exit(1);
  } else {
    console.error('❌ Server error:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('\n📴 SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('\n📴 SIGINT received, shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

export default app;
