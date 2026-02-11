import { getDatabase } from './database.js';
import activityService from './activity.js';

class TaskService {
  async createTask({ 
    teamId,
    ownerId,
    createdBy,
    title, 
    projectId, 
    description = '', 
    priority = 'medium', 
    status = 'pending',
    assignedTo = null,
    dueDate = null,
    startDate = null,
    providedFile = 'no_file',
    fileReference = null,
    actorId = null,
    actorType = null
  }) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    if (!title || title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    
    if (title.length > 200) {
      throw new Error('Task title must be under 200 characters');
    }
    
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    
    const validPriorities = ['low', 'medium', 'high'];
    if (!validPriorities.includes(priority)) {
      throw new Error('Priority must be low, medium, or high');
    }

    const validStatuses = ['pending', 'in-progress', 'done'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Status must be pending, in-progress, or done');
    }

    if (dueDate && startDate && new Date(dueDate) < new Date(startDate)) {
      throw new Error('Due date cannot be before start date');
    }

    // Validate file fields
    const validProvidedFiles = ['no_file', 'emailed', 'on_disk'];
    if (!validProvidedFiles.includes(providedFile)) {
      throw new Error('Provided file must be no_file, emailed, or on_disk');
    }

    if ((providedFile === 'emailed' || providedFile === 'on_disk') && !fileReference) {
      throw new Error('File reference is required when provided_file is emailed or on_disk');
    }
    
    const db = await getDatabase();
    
    // Verify project exists
    const project = await db.get('SELECT id FROM projects WHERE id = ?', [projectId]);
    if (!project) {
      throw new Error(`Project ${projectId} not found`);
    }

    // Verify assignee exists if provided
    if (assignedTo) {
      const user = await db.get('SELECT id FROM users WHERE id = ?', [assignedTo]);
      if (!user) {
        throw new Error(`User ${assignedTo} not found`);
      }
    }
    
    const result = await db.run(
      `INSERT INTO tasks (team_id, owner_id, created_by, title, project_id, description, priority, status, assigned_to, due_date, start_date, provided_file, file_reference)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [teamId, ownerId, createdBy || null, title.trim(), projectId, description.trim(), priority, status, assignedTo, dueDate, startDate, providedFile, fileReference]
    );
    
    const task = await this.getTask(result.lastID);

    // Log activity
    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'task_created',
      entityType: 'task',
      entityId: task.id,
      entityName: task.title,
      details: { projectId, priority, status }
    });

    return task;
  }
  
  async getTask(id) {
    const db = await getDatabase();
    const task = await db.get(
      `SELECT t.*, u.username as assigned_to_username, u.full_name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.id = ?`,
      [id]
    );
    
    if (!task) {
      throw new Error(`Task ${id} not found`);
    }
    
    return task;
  }
  
  async getTasks(filters = {}) {
    const db = await getDatabase();
    let query = `
      SELECT t.*, u.username as assigned_to_username, u.full_name as assigned_to_name
      FROM tasks t
      LEFT JOIN users u ON t.assigned_to = u.id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.teamId) {
      query += ' AND t.team_id = ?';
      params.push(filters.teamId);
    }
    
    if (filters.projectId) {
      query += ' AND t.project_id = ?';
      params.push(filters.projectId);
    }
    
    if (filters.status) {
      query += ' AND t.status = ?';
      params.push(filters.status);
    }
    
    if (filters.priority) {
      query += ' AND t.priority = ?';
      params.push(filters.priority);
    }

    if (filters.assignedTo) {
      query += ' AND t.assigned_to = ?';
      params.push(filters.assignedTo);
    }

    // Date range filters
    if (filters.dueBefore) {
      query += ' AND t.due_date < ?';
      params.push(filters.dueBefore);
    }

    if (filters.dueAfter) {
      query += ' AND t.due_date > ?';
      params.push(filters.dueAfter);
    }

    if (filters.startDateBefore) {
      query += ' AND t.start_date < ?';
      params.push(filters.startDateBefore);
    }

    if (filters.startDateAfter) {
      query += ' AND t.start_date > ?';
      params.push(filters.startDateAfter);
    }

    // Search filter (searches in title and description)
    if (filters.search) {
      query += ' AND (t.title LIKE ? OR t.description LIKE ?)';
      const searchPattern = `%${filters.search}%`;
      params.push(searchPattern, searchPattern);
    }

    // Completion date filters
    if (filters.completedAfter) {
      query += ' AND t.completed_at > ?';
      params.push(filters.completedAfter);
    }

    if (filters.completedBefore) {
      query += ' AND t.completed_at < ?';
      params.push(filters.completedBefore);
    }

    if (filters.completedToday) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      query += ' AND t.completed_at BETWEEN ? AND ?';
      params.push(today.toISOString(), tomorrow.toISOString());
    }
    
    query += ' ORDER BY t.created_at DESC';
    
    return db.all(query, params);
  }
  
  async updateTask(id, updates, actorId = null, actorType = null) {
    const allowed = ['title', 'description', 'status', 'priority', 'assigned_to', 'due_date', 'start_date', 'provided_file', 'file_reference'];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    // Validate status if being updated
    if (updates.status) {
      const validStatuses = ['pending', 'in-progress', 'done'];
      if (!validStatuses.includes(updates.status)) {
        throw new Error('Status must be pending, in-progress, or done');
      }
    }

    // Validate dates if being updated
    if (updates.due_date && updates.start_date) {
      if (new Date(updates.due_date) < new Date(updates.start_date)) {
        throw new Error('Due date cannot be before start date');
      }
    }

    // Validate file fields if being updated
    if (updates.provided_file) {
      const validProvidedFiles = ['no_file', 'emailed', 'on_disk'];
      if (!validProvidedFiles.includes(updates.provided_file)) {
        throw new Error('Provided file must be no_file, emailed, or on_disk');
      }
    }

    // Validate file_reference based on provided_file
    const finalProvidedFile = updates.provided_file !== undefined ? updates.provided_file : (await this.getTask(id)).provided_file;
    const finalFileReference = updates.file_reference !== undefined ? updates.file_reference : (await this.getTask(id)).file_reference;
    
    if ((finalProvidedFile === 'emailed' || finalProvidedFile === 'on_disk') && !finalFileReference) {
      throw new Error('File reference is required when provided_file is emailed or on_disk');
    }

    // Get old task for logging and status transition detection
    const oldTask = await this.getTask(id);
    
    // Handle status transitions for completed_at
    let completedAtValue = oldTask.completed_at;
    if (updates.status && updates.status !== oldTask.status) {
      // Transition to 'done' - set completed_at
      if (updates.status === 'done') {
        completedAtValue = new Date().toISOString();
      }
      // Transition from 'done' - clear completed_at
      else if (oldTask.status === 'done') {
        completedAtValue = null;
      }
      // Add completed_at to updates for the query
      updates.completed_at = completedAtValue;
    }
    
    const allowedWithCompleted = [...allowed, 'completed_at'];
    const fieldsWithCompleted = Object.keys(updates).filter(k => allowedWithCompleted.includes(k));
    const setClause = fieldsWithCompleted.map(f => `${f} = ?`).join(', ');
    const values = [...fieldsWithCompleted.map(f => updates[f]), new Date().toISOString(), id];
    
    const db = await getDatabase();
    await db.run(
      `UPDATE tasks SET ${setClause}, updated_at = ? WHERE id = ?`,
      values
    );
    
    const task = await this.getTask(id);

    // Log activity
    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'task_updated',
      entityType: 'task',
      entityId: task.id,
      entityName: task.title,
      details: { 
        changes: fields,
        oldStatus: oldTask.status,
        newStatus: task.status
      }
    });

    return task;
  }
  
  async startTask(id, actorId = null, actorType = null) {
    const task = await this.updateTask(id, { status: 'in-progress' }, actorId, actorType);
    
    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'task_started',
      entityType: 'task',
      entityId: task.id,
      entityName: task.title
    });

    return task;
  }
  
  async completeTask(id, actorId = null, actorType = null) {
    const task = await this.updateTask(id, { status: 'done' }, actorId, actorType);
    
    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'task_completed',
      entityType: 'task',
      entityId: task.id,
      entityName: task.title
    });

    return task;
  }
  
  async reopenTask(id, actorId = null, actorType = null) {
    return this.updateTask(id, { status: 'pending' }, actorId, actorType);
  }

  async assignTask(id, assignedTo, actorId = null, actorType = null) {
    const db = await getDatabase();
    
    // Get assigned user info
    let assignedToName = null;
    if (assignedTo) {
      const user = await db.get('SELECT full_name, username FROM users WHERE id = ?', [assignedTo]);
      if (user) {
        assignedToName = user.full_name || user.username;
      }
    }

    const task = await this.updateTask(id, { assigned_to: assignedTo }, actorId, actorType);

    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'task_assigned',
      entityType: 'task',
      entityId: task.id,
      entityName: task.title,
      details: { assignedTo, assignedToName }
    });

    return task;
  }
  
  async deleteTask(id, actorId = null, actorType = null) {
    const db = await getDatabase();
    
    const subtasks = await db.all(
      'SELECT COUNT(*) as count FROM subtasks WHERE task_id = ?',
      [id]
    );
    
    const task = await this.getTask(id);
    
    console.error(`[DELETE] Task "${task.title}": ${subtasks[0].count} subtasks`);
    
    // Manual cascade delete: first delete subtasks, then task
    // This prevents orphaned data since schema doesn't have ON DELETE CASCADE
    await db.run('DELETE FROM subtasks WHERE task_id = ?', [id]);
    await db.run('DELETE FROM tasks WHERE id = ?', [id]);

    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'task_deleted',
      entityType: 'task',
      entityId: id,
      entityName: task.title
    });
    
    return { 
      id, 
      deleted: true,
      title: task.title,
      subtasksDeleted: subtasks[0].count
    };
  }
  
  async getTaskWithSubtasks(id) {
    const db = await getDatabase();
    const task = await this.getTask(id);
    const subtasks = await db.all(
      `SELECT s.*, u.username as assigned_to_username, u.full_name as assigned_to_name
       FROM subtasks s
       LEFT JOIN users u ON s.assigned_to = u.id
       WHERE s.task_id = ? 
       ORDER BY s.created_at ASC`,
      [id]
    );
    
    const parsedSubtasks = subtasks.map(st => ({
      ...st,
      options: st.options ? JSON.parse(st.options) : [],
      answered: Boolean(st.answered)
    }));
    
    return { ...task, subtasks: parsedSubtasks };
  }

  async getOverdueTasks(filters = {}) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    let query = `SELECT t.*, u.username as assigned_to_username, u.full_name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.due_date < ? 
       AND t.due_date IS NOT NULL 
       AND t.status != 'done'`;
    const params = [now];
    
    if (filters.teamId) {
      query += ' AND t.team_id = ?';
      params.push(filters.teamId);
    }
    
    if (filters.projectId) {
      query += ' AND t.project_id = ?';
      params.push(filters.projectId);
    }
    
    query += ' ORDER BY t.due_date ASC';
    
    return db.all(query, params);
  }

  async getTasksDueSoon(days = 7, filters = {}) {
    const db = await getDatabase();
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    let query = `SELECT t.*, u.username as assigned_to_username, u.full_name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.due_date BETWEEN ? AND ? 
       AND t.status != 'done'`;
    const params = [now.toISOString(), future.toISOString()];
    
    if (filters.teamId) {
      query += ' AND t.team_id = ?';
      params.push(filters.teamId);
    }
    
    if (filters.projectId) {
      query += ' AND t.project_id = ?';
      params.push(filters.projectId);
    }
    
    query += ' ORDER BY t.due_date ASC';
    
    return db.all(query, params);
  }

  async getTasksDueToday(filters = {}) {
    const db = await getDatabase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    let query = `SELECT t.*, u.username as assigned_to_username, u.full_name as assigned_to_name
       FROM tasks t
       LEFT JOIN users u ON t.assigned_to = u.id
       WHERE t.due_date BETWEEN ? AND ? 
       AND t.status != 'done'`;
    const params = [today.toISOString(), tomorrow.toISOString()];
    
    if (filters.teamId) {
      query += ' AND t.team_id = ?';
      params.push(filters.teamId);
    }
    
    if (filters.projectId) {
      query += ' AND t.project_id = ?';
      params.push(filters.projectId);
    }
    
    query += ' ORDER BY t.priority DESC';
    
    return db.all(query, params);
  }
}

export default new TaskService();