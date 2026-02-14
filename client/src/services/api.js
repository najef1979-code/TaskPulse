// Detect environment and set appropriate backend URL
// Use environment variables with fallbacks for flexibility
const externalDomain = import.meta.env.VITE_EXTERNAL_DOMAIN || 'taskpulse.ceraimic.eu';
const localIp = import.meta.env.VITE_LOCAL_IP || 'localhost';

// Determine if we're accessing from external domain or local network
const isExternal = window.location.hostname === externalDomain;

// Set backend URL based on environment detection
// External: https://TaskPAPI.{domain} (replaces subdomain with TaskPAPI)
// Example: taskpulse.ceraimic.eu → TaskPAPI.ceraimic.eu
// Local: http://{localIp}:3000
const backendUrl = isExternal 
  ? `https://TaskPAPI.${externalDomain.split('.').slice(1).join('.')}`
  : `http://${localIp}:3000`;

// Allow manual override via VITE_API_URL (optional)
const API_URL = import.meta.env.VITE_API_URL || `${backendUrl}/api`;

// Store a logout handler for auth errors
let logoutHandler = null;

export function setLogoutHandler(handler) {
  logoutHandler = handler;
}

async function request(method, path, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include', // Send cookies for authentication
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${path}`, options);
  
  if (!response.ok) {
    const error = await response.json();
    
    // Handle 401 Unauthorized - session expired or not authenticated
    if (response.status === 401) {
      if (logoutHandler) {
        logoutHandler();
      }
    }
    
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
}

// Authentication
export const authApi = {
  register: (userData) => request('POST', '/auth/register', userData),
  login: (username, password) => request('POST', '/auth/login', { username, password }),
  logout: () => request('POST', '/auth/logout'),
  getMe: () => request('GET', '/auth/me'),
  updatePassword: (oldPassword, newPassword) => request('POST', '/auth/update-password', { oldPassword, newPassword }),
  updateLastVisit: () => request('POST', '/auth/update-last-visit'),
};

// Bots
export const botsApi = {
  getAll: () => request('GET', '/bots'),
  create: (data) => request('POST', '/bots', data),
  getOne: (id) => request('GET', `/bots/${id}`),
  update: (id, data) => request('PUT', `/bots/${id}`, data),
  regenerateToken: (id) => request('POST', `/bots/${id}/regenerate-token`),
  deactivate: (id) => request('POST', `/bots/${id}/deactivate`),
  delete: (id) => request('DELETE', `/bots/${id}`),
};

// Projects
export const projectsApi = {
  getAll: () => request('GET', '/projects'),
  getOne: (id) => request('GET', `/projects/${id}`),
  getFull: (id) => request('GET', `/projects/${id}/full`),
  create: (data) => request('POST', '/projects', data),
  update: (id, data) => request('PUT', `/projects/${id}`, data),
  archive: (id) => request('POST', `/projects/${id}/archive`),
  delete: (id) => request('DELETE', `/projects/${id}`),
};

// Tasks
export const tasksApi = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return request('GET', `/tasks?${params}`);
  },
  getOne: (id) => request('GET', `/tasks/${id}`),
  getFull: (id) => request('GET', `/tasks/${id}/full`),
  create: (data) => request('POST', '/tasks', data),
  update: (id, data) => request('PUT', `/tasks/${id}`, data),
  start: (id) => request('POST', `/tasks/${id}/start`),
  complete: (id) => request('POST', `/tasks/${id}/complete`),
  reopen: (id) => request('POST', `/tasks/${id}/reopen`),
  assign: (id, assignedTo) => request('POST', `/tasks/${id}/assign`, { assignedTo }),
  delete: (id) => request('DELETE', `/tasks/${id}`),
  getOverdue: () => request('GET', '/tasks/overdue'),
  getDueSoon: (days = 7) => request('GET', `/tasks/due-soon?days=${days}`),
  getDueToday: () => request('GET', '/tasks/due-today'),
};

// Subtasks
export const subtasksApi = {
  getForTask: (taskId) => request('GET', `/tasks/${taskId}/subtasks`),
  getOne: (id) => request('GET', `/subtasks/${id}`),
  create: (data) => request('POST', '/subtasks', data),
  answer: (id, selectedOption) => request('POST', `/subtasks/${id}/answer`, { selectedOption }),
  update: (id, data) => request('PUT', `/subtasks/${id}`, data),
  delete: (id) => request('DELETE', `/subtasks/${id}`),
};

// Activity
export const activityApi = {
  getRecent: (limit = 50) => request('GET', `/activity?limit=${limit}`),
  getWhatsNew: (since) => request('GET', `/activity/whats-new?since=${encodeURIComponent(since)}`),
};

// Users
export const usersApi = {
  getAll: () => request('GET', '/users'),
};
