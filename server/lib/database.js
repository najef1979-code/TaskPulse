import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db = null;

export async function getDatabase() {
  if (db) return db;
  
  db = await open({
    filename: path.join(__dirname, '../taskpulse.db'),
    driver: sqlite3.Database
  });
  
  // If database doesn't exist at project root, try server directory
  const fs = await import('fs');
  if (!fs.existsSync(path.join(__dirname, '../taskpulse.db'))) {
    await db.close();
    db = await open({
      filename: path.join(__dirname, 'taskpulse.db'),
      driver: sqlite3.Database
    });
  }
  
  await initializeSchema();
  return db;
}

async function initializeSchema() {
  // Create schema with authentication (IF NOT EXISTS to preserve data)
  await db.exec(`
    -- Teams table
    CREATE TABLE IF NOT EXISTS teams (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      created_by INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (created_by) REFERENCES users(id)
    );

    -- Team requests for approvals
    CREATE TABLE IF NOT EXISTS team_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      responded_at DATETIME,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(team_id, user_id)
    );

    -- Users table (both humans and bots)
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE,
      password_hash TEXT,
      full_name TEXT,
      user_type TEXT DEFAULT 'human',
      api_token TEXT UNIQUE,
      owner_user_id INTEGER,
      team_id INTEGER REFERENCES teams(id),
      is_team_admin INTEGER DEFAULT 0,
      permissions TEXT,
      is_active INTEGER DEFAULT 1,
      last_login DATETIME,
      last_visit DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (owner_user_id) REFERENCES users(id)
    );

    -- Sessions for human users
    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      expires_at DATETIME NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Projects table with team reference
    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      created_by INTEGER REFERENCES users(id),
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'active',
      due_date DATETIME,
      start_date DATETIME,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Tasks table with team reference
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      team_id INTEGER NOT NULL,
      owner_id INTEGER NOT NULL,
      project_id INTEGER NOT NULL,
      created_by INTEGER REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'pending',
      priority TEXT DEFAULT 'medium',
      assigned_to INTEGER,
      due_date DATETIME,
      start_date DATETIME,
      completed_at DATETIME,
      provided_file TEXT DEFAULT 'no_file',
      file_reference TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
      FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Activity log
    CREATE TABLE IF NOT EXISTS activity_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      actor_id INTEGER,
      actor_type TEXT,
      action_type TEXT NOT NULL,
      entity_type TEXT NOT NULL,
      entity_id INTEGER NOT NULL,
      entity_name TEXT,
      details TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (actor_id) REFERENCES users(id)
    );

    -- Subtasks table (with assignments)
    CREATE TABLE IF NOT EXISTS subtasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER NOT NULL,
      question TEXT NOT NULL,
      options TEXT,
      selected_option TEXT,
      answered INTEGER DEFAULT 0,
      type TEXT DEFAULT 'multiple_choice',
      provided_file TEXT DEFAULT 'no_file',
      file_reference TEXT,
      assigned_to INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE,
      FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
    CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
    CREATE INDEX IF NOT EXISTS idx_team_requests_team ON team_requests(team_id);
    CREATE INDEX IF NOT EXISTS idx_team_requests_user ON team_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_team_requests_status ON team_requests(status);
    CREATE INDEX IF NOT EXISTS idx_users_type ON users(user_type);
    CREATE INDEX IF NOT EXISTS idx_users_owner ON users(owner_user_id);
    CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
    CREATE INDEX IF NOT EXISTS idx_sessions_expires ON sessions(expires_at);
    CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
    CREATE INDEX IF NOT EXISTS idx_projects_owner ON projects(owner_id);
    CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
    CREATE INDEX IF NOT EXISTS idx_projects_due_date ON projects(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_project ON tasks(project_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_owner ON tasks(owner_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_team ON tasks(team_id);
    CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
    CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);
    CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON tasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);
    CREATE INDEX IF NOT EXISTS idx_subtasks_task ON subtasks(task_id);
    CREATE INDEX IF NOT EXISTS idx_subtasks_assigned ON subtasks(assigned_to);
    CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_log(created_at);
    CREATE INDEX IF NOT EXISTS idx_activity_actor ON activity_log(actor_id);
    CREATE INDEX IF NOT EXISTS idx_activity_entity ON activity_log(entity_type, entity_id);
  `);
  
  // Only log to stderr so it doesn't interfere with JSON output
  if (process.env.DEBUG || !process.env.CLI_MODE) {
    console.error('✓ Database schema initialized with authentication support');
  }
}

export async function closeDatabase() {
  if (db) {
    await db.close();
    db = null;
  }
}