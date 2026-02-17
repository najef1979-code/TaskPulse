import React, { useState, useEffect } from 'react';
import { spacing, typography, getTheme, colors, transition, radius } from '../fintech-tokens';
import { TaskCard } from './TaskCard';
import { Icon } from './Icon';
import { useSubtasks } from '../../hooks/useSubtasks';
import { projectsApi } from '../../services/api';

/**
 * KanbanColumn Component
 * Represents a project column with its tasks and subtasks
 */
export function KanbanColumn({
  project,
  tasks = [],
  isDark = false,
  onNewTask,
  onTaskUpdate,
  onProjectUpdate,
  onSelectTaskForSubtask
}) {
  const theme = getTheme(isDark);
  const [expandedTaskId, setExpandedTaskId] = useState(null);
  const [showDescription, setShowDescription] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [showTaskSelector, setShowTaskSelector] = useState(false);

  const border = {
    width: '1px',
  };

  const shadow = {
    cardLight: '0 2px 8px rgba(0, 0, 0, 0.05)',
    cardHoverLight: '0 6px 20px rgba(0, 0, 0, 0.08)',
    cardDark: '0 2px 8px rgba(0, 0, 0, 0.4)',
    cardHoverDark: '0 6px 20px rgba(0, 0, 0, 0.6)',
  };

  const columnStyles = {
    width: '336px',
    minHeight: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flexShrink: 0,
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: `${spacing.sm} ${spacing.xs}`,
    borderRadius: radius.md,
    transition: `background-color ${transition.fast}`,
  };

  const titleSectionStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    flex: 1,
    overflow: 'hidden',
  };

  const titleRowStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    cursor: 'pointer',
    userSelect: 'none',
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: radius.sm,
    transition: `background-color ${transition.fast}`,
  };

  const projectIconStyles = {
    width: '28px',
    height: '28px',
    borderRadius: radius.md,
    background: colors.gradients.avatar,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#FFFFFF',
    fontSize: typography.xs,
    fontWeight: typography.weights.semibold,
    flexShrink: 0,
  };

  const titleStyles = {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: isDark ? theme.text.primary : colors.grayLight[800],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    lineHeight: 1.3,
    flex: 1,
    minWidth: 0,
  };

  const descriptionStyles = {
    fontSize: typography.sm,
    color: isDark ? theme.text.secondary : colors.grayLight[500],
    lineHeight: 1.5,
    marginTop: spacing.xs,
    padding: `${spacing.xs} 0`,
    borderTop: `${border.width} solid ${isDark ? colors.grayDark[300] : colors.grayLight[200]}`,
    wordWrap: 'break-word',
    whiteSpace: 'normal',
  };

  const taskCountStyles = {
    fontSize: typography.sm,
    fontWeight: typography.weights.medium,
    color: isDark ? theme.text.secondary : colors.grayLight[500],
    paddingLeft: spacing.xs,
    flexShrink: 0,
  };

  const menuButtonStyles = {
    width: '28px',
    height: '28px',
    borderRadius: radius.sm,
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: isDark ? theme.text.secondary : colors.grayLight[500],
    transition: `background-color ${transition.fast}`,
    flexShrink: 0,
  };

  const bodyStyles = {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
    flex: 1,
  };

  const noTasksStyles = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    borderRadius: radius.lg,
    border: `${border.width} dashed ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
    backgroundColor: isDark ? 'transparent' : colors.grayLight[50],
    textAlign: 'center',
  };

  const noTasksTextStyles = {
    fontSize: typography.sm,
    color: isDark ? theme.text.secondary : colors.grayLight[500],
    lineHeight: 1.5,
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
    display: editingProject ? 'flex' : 'none',
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

  const handleAddTaskClick = () => {
    if (onNewTask) {
      onNewTask(project.id);
    }
  };

  const handleTaskClick = (taskId) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const handleSubtaskUpdate = () => {
    if (onTaskUpdate) {
      onTaskUpdate();
    }
  };

  const handleTitleRowClick = () => {
    if (project.description) {
      setShowDescription(!showDescription);
    }
  };

  const handleMenuClick = (e) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleEditProject = () => {
    setEditingProject(project);
    setEditForm({ name: project.name, description: project.description || '' });
    setShowMenu(false);
  };

  const handleDeleteProject = async () => {
    setShowMenu(false);
    
    const taskCount = tasks.length;
    const subtaskCount = tasks.reduce((sum, task) => {
      // Estimate subtask count from task data
      return sum + (task.subtask_count || 0);
    }, 0);

    const message = taskCount > 0 || subtaskCount > 0
      ? `⚠️ This will delete "${project.name}" and ALL its data:\n\n• ${taskCount} task${taskCount > 1 ? 's' : ''}\n• ${subtaskCount} subtask${subtaskCount > 1 ? 's' : ''}\n\nThis action cannot be undone. Are you sure?`
      : `Delete project "${project.name}"?`;

    if (!confirm(message)) {
      return;
    }

    try {
      await projectsApi.delete(project.id);
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      alert('Failed to delete project: ' + error.message);
    }
  };

  const handleSaveEdit = async () => {
    try {
      await projectsApi.update(editingProject.id, {
        name: editForm.name,
        description: editForm.description,
      });
      setEditingProject(null);
      setEditForm({ name: '', description: '' });
      // Trigger a project refresh by notifying parent
      if (onProjectUpdate) {
        onProjectUpdate();
      }
    } catch (error) {
      console.error('Failed to save project:', error);
      alert('Failed to save project. Please try again.');
    }
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditForm({ name: '', description: '' });
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showMenu) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

  return (
    <>
      {/* Edit Project Modal */}
      <div style={modalBackdropStyles} onClick={handleCancelEdit}>
        <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
          <h2 style={modalTitleStyles}>Edit Project</h2>
          
          <label style={formLabelStyles}>Project Name</label>
          <input
            type="text"
            value={editForm.name}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            style={inputStyles}
            placeholder="Enter project name"
            autoFocus
          />
          
          <label style={formLabelStyles}>Description</label>
          <textarea
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
            style={textareaStyles}
            placeholder="Enter project description"
          />
          
          <div style={modalButtonsStyles}>
            <button
              style={cancelButtonStyles}
              onClick={handleCancelEdit}
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
              onClick={handleSaveEdit}
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

      <div style={columnStyles}>
        {/* Header */}
        <div
          style={headerStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <div style={titleSectionStyles}>
            <div 
              style={titleRowStyles}
              onClick={handleTitleRowClick}
              onMouseEnter={(e) => {
                if (project.description) {
                  e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[200];
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={projectIconStyles}>
                {project.name.charAt(0).toUpperCase()}
              </div>
              <div style={titleStyles}>{project.name}</div>
              <div style={taskCountStyles}>{tasks.length}</div>
              {project.description && (
                <Icon 
                  name={showDescription ? 'chevronUp' : 'chevronDown'} 
                  size={14} 
                  color={isDark ? theme.text.secondary : colors.grayLight[500]}
                />
              )}
            </div>
            {showDescription && project.description && (
              <div style={descriptionStyles}>
                {project.description}
              </div>
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button
              style={menuButtonStyles}
              onClick={handleMenuClick}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[200];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <Icon name="moreHorizontal" size={18} />
            </button>
            
            {showMenu && (
              <div style={menuStyles}>
                <div
                  style={menuItemStyles}
                  onClick={handleEditProject}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon name="edit" size={14} />
                  <span>Edit Project</span>
                </div>
                <div
                  style={{
                    ...menuItemStyles,
                    borderTop: `1px solid ${isDark ? colors.grayDark[300] : colors.grayLight[200]}`,
                  }}
                  onClick={handleDeleteProject}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <Icon name="trash" size={14} />
                  <span>Delete Project</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Body - Tasks */}
        <div style={bodyStyles}>
          {tasks.length === 0 ? (
            <div style={noTasksStyles}>
              <Icon name="folderOpen" size={32} color={isDark ? theme.text.secondary : colors.grayLight[400]} />
              <div style={noTasksTextStyles}>
                No tasks in this project
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                <button
                  onClick={handleAddTaskClick}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[200],
                    border: 'none',
                    borderRadius: radius.md,
                    color: isDark ? theme.text.primary : colors.grayLight[700],
                    fontSize: typography.sm,
                    fontWeight: typography.weights.medium,
                    cursor: 'pointer',
                    transition: `background-color ${transition.fast}`,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[300];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[200];
                  }}
                >
                  + Add Task
                </button>
                {tasks.length > 0 && (
                  <button
                    onClick={() => setShowTaskSelector(true)}
                    style={{
                      padding: `${spacing.sm} ${spacing.md}`,
                      backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[200],
                      border: 'none',
                      borderRadius: radius.md,
                      color: isDark ? theme.text.primary : colors.grayLight[700],
                      fontSize: typography.sm,
                      fontWeight: typography.weights.medium,
                      cursor: 'pointer',
                      transition: `background-color ${transition.fast}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[300];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[200];
                    }}
                  >
                    + Add Subtask
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {tasks.map(task => (
                <TaskWithSubtasks
                  key={task.id}
                  task={task}
                  isDark={isDark}
                  isExpanded={expandedTaskId === task.id}
                  onExpand={() => handleTaskClick(task.id)}
                  onSubtaskUpdate={handleSubtaskUpdate}
                  onTaskUpdate={onTaskUpdate}
                />
              ))}
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.sm }}>
                <button
                  onClick={handleAddTaskClick}
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    backgroundColor: 'transparent',
                    border: `${border.width} dashed ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
                    borderRadius: radius.md,
                    color: isDark ? theme.text.secondary : colors.grayLight[500],
                    fontSize: typography.sm,
                    fontWeight: typography.weights.medium,
                    cursor: 'pointer',
                    transition: `all ${transition.fast}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
                    e.currentTarget.style.borderColor = isDark ? colors.grayDark[400] : colors.grayLight[400];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
                  }}
                >
                  <Icon name="plus" size={16} />
                  <span>Add Task</span>
                </button>
                <button
                  onClick={() => setShowTaskSelector(true)}
                  style={{
                    width: '100%',
                    padding: spacing.md,
                    backgroundColor: 'transparent',
                    border: `${border.width} dashed ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
                    borderRadius: radius.md,
                    color: isDark ? theme.text.secondary : colors.grayLight[500],
                    fontSize: typography.sm,
                    fontWeight: typography.weights.medium,
                    cursor: 'pointer',
                    transition: `all ${transition.fast}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: spacing.sm,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
                    e.currentTarget.style.borderColor = isDark ? colors.grayDark[400] : colors.grayLight[400];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
                  }}
                >
                  <Icon name="plus" size={16} />
                  <span>Add Subtask</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Task Selector Modal for Subtask */}
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          zIndex: 100,
          display: showTaskSelector ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={() => setShowTaskSelector(false)}
      >
        <div 
          style={{
            backgroundColor: isDark ? colors.grayDark[100] : '#FFFFFF',
            borderRadius: radius.lg,
            padding: spacing.xl,
            width: '400px',
            maxWidth: '90vw',
            maxHeight: '70vh',
            overflow: 'auto',
            boxShadow: isDark ? shadow.cardHoverDark : shadow.cardHoverLight,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2 style={modalTitleStyles}>Select Task for Subtask</h2>
          
          {tasks.length === 0 ? (
            <p style={{
              fontSize: typography.sm,
              color: isDark ? theme.text.secondary : colors.grayLight[500],
              textAlign: 'center',
              padding: spacing.xl,
            }}>
              No tasks available. Create a task first.
            </p>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: spacing.sm,
              marginBottom: spacing.xl,
            }}>
              {tasks.map(task => (
                <button
                  key={task.id}
                  onClick={() => {
                    setShowTaskSelector(false);
                    if (onSelectTaskForSubtask) {
                      onSelectTaskForSubtask(task);
                    }
                  }}
                  style={{
                    padding: `${spacing.sm} ${spacing.md}`,
                    borderRadius: radius.md,
                    backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[100],
                    border: 'none',
                    color: isDark ? theme.text.primary : colors.grayLight[700],
                    fontSize: typography.sm,
                    fontWeight: typography.weights.medium,
                    cursor: 'pointer',
                    transition: `all ${transition.fast}`,
                    textAlign: 'left',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[200];
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
                  }}
                >
                  {task.title}
                </button>
              ))}
            </div>
          )}
          
          <div style={modalButtonsStyles}>
            <button
              style={cancelButtonStyles}
              onClick={() => setShowTaskSelector(false)}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = colors.grayLight[400];
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function TaskWithSubtasks({ task, isDark, isExpanded, onExpand, onSubtaskUpdate, onTaskUpdate }) {
  const { subtasks, loading } = useSubtasks(task.id);

  return (
    <TaskCard
      task={task}
      isDark={isDark}
      subtasks={isExpanded ? subtasks : []}
      onSubtaskUpdate={onSubtaskUpdate}
      totalSubtasks={subtasks.length}
      pendingSubtasks={subtasks.filter(s => s.status !== 'completed').length}
      onExpand={onExpand}
      onTaskUpdate={onTaskUpdate}
    />
  );
}