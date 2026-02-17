import React from 'react';
import { radius, typography, transition, colors, getTheme } from '../fintech-tokens';
import { Icon } from './Icon';

/**
 * Button Component
 * Primary and secondary button variants with optional icon
 */
export function Button({ 
  variant = 'primary', 
  size = 'medium',
  children, 
  icon,
  iconPosition = 'left',
  onClick,
  disabled = false,
  className = '',
  isDark = false 
}) {
  const theme = getTheme(isDark);
  
  const getButtonStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isDark ? colors.primary[600] : colors.grayLight[900],
          color: '#FFFFFF',
          hoverBackgroundColor: isDark ? colors.primary[500] : colors.grayLight[800],
        };
      case 'secondary':
        return {
          backgroundColor: 'transparent',
          color: isDark ? theme.text.primary : colors.grayLight[700],
          border: `1px solid ${isDark ? colors.grayDark[300] : colors.grayLight[300]}`,
          hoverBackgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[100],
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: isDark ? theme.text.primary : colors.grayLight[600],
          hoverBackgroundColor: isDark ? colors.grayDark[200] : colors.grayLight[100],
        };
      default:
        return {
          backgroundColor: isDark ? colors.primary[600] : colors.grayLight[900],
          color: '#FFFFFF',
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          height: '36px',
          padding: icon && !children ? '0' : '0 16px',
          fontSize: typography.sm,
          gap: '6px',
        };
      case 'medium':
        return {
          height: '40px',
          padding: icon && !children ? '0' : '0 20px',
          fontSize: typography.base,
          gap: '8px',
        };
      case 'large':
        return {
          height: '48px',
          padding: icon && !children ? '0' : '0 24px',
          fontSize: typography.lg,
          gap: '10px',
        };
      default:
        return {
          height: '40px',
          padding: '0 20px',
          fontSize: typography.base,
        };
    }
  };

  const buttonStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.lg,
    border: variant === 'secondary' ? getButtonStyles().border : 'none',
    backgroundColor: getButtonStyles().backgroundColor,
    color: getButtonStyles().color,
    fontWeight: typography.weights.medium,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    transition: `background-color ${transition.normal}, transform ${transition.fast}, box-shadow ${transition.normal}`,
    ...getSizeStyles(),
    outline: 'none',
  };

  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };

  return (
    <button
      style={buttonStyles}
      onClick={handleClick}
      disabled={disabled}
      className={className}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = getButtonStyles().hoverBackgroundColor;
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.backgroundColor = getButtonStyles().backgroundColor;
        }
      }}
    >
      {icon && iconPosition === 'left' && (
        <Icon name={icon} size={size === 'large' ? 20 : 16} />
      )}
      {children && <span>{children}</span>}
      {icon && iconPosition === 'right' && (
        <Icon name={icon} size={size === 'large' ? 20 : 16} />
      )}
    </button>
  );
}