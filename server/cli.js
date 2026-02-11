#!/usr/bin/env node

// Set CLI mode to suppress database output
process.env.CLI_MODE = '1';

import projectService from './lib/projects.js';
import taskService from './lib/tasks.js';
import subtaskService from './lib/subtasks.js';

// Parse command line arguments
const [command, subcommand, ...args] = process.argv.slice(2);

// Main command router
async function main() {
  try {
    if (!command) {
      printHelp();
      process.exit(0);
    }

    switch (command.toLowerCase()) {
      case 'help':
      case '--help':
      case '-h':
        printHelp();
        break;

      case 'projects':
        await handleProjects(subcommand, args);
        break;

      case 'project':
        await handleProject(subcommand, args);
        break;

      case 'tasks':
        await handleTasks(subcommand, args);
        break;

      case 'task':
        await handleTask(subcommand, args);
        break;

      case 'subtasks':
        await handleSubtasks(subcommand, args);
        break;

      case 'subtask':
        await handleSubtask(subcommand, args);
        break;

      case 'status':
        await handleStatus();
        break;

      default:
        console.error(JSON.stringify({
          error: `Unknown command: ${command}`,
          hint: 'Run "cli.js help" for available commands'
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
function printHelp() {
  const help = {
    name: 'TaskPulse CLI',
    version: '1.0.0',
    description: 'Command-line interface for TaskPulse project management',
    usage: 'cli.js <command> [subcommand] [options]',
    commands: {
      status: {
        description: 'Show overview of all projects and tasks',
        usage: 'cli.js status'
      },
      projects: {
        description: 'List all projects',
        usage: 'cli.js projects [--status active|archived]',
        examples: [
          'cli.js projects',
          'cli.js projects --status active'
        ]
      },
      project: {
        description: 'Manage individual projects',
        subcommands: {
          add: 'cli.js project add <name> [--description "text"]',
          get: 'cli.js project get <id>',
          full: 'cli.js project full <id>  # Get project with all tasks',
          update: 'cli.js project update <id> --name "New Name"',
          archive: 'cli.js project archive <id>',
          delete: 'cli.js project delete <id>'
        }
      },
      tasks: {
        description: 'List tasks with filters',
        usage: 'cli.js tasks [--project <id>] [--status pending|in-progress|done] [--priority low|medium|high]',
        examples: [
          'cli.js tasks',
          'cli.js tasks --project 1',
          'cli.js tasks --status pending',
          'cli.js tasks --project 1 --status in-progress',
          'cli.js tasks --priority high'
        ]
      },
      task: {
        description: 'Manage individual tasks',
        subcommands: {
          add: 'cli.js task add <project-id> <title> [--description "text"] [--priority low|medium|high]',
          get: 'cli.js task get <id>',
          full: 'cli.js task full <id>  # Get task with subtasks',
          update: 'cli.js task update <id> --title "New Title"',
          start: 'cli.js task start <id>',
          complete: 'cli.js task complete <id>',
          reopen: 'cli.js task reopen <id>',
          delete: 'cli.js task delete <id>'
        }
      },
      subtasks: {
        description: 'List subtasks for a task',
        usage: 'cli.js subtasks <task-id>'
      },
      subtask: {
        description: 'Manage subtasks',
        subcommands: {
          add: 'cli.js subtask add <task-id> <question> [--options "opt1,opt2,opt3"]',
          answer: 'cli.js subtask answer <id> <selected-option>',
          delete: 'cli.js subtask delete <id>'
        }
      }
    },
    examples: [
      '# Create a project',
      'cli.js project add "My Project" --description "This is my project"',
      '',
      '# Add a task',
      'cli.js task add 1 "Build feature" --priority high',
      '',
      '# Start working on a task',
      'cli.js task start 5',
      '',
      '# List all pending tasks',
      'cli.js tasks --status pending',
      '',
      '# Add a subtask with options',
      'cli.js subtask add 5 "Which approach?" --options "Option A,Option B,Option C"',
      '',
      '# Answer a subtask',
      'cli.js subtask answer 3 "Option A"'
    ]
  };

  output(help);
}

// Project commands
async function handleProjects(subcommand, args) {
  const { flags } = parseFlags(args);
  const filters = {};

  if (flags.status) {
    filters.status = flags.status;
  }

  const projects = await projectService.getProjects(filters);
  output(projects);
}

async function handleProject(subcommand, args) {
  const { flags, remaining } = parseFlags(args);

  switch (subcommand) {
    case 'add':
    case 'create': {
      const name = remaining.join(' ');
      if (!name) {
        throw new Error('Project name is required');
      }

      const projectData = {
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
      const id = remaining[0];
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await projectService.getProject(id);
      output(project);
      break;
    }

    case 'full': {
      const id = remaining[0];
      if (!id) {
        throw new Error('Project ID is required');
      }

      const project = await projectService.getProjectWithTasks(id);
      output(project);
      break;
    }

    case 'update': {
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
async function handleTasks(subcommand, args) {
  const { flags } = parseFlags(args);
  const filters = {};

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

async function handleTask(subcommand, args) {
  const { flags, remaining } = parseFlags(args);

  switch (subcommand) {
    case 'add':
    case 'create': {
      const projectId = remaining[0];
      const title = remaining.slice(1).join(' ');

      if (!projectId || !title) {
        throw new Error('Project ID and title are required: task add <project-id> <title>');
      }

      const taskData = {
        projectId: parseInt(projectId),
        title,
        description: flags.description || '',
        priority: flags.priority || 'medium',
        status: flags.status || 'pending'
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
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.getTask(id);
      output(task);
      break;
    }

    case 'full': {
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.getTaskWithSubtasks(id);
      output(task);
      break;
    }

    case 'update': {
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
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.startTask(id);
      output({
        success: true,
        message: 'Task started',
        task
      });
      break;
    }

    case 'complete':
    case 'done': {
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.completeTask(id);
      output({
        success: true,
        message: 'Task completed',
        task
      });
      break;
    }

    case 'reopen': {
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      const task = await taskService.reopenTask(id);
      output({
        success: true,
        message: 'Task reopened',
        task
      });
      break;
    }

    case 'delete': {
      const id = remaining[0];
      if (!id) {
        throw new Error('Task ID is required');
      }

      await taskService.deleteTask(id);
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
async function handleSubtasks(subcommand, args) {
  const taskId = args[0];
  if (!taskId) {
    throw new Error('Task ID is required');
  }

  const subtasks = await subtaskService.getSubtasks(parseInt(taskId));
  output(subtasks);
}

async function handleSubtask(subcommand, args) {
  const { flags, remaining } = parseFlags(args);

  switch (subcommand) {
    case 'add':
    case 'create': {
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
        options
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
      const id = remaining[0];
      if (!id) {
        throw new Error('Subtask ID is required');
      }

      const subtask = await subtaskService.getSubtask(id);
      output(subtask);
      break;
    }

    case 'answer': {
      const id = remaining[0];
      const selectedOption = remaining.slice(1).join(' ');

      if (!id || !selectedOption) {
        throw new Error('Subtask ID and selected option are required');
      }

      const subtask = await subtaskService.answerSubtask(parseInt(id), selectedOption);
      output({
        success: true,
        message: 'Subtask answered',
        subtask
      });
      break;
    }

    case 'update': {
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

      const subtask = await subtaskService.updateSubtask(id, updates);
      output({
        success: true,
        message: 'Subtask updated',
        subtask
      });
      break;
    }

    case 'delete': {
      const id = remaining[0];
      if (!id) {
        throw new Error('Subtask ID is required');
      }

      await subtaskService.deleteSubtask(id);
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
async function handleStatus() {
  // Get all projects
  const projects = await projectService.getProjects({ status: 'active' });
  
  // Get tasks summary
  const allTasks = await taskService.getTasks();
  
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
      const projectTasks = await taskService.getTasks({ projectId: project.id });
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