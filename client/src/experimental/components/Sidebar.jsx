import React, { useState, useEffect } from 'react';
import { layout, spacing, typography, getTheme, colors, transition, radius, breakpoints } from '../fintech-tokens';
import { Icon } from './Icon';
import { SingleSelectChips } from './SelectChips';
import { SelectChips } from './SelectChips';
import { DateRangeInput } from './DateRangeInput';
import { ToggleSwitch } from './ToggleSwitch';

/**
 * Sidebar Component
 * Collapsible left sidebar with project navigation and filters
 */
export function Sidebar({ 
  isDark = false, 
  isCollapsed = false, 
  onToggle, 
  viewportWidth,
  filters,
  onFilterChange,
  user 
}) {
  const theme = getTheme(isDark);
  const [expandedProjects, setExpandedProjects] = useState({});
  const [filtersExpanded, setFiltersExpanded] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [editProjectForm, setEditProjectForm] = useState({ name: '', description: '' });
  const [showProjectMenu, setShowProjectMenu] = useState(null);

  const shadow = {
    cardLight: '0 2px 8px rgba(0, 0, 0, 0.05)',
    cardHoverLight: '0 6px 20px rgba(0, 0, 0, 0.08)',
    cardDark: '0 2px 8px rgba(0, 0, 0, 0.4)',
    cardHoverDark: '0 6px 20px rgba(0, 0, 0, 0.6)',
  };

  const border = {
    width: '1px',
  };

  const projects = [
    {
      id: 1,
      title: 'Create New Website',
      description: 'Website redesign project',
      items: [
        { id: 'today', label: 'Today', icon: 'today' },
        { id: 'calendar', label: 'Calendar', icon: 'calendar' },
        { id: 'timeline', label: 'Timeline', icon: 'timeline' },
        { id: 'gantt', label: 'Gantt', icon: 'gantt' },
        { id: 'table', label: 'Table', icon: 'table' },
      ],
    },
    {
      id: 2,
      title: 'Design New App',
      description: 'Mobile app design',
      items: [
        { id: 'today2', label: 'Today', icon: 'today' },
        { id: 'calendar2', label: 'Calendar', icon: 'calendar' },
        { id: 'gantt2', label: 'Gantt', icon: 'gantt' },
      ],
    },
    {
      id: 3,
      title: 'Build a System',
      description: 'System architecture',
      items: [
        { id: 'today3', label: 'Today', icon: 'today' },
        { id: 'calendar3', label: 'Calendar', icon: 'calendar' },
        { id: 'timeline3', label: 'Timeline', icon: 'timeline' },
        { id: 'gantt3', label: 'Gantt', icon: 'gantt' },
      ],
    },
  ];

  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({
      ...prev,
      [projectId]: !prev[projectId],
    }));
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  const handleEditProject = (project) => {
    setEditingProject(project);
    setEditProjectForm({ name: project.title, description: project.description || '' });
    setShowProjectMenu(null);
  };

  const handleSaveProject = () => {
    console.log('Saving project:', editingProject.id, editProjectForm);
    setEditingProject(null);
    setEditProjectForm({ name: '', description: '' });
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditProjectForm({ name: '', description: '' });
  };

  const handleProjectMenuClick = (e, projectId) => {
    e.stopPropagation();
    setShowProjectMenu(showProjectMenu === projectId ? null : projectId);
  };

  const sidebarStyles = {
    position: 'fixed',
    left: 0,
    top: layout.header.height,
    bottom: 0,
    width: isCollapsed ? layout.sidebar.collapsed : layout.sidebar.expanded,
    backgroundColor: theme.sidebar.bg,
    borderRight: `${border.width} solid ${theme.sidebar.border}`,
    transition: `width ${transition.normal}`,
    zIndex: 30,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    ...(viewportWidth < breakpoints.md ? { display: 'none' } : {}),
  };

  const contentStyles = {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.lg} ${spacing.md}`,
  };

  const projectSectionStyles = {
    marginBottom: spacing.lg,
  };

  const projectHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: isCollapsed ? 'center' : 'space-between',
    padding: spacing.sm,
    cursor: 'pointer',
    borderRadius: radius.sm,
    transition: `background-color ${transition.fast}`,
  };

  const projectTitleStyles = {
    fontSize: typography.sm,
    fontWeight: typography.weights.semibold,
    color: isDark ? theme.text.primary : colors.grayLight[600],
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const itemStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: `${spacing.sm} ${spacing.md}`,
    borderRadius: radius.sm,
    cursor: 'pointer',
    transition: `background-color ${transition.fast}`,
    fontSize: typography.sm,
    fontWeight: typography.weights.medium,
    color: isDark ? theme.text.secondary : colors.grayLight[600],
  };

  const activeItemStyles = {
    backgroundColor: colors.primary[100],
    color: colors.primary[700],
  };

  const toggleButtonStyles = {
    position: 'absolute',
    right: '4px',
    top: '8px',
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    backgroundColor: theme.sidebar.bg,
    border: `${border.width} solid ${theme.sidebar.border}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: isDark ? theme.text.primary : colors.grayLight[600],
    transition: `transform ${transition.fast}`,
    zIndex: 60,
  };

  const collapsibleHeaderStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.xs} ${spacing.xs}`,
    cursor: 'pointer',
    borderRadius: radius.sm,
    transition: `background-color ${transition.fast}`,
    marginBottom: spacing.xs,
  };

  const collapsibleTitleStyles = {
    fontSize: typography.xs,
    fontWeight: typography.weights.semibold,
    color: isDark ? colors.grayDark[600] : colors.grayLight[500],
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const filterContentStyles = {
    paddingLeft: spacing.xs,
    paddingRight: spacing.xs,
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

  const projectMenuStyles = {
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

  const handleItemClick = (itemId) => {
    console.log('Navigation item clicked:', itemId);
  };

  const handleMouseEnter = (e, itemId) => {
    if (itemId !== 'today') {
      e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
    }
  };

  const handleMouseLeave = (e, itemId) => {
    if (itemId !== 'today') {
      e.currentTarget.style.backgroundColor = 'transparent';
    }
  };

  const handleProjectHeaderMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
  };

  const handleProjectHeaderMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const handleCollapsibleHeaderMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
  };

  const handleCollapsibleHeaderMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  // Close project menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showProjectMenu !== null) {
        setShowProjectMenu(null);
      }
    };

    if (showProjectMenu !== null) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showProjectMenu]);

  return (
    <>
      {/* Edit Project Modal */}
      <div style={modalBackdropStyles} onClick={handleCancelEdit}>
        <div style={modalStyles} onClick={(e) => e.stopPropagation()}>
          <h2 style={modalTitleStyles}>Edit Project</h2>
          
          <label style={formLabelStyles}>Project Name</label>
          <input
            type="text"
            value={editProjectForm.name}
            onChange={(e) => setEditProjectForm({ ...editProjectForm, name: e.target.value })}
            style={inputStyles}
            placeholder="Enter project name"
            autoFocus
          />
          
          <label style={formLabelStyles}>Description</label>
          <textarea
            value={editProjectForm.description}
            onChange={(e) => setEditProjectForm({ ...editProjectForm, description: e.target.value })}
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
              onClick={handleSaveProject}
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

      <div style={sidebarStyles}>
        {!isCollapsed && (
          <div style={{
            padding: `${spacing.md} ${spacing.md} ${spacing.lg}`,
            borderBottom: `${border.width} solid ${theme.sidebar.border}`,
          }}>
            <div style={{
              fontSize: typography.sm,
              fontWeight: typography.weights.semibold,
              color: isDark ? theme.text.primary : colors.grayLight[600],
              marginBottom: spacing.md,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Dashboard Filters
            </div>

            <div style={{ marginBottom: spacing.md }}>
              <div style={{ position: 'relative' }}>
                <Icon
                  name="search"
                  size={12}
                  style={{
                    position: 'absolute',
                    left: spacing.xs,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: isDark ? colors.grayDark[600] : colors.grayLight[500],
                    pointerEvents: 'none',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={filters?.search || ''}
                  onChange={(e) => onFilterChange?.({ ...filters, search: e.target.value })}
                  style={{
                    width: '100%',
                    padding: `${spacing.xs} ${spacing.xs} ${spacing.xs} ${spacing.lg}`,
                    borderRadius: radius.sm,
                    border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
                    fontSize: '12px',
                    fontFamily: typography.family,
                    backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
                    color: isDark ? colors.grayDark[400] : colors.grayLight[700],
                    outline: 'none',
                    transition: `all ${transition.fast}`,
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = colors.primary[500];
                    e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary[500]}40`;
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>

            <div style={{ marginBottom: spacing.sm }}>
              <SingleSelectChips
                options={[
                  { value: 'all', label: 'All Tasks' },
                  { value: 'assigned', label: 'Only to Me' },
                  { value: 'unassigned', label: 'Not Assigned' },
                ]}
                selected={filters?.assignment || 'all'}
                onChange={(value) => onFilterChange?.({ ...filters, assignment: value })}
                isDark={isDark}
                small={true}
              />
            </div>

            {/* All Filters - Collapsible */}
            <div style={{ marginBottom: spacing.sm }}>
              <div
                style={collapsibleHeaderStyles}
                onClick={toggleFilters}
                onMouseEnter={handleCollapsibleHeaderMouseEnter}
                onMouseLeave={handleCollapsibleHeaderMouseLeave}
              >
                <span style={collapsibleTitleStyles}>Filters</span>
                <Icon
                  name="chevronDown"
                  size={12}
                  style={{
                    transform: filtersExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                    transition: `transform ${transition.fast}`,
                  }}
                />
              </div>
              {filtersExpanded && (
                <div style={filterContentStyles}>
                  <div style={{ marginBottom: spacing.sm }}>
                    <div style={{
                      fontSize: typography.xs,
                      fontWeight: typography.weights.semibold,
                      color: isDark ? colors.grayDark[600] : colors.grayLight[500],
                      marginBottom: spacing.xs,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Status
                    </div>
                    <SelectChips
                      options={[
                        { value: 'pending', label: 'To Do' },
                        { value: 'in-progress', label: 'In Progress' },
                        { value: 'done', label: 'Done' },
                      ]}
                      selected={filters?.status || []}
                      onChange={(value) => onFilterChange?.({ ...filters, status: value })}
                      isDark={isDark}
                      small={true}
                    />
                  </div>

                  <div style={{ marginBottom: spacing.sm }}>
                    <div style={{
                      fontSize: typography.xs,
                      fontWeight: typography.weights.semibold,
                      color: isDark ? colors.grayDark[600] : colors.grayLight[500],
                      marginBottom: spacing.xs,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Priority
                    </div>
                    <SelectChips
                      options={[
                        { value: 'high', label: 'High' },
                        { value: 'medium', label: 'Medium' },
                        { value: 'low', label: 'Low' },
                      ]}
                      selected={filters?.priority || []}
                      onChange={(value) => onFilterChange?.({ ...filters, priority: value })}
                      isDark={isDark}
                      small={true}
                    />
                  </div>

                  <div style={{ marginBottom: spacing.sm }}>
                    <div style={{
                      fontSize: typography.xs,
                      fontWeight: typography.weights.semibold,
                      color: isDark ? colors.grayDark[600] : colors.grayLight[500],
                      marginBottom: spacing.xs,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Due Date
                    </div>
                    <DateRangeInput
                      startDate={filters?.dueDate?.start}
                      endDate={filters?.dueDate?.end}
                      onChange={({ startDate, endDate }) => 
                        onFilterChange?.({ 
                          ...filters, 
                          dueDate: { start: startDate, end: endDate } 
                        })
                      }
                      isDark={isDark}
                      compact={true}
                    />
                  </div>

                  <div style={{ marginBottom: spacing.sm }}>
                    <div style={{
                      fontSize: typography.xs,
                      fontWeight: typography.weights.semibold,
                      color: isDark ? colors.grayDark[600] : colors.grayLight[500],
                      marginBottom: spacing.xs,
                      textTransform: 'uppercase',
                      letterSpacing: '0.05em',
                    }}>
                      Options
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.xs }}>
                      <ToggleSwitch
                        checked={filters?.showOverdue || false}
                        onChange={(checked) => onFilterChange?.({ ...filters, showOverdue: checked })}
                        isDark={isDark}
                        label="Show overdue only"
                        small={true}
                      />
                      <ToggleSwitch
                        checked={filters?.hasSubtasks || false}
                        onChange={(checked) => onFilterChange?.({ ...filters, hasSubtasks: checked })}
                        isDark={isDark}
                        label="Has subtasks only"
                        small={true}
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onFilterChange?.({
                        assignment: 'all',
                        status: [],
                        priority: [],
                        dueDate: { start: '', end: '' },
                        showOverdue: false,
                        hasSubtasks: false,
                        search: '',
                      });
                    }}
                    style={{
                      width: '100%',
                      marginTop: spacing.sm,
                      padding: `${spacing.xs} ${spacing.sm}`,
                      border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
                      borderRadius: radius.sm,
                      backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
                      color: isDark ? colors.grayDark[300] : colors.grayLight[600],
                      fontSize: '12px',
                      fontWeight: 500,
                      cursor: 'pointer',
                      transition: `all ${transition.fast}`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = colors.grayLight[400];
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
                    }}
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <div style={contentStyles}>
          {projects.map((project) => (
            <div key={project.id} style={projectSectionStyles}>
              <div style={{ position: 'relative', marginBottom: spacing.sm }}>
                <div
                  style={projectHeaderStyles}
                  onClick={() => !isCollapsed && toggleProject(project.id)}
                  onMouseEnter={handleProjectHeaderMouseEnter}
                  onMouseLeave={handleProjectHeaderMouseLeave}
                >
                  {!isCollapsed && (
                    <span style={projectTitleStyles}>{project.title}</span>
                  )}
                  {!isCollapsed && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: spacing.md }}>
                      <button
                        onClick={(e) => handleProjectMenuClick(e, project.id)}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '4px',
                          border: 'none',
                          backgroundColor: 'transparent',
                          color: isDark ? colors.grayDark[600] : colors.grayLight[500],
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          padding: 0,
                          transition: `background-color ${transition.fast}`,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        <Icon name="moreVertical" size={16} />
                      </button>
                      <Icon
                        name="chevronDown"
                        size={14}
                        style={{
                          transform: expandedProjects[project.id] ? 'rotate(180deg)' : 'rotate(0deg)',
                          transition: `transform ${transition.fast}`,
                        }}
                      />
                    </div>
                  )}
                </div>
                
                {showProjectMenu === project.id && (
                  <div style={projectMenuStyles}>
                    <div
                      style={menuItemStyles}
                      onClick={() => handleEditProject(project)}
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
                  </div>
                )}
              </div>

              <div style={{
                marginTop: spacing.sm,
                display: expandedProjects[project.id] && !isCollapsed ? 'block' : 'none',
              }}>
                {project.items.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      ...itemStyles,
                      ...(item.id === 'today' ? activeItemStyles : {}),
                    }}
                    onClick={() => handleItemClick(item.id)}
                    onMouseEnter={(e) => handleMouseEnter(e, item.id)}
                    onMouseLeave={(e) => handleMouseLeave(e, item.id)}
                  >
                    <Icon name={item.icon} size={16} />
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={toggleButtonStyles} onClick={onToggle}>
          <Icon name="chevronDown" size={12} style={{ transform: isCollapsed ? 'rotate(90deg)' : 'rotate(270deg)' }} />
        </div>
      </div>
    </>
  );
}
