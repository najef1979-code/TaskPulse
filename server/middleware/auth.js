import authService from '../lib/auth.js';

export async function requireAuth(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  const apiToken = req.headers['x-api-token'];
  
  let user = null;
  
  // Try bot authentication first (API token)
  if (apiToken) {
    try {
      user = await authService.authenticateBot(apiToken);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid bot token' });
    }
  }
  // Then try session authentication (human users)
  else if (sessionId) {
    user = await authService.validateSession(sessionId);
  }
  
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized - Please log in' });
  }
  
  req.user = user;
  next();
}

export async function optionalAuth(req, res, next) {
  const sessionId = req.cookies?.sessionId;
  const apiToken = req.headers['x-api-token'];
  
  if (apiToken) {
    try {
      req.user = await authService.authenticateBot(apiToken);
    } catch (err) {
      // Silent fail for optional auth
    }
  } else if (sessionId) {
    req.user = await authService.validateSession(sessionId);
  }
  
  next();
}

export async function requireHuman(req, res, next) {
  if (!req.user || req.user.userType !== 'human') {
    return res.status(403).json({ 
      error: 'This action requires a human user account' 
    });
  }
  next();
}

export function checkPermission(permission) {
  return (req, res, next) => {
    // Humans have all permissions
    if (req.user.userType === 'human') {
      return next();
    }
    
    // Check bot permissions
    if (req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }
    
    return res.status(403).json({ 
      error: `Missing required permission: ${permission}` 
    });
  };
}