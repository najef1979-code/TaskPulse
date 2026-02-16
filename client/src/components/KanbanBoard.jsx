import { useState } from 'react';
import { TaskCard } from './TaskCard';
import { TaskModal } from './TaskModal';
import { AssignmentSelector } from './AssignmentSelector';

export function KanbanBoard({ 
  tasks, 
  onTaskStatusChange, 
  onDeleteTask, 
  onCreateTask, 
  onAssignTask, 
  taskSubtaskCounts, 
  taskSubtasks,
  onRefreshSubtasks,
  onTasksRefresh,
  isMobile = false 
}) {
  const [showNewTaskForm, setShowNewTaskForm] = useState(null); // null or column status
  const [selectedTask, setSelectedTask] = useState(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskStartDate, setNewTaskStartDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState(null);
  const [activeColumn, setActiveColumn] = useState('pending');

  const columns = [
    { status: 'pending', label: 'To Do', color: '#f1f5f9', emoji: '📋' },
    { status: 'in-progress', label: 'In Progress', color: '#fef3c7', emoji: '⚡' },
    { status: 'done', label: 'Done', color: '#d1fae5', emoji: '✅' },
  ];

  const getTasksForColumn = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const handleCreateTask = async (status) => {
    if (!newTaskTitle.trim()) return;

    try {
      await onCreateTask({
        title: newTaskTitle,
        description: newTaskDesc,
        priority: newTaskPriority,
        status,
        due_date: newTaskDueDate || null,
        start_date: newTaskStartDate || null,
        assigned_to: newTaskAssignedTo,
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setNewTaskPriority('medium');
      setNewTaskDueDate('');
      setNewTaskStartDate('');
      setNewTaskAssignedTo(null);
      setShowNewTaskForm(null);
    } catch (err) {
      alert('Failed to create task: ' + err.message);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const task = tasks.find(t => t.id === taskId);
    
    if (task && task.status !== targetStatus) {
      onTaskStatusChange(taskId, targetStatus);
    }
  };

  const handleTaskSwipeLeft = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const currentIndex = columns.findIndex(c => c.status === task.status);
    if (currentIndex < columns.length - 1) {
      onTaskStatusChange(taskId, columns[currentIndex + 1].status);
    }
  };

  const handleTaskSwipeRight = (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    const currentIndex = columns.findIndex(c => c.status === task.status);
    if (currentIndex > 0) {
      onTaskStatusChange(taskId, columns[currentIndex - 1].status);
    }
  };

  // Mobile: Single column view with tabs
  if (isMobile) {
    return (
      <div style={styles.mobileContainer}>
        {/* Column Tabs */}
        <div style={styles.columnTabs}>
          {columns.map((column) => (
            <button
              key={column.status}
              style={{
                ...styles.columnTab,
                ...(activeColumn === column.status ? styles.columnTabActive : {})
              }}
              onClick={() => setActiveColumn(column.status)}
            >
              <span style={styles.columnEmoji}>{column.emoji}</span>
              <span style={styles.columnLabel}>{column.label}</span>
              <span style={styles.columnCount}>
                {getTasksForColumn(column.status).length}
              </span>
            </button>
          ))}
        </div>

        {/* Active Column Content */}
        <div style={styles.mobileColumn}>
          <div style={styles.mobileColumnHeader}>
            <h2 style={styles.mobileColumnTitle}>
              {columns.find(c => c.status === activeColumn)?.label}
            </h2>
            <button
              style={styles.mobileAddButton}
              onClick={() => setShowNewTaskForm(activeColumn)}
            >
              + Add Task
            </button>
          </div>

          {showNewTaskForm === activeColumn && (
            <div style={styles.mobileTaskForm}>
              <input
                type="text"
                placeholder="Task title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                style={styles.mobileInput}
                autoFocus
              />
              <textarea
                placeholder="Description (optional)"
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                style={styles.mobileTextarea}
              />
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                style={styles.mobileSelect}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
              
              <div style={styles.mobileFormRow}>
                <label style={styles.mobileLabel}>Assign to:</label>
                <AssignmentSelector
                  currentAssignee={newTaskAssignedTo}
                  onAssign={setNewTaskAssignedTo}
                />
              </div>

              <div style={styles.mobileDateRow}>
                <div style={styles.mobileDateField}>
                  <label style={styles.mobileLabel}>Start</label>
                  <input
                    type="date"
                    value={newTaskStartDate}
                    onChange={(e) => setNewTaskStartDate(e.target.value)}
                    style={styles.mobileDateInput}
                  />
                </div>
                <div style={styles.mobileDateField}>
                  <label style={styles.mobileLabel}>Due</label>
                  <input
                    type="date"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    style={styles.mobileDateInput}
                  />
                </div>
              </div>

              <div style={styles.mobileFormButtons}>
                <button
                  onClick={() => handleCreateTask(activeColumn)}
                  style={styles.mobileCreateButton}
                >
                  Create Task
                </button>
                <button
                  onClick={() => {
                    setShowNewTaskForm(null);
                    setNewTaskTitle('');
                    setNewTaskDesc('');
                    setNewTaskDueDate('');
                    setNewTaskStartDate('');
                    setNewTaskAssignedTo(null);
                  }}
                  style={styles.mobileCancelButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={styles.mobileTaskList}>
            {getTasksForColumn(activeColumn).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={onTaskStatusChange}
                onDelete={onDeleteTask}
                onClick={() => setSelectedTask(task)}
                isMobile={isMobile}
                subtaskCount={taskSubtaskCounts?.[task.id] || 0}
                subtasks={taskSubtasks?.[task.id] || []}
                onSwipeLeft={() => handleTaskSwipeLeft(task.id)}
                onSwipeRight={() => handleTaskSwipeRight(task.id)}
                onRefreshSubtasks={onRefreshSubtasks}
              />
            ))}
            
            {getTasksForColumn(activeColumn).length === 0 && !showNewTaskForm && (
              <div style={styles.emptyColumn}>
                <span style={styles.emptyEmoji}>📋</span>
                <p style={styles.emptyText}>No tasks here yet</p>
                <p style={styles.emptySubtext}>Tap the button above to add your first task</p>
                <button
                  style={styles.emptyAddButton}
                  onClick={() => setShowNewTaskForm(activeColumn)}
                >
                  + Add First Task
                </button>
              </div>
            )}
          </div>
        </div>

        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={() => {
              setSelectedTask(null);
              onRefreshSubtasks(selectedTask.id);
            }}
            onTasksRefresh={onTasksRefresh}
            isMobile={isMobile}
          />
        )}
      </div>
    );
  }

  // Desktop: Original three-column layout
  return (
    <>
      <div style={styles.board}>
        {columns.map((column) => (
          <div
            key={column.status}
            style={{
              ...styles.column,
              backgroundColor: column.color,
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div style={styles.columnHeader}>
              <h2 style={styles.columnTitle}>
                {column.label}
                <span style={styles.taskCount}>
                  {getTasksForColumn(column.status).length}
                </span>
              </h2>
              <button
                style={styles.addButton}
                onClick={() => setShowNewTaskForm(column.status)}
              >
                +
              </button>
            </div>

            {showNewTaskForm === column.status && (
              <div style={styles.newTaskForm}>
                <input
                  type="text"
                  placeholder="Task title"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  style={styles.input}
                  autoFocus
                />
                <textarea
                  placeholder="Description (optional)"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  style={styles.textarea}
                />
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value)}
                  style={styles.select}
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div style={styles.assignmentRow}>
                  <label style={styles.label}>Assign to:</label>
                  <AssignmentSelector
                    currentAssignee={newTaskAssignedTo}
                    onAssign={setNewTaskAssignedTo}
                  />
                </div>
                <div style={styles.dateInputs}>
                  <div style={styles.dateField}>
                    <label style={styles.dateLabel}>Start Date</label>
                    <input
                      type="date"
                      value={newTaskStartDate}
                      onChange={(e) => setNewTaskStartDate(e.target.value)}
                      style={styles.dateInput}
                    />
                  </div>
                  <div style={styles.dateField}>
                    <label style={styles.dateLabel}>Due Date</label>
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      style={styles.dateInput}
                    />
                  </div>
                </div>
                <div style={styles.formButtons}>
                  <button
                    onClick={() => handleCreateTask(column.status)}
                    style={styles.createButton}
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setShowNewTaskForm(null);
                      setNewTaskTitle('');
                      setNewTaskDesc('');
                      setNewTaskDueDate('');
                      setNewTaskStartDate('');
                      setNewTaskAssignedTo(null);
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div style={styles.taskList}>
              {getTasksForColumn(column.status).map((task) => (
                <div
                  key={task.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('taskId', task.id.toString())}
                >
                  <TaskCard
                    task={task}
                    onStatusChange={onTaskStatusChange}
                    onDelete={onDeleteTask}
                    onClick={() => setSelectedTask(task)}
                    subtaskCount={taskSubtaskCounts?.[task.id] || 0}
                    subtasks={taskSubtasks?.[task.id] || []}
                    onRefreshSubtasks={onRefreshSubtasks}
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={() => {
            setSelectedTask(null);
            onRefreshSubtasks(selectedTask.id);
          }}
          onTasksRefresh={onTasksRefresh}
        />
      )}
    </>
  );
}

const styles = {
  // Desktop styles
  board: {
    display: 'flex',
    gap: 'var(--spacing-xl)',
    padding: 'var(--spacing-xl)',
    height: '100%',
    overflowX: 'auto',
  },
  column: {
    flex: '1',
    minWidth: '320px',
    borderRadius: 'var(--radius-lg)',
    padding: 'var(--spacing-lg)',
    display: 'flex',
    flexDirection: 'column',
  },
  columnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-lg)',
  },
  columnTitle: {
    font: 'var(--title-large)',
    fontWeight: '500',
    margin: 0,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    color: 'var(--color-text-primary)',
  },
  taskCount: {
    font: 'var(--label-large)',
    fontWeight: '400',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-surface-1)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderRadius: 'var(--radius-full)',
  },
  addButton: {
    width: '40px',
    height: '40px',
    borderRadius: 'var(--radius-full)',
    border: 'none',
    backgroundColor: 'var(--color-primary-60)',
    color: 'var(--color-text-inverse)',
    fontSize: '24px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all var(--duration-short) var(--easing-standard)',
    position: 'relative',
    overflow: 'hidden',
  },
  taskList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  newTaskForm: {
    backgroundColor: 'var(--color-surface-1)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--elevation-2)',
    border: '2px solid var(--color-primary-60)',
    animation: 'scaleIn 250ms var(--easing-emphasized-decelerate)',
  },
  input: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  textarea: {
    width: '100%',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    minHeight: '60px',
    resize: 'vertical',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  select: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  assignmentRow: {
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  label: {
    display: 'block',
    font: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  dateInputs: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-md)',
  },
  dateField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  dateLabel: {
    font: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
  },
  dateInput: {
    height: '56px',
    padding: '0 var(--spacing-lg)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    width: '100%',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  formButtons: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
  },
  createButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-xl)',
    backgroundColor: 'var(--color-secondary-60)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'var(--label-large)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
    position: 'relative',
    overflow: 'hidden',
  },
  cancelButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-xl)',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-primary-60)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'var(--label-large)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
    position: 'relative',
    overflow: 'hidden',
  },

  // Mobile styles
  mobileContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  columnTabs: {
    display: 'flex',
    backgroundColor: 'var(--color-surface-1)',
    borderBottom: '2px solid var(--color-outline)',
    position: 'sticky',
    top: 0,
    zIndex: 10,
    boxShadow: 'var(--elevation-1)',
  },
  columnTab: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--spacing-sm) var(--spacing-xs)',
    background: 'none',
    border: 'none',
    borderBottom: '3px solid transparent',
    cursor: 'pointer',
    transition: 'all var(--duration-short) var(--easing-standard)',
    color: 'var(--color-text-secondary)',
    position: 'relative',
  },
  columnTabActive: {
    borderBottomColor: 'var(--color-primary-60)',
    color: 'var(--color-primary-60)',
    backgroundColor: 'var(--color-primary-90)',
  },
  columnEmoji: {
    fontSize: '20px',
    marginBottom: 'var(--spacing-xs)',
  },
  columnLabel: {
    font: 'var(--label-small)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  columnCount: {
    font: 'var(--label-small)',
    marginTop: 'var(--spacing-xs)',
    opacity: '0.7',
  },
  mobileColumn: {
    flex: 1,
    overflow: 'auto',
    padding: 'var(--spacing-lg)',
  },
  mobileColumnHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-lg)',
  },
  mobileColumnTitle: {
    font: 'var(--headline-medium)',
    fontWeight: '500',
    margin: 0,
    color: 'var(--color-text-primary)',
  },
  mobileAddButton: {
    height: '40px',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'var(--color-primary-60)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
    position: 'relative',
    overflow: 'hidden',
  },
  mobileTaskForm: {
    backgroundColor: 'var(--color-surface-1)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-lg)',
    marginBottom: 'var(--spacing-lg)',
    boxShadow: 'var(--elevation-2)',
    border: '2px solid var(--color-primary-60)',
    animation: 'scaleIn 250ms var(--easing-emphasized-decelerate)',
  },
  mobileInput: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  mobileTextarea: {
    width: '100%',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  mobileSelect: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    marginBottom: 'var(--spacing-md)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  mobileFormRow: {
    marginBottom: 'var(--spacing-md)',
  },
  mobileLabel: {
    display: 'block',
    font: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-primary)',
    marginBottom: 'var(--spacing-sm)',
  },
  mobileDateRow: {
    display: 'flex',
    gap: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)',
  },
  mobileDateField: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-xs)',
  },
  mobileDateInput: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  mobileFormButtons: {
    display: 'flex',
    gap: 'var(--spacing-md)',
  },
  mobileCreateButton: {
    flex: 1,
    height: '48px',
    padding: '0 var(--spacing-xl)',
    backgroundColor: 'var(--color-secondary-60)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
    position: 'relative',
    overflow: 'hidden',
  },
  mobileCancelButton: {
    flex: 1,
    height: '48px',
    padding: '0 var(--spacing-xl)',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-primary-60)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
    position: 'relative',
    overflow: 'hidden',
  },
  mobileTaskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
  },
  emptyColumn: {
    textAlign: 'center',
    padding: 'var(--spacing-xxxl) var(--spacing-xl)',
    color: 'var(--color-text-tertiary)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-lg)',
    animation: 'fadeIn 300ms var(--easing-standard)',
  },
  emptyEmoji: {
    fontSize: '48px',
    opacity: 0.6,
    marginBottom: 'var(--spacing-sm)',
  },
  emptyText: {
    font: 'var(--title-medium)',
    margin: '0 0 var(--spacing-xs) 0',
    color: 'var(--color-text-secondary)',
  },
  emptySubtext: {
    font: 'var(--body-medium)',
    margin: 0,
    color: 'var(--color-text-tertiary)',
  },
  emptyAddButton: {
    height: '48px',
    padding: '0 var(--spacing-xxl)',
    backgroundColor: 'var(--color-primary-60)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    cursor: 'pointer',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
    position: 'relative',
    overflow: 'hidden',
  },
};