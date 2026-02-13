#!/usr/bin/env node

// Set CLI mode to suppress database output
process.env.CLI_MODE = '1';

import { getDatabase } from './lib/database.js';
import authService from './lib/auth.js';
import projectService from './lib/projects.js';
import taskService from './lib/tasks.js';
import subtaskService from './lib/subtasks.js';

// Get API token from environment or command line
const API_TOKEN = process.env.TASKPULSE_API_TOKEN;

// Parse command line arguments
const [command, subcommand, ...args] = process.argv.slice(2);

// Authenticate as bot before executing commands
async function authenticate() {
  if (!API_TOKEN) {
    throw new Error('TASKPULSE_API_TOKEN environment variable is required');
  }

  if (!API_TOKEN.startsWith('bot_')) {
    throw new Error('Invalid token format. Bot tokens must start with "bot_"');
  }

  return await authService.authenticateBot(API_TOKEN);
}

// Check permissions
function checkPermissions(user, required) {
  if (user.userType === 'human') return true; // Humans have all permissions
  if (user.permissions.includes('admin')) return true;
  return user.permissions.includes(required);
}

// Main command router
async function main() {
  let user = null;

  try {
    // Authenticate first
    user = await authenticate();

    if (!command) {
      printHelp(user);
      process.exit(0);
    }

    switch (command.toLowerCase()) {
      case 'help':
      case '--help':
      case '-h':
        printHelp(user);
        break;

      case 'whoami':
        output({
          authenticated: true,
          user: {
            id: user.id,
            username: user.username,
            fullName: user.fullName,
            userType: user.userType,
            permissions: user.permissions
          }
        });
        break;

      case 'projects':
        await handleProjects(subcommand, args, user);
        break;

      case 'project':
        await handleProject(subcommand, args, user);
        break;

      case 'tasks':
        await handleTasks(subcommand, args, user);
        break;

      case 'task':
        await handleTask(subcommand, args, user);
        break;

      case 'subtasks':
        await handleSubtasks(subcommand, args, user);
        break;

      case 'subtask':
        await handleSubtask(subcommand, args, user);
        break;

      case 'status':
        await handleStatus(user);
        break;

      default:
        console.error(JSON.stringify({
          error: `Unknown command: ${command}`,
          hint: 'Run "cli-api.js help" for available commands'
        }, null, 2));
        process.exit(1);
    }
  } catch (error) {
    console.error(JSON.stringify({
      error: error.message,
      stack: process.env.DEBUG ? error.stack : undefined
    }, null, 2));
    process.exit(1);
  }
}

// Helper to parse command line flags
function parseFlags(args) {
  const flags = {};
  const remaining = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        flags[key] = nextArg;
        i++; // Skip next arg since we consumed it
      } else {
        flags[key] = true;
      }
    } else {
      remaining.push(arg);
    }
  }

  return { flags, remaining };
}

// Output helper - always JSON for AI parsing
function output(data) {
  console.log(JSON.stringify(data, null, 2));
}

// Help documentation
function printHelp(user) {
  const help = {
    name: 'TaskPulse CLI API',
    version: '2.0.0',
    description: 'Authenticated CLI for TaskPulse with bot token support',
    usage: 'TASKPULSE_API_TOKEN=your_bot_token cli-api.js <command> [subcommand] [options]',
    authentication: {
      type: user.userType,
      permissions: user.permissions,
      note: 'Bot tokens are set via TASKPULSE_API_TOKEN environment variable'
    },
    commands: {
      whoami: {
        description: 'Show current authenticated user info',
        usage: 'cli-api.js whoami'
      },
      status: {
        description: 'Show overview of all projects and tasks',
        usage: 'cli-api.js status',
        permissions: ['read']
      },
      projects: {
        description: 'List all projects',
        usage: 'cli-api.js projects [--status active|archived]',
        permissions: ['read'],
        examples: [
          'cli-api.js projects',
          'cli-api.js projects --status active'
        ]
      },
      project: {
        description: 'Manage individual projects',
        subcommands: {
          add: 'cli-api.js project add <name> [--description "text"]',
          get: 'cli-api.js project get <id>',
          full: 'cli-api.js project full <id>  # Get project with all tasks',
          update: 'cli-api.js project update <id> --name "New Name"',
          archive: 'cli-api.js project archive <id>',
          delete: 'cli-api.js project delete <id>'
        },
        permissions: {
          get: ['read'],
          add: ['create_projects'],
          update: ['admin'],
          archive: ['admin'],
          delete: ['admin']
        }
      },
      tasks: {
        description: 'List tasks with filters',
        usage: 'cli-api.js tasks [--project <id>] [--status pending|in-progress|done] [--priority low|medium|high]',
        permissions: ['read'],
        examples: [
          'cli-api.js tasks',
          'cli-api.js tasks --project 1',
          'cli-api.js tasks --status pending',
          'cli-api.js tasks --project 1 --status in-progress',
          'cli-api.js tasks --priority high'
        ]
      },
      task: {
        description: 'Manage individual tasks',
        subcommands: {
          add: 'cli-api.js task add <project-id> <title> [--description "text"] [--priority low|medium|high]',
          get: 'cli-api.js task get <id>',
          full: 'cli-api.js task full <id>  # Get task with subtasks',
          update: 'cli-api.js task update <id> --title "New Title"',
          start: 'cli-api.js task start <id>',
          complete: 'cli-api.js task complete <id>',
          reopen: 'cli-api.js task reopen <id>',
          delete: 'cli-api.js task delete <id>'
        },
        permissions: {
          get: ['read'],
          add: ['create_tasks'],
          update: ['update_tasks'],
          start: ['update_tasks'],
          complete: ['update_tasks'],
          reopen: ['update_tasks'],
          delete: ['delete_tasks']
        }
      },
      subtasks: {
        description: 'List subtasks for a task',
        usage: 'cli-api.js subtasks <task-id>',
        permissions: ['read']
      },
      subtask: {
        description: 'Manage subtasks',
        subcommands: {
          add: 'cli-api.js subtask add <task-id> <question> [--options "opt1,opt2,opt3"]',
          answer: 'cli-api.js subtask answer <id> <selected-option>',
          delete: 'cli-api.js subtask delete <id>'
        },
        permissions: {
          get: ['read'],
          add: ['create_tasks'],
          answer: ['update_tasks'],
          delete: ['delete_tasks']
        }
      }
    },
    examples: [
      '# Show current user',
      'TASKPULSE_API_TOKEN=bot_xxx cli-api.js whoami',
      '',
      '# Create a project',
      'TASKPULSE_API_TOKEN=bot_xxx cli-api.js project add "My Project" --description "This is my project"',
      '',
      '# Add a task',
      'TASKPULSE_API_TOKEN=bot_xxx cli-api.js task add 1 "Build feature" --priority high',
      '',
      '# Start working on a task',
      'TASKPULSE_API_TOKEN=bot_xxx cli-api.js task start 5',
      '',
      '# List all pending tasks',
      'TASKPULSE_API_TOKEN=bot_xxx cli-api.js tasks --status pending',
      '',
      '# Add a subtask with options',
      'TASKPULSE_API_TOKEN=bot_xxx cli-api.js subtask add 5 "Which approach?" --options "Option A,Option B,Option C"',
      '',
      '# Answer a subtask',
      'TASKPULSE_API_TOKEN=bot_xxx cli-api.js subtask answer 3 "Option A"'
    ]
  };

  output(help);
}

// Project commands
async function handleProjects(subcommand, args, user) {
  checkPermissions(user, 'read');

  const { flags } = parseFlags(args);
  const filters = { ownerId: user.ownerId || user.id };

  if (flags.status) {
    filters.status = flags.status;
  }

  const projects = await projectService.getProjects(filters);
  output(projects);
}

async function handleProject(subcommand, args, user) {
  const { flags, remaining } = parseFlags(args);

  switch (subcommand) {
    case 'add':
    case 'create': {
      checkPermissions(user, 'create_projects');
      const name = remaining.join(' ');
      if (!name) {
        throw new Error('Project name is required');
      }

      const projectData = {
        teamId: user.teamId,
        ownerId: user.ownerId || user.id,
        createdBy: user.id,
        name,
        description: flags.description || ''
      };

      const project = await projectService.createProject(projectData);
      output({
        success: true,
        message: 'Project created',
        project
      });
      break;
    }

    case 'get': {
      checkPermissions(user, 'read');
      const id = remaining[0];
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await projectService.getProject(id);
      output(project);
      break;
    }

    case 'full': {
      checkPermissions(user, 'read');
      const id = remaining[0];
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await projectService.getProjectWithTasks(id);
      output(project);
      break;
    }

    case 'update': {
      checkPermissions(user, 'admin');
      const id = remaining[0];
      if (!id) {
        throw new Error('Project ID is required');
      }

      const updates = {};
      if (flags.name) updates.name = flags.name;
      if (flags.description) updates.description = flags.description;
      if (flags.status) updates.status = flags.status;

      if (Object.keys(updates).length === 0) {
        throw new Error('At least one field to update is required (--name, --description, --status)');
      }

      const project = await projectService.updateProject(id, updates);
      output({
        success: true,
        message: 'Project updated',
        project
      });
      break;
    }

    case 'archive': {
      checkPermissions(user, 'admin');
      const id = remaining[0];
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await projectService.archiveProject(id);
      output({
        success: true,
        message: 'Project archived',
        project
      });
      break;
    }

    case 'delete': {
      checkPermissions(user, 'admin');
      const id = remaining[0];
      if (!id) {
        throw new Error('Project ID is required');
      }

      await projectService.deleteProject(id);
      output({
        success: true,
        message: 'Project deleted',
        id: parseInt(id)
      });
      break;
    }

    default:
      throw new Error(`Unknown project subcommand: ${subcommand}`);
  }
}

// Task commands
async function handleTasks(subcommand, args, user) {
  checkPermissions(user, 'read');

  const { flags } = parseFlags(args);
  const filters = { ownerId: user.ownerId || user.id };

  if (flags.project) {
    filters.projectId = parseInt(flags.project);
  }
  if (flags.status) {
    filters.status = flags.status;
  }
  if (flags.priority) {
    filters.priority = flags.priority;
  }

  const tasks = await taskService.getTasks(filters);
  output(tasks);
}

async function handleTask(subcommand, args, user) {
  const { flags, remaining } = parseFlags(args);

  switch (subcommand) {
    case 'add':
    case 'create': {
      checkPermissions(user, 'create_tasks');
      const projectId = remaining[0];
      const title = remaining.slice(1).join(' ');

      if (!projectId || !title) {
        throw new Error('Project ID and title are required: task add <project-id> <title>');
      }

      const taskData = {
        teamId: user.teamId,
        ownerId: user.ownerId || user.id,
        projectId: parseInt(projectId),
        title,
        description: flags.description || '',
        priority: flags.priority || 'medium',
        status: flags.status || 'pending',
        createdBy: user.id,
        actorId: user.id,
        actorType: user.userType
      };

      const task = await taskService.createTask(taskData);
      output({
        success: true,
        message: 'Task created',
        task
      });
      break;
    }

    case 'get': {
      checkPermissions(user, 'read');
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.getTask(id);
      output(task);
      break;
    }

    case 'full': {
      checkPermissions(user, 'read');
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.getTaskWithSubtasks(id);
      output(task);
      break;
    }

    case 'update': {
      checkPermissions(user, 'update_tasks');
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const updates = {};
      if (flags.title) updates.title = flags.title;
      if (flags.description) updates.description = flags.description;
      if (flags.status) updates.status = flags.status;
      if (flags.priority) updates.priority = flags.priority;

      if (Object.keys(updates).length === 0) {
        throw new Error('At least one field to update is required');
      }

      const task = await taskService.updateTask(id, updates);
      output({
        success: true,
        message: 'Task updated',
        task
      });
      break;
    }

    case 'start': {
      checkPermissions(user, 'update_tasks');
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.startTask(id, user.id, user.userType);
      output({
        success: true,
        message: 'Task started',
        task
      });
      break;
    }

    case 'complete':
    case 'done': {
      checkPermissions(user, 'update_tasks');
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.completeTask(id, user.id, user.userType);
      output({
        success: true,
        message: 'Task completed',
        task
      });
      break;
    }

    case 'reopen': {
      checkPermissions(user, 'update_tasks');
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.reopenTask(id, user.id, user.userType);
      output({
        success: true,
        message: 'Task reopened',
        task
      });
      break;
    }

    case 'delete': {
      checkPermissions(user, 'delete_tasks');
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      await taskService.deleteTask(id, user.id, user.userType);
      output({
        success: true,
        message: 'Task deleted',
        id: parseInt(id)
      });
      break;
    }

    default:
      throw new Error(`Unknown task subcommand: ${subcommand}`);
  }
}

// Subtask commands
async function handleSubtasks(subcommand, args, user) {
  checkPermissions(user, 'read');

  const taskId = args[0];
  if (!taskId) {
    throw new Error('Task ID is required');
  }

  const subtasks = await subtaskService.getSubtasks(parseInt(taskId));
  output(subtasks);
}

async function handleSubtask(subcommand, args, user) {
  const { flags, remaining } = parseFlags(args);

  switch (subcommand) {
    case 'add':
    case 'create': {
      checkPermissions(user, 'create_tasks');
      const taskId = remaining[0];
      const question = remaining.slice(1).join(' ');

      if (!taskId || !question) {
        throw new Error('Task ID and question are required: subtask add <task-id> <question>');
      }

      const options = flags.options 
        ? flags.options.split(',').map(o => o.trim())
        : [];

      const subtaskData = {
        taskId: parseInt(taskId),
        question,
        options,
        actorId: user.id,
        actorType: user.userType,
        type: 'multiple_choice',
        providedFile: 'no_file',
        fileReference: null
      };

      const subtask = await subtaskService.createSubtask(subtaskData);
      output({
        success: true,
        message: 'Subtask created',
        subtask
      });
      break;
    }

    case 'get': {
      checkPermissions(user, 'read');
      const id = remaining[0];
      if (!id) {
        throw new Error('Subtask ID is required');
      }

      const subtask = await subtaskService.getSubtask(id);
      output(subtask);
      break;
    }

    case 'answer': {
      checkPermissions(user, 'update_tasks');
      const id = remaining[0];
      const selectedOption = remaining.slice(1).join(' ');

      if (!id || !selectedOption) {
        throw new Error('Subtask ID and selected option are required');
      }

      const subtask = await subtaskService.answerSubtask(parseInt(id), selectedOption, user.id, user.userType);
      output({
        success: true,
        message: 'Subtask answered',
        subtask
      });
      break;
    }

    case 'update': {
      checkPermissions(user, 'update_tasks');
      const id = remaining[0];
      if (!id) {
        throw new Error('Subtask ID is required');
      }

      const updates = {};
      if (flags.question) updates.question = flags.question;
      if (flags.options) {
        updates.options = flags.options.split(',').map(o => o.trim());
      }

      if (Object.keys(updates).length === 0) {
        throw new Error('At least one field to update is required');
      }

      const subtask = await subtaskService.updateSubtask(id, updates, user.id, user.userType);
      output({
        success: true,
        message: 'Subtask updated',
        subtask
      });
      break;
    }

    case 'delete': {
      checkPermissions(user, 'delete_tasks');
      const id = remaining[0];
      if (!id) {
        throw new Error('Subtask ID is required');
      }

      await subtaskService.deleteSubtask(id, user.id, user.userType);
      output({
        success: true,
        message: 'Subtask deleted',
        id: parseInt(id)
      });
      break;
    }

    default:
      throw new Error(`Unknown subtask subcommand: ${subcommand}`);
  }
}

// Status overview
async function handleStatus(user) {
  checkPermissions(user, 'read');

  const ownerId = user.ownerId || user.id;
  
  // Get all projects
  const projects = await projectService.getProjects({ ownerId, status: 'active' });
  
  // Get tasks summary
  const allTasks = await taskService.getTasks({ ownerId });
  
  const tasksByStatus = {
    pending: allTasks.filter(t => t.status === 'pending').length,
    'in-progress': allTasks.filter(t => t.status === 'in-progress').length,
    done: allTasks.filter(t => t.status === 'done').length
  };

  const tasksByPriority = {
    high: allTasks.filter(t => t.priority === 'high').length,
    medium: allTasks.filter(t => t.priority === 'medium').length,
    low: allTasks.filter(t => t.priority === 'low').length
  };

  // Get project summaries
  const projectSummaries = await Promise.all(
    projects.map(async (project) => {
      const projectTasks = await taskService.getTasks({ ownerId, projectId: project.id });
      return {
        id: project.id,
        name: project.name,
        totalTasks: projectTasks.length,
        pending: projectTasks.filter(t => t.status === 'pending').length,
        inProgress: projectTasks.filter(t => t.status === 'in-progress').length,
        done: projectTasks.filter(t => t.status === 'done').length
      };
    })
  );

  const status = {
    summary: {
      totalProjects: projects.length,
      totalTasks: allTasks.length,
      tasksByStatus,
      tasksByPriority
    },
    projects: projectSummaries,
    timestamp: new Date().toISOString()
  };

  output(status);
}

main();