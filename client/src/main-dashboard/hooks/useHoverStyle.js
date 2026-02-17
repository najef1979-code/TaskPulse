import { useCallback } from 'react';
import { colors } from '../fintech-tokens';

/**
 * Custom hook for handling hover styles
 * Eliminates repetitive onMouseEnter/onMouseLeave code
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.type - Type of hover effect ('card', 'button', 'menu', 'subtask', 'expandButton', 'darkModeToggle')
 * @param {boolean} options.isDark - Whether dark mode is active
 * @param {Function} options.onMouseEnter - Custom mouse enter handler
 * @param {Function} options.onMouseLeave - Custom mouse leave handler
 * @returns {Object} - Object with onMouseEnter and onMouseLeave handlers
 */
export function useHoverStyle({ type, isDark = false, onMouseEnter, onMouseLeave } = {}) {
  
  const handleMouseEnter = useCallback((e) => {
    // Call custom handler if provided
    if (onMouseEnter) {
      onMouseEnter(e);
      return;
    }

    // Default hover styles based on type
    switch (type) {
      case 'card':
        e.currentTarget.style.transform = 'translateY(-2px)';
        break;
      case 'button':
        e.currentTarget.style.transform = 'scale(1.1)';
        break;
      case 'menu':
        e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
        break;
      case 'subtask':
        e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
        break;
      case 'expandButton':
        e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[200];
        break;
      case 'darkModeToggle':
        e.currentTarget.style.transform = 'scale(1.1)';
        break;
      case 'exitButton':
        e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[300] : colors.grayLight[300];
        break;
      default:
        break;
    }
  }, [type, isDark, onMouseEnter]);

  const handleMouseLeave = useCallback((e) => {
    // Call custom handler if provided
    if (onMouseLeave) {
      onMouseLeave(e);
      return;
    }

    // Default leave styles based on type
    switch (type) {
      case 'card':
        e.currentTarget.style.transform = 'translateY(0)';
        break;
      case 'button':
        e.currentTarget.style.transform = 'scale(1)';
        break;
      case 'menu':
        e.currentTarget.style.backgroundColor = 'transparent';
        break;
      case 'subtask':
        e.currentTarget.style.backgroundColor = 'transparent';
        break;
      case 'expandButton':
        e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[100];
        break;
      case 'darkModeToggle':
        e.currentTarget.style.transform = 'scale(1)';
        break;
      case 'exitButton':
        e.currentTarget.style.backgroundColor = isDark ? colors.grayDark[200] : colors.grayLight[200];
        break;
      default:
        break;
    }
  }, [type, isDark, onMouseLeave]);

  return {
    onMouseEnter: handleMouseEnter,
    onMouseLeave: handleMouseLeave,
  };
}

export default useHoverStyle;