import React from 'react';
import { spacing, radius, colors, typography, transition } from '../fintech-tokens';

/**
 * SelectChips Component
 * Multi-select chip buttons with active states
 */
export function SelectChips({ 
  options = [], 
  selected = [], 
  onChange, 
  isDark = false,
  disabled = false,
  small = false 
}) {
  const handleChipClick = (value) => {
    if (disabled) return;
    
    const newSelected = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];
    
    onChange(newSelected);
  };

  const chipStyles = (isSelected) => ({
    base: {
      padding: small ? `${spacing.xs} ${spacing.xs}` : `${spacing.xs} ${spacing.md}`,
      borderRadius: radius.full,
      border: '1px solid',
      fontSize: small ? '11px' : typography.sm,
      fontWeight: typography.weights.medium,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${transition.fast}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      userSelect: 'none',
    },
    light: {
      default: {
        backgroundColor: '#FFFFFF',
        borderColor: colors.grayLight[300],
        color: colors.grayLight[700],
      },
      active: {
        backgroundColor: colors.primary[100],
        borderColor: colors.primary[300],
        color: colors.primary[700],
      },
      hover: {
        borderColor: colors.primary[400],
      },
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
    dark: {
      default: {
        backgroundColor: colors.grayDark[200],
        borderColor: colors.grayDark[500],
        color: colors.grayDark[400],
      },
      active: {
        backgroundColor: `${colors.primary[600]}20`,
        borderColor: colors.primary[500],
        color: colors.primary[300],
      },
      hover: {
        borderColor: colors.primary[400],
      },
      disabled: {
        opacity: 0.5,
        cursor: 'not-allowed',
      },
    },
  });

  const getChipStyle = (isSelected) => {
    const base = chipStyles(isSelected).base;
    const themeStyles = isDark ? chipStyles(isSelected).dark : chipStyles(isSelected).light;
    
    return {
      ...base,
      ...(isSelected ? themeStyles.active : themeStyles.default),
    };
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: spacing.sm,
    }}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);
        const style = getChipStyle(isSelected);
        
        return (
          <button
            key={option.value}
            style={style}
            onClick={() => handleChipClick(option.value)}
            disabled={disabled}
            onMouseEnter={(e) => {
              if (!disabled) {
                const themeStyles = isDark ? chipStyles(isSelected).dark : chipStyles(isSelected).light;
                e.currentTarget.style.borderColor = themeStyles.hover.borderColor;
              }
            }}
            onMouseLeave={(e) => {
              const themeStyles = isDark ? chipStyles(isSelected).dark : chipStyles(isSelected).light;
              e.currentTarget.style.borderColor = isSelected ? themeStyles.active.borderColor : themeStyles.default.borderColor;
            }}
          >
            {isSelected && <span style={{ fontSize: '12px' }}>✓</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * SingleSelectChips Component
 * Single-select chip buttons (radio-style)
 */
export function SingleSelectChips({ 
  options = [], 
  selected, 
  onChange, 
  isDark = false,
  disabled = false,
  small = false 
}) {
  const handleChipClick = (value) => {
    if (disabled) return;
    onChange(value);
  };

  const chipStyles = (isSelected) => ({
    base: {
      padding: small ? `${spacing.xs} ${spacing.xs}` : `${spacing.xs} ${spacing.md}`,
      borderRadius: radius.full,
      border: '1px solid',
      fontSize: small ? '11px' : typography.sm,
      fontWeight: typography.weights.medium,
      cursor: disabled ? 'not-allowed' : 'pointer',
      transition: `all ${transition.fast}`,
      display: 'inline-flex',
      alignItems: 'center',
      gap: spacing.xs,
      userSelect: 'none',
    },
    light: {
      default: {
        backgroundColor: '#FFFFFF',
        borderColor: colors.grayLight[300],
        color: colors.grayLight[700],
      },
      active: {
        backgroundColor: colors.primary[100],
        borderColor: colors.primary[300],
        color: colors.primary[700],
      },
      hover: {
        borderColor: colors.primary[400],
      },
    },
    dark: {
      default: {
        backgroundColor: colors.grayDark[200],
        borderColor: colors.grayDark[500],
        color: colors.grayDark[400],
      },
      active: {
        backgroundColor: `${colors.primary[600]}20`,
        borderColor: colors.primary[500],
        color: colors.primary[300],
      },
      hover: {
        borderColor: colors.primary[400],
      },
    },
  });

  const getChipStyle = (isSelected) => {
    const base = chipStyles(isSelected).base;
    const themeStyles = isDark ? chipStyles(isSelected).dark : chipStyles(isSelected).light;
    
    return {
      ...base,
      ...(isSelected ? themeStyles.active : themeStyles.default),
    };
  };

  return (
    <div style={{
      display: 'flex',
      flexWrap: 'wrap',
      gap: spacing.sm,
    }}>
      {options.map((option) => {
        const isSelected = selected === option.value;
        const style = getChipStyle(isSelected);
        
        return (
          <button
            key={option.value}
            style={style}
            onClick={() => handleChipClick(option.value)}
            disabled={disabled}
            onMouseEnter={(e) => {
              if (!disabled) {
                const themeStyles = isDark ? chipStyles(isSelected).dark : chipStyles(isSelected).light;
                e.currentTarget.style.borderColor = themeStyles.hover.borderColor;
              }
            }}
            onMouseLeave={(e) => {
              const themeStyles = isDark ? chipStyles(isSelected).dark : chipStyles(isSelected).light;
              e.currentTarget.style.borderColor = isSelected ? themeStyles.active.borderColor : themeStyles.default.borderColor;
            }}
          >
            {isSelected && <span style={{ fontSize: '12px' }}>✓</span>}
            <span>{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}