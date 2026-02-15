import React from 'react';
import { spacing, radius, colors, transition } from '../fintech-tokens';
import { Icon } from './Icon';

/**
 * MobileFilterBar Component
 * Bottom navigation bar with filter button (mobile only)
 * Uses isMobileDevice prop for conditional rendering (from parent's useIsMobile hook)
 */
export function MobileFilterBar({ 
  onFilterClick, 
  activeFilterCount = 0,
  isDark = false,
  isMobileDevice = false
}) {
  // Don't render on desktop/tablet
  if (!isMobileDevice) return null;

  const barStyles = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${spacing.md} ${spacing.lg}`,
    backgroundColor: isDark ? colors.grayDark[100] : '#FFFFFF',
    borderTop: `1px solid ${isDark ? colors.grayDark[200] : colors.grayLight[200]}`,
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  };

  const filterButtonStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
    padding: `${spacing.sm} ${spacing.lg}`,
    backgroundColor: colors.primary[600],
    color: '#FFFFFF',
    border: 'none',
    borderRadius: radius.md,
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    transition: `all ${transition.fast}`,
    boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)',
  };

  const badgeStyles = {
    display: activeFilterCount > 0 ? 'flex' : 'none',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: colors.semantic.urgent,
    color: '#FFFFFF',
    fontSize: '11px',
    fontWeight: 700,
    position: 'absolute',
    top: '-4px',
    right: '-4px',
  };

  const buttonContainerStyles = {
    position: 'relative',
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.backgroundColor = colors.primary[500];
    e.currentTarget.style.transform = 'translateY(-2px)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.backgroundColor = colors.primary[600];
    e.currentTarget.style.transform = 'translateY(0)';
  };

  const handleButtonClick = () => {
    onFilterClick();
  };

  return (
    <div style={barStyles}>
      <div style={buttonContainerStyles}>
        <button
          style={filterButtonStyles}
          onClick={handleButtonClick}
        >
          <Icon name="filter" size={18} color="#FFFFFF" />
          <span style={{ color: '#FFFFFF' }}>Filters</span>
          {activeFilterCount > 0 && (
            <span style={badgeStyles}>{activeFilterCount}</span>
          )}
        </button>
      </div>
    </div>
  );
}
