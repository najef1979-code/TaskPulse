import { useState } from 'react';
import { useIsMobile } from '../utils/responsive';

export function ProjectSelector({ projects, selectedProject, onSelectProject, onCreateProject, onDeleteProject }) {
  const isMobile = useIsMobile();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      await onCreateProject({ name, description });
      setName('');
      setDescription('');
      setShowForm(false);
    } catch (err) {
      alert('Failed to create project: ' + err.message);
    }
  };

  const handleDeleteProject = async (e, project) => {
    e.stopPropagation();
    
    if (project.tasks && project.tasks.length > 0) {
      const taskCount = project.tasks.length;
      const confirmed = confirm(
        `⚠️ This will delete "${project.name}" and ALL its data:\n\n` +
        `• ${taskCount} task${taskCount > 1 ? 's' : ''}\n` +
        `• All subtasks within those tasks\n\n` +
        `This action cannot be undone. Are you sure?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(`Delete project "${project.name}"?`);
      if (!confirmed) return;
    }

    try {
      await onDeleteProject(project.id);
    } catch (err) {
      alert('Failed to delete project: ' + err.message);
    }
  };

  return (
    <div style={isMobile ? styles.mobileContainer : styles.container}>
      {isMobile && (
        <div style={styles.mobileHeader}>
          <h2 style={styles.mobileTitle}>Projects</h2>
        </div>
      )}

      {!isMobile && (
        <div style={styles.header}>
          <h2 style={styles.title}>Projects</h2>
          <button 
            style={styles.newButton}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? '✕' : '+ New Project'}
          </button>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} style={isMobile ? styles.mobileForm : styles.form}>
          <input
            type="text"
            placeholder="Project name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={isMobile ? styles.mobileInput : styles.input}
            autoFocus
          />
          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={isMobile ? styles.mobileTextarea : styles.textarea}
          />
          <button type="submit" style={isMobile ? styles.mobileSubmitButton : styles.submitButton}>
            Create Project
          </button>
          {isMobile && (
            <button 
              type="button" 
              onClick={() => {
                setShowForm(false);
                setName('');
                setDescription('');
              }}
              style={styles.mobileCancelButton}
            >
              Cancel
            </button>
          )}
        </form>
      )}

      {isMobile && !showForm && (
        <button 
          style={styles.mobileCreateButton}
          onClick={() => setShowForm(true)}
        >
          + New Project
        </button>
      )}

      <div style={isMobile ? styles.mobileProjectList : styles.projectList}>
        {projects.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={styles.emptyText}>No projects yet</p>
            <p style={styles.emptyHint}>Create your first project to get started</p>
          </div>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              style={{
                ...(isMobile ? styles.mobileProjectItem : styles.projectItem),
                ...(selectedProject?.id === project.id ? 
                  (isMobile ? styles.mobileProjectItemActive : styles.projectItemActive) : 
                  {})
              }}
            >
              <div 
                style={styles.projectContent}
                onClick={() => onSelectProject(project)}
              >
                <div style={isMobile ? styles.mobileProjectName : styles.projectName}>
                  {!isMobile && <img src="/ProjectIcon.png" alt="" style={styles.projectIcon} />}
                  {project.name}
                </div>
                {project.description && (
                  <div style={isMobile ? styles.mobileProjectDesc : styles.projectDesc}>
                    {project.description}
                  </div>
                )}
              </div>
              <button
                style={isMobile ? styles.mobileDeleteButton : styles.deleteButton}
                onClick={(e) => handleDeleteProject(e, project)}
                title="Delete project"
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  // Desktop styles
  container: {
    width: '300px',
    backgroundColor: '#f8fafc',
    borderRight: '1px solid #e2e8f0',
    padding: '20px',
    overflowY: 'auto',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    margin: 0,
  },
  newButton: {
    padding: '6px 12px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
  },
  form: {
    marginBottom: '20px',
    padding: '16px',
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    width: '100%',
    padding: '8px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
  },
  textarea: {
    width: '100%',
    padding: '8px',
    marginBottom: '12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '14px',
    minHeight: '60px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  submitButton: {
    width: '100%',
    padding: '10px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
  },
  projectList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  projectItem: {
    padding: '12px',
    backgroundColor: 'white',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '8px',
  },
  projectItemActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  projectContent: {
    flex: 1,
    minWidth: 0,
  },
  projectName: {
    fontWeight: '600',
    marginBottom: '4px',
    fontSize: '20px',
    color: '#1e293b',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  projectIcon: {
    width: '31px',
    height: '31px',
    flexShrink: 0,
  },
  projectDesc: {
    fontSize: '12px',
    color: '#64748b',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '18px',
    padding: '4px',
    width: '28px',
    height: '28px',
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'all 0.2s',
  },
  deleteButton: {
    background: 'none',
    border: 'none',
    opacity: 0.5,
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 8px',
    transition: 'opacity 0.2s',
  },
  emptyState: {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#94a3b8',
  },
  emptyText: {
    fontSize: '14px',
    marginBottom: '8px',
  },
  emptyHint: {
    fontSize: '12px',
    color: '#94a3b8',
  },

  // Mobile styles
  mobileContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'white',
  },
  mobileHeader: {
    padding: '20px',
    borderBottom: '1px solid #e2e8f0',
    backgroundColor: '#f8fafc',
  },
  mobileTitle: {
    fontSize: '24px',
    fontWeight: '700',
    margin: 0,
    color: '#1e293b',
  },
  mobileCreateButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    margin: '16px',
  },
  mobileForm: {
    margin: '16px',
    padding: '20px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  mobileInput: {
    width: '100%',
    padding: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    boxSizing: 'border-box',
  },
  mobileTextarea: {
    width: '100%',
    padding: '14px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '16px',
    minHeight: '80px',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  mobileSubmitButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#10b981',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
  },
  mobileCancelButton: {
    width: '100%',
    padding: '14px',
    backgroundColor: '#e2e8f0',
    color: '#64748b',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '16px',
  },
  mobileProjectList: {
    flex: 1,
    overflowY: 'auto',
    padding: '8px 16px 16px',
  },
  mobileProjectItem: {
    padding: '16px',
    backgroundColor: '#f8fafc',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '12px',
    marginBottom: '8px',
  },
  mobileProjectItemActive: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  mobileProjectName: {
    fontWeight: '600',
    marginBottom: '4px',
    fontSize: '16px',
    color: '#1e293b',
  },
  mobileProjectDesc: {
    fontSize: '14px',
    color: '#64748b',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
  },
  mobileDeleteButton: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    opacity: 0.6,
    padding: '8px',
    flexShrink: 0,
  },
};
