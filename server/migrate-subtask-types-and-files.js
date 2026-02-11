import { getDatabase } from './lib/database.js';

async function migrate() {
  console.log('🔄 Starting migration for subtask types and file tracking...\n');
  
  const db = await getDatabase();
  
  try {
    // Check if migration already ran by trying to query the column
    let migrationAlreadyRan = false;
    try {
      await db.get('SELECT provided_file FROM tasks LIMIT 1');
      migrationAlreadyRan = true;
    } catch (err) {
      // Column doesn't exist yet, that's expected
      migrationAlreadyRan = false;
    }
    
    if (migrationAlreadyRan) {
      console.log('✅ Migration already completed. Skipping.\n');
      process.exit(0);
    }

    // Add columns to tasks table
    console.log('Adding columns to tasks table...');
    await db.run(`
      ALTER TABLE tasks ADD COLUMN provided_file TEXT DEFAULT 'no_file'
    `);
    console.log('  ✓ Added provided_file column to tasks');
    
    await db.run(`
      ALTER TABLE tasks ADD COLUMN file_reference TEXT
    `);
    console.log('  ✓ Added file_reference column to tasks');
    
    // Add columns to subtasks table
    console.log('\nAdding columns to subtasks table...');
    await db.run(`
      ALTER TABLE subtasks ADD COLUMN type TEXT DEFAULT 'multiple_choice'
    `);
    console.log('  ✓ Added type column to subtasks');
    
    await db.run(`
      ALTER TABLE subtasks ADD COLUMN provided_file TEXT DEFAULT 'no_file'
    `);
    console.log('  ✓ Added provided_file column to subtasks');
    
    await db.run(`
      ALTER TABLE subtasks ADD COLUMN file_reference TEXT
    `);
    console.log('  ✓ Added file_reference column to subtasks');
    
    console.log('\n✅ Migration completed successfully!\n');
    console.log('New fields added:');
    console.log('Tasks:');
    console.log('  - provided_file (default: no_file)');
    console.log('  - file_reference (optional)');
    console.log('Subtasks:');
    console.log('  - type (default: multiple_choice)');
    console.log('  - provided_file (default: no_file)');
    console.log('  - file_reference (optional)\n');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    process.exit(1);
  }
}

// Run migration
migrate().then(() => {
  process.exit(0);
}).catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});