import { useState, useEffect } from 'react';
import { tasksApi, subtasksApi, projectsApi } from '../services/api';
import { TaskModal } from './TaskModal';
import { useIsMobile } from '../utils/responsive';
import { useAuth } from '../hooks/useAuth';

export function MyAssignments({ onBack, highlightItem = null }) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedTasks, setExpandedTasks] = useState(new Set());
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [activeProjectId, setActiveProjectId] = useState(null);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const isElapsed = (dueDate, status) => {
    if (status === 'done') return false;
    if (!dueDate) return false;
    const due = new Date(dueDate);
    const buffer = 1 * 24 * 60 * 60 * 1000; // 1 day in ms
    const threshold = due.getTime() + buffer;
    return Date.now() > threshold;
  };

  const getTaskStatus = (task) => {
    if (task.status === 'done') return 'done';
    if (isElapsed(task.due_date, task.status)) return 'elapsed';
    return task.status;
  };

  const getStatusIcon = (status) => {
    const icons = {
      'in-progress': '⚡',
      'pending': '📋',
      'elapsed': '✗',
      'done': '✅'
    };
    return icons[status] || '📋';
  };

  const getStatusColor = (status) => {
    const colors = {
      'in-progress': '#f59e0b',
      'pending': '#6b7280',
      'elapsed': '#dc2626',
      'done': '#22c55e'
    };
    return colors[status] || '#6b7280';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: '#22c55e',
      medium: '#eab308',
      high: '#f97316',
      urgent: '#dc2626'
    };
    return colors[priority] || '#6b7280';
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      
      // Fetch both projects and tasks
      const [fetchedProjects, allTasks] = await Promise.all([
        projectsApi.getAll(),
        tasksApi.getAll()
      ]);

      setProjects(fetchedProjects);

      // Filter tasks that are either assigned to user OR contain subtasks assigned to user
      const tasksWithSubtasks = await Promise.all(
        allTasks.map(async (task) => {
          try {
            const subtasks = await subtasksApi.getForTask(task.id);
            
            // Filter to show only unanswered subtasks assigned to current user (or unassigned)
            const relevantSubtasks = subtasks.filter(st => 
              !st.answered && (!st.assigned_to || st.assigned_to === user.id)
            );
            
            // Include task if:
            // 1. Task is assigned to user, OR
            // 2. Task has subtasks assigned to user (relevantSubtasks.length > 0)
            const isRelevant = task.assigned_to === user.id || relevantSubtasks.length > 0;
            
            if (isRelevant) {
              return {
                ...task,
                subtasks: relevantSubtasks
              };
            }
            
            return null;
          } catch (err) {
            console.error(`Failed to fetch subtasks for task ${task.id}:`, err);
            return null;
          }
        })
      );

      // Filter out null values and set assignments
      const assignments = tasksWithSubtasks.filter(Boolean);
      console.log('MyAssignments - User:', user.username, '(ID:', user.id, ')');
      console.log('MyAssignments - Total tasks fetched:', allTasks.length);
      console.log('MyAssignments - Tasks with relevant subtasks:', assignments.length);
      console.log('MyAssignments - Assignments:', assignments.map(t => ({ id: t.id, title: t.title, subtaskCount: t.subtasks.length })));
      setAssignments(assignments);

      // Set initial active project for mobile
      if (isMobile && assignments.length > 0) {
        const firstTaskProjectId = assignments[0].project_id;
        setActiveProjectId(firstTaskProjectId);
      }
      
      // Expand all tasks by default
      const allTaskIds = assignments.map(t => t.id);
      setExpandedTasks(new Set(allTaskIds));
      
      if (highlightItem && highlightItem.taskId) {
        const taskToExpand = assignments.find(t => t.id === highlightItem.taskId);
        if (taskToExpand) {
          setExpandedTasks(new Set(allTaskIds));
        }
      }
    } catch (err) {
      console.error('Failed to fetch assignments:', err);
      setError('Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenTask = (task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleSaveTask = async (taskId, updates) => {
    try {
      await tasksApi.update(taskId, updates);
      await fetchAssignments();
      setShowTaskModal(false);
    } catch (err) {
      console.error('Failed to update task:', err);
      alert('Failed to update task');
    }
  };

  const handleCompleteTask = async (taskId) => {
    try {
      await tasksApi.complete(taskId);
      await fetchAssignments();
    } catch (err) {
      console.error('Failed to complete task:', err);
      alert('Failed to complete task');
    }
  };

  const handleAnswerSubtask = async (subtaskId, selectedOption) => {
    try {
      await subtasksApi.answer(subtaskId, selectedOption);
      await fetchAssignments();
    } catch (err) {
      console.error('Failed to answer subtask:', err);
      alert('Failed to answer subtask');
    }
  };

  const toggleExpand = (taskId) => {
    const newExpandedTasks = new Set(expandedTasks);
    if (newExpandedTasks.has(taskId)) {
      newExpandedTasks.delete(taskId);
    } else {
      newExpandedTasks.add(taskId);
    }
    setExpandedTasks(newExpandedTasks);
  };

  // Group tasks by project
  const tasksByProject = projects
    .map(project => {
      const projectTasks = assignments.filter(task => {
        const taskStatus = getTaskStatus(task);
        // Filter completed tasks if not showing them
        if (!showCompleted && taskStatus === 'done') return false;
        return task.project_id === project.id;
      });

      // Hide empty projects
      if (projectTasks.length === 0) return null;

      const inProgressCount = projectTasks.filter(t => getTaskStatus(t) === 'in-progress').length;
      const elapsedCount = projectTasks.filter(t => getTaskStatus(t) === 'elapsed').length;
      const pendingCount = projectTasks.filter(t => getTaskStatus(t) === 'pending').length;
      const totalSubtasks = projectTasks.reduce((sum, t) => sum + t.subtasks.length, 0);

      return {
        project,
        tasks: projectTasks,
        inProgressCount,
        elapsedCount,
        pendingCount,
        totalSubtasks
      };
    })
    .filter(Boolean); // Remove null (empty projects)

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.error}>{error}</div>
      </div>
    );
  }

  // Mobile View - Tab-based project switching
  if (isMobile) {
    return (
      <div style={styles.container}>
        <div style={styles.toolbar}>
          <button 
            style={styles.toggleButton}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? '☑' : '☐'} Show Completed
          </button>
        </div>

        {tasksByProject.length === 0 ? (
          <div style={styles.empty}>
            <span style={styles.emptyEmoji}>🎉</span>
            <p style={styles.emptyText}>You're all caught up!</p>
            <p style={styles.emptySubtext}>No active assignments</p>
          </div>
        ) : (
          <>
            {/* Project Tabs */}
            <div style={styles.projectTabs}>
              {tasksByProject.map(({ project }) => (
                <button
                  key={project.id}
                  style={{
                    ...styles.projectTab,
                    ...(activeProjectId === project.id ? styles.projectTabActive : {})
                  }}
                  onClick={() => setActiveProjectId(project.id)}
                >
                  {project.name}
                </button>
              ))}
            </div>

            {/* Active Project Content */}
            {tasksByProject.map(({ project, tasks, inProgressCount, elapsedCount, pendingCount, totalSubtasks }) => {
              if (project.id !== activeProjectId) return null;

              return (
                <div key={project.id} style={styles.mobileProjectContent}>
                  <div style={styles.mobileProjectColumn}>
                    <div style={{
                      ...styles.projectHeader,
                      borderTopColor: elapsedCount > 0 ? '#dc2626' : 
                                     inProgressCount > 0 ? '#f59e0b' : '#6b7280'
                    }}>
                      <div style={styles.projectHeaderLeft}>
                        <h3 style={styles.projectTitle}>
                          <img src="/ProjectIcon.png" alt="" style={styles.projectIcon} />
                          {project.name}
                        </h3>
                        <div style={styles.projectCounts}>
                          {inProgressCount > 0 && (
                            <span style={{...styles.countBadge, color: '#f59e0b'}}>
                              ⚡ {inProgressCount}
                            </span>
                          )}
                          {elapsedCount > 0 && (
                            <span style={{...styles.countBadge, color: '#dc2626'}}>
                              ✗ {elapsedCount}
                            </span>
                          )}
                          {pendingCount > 0 && (
                            <span style={{...styles.countBadge, color: '#6b7280'}}>
                              📋 {pendingCount}
                            </span>
                          )}
                          {totalSubtasks > 0 && (
                            <span style={styles.countBadge}>
                              ✏️ {totalSubtasks}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {tasks.map((task, taskIndex) => {
                    const status = getTaskStatus(task);
                    const isHighlighted = highlightItem && (
                      (highlightItem.entityId === task.id && highlightItem.entityType === 'task') ||
                      (highlightItem.taskId === task.id)
                    );
                    const isExpanded = expandedTasks.has(task.id);
                    const isLastTask = taskIndex === tasks.length - 1;

                    return (
                      <div 
                        key={task.id} 
                        style={{
                          ...styles.taskCard,
                          ...(isHighlighted ? styles.highlightedCard : {}),
                          ...(taskIndex === 0 ? styles.taskCardFirst : {})
                        }}
                      >
                        <div style={{
                          ...styles.taskWrapper,
                          ...(isLastTask ? styles.taskWrapperLast : {})
                        }}>
                          <div style={{
                            ...styles.taskContent,
                            ...(isHighlighted ? styles.highlightedContent : {}),
                            borderLeftColor: getStatusColor(status)
                          }}>
                            <div 
                              style={styles.taskHeader}
                              onClick={() => toggleExpand(task.id)}
                            >
                              <div style={styles.taskInfo}>
                                <img src="/taskicon.png" alt="" style={styles.taskIcon} />
                                <h3 style={styles.taskTitle}>{task.title}</h3>
                                <div style={styles.taskMeta}>
                                  <span 
                                    style={{
                                      ...styles.badge,
                                      backgroundColor: getStatusColor(status)
                                    }}
                                  >
                                    {status}
                                  </span>
                                  {task.due_date && (
                                    <span style={styles.dueDate}>
                                      📅 {new Date(task.due_date).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </div>
                              <button style={styles.expandButton}>
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            </div>

                            {isExpanded && (
                              <>
                                {task.description && (
                                  <p style={styles.taskDescription}>{task.description}</p>
                                )}

                                {task.subtasks.length > 0 && (
                                  <div style={styles.subtasksSection}>
                                    <div style={styles.subtasksList}>
                                      {task.subtasks.map((subtask, subtaskIndex) => (
                                        <div 
                                          key={subtask.id}
                                          style={{
                                            ...styles.subtaskWrapper,
                                            ...(subtaskIndex === task.subtasks.length - 1 ? styles.subtaskWrapperLast : {})
                                          }}
                                        >
                                          <div style={{
                                            ...styles.subtaskContent,
                                            ...(isHighlighted && highlightItem.entityId === subtask.id ? styles.highlightedContentSubtask : {})
                                          }}>
                                            <div style={styles.subtaskQuestion}>
                                              {subtask.answered && <span style={styles.subtaskCheck}>✓</span>}
                                              <span style={styles.subtaskEmoji}>{(subtask.type === 'multiple_choice' || (subtask.options && subtask.options.length > 0)) ? '📝' : '✍️'}</span> {subtask.question}
                                            </div>
                                            {subtask.provided_file && subtask.provided_file !== 'no_file' && (
                                              <div style={styles.subtaskFileReference}>
                                                <span style={styles.subtaskEmoji}>{subtask.provided_file === 'emailed' ? '📧' : '💾'}</span>
                                                <span>{subtask.provided_file === 'emailed' ? 'Emailed' : 'On Disk'}: {subtask.file_reference}</span>
                                              </div>
                                            )}
                                            <div style={styles.subtaskOptions}>
                                              {subtask.options.map((option, idx) => (
                                                <button
                                                  key={idx}
                                                  onClick={() => handleAnswerSubtask(subtask.id, option)}
                                                  style={styles.optionButton}
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div style={styles.actionButtons}>
                                  <button
                                    onClick={() => handleOpenTask(task)}
                                    style={styles.viewButton}
                                  >
                                    👁️ View Details
                                  </button>
                                  {status !== 'done' && (
                                    <button
                                      onClick={() => handleCompleteTask(task.id)}
                                      style={styles.completeButton}
                                    >
                                      ✓ Mark Complete
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {showTaskModal && selectedTask && (
          <TaskModal
            task={selectedTask}
            onSave={(updates) => handleSaveTask(selectedTask.id, updates)}
            onClose={() => {
              setShowTaskModal(false);
              setSelectedTask(null);
            }}
            onDelete={async (taskId) => {
              try {
                await tasksApi.delete(taskId);
                await fetchAssignments();
                setShowTaskModal(false);
              } catch (err) {
                console.error('Failed to delete task:', err);
                alert('Failed to delete task');
              }
            }}
            showSubtasks={true}
          />
        )}
      </div>
    );
  }

  // Desktop View - Horizontal project columns
  return (
      <div style={styles.container}>
        <div style={styles.toolbar}>
          <button 
            style={styles.toggleButton}
            onClick={() => setShowCompleted(!showCompleted)}
          >
            {showCompleted ? '☑' : '☐'} Show Completed
          </button>
        </div>
      {tasksByProject.length === 0 ? (
        <div style={styles.empty}>
          <span style={styles.emptyEmoji}>🎉</span>
          <p style={styles.emptyText}>You're all caught up!</p>
          <p style={styles.emptySubtext}>No active assignments</p>
        </div>
      ) : (
        <div style={styles.projectsGrid}>
          {tasksByProject.map(({ project, tasks, inProgressCount, elapsedCount, pendingCount, totalSubtasks }) => {
            const dominantStatus = elapsedCount > 0 ? 'elapsed' : 
                               inProgressCount > 0 ? 'in-progress' : 'pending';
            
            return (
              <div key={project.id} style={styles.projectColumn}>
                <div 
                  style={{
                    ...styles.projectHeader,
                    borderTopColor: getStatusColor(dominantStatus)
                  }}
                >
                  <div style={styles.projectHeaderLeft}>
                    <h3 style={styles.projectTitle}>
                      <img src="/ProjectIcon.png" alt="" style={styles.projectIcon} />
                      {project.name}
                    </h3>
                    <div style={styles.projectCounts}>
                      {inProgressCount > 0 && (
                        <span style={{...styles.countBadge, color: '#f59e0b'}}>
                          ⚡ {inProgressCount}
                        </span>
                      )}
                      {elapsedCount > 0 && (
                        <span style={{...styles.countBadge, color: '#dc2626'}}>
                          ✗ {elapsedCount}
                        </span>
                      )}
                      {pendingCount > 0 && (
                        <span style={{...styles.countBadge, color: '#6b7280'}}>
                          📋 {pendingCount}
                        </span>
                      )}
                      {totalSubtasks > 0 && (
                        <span style={styles.countBadge}>
                          ✏️ {totalSubtasks}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div style={styles.projectTasks}>
                  {tasks.map((task, taskIndex) => {
                    const status = getTaskStatus(task);
                    const isHighlighted = highlightItem && (
                      (highlightItem.entityId === task.id && highlightItem.entityType === 'task') ||
                      (highlightItem.taskId === task.id)
                    );
                    const isExpanded = expandedTasks.has(task.id);
                    const isLastTask = taskIndex === tasks.length - 1;

                    return (
                      <div 
                        key={task.id} 
                        style={{
                          ...styles.taskCard,
                          ...(isHighlighted ? styles.highlightedCard : {}),
                          ...(taskIndex === 0 ? styles.taskCardFirst : {})
                        }}
                      >
                        <div style={{
                          ...styles.taskWrapper,
                          ...(isLastTask ? styles.taskWrapperLast : {})
                        }}>
                          <div style={{
                            ...styles.taskContent,
                            ...(isHighlighted ? styles.highlightedContent : {}),
                            borderLeftColor: getStatusColor(status)
                          }}>
                            <div 
                              style={styles.taskHeader}
                              onClick={() => toggleExpand(task.id)}
                            >
                              <div style={styles.taskInfo}>
                                <img src="/taskicon.png" alt="" style={styles.taskIcon} />
                                <h3 style={styles.taskTitle}>{task.title}</h3>
                                {task.due_date && (
                                  <span style={styles.dueDate}>
                                    📅 {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                              <button style={styles.expandButton}>
                                {isExpanded ? '▼' : '▶'}
                              </button>
                            </div>

                            {isExpanded && (
                              <>
                                {task.description && (
                                  <p style={styles.taskDescription}>{task.description}</p>
                                )}

                                {task.subtasks.length > 0 && (
                                  <div style={styles.subtasksSection}>
                                    <div style={styles.subtasksList}>
                                      {task.subtasks.map((subtask, subtaskIndex) => (
                                        <div 
                                          key={subtask.id}
                                          style={{
                                            ...styles.subtaskWrapper,
                                            ...(subtaskIndex === task.subtasks.length - 1 ? styles.subtaskWrapperLast : {})
                                          }}
                                        >
                                          <div style={{
                                            ...styles.subtaskContent,
                                            ...(isHighlighted && highlightItem.entityId === subtask.id ? styles.highlightedContentSubtask : {})
                                          }}>
                                            <div style={styles.subtaskQuestion}>
                                              {subtask.answered && <span style={styles.subtaskCheck}>✓</span>}
                                              <span style={styles.subtaskEmoji}>{(subtask.type === 'multiple_choice' || (subtask.options && subtask.options.length > 0)) ? '📝' : '✍️'}</span> {subtask.question}
                                            </div>
                                            {subtask.provided_file && subtask.provided_file !== 'no_file' && (
                                              <div style={styles.subtaskFileReference}>
                                                <span style={styles.subtaskEmoji}>{subtask.provided_file === 'emailed' ? '📧' : '💾'}</span>
                                                <span>{subtask.provided_file === 'emailed' ? 'Emailed' : 'On Disk'}: {subtask.file_reference}</span>
                                              </div>
                                            )}
                                            <div style={styles.subtaskOptions}>
                                              {subtask.options.map((option, idx) => (
                                                <button
                                                  key={idx}
                                                  onClick={() => handleAnswerSubtask(subtask.id, option)}
                                                  style={styles.optionButton}
                                                >
                                                  {option}
                                                </button>
                                              ))}
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                <div style={styles.actionButtons}>
                                  <button
                                    onClick={() => handleOpenTask(task)}
                                    style={styles.viewButton}
                                  >
                                    👁️ View Details
                                  </button>
                                  {status !== 'done' && (
                                    <button
                                      onClick={() => handleCompleteTask(task.id)}
                                      style={styles.completeButton}
                                    >
                                      ✓ Mark Complete
                                    </button>
                                  )}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showTaskModal && selectedTask && (
        <TaskModal
          task={selectedTask}
          onSave={(updates) => handleSaveTask(selectedTask.id, updates)}
          onClose={() => {
            setShowTaskModal(false);
            setSelectedTask(null);
          }}
          onDelete={async (taskId) => {
            try {
              await tasksApi.delete(taskId);
              await fetchAssignments();
              setShowTaskModal(false);
            } catch (err) {
              console.error('Failed to delete task:', err);
              alert('Failed to delete task');
            }
          }}
          showSubtasks={true}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '8px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  mobileHeader: {
    backgroundColor: '#1e293b',
    color: 'white',
    padding: '12px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
  },
  logo: {
    height: '48px',
    width: 'auto',
    flexShrink: 0,
  },
  logoTxt: {
    height: '46px',
    width: 'auto',
    flexShrink: 0,
  },
  mobileLogo: {
    height: '39px',
    width: 'auto',
    flexShrink: 0,
  },
  mobileLogoTxt: {
    height: '37px',
    width: 'auto',
    flexShrink: 0,
  },
  headerRight: {
    flexShrink: 0,
  },
  backButton: {
    height: '40px',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-primary-60)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    font: 'var(--label-large)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  },
  title: {
    margin: 0,
    font: 'var(--headline-medium)',
    fontWeight: '500',
    color: 'var(--color-text-primary)',
  },
  headerRight: {
    display: 'flex',
    gap: 'var(--spacing-md)',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'flex-end',
    padding: 'var(--spacing-md) var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-1)',
    borderBottom: '1px solid var(--color-outline)',
  },
  toggleButton: {
    height: '36px',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-text-primary)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    font: 'var(--label-large)',
    fontWeight: '500',
    transition: 'all var(--duration-short) var(--easing-standard)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
  },
  loading: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    font: 'var(--body-large)',
    color: 'var(--color-text-secondary)',
  },
  error: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    font: 'var(--body-large)',
    color: 'var(--color-error-60)',
  },
  empty: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 'var(--spacing-xxxl)',
    animation: 'fadeIn 300ms var(--easing-standard)',
    gap: 'var(--spacing-lg)',
  },
  emptyEmoji: {
    fontSize: '64px',
    opacity: 0.7,
    animation: 'bounce 2s ease-in-out infinite',
  },
  emptyText: {
    font: 'var(--headline-medium)',
    fontWeight: '500',
    color: 'var(--color-secondary-60)',
    margin: '0 0 var(--spacing-xs) 0',
  },
  emptySubtext: {
    font: 'var(--body-large)',
    color: 'var(--color-text-secondary)',
    margin: 0,
  },
  
  // Desktop specific styles
  projectsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '12px',
    padding: '20px',
    flex: 1,
    overflowY: 'auto',
    backgroundColor: '#f8fafc',
  },
  projectColumn: {
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    border: '2px solid transparent',
    transition: 'all 0.2s',
    overflow: 'hidden',
    minHeight: 'fit-content',
  },
  projectHeader: {
    padding: '12px',
    backgroundColor: 'white',
    borderBottom: '1px solid #e2e8f0',
  },
  projectHeaderLeft: {
    flex: 1,
  },
  projectTitle: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  projectCounts: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    flexWrap: 'wrap',
  },
  countBadge: {
    fontSize: '12px',
    fontWeight: '500',
  },
  projectTasks: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '0 12px 12px',
  },
  
  // Task card styles
  taskCard: {
    backgroundColor: '#f8fafc',
    padding: 0,
    transition: 'all 0.2s',
    animation: 'slideDown 200ms ease-out',
    cursor: 'pointer',
    position: 'relative',
  },
  taskWrapper: {
    position: 'relative',
    paddingLeft: '12px',
    borderLeft: '2px solid #e2e8f0',
    marginLeft: '8px',
    paddingBottom: '8px',
  },
  taskContent: {
    padding: '12px',
    borderRadius: '8px',
    backgroundColor: 'white',
    transition: 'all 0.2s',
    border: '1px solid #f1f5f9',
  },
  taskCardFirst: {
    marginTop: '12px',
  },
  taskWrapperLast: {
    borderLeft: 'none',
  },
  highlightedCard: {
    backgroundColor: 'var(--color-primary-98)',
    border: '2px solid var(--color-primary-60)',
  },
  highlightedContent: {
    backgroundColor: '#eff6ff',
    boxShadow: '0 0 0 3px #3b82f6',
  },
  taskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 'var(--spacing-sm)',
  },
  taskInfo: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    minWidth: 0,
  },
  taskIcon: {
    width: '26px',
    height: '26px',
    flexShrink: 0,
  },
  taskTitle: {
    margin: '0 0 4px 0',
    fontSize: '16px',
    fontWeight: '600',
    color: '#1e293b',
    lineHeight: '1.3',
  },
  taskMeta: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  badge: {
    padding: '4px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '500',
    color: 'white',
    textTransform: 'capitalize',
  },
  dueDate: {
    fontSize: '13px',
    color: '#64748b',
  },
  taskDescription: {
    margin: '0 0 10px 0',
    fontSize: '14px',
    color: '#64748b',
    lineHeight: '1.4',
  },
  
  // Subtask styles
  subtasksSection: {
    marginTop: '8px',
    position: 'relative',
  },
  subtasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  subtaskWrapper: {
    position: 'relative',
    paddingLeft: '12px',
    borderLeft: '2px solid #e2e8f0',
    marginLeft: '8px',
    paddingBottom: '6px',
  },
  subtaskWrapperLast: {
    borderLeft: 'none',
  },
  subtaskContent: {
    padding: '10px',
    borderRadius: '6px',
    backgroundColor: '#f1f5f9',
    borderLeft: '2px solid #6366f1',
    transition: 'all 0.2s',
  },
  highlightedContentSubtask: {
    backgroundColor: '#eff6ff',
    borderLeft: '3px solid #3b82f6',
    boxShadow: '0 0 0 1px #3b82f6',
  },
  subtaskQuestion: {
    margin: '0 0 6px 0',
    fontSize: '13px',
    fontWeight: '500',
    color: '#1e293b',
    lineHeight: '1.4',
  },
  subtaskCheck: {
    color: '#22c55e',
    marginRight: '6px',
    fontSize: '14.3px',
  },
  subtaskEmoji: {
    fontSize: '14.3px',
  },
  subtaskFileReference: {
    marginTop: '8px',
    padding: '6px 10px',
    backgroundColor: '#e0f2fe',
    borderRadius: '4px',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    color: '#0369a1',
  },
  subtaskOptions: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  optionButton: {
    padding: '4px 8px',
    backgroundColor: 'white',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    color: '#1e293b',
    transition: 'all 0.2s',
    fontWeight: '500',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px',
  },
  viewButton: {
    flex: 1,
    height: '32px',
    padding: '0 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  },
  completeButton: {
    flex: 1,
    height: '32px',
    padding: '0 12px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all 0.2s',
  },
  expandButton: {
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: '#94a3b8',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  
  // Mobile specific styles
  projectTabs: {
    display: 'flex',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#f8fafc',
    borderBottom: '1px solid #e2e8f0',
    overflowX: 'auto',
    position: 'sticky',
    top: 0,
    zIndex: 10,
  },
  projectTab: {
    padding: '6px 14px',
    backgroundColor: 'transparent',
    color: '#64748b',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    transition: 'all 0.2s',
  },
  projectTabActive: {
    backgroundColor: '#eff6ff',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
  },
  mobileProjectContent: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },
  mobileProjectColumn: {
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    overflow: 'hidden',
    margin: '8px 16px 16px',
  },
  projectIcon: {
    width: '31px',
    height: '31px',
    flexShrink: 0,
  },
};
