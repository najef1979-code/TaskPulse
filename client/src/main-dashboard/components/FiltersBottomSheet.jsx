import React from 'react';
import { spacing, radius, colors, typography, transition } from '../fintech-tokens';
import { Icon } from './Icon';
import { FilterSection } from './FilterSection';
import { SingleSelectChips } from './SelectChips';
import { SelectChips } from './SelectChips';
import { DateRangeInput } from './DateRangeInput';
import { ToggleSwitch } from './ToggleSwitch';

/**
 * FiltersBottomSheet Component
 * Mobile filter panel with sticky header and footer
 */
export function FiltersBottomSheet({ 
  isOpen, 
  onClose, 
  onApply, 
  onReset,
  filters,
  onFilterChange,
  isDark = false 
}) {
  const backdropStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    zIndex: 200,
    display: isOpen ? 'block' : 'none',
  };

  const panelStyles = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    height: '85vh',
    maxHeight: '92vh',
    backgroundColor: isDark ? colors.grayDark[50] : '#FFFFFF',
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    zIndex: 201,
    transform: isOpen ? 'translateY(0)' : 'translateY(100%)',
    transition: `transform ${transition.slow} ease-out`,
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles = {
    position: 'sticky',
    top: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${spacing.md} ${spacing.lg}`,
    borderBottom: `1px solid ${isDark ? colors.grayDark[300] : colors.grayLight[200]}`,
    backgroundColor: isDark ? colors.grayDark[50] : '#FFFFFF',
    zIndex: 10,
  };

  const titleStyles = {
    fontSize: typography.base,
    fontWeight: typography.weights.semibold,
    color: isDark ? colors.grayDark[200] : colors.grayLight[900],
  };

  const closeButtonStyles = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    border: 'none',
    backgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[100],
    color: isDark ? colors.grayDark[200] : colors.grayLight[600],
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: `background-color ${transition.fast}`,
  };

  const contentStyles = {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.lg} ${spacing.lg} ${spacing.xl}`,
  };

  const footerStyles = {
    position: 'sticky',
    bottom: 0,
    display: 'flex',
    gap: spacing.md,
    padding: `${spacing.md} ${spacing.lg} ${spacing.xl}`,
    borderTop: `1px solid ${isDark ? colors.grayDark[300] : colors.grayLight[200]}`,
    backgroundColor: isDark ? colors.grayDark[50] : '#FFFFFF',
    zIndex: 10,
  };

  const resetButtonStyles = {
    flex: 1,
    padding: `${spacing.sm} ${spacing.md}`,
    border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
    borderRadius: radius.md,
    backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
    color: isDark ? colors.grayDark[300] : colors.grayLight[600],
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: `all ${transition.fast}`,
  };

  const applyButtonStyles = {
    flex: 1,
    padding: `${spacing.sm} ${spacing.md}`,
    border: 'none',
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
    color: '#FFFFFF',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: `all ${transition.fast}`,
    boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
  };

  const searchInputStyles = {
    width: '100%',
    padding: `${spacing.sm} ${spacing.md} ${spacing.sm} ${spacing['2xl']}`,
    borderRadius: radius.md,
    border: `1px solid ${isDark ? colors.grayDark[500] : colors.grayLight[300]}`,
    fontSize: typography.sm,
    fontFamily: typography.family,
    backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
    color: isDark ? colors.grayDark[400] : colors.grayLight[700],
    outline: 'none',
    transition: `all ${transition.fast}`,
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleCloseMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[200];
  };

  const handleCloseMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
  };

  const handleResetMouseEnter = (e) => {
    e.currentTarget.style.borderColor = colors.grayLight[400];
  };

  const handleResetMouseLeave = (e) => {
    e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
  };

  const handleApplyMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = colors.primary[500];
  };

  const handleApplyMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = colors.primary[600];
  };

  const assignmentOptions = [
    { value: 'all', label: 'All Tasks' },
    { value: 'assigned', label: 'Only to Me' },
    { value: 'unassigned', label: 'Not Assigned' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'To Do' },
    { value: 'in-progress', label: 'In Progress' },
    { value: 'done', label: 'Done' },
  ];

  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
  ];

  // Early return if not open - must be before any rendering
  if (!isOpen) return null;

  return (
    <>
      <div 
        style={backdropStyles} 
        onClick={handleBackdropClick}
      />
      <div style={panelStyles}>
        {/* Header */}
        <div style={headerStyles}>
          <span style={titleStyles}>Filters</span>
          <button
            style={closeButtonStyles}
            onClick={onClose}
            onMouseEnter={handleCloseMouseEnter}
            onMouseLeave={handleCloseMouseLeave}
          >
            <Icon name="x" size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={contentStyles}>
          {/* Search */}
          <FilterSection title="Search" isDark={isDark} showDivider={true}>
            <div style={{ position: 'relative' }}>
              <Icon
                name="search"
                size={14}
                style={{
                  position: 'absolute',
                  left: spacing.sm,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: isDark ? colors.grayDark[600] : colors.grayLight[500],
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={filters.search}
                onChange={(e) => onFilterChange({ ...filters, search: e.target.value })}
                style={searchInputStyles}
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
          </FilterSection>

          {/* Assignment Filter */}
          <FilterSection title="Assignment" isDark={isDark}>
            <SingleSelectChips
              options={assignmentOptions}
              selected={filters.assignment}
              onChange={(value) => onFilterChange({ ...filters, assignment: value })}
              isDark={isDark}
            />
          </FilterSection>

          {/* Secondary Filters - Always Visible */}
          <FilterSection title="Status" isDark={isDark}>
            <SelectChips
              options={statusOptions}
              selected={filters.status}
              onChange={(value) => onFilterChange({ ...filters, status: value })}
              isDark={isDark}
            />
          </FilterSection>

          <FilterSection title="Priority" isDark={isDark}>
            <SelectChips
              options={priorityOptions}
              selected={filters.priority}
              onChange={(value) => onFilterChange({ ...filters, priority: value })}
              isDark={isDark}
            />
          </FilterSection>

          <FilterSection title="Due Date" isDark={isDark}>
            <DateRangeInput
              startDate={filters.dueDate.start}
              endDate={filters.dueDate.end}
              onChange={({ startDate, endDate }) => 
                onFilterChange({ 
                  ...filters, 
                  dueDate: { start: startDate, end: endDate } 
                })
              }
              isDark={isDark}
            />
          </FilterSection>

          <FilterSection title="Options" isDark={isDark} showDivider={false}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
              <ToggleSwitch
                checked={filters.showOverdue}
                onChange={(checked) => onFilterChange({ ...filters, showOverdue: checked })}
                isDark={isDark}
                label="Show overdue only"
              />
              <ToggleSwitch
                checked={filters.hasSubtasks}
                onChange={(checked) => onFilterChange({ ...filters, hasSubtasks: checked })}
                isDark={isDark}
                label="Has subtasks only"
              />
            </div>
          </FilterSection>
        </div>

        {/* Footer */}
        <div style={footerStyles}>
          <button
            style={resetButtonStyles}
            onClick={onReset}
            onMouseEnter={handleResetMouseEnter}
            onMouseLeave={handleResetMouseLeave}
          >
            Reset
          </button>
          <button
            style={applyButtonStyles}
            onClick={onApply}
            onMouseEnter={handleApplyMouseEnter}
            onMouseLeave={handleApplyMouseLeave}
          >
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}