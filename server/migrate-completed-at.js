import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  console.log('Starting migration: Add completed_at column to tasks table...');
  
  try {
    // Direct database connection without schema initialization
    const db = await open({
      filename: path.join(__dirname, 'taskpulse.db'),
      driver: sqlite3.Database
    });
    
    // Check if completed_at column already exists
    const tableInfo = await db.all("PRAGMA table_info(tasks)");
    const hasCompletedAt = tableInfo.some(col => col.name === 'completed_at');
    
    if (!hasCompletedAt) {
      console.log('Adding completed_at column...');
      await db.run('ALTER TABLE tasks ADD COLUMN completed_at DATETIME');
      console.log('✓ completed_at column added');
    } else {
      console.log('✓ completed_at column already exists');
    }
    
    // For existing tasks that are already done, set completed_at to updated_at
    try {
      console.log('Setting completed_at for existing done tasks...');
      const result = await db.run(
        "UPDATE tasks SET completed_at = updated_at WHERE status = 'done' AND completed_at IS NULL"
      );
      
      if (result.changes > 0) {
        console.log(`✓ Set completed_at for ${result.changes} existing done tasks`);
      } else {
        console.log('✓ No existing done tasks needed updating');
      }
    } catch (updateError) {
      console.log('⚠️  Could not update existing tasks:', updateError.message);
    }
    
    // Check if index exists
    const indexes = await db.all("SELECT name FROM sqlite_master WHERE type='index' AND name='idx_tasks_completed_at'");
    
    if (indexes.length > 0) {
      console.log('✓ Index idx_tasks_completed_at already exists');
    } else {
      console.log('Creating index on completed_at...');
      await db.run('CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at)');
      console.log('✓ Index created');
    }
    
    console.log('\n✅ Migration completed successfully!');
    await db.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

migrate();