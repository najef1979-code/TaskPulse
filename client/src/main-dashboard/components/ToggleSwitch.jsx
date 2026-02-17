import React from 'react';
import { colors, transition } from '../fintech-tokens';

/**
 * ToggleSwitch Component
 * On/off toggle with smooth animation
 */
export function ToggleSwitch({ 
  checked = false, 
  onChange, 
  isDark = false,
  disabled = false,
  label,
  small = false
}) {
  const handleToggle = () => {
    if (disabled) return;
    onChange(!checked);
  };

  const containerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: small ? '6px' : '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    userSelect: 'none',
  };

  const switchStyles = {
    width: small ? '32px' : '40px',
    height: small ? '16px' : '20px',
    borderRadius: small ? '16px' : '20px',
    backgroundColor: checked 
      ? colors.primary[500] 
      : isDark 
        ? colors.grayDark[400] 
        : colors.grayLight[300],
    position: 'relative',
    transition: `background-color ${transition.fast}`,
    opacity: disabled ? 0.5 : 1,
  };

  const thumbStyles = {
    width: small ? '12px' : '16px',
    height: small ? '12px' : '16px',
    borderRadius: '50%',
    backgroundColor: '#FFFFFF',
    position: 'absolute',
    top: small ? '2px' : '2px',
    left: checked ? (small ? '18px' : '22px') : (small ? '2px' : '2px'),
    transition: `left ${transition.fast}`,
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
  };

  const labelStyles = {
    fontSize: small ? '11px' : '14px',
    fontWeight: 500,
    color: isDark ? colors.grayDark[200] : colors.grayLight[700],
  };

  return (
    <div style={containerStyles} onClick={handleToggle}>
      <div style={switchStyles}>
        <div style={thumbStyles} />
      </div>
      {label && <span style={labelStyles}>{label}</span>}
    </div>
  );
}