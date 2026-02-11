import { getDatabase, closeDatabase } from './lib/database.js';
import authService from './lib/auth.js';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function migrateExistingData() {
  console.log('🔄 Migrating existing data to team-based system...\n');
  
  try {
    const db = await getDatabase();
    
    // Step 1: List available human users
    const humans = await db.all(
      "SELECT id, username, email, team_id FROM users WHERE user_type = 'human' AND is_active = 1"
    );
    
    if (humans.length === 0) {
      console.log('❌ No human users found. Please create a human user first using: node user-cli.js');
      process.exit(1);
    }
    
    console.log('Available human users:');
    humans.forEach((user, index) => {
      const teamInfo = user.team_id ? `[Team ID: ${user.team_id}]` : '[No team]';
      console.log(`  ${index + 1}. ${user.username} (${user.email}) ${teamInfo}`);
    });
    
    const userChoice = await question('\nSelect user number to migrate data for: ');
    const userIndex = parseInt(userChoice) - 1;
    
    if (isNaN(userIndex) || userIndex < 0 || userIndex >= humans.length) {
      console.log('\n❌ Invalid selection');
      process.exit(1);
    }
    
    const selectedUser = humans[userIndex];
    
    if (!selectedUser.team_id) {
      console.log(`\n❌ User "${selectedUser.username}" is not in a team.`);
      console.log('   Please create a team for this user first using: node user-cli.js');
      process.exit(1);
    }
    
    console.log(`\n✓ Selected user: ${selectedUser.username}`);
    console.log(`✓ Team ID: ${selectedUser.team_id}`);
    
    // Step 2: Count data to migrate
    const projects = await db.all(
      'SELECT id, name, owner_id, team_id FROM projects WHERE 1=1'
    );
    
    const tasks = await db.all(
      'SELECT id, title, owner_id, project_id, team_id FROM tasks WHERE 1=1'
    );
    
    const projectCount = projects.length;
    const taskCount = tasks.length;
    
    if (projectCount === 0 && taskCount === 0) {
      console.log('\n✅ No data to migrate. Database is already clean or empty.');
      await closeDatabase();
      rl.close();
      process.exit(0);
    }
    
    console.log(`\n📊 Data to migrate:`);
    console.log(`   Projects: ${projectCount}`);
    console.log(`   Tasks: ${taskCount}`);
    
    // Step 3: Confirm migration
    const confirm = await question(
      `\n⚠️  This will update ${projectCount} project(s) and ${taskCount} task(s) to belong to team ${selectedUser.team_id}.\n` +
      `   Are you sure? (yes/no): `
    );
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Migration cancelled');
      await closeDatabase();
      rl.close();
      process.exit(0);
    }
    
    // Step 4: Migrate projects
    console.log('\n🔄 Migrating projects...');
    let migratedProjects = 0;
    for (const project of projects) {
      if (!project.team_id) {
        await db.run(
          'UPDATE projects SET team_id = ?, owner_id = ?, created_by = ? WHERE id = ?',
          [selectedUser.team_id, selectedUser.id, selectedUser.id, project.id]
        );
        migratedProjects++;
        console.log(`   ✓ Project "${project.name}" migrated`);
      }
    }
    
    // Step 5: Migrate tasks
    console.log('\n🔄 Migrating tasks...');
    let migratedTasks = 0;
    for (const task of tasks) {
      if (!task.team_id) {
        await db.run(
          'UPDATE tasks SET team_id = ?, owner_id = ?, created_by = ? WHERE id = ?',
          [selectedUser.team_id, selectedUser.id, selectedUser.id, task.id]
        );
        migratedTasks++;
        console.log(`   ✓ Task "${task.title}" migrated`);
      }
    }
    
    console.log('\n✅ Migration completed successfully!');
    console.log(`   Projects migrated: ${migratedProjects}`);
    console.log(`   Tasks migrated: ${migratedTasks}`);
    console.log(`   Team ID: ${selectedUser.team_id}`);
    console.log(`   User: ${selectedUser.username}`);
    
    await closeDatabase();
    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    await closeDatabase();
    rl.close();
    process.exit(1);
  }
}

migrateExistingData();