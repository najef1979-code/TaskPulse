import { getDatabase } from './database.js';

class ProjectService {
  async createProject({ teamId, ownerId, createdBy, name, description = '', dueDate = null, startDate = null }) {
    if (!teamId) {
      throw new Error('Team ID is required');
    }

    if (!ownerId) {
      throw new Error('Owner ID is required');
    }

    if (!name || name.trim().length === 0) {
      throw new Error('Project name is required');
    }
    
    if (name.length > 200) {
      throw new Error('Project name must be under 200 characters');
    }

    // Validate dates
    if (dueDate && startDate && new Date(dueDate) < new Date(startDate)) {
      throw new Error('Due date cannot be before start date');
    }
    
    const db = await getDatabase();
    const result = await db.run(
      `INSERT INTO projects (team_id, owner_id, created_by, name, description, status, due_date, start_date) VALUES (?, ?, ?, ?, ?, 'active', ?, ?)`,
      [teamId, ownerId, createdBy || null, name.trim(), description.trim(), dueDate, startDate]
    );
    
    return this.getProject(result.lastID);
  }
  
  async getProject(id) {
    const db = await getDatabase();
    const project = await db.get(
      'SELECT * FROM projects WHERE id = ?',
      [id]
    );
    
    if (!project) {
      throw new Error(`Project ${id} not found`);
    }
    
    return project;
  }
  
  async getProjects(filters = {}) {
    const db = await getDatabase();
    let query = 'SELECT * FROM projects WHERE 1=1';
    const params = [];
    
    if (filters.teamId) {
      query += ' AND team_id = ?';
      params.push(filters.teamId);
    }
    
    if (filters.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY created_at DESC';
    
    return db.all(query, params);
  }
  
  async updateProject(id, updates) {
    const allowed = ['name', 'description', 'status', 'due_date', 'start_date'];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    // Validate dates if both being updated
    if (updates.due_date && updates.start_date) {
      if (new Date(updates.due_date) < new Date(updates.start_date)) {
        throw new Error('Due date cannot be before start date');
      }
    }
    
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = [...fields.map(f => updates[f]), new Date().toISOString(), id];
    
    const db = await getDatabase();
    await db.run(
      `UPDATE projects SET ${setClause}, updated_at = ? WHERE id = ?`,
      values
    );
    
    return this.getProject(id);
  }
  
  async archiveProject(id) {
    return this.updateProject(id, { status: 'archived' });
  }
  
  async deleteProject(id) {
    const db = await getDatabase();
    
    // Get full project info to report what's being deleted
    const project = await this.getProjectWithTasks(id);
    
    // Count subtasks
    let subtaskCount = 0;
    for (const task of project.tasks) {
      const subtasks = await db.all(
        'SELECT COUNT(*) as count FROM subtasks WHERE task_id = ?',
        [task.id]
      );
      subtaskCount += subtasks[0].count;
    }
    
    console.error(`[DELETE] Project "${project.name}": ${project.tasks.length} tasks, ${subtaskCount} subtasks`);
    
    // Manual cascade delete: first delete subtasks, then tasks, then project
    // This prevents orphaned data since schema doesn't have ON DELETE CASCADE
    
    // Delete all subtasks for tasks in this project
    const taskIds = project.tasks.map(t => t.id);
    if (taskIds.length > 0) {
      await db.run(
        `DELETE FROM subtasks WHERE task_id IN (${taskIds.join(',')})`
      );
    }
    
    // Delete all tasks in this project
    await db.run('DELETE FROM tasks WHERE project_id = ?', [id]);
    
    // Delete the project
    await db.run('DELETE FROM projects WHERE id = ?', [id]);
    
    return { 
      id, 
      deleted: true,
      name: project.name,
      tasksDeleted: project.tasks.length,
      subtasksDeleted: subtaskCount
    };
  }
  
  async getProjectWithTasks(id) {
    const db = await getDatabase();
    const project = await this.getProject(id);
    const tasks = await db.all(
      'SELECT * FROM tasks WHERE project_id = ? ORDER BY created_at DESC',
      [id]
    );
    
    return { ...project, tasks };
  }

  async getOverdueProjects(filters = {}) {
    const db = await getDatabase();
    const now = new Date().toISOString();
    
    let query = `SELECT * FROM projects 
       WHERE due_date < ? 
       AND due_date IS NOT NULL 
       AND status = 'active'`;
    const params = [now];
    
    if (filters.teamId) {
      query += ' AND team_id = ?';
      params.push(filters.teamId);
    }
    
    query += ' ORDER BY due_date ASC';
    
    return db.all(query, params);
  }

  async getProjectsDueSoon(days = 7, filters = {}) {
    const db = await getDatabase();
    const now = new Date();
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    let query = `SELECT * FROM projects 
       WHERE due_date BETWEEN ? AND ? 
       AND status = 'active'`;
    const params = [now.toISOString(), future.toISOString()];
    
    if (filters.teamId) {
      query += ' AND team_id = ?';
      params.push(filters.teamId);
    }
    
    query += ' ORDER BY due_date ASC';
    
    return db.all(query, params);
  }
}

export default new ProjectService();
