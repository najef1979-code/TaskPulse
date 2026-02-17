import React from 'react';
import { colors, typography, radius } from '../fintech-tokens';

/**
 * Badge Component
 * Fully rounded badge with semantic status colors
 */
export function Badge({ variant = 'default', children, className = '' }) {
  const getBadgeStyles = () => {
    switch (variant) {
      case 'progress':
        return {
          backgroundColor: colors.semantic.progress.bg,
          color: colors.semantic.progress.text,
        };
      case 'review':
        return {
          backgroundColor: colors.semantic.review.bg,
          color: colors.semantic.review.text,
        };
      case 'todo':
        return {
          backgroundColor: colors.semantic.todo.bg,
          color: colors.semantic.todo.text,
        };
      case 'done':
        return {
          backgroundColor: colors.semantic.done.bg,
          color: colors.semantic.done.text,
        };
      case 'urgent':
        return {
          backgroundColor: 'rgba(245, 158, 11, 0.1)',
          color: colors.semantic.urgent,
        };
      default:
        return {
          backgroundColor: colors.primary[100],
          color: colors.primary[700],
        };
    }
  };

  const styles = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 12px',
    borderRadius: radius.full,
    fontSize: typography.xs,
    fontWeight: typography.weights.medium,
    ...getBadgeStyles(),
  };

  return <span style={styles} className={className}>{children}</span>;
}