import React from 'react';
import { layout, spacing, typography, getTheme, colors, transition, radius } from '../fintech-tokens';
import { Icon } from './Icon';
import { Button } from './Button';

/**
 * Header Component
 * Top header with TaskPulse branding, project info and action buttons
 */
export function Header({ 
  projectName = 'All Projects', 
  isDark = false, 
  onNewTask,
  isMobile = false,
  onFilterClick 
}) {
  const theme = getTheme(isDark);

  const headerStyles = {
    height: isMobile ? '64px' : '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: isMobile ? `0 ${spacing.md}` : `0 ${spacing.xl}`,
    backgroundColor: isDark ? '#1e293b' : '#f8fafc',
    borderBottom: isDark ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  };

  const leftSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? spacing.sm : spacing.md,
    flex: 1,
    minWidth: 0,
  };

  const logoStyles = {
    height: isMobile ? '36px' : '42px',
    width: 'auto',
    flexShrink: 0,
  };

  const logoTxtStyles = {
    height: isMobile ? '34px' : '40px',
    width: 'auto',
    flexShrink: 0,
  };

  const titleStyles = {
    fontSize: isMobile ? typography.lg : typography.xl,
    fontWeight: typography.weights.semibold,
    color: isDark ? '#ffffff' : '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  };

  const rightSectionStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    flexShrink: 0,
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
    color: isDark ? '#94a3b8' : '#64748b',
    transition: `background-color ${transition.fast}, color ${transition.fast}`,
  };

  return (
    <div style={headerStyles}>
      {/* Left Section - Logos only */}
      <div style={leftSectionStyles}>
        <img 
          src="/logo.png" 
          alt="TaskPulse" 
          style={logoStyles}
        />
        <img 
          src="/logotxt.png" 
          alt="TaskPulse" 
          style={logoTxtStyles}
        />
      </div>

      {/* Right Section - Action Buttons */}
      <div style={rightSectionStyles}>
        {/* Notification Bell */}
        <button
          style={iconButtonStyles}
          onClick={() => console.log('Notifications clicked')}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            e.currentTarget.style.color = isDark ? '#ffffff' : '#1e293b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b';
          }}
          aria-label="Notifications"
        >
          <Icon name="bell" size={20} />
        </button>

        {/* Filter Button */}
        <button
          style={iconButtonStyles}
          onClick={onFilterClick}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)';
            e.currentTarget.style.color = isDark ? '#ffffff' : '#1e293b';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = isDark ? '#94a3b8' : '#64748b';
          }}
          aria-label="Filters"
        >
          <Icon name="filter" size={20} />
        </button>
      </div>
    </div>
  );
}
