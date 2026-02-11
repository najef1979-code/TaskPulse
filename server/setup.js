#!/usr/bin/env node

import authService from './lib/auth.js';
import projectService from './lib/projects.js';
import { getDatabase } from './lib/database.js';
import readline from 'readline';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function checkEnvironment() {
  console.log('\n🔍 Checking environment...\n');

  // Check if .env file exists
  const envPath = path.join(__dirname, '.env');
  const envExamplePath = path.join(__dirname, '.env.example');

  if (!fs.existsSync(envPath)) {
    console.log('⚠️  .env file not found. Creating from .env.example...\n');
    
    if (fs.existsSync(envExamplePath)) {
      fs.copyFileSync(envExamplePath, envPath);
      console.log('✅ Created .env file. Please review and update it if needed.\n');
    } else {
      // Create a basic .env file
      const envContent = `# TaskPulse Environment Variables

# Server Configuration
PORT=3000
NODE_ENV=development

# Cookie Configuration (for production)
COOKIE_SECRET=change-this-to-a-random-string-in-production
`;
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Created .env file with defaults.\n');
    }
  }

  console.log('✅ Environment check complete.\n');
}

async function createAdminUser() {
  console.log('\n👤 Create Admin User\n');
  console.log('This will be your primary human user account.\n');

  const username = await question('Username (e.g., admin): ');
  const email = await question('Email: ');
  const password = await question('Password (min 6 characters): ');
  const fullName = await question('Full Name: ');

  try {
    const user = await authService.register({
      username: username.trim(),
      email: email.trim(),
      password: password.trim(),
      fullName: fullName.trim() || username.trim()
    });

    console.log('\n✅ Admin user created successfully!');
    console.log(`   Username: ${user.username}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Full Name: ${user.fullName}`);
    
    return user;
  } catch (error) {
    console.error(`\n❌ Error creating user: ${error.message}`);
    return null;
  }
}

async function createBotForUser(user) {
  console.log('\n🤖 Bot Configuration\n');
  console.log('Bots allow AI assistants to interact with TaskPulse via CLI.\n');

  console.log('Options:');
  console.log('  1. Create a new bot');
  console.log('  2. Use an existing bot token (verify and configure)');
  console.log('  3. Skip bot configuration');
  
  const choice = await question('\nSelect option (1-3): ');

  if (choice.trim() === '3') {
    return null;
  }

  if (choice.trim() === '2') {
    return await useExistingBotToken(user);
  }

  // Option 1: Create new bot
  return await createNewBot(user);
}

async function useExistingBotToken(user) {
  console.log('\n🔑 Use Existing Bot Token\n');
  console.log('Enter your existing bot API token to verify and configure it.\n');

  const apiToken = await question('Bot API Token (starts with "bot_"): ').trim();

  if (!apiToken || !apiToken.startsWith('bot_')) {
    console.error('\n❌ Invalid token format. Token must start with "bot_"');
    return null;
  }

  console.log('\n🔍 Verifying bot token...');
  
  try {
    const botUser = await authService.authenticateBot(apiToken);
    
    console.log('\n✅ Bot token verified successfully!');
    console.log(`   Username: ${botUser.username}`);
    console.log(`   Full Name: ${botUser.fullName}`);
    console.log(`   Permissions: ${botUser.permissions.join(', ')}`);
    console.log(`   Owner ID: ${botUser.ownerId}`);

    // Check if bot belongs to this user
    if (botUser.ownerId !== user.id) {
      console.log('\n⚠️  Warning: This bot belongs to a different user (ID: ' + botUser.ownerId + ')');
      const proceed = await question('Continue anyway? (y/n): ');
      if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        return null;
      }
    }

    console.log('\n✅ Bot configured successfully!');
    console.log(`   API Token: ${apiToken}`);
    console.log('\n   Add this to your environment:');
    console.log(`   export TASKPULSE_API_TOKEN="${apiToken}"`);
    
    // Save to .env file
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    // Update or add the token
    const tokenPattern = /TASKPULSE_API_TOKEN=.*/;
    if (tokenPattern.test(envContent)) {
      envContent = envContent.replace(tokenPattern, `TASKPULSE_API_TOKEN="${apiToken}"`);
    } else {
      envContent += `\n\n# Bot API Token (for CLI usage)\nTASKPULSE_API_TOKEN="${apiToken}"\n`;
    }
    fs.writeFileSync(envPath, envContent);
    console.log('\n✅ Added bot token to .env file');

    return {
      name: botUser.fullName,
      username: botUser.username,
      apiToken: apiToken,
      permissions: botUser.permissions
    };
  } catch (error) {
    console.error(`\n❌ Bot token verification failed: ${error.message}`);
    console.log('Please check:');
    console.log('  1. Token format (must start with "bot_")');
    console.log('  2. Token spelling and completeness');
    console.log('  3. Bot is active in the database');
    return null;
  }
}

async function createNewBot(user) {
  console.log('\n🤖 Create New Bot\n');

  const botName = await question('Bot Name (e.g., AI Assistant): ');
  
  console.log('\nAvailable Permissions:');
  console.log('  1. read - Read projects and tasks');
  console.log('  2. create_tasks - Create new tasks');
  console.log('  3. update_tasks - Update task status and details');
  console.log('  4. read,create_tasks,update_tasks (recommended)');
  console.log('  5. admin - Full administrative access');
  
  const choice = await question('\nSelect permission set (1-5): ');

  let permissions = ['read', 'create_tasks', 'update_tasks'];
  
  switch (choice.trim()) {
    case '1':
      permissions = ['read'];
      break;
    case '2':
      permissions = ['read', 'create_tasks'];
      break;
    case '3':
      permissions = ['read', 'update_tasks'];
      break;
    case '4':
      permissions = ['read', 'create_tasks', 'update_tasks'];
      break;
    case '5':
      permissions = ['admin'];
      break;
    default:
      console.log('Using default permissions: read, create_tasks, update_tasks');
  }

  try {
    const bot = await authService.createBot({
      name: botName.trim(),
      ownerId: user.id,
      permissions
    });

    console.log('\n✅ Bot created successfully!');
    console.log(`   Name: ${bot.name}`);
    console.log(`   Username: ${bot.username}`);
    console.log(`   Permissions: ${bot.permissions.join(', ')}`);
    console.log('\n⚠️  IMPORTANT - Save this API token securely:');
    console.log(`   ${bot.apiToken}`);
    console.log('\n   Add this to your environment:');
    console.log(`   export TASKPULSE_API_TOKEN="${bot.apiToken}"`);
    
    // Save to .env file if it doesn't exist there
    const envPath = path.join(__dirname, '.env');
    let envContent = fs.existsSync(envPath) ? fs.readFileSync(envPath, 'utf8') : '';
    
    if (!envContent.includes('TASKPULSE_API_TOKEN')) {
      envContent += `\n\n# Bot API Token (for CLI usage)\nTASKPULSE_API_TOKEN="${bot.apiToken}"\n`;
      fs.writeFileSync(envPath, envContent);
      console.log('\n✅ Added bot token to .env file');
    }

    return bot;
  } catch (error) {
    console.error(`\n❌ Error creating bot: ${error.message}`);
    return null;
  }
}

async function createSampleProject(user) {
  console.log('\n📊 Create Sample Project\n');

  const createProject = await question('Create a sample project to get started? (y/n): ');

  if (createProject.toLowerCase() !== 'y' && createProject.toLowerCase() !== 'yes') {
    return null;
  }

  const projectName = await question('Project Name: ');
  const description = await question('Description (optional): ');

  try {
    const project = await projectService.createProject({
      ownerId: user.id,
      name: projectName.trim(),
      description: description.trim()
    });

    console.log('\n✅ Sample project created!');
    console.log(`   Name: ${project.name}`);
    console.log(`   ID: ${project.id}`);
    
    return project;
  } catch (error) {
    console.error(`\n❌ Error creating project: ${error.message}`);
    return null;
  }
}

async function showNextSteps(user, bot) {
  console.log('\n\n' + '='.repeat(60));
  console.log('🎉 Setup Complete!');
  console.log('='.repeat(60));

  console.log('\n📚 What\'s Next?\n');

  console.log('1. Start the Server:');
  console.log('   npm run dev');
  console.log('   or');
  console.log('   node server.js');
  console.log('');

  console.log('2. Access the Web UI:');
  console.log('   http://localhost:3000/api');
  console.log('   (Start the React client in client/ directory)');
  console.log('');

  if (bot) {
    console.log('3. Use the CLI with your bot:');
    console.log(`   export TASKPULSE_API_TOKEN="${bot.apiToken}"`);
    console.log('   node cli-api.js whoami');
    console.log('   node cli-api.js status');
    console.log('   node cli-api.js projects');
    console.log('');
  }

  console.log('4. User Management:');
  console.log('   node user-cli.js');
  console.log('   - Create additional users');
  console.log('   - Manage bots');
  console.log('   - Reset passwords');
  console.log('');

  console.log('5. API Documentation:');
  console.log('   http://localhost:3000/api');
  console.log('');

  console.log('📖 Additional Resources:');
  console.log('   - AI Usage Guide: AI_USAGE.md');
  console.log('   - User Management CLI: node user-cli.js');
  console.log('   - Bot CLI: node cli-api.js (requires TASKPULSE_API_TOKEN)');
  console.log('');
}

async function main() {
  console.log('\n' + '='.repeat(60));
  console.log('🎛️  TaskPulse Setup Wizard');
  console.log('='.repeat(60));

  try {
    // Check environment
    await checkEnvironment();

    // Create admin user
    const user = await createAdminUser();
    if (!user) {
      console.log('\n❌ Setup failed. Please try again.\n');
      rl.close();
      process.exit(1);
    }

    // Create bot
    await sleep(500);
    const bot = await createBotForUser(user);

    // Create sample project
    await sleep(500);
    await createSampleProject(user);

    // Show next steps
    await sleep(500);
    await showNextSteps(user, bot);

    console.log('✅ Setup complete! You can now start using TaskPulse.\n');
    
    rl.close();
  } catch (error) {
    console.error('\n❌ Fatal error during setup:', error.message);
    if (process.env.DEBUG) {
      console.error(error.stack);
    }
    rl.close();
    process.exit(1);
  }
}

main();