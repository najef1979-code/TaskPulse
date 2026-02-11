import { useState, useRef } from 'react';
import { PRIORITIES } from '../utils/priorities';
import { formatDate, getDueDateBgColor, getDueDateColor, isOverdue, getDueDateBadge } from '../utils/dates';
import { subtasksApi } from '../services/api';

export function TaskCard({ 
  task, 
  onStatusChange, 
  onDelete, 
  onClick, 
  onUpdate,
  isMobile = false,
  subtaskCount,
  subtasks,
  onSwipeLeft,
  onSwipeRight
}) {
  const [showInlineSubtasks, setShowInlineSubtasks] = useState(false);
  const [localSubtasks, setLocalSubtasks] = useState(subtasks || []);
  const [loadingSubtasks, setLoadingSubtasks] = useState(false);
  const [answeringSubtask, setAnsweringSubtask] = useState(null);
  
  // Swipe gesture state for delete (existing functionality)
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Swipe gesture state for move (new functionality)
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const cardRef = useRef(null);

  const priority = PRIORITIES[task.priority] || PRIORITIES.medium;

  const handleLoadSubtasks = async () => {
    if (showInlineSubtasks) {
      setShowInlineSubtasks(false);
      return;
    }

    setLoadingSubtasks(true);
    try {
      const data = await subtasksApi.getForTask(task.id);
      setLocalSubtasks(data);
      setShowInlineSubtasks(true);
    } catch (err) {
      console.error('Failed to load subtasks:', err);
    } finally {
      setLoadingSubtasks(false);
    }
  };

  const handleAnswerSubtask = async (subtaskId, option) => {
    setAnsweringSubtask(subtaskId);
    try {
      await subtasksApi.answer(subtaskId, option);
      const data = await subtasksApi.getForTask(task.id);
      setLocalSubtasks(data);
      if (onUpdate) onUpdate();
    } catch (err) {
      alert('Failed to answer subtask: ' + err.message);
    } finally {
      setAnsweringSubtask(null);
    }
  };

  // Touch handlers for swipe-to-delete (existing)
  const handleTouchStart = (e) => {
    if (!isMobile) return;
    setTouchStart(e.targetTouches[0].clientX);
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isMobile || !isSwiping) return;
    const currentTouch = e.targetTouches[0].clientX;
    setTouchEnd(currentTouch);
    const offset = currentTouch - touchStart;
    
    // Limit swipe distance for visual feedback
    const maxOffset = isDeleting ? 280 : 80;
    const limitedOffset = Math.max(-maxOffset, Math.min(maxOffset, offset));
    setSwipeOffset(limitedOffset);
  };

  const handleTouchEnd = () => {
    if (!isMobile || !isSwiping) return;
    
    const swipeDistance = touchEnd - touchStart;
    const threshold = 50;

    if (isDeleting) {
      // Delete mode: swipe right to cancel
      if (swipeDistance < -threshold) {
        setIsDeleting(false);
        setSwipeOffset(0);
      }
    } else {
      // Normal mode: handle swipe actions
      if (swipeDistance > threshold) {
        // Swipe right - move to previous column
        if (onSwipeRight) onSwipeRight();
      } else if (swipeDistance < -threshold) {
        // Swipe left - show delete confirmation or move to next column
        if (swipeDistance < -100) {
          setIsDeleting(true);
        } else if (onSwipeLeft) {
          onSwipeLeft();
        }
      }
    }

    // Reset if not in delete mode
    if (!isDeleting) {
      setSwipeOffset(0);
    }
    setIsSwiping(false);
    setTouchStart(0);
    setTouchEnd(0);
  };

  const handleDelete = (e) => {
    if (e) e.stopPropagation();
    
    setIsDeleting(false);
    setSwipeOffset(0);
    
    let message = 'Delete this task?';
    const totalSubtasks = localSubtasks.length || subtaskCount || 0;
    if (totalSubtasks > 0) {
      message = `⚠️ This will delete "${task.title}" and ${totalSubtasks} subtask${totalSubtasks > 1 ? 's' : ''}\n\nAre you sure?`;
    }
    
    if (confirm(message)) {
      onDelete(task.id);
    }
  };

  const answeredCount = localSubtasks.filter(st => st.answered).length;
  const totalLocalSubtasks = localSubtasks.length || subtaskCount || 0;
  const hasProgress = totalLocalSubtasks > 0;

  const cardStyle = {
    ...styles.card,
    ...(isDeleting ? styles.cardDeleting : {}),
    transform: `translateX(${isDeleting ? -280 : swipeOffset}px)`,
    transition: isSwiping ? 'none' : 'transform 0.3s ease',
    backgroundColor: isDeleting ? '#fee2e2' : 'white',
  };

  return (
    <div 
      ref={cardRef}
      style={cardStyle}
      onClick={!isDeleting ? onClick : undefined}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isDeleting && (
        <div style={styles.deleteOverlay}>
          <button style={styles.confirmDeleteButton} onClick={handleDelete}>
            🗑️ Delete
          </button>
          <button 
            style={styles.cancelDeleteButton} 
            onClick={(e) => {
              e.stopPropagation();
              setIsDeleting(false);
              setSwipeOffset(0);
            }}
          >
            ✕ Cancel
          </button>
        </div>
      )}

      {/* Swipe hint for mobile */}
      {isMobile && isSwiping && !isDeleting && (
        <div style={styles.swipeHint}>
          {swipeOffset > 0 ? '← Previous' : swipeOffset < -50 ? 'Delete →' : 'Next →'}
        </div>
      )}

      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <img src="/taskicon.png" alt="" style={styles.taskIcon} />
          <h3 style={styles.title}>{task.title}</h3>
          <span style={{
            ...styles.priorityBadge,
            backgroundColor: priority.bg,
            color: priority.color,
          }}>
            {priority.label}
          </span>
          {task.assigned_to_username && (
            <span style={styles.assigneeBadge}>
              {task.assigned_to_name || task.assigned_to_username}
            </span>
          )}
        </div>
        <button
          style={styles.deleteButton}
          onClick={(e) => {
            e.stopPropagation();
            setIsDeleting(true);
            setSwipeOffset(-280);
          }}
        >
          ✕
        </button>
      </div>

      {/* Status and Due Date row */}
      <div style={styles.metaRow}>
        {(() => {
          let statusText = task.status;
          let statusColor = '#64748b';
          
          if (task.status === 'in_progress') {
            statusText = 'In Progress';
            statusColor = '#0ea5e9';
          } else if (task.status === 'pending') {
            statusText = 'Pending';
            statusColor = '#64748b';
          } else if (task.status === 'done') {
            statusText = 'Done';
            statusColor = '#22c55e';
          } else if (task.status === 'elapsed') {
            statusText = 'Elapsed';
            statusColor = '#ef4444';
          }

          return (
            <span style={{
              ...styles.statusBadge,
              color: statusColor,
            }}>
              {statusText}
            </span>
          );
        })()}

        {task.due_date && (() => {
          const badge = getDueDateBadge(task.due_date);
          return (
            <span style={{
              ...styles.dueDateBadge,
              backgroundColor: badge.bg,
              color: badge.color,
            }}>
              {badge.text}
            </span>
          );
        })()}
      </div>
      
      {task.description && (
        <p style={styles.description}>{task.description}</p>
      )}

      {/* Show file reference if exists */}
      {task.provided_file && task.provided_file !== 'no_file' && (
        <div 
          style={styles.fileReference}
          onClick={(e) => {
            e.stopPropagation();
            if (task.file_reference) {
              navigator.clipboard.writeText(task.file_reference);
              alert('File reference copied to clipboard!');
            }
          }}
          title={task.provided_file === 'emailed' ? 'Email file - Click to copy reference' : 'File on disk - Click to copy reference'}
        >
          <span style={styles.fileIcon}>
            {task.provided_file === 'emailed' ? '📧' : '💾'}
          </span>
          <span style={styles.fileReferenceText}>
            {task.provided_file === 'emailed' ? 'Emailed: ' : 'On Disk: '}
            {task.file_reference || 'No reference'}
          </span>
        </div>
      )}

      {/* Show subtask progress */}
      {hasProgress && (
        <div style={styles.progressContainer}>
          <div style={styles.progressLabel}>
            ✓ {answeredCount}/{totalLocalSubtasks} subtasks
          </div>
          <div style={styles.progressBar}>
            <div style={{
              ...styles.progressFill,
              width: `${(answeredCount / totalLocalSubtasks) * 100}%`
            }} />
          </div>
        </div>
      )}

      {/* Subtask toggle button */}
      {totalLocalSubtasks > 0 && (
        <div
          style={styles.subtaskToggle}
          onClick={(e) => {
            e.stopPropagation();
            handleLoadSubtasks();
          }}
        >
          {showInlineSubtasks ? '▼' : '▶'} Subtasks ({totalLocalSubtasks})
        </div>
      )}

      {/* Inline subtasks section */}
      {showInlineSubtasks && (
        <div style={styles.inlineSubtasks} onClick={(e) => e.stopPropagation()}>
          {loadingSubtasks ? (
            <div style={styles.subtasksLoading}>Loading subtasks...</div>
          ) : localSubtasks.length === 0 ? (
            <div style={styles.noSubtasks}>No subtasks yet</div>
          ) : (
            <div style={styles.subtasksList}>
              {(() => {
                // Group subtasks by type
                const multipleChoiceTasks = localSubtasks.filter(st => 
                  st.type === 'multiple_choice' || (st.options && st.options.length > 0)
                );
                const openAnswerTasks = localSubtasks.filter(st => 
                  st.type === 'open_answer' || (!st.options || st.options.length === 0)
                );

                return (
                  <>
                    {/* Multiple Choice Subtasks */}
                    {multipleChoiceTasks.length > 0 && (
                      <div style={styles.subtaskSection}>
                        <div style={{
                          ...styles.subtaskSectionHeader,
                          ...styles.subtaskSectionHeaderMultipleChoice
                        }}>
                          📝 Multiple Choice ({multipleChoiceTasks.length})
                        </div>
                        {multipleChoiceTasks.map((subtask) => (
                          <div key={subtask.id} style={{
                            ...styles.subtaskItem,
                            ...styles.subtaskItemMultipleChoice
                          }}>
                            <div style={styles.subtaskHeader}>
                              <span style={styles.subtaskQuestion}>
                                {subtask.answered && <span style={styles.subtaskCheck}>✓</span>}
                                {subtask.question}
                              </span>
                              {subtask.assigned_to_name && (
                                <span style={styles.subtaskAssignee}>
                                  👤 {subtask.assigned_to_name}
                                </span>
                              )}
                            </div>

                            {subtask.options.length > 0 && (
                              <div style={styles.subtaskOptions}>
                                {subtask.options.map((option) => (
                                  <button
                                    key={option}
                                    style={{
                                      ...styles.subtaskOption,
                                      ...styles.subtaskOptionMultipleChoice,
                                      ...(subtask.selected_option === option ? styles.subtaskOptionSelected : {}),
                                      ...(subtask.answered || answeringSubtask === subtask.id ? styles.subtaskOptionDisabled : {})
                                    }}
                                    onClick={() => handleAnswerSubtask(subtask.id, option)}
                                    disabled={subtask.answered || answeringSubtask === subtask.id}
                                  >
                                    {option}
                                    {subtask.selected_option === option && ' ✓'}
                                  </button>
                                ))}
                              </div>
                            )}

                            {subtask.answered && subtask.selected_option && (
                              <div style={styles.subtaskAnswer}>
                                ✓ Answered: <strong>{subtask.selected_option}</strong>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Open Answer Subtasks */}
                    {openAnswerTasks.length > 0 && (
                      <div style={styles.subtaskSection}>
                        <div style={{
                          ...styles.subtaskSectionHeader,
                          ...styles.subtaskSectionHeaderOpenAnswer
                        }}>
                          ✍️ Open Answer ({openAnswerTasks.length})
                        </div>
                        {openAnswerTasks.map((subtask) => (
                          <div key={subtask.id} style={{
                            ...styles.subtaskItem,
                            ...styles.subtaskItemOpenAnswer
                          }}>
                            <div style={styles.subtaskHeader}>
                              <span style={styles.subtaskQuestion}>
                                {subtask.answered && <span style={styles.subtaskCheck}>✓</span>}
                                {subtask.question}
                              </span>
                              {subtask.assigned_to_name && (
                                <span style={styles.subtaskAssignee}>
                                  👤 {subtask.assigned_to_name}
                                </span>
                              )}
                            </div>

                            {subtask.answered && subtask.open_answer && (
                              <div style={styles.subtaskAnswer}>
                                ✓ Answered: <strong>{subtask.open_answer}</strong>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      <div style={styles.footer}>
        <span style={styles.date}>
          {isMobile ? 
            new Date(task.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) :
            `Created ${new Date(task.created_at).toLocaleDateString()}`
          }
        </span>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--color-surface-1)',
    padding: 'var(--spacing-lg)',
    borderRadius: 'var(--radius-lg)',
    boxShadow: 'var(--elevation-1)',
    cursor: 'pointer',
    transition: 'all var(--duration-short) var(--easing-standard)',
    marginBottom: 'var(--spacing-md)',
    position: 'relative',
    overflow: 'hidden',
    border: '1px solid var(--color-outline)',
  },
  cardDeleting: {
    backgroundColor: 'var(--color-error-10)',
  },
  deleteOverlay: {
    position: 'absolute',
    right: '0',
    top: '0',
    bottom: '0',
    width: '280px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 'var(--spacing-sm)',
    padding: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-error-10)',
    zIndex: 10,
  },
  confirmDeleteButton: {
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    backgroundColor: 'var(--color-error-60)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: 'var(--label-medium)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
  },
  cancelDeleteButton: {
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-secondary)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: 'var(--label-medium)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
  },
  swipeHint: {
    position: 'absolute',
    bottom: 'var(--spacing-sm)',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--color-primary-60)',
    color: 'var(--color-text-inverse)',
    padding: 'var(--spacing-xs) var(--spacing-md)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--label-small)',
    fontWeight: '500',
    whiteSpace: 'nowrap',
    zIndex: 5,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  },
  taskIcon: {
    width: '26px',
    height: '26px',
    flexShrink: 0,
  },
  priorityBadge: {
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    flexShrink: 0,
  },
  assigneeBadge: {
    padding: '3px 8px',
    borderRadius: 'var(--radius-sm)',
    fontSize: '11px',
    fontWeight: '500',
    backgroundColor: '#dcfce7',
    color: '#14532d',
    flexShrink: 0,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '0',
    width: '24px',
    height: '24px',
    flexShrink: 0,
    marginLeft: 'var(--spacing-xs)',
  },
  metaRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '12px',
    flexWrap: 'wrap',
  },
  statusBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  dueDateBadge: {
    padding: '2px 8px',
    borderRadius: '4px',
    fontSize: '12px',
    fontWeight: '500',
  },
  title: {
    margin: 0,
    font: 'var(--label-large)',
    fontWeight: '800',
    color: 'var(--color-text-primary)',
    transition: 'color var(--duration-short) var(--easing-standard)',
    fontSize: '19px',
  },
  description: {
    margin: '0 0 var(--spacing-md) 0',
    fontSize: 'var(--body-medium)',
    color: 'var(--color-text-secondary)',
    lineHeight: '1.4',
  },
  assignee: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    backgroundColor: 'var(--color-primary-90)',
    color: 'var(--color-primary-30)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--label-small)',
    fontWeight: '500',
    marginBottom: 'var(--spacing-sm)',
  },
  assigneeIcon: {
    fontSize: '14px',
  },
  assigneeName: {
    fontSize: 'var(--label-small)',
  },
  dueDate: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--label-small)',
    fontWeight: '500',
    marginBottom: 'var(--spacing-sm)',
  },
  overdueLabel: {
    fontWeight: '700',
  },
  progressContainer: {
    marginTop: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-sm)',
  },
  progressLabel: {
    fontSize: 'var(--label-small)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-xs)',
  },
  progressBar: {
    height: '4px',
    backgroundColor: 'var(--color-surface-3)',
    borderRadius: 'var(--radius-xs)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'var(--color-secondary-60)',
    transition: 'width var(--duration-medium) var(--easing-standard)',
  },
  subtaskToggle: {
    padding: '8px 12px',
    backgroundColor: '#e0f2fe',
    color: '#0369a1',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: 'var(--spacing-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all var(--duration-short) var(--easing-standard)',
    textTransform: 'capitalize',
  },
  subtaskSection: {
    marginBottom: '16px',
  },
  subtaskSectionHeader: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
    paddingBottom: '6px',
    borderBottom: '2px solid #e2e8f0',
  },
  subtaskSectionHeaderMultipleChoice: {
    color: '#0369a1',
    borderBottomColor: '#bae6fd',
  },
  subtaskSectionHeaderOpenAnswer: {
    color: '#7e22ce',
    borderBottomColor: '#e9d5ff',
  },
  subtaskItemMultipleChoice: {
    backgroundColor: '#e0f2fe',
    borderColor: '#bae6fd',
  },
  subtaskItemOpenAnswer: {
    backgroundColor: '#f3e8ff',
    borderColor: '#e9d5ff',
  },
  subtaskOptionMultipleChoice: {
    backgroundColor: '#bae6fd',
    color: '#0284c7',
    borderColor: '#7dd3fc',
  },
  inlineSubtasks: {
    marginTop: 'var(--spacing-md)',
    paddingTop: 'var(--spacing-md)',
    borderTop: '1px solid var(--color-outline)',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: 'var(--radius-md)',
    padding: 'var(--spacing-md)',
  },
  subtasksLoading: {
    textAlign: 'center',
    color: 'var(--color-text-tertiary)',
    fontSize: 'var(--body-medium)',
    padding: 'var(--spacing-sm)',
  },
  noSubtasks: {
    textAlign: 'center',
    color: 'var(--color-text-tertiary)',
    fontSize: 'var(--body-medium)',
    fontStyle: 'italic',
    padding: 'var(--spacing-sm)',
  },
  subtasksList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  subtaskItem: {
    backgroundColor: 'var(--color-surface-1)',
    padding: 'var(--spacing-md)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-outline)',
  },
  subtaskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
    gap: '8px',
  },
  subtaskQuestion: {
    fontSize: 'var(--body-medium)',
    fontWeight: '500',
    color: 'var(--color-text-primary)',
    flex: 1,
  },
  subtaskCheck: {
    color: 'var(--color-secondary-60)',
    marginRight: 'var(--spacing-xs)',
  },
  subtaskAssignee: {
    fontSize: 'var(--label-small)',
    color: 'var(--color-text-secondary)',
    backgroundColor: 'var(--color-surface-3)',
    padding: '2px var(--spacing-xs)',
    borderRadius: 'var(--radius-xs)',
    whiteSpace: 'nowrap',
  },
  subtaskOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
  },
  subtaskOption: {
    padding: 'var(--spacing-xs) var(--spacing-md)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-secondary)',
    fontSize: 'var(--body-medium)',
    cursor: 'pointer',
    transition: 'all var(--duration-short) var(--easing-standard)',
    fontWeight: '500',
  },
  subtaskOptionSelected: {
    borderColor: 'var(--color-primary-60)',
    backgroundColor: 'var(--color-primary-90)',
    color: 'var(--color-primary-30)',
    fontWeight: '500',
  },
  subtaskOptionDisabled: {
    opacity: 0.38,
    cursor: 'not-allowed',
  },
  subtaskAnswer: {
    marginTop: 'var(--spacing-sm)',
    fontSize: 'var(--body-medium)',
    color: 'var(--color-secondary-60)',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 'var(--spacing-md)',
  },
  date: {
    fontSize: 'var(--label-small)',
    color: 'var(--color-text-tertiary)',
  },
  fileReference: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-xs)',
    padding: 'var(--spacing-xs) var(--spacing-sm)',
    backgroundColor: 'var(--color-surface-3)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--label-small)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-sm)',
    cursor: 'pointer',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  fileReferenceHover: {
    backgroundColor: 'var(--color-surface-4)',
  },
  fileIcon: {
    fontSize: '14px',
  },
  fileReferenceText: {
    fontSize: 'var(--label-small)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    maxWidth: '200px',
  },
};
