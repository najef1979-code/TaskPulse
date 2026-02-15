import React from 'react';
import { layout, spacing, typography, getTheme, colors, transition, radius } from '../fintech-tokens';
import { Icon } from './Icon';
import { Button } from './Button';

/**
 * Header Component
 * Top header with project info and action buttons
 */
export function Header({ 
  projectName = 'All Projects', 
  isDark = false, 
  onNewTask,
  isMobile = false,
  onFilterClick 
}) {
  const theme = getTheme(isDark);

  const border = {
    width: '1px',
  };

  const headerStyles = {
    height: layout.header.height,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `0 ${spacing.xl}`,
    backgroundColor: theme.header.bg,
  };

  const leftSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  };

  const titleStyles = {
    fontSize: typography.xl,
    fontWeight: typography.weights.semibold,
    color: theme.header.textPrimary,
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  };

  const iconButtonStyles = {
    width: '40px',
    height: '40px',
    borderRadius: radius.md,
    backgroundColor: 'transparent',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: isDark ? theme.text.secondary : colors.grayLight[600],
    transition: `background-color ${transition.fast}`,
  };

  return (
    <div style={headerStyles}>
      {/* Left Section */}
      <div style={leftSectionStyles}>
        <div style={titleStyles}>{projectName}</div>
      </div>

      {/* Right Section */}
      <div style={rightSectionStyles}>
        {/* Notification Bell */}
        <button
          style={iconButtonStyles}
          onClick={() => console.log('Notifications clicked')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icon name="bell" size={18} />
        </button>

        {/* Filter Button */}
        <button
          style={iconButtonStyles}
          onClick={onFilterClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          <Icon name="filter" size={18} />
        </button>
      </div>
    </div>
  );
}