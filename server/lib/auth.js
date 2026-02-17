import crypto from 'crypto';
import { getDatabase } from './database.js';

class AuthService {
  // ============================================
  // PASSWORD UTILITIES
  // ============================================
  
  hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return `${salt}:${hash}`;
  }

  verifyPassword(password, storedHash) {
    const [salt, hash] = storedHash.split(':');
    const verifyHash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
    return hash === verifyHash;
  }

  generateApiToken() {
    return 'bot_' + crypto.randomBytes(32).toString('hex');
  }

  // ============================================
  // HUMAN USER MANAGEMENT
  // ============================================

  async register({ username, email, password, fullName }) {
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }

    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      throw new Error('Username can only contain letters, numbers, hyphens, and underscores');
    }

    const db = await getDatabase();
    
    // Check if user exists (case-insensitive)
    const existing = await db.get(
      `SELECT id FROM users 
       WHERE username = ? COLLATE NOCASE 
       OR email = ? COLLATE NOCASE`,
      [username, email]
    );
    
    if (existing) {
      throw new Error('Username or email already exists');
    }

    // Create human user
    const passwordHash = this.hashPassword(password);
    const result = await db.run(
      `INSERT INTO users (username, email, password_hash, full_name, user_type, is_active)
       VALUES (?, ?, ?, ?, 'human', 1)`,
      [username, email, passwordHash, fullName || username]
    );

    return { 
      id: result.lastID, 
      username, 
      email, 
      fullName: fullName || username,
      userType: 'human'
    };
  }

  async login(username, password) {
    const db = await getDatabase();
    
    const user = await db.get(
      `SELECT * FROM users 
       WHERE (username = ? COLLATE NOCASE OR email = ? COLLATE NOCASE) 
       AND user_type = 'human'
       AND is_active = 1`,
      [username, username]
    );

    if (!user || !this.verifyPassword(password, user.password_hash)) {
      throw new Error('Invalid credentials');
    }

    // Create session
    const sessionId = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await db.run(
      'INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)',
      [sessionId, user.id, expiresAt.toISOString()]
    );

    // Update last login
    await db.run(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    return {
      sessionId,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.full_name,
        userType: 'human',
        teamId: user.team_id,
        isTeamAdmin: Boolean(user.is_team_admin),
        lastVisit: user.last_visit
      }
    };
  }

  async logout(sessionId) {
    const db = await getDatabase();
    await db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }

  async validateSession(sessionId) {
    if (!sessionId) return null;

    const db = await getDatabase();
    const session = await db.get(
      `SELECT s.*, u.* FROM sessions s
       JOIN users u ON s.user_id = u.id
       WHERE s.id = ? 
       AND s.expires_at > datetime('now')
       AND u.is_active = 1`,
      [sessionId]
    );

    if (!session) return null;

    return {
      id: session.user_id,
      username: session.username,
      email: session.email,
      fullName: session.full_name,
      userType: 'human',
      teamId: session.team_id,
      isTeamAdmin: Boolean(session.is_team_admin),
      lastVisit: session.last_visit
    };
  }

  async updatePassword(userId, oldPassword, newPassword) {
    if (newPassword.length < 6) {
      throw new Error('New password must be at least 6 characters');
    }

    const db = await getDatabase();
    const user = await db.get(
      'SELECT * FROM users WHERE id = ? AND user_type = "human"',
      [userId]
    );

    if (!user) {
      throw new Error('User not found');
    }

    if (!this.verifyPassword(oldPassword, user.password_hash)) {
      throw new Error('Current password is incorrect');
    }

    const newHash = this.hashPassword(newPassword);
    await db.run(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newHash, userId]
    );

    return { success: true };
  }

  async resetPassword(userId, newPassword) {
    // For admin use or CLI - no old password check
    if (newPassword.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }

    const db = await getDatabase();
    const newHash = this.hashPassword(newPassword);
    
    await db.run(
      'UPDATE users SET password_hash = ? WHERE id = ? AND user_type = "human"',
      [newHash, userId]
    );

    return { success: true };
  }

  // ============================================
  // BOT MANAGEMENT
  // ============================================

  async createBot({ name, ownerId, permissions = ['read', 'create_tasks', 'update_tasks'] }) {
    if (!name) {
      throw new Error('Bot name is required');
    }

    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    // Generate username from name
    const username = name.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    const apiToken = this.generateApiToken();
    
    const db = await getDatabase();
    
    // Check if bot username already exists
    const existing = await db.get(
      'SELECT id FROM users WHERE username = ?',
      [username]
    );
    
    if (existing) {
      throw new Error('A bot with this name already exists');
    }

    const result = await db.run(
      `INSERT INTO users 
       (username, full_name, user_type, api_token, owner_user_id, permissions, is_active)
       VALUES (?, ?, 'bot', ?, ?, ?, 1)`,
      [username, name, apiToken, ownerId, JSON.stringify(permissions)]
    );
    
    return {
      id: result.lastID,
      name,
      username,
      apiToken,
      permissions,
      ownerId
    };
  }

  async authenticateBot(apiToken) {
    if (!apiToken || !apiToken.startsWith('bot_')) {
      throw new Error('Invalid bot token format');
    }

    const db = await getDatabase();
    
    const bot = await db.get(
      `SELECT * FROM users 
       WHERE user_type = 'bot' 
       AND api_token = ? 
       AND is_active = 1`,
      [apiToken]
    );
    
    if (!bot) {
      throw new Error('Invalid or inactive bot token');
    }
    
    // Note: last_login update removed to prevent database race conditions
    // that were causing intermittent authentication failures
    
    const owner = await db.get(
      'SELECT team_id FROM users WHERE id = ?',
      [bot.owner_user_id]
    );
    
    return {
      id: bot.id,
      username: bot.username,
      fullName: bot.full_name,
      userType: 'bot',
      teamId: owner ? owner.team_id : null,
      permissions: JSON.parse(bot.permissions || '[]'),
      ownerId: bot.owner_user_id
    };
  }

  async listBots(ownerId) {
    const db = await getDatabase();
    const bots = await db.all(
      `SELECT id, username, full_name, permissions, is_active, last_login, created_at 
       FROM users 
       WHERE user_type = 'bot' AND owner_user_id = ?
       ORDER BY created_at DESC`,
      [ownerId]
    );
    
    return bots.map(bot => ({
      ...bot,
      permissions: JSON.parse(bot.permissions || '[]')
    }));
  }

  async getBot(botId, ownerId) {
    const db = await getDatabase();
    const bot = await db.get(
      `SELECT id, username, full_name, api_token, permissions, is_active, last_login, created_at 
       FROM users 
       WHERE id = ? AND user_type = 'bot' AND owner_user_id = ?`,
      [botId, ownerId]
    );
    
    if (!bot) {
      throw new Error('Bot not found');
    }
    
    return {
      ...bot,
      permissions: JSON.parse(bot.permissions || '[]')
    };
  }

  async updateBot(botId, ownerId, updates) {
    const allowed = ['full_name', 'permissions', 'is_active'];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const db = await getDatabase();
    
    // Build update query
    const setClauses = [];
    const values = [];
    
    fields.forEach(field => {
      if (field === 'permissions') {
        setClauses.push('permissions = ?');
        values.push(JSON.stringify(updates.permissions));
      } else {
        setClauses.push(`${field} = ?`);
        values.push(updates[field]);
      }
    });
    
    values.push(botId, ownerId);
    
    await db.run(
      `UPDATE users 
       SET ${setClauses.join(', ')}
       WHERE id = ? AND user_type = 'bot' AND owner_user_id = ?`,
      values
    );
    
    return this.getBot(botId, ownerId);
  }

  async regenerateBotToken(botId, ownerId) {
    const newToken = this.generateApiToken();
    
    const db = await getDatabase();
    await db.run(
      `UPDATE users 
       SET api_token = ? 
       WHERE id = ? AND user_type = 'bot' AND owner_user_id = ?`,
      [newToken, botId, ownerId]
    );
    
    return { apiToken: newToken };
  }

  async deactivateBot(botId, ownerId) {
    const db = await getDatabase();
    await db.run(
      `UPDATE users 
       SET is_active = 0 
       WHERE id = ? AND user_type = 'bot' AND owner_user_id = ?`,
      [botId, ownerId]
    );
    
    return { success: true };
  }

  async deleteBot(botId, ownerId) {
    const db = await getDatabase();
    await db.run(
      `DELETE FROM users 
       WHERE id = ? AND user_type = 'bot' AND owner_user_id = ?`,
      [botId, ownerId]
    );
    
    return { success: true };
  }

  // ============================================
  // UTILITIES
  // ============================================

  async listUsers() {
    const db = await getDatabase();
    return db.all(
      `SELECT u.id, u.username, u.email, u.full_name, u.user_type, u.is_active, u.created_at, u.last_login,
             t.id as team_id, t.name as team_name
       FROM users u
       LEFT JOIN teams t ON u.team_id = t.id
       WHERE u.is_active = 1 AND u.user_type = 'human'
       ORDER BY u.created_at DESC`
    );
  }

  async getUserById(userId) {
    const db = await getDatabase();
    const user = await db.get(
      'SELECT id, username, email, full_name, user_type, is_active FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }

  async updateLastVisit(userId) {
    const db = await getDatabase();
    await db.run(
      'UPDATE users SET last_visit = CURRENT_TIMESTAMP WHERE id = ?',
      [userId]
    );
  }

  async cleanExpiredSessions() {
    const db = await getDatabase();
    const result = await db.run(
      "DELETE FROM sessions WHERE expires_at < datetime('now')"
    );
    return { deleted: result.changes };
  }

  // ============================================
  // TEAM MANAGEMENT
  // ============================================

  async createTeam({ name, ownerId }) {
    if (!name) {
      throw new Error('Team name is required');
    }

    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    const db = await getDatabase();
    
    // Check if team name already exists
    const existing = await db.get(
      'SELECT id FROM teams WHERE name = ?',
      [name]
    );
    
    if (existing) {
      throw new Error('Team name already exists');
    }

    const result = await db.run(
      'INSERT INTO teams (name, created_by) VALUES (?, ?)',
      [name, ownerId]
    );
    
    const teamId = result.lastID;
    
    // Set the creator as team admin and add to team
    await db.run(
      'UPDATE users SET team_id = ?, is_team_admin = 1 WHERE id = ?',
      [teamId, ownerId]
    );
    
    return {
      id: teamId,
      name,
      createdBy: ownerId
    };
  }

  async listTeams() {
    const db = await getDatabase();
    const teams = await db.all(
      `SELECT t.*, u.username as created_by_username, u.full_name as created_by_name
       FROM teams t
       JOIN users u ON t.created_by = u.id
       ORDER BY t.name ASC`
    );
    return teams;
  }

  async getTeam(teamId) {
    const db = await getDatabase();
    const team = await db.get(
      `SELECT t.*, u.username as created_by_username, u.full_name as created_by_name
       FROM teams t
       JOIN users u ON t.created_by = u.id
       WHERE t.id = ?`,
      [teamId]
    );
    
    if (!team) {
      throw new Error(`Team ${teamId} not found`);
    }
    
    return team;
  }

  async requestToJoinTeam({ teamId, userId }) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    if (!userId) {
      throw new Error('User ID is required');
    }

    const db = await getDatabase();
    
    // Check if team exists
    const team = await db.get('SELECT id FROM teams WHERE id = ?', [teamId]);
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Check if user already has a request or is already in team
    const existing = await db.get(
      `SELECT id FROM team_requests 
       WHERE team_id = ? AND user_id = ?`,
      [teamId, userId]
    );
    
    if (existing) {
      throw new Error('You already have a pending request or are already in this team');
    }
    
    const result = await db.run(
      'INSERT INTO team_requests (team_id, user_id, status) VALUES (?, ?, ?)',
      [teamId, userId, 'pending']
    );
    
    return {
      id: result.lastID,
      teamId,
      userId,
      status: 'pending'
    };
  }

  async approveTeamRequest(teamRequestId, adminUserId) {
    const db = await getDatabase();
    
    // Get the request
    const request = await db.get(
      `SELECT tr.*, t.name as team_name, u.username as requesting_username, u.full_name as requesting_name
       FROM team_requests tr
       JOIN teams t ON tr.team_id = t.id
       JOIN users u ON tr.user_id = u.id
       WHERE tr.id = ?`,
      [teamRequestId]
    );
    
    if (!request) {
      throw new Error('Request not found');
    }
    
    // Check if approver is a team admin
    const admin = await db.get(
      'SELECT is_team_admin FROM users WHERE id = ?',
      [adminUserId]
    );
    
    if (!admin || !admin.is_team_admin) {
      throw new Error('Only team admins can approve requests');
    }
    
    // Add user to team
    await db.run(
      'UPDATE users SET team_id = ? WHERE id = ?',
      [request.team_id, request.user_id]
    );
    
    // Update request status
    await db.run(
      'UPDATE team_requests SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['approved', teamRequestId]
    );
    
    return {
      teamId: request.team_id,
      userId: request.user_id,
      status: 'approved'
    };
  }

  async rejectTeamRequest(teamRequestId, adminUserId) {
    const db = await getDatabase();
    
    // Get the request
    const request = await db.get(
      `SELECT tr.*, t.name as team_name, u.username as requesting_username
       FROM team_requests tr
       JOIN teams t ON tr.team_id = t.id
       JOIN users u ON tr.user_id = u.id
       WHERE tr.id = ?`,
      [teamRequestId]
    );
    
    if (!request) {
      throw new Error('Request not found');
    }
    
    // Check if rejector is a team admin
    const admin = await db.get(
      'SELECT is_team_admin FROM users WHERE id = ?',
      [adminUserId]
    );
    
    if (!admin || !admin.is_team_admin) {
      throw new Error('Only team admins can reject requests');
    }
    
    // Update request status
    await db.run(
      'UPDATE team_requests SET status = ?, responded_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['rejected', teamRequestId]
    );
    
    return {
      teamId: request.team_id,
      userId: request.user_id,
      status: 'rejected'
    };
  }

  async getTeamRequests(teamId) {
    const db = await getDatabase();
    const requests = await db.all(
      `SELECT tr.*, u.username as requesting_username, u.full_name as requesting_name, u.user_type
       FROM team_requests tr
       JOIN users u ON tr.user_id = u.id
       WHERE tr.team_id = ? AND tr.status = 'pending'
       ORDER BY tr.created_at DESC`,
      [teamId]
    );
    return requests;
  }

  async addUserToTeam(teamId, userId) {
    const db = await getDatabase();
    
    // Verify team exists
    const team = await db.get('SELECT id FROM teams WHERE id = ?', [teamId]);
    if (!team) {
      throw new Error('Team not found');
    }
    
    // Add user to team (for bots added directly by owner)
    await db.run(
      'UPDATE users SET team_id = ? WHERE id = ?',
      [teamId, userId]
    );
    
    return { teamId, userId };
  }

  async removeUserFromTeam(userId, adminUserId) {
    const db = await getDatabase();
    
    // Get user being removed
    const user = await db.get('SELECT team_id, is_team_admin FROM users WHERE id = ?', [userId]);
    if (!user) {
      throw new Error('User not found');
    }
    
    // Check if remover is a team admin
    const admin = await db.get(
      'SELECT is_team_admin, team_id FROM users WHERE id = ?',
      [adminUserId]
    );
    
    if (!admin || !admin.is_team_admin) {
      throw new Error('Only team admins can remove members');
    }
    
    if (admin.team_id !== user.team_id) {
      throw new Error('You can only remove members from your own team');
    }
    
    // Remove user from team
    await db.run(
      'UPDATE users SET team_id = NULL, is_team_admin = 0 WHERE id = ?',
      [userId]
    );
    
    return { userId, removed: true };
  }
}

export default new AuthService();
