#!/usr/bin/env node

import authService from './lib/auth.js';
import projectService from './lib/projects.js';
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

async function registerUser() {
  console.log('\n📝 Register New Human User\n');
  
  const username = await question('Username: ');
  const email = await question('Email: ');
  const password = await question('Password: ');
  const fullName = await question('Full Name (optional): ');
  
  try {
    const user = await authService.register({
      username,
      email,
      password,
      fullName: fullName || undefined
    });
    
    // Always create a default team for CLI-created users
    // This ensures they can create and manage projects
    const defaultTeamName = `${username}'s Team`;
    const team = await authService.createTeam({
      name: defaultTeamName,
      ownerId: user.id
    });
    console.log('\n✅ Default team created successfully!');
    console.log(`   Team: ${team.name}`);
    
    console.log('\n✅ User created successfully!');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Full Name: ${user.fullName}`);
    console.log(`   Team: ${team.name}`);
    console.log(`   Role: Team Admin`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function createBot() {
  console.log('\n🤖 Create New Bot\n');
  
  const ownerUsername = await question('Owner Username: ');
  const botName = await question('Bot Name: ');
  
  const permissionsList = '\nAvailable Permissions:\n' +
    '  - read: Read projects and tasks\n' +
    '  - create_projects: Create new projects\n' +
    '  - create_tasks: Create new tasks\n' +
    '  - update_tasks: Update task status and details\n' +
    '  - delete_tasks: Delete tasks\n' +
    '  - manage_bots: Manage other bots\n' +
    '  - admin: Full administrative access\n';
  
  console.log(permissionsList);
  const permissionsInput = await question('Permissions (comma-separated, e.g. read,create_tasks): ');
  const permissions = permissionsInput.split(',').map(p => p.trim()).filter(p => p);
  
  try {
    // Get owner ID
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    const owner = await db.get(
      "SELECT id, team_id FROM users WHERE username = ? AND user_type = 'human'",
      [ownerUsername]
    );
    
    if (!owner) {
      throw new Error(`User "${ownerUsername}" not found`);
    }
    
    if (!owner.team_id) {
      throw new Error(`User "${ownerUsername}" is not in a team. Please add them to a team first.`);
    }
    
    // Create bot
    const bot = await authService.createBot({
      name: botName,
      ownerId: owner.id,
      permissions: permissions.length > 0 ? permissions : ['read', 'create_tasks', 'update_tasks']
    });
    
    // Add bot to owner's team
    await authService.addUserToTeam(owner.team_id, bot.id);
    
    console.log('\n✅ Bot created successfully!');
    console.log(`   Name: ${bot.name}`);
    console.log(`   Username: ${bot.username}`);
    console.log(`   API Token: ${bot.apiToken}`);
    console.log(`   Team: ${owner.team_id}`);
    console.log(`   Permissions: ${bot.permissions.join(', ')}`);
    console.log('\n⚠️  Save this API token securely - you will not see it again!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function listUsers() {
  console.log('\n👥 All Human Users\n');
  
  try {
    const users = await authService.listUsers();
    
    if (users.length === 0) {
      console.log('No users found.');
      return;
    }
    
    console.log('ID\tUsername\t\tEmail\t\t\tActive\tLast Login');
    console.log('─'.repeat(80));
    
    users.forEach(user => {
      const lastLogin = user.last_login ? 
        new Date(user.last_login).toLocaleDateString() : 'Never';
      
      console.log(
        `${user.id}\t${user.username}\t\t${user.email}\t${user.is_active ? '✓' : '✗'}\t${lastLogin}`
      );
    });
    
    console.log(`\nTotal: ${users.length} user(s)`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function listBots() {
  console.log('\n🤖 List Bots\n');
  
  const ownerUsername = await question('Owner Username (leave empty for all): ');
  
  try {
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    
    let query = `SELECT id, username, full_name, team_id, is_active, last_login, created_at,
                (SELECT username FROM users u WHERE u.id = bot.owner_user_id) as owner
                FROM users bot WHERE user_type = 'bot'`;
    const params = [];
    
    if (ownerUsername.trim()) {
      query += ` AND owner_user_id = (SELECT id FROM users WHERE username = ?)`;
      params.push(ownerUsername.trim());
    }
    
    query += ' ORDER BY created_at DESC';
    
    const bots = await db.all(query, params);
    
    if (bots.length === 0) {
      console.log('No bots found.');
      return;
    }
    
    console.log('ID\tName\t\t\tOwner\t\tTeam\tActive\tLast Used');
    console.log('─'.repeat(95));
    
    bots.forEach(bot => {
      const lastUsed = bot.last_login ? 
        new Date(bot.last_login).toLocaleDateString() : 'Never';
      const team = bot.team_id ? `#${bot.team_id}` : 'N/A';
      
      console.log(
        `${bot.id}\t${bot.full_name}\t\t${bot.owner || 'N/A'}\t${team}\t${bot.is_active ? '✓' : '✗'}\t${lastUsed}`
      );
    });
    
    console.log(`\nTotal: ${bots.length} bot(s)`);
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function resetPassword() {
  console.log('\n🔐 Reset User Password\n');
  
  const username = await question('Username: ');
  const newPassword = await question('New Password: ');
  
  try {
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    const user = await db.get(
      "SELECT id FROM users WHERE username = ? AND user_type = 'human'",
      [username]
    );
    
    if (!user) {
      throw new Error(`User "${username}" not found`);
    }
    
    await authService.resetPassword(user.id, newPassword);
    
    console.log('\n✅ Password reset successfully!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function regenerateBotToken() {
  console.log('\n🔄 Regenerate Bot Token\n');
  
  const botId = await question('Bot ID: ');
  const ownerUsername = await question('Owner Username (for verification): ');
  
  try {
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    const owner = await db.get(
      "SELECT id FROM users WHERE username = ? AND user_type = 'human'",
      [ownerUsername]
    );
    
    if (!owner) {
      throw new Error(`User "${ownerUsername}" not found`);
    }
    
    const result = await authService.regenerateBotToken(parseInt(botId), owner.id);
    
    console.log('\n✅ Bot token regenerated successfully!');
    console.log(`   New API Token: ${result.apiToken}`);
    console.log('\n⚠️  Save this API token securely - you will not see it again!');
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function removeHumanUser() {
  console.log('\n🗑️  Remove Human User\n');
  
  const username = await question('Username to remove: ');
  
  try {
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    
    // Get the user to be removed
    const userToRemove = await db.get(
      "SELECT id, username, full_name, team_id, is_team_admin FROM users WHERE username = ? AND user_type = 'human'",
      [username]
    );
    
    if (!userToRemove) {
      throw new Error(`User "${username}" not found`);
    }
    
    // Count what will be affected
    const ownedProjects = await db.get(
      "SELECT COUNT(*) as count FROM projects WHERE owner_id = ?",
      [userToRemove.id]
    );
    
    const ownedTasks = await db.get(
      "SELECT COUNT(*) as count FROM tasks WHERE owner_id = ?",
      [userToRemove.id]
    );
    
    const assignedTasks = await db.get(
      "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ?",
      [userToRemove.id]
    );
    
    const assignedSubtasks = await db.get(
      "SELECT COUNT(*) as count FROM subtasks WHERE assigned_to = ?",
      [userToRemove.id]
    );
    
    console.log(`\n📊 Impact Summary for ${userToRemove.full_name} (${userToRemove.username}):`);
    console.log(`   Projects owned: ${ownedProjects.count}`);
    console.log(`   Tasks owned: ${ownedTasks.count}`);
    console.log(`   Tasks assigned: ${assignedTasks.count}`);
    console.log(`   Subtasks assigned: ${assignedSubtasks.count}`);
    
    if (!userToRemove.team_id) {
      console.log('\n⚠️  User is not in a team. Content will be assigned to another user.');
      
      // Get list of other active human users for transfer
      const otherUsers = await db.all(
        "SELECT id, username, full_name FROM users WHERE user_type = 'human' AND is_active = 1 AND id != ?",
        [userToRemove.id]
      );
      
      if (otherUsers.length === 0) {
        throw new Error('No other active users available to transfer ownership');
      }
      
      console.log('\nAvailable users to transfer to:');
      otherUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.full_name} (${user.username})`);
      });
      
      const transferChoice = await question('\nSelect user number to transfer all content to (or 0 to cancel): ');
      const transferIndex = parseInt(transferChoice) - 1;
      
      if (isNaN(transferIndex) || transferIndex < 0 || transferIndex >= otherUsers.length) {
        console.log('\n❌ Operation cancelled');
        return;
      }
      
      const newOwner = otherUsers[transferIndex];
      
      // Confirm the transfer
      const confirm = await question(
        `\n⚠️  Confirm: Transfer all content from ${userToRemove.username} to ${newOwner.username}? (yes/no): `
      );
      
      if (confirm.toLowerCase() !== 'yes') {
        console.log('\n❌ Operation cancelled');
        return;
      }
      
      // Perform the transfer to another user
      await db.run('BEGIN TRANSACTION');
      
      try {
        // Transfer owned projects
        if (ownedProjects.count > 0) {
          await db.run(
            "UPDATE projects SET owner_id = ? WHERE owner_id = ?",
            [newOwner.id, userToRemove.id]
          );
          console.log(`   ✓ Transferred ${ownedProjects.count} project(s) to ${newOwner.username}`);
        }
        
        // Transfer owned tasks
        if (ownedTasks.count > 0) {
          await db.run(
            "UPDATE tasks SET owner_id = ? WHERE owner_id = ?",
            [newOwner.id, userToRemove.id]
          );
          console.log(`   ✓ Transferred ${ownedTasks.count} owned task(s) to ${newOwner.username}`);
        }
        
        // Transfer assigned tasks
        if (assignedTasks.count > 0) {
          await db.run(
            "UPDATE tasks SET assigned_to = ? WHERE assigned_to = ?",
            [newOwner.id, userToRemove.id]
          );
          console.log(`   ✓ Transferred ${assignedTasks.count} assigned task(s) to ${newOwner.username}`);
        }
        
        // Transfer assigned subtasks
        if (assignedSubtasks.count > 0) {
          await db.run(
            "UPDATE subtasks SET assigned_to = ? WHERE assigned_to = ?",
            [newOwner.id, userToRemove.id]
          );
          console.log(`   ✓ Transferred ${assignedSubtasks.count} assigned subtask(s) to ${newOwner.username}`);
        }
        
        // Delete user's sessions
        await db.run("DELETE FROM sessions WHERE user_id = ?", [userToRemove.id]);
        console.log(`   ✓ Deleted user sessions`);
        
        // Delete the user
        await db.run("DELETE FROM users WHERE id = ?", [userToRemove.id]);
        console.log(`   ✓ Deleted user account`);
        
        await db.run('COMMIT');
        
        console.log('\n✅ User removed successfully!');
        console.log(`   All content has been transferred to ${newOwner.full_name} (${newOwner.username})`);
      } catch (error) {
        await db.run('ROLLBACK');
        throw error;
      }
    } else {
      // User is in a team - find team admin to transfer to
      console.log(`\n👥 User is in team ${userToRemove.team_id}`);
      
      // Get team admins
      const teamAdmins = await db.all(
        "SELECT id, username, full_name FROM users WHERE team_id = ? AND is_team_admin = 1 AND user_type = 'human' AND is_active = 1 AND id != ?",
        [userToRemove.team_id, userToRemove.id]
      );
      
      // If no team admins, get any other team member
      let transferUsers = teamAdmins;
      if (teamAdmins.length === 0) {
        console.log('\n⚠️  No team admin found. Using another team member.');
        transferUsers = await db.all(
          "SELECT id, username, full_name FROM users WHERE team_id = ? AND user_type = 'human' AND is_active = 1 AND id != ?",
          [userToRemove.team_id, userToRemove.id]
        );
      }
      
      if (transferUsers.length === 0) {
        console.log('\n⚠️  No other team members available. Content will stay in team but become unassigned.');
        
        // Just clear assignments without transferring
        const confirm = await question(
          `\n⚠️  Confirm: Remove ${userToRemove.username}? Owned content will stay in team but become unassigned. (yes/no): `
        );
        
        if (confirm.toLowerCase() !== 'yes') {
          console.log('\n❌ Operation cancelled');
          return;
        }
        
        // Perform the removal
        await db.run('BEGIN TRANSACTION');
        
        try {
          // Clear task ownership
          if (ownedProjects.count > 0) {
            await db.run(
              "UPDATE projects SET owner_id = NULL WHERE owner_id = ?",
              [userToRemove.id]
            );
            console.log(`   ✓ Cleared ownership of ${ownedProjects.count} project(s)`);
          }
          
          if (ownedTasks.count > 0) {
            await db.run(
              "UPDATE tasks SET owner_id = NULL WHERE owner_id = ?",
              [userToRemove.id]
            );
            console.log(`   ✓ Cleared ownership of ${ownedTasks.count} owned task(s)`);
          }
          
          // Clear assignments
          if (assignedTasks.count > 0) {
            await db.run(
              "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = ?",
              [userToRemove.id]
            );
            console.log(`   ✓ Cleared ${assignedTasks.count} task assignment(s)`);
          }
          
          if (assignedSubtasks.count > 0) {
            await db.run(
              "UPDATE subtasks SET assigned_to = NULL WHERE assigned_to = ?",
              [userToRemove.id]
            );
            console.log(`   ✓ Cleared ${assignedSubtasks.count} subtask assignment(s)`);
          }
          
          // Delete user's sessions
          await db.run("DELETE FROM sessions WHERE user_id = ?", [userToRemove.id]);
          console.log(`   ✓ Deleted user sessions`);
          
          // Delete the user
          await db.run("DELETE FROM users WHERE id = ?", [userToRemove.id]);
          console.log(`   ✓ Deleted user account`);
          
          await db.run('COMMIT');
          
          console.log('\n✅ User removed successfully!');
          console.log(`   Content remains in team but is now unassigned`);
        } catch (error) {
          await db.run('ROLLBACK');
          throw error;
        }
      } else {
        console.log('\nTeam members available to transfer content to:');
        transferUsers.forEach((user, index) => {
          const isAdmin = userToRemove.team_id && teamAdmins.some(a => a.id === user.id);
          const badge = isAdmin ? ' [Team Admin]' : '';
          console.log(`   ${index + 1}. ${user.full_name} (${user.username})${badge}`);
        });
        
        const transferChoice = await question('\nSelect team member number to transfer content to (or 0 to cancel): ');
        const transferIndex = parseInt(transferChoice) - 1;
        
        if (isNaN(transferIndex) || transferIndex < 0 || transferIndex >= transferUsers.length) {
          console.log('\n❌ Operation cancelled');
          return;
        }
        
        const newOwner = transferUsers[transferIndex];
        
        // Confirm the transfer
        const confirm = await question(
          `\n⚠️  Confirm: Transfer all content from ${userToRemove.username} to ${newOwner.username} in the same team? (yes/no): `
        );
        
        if (confirm.toLowerCase() !== 'yes') {
          console.log('\n❌ Operation cancelled');
          return;
        }
        
        // Perform the transfer
        await db.run('BEGIN TRANSACTION');
        
        try {
          // Transfer owned projects
          if (ownedProjects.count > 0) {
            await db.run(
              "UPDATE projects SET owner_id = ? WHERE owner_id = ?",
              [newOwner.id, userToRemove.id]
            );
            console.log(`   ✓ Transferred ${ownedProjects.count} project(s) to ${newOwner.username}`);
          }
          
          // Transfer owned tasks
          if (ownedTasks.count > 0) {
            await db.run(
              "UPDATE tasks SET owner_id = ? WHERE owner_id = ?",
              [newOwner.id, userToRemove.id]
            );
            console.log(`   ✓ Transferred ${ownedTasks.count} owned task(s) to ${newOwner.username}`);
          }
          
          // Transfer assigned tasks
          if (assignedTasks.count > 0) {
            await db.run(
              "UPDATE tasks SET assigned_to = ? WHERE assigned_to = ?",
              [newOwner.id, userToRemove.id]
            );
            console.log(`   ✓ Transferred ${assignedTasks.count} assigned task(s) to ${newOwner.username}`);
          }
          
          // Transfer assigned subtasks
          if (assignedSubtasks.count > 0) {
            await db.run(
              "UPDATE subtasks SET assigned_to = ? WHERE assigned_to = ?",
              [newOwner.id, userToRemove.id]
            );
            console.log(`   ✓ Transferred ${assignedSubtasks.count} assigned subtask(s) to ${newOwner.username}`);
          }
          
          // Delete user's sessions
          await db.run("DELETE FROM sessions WHERE user_id = ?", [userToRemove.id]);
          console.log(`   ✓ Deleted user sessions`);
          
          // Delete the user
          await db.run("DELETE FROM users WHERE id = ?", [userToRemove.id]);
          console.log(`   ✓ Deleted user account`);
          
          await db.run('COMMIT');
          
          console.log('\n✅ User removed successfully!');
          console.log(`   All content has been transferred to ${newOwner.full_name} (${newOwner.username}) in the same team`);
        } catch (error) {
          await db.run('ROLLBACK');
          throw error;
        }
      }
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function removeBot() {
  console.log('\n🤖 Remove Bot\n');
  
  const botId = await question('Bot ID to remove: ');
  const ownerUsername = await question('Owner Username (for verification): ');
  
  try {
    const db = await import('./lib/database.js').then(m => m.getDatabase());
    
    // Verify owner exists
    const owner = await db.get(
      "SELECT id, username FROM users WHERE username = ? AND user_type = 'human'",
      [ownerUsername]
    );
    
    if (!owner) {
      throw new Error(`User "${ownerUsername}" not found`);
    }
    
    // Get the bot to be removed
    const bot = await db.get(
      "SELECT id, username, full_name FROM users WHERE id = ? AND user_type = 'bot' AND owner_user_id = ?",
      [parseInt(botId), owner.id]
    );
    
    if (!bot) {
      throw new Error(`Bot ID ${botId} not found or you don't have permission to remove it`);
    }
    
    // Count what will be affected
    const ownedProjects = await db.get(
      "SELECT COUNT(*) as count FROM projects WHERE owner_id = ?",
      [bot.id]
    );
    
    const ownedTasks = await db.get(
      "SELECT COUNT(*) as count FROM tasks WHERE owner_id = ?",
      [bot.id]
    );
    
    const assignedTasks = await db.get(
      "SELECT COUNT(*) as count FROM tasks WHERE assigned_to = ?",
      [bot.id]
    );
    
    const assignedSubtasks = await db.get(
      "SELECT COUNT(*) as count FROM subtasks WHERE assigned_to = ?",
      [bot.id]
    );
    
    console.log(`\n📊 Impact Summary for ${bot.full_name} (${bot.username}):`);
    console.log(`   Projects owned: ${ownedProjects.count}`);
    console.log(`   Tasks owned: ${ownedTasks.count}`);
    console.log(`   Tasks assigned: ${assignedTasks.count}`);
    console.log(`   Subtasks assigned: ${assignedSubtasks.count}`);
    
    // Only ask for transfer if there are owned projects or tasks
    // Bots typically don't own content, but we handle it just in case
    const hasOwnedContent = ownedProjects.count > 0 || ownedTasks.count > 0;
    const hasAssignments = assignedTasks.count > 0 || assignedSubtasks.count > 0;
    
    let transferToOwner = false;
    
    if (hasOwnedContent) {
      const transferOwned = await question(
        `\nBot owns ${ownedProjects.count} project(s) and ${ownedTasks.count} task(s). Transfer to owner (${owner.username})? (yes/no): `
      );
      transferToOwner = transferOwned.toLowerCase() === 'yes';
    }
    
    if (hasAssignments) {
      const transferAssigned = await question(
        `\nBot has ${assignedTasks.count} task(s) and ${assignedSubtasks.count} subtask(s) assigned. Transfer to owner (${owner.username})? (yes/no): `
      );
      
      if (transferAssigned.toLowerCase() === 'yes') {
        transferToOwner = true;
      }
    }
    
    if (!hasOwnedContent && !hasAssignments) {
      console.log('\n   No content to transfer');
    }
    
    // Confirm the removal
    const confirm = await question(
      `\n⚠️  Confirm: Remove bot ${bot.username}? (yes/no): `
    );
    
    if (confirm.toLowerCase() !== 'yes') {
      console.log('\n❌ Operation cancelled');
      return;
    }
    
    // Perform the transfer and deletion in a transaction
    await db.run('BEGIN TRANSACTION');
    
    try {
      // Transfer owned content if requested
      if (transferToOwner) {
        if (ownedProjects.count > 0) {
          await db.run(
            "UPDATE projects SET owner_id = ? WHERE owner_id = ?",
            [owner.id, bot.id]
          );
          console.log(`   ✓ Transferred ${ownedProjects.count} project(s)`);
        }
        
        if (ownedTasks.count > 0) {
          await db.run(
            "UPDATE tasks SET owner_id = ? WHERE owner_id = ?",
            [owner.id, bot.id]
          );
          console.log(`   ✓ Transferred ${ownedTasks.count} owned task(s)`);
        }
        
        if (assignedTasks.count > 0) {
          await db.run(
            "UPDATE tasks SET assigned_to = ? WHERE assigned_to = ?",
            [owner.id, bot.id]
          );
          console.log(`   ✓ Transferred ${assignedTasks.count} assigned task(s)`);
        }
        
        if (assignedSubtasks.count > 0) {
          await db.run(
            "UPDATE subtasks SET assigned_to = ? WHERE assigned_to = ?",
            [owner.id, bot.id]
          );
          console.log(`   ✓ Transferred ${assignedSubtasks.count} assigned subtask(s)`);
        }
      } else {
        // Just clear assignments without transferring
        if (assignedTasks.count > 0) {
          await db.run(
            "UPDATE tasks SET assigned_to = NULL WHERE assigned_to = ?",
            [bot.id]
          );
          console.log(`   ✓ Cleared ${assignedTasks.count} task assignment(s)`);
        }
        
        if (assignedSubtasks.count > 0) {
          await db.run(
            "UPDATE subtasks SET assigned_to = NULL WHERE assigned_to = ?",
            [bot.id]
          );
          console.log(`   ✓ Cleared ${assignedSubtasks.count} subtask assignment(s)`);
        }
        
        // Delete owned content if not transferred (with proper cascade)
        if (ownedProjects.count > 0) {
          // Get project IDs to cascade delete
          const projectsToDelete = await db.all(
            "SELECT id FROM projects WHERE owner_id = ?",
            [bot.id]
          );
          const projectIds = projectsToDelete.map(p => p.id);
          
          // Get task IDs to cascade delete
          const tasksToDelete = await db.all(
            "SELECT id FROM tasks WHERE project_id IN (" + projectIds.join(',') + ") OR owner_id = ?",
            [...projectIds, bot.id]
          );
          const taskIds = tasksToDelete.map(t => t.id);
          
          // Cascade delete: subtasks → tasks → projects
          if (taskIds.length > 0) {
            await db.run(
              `DELETE FROM subtasks WHERE task_id IN (${taskIds.join(',')})`
            );
          }
          if (projectIds.length > 0) {
            await db.run(
              `DELETE FROM tasks WHERE project_id IN (${projectIds.join(',')})`
            );
          }
          await db.run(
            "DELETE FROM projects WHERE owner_id = ?",
            [bot.id]
          );
          console.log(`   ✓ Deleted ${ownedProjects.count} project(s) with cascade`);
        }
        
        if (ownedTasks.count > 0) {
          // Get task IDs to cascade delete subtasks
          const tasksToDelete = await db.all(
            "SELECT id FROM tasks WHERE owner_id = ?",
            [bot.id]
          );
          const taskIds = tasksToDelete.map(t => t.id);
          
          // Cascade delete: subtasks → tasks
          if (taskIds.length > 0) {
            await db.run(
              `DELETE FROM subtasks WHERE task_id IN (${taskIds.join(',')})`
            );
          }
          await db.run(
            "DELETE FROM tasks WHERE owner_id = ?",
            [bot.id]
          );
          console.log(`   ✓ Deleted ${ownedTasks.count} owned task(s) with cascade`);
        }
      }
      
      // Delete the bot
      await db.run("DELETE FROM users WHERE id = ?", [bot.id]);
      console.log(`   ✓ Deleted bot account`);
      
      await db.run('COMMIT');
      
      console.log('\n✅ Bot removed successfully!');
    } catch (error) {
      await db.run('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`);
  }
}

async function showMenu() {
  console.log('\n🎛️  TaskPulse User Management CLI\n');
  console.log('1. Register new human user');
  console.log('2. Create new bot');
  console.log('3. List all users');
  console.log('4. List bots');
  console.log('5. Reset user password');
  console.log('6. Regenerate bot token');
  console.log('7. Remove human user');
  console.log('8. Remove bot');
  console.log('0. Exit\n');
  
  const choice = await question('Select an option: ');
  
  switch (choice.trim()) {
    case '1':
      await registerUser();
      break;
    case '2':
      await createBot();
      break;
    case '3':
      await listUsers();
      break;
    case '4':
      await listBots();
      break;
    case '5':
      await resetPassword();
      break;
    case '6':
      await regenerateBotToken();
      break;
    case '7':
      await removeHumanUser();
      break;
    case '8':
      await removeBot();
      break;
    case '0':
      console.log('\n👋 Goodbye!\n');
      rl.close();
      process.exit(0);
    default:
      console.log('\n❌ Invalid option\n');
  }
}

async function main() {
  try {
    await authService.listUsers(); // Initialize database
    while (true) {
      await showMenu();
    }
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();