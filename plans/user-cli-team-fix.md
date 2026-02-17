# User CLI Team Assignment Fix

## Problem Description

When creating a new user via [`server/user-cli.js`](server/user-cli.js:18), the user does not appear in the user list when running `listUsers()`.

### Root Cause Analysis

1. **User Registration Flow** ([`authService.register()`](server/lib/auth.js:29)):
   ```javascript
   // Creates user with user_type = 'human'
   // Does NOT set team_id
   const result = await db.run(
     `INSERT INTO users (username, email, password_hash, full_name, user_type, is_active)
      VALUES (?, ?, ?, ?, 'human', 1)`,
     [username, email, passwordHash, fullName || username]
   );
   ```

2. **User List Query** ([`authService.listUsers()`](server/lib/auth.js:395)):
   ```javascript
   // Only returns users WHERE is_active = 1 AND user_type = 'human'
   return db.all(
     `SELECT id, username, email, full_name, user_type, is_active, created_at, last_login
      FROM users
      WHERE is_active = 1 AND user_type = 'human'
      ORDER BY created_at DESC`
   );
   ```

3. **Task Assignment** ([`server/lib/tasks.js`](server/lib/tasks.js)):
   Tasks can be assigned to any user via `assigned_to` field
   Users without a `team_id` can still be assigned tasks

### Why User Doesn't Appear

The user is created successfully but has no `team_id`. When tasks are assigned to this user:
- The user exists in the database
- They can receive task assignments
- But they may not have visibility to projects/tasks depending on team-based access control

## Solution Options

### Option 1: Always Create a Team (Recommended)

Modify [`registerUser()`](server/user-cli.js:18) to always create a team when registering a user:

```javascript
async function registerUser() {
  // ... existing code ...

  let team = null;
  if (teamName.trim()) {
    team = await authService.createTeam({
      name: teamName.trim(),
      ownerId: user.id
    });
    console.log('\n✅ Team created successfully!');
  } else {
    // NEW: Create a default team named after user's username
    const defaultTeamName = `${username}'s Team`;
    team = await authService.createTeam({
      name: defaultTeamName,
      ownerId: user.id
    });
    console.log('\n✅ Default team created automatically!');
    console.log(`   Team: ${team.name}`);
  }

  console.log('\n✅ User created successfully!');
  // ... rest of code
}
```

**Pros:**
- Every user has a team
- Users can create and manage projects
- Consistent with team-based workflow
- No orphaned users

**Cons:**
- Creates unnecessary teams for single-user scenarios
- User might want to be team-free

### Option 2: Create Default Team Only for CLI Users

Add a flag to CLI that creates a team only for CLI-created users:

```javascript
async function registerUser() {
  // ... existing code ...

  let team = null;
  if (teamName.trim()) {
    team = await authService.createTeam({
      name: teamName.trim(),
      ownerId: user.id
    });
    console.log('\n✅ Team created successfully!');
    console.log(`   Team: ${team.name}`);
  } else {
    // NEW: Create a default team with a special flag
    const defaultTeamName = `${username}'s Team`;
    team = await authService.createTeam({
      name: defaultTeamName,
      ownerId: user.id
    });
    
    // NEW: Mark this user as CLI-created
    await db.run(
      'UPDATE users SET is_cli_user = 1 WHERE id = ?',
      [user.id]
    );
    
    console.log('\n✅ Default team created automatically!');
    console.log(`   Team: ${team.name}`);
  }
  // ... rest of code
}
```

Then update [`listUsers()`](server/lib/auth.js:395) to show CLI users:

```javascript
async listUsers() {
  const db = await getDatabase();
  const users = await db.all(
    `SELECT id, username, email, full_name, user_type, is_active, created_at, last_login, is_cli_user
     FROM users
     WHERE is_active = 1 AND user_type = 'human'
     ORDER BY created_at DESC`
  );
  
  // ... existing code
  
  users.forEach(user => {
    const cliBadge = user.is_cli_user ? ' [CLI]' : '';
    console.log(
      `${user.id}\t${user.username}\t\t${user.email}\t${cliBadge}\t${user.is_active ? '✓' : '✗'}\t${lastLogin}`
    );
  });
}
```

**Pros:**
- Distinguishes CLI-created users from web users
- Only creates teams for CLI users
- Web users can remain team-free

**Cons:**
- Requires database schema change (add `is_cli_user` column)
- More complex logic

### Option 3: Allow Team-Free Users (No Team Required)

Modify the application to support users without teams:

**Pros:**
- Most flexible
- Single users can work without teams

**Cons:**
- Requires significant application changes
- Team-based features would need fallback logic
- More complex access control

## Recommendation

**Use Option 1** - Always create a team when registering users via CLI.

This is the simplest solution that:
- Ensures CLI users can create and manage projects
- Maintains team-based workflow consistency
- Requires minimal code changes
