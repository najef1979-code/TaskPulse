import { useState, useEffect, useCallback } from 'react';
import { tasksApi, subtasksApi } from '../services/api';
import { AssignmentSelector } from './AssignmentSelector';
import { EditSubtaskModal } from './EditSubtaskModal';
import { formatDateLong, getDueDateColor, toISODate } from '../utils/dates';

/**
 * TaskModal - Handles both CREATE and EDIT modes
 * 
 * CREATE mode: Pass `projectId` and `isOpen={true}` (no `task` prop)
 * EDIT mode: Pass `task` object (with existing task data)
 */
export function TaskModal({ task, projectId, isOpen, onClose, onUpdate, onSave, onTasksRefresh }) {
  // Determine mode: EDIT if task provided, CREATE if only projectId
  const isEditMode = !!task;
  const isCreateMode = !task && !!projectId;
  
  // Support both onUpdate and onSave for backward compatibility
  const handleUpdate = onUpdate || onSave || (() => {});

  // Task data state
  const [fullTask, setFullTask] = useState(null);
  const [loading, setLoading] = useState(isEditMode);
  
  // Form state (used for both create and edit)
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [dueDate, setDueDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [assignedTo, setAssignedTo] = useState(null);
  
  // UI state
  const [editingDates, setEditingDates] = useState(false);
  const [editingTask, setEditingTask] = useState(false);
  const [loadedTaskId, setLoadedTaskId] = useState(null);
  
  // Subtask state
  const [newSubtaskQuestion, setNewSubtaskQuestion] = useState('');
  const [newSubtaskOptions, setNewSubtaskOptions] = useState('');
  const [newSubtaskType, setNewSubtaskType] = useState('multiple_choice');
  const [newSubtaskProvidedFile, setNewSubtaskProvidedFile] = useState('no_file');
  const [newSubtaskFileReference, setNewSubtaskFileReference] = useState('');
  const [editSubtask, setEditSubtask] = useState(null);

  // Load full task data in EDIT mode
  const loadFullTask = useCallback(async () => {
    if (!isEditMode || !task?.id) {
      setLoading(false);
      return;
    }

    // Don't reload if we already loaded this task
    if (loadedTaskId === task.id) return;
    
    try {
      const data = await tasksApi.getFull(task.id);
      setFullTask(data);
      setTitle(data.title);
      setDescription(data.description || '');
      setPriority(data.priority || 'medium');
      setStatus(data.status || 'pending');
      setDueDate(data.due_date ? toISODate(data.due_date) : '');
      setStartDate(data.start_date ? toISODate(data.start_date) : '');
      setAssignedTo(data.assigned_to);
      setLoadedTaskId(task.id);
    } catch (err) {
      console.error('TaskModal: Failed to load task', err);
      // Fall back to using the task object passed in
      setFullTask(task);
      setTitle(task.title);
      setDescription(task.description || '');
      setPriority(task.priority || 'medium');
      setStatus(task.status || 'pending');
      setDueDate(task.due_date ? toISODate(task.due_date) : '');
      setStartDate(task.start_date ? toISODate(task.start_date) : '');
      setAssignedTo(task.assigned_to);
      setLoadedTaskId(task.id);
    } finally {
      setLoading(false);
    }
  }, [isEditMode, task?.id, loadedTaskId]);

  useEffect(() => {
    loadFullTask();
  }, [loadFullTask]);

  // Reset form when modal opens in CREATE mode
  useEffect(() => {
    if (isCreateMode && isOpen) {
      setTitle('');
      setDescription('');
      setPriority('medium');
      setStatus('pending');
      setDueDate('');
      setStartDate('');
      setAssignedTo(null);
    }
  }, [isCreateMode, isOpen]);

  // CREATE: Handle new task creation
  const handleCreateTask = async () => {
    if (!title.trim()) {
      alert('Please enter a task title');
      return;
    }

    if (!projectId) {
      console.error('TaskModal: projectId is undefined or null');
      alert('No project selected. Please close this dialog and try again.');
      return;
    }

    console.log('Creating task with projectId:', projectId);
    console.log('Task data being sent:', {
      title,
      description,
      priority,
      status,
      project_id: projectId,
      due_date: dueDate || null,
      start_date: startDate || null,
      assigned_to: assignedTo,
    });

    try {
      const result = await tasksApi.create({
        title,
        description,
        priority,
        status,
        project_id: projectId,
        due_date: dueDate || null,
        start_date: startDate || null,
        assigned_to: assignedTo,
      });
      console.log('Task created successfully:', result);
      onClose();
      if (onTasksRefresh) onTasksRefresh();
    } catch (err) {
      console.error('TaskModal: Failed to create task', err);
      console.error('Full error object:', JSON.stringify(err, null, 2));
      alert('Failed to create task: ' + err.message + '\n\nCheck browser console (F12) for details.');
    }
  };

  // EDIT: Handle task update
  const handleSaveTaskEdit = async () => {
    if (!task?.id || !title.trim()) {
      alert('Please enter a task title');
      return;
    }

    try {
      await tasksApi.update(task.id, {
        title,
        description,
        priority,
        status,
      });
      setEditingTask(false);
      loadFullTask();
      handleUpdate();
      if (onTasksRefresh) onTasksRefresh();
    } catch (err) {
      alert('Failed to update task: ' + err.message);
    }
  };

  // EDIT: Handle dates update
  const handleUpdateDates = async () => {
    if (!task?.id) return;
    try {
      await tasksApi.update(task.id, {
        due_date: dueDate || null,
        start_date: startDate || null
      });
      setEditingDates(false);
      loadFullTask();
      handleUpdate();
      if (onTasksRefresh) onTasksRefresh();
    } catch (err) {
      alert('Failed to update dates: ' + err.message);
    }
  };

  // EDIT: Handle subtask creation
  const handleCreateSubtask = async () => {
    if (!task?.id || !newSubtaskQuestion.trim()) return;

    const options = newSubtaskType === 'multiple_choice' 
      ? newSubtaskOptions.split('\n').map(o => o.trim()).filter(o => o.length > 0)
      : [];

    const subtaskData = {
      taskId: task.id,
      question: newSubtaskQuestion,
      type: newSubtaskType,
      provided_file: newSubtaskProvidedFile,
    };

    if (newSubtaskType === 'multiple_choice' && options.length > 0) {
      subtaskData.options = options;
    }

    if (newSubtaskProvidedFile !== 'no_file') {
      subtaskData.file_reference = newSubtaskFileReference.trim();
    }

    try {
      await subtasksApi.create(subtaskData);
      setNewSubtaskQuestion('');
      setNewSubtaskOptions('');
      setNewSubtaskType('multiple_choice');
      setNewSubtaskProvidedFile('no_file');
      setNewSubtaskFileReference('');
      loadFullTask();
      handleUpdate();
      if (onTasksRefresh) onTasksRefresh();
    } catch (err) {
      alert('Failed to create subtask: ' + err.message);
    }
  };

  // EDIT: Handle subtask answer
  const handleAnswerSubtask = async (subtaskId, option) => {
    try {
      await subtasksApi.answer(subtaskId, option);
      loadFullTask();
    } catch (err) {
      alert('Failed to answer subtask: ' + err.message);
    }
  };

  // Don't render in CREATE mode if not open
  if (isCreateMode && !isOpen) return null;

  // Loading state (EDIT mode only)
  if (loading) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ==================== CREATE MODE ====================
  if (isCreateMode) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <div style={styles.header}>
            <h2 style={styles.title}>Create New Task</h2>
            <button style={styles.closeButton} onClick={onClose}>✕</button>
          </div>

          <div style={styles.createForm}>
            <label style={styles.editLabel}>Task Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              placeholder="Enter task title..."
              autoFocus
            />

            <label style={styles.editLabel}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              placeholder="Add a description..."
            />

            <label style={styles.editLabel}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label style={styles.editLabel}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={styles.select}
            >
              <option value="pending">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <label style={styles.editLabel}>Assignee</label>
            <AssignmentSelector
              currentAssignee={assignedTo}
              onAssign={setAssignedTo}
            />

            <div style={styles.dateInputs}>
              <div style={styles.dateField}>
                <label style={styles.dateLabel}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              <div style={styles.dateField}>
                <label style={styles.dateLabel}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
            </div>

            <div style={styles.createButtons}>
              <button onClick={handleCreateTask} style={styles.saveEditButton}>
                Create Task
              </button>
              <button onClick={onClose} style={styles.cancelEditButton}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==================== EDIT MODE ====================
  if (!fullTask) {
    return (
      <div style={styles.overlay} onClick={onClose}>
        <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
          <p>Loading task details...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.title}>{fullTask.title}</h2>
          <div style={styles.headerRight}>
            {!editingTask && (
              <button 
                style={styles.editTaskButton}
                onClick={() => setEditingTask(true)}
              >
                ✏️ Edit Task
              </button>
            )}
            <button style={styles.closeButton} onClick={onClose}>
              ✕
            </button>
          </div>
        </div>

        {editingTask ? (
          <div style={styles.taskEditForm}>
            <label style={styles.editLabel}>Task Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
              autoFocus
            />

            <label style={styles.editLabel}>Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={styles.textarea}
              placeholder="Add a description..."
            />

            <label style={styles.editLabel}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={styles.select}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <label style={styles.editLabel}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              style={styles.select}
            >
              <option value="pending">To Do</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <div style={styles.taskEditButtons}>
              <button onClick={handleSaveTaskEdit} style={styles.saveEditButton}>
                Save Changes
              </button>
              <button onClick={() => {
                setEditingTask(false);
                setTitle(fullTask.title);
                setDescription(fullTask.description || '');
                setPriority(fullTask.priority || 'medium');
                setStatus(fullTask.status || 'pending');
              }} style={styles.cancelEditButton}>
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            {fullTask.description && (
              <p style={styles.description}>{fullTask.description}</p>
            )}

            <div style={styles.metadata}>
              <span>Status: <strong>{fullTask.status}</strong></span>
              <span>Priority: <strong>{fullTask.priority}</strong></span>
              <span>Created: {new Date(fullTask.created_at).toLocaleDateString()}</span>
            </div>
          </>
        )}

        {/* Assignment Section */}
        <div style={styles.assignmentSection}>
          <div style={styles.assignmentHeader}>
            <h3 style={styles.sectionTitle}>Assignee</h3>
          </div>
          <AssignmentSelector
            currentAssignee={fullTask.assigned_to}
            onAssign={async (userId) => {
              try {
                await tasksApi.assign(task.id, userId);
                loadFullTask();
                handleUpdate();
                if (onTasksRefresh) onTasksRefresh();
              } catch (err) {
                alert('Failed to assign task: ' + err.message);
              }
            }}
          />
        </div>

        {/* Dates Section */}
        <div style={styles.datesSection}>
          <div style={styles.datesSectionHeader}>
            <h3 style={styles.sectionTitle}>Dates</h3>
            {!editingDates && (
              <button 
                style={styles.editButton}
                onClick={() => setEditingDates(true)}
              >
                Edit
              </button>
            )}
          </div>

          {editingDates ? (
            <div style={styles.dateEditForm}>
              <div style={styles.dateField}>
                <label style={styles.dateLabel}>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              <div style={styles.dateField}>
                <label style={styles.dateLabel}>Due Date</label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  style={styles.dateInput}
                />
              </div>
              <div style={styles.dateEditButtons}>
                <button onClick={handleUpdateDates} style={styles.saveDateButton}>
                  Save
                </button>
                <button 
                  onClick={() => {
                    setEditingDates(false);
                    setDueDate(fullTask.due_date ? toISODate(fullTask.due_date) : '');
                    setStartDate(fullTask.start_date ? toISODate(fullTask.start_date) : '');
                  }}
                  style={styles.cancelDateButton}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div style={styles.dateDisplay}>
              {fullTask.start_date && (
                <div style={styles.dateItem}>
                  <span style={styles.dateItemLabel}>Start:</span>
                  <span>{formatDateLong(fullTask.start_date)}</span>
                </div>
              )}
              {fullTask.due_date && (
                <div style={{
                  ...styles.dateItem,
                  color: getDueDateColor(fullTask.due_date)
                }}>
                  <span style={styles.dateItemLabel}>Due:</span>
                  <span>{formatDateLong(fullTask.due_date)}</span>
                </div>
              )}
              {!fullTask.start_date && !fullTask.due_date && (
                <div style={styles.noDate}>No dates set</div>
              )}
            </div>
          )}
        </div>

        <hr style={styles.divider} />

        <h3 style={styles.sectionTitle}>
          Subtasks ({fullTask.subtasks?.length || 0})
        </h3>

        {fullTask.subtasks && fullTask.subtasks.length > 0 && (
          <div style={styles.subtaskList}>
            {(() => {
              const multipleChoiceTasks = fullTask.subtasks.filter(st => 
                st.type === 'multiple_choice' || (st.options && st.options.length > 0)
              );
              const openAnswerTasks = fullTask.subtasks.filter(st => 
                st.type === 'open_answer' || (!st.options || st.options.length === 0)
              );

              return (
                <>
                  {multipleChoiceTasks.length > 0 && (
                    <div style={styles.subtaskSection}>
                      <div style={styles.subtaskSectionHeader}>
                        <div style={styles.subtaskSectionHeaderTitle}>
                          📝 Multiple Choice ({multipleChoiceTasks.length})
                        </div>
                      </div>
                      {multipleChoiceTasks.map((subtask) => (
                        <div key={subtask.id} style={{
                          ...styles.subtask,
                          ...styles.subtaskMultipleChoice
                        }}>
                          <div style={styles.subtaskHeader}>
                            <div style={styles.subtaskQuestion}>
                              {subtask.answered && <span style={styles.checkmark}>✓</span>}
                              {subtask.question}
                            </div>
                            <div style={styles.subtaskHeaderRight}>
                              <AssignmentSelector
                                currentAssignee={subtask.assigned_to}
                                onAssign={async (userId) => {
                                  try {
                                    await subtasksApi.update(subtask.id, { assigned_to: userId });
                                    loadFullTask();
                                    handleUpdate();
                                    if (onTasksRefresh) onTasksRefresh();
                                  } catch (err) {
                                    alert('Failed to assign subtask: ' + err.message);
                                  }
                                }}
                                disabled={subtask.answered}
                              />
                              <button
                                style={styles.editSubtaskButton}
                                onClick={() => setEditSubtask(subtask)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </div>

                          {subtask.options.length > 0 && (
                            <div style={styles.options}>
                              {subtask.options.map((option) => (
                                <button
                                  key={option}
                                  style={{
                                    ...styles.option,
                                    ...styles.optionMultipleChoice,
                                    ...(subtask.selected_option === option ? styles.optionSelected : {}),
                                  }}
                                  onClick={() => handleAnswerSubtask(subtask.id, option)}
                                >
                                  {option}
                                </button>
                              ))}
                            </div>
                          )}

                          {subtask.answered && (
                            <div style={styles.answer}>
                              <strong>Answer:</strong> {subtask.selected_option}
                            </div>
                          )}

                          {subtask.provided_file !== 'no_file' && (
                            <div style={styles.fileReference}>
                              <span style={styles.fileIcon}>
                                {subtask.provided_file === 'emailed' ? '📧' : '💾'}
                              </span>
                              <span>
                                <strong>{subtask.provided_file === 'emailed' ? 'Emailed' : 'On Disk'}:</strong>{' '}
                                {subtask.file_reference}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {openAnswerTasks.length > 0 && (
                    <div style={styles.subtaskSection}>
                      <div style={styles.subtaskSectionHeader}>
                        <div style={styles.subtaskSectionHeaderTitle}>
                          ✍️ Open Answer ({openAnswerTasks.length})
                        </div>
                      </div>
                      {openAnswerTasks.map((subtask) => (
                        <div key={subtask.id} style={{
                          ...styles.subtask,
                          ...styles.subtaskOpenAnswer
                        }}>
                          <div style={styles.subtaskHeader}>
                            <div style={styles.subtaskQuestion}>
                              {subtask.answered && <span style={styles.checkmark}>✓</span>}
                              {subtask.question}
                            </div>
                            <div style={styles.subtaskHeaderRight}>
                              <AssignmentSelector
                                currentAssignee={subtask.assigned_to}
                                onAssign={async (userId) => {
                                  try {
                                    await subtasksApi.update(subtask.id, { assigned_to: userId });
                                    loadFullTask();
                                    handleUpdate();
                                    if (onTasksRefresh) onTasksRefresh();
                                  } catch (err) {
                                    alert('Failed to assign subtask: ' + err.message);
                                  }
                                }}
                                disabled={subtask.answered}
                              />
                              <button
                                style={styles.editSubtaskButton}
                                onClick={() => setEditSubtask(subtask)}
                              >
                                ✏️ Edit
                              </button>
                            </div>
                          </div>

                          {subtask.type === 'open_answer' && !subtask.answered && (
                            <div style={styles.openAnswerContainer}>
                              <input
                                type="text"
                                placeholder="Enter your answer..."
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter' && e.target.value.trim()) {
                                    handleAnswerSubtask(subtask.id, e.target.value.trim());
                                    e.target.value = '';
                                  }
                                }}
                                style={styles.openAnswerInput}
                              />
                            </div>
                          )}

                          {subtask.answered && (
                            <div style={styles.answer}>
                              <strong>Answer:</strong> {subtask.selected_option}
                            </div>
                          )}

                          {subtask.provided_file !== 'no_file' && (
                            <div style={styles.fileReference}>
                              <span style={styles.fileIcon}>
                                {subtask.provided_file === 'emailed' ? '📧' : '💾'}
                              </span>
                              <span>
                                <strong>{subtask.provided_file === 'emailed' ? 'Emailed' : 'On Disk'}:</strong>{' '}
                                {subtask.file_reference}
                              </span>
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

        {editSubtask && (
          <EditSubtaskModal
            subtask={editSubtask}
            onClose={() => setEditSubtask(null)}
            onUpdate={() => {
              setEditSubtask(null);
              loadFullTask();
              handleUpdate();
            }}
            onTasksRefresh={onTasksRefresh}
          />
        )}

        <div style={styles.newSubtaskForm}>
          <h4 style={styles.formTitle}>Add Subtask</h4>
          
          <div style={styles.typeSelector}>
            <label style={styles.typeLabel}>Type:</label>
            <div style={styles.typeButtons}>
              <button
                style={{
                  ...styles.typeButton,
                  ...(newSubtaskType === 'multiple_choice' ? styles.typeButtonActive : {})
                }}
                onClick={() => setNewSubtaskType('multiple_choice')}
              >
                Multiple Choice
              </button>
              <button
                style={{
                  ...styles.typeButton,
                  ...(newSubtaskType === 'open_answer' ? styles.typeButtonActive : {})
                }}
                onClick={() => setNewSubtaskType('open_answer')}
              >
                Open Answer
              </button>
            </div>
          </div>

          <input
            type="text"
            placeholder="Question or decision to make"
            value={newSubtaskQuestion}
            onChange={(e) => setNewSubtaskQuestion(e.target.value)}
            style={styles.input}
          />

          {newSubtaskType === 'multiple_choice' && (
            <textarea
              placeholder="Options (one per line, optional)"
              value={newSubtaskOptions}
              onChange={(e) => setNewSubtaskOptions(e.target.value)}
              style={styles.textarea}
            />
          )}

          <div style={styles.fileSection}>
            <label style={styles.fileLabel}>📁 File Reference:</label>
            <select
              value={newSubtaskProvidedFile}
              onChange={(e) => setNewSubtaskProvidedFile(e.target.value)}
              style={styles.selectInput}
            >
              <option value="no_file">No File</option>
              <option value="emailed">Emailed</option>
              <option value="on_disk">On Disk</option>
            </select>

            {newSubtaskProvidedFile !== 'no_file' && (
              <input
                type="text"
                placeholder={
                  newSubtaskProvidedFile === 'emailed'
                    ? "Email subject (e.g., 'Report Attached')"
                    : "File path (e.g., '/documents/report.pdf')"
                }
                value={newSubtaskFileReference}
                onChange={(e) => setNewSubtaskFileReference(e.target.value)}
                style={styles.input}
                required
              />
            )}
          </div>

          <button 
            onClick={handleCreateSubtask} 
            style={styles.createButton}
            disabled={
              !newSubtaskQuestion.trim() ||
              (newSubtaskProvidedFile !== 'no_file' && !newSubtaskFileReference.trim())
            }
          >
            Add Subtask
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(2px)',
    animation: 'fadeIn 200ms var(--easing-emphasized-decelerate)',
  },
  modal: {
    backgroundColor: 'var(--color-surface-1)',
    borderRadius: 'var(--radius-xxl)',
    padding: 'var(--spacing-xl)',
    maxWidth: '600px',
    width: '90%',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: 'var(--elevation-3)',
    animation: 'scaleIn 250ms var(--easing-emphasized-decelerate)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--spacing-lg)',
  },
  headerRight: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    font: 'var(--headline-small)',
    fontWeight: '400',
    flex: 1,
    color: 'var(--color-text-primary)',
  },
  closeButton: {
    background: 'none',
    border: 'none',
    fontSize: '24px',
    cursor: 'pointer',
    color: 'var(--color-text-tertiary)',
    padding: 'var(--spacing-xs)',
    borderRadius: 'var(--radius-full)',
    transition: 'background-color var(--duration-short) var(--easing-standard)',
  },
  editTaskButton: {
    height: '36px',
    padding: '0 var(--spacing-md)',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-primary-60)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  createForm: {
    padding: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-lg)',
  },
  taskEditForm: {
    padding: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: 'var(--radius-md)',
    marginBottom: 'var(--spacing-lg)',
  },
  editLabel: {
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-xs)',
    display: 'block',
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
    cursor: 'pointer',
  },
  taskEditButtons: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    marginTop: 'var(--spacing-md)',
  },
  createButtons: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    marginTop: 'var(--spacing-md)',
  },
  saveEditButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'var(--color-primary-60)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'var(--label-large)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  cancelEditButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-primary-60)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'var(--label-large)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  description: {
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-lg)',
    lineHeight: '1.5',
    font: 'var(--body-medium)',
  },
  metadata: {
    display: 'flex',
    gap: 'var(--spacing-lg)',
    fontSize: 'var(--body-medium)',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-lg)',
    flexWrap: 'wrap',
  },
  divider: {
    border: 'none',
    borderTop: '1px solid var(--color-outline)',
    margin: 'var(--spacing-xl) 0',
  },
  assignmentSection: {
    marginBottom: 'var(--spacing-lg)',
    padding: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: 'var(--radius-md)',
  },
  assignmentHeader: {
    marginBottom: 'var(--spacing-sm)',
  },
  sectionTitle: {
    font: 'var(--title-large)',
    fontWeight: '500',
    marginBottom: 'var(--spacing-lg)',
    color: 'var(--color-text-primary)',
  },
  subtaskList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-lg)',
    marginBottom: 'var(--spacing-xl)',
  },
  subtaskSection: {
    marginBottom: '24px',
  },
  subtaskSectionHeader: {
    marginBottom: '12px',
  },
  subtaskSectionHeaderTitle: {
    fontSize: '16px',
    fontWeight: '600',
    paddingBottom: '8px',
    borderBottom: '2px solid #e2e8f0',
  },
  subtaskMultipleChoice: {
    backgroundColor: 'var(--color-primary-90)',
    borderColor: 'var(--color-primary-70)',
  },
  subtaskOpenAnswer: {
    backgroundColor: 'var(--color-secondary-90)',
    borderColor: 'var(--color-secondary-70)',
  },
  optionMultipleChoice: {
    backgroundColor: 'var(--color-primary-70)',
    color: 'var(--color-primary-60)',
    borderColor: 'var(--color-primary-40)',
  },
  subtask: {
    padding: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid var(--color-outline)',
  },
  subtaskQuestion: {
    fontWeight: '500',
    marginBottom: 'var(--spacing-md)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    font: 'var(--body-medium)',
    color: 'var(--color-text-primary)',
  },
  checkmark: {
    color: 'var(--color-secondary-60)',
    fontSize: '18px',
  },
  options: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-sm)',
  },
  option: {
    padding: 'var(--spacing-sm) var(--spacing-lg)',
    border: '2px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-1)',
    cursor: 'pointer',
    transition: 'all var(--duration-short) var(--easing-standard)',
    font: 'var(--label-large)',
  },
  optionSelected: {
    borderColor: 'var(--color-primary-60)',
    backgroundColor: 'var(--color-primary-90)',
    color: 'var(--color-primary-30)',
    fontWeight: '500',
  },
  answer: {
    marginTop: 'var(--spacing-md)',
    fontSize: 'var(--body-medium)',
    color: 'var(--color-secondary-60)',
  },
  newSubtaskForm: {
    padding: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: 'var(--radius-md)',
  },
  formTitle: {
    font: 'var(--title-medium)',
    fontWeight: '500',
    marginBottom: 'var(--spacing-md)',
    color: 'var(--color-text-primary)',
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
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  createButton: {
    width: '100%',
    height: '40px',
    padding: '0 var(--spacing-xl)',
    backgroundColor: 'var(--color-primary-60)',
    color: 'var(--color-text-inverse)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'var(--label-large)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  datesSection: {
    marginBottom: 'var(--spacing-xl)',
  },
  datesSectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 'var(--spacing-md)',
  },
  editButton: {
    padding: 'var(--spacing-xs) var(--spacing-md)',
    backgroundColor: 'var(--color-surface-3)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-full)',
    fontSize: 'var(--label-large)',
    cursor: 'pointer',
    color: 'var(--color-primary-60)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  dateEditForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-md)',
    padding: 'var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-2)',
    borderRadius: 'var(--radius-md)',
  },
  dateField: {
    display: 'flex',
    flexDirection: 'column',
  },
  dateLabel: {
    font: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-xs)',
  },
  dateInput: {
    height: '56px',
    padding: '0 var(--spacing-lg)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
    boxSizing: 'border-box',
    width: '100%',
  },
  dateInputs: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
    marginBottom: 'var(--spacing-md)',
  },
  dateEditButtons: {
    display: 'flex',
    gap: '8px',
  },
  saveDateButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-lg)',
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
  },
  cancelDateButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-lg)',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-primary-60)',
    border: 'none',
    borderRadius: 'var(--radius-full)',
    cursor: 'pointer',
    fontWeight: '500',
    fontSize: 'var(--label-large)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  dateDisplay: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  dateItem: {
    display: 'flex',
    gap: '8px',
    fontSize: '14px',
  },
  dateItemLabel: {
    fontWeight: '500',
    color: '#64748b',
  },
  noDate: {
    fontSize: '14px',
    color: '#94a3b8',
    fontStyle: 'italic',
  },
  subtaskHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 'var(--spacing-md)',
    gap: 'var(--spacing-sm)',
  },
  subtaskHeaderRight: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
  },
  editSubtaskButton: {
    padding: '4px 8px',
    fontSize: '12px',
    backgroundColor: 'var(--color-surface-3)',
    color: 'var(--color-primary-60)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    cursor: 'pointer',
    fontWeight: '500',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  openAnswerContainer: {
    marginTop: 'var(--spacing-sm)',
  },
  openAnswerInput: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    border: '2px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  fileReference: {
    marginTop: 'var(--spacing-md)',
    padding: 'var(--spacing-sm)',
    backgroundColor: 'var(--color-primary-90)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--label-small)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-sm)',
    color: 'var(--color-primary-30)',
  },
  fileIcon: {
    fontSize: '16px',
  },
  typeSelector: {
    marginBottom: 'var(--spacing-md)',
  },
  typeLabel: {
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-sm)',
    display: 'block',
  },
  typeButtons: {
    display: 'flex',
    gap: 'var(--spacing-sm)',
  },
  typeButton: {
    flex: 1,
    height: '40px',
    padding: '0 var(--spacing-md)',
    border: '2px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    backgroundColor: 'var(--color-surface-1)',
    cursor: 'pointer',
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.1px',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
  typeButtonActive: {
    borderColor: 'var(--color-primary-60)',
    backgroundColor: 'var(--color-primary-90)',
    color: 'var(--color-primary-30)',
  },
  fileSection: {
    marginTop: 'var(--spacing-md)',
    marginBottom: 'var(--spacing-md)',
  },
  fileLabel: {
    fontSize: 'var(--label-large)',
    fontWeight: '500',
    color: 'var(--color-text-secondary)',
    marginBottom: 'var(--spacing-sm)',
    display: 'block',
  },
  selectInput: {
    width: '100%',
    height: '56px',
    padding: '0 var(--spacing-lg)',
    marginBottom: 'var(--spacing-sm)',
    border: '1px solid var(--color-outline)',
    borderRadius: 'var(--radius-sm)',
    fontSize: 'var(--body-large)',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-surface-1)',
    color: 'var(--color-text-primary)',
    transition: 'all var(--duration-short) var(--easing-standard)',
  },
};