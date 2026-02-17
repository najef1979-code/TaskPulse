import React, { useState, useEffect } from 'react';
import { spacing, typography, radius, getTheme, colors, transition } from '../fintech-tokens';
import { Badge } from './Badge';
import { Icon } from './Icon';
import { EditSubtaskModal } from '../../components/EditSubtaskModal';
import { tasksApi } from '../../services/api';

// Helper functions (outside component)
const getStatusVariant = (status) => {
  switch (status) {
    case 'pending':
      return 'todo';
    case 'in-progress':
      return 'progress';
    case 'done':
      return 'done';
    default:
      return 'default';
  }
};

const getPriorityVariant = (priority) => {
  switch (priority) {
    case 'high':
      return 'urgent';
    case 'medium':
      return 'review';
    case 'low':
      return 'todo';
    default:
      return 'todo';
  }
};

const getPriorityLabel = (priority) => {
  switch (priority) {
    case 'high':
      return 'High';
    case 'medium':
      return 'Medium';
    case 'low':
      return 'Low';
    default:
      return 'Medium';
  }
};

const getSubtaskBorderColor = (isDark) => {
  return isDark ? colors.grayDark[500] : colors.grayLight[400];
};

const getSubtaskIconColor = (status) => {
  if (status === 'completed') {
    return colors.semantic.done.text;
  }
  return 'transparent';
};

const formatDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = date - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) return `Overdue by ${Math.abs(diffDays)}d`;
  if (diffDays === 0) return 'Due today';
  if (diffDays === 1) return 'Due tomorrow';
  if (diffDays <= 7) return `Due in ${diffDays}d`;
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

/**
 * TaskCard Component
 * Task card with description shown by default and expandable subtasks list
 */
export function TaskCard({ 
  task, 
  isDark = false, 
  subtasks = [],
  onSubtaskUpdate,
  totalSubtasks = 0,
  pendingSubtasks = 0,
  onExpand,
  onTaskUpdate
}) {
  const theme = getTheme(isDark);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(() => {
    try {
      const savedState = localStorage.getItem(`task-desc-${task.id}`);
      return savedState !== 'false';
    } catch {
      return true;
    }
  });
  const [isSubtasksExpanded, setIsSubtasksExpanded] = useState(false);
  const [selectedSubtask, setSelectedSubtask] = useState(null);
  const [showTaskMenu, setShowTaskMenu] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editTaskForm, setEditTaskForm] = useState({ title: '', description: '', priority: '', status: '', due_date: '' });

  const border = {
    width: '1px',
  };

  const shadow = {
    cardLight: '0 2px 8px rgba(0, 0, 0, 0.05)',
    cardHoverLight: '0 6px 20px rgba(0, 0, 0, 0.08)',
    cardDark: '0 2px 8px rgba(0, 0, 0, 0.4)',
    cardHoverDark: '0 6px 20px rgba(0, 0, 0, 0.6)',
  };

  const cardStyles = {
    backgroundColor: theme.card.bg,
    border: `${border.width} solid ${theme.card.border}`,
    borderRadius: radius.lg,
    boxShadow: theme.card.shadow,
    padding: spacing.md,
    gap: spacing.md,
    cursor: task.description || totalSubtasks > 0 ? 'pointer' : 'default',
    transition: `transform ${transition.fast}, box-shadow ${transition.normal}`,
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  };

  const titleRowStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingRight: '32px',
  };

  const titleStyles = {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: theme.card.title,
    lineHeight: 1.4,
    flex: 1,
  };

  const badgeStyles = {
    alignSelf: 'flex-start',
  };

  const metaRowStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  };

  const metaItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    fontSize: typography.xs,
    color: isDark ? theme.text.secondary : colors.grayLight[500],
    padding: `2px 8px`,
    borderRadius: radius.sm,
    backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[100],
  };

  const descriptionStyles = {
    fontSize: typography.sm,
    color: isDark ? theme.text.secondary : colors.grayLight[500],
    lineHeight: 1.5,
    marginTop: spacing.xs,
    padding: `${spacing.xs} 0`,
    borderTop: `${border.width} solid ${isDark ? colors.grayDark[300] : colors.grayLight[200]}`,
    display: isDescriptionExpanded ? 'block' : 'none',
    wordWrap: 'break-word',
    whiteSpace: 'normal',
  };

  const descriptionCollapseButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.xs,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radius.sm,
    backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[100],
    border: 'none',
    cursor: 'pointer',
    fontSize: typography.xs,
    fontWeight: typography.weights.medium,
    color: isDark ? theme.text.secondary : colors.grayLight[600],
    transition: `background-color ${transition.fast}`,
    width: 'fit-content',
  };

  const subtasksContainerStyles = {
    marginTop: spacing.sm,
    borderTop: `${border.width} solid ${theme.card.border}`,
    paddingTop: spacing.sm,
    display: isSubtasksExpanded ? 'block' : 'none',
  };

  const subtaskItemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radius.sm,
    marginBottom: spacing.xs,
    transition: `background-color ${transition.fast}`,
  };

  const subtaskCheckboxStyles = {
    width: '16px',
    height: '16px',
    borderRadius: '4px',
    border: `2px solid ${getSubtaskBorderColor(isDark)}`,
    backgroundColor: 'transparent',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    flexShrink: 0,
  };

  const subtaskTextStyles = {
    fontSize: typography.sm,
    color: isDark ? theme.text.primary : colors.grayLight[700],
    flex: 1,
  };

  const subtaskTypeStyles = {
    fontSize: typography.xs,
    padding: `2px 8px`,
    borderRadius: '10px',
    backgroundColor: colors.primary[100],
    color: colors.primary[700],
  };

  const menuButtonStyles = {
    width: '24px',
    height: '24px',
    borderRadius: '4px',
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: isDark ? colors.grayDark[600] : colors.grayLight[500],
    transition: `background-color ${transition.fast}`,
    flexShrink: 0,
  };

  const menuStyles = {
    position: 'absolute',
    right: '0',
    top: '100%',
    zIndex: 50,
    backgroundColor: isDark ? colors.grayDark[100] : '#FFFFFF',
    border: `1px solid ${isDark ? colors.grayDark[300] : colors.grayLight[200]}`,
    borderRadius: radius.md,
    boxShadow: isDark ? shadow.cardDark : shadow.cardLight,
    minWidth: '150px',
    marginTop: spacing.xs,
  };

  const menuItemStyles = {
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: typography.sm,
    fontWeight: typography.weights.medium,
    color: isDark ? colors.grayDark[900] : colors.grayLight[900],
    cursor: 'pointer',
    transition: `background-color ${transition.fast}`,
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  };

  const modalBackdropStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 100,
    display: editingTask ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
  };

  const modalStyles = {
    backgroundColor: isDark ? colors.grayDark[100] : '#FFFFFF',
    borderRadius: radius.lg,
    padding: spacing.xl,
    width: '400px',
    maxWidth: '90vw',
    boxShadow: isDark ? shadow.cardHoverDark : shadow.cardHoverLight,
  };

  const modalTitleStyles = {
    fontSize: typography.lg,
    fontWeight: typography.weights.semibold,
    color: isDark ? colors.grayDark[900] : colors.grayLight[900],
    marginBottom: spacing.lg,
  };

  const formLabelStyles = {
    fontSize: typography.sm,
    fontWeight: typography.weights.semibold,
    color: isDark ? colors.grayDark[200] : colors.grayLight[600],
    marginBottom: spacing.sm,
    display: 'block',
  };

  const inputStyles = {
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.sm,
    border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
    fontSize: typography.base,
    fontFamily: typography.family,
    backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
    color: isDark ? colors.grayDark[900] : colors.grayLight[900],
    outline: 'none',
    transition: `all ${transition.fast}`,
    marginBottom: spacing.md,
  };

  const selectStyles = {
    ...inputStyles,
    cursor: 'pointer',
  };

  const textareaStyles = {
    ...inputStyles,
    minHeight: '100px',
    resize: 'vertical',
    fontFamily: typography.family,
  };

  const modalButtonsStyles = {
    display: 'flex',
    gap: spacing.md,
    justifyContent: 'flex-end',
    marginTop: spacing.lg,
  };

  const cancelButtonStyles = {
    padding: `${spacing.sm} ${spacing.lg}`,
    border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
    borderRadius: radius.md,
    backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
    color: isDark ? colors.grayDark[300] : colors.grayLight[600],
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${transition.fast}`,
  };

  const saveButtonStyles = {
    padding: `${spacing.sm} ${spacing.lg}`,
    border: 'none',
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: `all ${transition.fast}`,
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translateY(-2px)';
    e.currentTarget.style.boxShadow = theme.card.hoverShadow;
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translateY(0)';
    e.currentTarget.style.boxShadow = theme.card.shadow;
  };

  const handleCardClick = (e) => {
    if (task.description) {
      setIsDescriptionExpanded(!isDescriptionExpanded);
      try {
        localStorage.setItem(`task-desc-${task.id}`, (!isDescriptionExpanded).toString());
      } catch (err) {
        // Ignore localStorage errors
      }
    }
  };

  const handleSubtaskExpandClick = (e) => {
    e.stopPropagation();
    if (onExpand) {
      onExpand();
    }
    setIsSubtasksExpanded(!isSubtasksExpanded);
  };

  const handleSubtaskClick = (e, subtask) => {
    e.stopPropagation();
    setSelectedSubtask(subtask);
  };

  const handleSubtaskUpdate = () => {
    setSelectedSubtask(null);
    if (onSubtaskUpdate) {
      onSubtaskUpdate();
    }
  };

  const handleTaskMenuClick = (e) => {
    e.stopPropagation();
    setShowTaskMenu(!showTaskMenu);
  };

  const handleEditTask = () => {
    setEditingTask(task);
    setEditTaskForm({ 
      title: task.title, 
      description: task.description || '', 
      priority: task.priority || 'medium',
      status: task.status || 'pending',
      due_date: task.due_date || ''
    });
    setShowTaskMenu(false);
  };

  const handleSaveTask = async () => {
    try {
      await tasksApi.update(editingTask.id, {
        title: editTaskForm.title,
        description: editTaskForm.description,
        priority: editTaskForm.priority,
        status: editTaskForm.status,
        due_date: editTaskForm.due_date || null,
      });
      setEditingTask(null);
      setEditTaskForm({ title: '', description: '', priority: '', status: '', due_date: '' });
      if (onTaskUpdate) {
        onTaskUpdate();
      }
    } catch (error) {
      console.error('Failed to save task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleCancelTaskEdit = () => {
    setEditingTask(null);
    setEditTaskForm({ title: '', description: '', priority: '', status: '', due_date: '' });
  };

  const pendingCount = pendingSubtasks;
  const totalCount = totalSubtasks;
  const hasDescription = task.description && task.description.trim().length > 0;
  const formattedDueDate = formatDate(task.due_date);

  // Close task menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showTaskMenu) {
        setShowTaskMenu(false);
      }
    };

    if (showTaskMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTaskMenu]);

  return (
    <>
      {/* Edit Task Modal */}
      <div style={modalBackdropStyles} onClick={handleCancelTaskEdit}>
        <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
          <h2 style={modalTitleStyles}>Edit Task</h2>
          
          <label style={formLabelStyles}>Task Title</label>
          <input
            type="text"
            value={editTaskForm.title}
            onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })}
            style={inputStyles}
            placeholder="Enter task title"
            autoFocus
          />
          
          <label style={formLabelStyles}>Description</label>
          <textarea
            value={editTaskForm.description}
            onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })}
            style={textareaStyles}
            placeholder="Enter task description"
          />

          <label style={formLabelStyles}>Priority</label>
          <select
            value={editTaskForm.priority}
            onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}
            style={selectStyles}
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <label style={formLabelStyles}>Status</label>
          <select
            value={editTaskForm.status}
            onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value })}
            style={selectStyles}
          >
            <option value="pending">To Do</option>
            <option value="in-progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <label style={formLabelStyles}>Due Date</label>
          <input
            type="date"
            value={editTaskForm.due_date}
            onChange={(e) => setEditTaskForm({ ...editTaskForm, due_date: e.target.value })}
            style={inputStyles}
          />
          
          <div style={modalButtonsStyles}>
            <button
              style={cancelButtonStyles}
              onClick={handleCancelTaskEdit}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.grayLight[400];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
              }}
            >
              Cancel
            </button>
            <button
              style={saveButtonStyles}
              onClick={handleSaveTask}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[500];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = colors.primary[600];
              }}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <div
        style={cardStyles}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
      >
        <div style={headerStyles}>
          <div style={{ position: 'relative', width: '100%' }}>
            <div style={titleRowStyles}>
              <div style={titleStyles}>{task.title}</div>
              <div style={badgeStyles}>
                <Badge variant={getStatusVariant(task.status)}>
                  {task.status === 'in-progress' ? 'In Progress' : 
                   task.status === 'pending' ? 'To Do' : 'Done'}
                </Badge>
              </div>
            </div>
            
            <div style={{ position: 'absolute', right: '0', top: '0' }}>
              <button
                style={menuButtonStyles}
                onClick={handleTaskMenuClick}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <Icon name="moreHorizontal" size={16} />
              </button>
              
              {showTaskMenu && (
                <div style={menuStyles}>
                  <div
                    style={menuItemStyles}
                    onClick={handleEditTask}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <Icon name="edit" size={14} />
                    <span>Edit Task</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div style={metaRowStyles}>
            {task.priority && (
              <div style={metaItemStyles}>
                <Icon name="flag" size={12} color={isDark ? theme.text.secondary : colors.grayLight[500]} />
                <Badge variant={getPriorityVariant(task.priority)} style={{ fontSize: typography.xs }}>
                  {getPriorityLabel(task.priority)}
                </Badge>
              </div>
            )}
            
            {formattedDueDate && (
              <div style={metaItemStyles}>
                <Icon name="calendar" size={12} color={isDark ? theme.text.secondary : colors.grayLight[500]} />
                <span>{formattedDueDate}</span>
              </div>
            )}

            {totalCount > 0 && (
              <div style={metaItemStyles}>
                <Icon name="list" size={12} color={isDark ? theme.text.secondary : colors.grayLight[500]} />
                <span>{pendingCount} of {totalCount} subtasks</span>
              </div>
            )}
          </div>
        </div>

        <div style={descriptionStyles}>
          {task.description}
        </div>

        {totalCount > 0 && (
          <button
            style={descriptionCollapseButtonStyles}
            onClick={handleSubtaskExpandClick}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[200];
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
            }}
          >
            <Icon name={isSubtasksExpanded ? 'chevronUp' : 'chevronDown'} size={14} />
            <span>
              {isSubtasksExpanded ? 'Hide' : 'Show'} Subtasks
            </span>
          </button>
        )}

        <div style={subtasksContainerStyles}>
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              style={{
                ...subtaskItemStyles,
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={(e) => handleSubtaskClick(e, subtask)}
            >
              <div style={subtaskCheckboxStyles}>
                {subtask.status === 'completed' && (
                  <Icon name="check" size={10} color={getSubtaskIconColor(subtask.status)} />
                )}
              </div>
              
              <div style={subtaskTextStyles}>
                {subtask.question}
              </div>

              {subtask.type === 'multiple_choice' && (
                <span style={subtaskTypeStyles}>Choice</span>
              )}

              {subtask.type === 'open_answer' && (
                <span style={subtaskTypeStyles}>Open</span>
              )}
            </div>
          ))}

          {subtasks.length === 0 && (
            <div style={{
              fontSize: typography.sm,
              color: isDark ? theme.text.secondary : colors.grayLight[500],
              padding: spacing.sm,
              textAlign: 'center',
            }}>
              No subtasks yet
            </div>
          )}
        </div>
      </div>

      {selectedSubtask && (
        <EditSubtaskModal
          subtask={selectedSubtask}
          onClose={() => setSelectedSubtask(null)}
          onUpdate={handleSubtaskUpdate}
        />
      )}
    </>
  );
}