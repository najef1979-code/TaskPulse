import React from 'react';
import { spacing, colors, typography } from '../fintech-tokens';

/**
 * FilterSection Component
 * Section wrapper with uppercase title and divider
 */
export function FilterSection({ 
  title, 
  children, 
  isDark = false,
  showDivider = true 
}) {
  const containerStyles = {
    marginBottom: spacing.lg,
  };

  const headerStyles = {
    display: 'flex',
    alignItems: 'center',
    marginBottom: spacing.md,
  };

  const titleStyles = {
    fontSize: typography.xs,
    fontWeight: typography.weights.semibold,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    color: isDark ? colors.grayDark[600] : colors.grayLight[500],
  };

  const dividerStyles = {
    height: '1px',
    backgroundColor: isDark ? colors.grayDark[300] : colors.grayLight[200],
    marginTop: spacing.md,
  };

  return (
    <div style={containerStyles}>
      {title && (
        <div style={headerStyles}>
          <span style={titleStyles}>{title}</span>
        </div>
      )}
      <div>
        {children}
      </div>
      {showDivider && <div style={dividerStyles} />}
    </div>
  );
}