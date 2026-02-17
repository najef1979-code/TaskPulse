import React from 'react';
import { spacing, radius, colors, typography, transition } from '../fintech-tokens';
import { Icon } from './Icon';

/**
 * DateRangeInput Component
 * Start and end date pickers with calendar icons
 */
export function DateRangeInput({ 
  startDate, 
  endDate, 
  onChange, 
  isDark = false,
  disabled = false,
  compact = false 
}) {
  const handleStartDateChange = (e) => {
    onChange({ startDate: e.target.value, endDate });
  };

  const handleEndDateChange = (e) => {
    onChange({ startDate, endDate: e.target.value });
  };

  const containerStyles = {
    display: 'grid',
    gridTemplateColumns: compact ? '1fr' : '1fr 1fr',
    gap: compact ? spacing.sm : spacing.md,
  };

  const inputWrapperStyles = {
    position: 'relative',
  };

  const inputStyles = {
    width: '100%',
    padding: compact 
      ? `${spacing.xs} ${spacing.sm} ${spacing.xs} ${spacing.md}`
      : `${spacing.sm} ${spacing.md} ${spacing.sm} ${spacing['2xl']}`,
    borderRadius: compact ? radius.sm : radius.md,
    border: '1px solid',
    fontSize: compact ? '13px' : typography.sm,
    fontFamily: typography.family,
    transition: `all ${transition.fast}`,
    color: isDark ? colors.grayDark[200] : colors.grayLight[700],
    backgroundColor: isDark ? colors.grayDark[200] : '#FFFFFF',
    borderColor: isDark ? colors.grayDark[500] : colors.grayLight[300],
    outline: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.5 : 1,
  };

  const iconStyles = {
    position: 'absolute',
    left: spacing.sm,
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
    color: isDark ? colors.grayDark[600] : colors.grayLight[500],
  };

  const labelStyles = {
    display: 'block',
    fontSize: compact ? '11px' : typography.xs,
    fontWeight: typography.weights.medium,
    color: isDark ? colors.grayDark[600] : colors.grayLight[600],
    marginBottom: spacing.xs,
  };

  return (
    <div style={containerStyles}>
      <div>
        <label style={labelStyles}>Start Date</label>
        <div style={inputWrapperStyles}>
          <Icon name="calendar" size={compact ? 12 : 14} style={iconStyles} />
          <input
            type="date"
            value={startDate || ''}
            onChange={handleStartDateChange}
            disabled={disabled}
            style={inputStyles}
            onFocus={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = colors.primary[500];
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary[500]}40`;
              }
            }}
            onBlur={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
        </div>
      </div>

      <div>
        <label style={labelStyles}>End Date</label>
        <div style={inputWrapperStyles}>
          <Icon name="calendar" size={compact ? 12 : 14} style={iconStyles} />
          <input
            type="date"
            value={endDate || ''}
            onChange={handleEndDateChange}
            disabled={disabled}
            style={inputStyles}
            min={startDate || undefined}
            onFocus={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = colors.primary[500];
                e.currentTarget.style.boxShadow = `0 0 0 2px ${colors.primary[500]}40`;
              }
            }}
            onBlur={(e) => {
              if (!disabled) {
                e.currentTarget.style.borderColor = isDark ? colors.grayDark[500] : colors.grayLight[300];
                e.currentTarget.style.boxShadow = 'none';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}