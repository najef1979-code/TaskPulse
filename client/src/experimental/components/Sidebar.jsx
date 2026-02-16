import React, { useState } from 'react';
import { layout, spacing, typography, getTheme, colors, transition, radius, breakpoints } from '../fintech-tokens';
import { Icon } from './Icon';
import { SingleSelectChips } from './SelectChips';
import { SelectChips } from './SelectChips';
import { DateRangeInput } from './DateRangeInput';
import { ToggleSwitch } from './ToggleSwitch';

/**
 * Sidebar Component
 * Collapsible left sidebar with filters only
 * Projects are displayed as Kanban columns in the main view
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
  const [filtersExpanded, setFiltersExpanded] = useState(true);

  const border = {
    width: '1px',
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

  const handleCollapsibleHeaderMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
  };

  const handleCollapsibleHeaderMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = 'transparent';
  };

  const toggleFilters = () => {
    setFiltersExpanded(!filtersExpanded);
  };

  return (
    <div style={sidebarStyles}>
      {!isCollapsed && (
        <div style={{
          padding: `${spacing.md} ${spacing.md} ${spacing.lg}`,
          borderBottom: `${border.width} solid ${theme.sidebar.border}`,
          overflowY: 'auto',
          flex: 1,
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

          {/* Search */}
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

          {/* Assignment Filter */}
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

          {/* Advanced Filters - Collapsible */}
          <div style={{ marginBottom: spacing.sm }}>
            <div
              style={collapsibleHeaderStyles}
              onClick={toggleFilters}
              onMouseEnter={handleCollapsibleHeaderMouseEnter}
              onMouseLeave={handleCollapsibleHeaderMouseLeave}
            >
              <span style={collapsibleTitleStyles}>Advanced Filters</span>
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
                {/* Status Filter */}
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

                {/* Priority Filter */}
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

                {/* Due Date Filter */}
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

                {/* Options */}
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

                {/* Reset Button */}
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

      {/* Collapse Toggle Button */}
      <div style={toggleButtonStyles} onClick={onToggle}>
        <Icon name="chevronDown" size={12} style={{ transform: isCollapsed ? 'rotate(90deg)' : 'rotate(270deg)' }} />
      </div>
    </div>
  );
}