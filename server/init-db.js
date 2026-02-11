import { getDatabase } from './lib/database.js';
import authService from './lib/auth.js';

async function init() {
  console.log('Initializing database...');
  
  try {
    const db = await getDatabase();
    console.log('✓ Database connected');
    
    // Create admin user
    const admin = await authService.register({
      username: 'admin',
      password: 'admin123',
      email: 'admin@taskpulse.local',
      full_name: 'Admin User'
    });
    
    console.log('✓ Created admin user:');
    console.log('  Username: admin');
    console.log('  Password: admin123');
    console.log('  Email:', admin.email);
    console.log('\nYou can change these credentials after logging in.');
    
    await db.close();
    console.log('✓ Database initialized successfully');
    process.exit(0);
  } catch (error) {
    if (error.message.includes('already exists')) {
      console.log('⚠️  Admin user already exists');
      process.exit(0);
    }
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

init();