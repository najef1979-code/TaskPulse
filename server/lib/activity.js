import { getDatabase } from './database.js';

class ActivityService {
  async logActivity({ 
    actorId = null, 
    actorType = null,
    actionType, 
    entityType, 
    entityId, 
    entityName = null,
    details = null 
  }) {
    const db = await getDatabase();
    
    await db.run(
      `INSERT INTO activity_log 
       (actor_id, actor_type, action_type, entity_type, entity_id, entity_name, details)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        actorId, 
        actorType,
        actionType, 
        entityType, 
        entityId, 
        entityName, 
        details ? JSON.stringify(details) : null
      ]
    );
  }

  async getActivitiesSince(timestamp, excludeActorId = null) {
    const db = await getDatabase();
    
    let query = `
      SELECT a.*, u.username, u.full_name, u.user_type
      FROM activity_log a
      LEFT JOIN users u ON a.actor_id = u.id
      WHERE a.created_at > ?
    `;
    
    const params = [timestamp];
    
    if (excludeActorId) {
      query += ' AND (a.actor_id IS NULL OR a.actor_id != ?)';
      params.push(excludeActorId);
    }
    
    query += ' ORDER BY a.created_at DESC LIMIT 100';
    
    const activities = await db.all(query, params);
    
    return activities.map(a => ({
      id: a.id,
      actorId: a.actor_id,
      actorType: a.actor_type,
      actorName: a.full_name || a.username || 'System',
      actionType: a.action_type,
      entityType: a.entity_type,
      entityId: a.entity_id,
      entityName: a.entity_name,
      details: a.details ? JSON.parse(a.details) : null,
      createdAt: a.created_at
    }));
  }

  async getActivitiesAssignedToUser(userId, since) {
    const db = await getDatabase();
    
    const query = `
      SELECT a.*, u.username, u.full_name, u.user_type,
             t.assigned_to as task_assigned_to,
             t.project_id as task_project_id,
             t.id as task_id
      FROM activity_log a
      LEFT JOIN users u ON a.actor_id = u.id
      LEFT JOIN tasks t ON (
        (a.entity_type = 'task' AND a.entity_id = t.id) OR
        (a.entity_type = 'subtask' AND a.details ->> 'taskId' = CAST(t.id AS TEXT))
      )
      WHERE a.created_at > ?
      AND (
        (a.action_type = 'task_assigned' AND a.details ->> 'assignedTo' = ?) OR
        (a.entity_type = 'task' AND t.assigned_to = ?) OR
        (a.entity_type = 'subtask' AND t.assigned_to = ?)
      )
      ORDER BY a.created_at DESC
      LIMIT 50
    `;
    
    const activities = await db.all(query, [since, userId.toString(), userId, userId]);
    
    return activities.map(a => ({
      id: a.id,
      actorId: a.actor_id,
      actorType: a.actor_type,
      actorName: a.full_name || a.username || 'System',
      actionType: a.action_type,
      entityType: a.entity_type,
      entityId: a.entity_id,
      entityName: a.entity_name,
      details: a.details ? JSON.parse(a.details) : null,
      createdAt: a.created_at,
      taskId: a.entity_type === 'task' ? a.entity_id : parseInt(a.details?.taskId),
      projectId: a.task_project_id
    }));
  }

  async getActivitySummary(userId, since) {
    const activities = await this.getActivitiesSince(since, userId);
    
    const summary = {
      totalChanges: activities.length,
      tasksCreated: activities.filter(a => a.actionType === 'task_created').length,
      tasksCompleted: activities.filter(a => a.actionType === 'task_completed').length,
      tasksAssignedToYou: activities.filter(a => 
        a.actionType === 'task_assigned' && 
        a.details?.assignedTo === userId
      ).length,
      subtasksAnswered: activities.filter(a => a.actionType === 'subtask_answered').length,
      recentActivities: activities.slice(0, 20),
      activityByActor: this.groupByActor(activities)
    };
    
    return summary;
  }

  groupByActor(activities) {
    const byActor = {};
    
    activities.forEach(activity => {
      const actorName = activity.actorName;
      if (!byActor[actorName]) {
        byActor[actorName] = {
          actorType: activity.actorType,
          count: 0,
          activities: []
        };
      }
      byActor[actorName].count++;
      byActor[actorName].activities.push(activity);
    });
    
    return byActor;
  }

  async getRecentActivity(limit = 50) {
    const db = await getDatabase();
    
    const activities = await db.all(
      `SELECT a.*, u.username, u.full_name, u.user_type
       FROM activity_log a
       LEFT JOIN users u ON a.actor_id = u.id
       ORDER BY a.created_at DESC
       LIMIT ?`,
      [limit]
    );
    
    return activities.map(a => ({
      id: a.id,
      actorId: a.actor_id,
      actorType: a.actor_type,
      actorName: a.full_name || a.username || 'System',
      actionType: a.action_type,
      entityType: a.entity_type,
      entityId: a.entity_id,
      entityName: a.entity_name,
      details: a.details ? JSON.parse(a.details) : null,
      createdAt: a.created_at
    }));
  }

  formatActivityMessage(activity) {
    const actor = activity.actorName;
    const entity = activity.entityName || `${activity.entityType} #${activity.entityId}`;
    
    const messages = {
      task_created: `${actor} created task "${entity}"`,
      task_updated: `${actor} updated task "${entity}"`,
      task_started: `${actor} started task "${entity}"`,
      task_completed: `${actor} completed task "${entity}"`,
      task_deleted: `${actor} deleted task "${entity}"`,
      task_assigned: `${actor} assigned task "${entity}" to ${activity.details?.assignedToName || 'someone'}`,
      project_created: `${actor} created project "${entity}"`,
      project_updated: `${actor} updated project "${entity}"`,
      project_archived: `${actor} archived project "${entity}"`,
      project_deleted: `${actor} deleted project "${entity}"`,
      subtask_created: `${actor} created subtask "${entity}"`,
      subtask_answered: `${actor} answered subtask "${entity}"`,
      subtask_deleted: `${actor} deleted subtask "${entity}"`
    };
    
    return messages[activity.actionType] || `${actor} performed ${activity.actionType} on ${entity}`;
  }
}

export default new ActivityService();