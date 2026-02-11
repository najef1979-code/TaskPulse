import { getDatabase } from './lib/database.js';

/**
 * Cleanup Script: Remove Orphaned Data
 * 
 * This script removes:
 * 1. Tasks that reference non-existent projects
 * 2. Subtasks that reference non-existent tasks
 * 
 * This prevents issues where deleted projects/tasks leave orphaned records.
 */

async function cleanupOrphanedData() {
  console.log('Starting cleanup of orphaned data...\n');

  const db = await getDatabase();
  let totalTasksDeleted = 0;
  let totalSubtasksDeleted = 0;

  // Part 1: Find and delete orphaned tasks (tasks pointing to non-existent projects)
  console.log('=== PART 1: Cleaning orphaned tasks ===\n');

  const orphanedTasks = await db.all(`
    SELECT t.id, t.title, t.project_id 
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE p.id IS NULL
    ORDER BY t.id
  `);

  if (orphanedTasks.length === 0) {
    console.log('✓ No orphaned tasks found.\n');
  } else {
    console.log(`Found ${orphanedTasks.length} orphaned tasks:`);
    orphanedTasks.forEach(t => {
      console.log(`  Task ${t.id}: "${t.title}" (project_id: ${t.project_id})`);
    });

    const taskIds = orphanedTasks.map(t => t.id);
    
    // Count and delete subtasks for these tasks
    const subtaskCount = await db.get(
      `SELECT COUNT(*) as count FROM subtasks WHERE task_id IN (${taskIds.join(',')})`
    );
    console.log(`\nFound ${subtaskCount.count} subtasks for these tasks.`);

    if (subtaskCount.count > 0) {
      const deleteSubtasks = await db.run(
        `DELETE FROM subtasks WHERE task_id IN (${taskIds.join(',')})`
      );
      console.log(`✓ Deleted ${deleteSubtasks.changes} subtasks`);
      totalSubtasksDeleted += deleteSubtasks.changes;
    }

    // Delete orphaned tasks
    const deleteTasks = await db.run(
      `DELETE FROM tasks WHERE id IN (${taskIds.join(',')})`
    );
    console.log(`✓ Deleted ${deleteTasks.changes} tasks`);
    totalTasksDeleted += deleteTasks.changes;
  }

  // Part 2: Find and delete orphaned subtasks (subtasks pointing to non-existent tasks)
  console.log('\n=== PART 2: Cleaning orphaned subtasks ===\n');

  const orphanedSubtasks = await db.all(`
    SELECT s.id, s.question, s.task_id
    FROM subtasks s
    LEFT JOIN tasks t ON s.task_id = t.id
    WHERE t.id IS NULL
    ORDER BY s.id
  `);

  if (orphanedSubtasks.length === 0) {
    console.log('✓ No orphaned subtasks found.\n');
  } else {
    console.log(`Found ${orphanedSubtasks.length} orphaned subtasks:`);
    orphanedSubtasks.forEach(s => {
      console.log(`  Subtask ${s.id}: "${s.question.substring(0, 50)}..." (task_id: ${s.task_id})`);
    });

    const subtaskIds = orphanedSubtasks.map(s => s.id);
    const deleteSubtasks = await db.run(
      `DELETE FROM subtasks WHERE id IN (${subtaskIds.join(',')})`
    );
    console.log(`✓ Deleted ${deleteSubtasks.changes} orphaned subtasks`);
    totalSubtasksDeleted += deleteSubtasks.changes;
  }

  // Summary
  console.log('\n=== Cleanup Summary ===');
  console.log(`Total tasks deleted: ${totalTasksDeleted}`);
  console.log(`Total subtasks deleted: ${totalSubtasksDeleted}`);

  if (totalTasksDeleted === 0 && totalSubtasksDeleted === 0) {
    console.log('\n✅ Database is clean! No orphaned data found.');
  } else {
    console.log('\n✅ Cleanup complete!');
  }

  // Verify no more orphaned data
  console.log('\n=== Verification ===');
  
  const remainingOrphanedTasks = await db.get(`
    SELECT COUNT(*) as count 
    FROM tasks t
    LEFT JOIN projects p ON t.project_id = p.id
    WHERE p.id IS NULL
  `);
  console.log(`Orphaned tasks remaining: ${remainingOrphanedTasks.count}`);

  const remainingOrphanedSubtasks = await db.get(`
    SELECT COUNT(*) as count 
    FROM subtasks s
    LEFT JOIN tasks t ON s.task_id = t.id
    WHERE t.id IS NULL
  `);
  console.log(`Orphaned subtasks remaining: ${remainingOrphanedSubtasks.count}`);
}

// Run cleanup
cleanupOrphanedData().then(() => {
  process.exit(0);
}).catch(error => {
  console.error('❌ Error during cleanup:', error);
  process.exit(1);
});