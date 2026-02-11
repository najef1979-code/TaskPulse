import { getDatabase } from './database.js';
import activityService from './activity.js';

class SubtaskService {
  async createSubtask({ 
    taskId, 
    question, 
    options = [], 
    assignedTo = null, 
    type = 'multiple_choice',
    providedFile = 'no_file',
    fileReference = null,
    actorId = null, 
    actorType = null 
  }) {
    if (!question || question.trim().length === 0) {
      throw new Error('Subtask question is required');
    }
    
    if (!taskId) {
      throw new Error('Task ID is required');
    }
    
    // Validate subtask type
    const validTypes = ['multiple_choice', 'open_answer'];
    if (!validTypes.includes(type)) {
      throw new Error('Type must be multiple_choice or open_answer');
    }

    // Validate options for multiple_choice
    if (type === 'multiple_choice' && (!options || options.length === 0)) {
      throw new Error('Multiple choice subtasks must have at least one option');
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
    
    const task = await db.get('SELECT id FROM tasks WHERE id = ?', [taskId]);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }

    if (assignedTo) {
      const user = await db.get('SELECT id FROM users WHERE id = ?', [assignedTo]);
      if (!user) {
        throw new Error(`User ${assignedTo} not found`);
      }
    }
    
    const optionsJson = JSON.stringify(options);
    
    const result = await db.run(
      `INSERT INTO subtasks (task_id, question, options, assigned_to, answered, type, provided_file, file_reference) 
       VALUES (?, ?, ?, ?, 0, ?, ?, ?)`,
      [taskId, question.trim(), optionsJson, assignedTo, type, providedFile, fileReference]
    );
    
    const subtask = await this.getSubtask(result.lastID);

    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'subtask_created',
      entityType: 'subtask',
      entityId: subtask.id,
      entityName: subtask.question,
      details: { taskId }
    });
    
    return subtask;
  }
  
  async getSubtask(id) {
    const db = await getDatabase();
    const subtask = await db.get(
      `SELECT s.*, u.username as assigned_to_username, u.full_name as assigned_to_name
       FROM subtasks s
       LEFT JOIN users u ON s.assigned_to = u.id
       WHERE s.id = ?`,
      [id]
    );
    
    if (!subtask) {
      throw new Error(`Subtask ${id} not found`);
    }
    
    return {
      ...subtask,
      options: subtask.options ? JSON.parse(subtask.options) : [],
      answered: Boolean(subtask.answered)
    };
  }
  
  async getSubtasks(taskId) {
    const db = await getDatabase();
    const subtasks = await db.all(
      `SELECT s.*, u.username as assigned_to_username, u.full_name as assigned_to_name
       FROM subtasks s
       LEFT JOIN users u ON s.assigned_to = u.id
       WHERE s.task_id = ? 
       ORDER BY s.created_at ASC`,
      [taskId]
    );
    
    return subtasks.map(st => ({
      ...st,
      options: st.options ? JSON.parse(st.options) : [],
      answered: Boolean(st.answered)
    }));
  }
  
  async answerSubtask(id, selectedOption, actorId = null, actorType = null) {
    const subtask = await this.getSubtask(id);
    
    // Validate based on subtask type
    if (subtask.type === 'multiple_choice') {
      if (subtask.options.length > 0 && !subtask.options.includes(selectedOption)) {
        throw new Error(`Invalid option. Must be one of: ${subtask.options.join(', ')}`);
      }
    } else if (subtask.type === 'open_answer') {
      // Open answer accepts any text, just validate it's not empty
      if (!selectedOption || selectedOption.trim().length === 0) {
        throw new Error('Answer cannot be empty');
      }
    }
    
    const db = await getDatabase();
    await db.run(
      'UPDATE subtasks SET selected_option = ?, answered = 1 WHERE id = ?',
      [selectedOption, id]
    );

    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'subtask_answered',
      entityType: 'subtask',
      entityId: id,
      entityName: subtask.question,
      details: { selectedOption }
    });
    
    return this.getSubtask(id);
  }
  
  async updateSubtask(id, updates, actorId = null, actorType = null) {
    const allowed = ['question', 'options', 'assigned_to', 'provided_file', 'file_reference'];
    const fields = Object.keys(updates).filter(k => allowed.includes(k));
    
    if (fields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    const db = await getDatabase();
    
    // Get current subtask for validation
    const currentSubtask = await this.getSubtask(id);
    
    if (updates.options) {
      await db.run(
        'UPDATE subtasks SET options = ? WHERE id = ?',
        [JSON.stringify(updates.options), id]
      );
    }
    
    if (updates.question) {
      await db.run(
        'UPDATE subtasks SET question = ? WHERE id = ?',
        [updates.question, id]
      );
    }

    if (updates.assigned_to !== undefined) {
      await db.run(
        'UPDATE subtasks SET assigned_to = ? WHERE id = ?',
        [updates.assigned_to, id]
      );
    }

    // Validate and update file fields
    if (updates.provided_file) {
      const validProvidedFiles = ['no_file', 'emailed', 'on_disk'];
      if (!validProvidedFiles.includes(updates.provided_file)) {
        throw new Error('Provided file must be no_file, emailed, or on_disk');
      }
      await db.run(
        'UPDATE subtasks SET provided_file = ? WHERE id = ?',
        [updates.provided_file, id]
      );
    }

    if (updates.file_reference !== undefined) {
      await db.run(
        'UPDATE subtasks SET file_reference = ? WHERE id = ?',
        [updates.file_reference, id]
      );
    }

    // Validate file_reference based on provided_file
    const finalProvidedFile = updates.provided_file !== undefined ? updates.provided_file : currentSubtask.provided_file;
    const finalFileReference = updates.file_reference !== undefined ? updates.file_reference : currentSubtask.file_reference;
    
    if ((finalProvidedFile === 'emailed' || finalProvidedFile === 'on_disk') && !finalFileReference) {
      throw new Error('File reference is required when provided_file is emailed or on_disk');
    }
    
    return this.getSubtask(id);
  }
  
  async deleteSubtask(id, actorId = null, actorType = null) {
    const subtask = await this.getSubtask(id);
    
    const db = await getDatabase();
    await db.run('DELETE FROM subtasks WHERE id = ?', [id]);

    await activityService.logActivity({
      actorId,
      actorType,
      actionType: 'subtask_deleted',
      entityType: 'subtask',
      entityId: id,
      entityName: subtask.question
    });
    
    return { id, deleted: true };
  }
}

export default new SubtaskService();