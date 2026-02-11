import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrateToTeams() {
  console.log('🔄 Migrating to team-based system...\n');
  
  const dbPath = path.join(__dirname, '../taskpulse.db');
  const dbPathAlt = path.join(__dirname, 'taskpulse.db');
  
  // Check which path has the database
  const fs = await import('fs');
  let finalDbPath = dbPath;
  if (!fs.existsSync(dbPath)) {
    finalDbPath = dbPathAlt;
  }
  
  console.log(`📂 Using database: ${finalDbPath}\n`);
  
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(finalDbPath, async (err) => {
      if (err) {
        console.error('❌ Failed to open database:', err.message);
        process.exit(1);
      }
      
      try {
        // Step 1: Create new tables
        console.log('📋 Creating teams table...');
        await runAsync(db, `
          CREATE TABLE IF NOT EXISTS teams (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            created_by INTEGER NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (created_by) REFERENCES users(id)
          );
        `);
        console.log('  ✓ teams table created');
        
        console.log('📋 Creating team_requests table...');
        await runAsync(db, `
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
        `);
        console.log('  ✓ team_requests table created');
        
        // Step 2: Add columns to existing tables
        console.log('📋 Adding columns to users table...');
        try {
          await runAsync(db, 'ALTER TABLE users ADD COLUMN team_id INTEGER;');
          console.log('  ✓ Added team_id to users');
        } catch (error) {
          if (error.message.includes('duplicate column name')) {
            console.log('  ⚠️  team_id already exists in users');
          } else {
            throw error;
          }
        }
        
        try {
          await runAsync(db, 'ALTER TABLE users ADD COLUMN is_team_admin INTEGER DEFAULT 0;');
          console.log('  ✓ Added is_team_admin to users');
        } catch (error) {
          if (error.message.includes('duplicate column name')) {
            console.log('  ⚠️  is_team_admin already exists in users');
          } else {
            throw error;
          }
        }
        
        console.log('📋 Adding columns to projects table...');
        try {
          await runAsync(db, 'ALTER TABLE projects ADD COLUMN team_id INTEGER;');
          console.log('  ✓ Added team_id to projects');
        } catch (error) {
          if (error.message.includes('duplicate column name')) {
            console.log('  ⚠️  team_id already exists in projects');
          } else {
            throw error;
          }
        }
        
        try {
          await runAsync(db, 'ALTER TABLE projects ADD COLUMN created_by INTEGER REFERENCES users(id);');
          console.log('  ✓ Added created_by to projects');
        } catch (error) {
          if (error.message.includes('duplicate column name')) {
            console.log('  ⚠️  created_by already exists in projects');
          } else {
            throw error;
          }
        }
        
        console.log('📋 Adding columns to tasks table...');
        try {
          await runAsync(db, 'ALTER TABLE tasks ADD COLUMN team_id INTEGER;');
          console.log('  ✓ Added team_id to tasks');
        } catch (error) {
          if (error.message.includes('duplicate column name')) {
            console.log('  ⚠️  team_id already exists in tasks');
          } else {
            throw error;
          }
        }
        
        try {
          await runAsync(db, 'ALTER TABLE tasks ADD COLUMN created_by INTEGER REFERENCES users(id);');
          console.log('  ✓ Added created_by to tasks');
        } catch (error) {
          if (error.message.includes('duplicate column name')) {
            console.log('  ⚠️  created_by already exists in tasks');
          } else {
            throw error;
          }
        }
        
        // Step 3: Create indexes for team tables
        console.log('📋 Creating indexes...');
        await runAsync(db, `
          CREATE INDEX IF NOT EXISTS idx_teams_name ON teams(name);
          CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);
          CREATE INDEX IF NOT EXISTS idx_team_requests_team ON team_requests(team_id);
          CREATE INDEX IF NOT EXISTS idx_team_requests_user ON team_requests(user_id);
          CREATE INDEX IF NOT EXISTS idx_team_requests_status ON team_requests(status);
          CREATE INDEX IF NOT EXISTS idx_users_team ON users(team_id);
          CREATE INDEX IF NOT EXISTS idx_projects_team ON projects(team_id);
          CREATE INDEX IF NOT EXISTS idx_tasks_team ON tasks(team_id);
        `);
        console.log('  ✓ All indexes created');
        
        console.log('\n✅ Database schema updated successfully!');
        console.log('\n📝 Next steps:');
        console.log('1. Create a new human user with a team name using: node user-cli.js');
        console.log('2. Use migration script to move existing data to new team: node migrate-existing-data.js');
        console.log('3. Add existing bots to team using: node user-cli.js (option 2)\n');
        
        db.close();
        process.exit(0);
      } catch (error) {
        console.error('❌ Migration failed:', error.message);
        console.error(error.stack);
        db.close();
        process.exit(1);
      }
    });
  });
}

function runAsync(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
}

migrateToTeams();